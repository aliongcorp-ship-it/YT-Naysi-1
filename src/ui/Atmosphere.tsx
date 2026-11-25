import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, H, W, alpha, clamp, lerp} from '../theme';

/* ─────────────────────────────  deterministic noise  ───────────────────── */
export const hash = (x: number, y: number, s = 0) => {
  const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
};

/* ─────────────────────────────  star field  ──────────────────────────── */
// Three parallax shells. Stars are drawn as 1–2 px squares, never blurred and
// never bloomed: at 1440 wide they read as film grain, not as light sources.
export const StarField: React.FC<{opacity?: number; drift?: number; seed?: number}> = ({
  opacity = 1,
  drift = 1,
  seed = 3,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;

  const shells = useMemo(() => {
    return [0, 1, 2].map((layer) => {
      const n = [190, 120, 60][layer];
      return Array.from({length: n}).map((_, i) => ({
        x: hash(i, layer * 3 + 1, seed) * W,
        y: hash(i, layer * 3 + 2, seed) * H,
        s: layer === 0 ? 1.4 : layer === 1 ? 2.1 : 3.0,
        a: [0.20, 0.34, 0.55][layer] * (0.5 + hash(i, layer * 3 + 3, seed) * 0.5),
        tw: 0.5 + hash(i, layer * 3 + 4, seed) * 2.4,
        ph: hash(i, layer * 3 + 5, seed) * 6.283,
      }));
    });
  }, [seed]);

  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      {shells.map((stars, layer) =>
        stars.map((s, i) => {
          const y = (s.y + t * (2 + layer * 5) * drift) % H;
          const tw = 0.75 + 0.25 * Math.sin(t * s.tw + s.ph);
          return (
            <div
              key={`${layer}-${i}`}
              style={{
                position: 'absolute',
                left: s.x,
                top: y,
                width: s.s,
                height: s.s,
                background: C.ink,
                opacity: s.a * tw,
              }}
            />
          );
        })
      )}
    </AbsoluteFill>
  );
};

/* ─────────────────────────  space backdrop  ──────────────────────────── */
// A vertical gradient from "over the horizon" blue-black to true void, plus an
// optional warm glow near the bottom where Earth sits. No radial bloom.
export const SpaceBackdrop: React.FC<{
  from?: string;
  to?: string;
  earthLight?: number;
  style?: React.CSSProperties;
}> = ({from = C.abyss, to = C.void, earthLight = 0, style}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${from} 0%, ${to} 62%)`, ...style}}>
    {earthLight > 0 ? (
      <AbsoluteFill
        style={{
          background: `linear-gradient(0deg, ${alpha(C.gold, 0.05 * earthLight)} 0%, transparent 42%)`,
        }}
      />
    ) : null}
  </AbsoluteFill>
);

/* ────────────────────────────  film grain  ───────────────────────────── */
// SVG fractal noise, re-seeded every frame so it does not look like a still
// texture stuck on top of the picture.
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.05}) => {
  const f = useCurrentFrame();
  const gx = (f * 43) % 240;
  const gy = (f * 71) % 240;
  return (
    <AbsoluteFill
      style={{
        opacity,
        pointerEvents: 'none',
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='220' height='220' filter='url(%23n)' opacity='0.55'/></svg>\")",
        backgroundPosition: `${gx}px ${gy}px`,
      }}
    />
  );
};

/* ──────────────────────────  vignette  ───────────────────────────────── */
// Pure darkening at the edges. No colour fringing, so nothing reads as neon.
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.72}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(126% 88% at 50% 44%, rgba(0,0,0,0) 42%, rgba(0,0,0,${0.30 * strength}) 74%, rgba(4,6,13,${0.88 * strength}) 100%)`,
    }}
  />
);

