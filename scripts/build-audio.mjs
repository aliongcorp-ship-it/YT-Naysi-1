// ---------------------------------------------------------------------------
// Builds the complete soundtrack:
//   1. procedural cinematic score (D minor → D major resolution)
//   2. voice-over placement from the timeline
//   3. side-chain ducking + soft limiting
// Output: out/mix.wav (master) → public/audio/mix.m4a (delivery track)
// The composition only ever references the compressed track.
// ---------------------------------------------------------------------------
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

const FFMPEG = ffmpegPath.path;
import timeline from "../src/timeline.json" with { type: "json" };
const TL = timeline;

const SR = 48000;
const DUR = TL.duration;
const N = Math.ceil(DUR * SR);
const TAU = Math.PI * 2;

const L = new Float32Array(N);
const R = new Float32Array(N);
const SL = new Float32Array(N); // reverb send
const SR_ = new Float32Array(N);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

/* ---------------------------- primitives -------------------------------- */
function addSine(freq, start, dur, gain, pan = 0, attack = 0.01, release = 0.1, send = 0.2, fm = 0) {
  const s0 = Math.max(0, Math.floor(start * SR));
  const len = Math.floor(dur * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const idx = s0 + i;
    if (idx >= N) break;
    let env = 1;
    if (t < attack) env = t / attack;
    const relStart = dur - release;
    if (t > relStart) env *= Math.max(0, 1 - (t - relStart) / release);
    const v = Math.sin(TAU * freq * t + fm * Math.sin(TAU * 2.1 * t)) * env * gain;
    const gl = Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = Math.sin(((pan + 1) * Math.PI) / 4);
    L[idx] += v * gl;
    R[idx] += v * gr;
    if (send > 0) {
      SL[idx] += v * gl * send;
      SR_[idx] += v * gr * send;
    }
  }
}

function addSaw(freq, start, dur, gain, pan = 0, attack = 0.4, release = 0.8, send = 0.3, cutoff = 1400, harmonics = 7) {
  const s0 = Math.max(0, Math.floor(start * SR));
  const len = Math.floor(dur * SR);
  let lp = 0;
  const a = 1 - Math.exp((-TAU * cutoff) / SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const idx = s0 + i;
    if (idx >= N) break;
    let env = 1;
    if (t < attack) env = t / attack;
    const relStart = dur - release;
    if (t > relStart) env *= Math.max(0, 1 - (t - relStart) / release);
    let v = 0;
    for (let h = 1; h <= harmonics; h++) {
      v += Math.sin(TAU * freq * h * t) / h;
    }
    lp += (v - lp) * a;
    v = lp * env * gain;
    const gl = Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = Math.sin(((pan + 1) * Math.PI) / 4);
    L[idx] += v * gl;
    R[idx] += v * gr;
    if (send > 0) {
      SL[idx] += v * gl * send;
      SR_[idx] += v * gr * send;
    }
  }
}

function addNoise(start, dur, gain, pan = 0, type = "band", f0 = 800, f1 = 8000, q = 0.6, send = 0.3) {
  const s0 = Math.max(0, Math.floor(start * SR));
  const len = Math.floor(dur * SR);
  let b0 = 0, b1 = 0, b2 = 0;
  let lp = 0, hp = 0;
  for (let i = 0; i < len; i++) {
    const idx = s0 + i;
    if (idx >= N) break;
    const t = i / SR;
    const p = i / len;
    const cut = f0 + (f1 - f0) * p;
    const w = Math.random() * 2 - 1;
    // state-variable band
    const f = 2 * Math.sin((Math.PI * Math.min(cut, SR / 4)) / SR);
    b0 += f * b1;
    b2 = w - b0 - q * b1;
    b1 += f * b2;
    const band = b1;
    lp += (band - lp) * 0.02;
    const v = lp * gain * Math.sin(Math.PI * p) ** 1.5;
    const gl = Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = Math.sin(((pan + 1) * Math.PI) / 4);
    L[idx] += v * gl;
    R[idx] += v * gr;
    if (send > 0) {
      SL[idx] += v * gl * send;
      SR_[idx] += v * gr * send;
    }
  }
}

