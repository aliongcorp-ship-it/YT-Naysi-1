import React, { useMemo } from 'react';
import { IDENTITY, clamp01, easeOutCubic, prog } from './script';
import { hash2, lerp } from './kit';

// ============================================================================
// ASTRONOMY OBJECT LIBRARY — everything drawn procedurally, no bitmaps
// ============================================================================

export const StarField: React.FC<{
  count?: number;
  seed?: number;
  t: number;
  opacity?: number;
  tint?: string;
  width?: number;
  height?: number;
}> = ({ count = 180, seed = 7, t, opacity = 0.8, tint = '#DCE6F2', width = 1440, height = 2560 }) => {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: hash2(i, seed, 1) * width,
        y: hash2(i, seed, 2) * height,
        r: 0.7 + hash2(i, seed, 3) * 2.1,
        o: 0.18 + hash2(i, seed, 4) * 0.72,
        ph: hash2(i, seed, 5) * 6.283,
        sp: 0.5 + hash2(i, seed, 6) * 1.6,
      })),
    [count, seed, width, height],
  );
  return (
    <g opacity={opacity}>
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={tint}
          opacity={s.o * (0.62 + 0.38 * Math.sin(t * s.sp + s.ph))}
        />
      ))}
    </g>
  );
};

const sunId = (cx: number, cy: number, r: number) => `sun-${Math.round(cx)}-${Math.round(cy)}-${Math.round(r)}`;