/* ─────────────────────────  earth limb (code only)  ──────────────────── */
// A circle clipped to a huge radius, with a thin lit limb and a terminator.
// Built from gradients, so it behaves like a photograph only in silhouette.
export const EarthLimb: React.FC<{
  cx?: number;
  cy?: number;
  r?: number;
  lit?: number;
  tilt?: number;
  detail?: number;
}> = ({cx = W / 2, cy = H + 380, r = 1500, lit = 1, tilt = -18, detail = 1}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle at ${50 + tilt * 0.5}% ${28}%,
            ${alpha(C.shallow, 0.85)} 0%,
            ${alpha(C.deep, 0.96)} 26%,
            ${alpha(C.abyss, 1)} 54%,
            ${C.void} 78%)`,
          overflow: 'hidden',
        }}
      >
        {/* latitude bands: thin, low-contrast, none of them emissive */}
        {detail > 0
          ? Array.from({length: 9}).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: -r,
                  top: r + (i - 4) * 86,
                  width: r * 2,
                  height: 2,
                  background: alpha(C.shallow, 0.10 + (i % 3) * 0.02),
                  transform: `rotate(${tilt}deg)`,
                }}
              />
            ))
          : null}
        {/* cloud strokes, slowly drifting */}
        {detail > 0
          ? Array.from({length: 7}).map((_, i) => {
              const yy = (i / 7) * r * 2;
              const x = ((t * (3 + i) * 0.6) % (r * 1.4)) - r * 0.2;
              return (
                <div
                  key={`c${i}`}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: yy,
                    width: 260 + i * 90,
                    height: 26 + (i % 3) * 16,
                    borderRadius: 999,
                    background: alpha(C.ink, 0.035 + (i % 3) * 0.012),
                    transform: `rotate(${tilt}deg)`,
                  }}
                />
              );
            })
          : null}
      </div>
      {/* limb: a hairline of scattered light, not a glow */}
      <div
        style={{
          position: 'absolute',
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          border: `${2.5}px solid ${alpha(C.warm, 0.16 * lit)}`,
          boxShadow: `inset 0 0 40px ${alpha(C.warm, 0.10 * lit)}`,
        }}
      />
    </div>
  );
};

/* ───────────────────────────  moon (code only)  ──────────────────────── */
// Craters are deterministic circles, lit from a fixed direction. No texture
// images: the "surface" is layered radial gradients and crater rims.
export const MoonDisk: React.FC<{
  cx?: number;
  cy?: number;
  r?: number;
  phase?: number;
  seed?: number;
  opacity?: number;
}> = ({cx = W / 2, cy = 980, r = 420, phase = 0.62, seed = 7, opacity = 1}) => {
  const craters = useMemo(
    () =>
      Array.from({length: 34}).map((_, i) => {
        const ang = hash(i, 1, seed) * 6.283;
        const rad = Math.sqrt(hash(i, 2, seed)) * 0.88;
        const s = (0.012 + Math.pow(hash(i, 3, seed), 2) * 0.070) * r;
        return {
          x: 50 + Math.cos(ang) * rad * 46,
          y: 50 + Math.sin(ang) * rad * 46,
          s,
          a: 0.16 + hash(i, 4, seed) * 0.22,
        };
      }),
    [seed, r]
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        opacity,
        overflow: 'hidden',
        // regolith: one soft gradient, darker all the way out, no bright centre
        background: `radial-gradient(circle at 36% 30%, #9C9684 0%, #87816F 28%, #6B6658 52%, #4A4740 76%, #2C2B27 100%)`,
      }}
    >
      {/* crater: a dark bowl with a lit inner wall on the terminator side */}
      {craters.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.s * 2,
            height: c.s * 2,
            marginLeft: -c.s,
            marginTop: -c.s,
            borderRadius: '50%',
            background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.06), rgba(0,0,0,${c.a}) 58%, rgba(0,0,0,${c.a * 0.25}) 78%)`,
            boxShadow: `inset 1px 1px 2px rgba(255,255,255,0.05), inset -2px -2px 4px rgba(0,0,0,${c.a * 0.6})`,
          }}
        />
      ))}
      {/* the maria: broad dark plains, so the disk is not uniform */}
      {[
        {x: 18, y: 24, w: 0.40, h: 0.30, r: -12},
        {x: 48, y: 18, w: 0.28, h: 0.22, r: 22},
        {x: 30, y: 56, w: 0.34, h: 0.26, r: 8},
      ].map((m, i) => (
        <div
          key={`m${i}`}
          style={{
            position: 'absolute',
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: r * m.w * 2,
            height: r * m.h * 2,
            borderRadius: '48% 52% 42% 58% / 55% 45% 55% 45%',
            background: alpha('#3F3D36', 0.35),
            transform: `rotate(${m.r}deg)`,
          }}
        />
      ))}
      {/* terminator: hard, deep, and on one side only */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `linear-gradient(${96 + phase * 26}deg, rgba(4,6,13,0) ${22 + phase * 14}%, rgba(4,6,13,0.62) ${46 + phase * 14}%, rgba(4,6,13,0.97) ${70 + phase * 12}%)`,
        }}
      />
    </div>
  );
};

/* ───────────────────────  instrumentation grid  ──────────────────────── */
// The measured-looking layer: a coordinate grid in the void, drawn in hairlines.
export const CoordGrid: React.FC<{opacity?: number; step?: number; color?: string}> = ({
  opacity = 0.16,
  step = 120,
  color = C.shallow,
}) => (
  <AbsoluteFill
    style={{
      opacity,
      pointerEvents: 'none',
      backgroundImage: `linear-gradient(90deg, ${alpha(color, 0.5)} 1px, transparent 1px), linear-gradient(180deg, ${alpha(color, 0.5)} 1px, transparent 1px)`,
      backgroundSize: `${step}px ${step}px`,
    }}
  />
);

/* ───────────────────────  light sweep (no bloom)  ────────────────────── */
export const Sweep: React.FC<{progress: number; color?: string; opacity?: number}> = ({
  progress,
  color = C.gold,
  opacity = 0.20,
}) => (
  <div
    style={{
      position: 'absolute',
      left: `${clamp(progress) * 100}%`,
      top: 0,
      bottom: 0,
      width: 3,
      background: alpha(color, opacity),
      pointerEvents: 'none',
    }}
  />
);

export {lerp};
