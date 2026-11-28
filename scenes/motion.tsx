// ============================================================================
// motion — the timing vocabulary for the plates.
//
// Everything is a pure function of chapter-local seconds, so a frame can be
// rendered in isolation and the motion never drifts from the narration.
// ============================================================================
import React from 'react';
import { clamp01, easeOutCubic, lerp } from './script';

export const easeOutQuint = (p: number) => 1 - Math.pow(1 - clamp01(p), 5);

export const easeInOutCubic = (p: number) => {
  const t = clamp01(p);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const easeOutExpo = (p: number) => (clamp01(p) >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp01(p)));

export const damped = (p: number, k = 7, w = 9) => {
  const t = clamp01(p);
  return 1 - Math.exp(-k * t) * Math.cos(w * t);
};

/** progress for item `i` in a staggered run that starts at `start`. */
export const stagger = (t: number, i: number, start = 0, step = 0.09, dur = 0.62) =>
  clamp01((t - start - i * step) / dur);

/** stable pseudo-random in [0,1) from two integers. */
export const jitter = (a: number, b: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ---------------------------------------------------------------------------
// entrance primitives
// ---------------------------------------------------------------------------

export const Rise: React.FC<{
  p: number;
  y?: number;
  x?: number;
  scale?: number;
  children: React.ReactNode;
  origin?: [number, number];
}> = ({ p, y = 22, x = 0, scale = 1, children, origin }) => {
  const e = easeOutQuint(p);
  const s = lerp(scale, 1, e);
  const tr = `translate(${x * (1 - e)} ${y * (1 - e)})`;
  const sc = origin ? ` translate(${origin[0]} ${origin[1]}) scale(${s}) translate(${-origin[0]} ${-origin[1]})` : '';
  return (
    <g opacity={easeOutCubic(p)} transform={tr + sc}>
      {children}
    </g>
  );
};

/** left-to-right reveal used for headlines, figures and rules. */
export const Wipe: React.FC<{
  id: string;
  p: number;
  x: number;
  y: number;
  w: number;
  h: number;
  dir?: 'ltr' | 'rtl' | 'ttb' | 'btt';
  children: React.ReactNode;
  soft?: number;
}> = ({ id, p, x, y, w, h, dir = 'ltr', children, soft = 0 }) => {
  const e = easeInOutCubic(p);
  const cw = dir === 'ltr' || dir === 'rtl' ? w * e : w;
  const ch = dir === 'ttb' || dir === 'btt' ? h * e : h;
  const cx = dir === 'rtl' ? x + w - cw : x;
  const cy = dir === 'btt' ? y + h - ch : y;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={cx - soft} y={cy - soft} width={cw + soft * 2} height={ch + soft * 2} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </g>
  );
};

/** path that draws itself. */
export const Draw: React.FC<{
  d: string;
  p: number;
  color: string;
  width?: number;
  dash?: number;
  cap?: 'round' | 'butt';
  opacity?: number;
}> = ({ d, p, color: _color, width = 2, dash = 1200, cap = 'round', opacity = 1 }) => (
  <path
    d={d}
    fill="none"
    stroke={_color}
    strokeWidth={width}
    strokeLinecap={cap}
    strokeDasharray={dash}
    strokeDashoffset={dash * (1 - easeOutCubic(p))}
    opacity={opacity}
  />
);

/** horizontal highlight that sweeps once — brass, foil, wet ink. */
export const Sheen: React.FC<{
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
  color?: string;
  angle?: number;
}> = ({ id, x, y, w, h, p, color = 'rgba(255,244,220,0.55)', angle = 18 }) => {
  const e = easeInOutCubic(p);
  const travel = w * 1.6;
  const cx = x - w * 0.4 + travel * e;
  return (
    <g opacity={e > 0.02 && e < 0.98 ? 1 : 0}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect
        x={cx}
        y={y - h * 0.3}
        width={w * 0.28}
        height={h * 1.6}
        fill={`url(#${id})`}
        transform={`rotate(${angle} ${cx} ${y + h / 2})`}
      />
    </g>
  );
};

/** soft radial bloom that breathes. */
export const Bloom: React.FC<{
  id: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
  t: number;
  speed?: number;
  base?: number;
  amp?: number;
}> = ({ id, cx, cy, r, color, t, speed = 0.7, base = 0.75, amp = 0.25 }) => {
  const k = base + amp * Math.sin(t * speed * Math.PI);
  return (
    <g opacity={clamp01(k)}>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} />
          <stop offset="55%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </g>
  );
};

/** ring that expands and fades, for pulses and impacts. */
export const PulseRing: React.FC<{
  cx: number;
  cy: number;
  r0: number;
  r1: number;
  p: number;
  color: string;
  width?: number;
}> = ({ cx, cy, r0, r1, p, color, width = 1.6 }) => {
  const e = easeOutCubic(p);
  return <circle cx={cx} cy={cy} r={lerp(r0, r1, e)} fill="none" stroke={color} strokeWidth={width} opacity={(1 - e) * 0.85} />;
};

/** integer/float tween that keeps Indonesian grouping (dots, comma decimals). */
export const countText = (target: number, p: number, decimals = 0) => {
  const v = target * easeOutCubic(clamp01(p));
  const fixed = v.toFixed(decimals);
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return frac ? `${grouped},${frac}` : grouped;
};

/** letter-spaced headline that settles as it wipes in. */
export const KineticHeadline: React.FC<{
  id: string;
  x: number;
  y: number;
  size: number;
  text: string;
  color: string;
  family: string;
  p: number;
  width: number;
  weight?: number;
  trackingFrom?: number;
  trackingTo?: number;
}> = ({ id, x, y, size, text, color, family, p, width, weight = 500, trackingFrom = 0.075, trackingTo = 0.014 }) => {
  const e = easeOutQuint(p);
  return (
    <Wipe id={id} p={clamp01(p * 1.15)} x={x - 8} y={y - size * 1.02} w={width + 16} h={size * 1.32} soft={6}>
      <text
        x={x}
        y={y}
        fill={color}
        fontFamily={family}
        fontSize={size}
        fontWeight={weight}
        letterSpacing={`${lerp(trackingFrom, trackingTo, palm(e))}em`}
      >
        {text}
      </text>
    </Wipe>
  );
};

const palm = (e: number) => clamp01(e);