export const SunDisc: React.FC<{
  cx: number;
  cy: number;
  r: number;
  t: number;
  alive?: number;
  hot?: string;
  mid?: string;
  edge?: string;
  glow?: number;
  grains?: number;
}> = ({ cx, cy, r, t, alive = 1, hot = '#FFF6DE', mid = '#F6BE55', edge = '#A8481C', glow = 1, grains = 110 }) => {
  const id = sunId(cx, cy, r);
  const flecks = useMemo(
    () =>
      Array.from({ length: grains }, (_, i) => {
        const a = hash2(i, 11) * Math.PI * 2;
        const rr = Math.sqrt(hash2(i, 12)) * r * 0.94;
        return {
          x: cx + Math.cos(a) * rr,
          y: cy + Math.sin(a) * rr,
          s: (0.02 + hash2(i, 13) * 0.05) * r,
          o: 0.06 + hash2(i, 14) * 0.16,
          ph: hash2(i, 15) * 6.283,
          sp: 0.6 + hash2(i, 16) * 2.2,
        };
      }),
    [cx, cy, r, grains],
  );
  const on = clamp01(alive);
  return (
    <g opacity={on}>
      <defs>
        <radialGradient id={`${id}-body`} cx="42%" cy="38%" r="62%">
          <stop offset="0%" stopColor={hot} />
          <stop offset="42%" stopColor={mid} />
          <stop offset="82%" stopColor={edge} />
          <stop offset="100%" stopColor="#5E1E08" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="52%" stopColor="rgba(255,176,74,0.40)" />
          <stop offset="74%" stopColor="rgba(255,138,52,0.14)" />
          <stop offset="100%" stopColor="rgba(255,120,40,0)" />
        </radialGradient>
        <radialGradient id={`${id}-limb`} cx="50%" cy="50%" r="50%">
          <stop offset="62%" stopColor="rgba(0,0,0,0)" />
          <stop offset="88%" stopColor="rgba(38,8,0,0.34)" />
          <stop offset="100%" stopColor="rgba(24,4,0,0.62)" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r * 2.5} fill={`url(#${id}-halo)`} opacity={glow} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-body)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {flecks.map((f, i) => (
          <ellipse
            key={i}
            cx={f.x + Math.sin(t * f.sp + f.ph) * r * 0.012}
            cy={f.y + Math.cos(t * f.sp * 0.8 + f.ph) * r * 0.012}
            rx={f.s}
            ry={f.s * 0.78}
            fill={i % 5 === 0 ? '#FFE7B4' : '#8C3208'}
            opacity={f.o * (0.55 + 0.45 * Math.sin(t * f.sp * 1.7 + f.ph))}
          />
        ))}
        <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-limb)`} />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,214,150,0.35)" strokeWidth={1.4} />
    </g>
  );
};

export const Corona: React.FC<{
  cx: number;
  cy: number;
  r: number;
  t: number;
  color?: string;
  rays?: number;
  strength?: number;
}> = ({ cx, cy, r, t, color = '#FFB463', rays = 72, strength = 1 }) => {
  const items = useMemo(
    () =>
      Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2 + hash2(i, 3) * 0.06;
        const len = r * (0.16 + hash2(i, 4) * 0.62);
        return { a, len, w: 0.6 + hash2(i, 5) * 2.4, o: 0.05 + hash2(i, 6) * 0.2 };
      }),
    [r, rays],
  );
  const spin = t * 0.035;
  return (
    <g opacity={strength}>
      {items.map((it, i) => {
        const a = it.a + spin * (i % 3 === 0 ? 1.4 : 1);
        const x1 = cx + Math.cos(a) * r * 1.01;
        const y1 = cy + Math.sin(a) * r * 1.01;
        const x2 = cx + Math.cos(a) * (r + it.len);
        const y2 = cy + Math.sin(a) * (r + it.len);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={it.w}
            opacity={it.o * (0.7 + 0.3 * Math.sin(t * 1.4 + i))}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

export const GhostSun: React.FC<{ cx: number; cy: number; r: number; color?: string; t: number }> = ({
  cx,
  cy,
  r,
  color = '#8FB4C9',
  t,
}) => (
  <g opacity={0.55}>
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2} strokeDasharray="14 16" opacity={0.8} />
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={1} strokeDasharray="3 12"
      transform={`rotate(${t * 12} ${cx} ${cy})`} opacity={0.5} />
    <circle cx={cx} cy={cy} r={r * 0.18} fill={color} opacity={0.14} />
  </g>
);

export const OrbitRing: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color?: string;
  ticks?: number;
  t?: number;
  dash?: number;
  width?: number;
  opacity?: number;
  trailing?: number;
}> = ({ cx, cy, rx, ry, color = '#6E93A8', ticks = 72, t = 0, dash = 1, width = 1.6, opacity = 0.7, trailing = 0 }) => {
  const circ = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const marks = useMemo(
    () =>
      Array.from({ length: ticks }, (_, i) => {
        const a = (i / ticks) * Math.PI * 2;
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry;
        const nx = Math.cos(a) * 1;
        const ny = Math.sin(a) * (rx / ry) * 1;
        const n = Math.hypot(nx, ny) || 1;
        const long = i % 6 === 0;
        const l = long ? 16 : 8;
        return { x, y, dx: (nx / n) * l, dy: (ny / n) * l, long, o: long ? 0.65 : 0.3 };
      }),
    [cx, cy, rx, ry, ticks],
  );
  return (
    <g opacity={opacity}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth={width} opacity={0.5} />
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={color}
        strokeWidth={width + 1.2}
        strokeDasharray={`${circ * dash} ${circ}`}
        strokeDashoffset={0}
        opacity={0.95}
        transform={trailing ? `rotate(${trailing * 90} ${cx} ${cy})` : undefined}
      />
      {marks.map((m, i) => (
        <line key={i} x1={m.x} y1={m.y} x2={m.x + m.dx} y2={m.y + m.dy} stroke={color} strokeWidth={m.long ? 1.6 : 1} opacity={m.o} />
      ))}
      <circle cx={cx} cy={cy} r={2.5 + Math.sin(t * 2) * 0.6} fill={color} opacity={0.5} />
    </g>
  );
};

export const EarthDot: React.FC<{ cx: number; cy: number; r: number; t?: number; glow?: number; ghost?: boolean }> = ({
  cx,
  cy,
  r,
  t = 0,
  glow = 1,
  ghost = false,
}) => {
  const id = `earth-${Math.round(cx)}-${Math.round(cy)}-${Math.round(r)}`;
  return (
    <g opacity={ghost ? 0.4 : 1}>
      <defs>
        <radialGradient id={`${id}-g`} cx="36%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#BFDCEA" />
          <stop offset="38%" stopColor="#5E93B4" />
          <stop offset="72%" stopColor="#26485F" />
          <stop offset="100%" stopColor="#0B1922" />
        </radialGradient>
        <radialGradient id={`${id}-h`} cx="50%" cy="50%" r="50%">
          <stop offset="40%" stopColor="rgba(150,205,235,0.55)" />
          <stop offset="100%" stopColor="rgba(120,180,220,0)" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * 3.4} fill={`url(#${id}-h)`} opacity={0.5 * glow} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-g)`} />
      <path
        d={`M ${cx - r} ${cy + r * 0.18} a ${r} ${r} 0 0 0 ${r * 2} ${-r * 0.1}`}
        fill="none"
        stroke="rgba(190,230,245,0.35)"
        strokeWidth={Math.max(1, r * 0.06)}
        opacity={0.5 + 0.2 * Math.sin(t)}
      />
    </g>
  );
};

