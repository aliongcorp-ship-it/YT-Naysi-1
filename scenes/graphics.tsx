import React, { useMemo } from 'react';
import { IDENTITY, clamp01, easeOutCubic, hash, lerp } from './script';
import { fbm } from './kit';

// ============================================================================
// graphics.tsx — the instrument shelf.
// Every object in this film is drawn with vector math: no bitmaps, no 3D,
// no generated imagery. Surfaces are built from gradients, noise fields and
// hand-placed tick systems so they survive a 2K crop at 90 fps.
// ============================================================================

// ---------------------------------------------------------------- star field
export const StarField: React.FC<{
  count?: number;
  seed?: number;
  t: number;
  width?: number;
  height?: number;
  opacity?: number;
  tintA?: string;
  tintB?: string;
  band?: boolean;
}> = ({ count = 220, seed = 5, t, width = 1440, height = 2560, opacity = 0.85, tintA = '#DCE6F2', tintB = '#F3D9B0', band = false }) => {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const bandBias = band ? hash(i, seed, 9) * 0.55 + 0.22 : hash(i, seed, 2);
        return {
          x: hash(i, seed, 1) * width,
          y: bandBias * height * (band ? 0.62 : 1) + (band ? height * 0.1 : 0),
          r: 0.6 + Math.pow(hash(i, seed, 3), 2.2) * 2.6,
          o: 0.16 + hash(i, seed, 4) * 0.78,
          warm: hash(i, seed, 7) > 0.72,
          ph: hash(i, seed, 5) * 6.283,
          sp: 0.45 + hash(i, seed, 6) * 1.9,
        };
      }),
    [count, seed, width, height, band],
  );
  return (
    <g opacity={opacity}>
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={s.warm ? tintB : tintA}
          opacity={s.o * (0.55 + 0.45 * Math.sin(t * s.sp + s.ph))}
        />
      ))}
    </g>
  );
};

