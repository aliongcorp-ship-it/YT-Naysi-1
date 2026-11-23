// ---------------------------------------------------------------------------
// Forced-alignment lite: snaps every caption word to the narrator's actual
// voice. Reads the processed VO takes, builds an energy envelope, cuts the
// speech into runs at the breaths, then distributes the words over the runs
// by syllable weight and snaps each boundary to the nearest energy dip.
// Output: src/captions.json  { sceneId: [{ w, hi, st, en }] }
// ---------------------------------------------------------------------------
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import timeline from "../src/timeline.json" with { type: "json" };
import subtitles from "../src/subtitles.json" with { type: "json" };

const FFMPEG = ffmpegPath.path;
const SR = 48000;
const HOP = 480; // 10 ms

const readWavMono = (file) => {
  const b = fs.readFileSync(file);
  let off = 12;
  let data = null;
  while (off < b.length - 8) {
    const id = b.toString("ascii", off, off + 4);
    const size = b.readUInt32LE(off + 4);
    if (id === "data") {
      data = b.subarray(off + 8, off + 8 + size);
      break;
    }
    off += 8 + size + (size % 2);
  }
  const out = new Float32Array(data.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = data.readInt16LE(i * 2) / 32768;
  return out;
};

const ensureVo = (vo) => {
  const out = path.resolve("build/vo", `${vo}.wav`);
  if (fs.existsSync(out)) return out;
  fs.mkdirSync("build/vo", { recursive: true });
  execFileSync(FFMPEG, [
    "-y", "-v", "error", "-i", `public/vo/${vo}.mp3`,
    "-af", "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse,atempo=1.10",
    "-ar", String(SR), "-ac", "1", out,
  ]);
  return out;
};

const envelope = (pcm) => {
  const n = Math.floor(pcm.length / HOP);
  const e = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < HOP; j++) {
      const v = pcm[i * HOP + j];
      s += v * v;
    }
    e[i] = Math.sqrt(s / HOP);
  }
  return e;
};

const smooth = (e, r = 2) => {
  const o = new Float32Array(e.length);
  for (let i = 0; i < e.length; i++) {
    let s = 0, c = 0;
    for (let j = -r; j <= r; j++) {
      const k = i + j;
      if (k >= 0 && k < e.length) { s += e[k]; c++; }
    }
    o[i] = s / c;
  }
  return o;
};

const syllables = (w) => {
  const s = w.toLowerCase().replace(/[^a-zà-ÿ]/g, "");
  const groups = s.match(/[aioueàèéìòóù]+/g);
  return Math.max(1, (groups ? groups.length : 1) + (s.length > 7 ? 1 : 0));
};

