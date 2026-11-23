export const C = {
  bg: '#06070A',
  bg2: '#0B0E14',
  panel: '#11151D',
  ink: '#F4F1EA',
  dim: '#8A94A6',
  faint: '#2A303C',
  amber: '#FFC04A',
  coral: '#FF5148',
  mint: '#4BEBA0',
  steel: '#5B6678',
};

export const F = {
  display: 'Bricolage',
  text: 'InterTight',
  mono: 'JetBrains',
  serif: 'Instrument',
};

export const W = 1440;
export const H = 2560;
export const SAFE = {left: 96, right: 1180, top: 190, caption: 1824};

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const eOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const eInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const eOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const eIn = (t: number) => t * t * t;
