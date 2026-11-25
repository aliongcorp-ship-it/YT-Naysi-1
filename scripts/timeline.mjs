// Single source of truth: narration duration -> acts -> word timings -> frames.
// Picture, captions and score are all generated from the files this writes.
//
//   scenes/script.tsx   narration + shot list (per episode)
//   audio/vo_fx/sN.flac the measured take for each act, in array order
//
// Outputs
//   src/data/timeline.json   acts, shots, word timings, channel name
//   src/data/cues.json       flattened timing for the score
import fs from 'node:fs';
import path from 'node:path';
import {loadTsx} from './load.mjs';

const FPS = 90;
let LEAD = 0.34; // room to breathe before the first word
let GAP = 0.16; // breath between acts
const TAIL = 1.65; // hold long enough for the closing line to land
const SHORTS_MAX = 180; // hard ceiling: a Shorts upload must be <= 180 s

// Duration of a measured take. scripts/vo.py writes these numbers as it finishes
// each take (it counts the samples of the finished FLAC), so this step reads the
// manifest instead of probing the same files again. One measurement, one source.
const DURS = (() => {
  const p = 'audio/vo_fx/durations.json';
  if (!fs.existsSync(p)) throw new Error(`${p} is missing: run scripts/vo.py first`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
})();

const takeDur = (p) => {
  const name = path.basename(p, path.extname(p));
  const d = DURS[name];
  if (!Number.isFinite(d) || d <= 0) throw new Error(`${p}: no measured duration in durations.json`);
  return d;
};

const {acts: ACT_SPEC, CHANNEL, EPISODE} = await loadTsx('scenes/script.tsx');

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
  return ws.map((w, i) => {
    const d = (weights[i] / total) * speak;
    const item = {w, t: +cursor.toFixed(4), d: +d.toFixed(4)};
    cursor += d + pauses[i];
    return item;
  });
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
    if (/[,;:.!?—–]$/.test(it.w) || group.length >= 3) flush();
  }
  flush();
  return out;
}

// Fit the ceiling automatically: if the cut runs long, buy seconds back from
// the seams (gap first, then lead) instead of asking for a re-take.
const speechTotal = ACT_SPEC.reduce((a, _, i) => a + takeDur(`audio/vo_fx/s${i + 1}.flac`), 0);
let projected = speechTotal + LEAD + GAP * (ACT_SPEC.length - 1) + TAIL;
while (projected > SHORTS_MAX && GAP > 0.1) {
  GAP = +(GAP - 0.01).toFixed(2);
  projected = speechTotal + LEAD + GAP * (ACT_SPEC.length - 1) + TAIL;
}
while (projected > SHORTS_MAX && LEAD > 0.1) {
  LEAD = +(LEAD - 0.05).toFixed(2);
  projected = speechTotal + LEAD + GAP * (ACT_SPEC.length - 1) + TAIL;
}

const ACTS = [];
let t = LEAD;
ACT_SPEC.forEach((seg, i) => {
  const dur = takeDur(`audio/vo_fx/s${i + 1}.flac`);
  const words = layout(seg.text, dur, t);
  ACTS.push({
    index: i + 1,
    id: seg.id,
    em: seg.em ?? [],
    vo: `vo_fx/s${i + 1}.flac`,
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
// Shots come from the same script file, one entry per composition. Cuts are
// fractions of the act's measured span, so a re-take moves the cut with it.
const shots = [];
for (const seg of ACT_SPEC) {
  const act = ACTS.find((a) => a.id === seg.id);
  if (!act) throw new Error(`no act for ${seg.id}`);
  const span = act.end - act.start;
  for (const s of seg.shots) {
    const from = act.start + s.from * span;
    const to = s.to === 'end' ? act.end : act.start + s.to * span;
    shots.push({
      index: shots.length,
      act: seg.id,
      actIndex: act.index,
      file: s.file,
      label: s.label,
      start: +from.toFixed(3),
      end: +to.toFixed(3),
      startFrame: Math.round(from * FPS),
      endFrame: Math.round(to * FPS),
    });
  }
}
// every composition named by the script must exist, or the render fails here
// rather than silently showing the previous episode's picture
for (const s of shots) {
  const p = `scenes/${s.file}.tsx`;
  if (!fs.existsSync(p)) throw new Error(`shot ${s.file} has no composition: ${p} is missing`);
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
  JSON.stringify({
    fps: FPS,
    width: 1440,
    height: 2560,
    durationInFrames,
    durationSec,
    channel: CHANNEL.name,
    identity: EPISODE?.identity ?? 'unknown',
    topic: EPISODE?.topic ?? '',
    acts: ACTS,
    shots,
  })
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

console.log(`episode ${EPISODE?.slug ?? '?'} (${EPISODE?.identity ?? '?'}) — ${EPISODE?.topic ?? ''}`);
console.log(`duration ${durationSec.toFixed(2)}s | ${durationInFrames} frames | ${(durationSec / 60).toFixed(2)} min`);
if (durationSec > SHORTS_MAX) {
  console.error(`\n  WARNING  ${durationSec.toFixed(2)}s exceeds the ${SHORTS_MAX}s Shorts ceiling by ${(durationSec - SHORTS_MAX).toFixed(2)}s`);
  console.error('           shorten the narration in scenes/script.tsx before rendering\n');
}
console.log('shots', shots.length);
for (const s of shots) console.log('  ', s.file.padEnd(6), s.label.padEnd(22), s.start.toFixed(2).padStart(7), '->', s.end.toFixed(2).padStart(7), (s.frames / FPS).toFixed(2) + 's');
for (const a of ACTS) {
  console.log(String(a.index).padStart(2), a.id.padEnd(11), a.start.toFixed(2).padStart(7), '->', a.end.toFixed(2).padStart(7), ' vo', (a.voEnd - a.voStart).toFixed(2), ' words', a.words.length);
}
