export const W = 1440;
export const H = 2560;
export const FPS = 90;

// ── "LUNAR RANGING" identity ───────────────────────────────────────────────
// Deep space at night, measured by hand. Navy-black void, bone-white type,
// instrument gold for hardware, mint for verified data, coral for retreat.
// Deliberately no glow / bloom: emphasis comes from weight and colour, not light.
export const C = {
  void: '#04060D',
  abyss: '#070C18',
  deep: '#0B1424',
  mid: '#152134',
  shallow: '#26374F',
  ink: '#F6F2E8',
  bone: '#F6F2E8',
  muted: '#8B97A8',
  faint: '#2B3547',
  gold: '#E9B44C',
  goldDim: '#A87B26',
  coral: '#E2564A',
  coralDim: '#8E332C',
  mint: '#5FCFAA',
  warm: '#FFD9A0',
};

export const F = {
  display: 'SpaceGrotesk',
  mono: 'PlexMono',
  serif: 'Fraunces',
};

// Caption block sits above the Shorts UI shelf, centred like the reference.
export const SAFE = {
  left: 156,
  right: 1344,
  top: 200,
  caption: 1790,
  captionFloor: 2010,
  captionWidth: 1180,
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const eOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const eOutQuint = (t: number) => 1 - Math.pow(1 - clamp(t), 5);
export const eInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const eIn = (t: number) => Math.pow(clamp(t), 3);
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
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