function addKick(start, gain = 0.5) {
  const s0 = Math.floor(start * SR);
  const len = Math.floor(0.55 * SR);
  for (let i = 0; i < len; i++) {
    const idx = s0 + i;
    if (idx >= N) break;
    const t = i / SR;
    const f = 48 + 90 * Math.exp(-t * 26);
    const env = Math.exp(-t * 6.5);
    const v = Math.sin(TAU * f * t) * env * gain;
    L[idx] += v;
    R[idx] += v;
  }
}

function addImpact(start, gain = 0.7) {
  addSine(58, start, 2.6, gain, 0, 0.005, 2.4, 0.25);
  addSine(36, start, 3.2, gain * 0.8, 0, 0.01, 3.0, 0.15);
  addNoise(start, 0.7, gain * 0.35, 0, "band", 180, 900, 0.7, 0.5);
}

function addRiser(start, dur, gain = 0.16) {
  addNoise(start, dur, gain, 0, "band", 300, 9000, 0.9, 0.5);
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    const t = start + (i / steps) * dur;
    addSine(180 * Math.pow(2, i / 12), t, dur / steps * 1.6, gain * 0.12, 0, 0.02, 0.1, 0.6);
  }
}

function addPing(start, gain = 0.16, freq = 880) {
  addSine(freq, start, 3.2, gain, 0.1, 0.004, 3.0, 0.9);
  addSine(freq * 1.5, start, 2.4, gain * 0.35, -0.1, 0.004, 2.2, 0.9);
}

function addPluck(freq, start, dur, gain, pan = 0) {
  addSine(freq, start, dur, gain, pan, 0.003, dur * 0.9, 0.55, 0.6);
  addSine(freq * 2, start, dur * 0.6, gain * 0.25, pan, 0.002, dur * 0.55, 0.5);
  addSine(freq * 3.01, start, dur * 0.35, gain * 0.1, pan, 0.002, dur * 0.3, 0.4);
}

/* ------------------------------ score ----------------------------------- */
const BEAT = 60 / 84;
const BAR = BEAT * 4;
const S = (id) => TL.scenes.find((s) => s.id === id);

// chord voicings (MIDI)
const CH = {
  Dm: [50, 53, 57, 62],
  Bb: [46, 50, 53, 58],
  F: [41, 45, 48, 53],
  C: [48, 52, 55, 60],
  Gm: [43, 46, 50, 55],
  A: [45, 49, 52, 57],
  D: [50, 54, 57, 62],
  G: [43, 47, 50, 55],
  Bm: [47, 50, 54, 59],
};

const intensity = (t) => {
  if (t < 8.8) return 0.46;
  if (t < 17.52) return 0.48;
  if (t < 26.56) return 0.6;
  if (t < 37.3) return 0.78;
  if (t < 47.86) return 0.68;
  if (t < 58.9) return 0.88;
  if (t < 68.21) return 0.7;
  if (t < 75.97) return 0.8;
  return 0.4;
};

const chordAt = (t) => {
  if (t < 8.8) return "Dm";
  if (t < 58.9) {
    const bar = Math.floor((t - 8.8) / BAR);
    const prog = t < 47.86 ? ["Dm", "Dm", "Bb", "F", "C", "Dm", "Bb", "C"] : ["Dm", "Bb", "Gm", "A"];
    return prog[bar % prog.length];
  }
  if (t < 68.21) {
    const bar = Math.floor((t - 58.9) / BAR);
    return ["D", "G", "Bm", "A"][bar % 4];
  }
  const bar = Math.floor((t - 68.21) / BAR);
  return ["D", "G", "A", "D"][bar % 4];
};

// --- continuous drone (sample-accurate, never gaps) ---
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const lfo = 0.7 + 0.3 * Math.sin(TAU * 0.045 * t);
  const g = 0.085 * intensity(t) * lfo;
  const v =
    Math.sin(TAU * 36.71 * t) * g +
    Math.sin(TAU * 55.0 * t) * g * 0.5 +
    Math.sin(TAU * 73.42 * t) * g * 0.18 +
    Math.sin(TAU * 110.0 * t) * g * 0.06;
  L[i] += v;
  R[i] += v * 0.94;
  const s = v * 0.25;
  SL[i] += s;
  SR_[i] += s;
}
// airy high bed
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const lfo = 0.5 + 0.5 * Math.sin(TAU * 0.031 * t + 1.2);
  const g = 0.006 * intensity(t) * lfo;
  const v = Math.sin(TAU * 1174.66 * t) * g + Math.sin(TAU * 1760.0 * t) * g * 0.5;
  L[i] += v * 0.8;
  R[i] += v * 0.2;
  SL[i] += v * 0.4;
  SR_[i] += v * 0.4;
}

