import React from 'react';
import {P, T, dustField} from '../../scenes/bulan';
import {clamp, hash} from '../theme';

/* ────────────────────────────  the Moon  ─────────────────────────────────── */
// An engraved disc, not a rendered sphere. The rules that make it read:
//   · maria are hard-edged dark shapes, never soft blobs
//   · craters are 1.5 px rings, not filled circles — a rim, a floor, a shadow
//   · the unlit side is hatched at 45°, the way a plate printer builds shade
// Everything is CSS with fixed pixel sizes, so a still is reproducible.
//
//   detail  0..1  crater density
//   lit     0..1  sun angle (0 = near-eclipse, 1 = full face)
//   tilt    deg   rotates the disc, so two shots never face the same way
export const MoonDisc: React.FC<{
  cx: number;
  cy: number;
  r: number;
  detail?: number;
  lit?: number;
  tilt?: number;
  opacity?: number;
  seed?: number;
  mask?: boolean;
}> = ({cx, cy, r, detail = 1, lit = 1, tilt = 0, opacity = 1, seed = 11, mask = true}) => {
  // Maria: a fixed, hand-placed set of irregular seas, in disc space 0..1.
  const seas = React.useMemo(
    () => [
      {cx: 0.35, cy: 0.29, w: 0.3, h: 0.26, rot: -14},
      {cx: 0.63, cy: 0.23, w: 0.17, h: 0.15, rot: 22},
      {cx: 0.55, cy: 0.57, w: 0.32, h: 0.22, rot: 8},
      {cx: 0.25, cy: 0.66, w: 0.15, h: 0.18, rot: -34},
      {cx: 0.74, cy: 0.66, w: 0.14, h: 0.16, rot: 40},
      {cx: 0.47, cy: 0.14, w: 0.12, h: 0.1, rot: 4},
      {cx: 0.62, cy: 0.43, w: 0.11, h: 0.13, rot: -18},
    ],
    []
  );

  // Craters: small, many, ringed. Sizes are fractions of the radius, kept well
  // under 0.09 so they read as pocks rather than as bubbles.
  const craters = React.useMemo(() => {
    const n = Math.round(54 * detail) + 14;
    return Array.from({length: n}, (_, i) => {
      const a = hash(i, 1, seed) * Math.PI * 2;
      const rr = Math.pow(hash(i, 2, seed), 0.55) * 0.9;
      return {
        x: 0.5 + Math.cos(a) * rr * 0.5,
        y: 0.5 + Math.sin(a) * rr * 0.5,
        s: 0.012 + Math.pow(hash(i, 3, seed), 2.4) * 0.075,
        a: 0.3 + hash(i, 4, seed) * 0.5,
      };
    });
  }, [detail, seed]);

  const sun = 0.22 + lit * 0.3;
  const hatch = 0.42 + (1 - lit) * 0.36;

  return (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        opacity,
        transform: `rotate(${tilt}deg)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: mask ? 'hidden' : 'visible',
          // the lit face: bone, warm, with the brightest point where the sun is
          background: `radial-gradient(circle at ${sun * 100}% 30%, #F6EBD4 0%, #EADCC0 30%, #D6C4A2 58%, #B7A17C 82%, #8E7957 100%)`,
        }}
      >
        {seas.map((m, i) => (
          <div
            key={`s${i}`}
            style={{
              position: 'absolute',
              left: `${(m.cx - m.w / 2) * 100}%`,
              top: `${(m.cy - m.h / 2) * 100}%`,
              width: `${m.w * 100}%`,
              height: `${m.h * 100}%`,
              background: '#574A36',
              opacity: 0.2,
              transform: `rotate(${m.rot}deg)`,
              // a hand-cut silhouette, not an ellipse
              clipPath:
                'polygon(8% 30%, 18% 12%, 34% 4%, 52% 6%, 68% 2%, 82% 16%, 92% 30%, 96% 50%, 90% 68%, 82% 84%, 66% 92%, 48% 96%, 30% 90%, 16% 78%, 8% 60%, 4% 44%)',
            }}
          />
        ))}

        {craters.map((c, i) => {
          const d = c.s * r * 2;
          return (
            <div
              key={`c${i}`}
              style={{
                position: 'absolute',
                left: `${(c.x - c.s) * 100}%`,
                top: `${(c.y - c.s) * 100}%`,
                width: `${d}px`,
                height: `${d}px`,
                borderRadius: '50%',
                border: `1.5px solid rgba(58,48,34,${0.22 + c.a * 0.36})`,
                // the sunward inner edge catches light: that is the whole tell
                boxShadow: `inset ${-d * 0.1}px ${-d * 0.08}px 0 rgba(255,248,232,${0.1 + c.a * 0.26})`,
                background: `rgba(74,62,44,${0.06 + c.a * 0.14})`,
              }}
            />
          );
        })}

        {/* the unlit side, built as printer's hatching rather than a gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `repeating-linear-gradient(${46 + (1 - lit) * 18}deg, rgba(14,10,6,${hatch * 0.62}) 0 2px, rgba(14,10,6,0) 2px 7px)`,
            maskImage: `linear-gradient(${88 + (1 - lit) * 46}deg, transparent 60%, black 82%, black 100%)`,
            WebkitMaskImage: `linear-gradient(${88 + (1 - lit) * 46}deg, transparent 60%, black 82%, black 100%)`,
          }}
        />
        {/* and a solid floor under the hatching, so the dark side is dark */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `linear-gradient(${88 + (1 - lit) * 46}deg, rgba(12,8,5,0) 52%, rgba(12,8,5,${0.45 + 0.3 * (1 - lit)}) 84%, rgba(12,8,5,0.82) 100%)`,
          }}
        />
      </div>
    </div>
  );
};