export const VectorArrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  width?: number;
  progress?: number;
  head?: number;
}> = ({ x1, y1, x2, y2, color = '#D9A441', width = 4, progress = 1, head = 26 }) => {
  const p = clamp01(progress);
  const ex = lerp(x1, x2, easeOutCubic(p));
  const ey = lerp(y1, y2, easeOutCubic(p));
  const ang = Math.atan2(ey - y1, ex - x1);
  return (
    <g opacity={clamp01(p * 2)}>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={width} strokeLinecap="round" />
      {p > 0.55 && (
        <g transform={`translate(${ex} ${ey}) rotate(${(ang * 180) / Math.PI})`}>
          <path d={`M 0 0 L ${-head} ${head * 0.52} L ${-head * 0.72} 0 L ${-head} ${-head * 0.52} Z`} fill={color} />
        </g>
      )}
    </g>
  );
};

export const PlateFrame: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  label?: string;
  sub?: string;
  no?: string;
  progress?: number;
}> = ({ x, y, w, h, color = 'rgba(233,222,200,0.5)', label, sub, no, progress = 1 }) => {
  const p = easeOutCubic(clamp01(progress));
  const corner = 46;
  const paths = [
    `M ${x} ${y + corner} L ${x} ${y} L ${x + corner} ${y}`,
    `M ${x + w - corner} ${y} L ${x + w} ${y} L ${x + w} ${y + corner}`,
    `M ${x + w} ${y + h - corner} L ${x + w} ${y + h} L ${x + w - corner} ${y + h}`,
    `M ${x + corner} ${y + h} L ${x} ${y + h} L ${x} ${y + h - corner}`,
  ];
  return (
    <g opacity={p}>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="square" />
      ))}
      {no && (
        <text x={x + 6} y={y - 26} fill={color} fontFamily={IDENTITY.fontMono} fontSize={18} letterSpacing="0.24em">
          {no}
        </text>
      )}
      {label && (
        <text
          x={x}
          y={y + h + 46}
          fill="rgba(238,228,208,0.86)"
          fontFamily={IDENTITY.fontMono}
          fontSize={22}
          letterSpacing="0.18em"
        >
          {label}
        </text>
      )}
      {sub && (
        <text
          x={x}
          y={y + h + 78}
          fill="rgba(238,228,208,0.5)"
          fontFamily={IDENTITY.fontMono}
          fontSize={17}
          letterSpacing="0.12em"
        >
          {sub}
        </text>
      )}
    </g>
  );
};