const parseWords = (lines) => {
  const out = [];
  for (const line of lines) {
    const re = /\*(.+?)\*/g;
    let last = 0;
    let m;
    const parts = [];
    while ((m = re.exec(line))) {
      if (m.index > last) parts.push({ t: line.slice(last, m.index), hi: false });
      parts.push({ t: m[1], hi: true });
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push({ t: line.slice(last), hi: false });
    for (const p of parts) {
      for (const w of p.t.split(/\s+/)) {
        const tok = w.trim();
        if (!tok) continue;
        // keep trailing punctuation glued to the word it belongs to
        if (/^[.,!?…:;]+$/.test(tok) && out.length) {
          out[out.length - 1].w += tok;
          continue;
        }
        out.push({ w: tok, hi: p.hi });
      }
    }
  }
  return out;
};

const result = {};

for (const scene of timeline.scenes) {
  const file = ensureVo(scene.vo);
  const pcm = readWavMono(file);
  const dur = pcm.length / SR;
  const env = smooth(envelope(pcm), 2);
  let peak = 0;
  let floor = 1;
  for (const v of env) peak = Math.max(peak, v);
  for (const v of env) if (v > 1e-4) floor = Math.min(floor, v);
  const thr = Math.max(peak * 0.055, floor * 6);

  // speech runs
  const runs = [];
  let s = -1;
  for (let i = 0; i < env.length; i++) {
    const on = env[i] > thr;
    if (on && s < 0) s = i;
    if (!on && s >= 0) {
      runs.push([s / 100, i / 100]);
      s = -1;
    }
  }
  if (s >= 0) runs.push([s / 100, env.length / 100]);
  // merge short gaps, drop blips
  const merged = [];
  for (const r of runs) {
    const last = merged[merged.length - 1];
    if (last && r[0] - last[1] < 0.14) last[1] = r[1];
    else merged.push([...r]);
  }
  const speech = merged.filter((r) => r[1] - r[0] > 0.09);
  if (!speech.length) {
    result[scene.id] = [];
    continue;
  }

  const words = parseWords(subtitles[scene.id] ?? []);
  const w = words.map((x) => ({ ...x, syl: syllables(x.w) }));
  const totalSyl = w.reduce((a, b) => a + b.syl, 0);
  const totalSpeech = speech.reduce((a, r) => a + (r[1] - r[0]), 0);

  // lay the words over the speech runs, proportional to syllables
  let cursor = 0; // index into speech
  let posInRun = 0;
  let acc = 0;
  const timed = w.map((word) => {
    const share = (word.syl / totalSyl) * totalSpeech;
    let remaining = share;
    let st = null;
    while (remaining > 0 && cursor < speech.length) {
      const [a, b] = speech[cursor];
      const avail = b - (a + posInRun);
      if (avail <= 1e-6) {
        cursor++;
        posInRun = 0;
        continue;
      }
      if (st === null) st = a + posInRun;
      const take = Math.min(avail, remaining);
      posInRun += take;
      remaining -= take;
      if (posInRun >= b - a - 1e-6) {
        cursor++;
        posInRun = 0;
      }
    }
    if (st === null) st = speech[speech.length - 1][1];
    const en = st + share;
    acc += share;
    return { w: word.w, hi: word.hi, st, en };
  });

  // snap boundaries to energy dips (word onsets are minima)
  const snap = (t, from, to) => {
    const lo = Math.max(0, Math.round((t - 0.10) * 100));
    const hi = Math.min(env.length - 1, Math.round((t + 0.10) * 100));
    let best = -1;
    let bestV = Infinity;
    for (let i = lo; i <= hi; i++) {
      if (env[i] < thr * 0.9) continue;
      if (env[i] < bestV) { bestV = env[i]; best = i; }
    }
    if (best < 0) return t;
    const cand = best / 100;
    return cand > from && cand < to ? cand : t;
  };
  for (let i = 1; i < timed.length; i++) {
    const prev = timed[i - 1].st;
    const next = i + 1 < timed.length ? timed[i + 1].st : timed[i].en;
    const st = snap(timed[i].st, prev + 0.11, next - 0.03);
    timed[i].st = st;
    timed[i - 1].en = st;
  }
  // enforce a minimum word length so no word collapses into the next one
  for (let i = 1; i < timed.length; i++) {
    const min = timed[i - 1].st + 0.11;
    if (timed[i].st < min) {
      timed[i].st = min;
      timed[i - 1].en = min;
    }
  }
  const endSpeech = speech[speech.length - 1][1];
  timed[timed.length - 1].en = Math.min(endSpeech, Math.max(timed[timed.length - 1].st + 0.2, timed[timed.length - 1].en));

  result[scene.id] = timed.map((x) => ({
    w: x.w,
    hi: x.hi,
    st: +x.st.toFixed(3),
    en: +x.en.toFixed(3),
  }));
  console.log(
    `${scene.id}  dur ${dur.toFixed(2)}s  speech ${totalSpeech.toFixed(2)}s  runs ${speech.length}  words ${timed.length}`,
  );
}

fs.writeFileSync("src/captions.json", JSON.stringify(result, null, 2));
console.log("wrote src/captions.json");