/* ───────────────────────────  the Moon, dusty  ───────────────────────────── */
// Close-up surface: a plaster-grey field with crater rings, used when the
// camera is standing on the ground looking out.
export const MoonGround: React.FC<{w?: number; h?: number; y?: number; seed?: number; opacity?: number; scale?: number}> = ({
  w = 1440,
  h = 2560,
  y = 0,
  seed = 5,
  opacity = 1,
  scale = 1,
}) => {
  const craters = React.useMemo(() => {
    const n = 34;
    return Array.from({length: n}, (_, i) => ({
      x: hash(i, 7, seed) * w,
      yy: y + hash(i, 8, seed) * h,
      r: (18 + hash(i, 9, seed) * 96) * scale,
      a: 0.1 + hash(i, 10, seed) * 0.22,
    }));
  }, [w, h, y, seed, scale]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none'}}>
      {craters.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: c.x - c.r,
            top: c.yy - c.r * 0.34,
            width: c.r * 2,
            height: c.r * 0.68,
            borderRadius: '50%',
            border: `${Math.max(1, c.r * 0.05)}px solid rgba(18,13,8,${c.a})`,
            background: `radial-gradient(ellipse at 50% 40%, rgba(18,13,8,${c.a * 0.9}), rgba(18,13,8,0) 70%)`,
            boxShadow: `0 ${Math.max(1, c.r * 0.05)}px 0 rgba(255,248,232,${c.a * 0.5})`,
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────  the Earth  ──────────────────────────────── */
// Seen from the Moon: a marbled disc, blue-grey, never saturated, because this
// film is printed in sepia and the Earth is the only cool thing in it.
export const EarthDisc: React.FC<{cx: number; cy: number; r: number; lit?: number; opacity?: number}> = ({
  cx,
  cy,
  r,
  lit = 1,
  opacity = 1,
}) => (
  <div style={{position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, opacity}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 34% 30%, #7FA7B8 0%, #4E7E96 26%, #2E5A74 54%, #14313F 80%, #08161D 100%)',
        boxShadow: `inset ${-r * 0.16}px ${-r * 0.1}px ${r * 0.42}px rgba(3,8,10,0.9)`,
      }}
    >
      {[
        {x: 0.3, y: 0.3, w: 0.3, h: 0.24, a: 0.5},
        {x: 0.62, y: 0.42, w: 0.24, h: 0.3, a: 0.42},
        {x: 0.42, y: 0.7, w: 0.26, h: 0.16, a: 0.34},
      ].map((m, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${m.x * 100}%`,
            top: `${m.y * 100}%`,
            width: `${m.w * 100}%`,
            height: `${m.h * 100}%`,
            borderRadius: '48%',
            background: `rgba(196,220,214,${m.a * 0.5})`,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `linear-gradient(${90 + (1 - lit) * 50}deg, rgba(6,12,16,0) 34%, rgba(6,12,16,${0.5 + 0.35 * (1 - lit)}) 70%, rgba(6,12,16,0.92) 96%)`,
        }}
      />
    </div>
  </div>
);

/* ─────────────────────────  laser / photon paths  ───────────────────────── */
// A beam: one straight line with a solid core and a wide, faint skirt. It is
// built from a gradient so it can be any width and any length in one element.
export const Beam: React.FC<{
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  width?: number;
  color?: string;
  opacity?: number;
  head?: number; // 0..1 draw progress
}> = ({x0, y0, x1, y1, width = 3, color = P.accent, opacity = 1, head = 1}) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const draw = clamp(head);
  return (
    <div
      style={{
        position: 'absolute',
        left: x0,
        top: y0,
        width: len * draw,
        height: width * 6,
        transformOrigin: '0 50%',
        transform: `rotate(${ang}deg) translateY(${-width * 3}px)`,
        opacity,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: width * 2.5,
          width: '100%',
          height: width,
          background: color,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: width * 6,
          background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, ${color}22 40%, ${color}55 50%, ${color}22 60%, rgba(255,255,255,0) 100%)`,
        }}
      />
    </div>
  );
};

/* ────────────────────────  horizon (Earth's limb)  ───────────────────────── */
// For the two shots that look up from the ground. A huge, slightly flattened
// arc with a lit rim and a haze band that falls off upward.
export const Horizon: React.FC<{cy: number; r: number; lit?: number; opacity?: number; color?: string; haze?: string}> = ({
  cy,
  r,
  lit = 1,
  opacity = 1,
  color = '#101A1E',
  haze = '#5F8C93',
}) => (
  <div style={{position: 'absolute', inset: 0, opacity, overflow: 'hidden'}}>
    <div
      style={{
        position: 'absolute',
        left: 720 - r,
        top: cy - r * 0.62,
        width: r * 2,
        height: r * 1.24,
        borderRadius: '50%',
        background: `radial-gradient(circle at 50% 18%, ${color} 0%, ${color} 60%, #05080A 100%)`,
        boxShadow: `0 ${-r * 0.02}px ${r * 0.06}px ${haze}${Math.round(lit * 120)
          .toString(16)
          .padStart(2, '0')}`,
      }}
    />
  </div>
);
