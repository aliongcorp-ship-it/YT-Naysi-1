import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {C, FPS, H, W, clamp, lerp, depthColor, eOut} from '../theme';

/* ─────────────────────────────  noise  ────────────────────────────────── */
const hash = (x: number, y: number, s = 0) => {
  const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
};
export const noise2 = (x: number, y: number, s = 0) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s);
  const b = hash(xi + 1, yi, s);
  const c = hash(xi, yi + 1, s);
  const d = hash(xi + 1, yi + 1, s);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
};
export const fbm = (x: number, y: number, s = 0, oct = 4) => {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    v += a * noise2(x * f, y * f, s + i * 13.3);
    f *= 2.03;
    a *= 0.5;
  }
  return v;
};

/* ─────────────────────────  living background  ────────────────────────── */
// A slow, depth-aware water column: gradient + caustic god-rays + drifting motes.
export const WaterColumn: React.FC<{
  depth: number;
  intensity?: number;
  rays?: number;
  tint?: string;
  seed?: number;
}> = ({depth, intensity = 1, rays = 1, tint, seed = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const top = depthColor(Math.max(0, depth - 620));
  const bottom = depthColor(depth + 900);

  const motes = useMemo(
    () =>
      Array.from({length: 54}).map((_, i) => ({
        x: hash(i, 1, seed) * W,
        y: hash(i, 2, seed) * H,
        r: 1.2 + hash(i, 3, seed) * 4.6,
        s: 0.1 + hash(i, 4, seed) * 0.42,
        a: 0.08 + hash(i, 5, seed) * 0.34,
        w: hash(i, 6, seed) * 6.28,
      })),
    [seed]
  );

  return (
    <AbsoluteFill style={{background: C.void, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `linear-gradient(179deg, ${top} 0%, ${bottom} 68%, ${C.void} 100%)`}} />
      {/* converging light shafts, only near the surface */}
      {rays > 0
        ? Array.from({length: 9}).map((_, i) => {
            const p = i / 8;
            const x = -280 + p * W * 1.4 + Math.sin(t * 0.11 + i * 1.4) * 90;
            const wdt = 90 + hash(i, 7, seed) * 220;
            const op = (0.045 + hash(i, 8, seed) * 0.05) * intensity * rays;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: -240,
                  width: wdt,
                  height: H * 1.2,
                  background: `linear-gradient(90deg, transparent 0%, ${tint ?? '#9FE8FF'}${Math.round(op * 200).toString(16).padStart(2, '0')} 34%, ${tint ?? '#9FE8FF'}${Math.round(op * 255).toString(16).padStart(2, '0')} 50%, ${tint ?? '#9FE8FF'}${Math.round(op * 200).toString(16).padStart(2, '0')} 66%, transparent 100%)`,
                  maskImage: 'linear-gradient(180deg, black 0%, rgba(0,0,0,0.55) 46%, transparent 78%)',
                  WebkitMaskImage: 'linear-gradient(180deg, black 0%, rgba(0,0,0,0.55) 46%, transparent 78%)',
                  transform: `rotate(${(p - 0.5) * 14 + Math.sin(t * 0.08 + i) * 1.6}deg)`,
                  filter: 'none',
                }}
              />
            );
          })
        : null}
      {motes.map((m, i) => {
        const y = (m.y - t * 14 * m.s * 10 + H * 3) % H;
        const x = m.x + Math.sin(t * 0.35 * m.s + m.w) * 26;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: m.r * 2,
              height: m.r * 2,
              borderRadius: '50%',
              background: tint ?? C.foam,
              opacity: m.a * (0.35 + 0.65 * intensity),
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 70% at 50% 8%, rgba(255,255,255,0.05), transparent 60%),
            radial-gradient(90% 60% at 50% 100%, rgba(0,0,0,0.75), transparent 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ───────────────────────  bathymetric contour field  ──────────────────── */
// Real marching-squares isobaths over an fBm height field: each ring reads as a
// surveyed depth line instead of decorative scanlines.
const CONTOUR_CACHE = new Map<string, string>();
const contourCacheKey = (level: number, nx: number, ny: number, scale: number, seed: number) =>
  `${level}|${nx}|${ny}|${scale}|${seed}`;

const contourPath = (level: number, nx: number, ny: number, scale: number, seed: number) => {
  const h = (i: number, j: number) => fbm((i / nx) * scale + seed * 3.7, (j / ny) * scale * 1.55 + seed * 1.3, seed, 5);
  let d = '';
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x0 = (i / nx) * 1000;
      const x1 = ((i + 1) / nx) * 1000;
      const y0 = (j / ny) * 1000;
      const y1 = ((j + 1) / ny) * 1000;
      const a = h(i, j);
      const b = h(i + 1, j);
      const c = h(i + 1, j + 1);
      const e = h(i, j + 1);
      const idx = (a > level ? 1 : 0) | (b > level ? 2 : 0) | (c > level ? 4 : 0) | (e > level ? 8 : 0);
      if (idx === 0 || idx === 15) continue;
      const lerpX = (va: number, vb: number) => { const p = (level - va) / (vb - va || 1e-6); return x0 + (x1 - x0) * p; };
      const lerpY = (va: number, vb: number) => { const p = (level - va) / (vb - va || 1e-6); return y0 + (y1 - y0) * p; };
      const top = {x: lerpX(a, b), y: y0};
      const right = {x: x1, y: lerpY(b, c)};
      const bottom = {x: lerpX(e, c), y: y1};
      const left = {x: x0, y: lerpY(a, e)};
      const seg = (p1: {x: number; y: number}, p2: {x: number; y: number}) =>
        `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)}L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      const cases: Record<number, [typeof top, typeof top][]> = {
        1: [[left, top]], 2: [[top, right]], 3: [[left, right]], 4: [[right, bottom]],
        5: [[left, top], [right, bottom]], 6: [[top, bottom]], 7: [[left, bottom]],
        8: [[bottom, left]], 9: [[bottom, top]], 10: [[top, right], [bottom, left]],
        11: [[bottom, right]], 12: [[right, left]], 13: [[right, top]], 14: [[top, left]],
      };
      const cs = cases[idx];
      if (cs) for (const [p1, p2] of cs) d += seg(p1, p2);
    }
  }
  return d;
};

export const ContourField: React.FC<{
  opacity?: number;
  scale?: number;
  zoom?: number;
  y?: number;
  color?: string;
  stroke?: number;
  levels?: number;
  seed?: number;
  tilt?: number;
  crisp?: boolean;
}> = ({opacity = 0.5, scale = 2.6, zoom = 1, y = 620, color = C.sonar, stroke = 2, levels = 13, seed = 1, tilt = 12, crisp = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const paths = useMemo(() => {
    const nx = 40;
    const ny = 72;
    return Array.from({length: levels}).map((_, k) => {
      const level = 0.24 + (k / levels) * 0.5;
      const key = contourCacheKey(level, nx, ny, scale, seed);
      let d = CONTOUR_CACHE.get(key);
      if (d === undefined) {
        d = contourPath(level, nx, ny, scale, seed);
        CONTOUR_CACHE.set(key, d);
      }
      return {d, major: k % 4 === 0, k};
    });
  }, [scale, levels, seed]);

  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          left: -W * 0.3,
          top: y,
          width: W * 1.6,
          height: H * 0.9,
          transform: `perspective(1600px) rotateX(${tilt}deg) scale(${zoom * (1 + t * 0.004)}) translateY(${Math.sin(t * 0.25) * 8}px)`,
          transformOrigin: '50% 22%',
          maskImage: 'radial-gradient(62% 58% at 50% 42%, black 12%, rgba(0,0,0,0.5) 62%, transparent 92%)',
          WebkitMaskImage: 'radial-gradient(62% 58% at 50% 42%, black 12%, rgba(0,0,0,0.5) 62%, transparent 92%)',
          willChange: 'transform',
        }}
      >
        {paths.map((p) => (
          <path
            key={p.k}
            d={p.d}
            fill="none"
            stroke={color}
            strokeWidth={p.major ? stroke * 1.6 : stroke * 0.7}
            strokeLinecap="round"
            opacity={p.major ? 0.5 : 0.2}
            shapeRendering="optimizeSpeed"
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* ─────────────────────────────  grain  ───────────────────────────────── */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const f = useCurrentFrame();
  const gx = (f * 41) % 260;
  const gy = (f * 67) % 260;
  return (
    <AbsoluteFill
      style={{
        opacity,
        pointerEvents: 'none',
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='240' height='240' filter='url(%23n)' opacity='0.5'/></svg>\")",
        backgroundPosition: `${gx}px ${gy}px`,
      }}
    />
  );
};

/* ───────────────────────────  lens / optics  ─────────────────────────── */
export const Optics: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background:
        'radial-gradient(130% 92% at 50% 42%, rgba(0,0,0,0) 46%, rgba(0,0,0,0.32) 76%, rgba(0,0,0,0.8) 100%), radial-gradient(118% 88% at 50% 50%, transparent 64%, rgba(95,243,224,0.14) 98%)',
    }}
  />
);

/* ──────────────────────────  light sweep  ───────────────────────────── */
export const Drift: React.FC<{speed?: number; y?: number}> = ({speed = 1, y = 0}) => {
  const f = useCurrentFrame();
  const p = ((f * speed) % (FPS * 9)) / (FPS * 9);
  const yy = interpolate(p, [0, 1], [-500, H + 500]);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: yy + y,
        height: 420,
        pointerEvents: 'none',
        background:
          'linear-gradient(180deg, transparent, rgba(160,220,255,0.05) 42%, rgba(255,255,255,0.035) 52%, transparent)',
      }}
    />
  );
};

/* ───────────────────────  depth-tinted edge bars  ────────────────────── */
export const EdgeFade: React.FC<{top?: number; bottom?: number}> = ({top = 0.9, bottom = 1}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `linear-gradient(180deg, rgba(1,6,10,${top}) 0%, transparent 15%, transparent 74%, rgba(1,6,10,${bottom}) 100%)`,
    }}
  />
);

// Depth readout that every scene shares: the story is always *somewhere*.
export const DepthHaze: React.FC<{depth: number}> = ({depth}) => {
  const f = useCurrentFrame();
  const p = clamp(depth / 7440);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: `radial-gradient(140% 80% at 50% ${lerp(4, 96, p)}%, ${depthColor(depth)}55, transparent 62%)`,
        opacity: 0.9 + Math.sin(f / 90) * 0.02,
      }}
    />
  );
};
