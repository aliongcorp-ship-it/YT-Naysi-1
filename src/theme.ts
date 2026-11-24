export const W = 1440;
export const H = 2560;
export const FPS = 90;

// ── "ABBYSAL SURVEY" identity: light dies as the story descends ────────────
export const C = {
  void: '#01060A',
  abyss: '#03101A',
  deep: '#062231',
  mid: '#0B3B4C',
  shallow: '#12657A',
  foam: '#EAF7F7',
  ink: '#F2FBFB',
  muted: '#7FA2AC',
  faint: '#254250',
  sonar: '#5FF3E0',
  sonarDim: '#2AA899',
  magma: '#FF7A45',
  ember: '#FFB88C',
  iris: '#8C7BFF',
};

export const F = {
  display: 'SpaceGrotesk',
  mono: 'PlexMono',
  serif: 'Fraunces',
};

export const SAFE = {left: 156, right: 1344, top: 200, caption: 1800};

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

// depth -> colour ramp (m). Used by the backdrop, the rail and every scene.
const STOPS: [number, string][] = [
  [0, '#0E4E63'],
  [120, '#0A3746'],
  [600, '#062230'],
  [2000, '#041620'],
  [4500, '#020B12'],
  [7440, '#01060A'],
];
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const depthColor = (m: number) => {
  const d = clamp(m, 0, 7440);
  for (let i = 1; i < STOPS.length; i++) {
    if (d <= STOPS[i][0]) {
      const [a0, c0] = STOPS[i - 1];
      const [a1, c1] = STOPS[i];
      const p = (d - a0) / (a1 - a0);
      const A = hex(c0);
      const B = hex(c1);
      const mix = A.map((v, k) => Math.round(lerp(v, B[k], p)));
      return `rgb(${mix[0]},${mix[1]},${mix[2]})`;
    }
  }
  return STOPS[STOPS.length - 1][1];
};