export const ThermoGauge: React.FC<{
  x: number;
  y: number;
  h: number;
  value: number;
  min: number;
  max: number;
  color?: string;
  cold?: string;
  t?: number;
}> = ({ x, y, h, value, min, max, color = '#8FB4C9', cold = '#3E7FA6', t = 0 }) => {
  const frac = clamp01((value - min) / (max - min));
  const bulbR = 42;
  const colW = 34;
  const ticks = Math.round((max - min) / 10);
  const levelY = y + h - frac * h;
  return (
    <g>
      <rect x={x - colW / 2} y={y} width={colW} height={h + bulbR * 0.6} rx={colW / 2} fill="rgba(8,12,16,0.72)"
        stroke="rgba(180,205,220,0.28)" strokeWidth={2} />
      <rect x={x - colW / 2 + 5} y={levelY} width={colW - 10} height={y + h - levelY + bulbR * 0.6} rx={(colW - 10) / 2} fill={cold} opacity={0.9} />
      <rect x={x - colW / 2 + 5} y={levelY} width={colW - 10} height={26} rx={12} fill={color} opacity={0.55 + 0.25 * Math.sin(t * 2)} />
      <circle cx={x} cy={y + h + bulbR * 0.6} r={bulbR} fill={cold} stroke="rgba(200,224,236,0.32)" strokeWidth={2} />
      <circle cx={x} cy={y + h + bulbR * 0.6} r={bulbR * 0.55} fill={color} opacity={0.4 + 0.2 * Math.sin(t * 2.2)} />
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const v = min + i * 10;
        const ty = y + h - ((v - min) / (max - min)) * h;
        const long = i % 2 === 0;
        return (
          <g key={i}>
            <line x1={x + colW / 2 + 8} y1={ty} x2={x + colW / 2 + (long ? 30 : 18)} y2={ty} stroke="rgba(208,226,236,0.45)" strokeWidth={long ? 2 : 1.2} />
            {long && (
              <text x={x + colW / 2 + 40} y={ty + 6} fill="rgba(208,226,236,0.55)" fontFamily={IDENTITY.fontMono} fontSize={16}>
                {v > 0 ? `+${v}` : v}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

export const OceanSection: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
  accent: string;
  iceProgress?: number;
  glow?: number;
}> = ({ x, y, w, h, t, accent, iceProgress = 1, glow = 1 }) => {
  const iceH = h * 0.16 * clamp01(iceProgress);
  const cracks = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const sx = x + hash2(i, 21) * w;
        const len = 40 + hash2(i, 22) * 180;
        const d = hash2(i, 23) * 0.5 + 0.5;
        return { d: `M ${sx} ${y + iceH * (0.2 + hash2(i, 24) * 0.7)} l ${len * 0.5} ${len * 0.24 * d} l ${len * 0.4} ${-len * 0.18}` };
      }),
    [x, y, w, iceH],
  );
  return (
    <g>
      <defs>
        <linearGradient id="ocean-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E2533" />
          <stop offset="55%" stopColor="#071822" />
          <stop offset="100%" stopColor="#04101A" />
        </linearGradient>
        <linearGradient id="ocean-ice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CFE6F0" />
          <stop offset="55%" stopColor="#9CC2D6" />
          <stop offset="100%" stopColor="#5B8AA3" />
        </linearGradient>
        <radialGradient id="ocean-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF9A45" />
          <stop offset="60%" stopColor="rgba(200,88,30,0.35)" />
          <stop offset="100%" stopColor="rgba(140,50,20,0)" />
        </radialGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill="url(#ocean-water)" />
      <rect x={x} y={y} width={w} height={iceH} fill="url(#ocean-ice)" opacity={0.96} />
      <g opacity={0.5}>
        {cracks.map((c, i) => (
          <path key={i} d={c.d} fill="none" stroke="rgba(240,252,255,0.7)" strokeWidth={1.3} opacity={0.4 + 0.2 * Math.sin(t * 1.5 + i)} />
        ))}
      </g>
      <rect x={x} y={y + iceH - 3} width={w} height={3} fill="rgba(235,248,255,0.85)" opacity={0.7} />
      <ellipse cx={x + w / 2} cy={y + h} rx={w * 0.42} ry={h * 0.24} fill="url(#ocean-core)" opacity={0.5 * glow * (0.8 + 0.2 * Math.sin(t * 1.1))} />
      <path
        d={`M ${x} ${y + h} L ${x} ${y + h - 26} Q ${x + w * 0.25} ${y + h - 54} ${x + w * 0.5} ${y + h - 30} T ${x + w} ${y + h - 22} L ${x + w} ${y + h} Z`}
        fill="#0A1A24"
        opacity={0.95}
      />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={accent} strokeWidth={1.2} opacity={0.35} />
    </g>
  );
};

// counting display number, tabular, mono-feel
export const Counter: React.FC<{
  x: number;
  y: number;
  from: number;
  to: number;
  localSec: number;
  startSec: number;
  durSec?: number;
  format?: (v: number) => string;
  size?: number;
  color?: string;
  family?: string;
  weight?: number;
  tracking?: string;
  anchor?: 'start' | 'middle' | 'end';
}> = ({
  x,
  y,
  from,
  to,
  localSec,
  startSec,
  durSec = 1.4,
  format = (v) => Math.round(v).toLocaleString('id-ID'),
  size = 120,
  color = '#F3E9D6',
  family,
  weight = 500,
  tracking = '-0.02em',
  anchor = 'start',
}) => {
  const p = easeOutCubic(prog(localSec, startSec, startSec + durSec));
  const v = lerp(from, to, p);
  return (
    <text
      x={x}
      y={y}
      fill={color}
      fontFamily={family ?? IDENTITY.fontDisplay}
      fontSize={size}
      fontWeight={weight}
      letterSpacing={tracking}
      textAnchor={anchor}
      opacity={clamp01(p * 2.2)}
    >
      {format(v)}
    </text>
  );
};
