// Geometry, easings and colour maths only.
//
// The look of an episode lives in its topic file (scenes/<topic>.mjs), never
// here: palette, type pairing and caption style are per-episode decisions.
// This module is the shared measuring stick they all use.

export const W = 1440;
export const H = 2560;
export const FPS = 90;

// Video-safe area. Nothing sits outside these edges; the Shorts shelf covers
// the bottom 420 px on the right, so captions stop well above it.
export const SAFE = {
  left: 132,
  right: 1308,
  top: 190,
  caption: 1786,
  captionFloor: 2000,
  captionWidth: 1150,
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const eOutQuint = (t: number) => 1 - Math.pow(1 - clamp(t), 5);
export const eIn = (t: number) => Math.pow(clamp(t), 3);
export const eInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
export const mixN = (a: number, b: number, t: number) => a + (b - a) * clamp(t);

const hex = (h: string) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const p = clamp(t);
  return `rgb(${Math.round(lerp(A[0], B[0], p))},${Math.round(lerp(A[1], B[1], p))},${Math.round(lerp(A[2], B[2], p))})`;
};
export const alpha = (h: string, a: number) => {
  const A = hex(h);
  return `rgba(${A[0]},${A[1]},${A[2]},${clamp(a)})`;
};

// Deterministic noise. The same frame always renders the same dots, so a
// re-render is bit-identical and a still can be trusted as a preview.
export const hash = (x: number, y: number, s = 0) => {
  const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
};

// Indonesian number formatting: 384.400 km, 3,8 cm.
export const idID = (n: number) => Math.round(n).toLocaleString('id-ID');
export const dec = (n: number, d = 1) => n.toFixed(d).replace('.', ',');