export const MilkyWay: React.FC<{ t: number; angle?: number; opacity?: number }> = ({ t, angle = -22, opacity = 0.5 }) => {
  const clouds = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        x: 200 + hash(i, 41) * 1100,
        y: 500 + hash(i, 42) * 1400,
        rx: 30 + hash(i, 43) * 140,
        ry: 14 + hash(i, 44) * 50,
        o: 0.015 + hash(i, 45) * 0.05,
      })),
    [],
  );
  return (
    <g opacity={opacity} transform={`rotate(${angle} 720 1280)`}>
      <ellipse cx={720} cy={1180} rx={520} ry={760} fill="url(#mw-glow)" />
      <defs>
        <radialGradient id="mw-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(206,220,238,0.20)" />
          <stop offset="55%" stopColor="rgba(180,196,220,0.07)" />
          <stop offset="100%" stopColor="rgba(160,180,210,0)" />
        </radialGradient>
      </defs>
      {clouds.map((c, i) => (
        <ellipse key={i} cx={c.x} cy={c.y + Math.sin(t * 0.2 + i) * 4} rx={c.rx} ry={c.ry} fill="#D7E3F2" opacity={c.o} />
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- the sun
const sunKey = (cx: number, cy: number, r: number) => `sun-${Math.round(cx)}-${Math.round(cy)}-${Math.round(r)}`;

export const SunCore: React.FC<{
  cx: number;
  cy: number;
  r: number;
  t: number;
  alive?: number;
  hot?: string;
  mid?: string;
  edge?: string;
  cores?: number;
  spots?: number;
  limb?: number;
  flare?: number;
}> = ({ cx, cy, r, t, alive = 1, hot = '#FFF7E2', mid = '#F7C258', edge = '#A9481B', cores = 130, spots = 7, limb = 1, flare = 0 }) => {
  const id = sunKey(cx, cy, r);
  const on = clamp01(alive);
  const grains = useMemo(
    () =>
      Array.from({ length: cores }, (_, i) => {
        const a = hash(i, 71) * Math.PI * 2;
        const rr = Math.sqrt(hash(i, 72)) * r * 0.95;
        return {
          x: cx + Math.cos(a) * rr,
          y: cy + Math.sin(a) * rr,
          s: (0.0055 + hash(i, 73) * 0.017) * r,
          o: 0.09 + hash(i, 74) * 0.3,
          ph: hash(i, 75) * 6.283,
          sp: 0.5 + hash(i, 76) * 2.4,
          warm: hash(i, 77) > 0.55,
        };
      }),
    [cx, cy, r, cores],
  );
  const sunspots = useMemo(
    () =>
      Array.from({ length: spots }, (_, i) => {
        const a = hash(i, 81, 3) * Math.PI * 2;
        const rr = Math.sqrt(hash(i, 82, 3)) * r * 0.72;
        return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, s: (0.05 + hash(i, 83, 3) * 0.1) * r };
      }),
    [cx, cy, r, spots],
  );
  return (
    <g opacity={on}>
      <defs>
        <radialGradient id={`${id}-body`} cx="40%" cy="36%" r="66%">
          <stop offset="0%" stopColor={hot} />
          <stop offset="34%" stopColor={mid} />
          <stop offset="72%" stopColor={edge} />
          <stop offset="100%" stopColor="#4E1606" />
        </radialGradient>
        <radialGradient id={`${id}-limb`} cx="50%" cy="50%" r="50%">
          <stop offset="58%" stopColor="rgba(0,0,0,0)" />
          <stop offset="86%" stopColor="rgba(46,10,0,0.30)" />
          <stop offset="100%" stopColor="rgba(26,5,0,0.66)" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="46%" stopColor="rgba(255,186,88,0.34)" />
          <stop offset="70%" stopColor="rgba(255,142,54,0.11)" />
          <stop offset="100%" stopColor="rgba(255,120,40,0)" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="42%" stopColor="rgba(222,234,246,0.18)" />
          <stop offset="74%" stopColor="rgba(210,224,240,0.05)" />
          <stop offset="100%" stopColor="rgba(200,216,236,0)" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r * 2.05} fill={`url(#${id}-halo)`} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-body)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {grains.map((g, i) => (
          <ellipse
            key={i}
            cx={g.x + Math.sin(t * g.sp + g.ph) * r * 0.005}
            cy={g.y + Math.cos(t * g.sp * 0.85 + g.ph) * r * 0.005}
            rx={g.s}
            ry={g.s * 0.82}
            fill={g.warm ? '#FFEFC6' : '#6B2405'}
            opacity={g.o * (0.72 + 0.28 * Math.sin(t * g.sp * 1.6 + g.ph))}
          />
        ))}
        {sunspots.map((s, i) => (
          <g key={i} opacity={0.34}>
            <ellipse cx={s.x} cy={s.y} rx={s.s} ry={s.s * 0.72} fill="#3D1102" opacity={0.72} />
            <ellipse cx={s.x} cy={s.y} rx={s.s * 0.55} ry={s.s * 0.4} fill="#1C0600" />
          </g>
        ))}
        <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-limb)`} opacity={limb} />
        {flare > 0 && (
          <ellipse cx={cx + r * 0.42} cy={cy - r * 0.46} rx={r * 0.34 * flare} ry={r * 0.2 * flare} fill="#FFF3D2" opacity={0.3 * flare} />
        )}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,222,166,0.34)" strokeWidth={1.4} />
    </g>
  );
};

export const Corona4K: React.FC<{
  cx: number;
  cy: number;
  r: number;
  t: number;
  rays?: number;
  strength?: number;
  color?: string;
}> = ({ cx, cy, r, t, rays = 96, strength = 1, color = '#FFB463' }) => {
  const items = useMemo(
    () =>
      Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2 + hash(i, 91) * 0.05;
        const len = r * (0.1 + Math.pow(hash(i, 92), 1.6) * 0.85);
        return { a, len, w: 0.5 + hash(i, 93) * 2.6, o: 0.04 + hash(i, 94) * 0.19, ph: hash(i, 95) * 6.283 };
      }),
    [r, rays],
  );
  return (
    <g opacity={strength}>
      {items.map((it, i) => {
        const a = it.a + t * 0.03 * (i % 4 === 0 ? 1.6 : 1);
        const wobble = Math.sin(t * 0.9 + it.ph) * 0.02;
        const x1 = cx + Math.cos(a + wobble) * r * 1.005;
        const y1 = cy + Math.sin(a + wobble) * r * 1.005;
        const x2 = cx + Math.cos(a) * (r + it.len);
        const y2 = cy + Math.sin(a) * (r + it.len);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={it.w}
            opacity={it.o * (0.6 + 0.4 * Math.sin(t * 1.3 + it.ph))} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

export const Prominence: React.FC<{ cx: number; cy: number; r: number; angle: number; height: number; t: number; color?: string; phase?: number }> = ({
  cx,
  cy,
  r,
  angle,
  height,
  t,
  color = '#FF8A4A',
  phase = 0,
}) => {
  const pulse = 0.78 + 0.22 * Math.sin(t * 1.1 + phase);
  const sway = Math.sin(t * 0.7 + phase) * 0.05;
  const p0 = [cx + Math.cos(angle - 0.2) * r * 0.985, cy + Math.sin(angle - 0.2) * r * 0.985];
  const p1 = [cx + Math.cos(angle + 0.2) * r * 0.985, cy + Math.sin(angle + 0.2) * r * 0.985];
  const tipR = r + height * pulse;
  const tip = [cx + Math.cos(angle + sway) * tipR, cy + Math.sin(angle + sway) * tipR];
  const c0 = [cx + Math.cos(angle - 0.13) * (r + height * 0.62), cy + Math.sin(angle - 0.13) * (r + height * 0.62)];
  const c1 = [cx + Math.cos(angle + 0.13) * (r + height * 0.62), cy + Math.sin(angle + 0.13) * (r + height * 0.62)];
  const mid = [cx + Math.cos(angle + sway) * (r + height * 0.55), cy + Math.sin(angle + sway) * (r + height * 0.55)];
  return (
    <g opacity={0.9}>
      <path d={`M ${p0[0]} ${p0[1]} Q ${c0[0]} ${c0[1]} ${tip[0]} ${tip[1]} Q ${c1[0]} ${c1[1]} ${p1[0]} ${p1[1]} Z`} fill={color} opacity={0.26} />
      <path d={`M ${p0[0]} ${p0[1]} Q ${c0[0]} ${c0[1]} ${tip[0]} ${tip[1]} Q ${c1[0]} ${c1[1]} ${p1[0]} ${p1[1]} Z`} fill={color} opacity={0.12} stroke={color} strokeWidth={1.6} />
      <path d={`M ${(p0[0] + p1[0]) / 2} ${(p0[1] + p1[1]) / 2} Q ${mid[0]} ${mid[1]} ${(tip[0] + mid[0]) / 2} ${(tip[1] + mid[1]) / 2}`} fill="none" stroke="#FFE9BE" strokeWidth={2} opacity={0.45} strokeLinecap="round" />
    </g>
  );
};

// ---------------------------------------------------------------- light
export const PhotonPacket: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  head: number;
  color?: string;
  trail?: number;
  width?: number;
}> = ({ x1, y1, x2, y2, head, color = '#FFD79A', trail = 260, width = 3 }) => {
  const hx = lerp(x1, x2, clamp01(head));
  const hy = lerp(y1, y2, clamp01(head));
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const tx = hx - Math.cos(ang) * trail;
  const ty = hy - Math.sin(ang) * trail;
  return (
    <g>
      <line x1={tx} y1={ty} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={0.55} />
      <circle cx={hx} cy={hy} r={9} fill="#FFF3D4" opacity={0.95} />
      <circle cx={hx} cy={hy} r={24} fill={color} opacity={0.22} />
      <circle cx={hx} cy={hy} r={44} fill={color} opacity={0.08} />
    </g>
  );
};

// ---------------------------------------------------------------- earth & moon
export const EarthGlobe: React.FC<{
  cx: number;
  cy: number;
  r: number;
  t?: number;
  rotate?: number;
  terminator?: number;
  atmosphere?: number;
  continents?: number;
}> = ({ cx, cy, r, t = 0, rotate = 0, terminator = 0.5, atmosphere = 1, continents = 46 }) => {
  const id = `earth-${Math.round(cx)}-${Math.round(cy)}-${Math.round(r)}`;
  const land = useMemo(
    () =>
      Array.from({ length: continents }, (_, i) => {
        const a = hash(i, 61) * Math.PI * 2;
        const rr = Math.sqrt(hash(i, 62)) * r * 0.88;
        return {
          x: Math.cos(a) * rr,
          y: Math.sin(a) * rr * 0.94,
          rx: r * (0.06 + hash(i, 63) * 0.2),
          ry: r * (0.04 + hash(i, 64) * 0.16),
          rot: hash(i, 65) * 180,
        };
      }),
    [r, continents],
  );
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-ocean`} cx="34%" cy="30%" r="76%">
          <stop offset="0%" stopColor="#9FD0E6" />
          <stop offset="30%" stopColor="#4B87AE" />
          <stop offset="66%" stopColor="#1E4159" />
          <stop offset="100%" stopColor="#07141C" />
        </radialGradient>
        <radialGradient id={`${id}-rim`} cx="50%" cy="50%" r="50%">
          <stop offset="86%" stopColor="rgba(150,205,235,0)" />
          <stop offset="97%" stopColor="rgba(170,220,245,0.55)" />
          <stop offset="100%" stopColor="rgba(190,235,255,0.15)" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="46%" stopColor="rgba(222,234,246,0.16)" />
          <stop offset="76%" stopColor="rgba(210,224,240,0.05)" />
          <stop offset="100%" stopColor="rgba(200,216,236,0)" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r * 3.1} fill="rgba(120,180,220,0.10)" opacity={0.7 * atmosphere} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-ocean)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {land.map((l, i) => (
          <ellipse key={i} cx={cx + l.x + Math.sin(rotate) * r * 0.1} cy={cy + l.y} rx={l.rx} ry={l.ry}
            fill={i % 3 === 0 ? '#6E7F4A' : '#8A7A52'} opacity={0.5} transform={`rotate(${l.rot} ${cx + l.x} ${cy + l.y})`} />
        ))}
        <ellipse cx={cx - r * 0.2} cy={cy - r * 0.3} rx={r * 0.5} ry={r * 0.22} fill="#FFFFFF" opacity={0.1} />
        <ellipse cx={cx + r * 0.3} cy={cy + r * 0.4} rx={r * 0.4} ry={r * 0.16} fill="#FFFFFF" opacity={0.07} />
        {/* terminator */}
        <rect x={cx - r + r * 2 * terminator} y={cy - r} width={r * 2} height={r * 2} fill="rgba(2,6,10,0.66)" />
      </g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-rim)`} />
    </g>
  );
};

export const MoonDisc: React.FC<{
  cx: number;
  cy: number;
  r: number;
  t?: number;
  phase?: number;
  opacity?: number;
  tint?: string;
}> = ({ cx, cy, r, t = 0, phase = 1, opacity = 1, tint = '#D9DEE4' }) => {
  const id = `moon-${Math.round(cx)}-${Math.round(cy)}-${Math.round(r)}`;
  const maria = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: cx + (hash(i, 51) - 0.5) * r * 1.6,
        y: cy + (hash(i, 52) - 0.5) * r * 1.6,
        rx: r * (0.08 + hash(i, 53) * 0.24),
        ry: r * (0.06 + hash(i, 54) * 0.2),
      })),
    [cx, cy, r],
  );
  return (
    <g opacity={opacity}>
      <defs>
        <radialGradient id={`${id}-body`} cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#F4F6F8" />
          <stop offset="62%" stopColor={tint} />
          <stop offset="100%" stopColor="#8A939E" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="46%" stopColor="rgba(222,234,246,0.16)" />
          <stop offset="76%" stopColor="rgba(210,224,240,0.05)" />
          <stop offset="100%" stopColor="rgba(200,216,236,0)" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r * 1.5} fill={`url(#${id}-halo)`} opacity={0.85} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-body)`} />
      <g clipPath={`url(#${id}-clip)`} opacity={0.5}>
        {maria.map((m, i) => (
          <ellipse key={i} cx={m.x} cy={m.y} rx={m.rx} ry={m.ry} fill="#7C8592" opacity={0.3 + hash(i, 55) * 0.3} />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <circle key={`c${i}`} cx={cx + (hash(i, 56) - 0.5) * r * 1.7} cy={cy + (hash(i, 57) - 0.5) * r * 1.7}
            r={r * (0.02 + hash(i, 58) * 0.05)} fill="none" stroke="#6E7885" strokeWidth={1.2} opacity={0.5} />
        ))}
        <rect x={cx - r + r * 2 * clamp01(phase)} y={cy - r} width={r * 2} height={r * 2} fill="rgba(3,5,10,0.94)" />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(230,240,250,0.25)" strokeWidth={1.2} />
      <ellipse cx={cx} cy={cy + r * 0.2} rx={r * 0.9} ry={r * 0.06} fill="rgba(220,235,250,0.08)" transform={`rotate(-18 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={r * 0.06} opacity={0.4 + 0.1 * Math.sin(t)} />
    </g>
  );
};

// ---------------------------------------------------------------- small parts
export const TickRule: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  major: number;
  minor: number;
  color?: string;
  progress?: number;
  labels?: readonly string[];
  labelSize?: number;
  side?: 1 | -1;
}> = ({ x1, y1, x2, y2, major, minor, color = 'rgba(236,224,198,0.55)', progress = 1, labels, labelSize = 15, side = 1 }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const p = clamp01(progress);
  return (
    <g opacity={easeOutCubic(p)}>
      <line x1={x1} y1={y1} x2={lerp(x1, x2, p)} y2={lerp(y1, y2, p)} stroke={color} strokeWidth={1.6} />
      {Array.from({ length: major + 1 }).map((_, i) => {
        const d = (len * i) / major;
        if (d > len * p) return null;
        const cx = x1 + Math.cos(ang) * d;
        const cy = y1 + Math.sin(ang) * d;
        const nx = Math.cos(ang + Math.PI / 2) * 14 * side;
        const ny = Math.sin(ang + Math.PI / 2) * 14 * side;
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={cx + nx} y2={cy + ny} stroke={color} strokeWidth={2} />
            {labels && labels[i] && (
              <text x={cx + nx * 1.9} y={cy + ny * 1.9 + labelSize * 0.34} fill={color} fontFamily={IDENTITY.fontMono}
                fontSize={labelSize} letterSpacing="0.1em" textAnchor="middle">
                {labels[i]}
              </text>
            )}
            {Array.from({ length: minor - 1 }).map((_, k) => {
              const dd = d + (len / major) * ((k + 1) / minor);
              if (dd > len * p) return null;
              const mx = x1 + Math.cos(ang) * dd;
              const my = y1 + Math.sin(ang) * dd;
              return <line key={k} x1={mx} y1={my} x2={mx + nx * 0.42} y2={my + ny * 0.42} stroke={color} strokeWidth={1} opacity={0.5} />;
            })}
          </g>
        );
      })}
    </g>
  );
};

export const Brackets: React.FC<{ x: number; y: number; w: number; h: number; color: string; size?: number }> = ({
  x,
  y,
  w,
  h,
  color,
  size = 26,
}) => (
  <g stroke={color} strokeWidth={1.6} fill="none" opacity={0.8}>
    <path d={`M ${x} ${y + size} L ${x} ${y} L ${x + size} ${y}`} />
    <path d={`M ${x + w - size} ${y} L ${x + w} ${y} L ${x + w} ${y + size}`} />
    <path d={`M ${x + w} ${y + h - size} L ${x + w} ${y + h} L ${x + w - size} ${y + h}`} />
    <path d={`M ${x + size} ${y + h} L ${x} ${y + h} L ${x} ${y + h - size}`} />
  </g>
);

export const NoiseWash: React.FC<{ x: number; y: number; w: number; h: number; seed?: number; color?: string; opacity?: number; cells?: number }> = ({
  x,
  y,
  w,
  h,
  seed = 1,
  color = 'rgba(255,255,255,0.05)',
  opacity = 1,
  cells = 90,
}) => {
  const blobs = useMemo(
    () =>
      Array.from({ length: cells }, (_, i) => {
        const gx = hash(i, seed, 21);
        const gy = hash(i, seed, 22);
        const n = fbm(gx * 4, gy * 4, 3);
        return { x: x + gx * w, y: y + gy * h, r: (0.02 + n * 0.09) * Math.min(w, h), o: 0.5 + n };
      }),
    [x, y, w, h, seed, cells],
  );
  return (
    <g opacity={opacity}>
      {blobs.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={color} opacity={0.06 * b.o} />
      ))}
    </g>
  );
};

export const BigNumber: React.FC<{
  x: number;
  y: number;
  value: string;
  size: number;
  color: string;
  family?: string;
  anchor?: 'start' | 'middle' | 'end';
  weight?: number;
  opacity?: number;
  tracking?: string;
}> = ({ x, y, value, size, color, family, anchor = 'start', weight = 400, opacity = 1, tracking = '-0.02em' }) => (
  <text x={x} y={y} fill={color} fontFamily={family ?? IDENTITY.fontDisplay} fontSize={size} fontWeight={weight}
    letterSpacing={tracking} textAnchor={anchor} opacity={opacity}>
    {value}
  </text>
);
