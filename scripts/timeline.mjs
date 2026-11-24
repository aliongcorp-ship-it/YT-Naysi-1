// Single source of truth: narration duration -> acts -> word timings -> frames.
// Picture, captions and score are all generated from the file this writes.
import fs from 'node:fs';

const FPS = 90;
const LEAD = 0.55;            // room to breathe before the first word
const GAP = 0.42;             // breath between acts
const TAIL = 2.4;

const wavDur = (p) => (fs.statSync(p).size - 44) / 96000; // 48k mono 16-bit

// id, on-screen slate, and the spoken line. Order = narrative order.
const SEGMENTS = JSON.parse(fs.readFileSync('scripts/script.json', 'utf8'));

const VOWELS = /[aeiouy]+/g;
const syllables = (w) => (w.toLowerCase().replace(/[^a-z]/g, '').match(VOWELS) || ['x']).length;

function layout(text, dur, startAt) {
  const ws = text.split(/\s+/).filter(Boolean);
  const pauses = ws.map((w) => {
    if (/[.!?]$/.test(w)) return 0.62;
    if (/[,;:]$/.test(w)) return 0.34;
    if (/[—–]$/.test(w)) return 0.4;
    return 0;
  });
  const pauseTotal = pauses.reduce((a, b) => a + b, 0);
  const speak = Math.max(0.4, dur - 0.12 - pauseTotal);
  const weights = ws.map((w) => syllables(w) + 1.4 + Math.min(2.2, w.length * 0.05));
  const total = weights.reduce((a, b) => a + b, 0);
  let cursor = startAt;
  const words = ws.map((w, i) => {
    const d = (weights[i] / total) * speak;
    const item = {w, t: +cursor.toFixed(4), d: +d.toFixed(4)};
    cursor += d + pauses[i];
    return item;
  });
  return words;
}

function phrase(words) {
  const out = [];
  let group = [];
  const flush = () => {
    if (!group.length) return;
    out.push({
      words: group.map(({w, t, d}) => ({w, t, d})),
      start: group[0].t,
      end: +(group[group.length - 1].t + group[group.length - 1].d).toFixed(3),
      index: out.length,
    });
    group = [];
  };
  for (const it of words) {
    group.push(it);
    const closed = /[,;:.!?—–]$/.test(it.w);
    if (closed || group.length >= 3) flush();
  }
  flush();
  return out;
}

const ACTS = [];
let t = LEAD;
SEGMENTS.forEach((seg, i) => {
  const file = `audio/vo_fx/s${i + 1}.wav`;
  const dur = wavDur(file);
  const words = layout(seg.text, dur, t);
  ACTS.push({
    index: i + 1,
    id: seg.id,
    slate: seg.slate,
    chapter: seg.chapter,
    em: seg.em ?? [],
    vo: `vo_fx/s${i + 1}.wav`,
    voStart: +t.toFixed(4),
    voEnd: +(t + dur).toFixed(4),
    start: +(i === 0 ? 0 : ACTS[i - 1].end).toFixed(4),
    end: +(t + dur + GAP).toFixed(4),
    words,
    phrases: phrase(words),
  });
  t += dur + GAP;
});

const durationSec = +(t - GAP + TAIL).toFixed(3);
const durationInFrames = Math.ceil(durationSec * FPS);

// ── Shot list ─────────────────────────────────────────────────────────────
// One narration act can cut across several visual scenes; captions stay
// anchored to the act so the words never restart on a cut.
const SHOTS = JSON.parse(fs.readFileSync('scripts/shots.json', 'utf8'));
const shots = [];
for (const s of SHOTS) {
  const act = ACTS.find((a) => a.id === s.act);
  if (!act) throw new Error(`shot refers to unknown act ${s.act}`);
  // cuts are expressed as a fraction of the act so they survive VO re-takes
  const span = act.end - act.start;
  const from = act.start + s.from * span;
  const to = s.to === 'end' ? act.end : act.start + s.to * span;
  shots.push({
    index: shots.length,
    act: s.act,
    actIndex: act.index,
    scene: s.scene,
    label: s.label,
    start: +from.toFixed(3),
    end: +to.toFixed(3),
    startFrame: Math.round(from * FPS),
    endFrame: Math.round(to * FPS),
  });
}
shots.forEach((s, i) => {
  const next = shots[i + 1];
  s.outFrame = next ? next.startFrame : durationInFrames;
  s.frames = s.outFrame - s.startFrame;
});

for (const a of ACTS) {
  a.startFrame = Math.round(a.start * FPS);
  a.endFrame = Math.round(a.end * FPS);
  a.beats = a.phrases.map((p) => ({at: p.start, index: p.index}));
}

fs.writeFileSync(
  'src/data/timeline.json',
  JSON.stringify({fps: FPS, width: 1440, height: 2560, durationInFrames, durationSec, acts: ACTS, shots})
);

// audio build sheet
fs.writeFileSync(
  'src/data/cues.json',
  JSON.stringify(
    {
      durationSec,
      acts: ACTS.map((a) => ({
        index: a.index,
        id: a.id,
        start: a.start,
        end: a.end,
        voStart: a.voStart,
        voEnd: a.voEnd,
        words: a.words.map((w) => w.t),
        phrases: a.phrases.map((p) => p.start),
      })),
    },
    null,
    1
  )
);

console.log(`duration ${durationSec.toFixed(2)}s | ${durationInFrames} frames | ${(durationSec / 60).toFixed(2)} min`);
console.log('shots', shots.length);
for (const s of shots) console.log('  ', s.scene.padEnd(12), s.start.toFixed(2).padStart(7), '->', s.end.toFixed(2).padStart(7), (s.frames / 90).toFixed(2) + 's');
for (const a of ACTS) {
  console.log(
    String(a.index).padStart(2),
    a.id.padEnd(11),
    a.start.toFixed(2).padStart(7),
    '->',
    a.end.toFixed(2).padStart(7),
    ' vo',
    (a.voEnd - a.voStart).toFixed(2),
    ' words',
    a.words.length
  );
}