// --- pads per bar ---
for (let bar = 0; bar * BAR < DUR + BAR; bar++) {
  const t = bar * BAR;
  const name = chordAt(t + 0.01);
  const notes = CH[name];
  const inten = intensity(t + BAR / 2);
  notes.forEach((m, i) => {
    const pan = (i - 1.5) * 0.35;
    addSaw(midi(m), t, BAR * 1.15, 0.045 * inten, pan, 0.9, 1.1, 0.55, 900 + 500 * inten, 6);
    addSaw(midi(m) * 1.003, t, BAR * 1.15, 0.03 * inten, -pan, 0.9, 1.1, 0.55, 900 + 500 * inten, 6);
  });
}

// --- pulse / arpeggio ---
const arpNotes = [62, 69, 65, 69, 62, 65, 69, 74];
for (let t = 8.8; t < 76.2; t += BEAT / 2) {
  const inten = intensity(t);
  if (inten < 0.45) continue;
  const step = Math.round((t - 8.8) / (BEAT / 2));
  const m = arpNotes[step % arpNotes.length];
  const chordRoot = CH[chordAt(t)][0];
  const note = m < chordRoot ? m + 12 : m;
  addPluck(midi(note), t, 0.42, 0.05 * inten, ((step % 4) - 1.5) * 0.25);
}

// --- sub pulse on beats ---
for (let t = 17.52; t < 76.2; t += BEAT) {
  const inten = intensity(t);
  if (inten < 0.55) continue;
  addSine(midi(CH[chordAt(t)][0] - 12), t, BEAT * 0.85, 0.11 * inten, 0, 0.008, BEAT * 0.7, 0.1);
}

// --- heartbeat in the deep-sea section ---
for (let t = 37.9; t < 47.4; t += BEAT * 2) {
  addKick(t, 0.3);
  addKick(t + 0.19, 0.18);
}

// --- kick pulse in the build + resolve ---
for (let t = 26.6; t < 37.2; t += BEAT * 2) addKick(t, 0.22);
for (let t = 58.9; t < 75.9; t += BEAT * 2) addKick(t, 0.2);

// --- ticks ---
for (let t = 17.52; t < 58.9; t += BEAT / 2) {
  const inten = intensity(t);
  if (inten < 0.55) continue;
  addNoise(t, 0.035, 0.018 * inten, (Math.round(t / (BEAT / 2)) % 2) * 0.5 - 0.25, "band", 5000, 9000, 1.2, 0.4);
}

// --- transitions ---
const cuts = TL.scenes.slice(1).map((s) => s.start);
for (const c of cuts) {
  addNoise(c - 0.22, 0.42, 0.09, 0, "band", 400, 5000, 0.8, 0.5);
}
for (const t of [8.8, 26.56, 37.3, 47.86, 58.9, 68.21]) {
  addImpact(t, t === 47.86 ? 0.95 : 0.55);
}
for (const t of [25.1, 45.9, 56.9]) {
  addRiser(t, t === 25.1 ? 1.5 : 2.0, 0.14);
}
for (const [t, g, f] of [
  [9.4, 0.16, 880],
  [18.6, 0.12, 990],
  [29.2, 0.1, 784],
  [70.2, 0.12, 1046],
  [77.4, 0.1, 880],
]) {
  addPing(t, g, f);
}

// --- shimmer on the resolve ---
for (let i = 0; i < 26; i++) {
  const t = 58.9 + (i / 26) * 16;
  const m = [74, 81, 78, 86, 74, 83][i % 6];
  addSine(midi(m), t, 2.6, 0.018, Math.sin(i) * 0.6, 0.4, 2.2, 0.95);
}

// --- final low note ---
addSine(36.71, 76.4, 6.6, 0.12, 0, 0.05, 6.0, 0.4);
addSine(73.42, 76.4, 6.6, 0.06, 0, 0.05, 6.0, 0.4);

