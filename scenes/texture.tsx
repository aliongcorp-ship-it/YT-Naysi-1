// ============================================================================
// texture — the material layer. paper fibre, ink edge, foil hatch, film halation.
// Everything is procedural: no bitmaps, no stock, no 3D.
// ============================================================================
import React from 'react';
import { clamp01, easeOutCubic, hash, lerp, prog } from './script';
import { easeInOutCubic, jitter } from './motion';

// ---------------------------------------------------------------------------
// print materials
// ---------------------------------------------------------------------------

/** full-frame paper fibre. kept at low opacity so the encode stays light. */
export const PaperFibre: React.FC<{ opacity?: number; seed?: number }> = ({ opacity = 0.14, seed = 11 }) => (
  <svg
    width={1440}
    height={2560}
    style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay', pointerEvents: 'none' }}
    viewBox="0 0 1440 2560"
  >
    <defs>
      <filter id={`fibre-${seed}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.62 0.9" numOctaves={3} seed={seed} result="n" />
        <feColorMatrix in="n" type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope={0.5} intercept={-0.05} />
        </feComponentTransfer>
      </filter>
    </defs>
    <rect x={0} y={0} width={720} height={1280} transform="scale(2)" filter={`url(#fibre-${seed})`} opacity={opacity} />
  </svg>
);

/** ink bleed in the corners — the plate was printed, not screenshotted. */
export const InkBleed: React.FC<{ t: number; color: string; sid?: string }> = ({ t, color: _c, sid = '0' }) => (
  <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <defs>
      <radialGradient id={`bleed-tr-${sid}`} cx="100%" cy="0%" r="62%">
        <stop offset="0%" stopColor="rgba(12,9,6,0.55)" />
        <stop offset="100%" stopColor="rgba(12,9,6,0)" />
      </radialGradient>
      <radialGradient id={`bleed-bl-${sid}`} cx="0%" cy="100%" r="58%">
        <stop offset="0%" stopColor="rgba(9,7,5,0.5)" />
        <stop offset="100%" stopColor="rgba(9,7,5,0)" />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={1440} height={2560} fill={`url(#bleed-tr-${sid})`} />
    <rect x={0} y={0} width={1440} height={2560} fill={`url(#bleed-bl-${sid})`} />
    <rect x={0} y={0} width={1440} height={2560} fill="rgba(0,0,0,0)" />
    <circle cx={1200 + Math.sin(t * 0.3) * 8} cy={260} r={3} fill="rgba(240,230,210,0.05)" />
  </svg>
);

/** one soft light leak that drifts very slowly. */
export const LightLeak: React.FC<{ x: number; y: number; r: number; color: string; t: number; speed?: number; sid?: string }> = ({
  x,
  y,
  r,
  color,
  t,
  speed = 0.16,
  sid = '0',
}) => {
  const dx = Math.sin(t * speed * Math.PI) * 26;
  const dy = Math.cos(t * speed * Math.PI * 0.8) * 18;
  return (
    <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', pointerEvents: 'none' }}>
      <defs>
        <radialGradient id={`leak-${sid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.5} />
          <stop offset="46%" stopColor={color} stopOpacity={0.16} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x + dx} cy={y + dy} rx={r} ry={r * 1.18} fill={`url(#leak-${sid})`} />
    </svg>
  );
};

/** thin sheen that travels down the frame once per chapter. */
export const PlateSheen: React.FC<{ t: number; dur: number; color?: string; sid?: string }> = ({ t, dur, color = 'rgba(255,246,228,0.05)', sid = '0' }) => {
  const p = clamp01(t / Math.max(dur, 0.01));
  const y = lerp(-320, 2600, easeInOutCubic(p));
  return (
    <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id={`sheen-band-${sid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect x={0} y={y} width={1440} height={260} fill={`url(#sheen-band-${sid})`} />
    </svg>
  );
};

/** halftone screen — used in corners and inside figure blocks. */
export const HalftoneField: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  step?: number;
  color: string;
  opacity?: number;
  ramp?: 'radial' | 'linear' | 'flat';
  seed?: number;
}> = ({ x, y, w, h, step = 9, color, opacity = 0.3, ramp = 'radial', seed = 3 }) => {
  const cols = Math.max(2, Math.floor(w / step));
  const rows = Math.max(2, Math.floor(h / step));
  return (
    <g opacity={opacity}>
      {Array.from({ length: cols * rows }).map((_, k) => {
        const c = k % cols;
        const r = Math.floor(k / cols);
        const u = c / (cols - 1);
        const v = r / (rows - 1);
        const dist = Math.hypot(u - 0.5, v - 0.5) * 1.42;
        const k2 = ramp === 'radial' ? 1 - dist : ramp === 'linear' ? 1 - v : 1;
        const rr = 0.5 + 2.4 * clamp01(k2) * (0.6 + 0.4 * jitter(c + seed, r));
        if (rr < 0.7) return null;
        return <circle key={k} cx={x + step * c} cy={y + step * r} r={rr} fill={color} />;
      })}
    </g>
  );
};

/** fine engraved hatch, for brass and metal blocks. */
export const Hatch: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  step?: number;
  angle?: number;
  color: string;
  opacity?: number;
  width?: number;
}> = ({ x, y, w, h, step = 6, angle = 34, color, opacity = 0.16, width = 1 }) => {
  const n = Math.ceil((w + h) / step);
  return (
    <g opacity={opacity} transform={`rotate(${angle} ${x + w / 2} ${y + h / 2})`}>
      {Array.from({ length: n }).map((_, k) => (
        <line key={k} x1={x - h + k * step} y1={y - h} x2={x - h + k * step} y2={y + h * 2} stroke={color} strokeWidth={width} />
      ))}
    </g>
  );
};

/** hand-drawn plate border with a slight wobble. */
export const InkEdge: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  opacity?: number;
  seed?: number;
  width?: number;
  progress?: number;
}> = ({ x, y, w, h, color, opacity = 0.5, seed = 5, width = 1.2, progress = 1 }) => {
  const p = easeOutCubic(clamp01(progress));
  const pts: [number, number][] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) pts.push([x + (w * i) / steps, y + (jitter(i, seed) - 0.5) * 2.2]);
  for (let i = 0; i <= steps; i++) pts.push([x + w + (jitter(i, seed + 1) - 0.5) * 2.2, y + (h * i) / steps]);
  for (let i = 0; i <= steps; i++) pts.push([x + w - (w * i) / steps, y + h + (jitter(i, seed + 2) - 0.5) * 2.2]);
  for (let i = 0; i <= steps; i++) pts.push([x - (jitter(i, seed + 3) - 0.5) * 2.2, y + h - (h * i) / steps]);
  const total = 4 * steps;
  const shown = Math.max(1, Math.floor(total * p));
  const d = pts.slice(0, shown).map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ');
  return <path d={d} fill="none" stroke={color} strokeWidth={width} opacity={opacity} strokeLinejoin="round" />;
};

/** registration crosses, the way a print plate is aligned. */
export const Registration: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const p = easeOutCubic(prog(t, 0.25, 1.1));
  const arms: [number, number][] = [
    [58, 150],
    [1382, 150],
    [58, 1906],
    [1382, 1906],
  ];
  return (
    <g opacity={0.34 * p}>
      {arms.map(([cx, cy], k) => (
        <g key={k} stroke={color} strokeWidth={1}>
          <circle cx={cx} cy={cy} r={7} fill="none" />
          <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} />
          <line x1={cx} y1={cy - 12} x2={cx} y2={cy + 12} />
        </g>
      ))}
    </g>
  );
};

