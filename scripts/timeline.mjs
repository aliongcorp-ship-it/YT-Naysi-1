// Builds the master timeline from the voice-over files.
// Output: src/timeline.json (consumed by Remotion + the audio build)
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import subtitles from "../src/subtitles.json" with { type: "json" };

const FF = "node_modules/@ffmpeg-installer/linux-x64/ffmpeg";
const FP = "node_modules/ffprobe-static/bin/linux/x64/ffprobe";
const FPS = 90;

export const LINES = [
  { id: "s1", vo: "vo01", chapter: "HOOK", label: "TITIK PALING SEPI" },
  { id: "s2", vo: "vo02", chapter: "KOORDINAT", label: "POINT NEMO" },
  { id: "s3", vo: "vo03", chapter: "SKALA", label: "2.688 KM" },
  { id: "s4", vo: "vo04", chapter: "ORBIT", label: "400 KM" },
  { id: "s5", vo: "vo05", chapter: "KEDALAMAN", label: "KUBURAN LUAR ANGKASA" },
  { id: "s6", vo: "vo06", chapter: "SINYAL", label: "THE BLOOP" },
  { id: "s7", vo: "vo07", chapter: "JAWABAN", label: "ES YANG PATAH" },
  { id: "s8", vo: "vo08", chapter: "PENUTUP", label: "CERITA PALING RAMAI" },
  { id: "s9", vo: "vo09", chapter: "KAMU", label: "SATU TITIK" },
];

const PRE = 0.22;   // visual lead-in before the voice starts
const POST = 0.30;  // air after the voice ends
const HEAD = 0;     // start on the very first frame
const TAIL = 2.4;   // end card hold

const probe = (file) =>
  parseFloat(
    execFileSync(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file])
      .toString()
      .trim(),
  );

/** Pause map of a voice clip, used to snap subtitle line breaks to the narrator's breaths. */
function silenceGaps(file) {
  const r = spawnSync(FF, [
    "-hide_banner", "-nostats", "-i", file,
    "-af", "silencedetect=noise=-38dB:d=0.14", "-f", "null", "-",
  ], { encoding: "utf8" });
  const text = `${r.stdout || ""}${r.stderr || ""}`;
  const gaps = [];
  const re = /silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g;
  let m;
  while ((m = re.exec(text))) {
    const a = parseFloat(m[1]);
    const b = parseFloat(m[2]);
    gaps.push({ a, b, mid: (a + b) / 2, dur: parseFloat(m[3]) });
  }
  return gaps;
}

const plain = (s) => s.replace(/\*/g, "");

fs.mkdirSync("build/vo", { recursive: true });
const scenes = [];
let cursor = HEAD;

for (const line of LINES) {
  const src = `public/vo/${line.vo}.mp3`;
  const out = `build/vo/${line.vo}.wav`;
  execFileSync(FF, ["-y", "-v", "error", "-i", src,
    "-af", "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse,atempo=1.10",
    "-ar", "48000", "-ac", "1", out]);
  const dur = probe(out);

  const subs = subtitles[line.id] ?? [];
  const weights = subs.map((s) => plain(s).length + 1.5);
  const totalW = weights.reduce((a, b) => a + b, 0);

  // estimate each line boundary from character count, then snap it to the nearest breath
  const gaps = silenceGaps(out);
  const lineStarts = [0];
  let cum = 0;
  for (let i = 0; i < subs.length - 1; i++) {
    cum += weights[i];
    const est = (cum / totalW) * dur;
    let best = null;
    for (const g of gaps) {
      const d = Math.abs(g.mid - est);
      if (!best || d < best.d) best = { ...g, d };
    }
    lineStarts.push(best && best.d < 1.1 ? best.mid : est);
  }
  const lineEnds = [...lineStarts.slice(1), dur];

  const start = cursor;
  scenes.push({
    ...line,
    start,
    voStart: start + PRE,
    voEnd: start + PRE + dur,
    end: start + PRE + dur + POST,
    duration: PRE + dur + POST,
    lineStarts: lineStarts.map((x) => +x.toFixed(3)),
    lineEnds: lineEnds.map((x) => +x.toFixed(3)),
  });
  cursor = start + PRE + dur + POST;
}
const total = cursor + TAIL;

// let the end card hold until the very last frame
const last = scenes[scenes.length - 1];
last.end = total;
last.duration = total - last.start;

const data = {
  fps: FPS,
  width: 1440,
  height: 2560,
  duration: +total.toFixed(4),
  frames: Math.round(total * FPS),
  scenes: scenes.map((s, i) => ({
    id: s.id,
    vo: s.vo,
    chapter: s.chapter,
    label: s.label,
    index: i + 1,
    start: +s.start.toFixed(4),
    voStart: +s.voStart.toFixed(4),
    voEnd: +s.voEnd.toFixed(4),
    end: +s.end.toFixed(4),
    duration: +s.duration.toFixed(4),
    lineStarts: s.lineStarts,
    lineEnds: s.lineEnds,
    startFrame: Math.round(s.start * FPS),
    durationInFrames: Math.round(s.duration * FPS),
  })),
};
fs.writeFileSync("src/timeline.json", JSON.stringify(data, null, 2));
console.log(`timeline: ${total.toFixed(2)}s / ${data.frames} frames @${FPS}fps`);
for (const s of data.scenes) console.log(`${s.id}  ${s.start.toFixed(2)} → ${s.end.toFixed(2)}  (${s.duration.toFixed(2)}s)`);