/* ---------------------------- reverb ------------------------------------ */
class Freeverb {
  constructor(sr, scale) {
    this.combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map(
      (t) => ({ d: Math.round((t * scale * sr) / 44100), buf: null, i: 0, store: 0 }),
    );
    this.aps = [556, 441, 341, 225].map((t) => ({ d: Math.round((t * scale * sr) / 44100), buf: null, i: 0 }));
    for (const c of this.combs) c.buf = new Float32Array(c.d);
    for (const a of this.aps) a.buf = new Float32Array(a.d);
    this.feedback = 0.86;
    this.damp = 0.22;
  }
  process(input) {
    const out = new Float32Array(input.length);
    for (let n = 0; n < input.length; n++) {
      const x = input[n] * 0.015;
      let acc = 0;
      for (const c of this.combs) {
        const y = c.buf[c.i];
        c.store = y * (1 - this.damp) + c.store * this.damp;
        c.buf[c.i] = x + c.store * this.feedback;
        c.i = (c.i + 1) % c.d;
        acc += y;
      }
      for (const a of this.aps) {
        const b = a.buf[a.i];
        const y = -acc + b;
        a.buf[a.i] = acc + b * 0.5;
        a.i = (a.i + 1) % a.d;
        acc = y;
      }
      out[n] = acc;
    }
    return out;
  }
}

console.log("rendering reverb…");
const wetL = new Freeverb(SR, 1.0).process(SL);
const wetR = new Freeverb(SR, 1.03).process(SR_);
for (let i = 0; i < N; i++) {
  L[i] += wetL[i] * 3.4;
  R[i] += wetR[i] * 3.4;
}

/* ---------------------------- voice-over -------------------------------- */
function readWavMono(file) {
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
}

const vo = new Float32Array(N);
let voPeak = 0;
for (const s of TL.scenes) {
  const file = path.resolve("build/vo", `${s.vo}.wav`);
  if (!fs.existsSync(file)) throw new Error(`missing ${file}`);
  const clip = readWavMono(file);
  const start = Math.floor(s.voStart * SR);
  for (let i = 0; i < clip.length; i++) {
    const idx = start + i;
    if (idx >= N) break;
    vo[idx] += clip[i];
  }
  let p = 0;
  for (let i = 0; i < clip.length; i++) p = Math.max(p, Math.abs(clip[i]));
  voPeak = Math.max(voPeak, p);
  console.log(`VO ${s.vo}: ${(clip.length / SR).toFixed(2)}s @ ${s.voStart.toFixed(2)}s (peak ${p.toFixed(2)})`);
}

// normalize VO
const voGain = 0.92 / (voPeak || 1);

// ducking envelope
const duck = new Float32Array(N);
let g = 1;
for (let i = 0; i < N; i++) {
  const target = Math.abs(vo[i]) > 0.006 ? 0.34 : 1;
  const k = target < g ? 0.00035 : 0.00008;
  g += (target - g) * k * 60;
  duck[i] = g;
}

/* ------------------------------ mix ------------------------------------- */
let peak = 0;
for (let i = 0; i < N; i++) {
  const m = intensity(i / SR);
  let l = L[i] * duck[i] * (0.85 + 0.3 * m) + vo[i] * voGain;
  let r = R[i] * duck[i] * (0.85 + 0.3 * m) + vo[i] * voGain;
  l = Math.tanh(l * 1.15) / 1.15;
  r = Math.tanh(r * 1.15) / 1.15;
  L[i] = l;
  R[i] = r;
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
}
const norm = 0.89 / (peak || 1);
for (let i = 0; i < N; i++) {
  L[i] *= norm;
  R[i] *= norm;
}

/* ------------------------------ write ----------------------------------- */
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(clamp(Math.round(L[i] * 32767), -32768, 32767), 44 + i * 4);
  buf.writeInt16LE(clamp(Math.round(R[i] * 32767), -32768, 32767), 46 + i * 4);
}
fs.mkdirSync("out", { recursive: true });
fs.writeFileSync("out/mix.wav", buf);
console.log(`wrote out/mix.wav — ${DUR.toFixed(2)}s, peak ${(peak * norm).toFixed(3)}`);

// Delivery encode: AAC in an MP4 container. Lossy on purpose — the master WAV
// stays on disk for re-encodes but never ships.
fs.mkdirSync("public/audio", { recursive: true });
execFileSync(FFMPEG, [
  "-y", "-v", "error",
  "-i", "out/mix.wav",
  "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
  "-movflags", "+faststart",
  "public/audio/mix.m4a",
]);
console.log(`wrote public/audio/mix.m4a — ${(fs.statSync("public/audio/mix.m4a").size / 1024).toFixed(0)} KB`);