/** near-camera dust: bigger, softer, slower than the mid-field motes. */
export const DustFore: React.FC<{ t: number; count?: number; seed?: number; color?: string }> = ({
  t,
  count = 14,
  seed = 21,
  color = 'rgba(246,238,220,0.5)',
}) => (
  <g>
    {Array.from({ length: count }).map((_, i) => {
      const x0 = hash(i + seed, 3) * 1440;
      const y0 = hash(i + seed, 4) * 2560;
      const drift = 8 + hash(i + seed, 5) * 22;
      const r = 1.6 + hash(i + seed, 6) * 4.6;
      const y = (y0 - t * drift * 2.2 + 2560 * 4) % 2560;
      const x = x0 + Math.sin(t * 0.22 + i) * 26;
      return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={0.16 + hash(i + seed, 7) * 0.34} />;
    })}
  </g>
);

/** chapter transition: a plate shutter that opens over the first half second. */
export const Shutter: React.FC<{ t: number; dur: number; color: string }> = ({ t, dur, color }) => {
  const inP = easeInOutCubic(prog(t, 0.0, 0.55));
  const outP = easeInOutCubic(prog(t, dur - 0.45, dur));
  const a = 1 - inP;
  if (a <= 0.001 && outP <= 0.001) return null;
  return (
    <g opacity={Math.max(a, outP) * 0.9}>
      <rect x={0} y={0} width={1440} height={2560} fill="#050406" />
      <rect x={0} y={lerp(1280, 0, inP)} width={1440} height={3} fill={color} opacity={0.5} />
      <rect x={0} y={lerp(1280, 2560, 1 - outP)} width={1440} height={3} fill={color} opacity={0.35} />
    </g>
  );
};
