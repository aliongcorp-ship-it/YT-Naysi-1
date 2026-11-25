import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, H, W, alpha, clamp, lerp} from '../theme';
import {EarthLimb, MoonDisk} from './Atmosphere';

/* A reusable "the two bodies, to scale-ish" frame. Every scene in the episode
   is a slight variation on it, which is what makes the film feel like one
   instrument pointed at one system rather than a slideshow. */

export const EarthAtCorner: React.FC<{x?: number; y?: number; r?: number; lit?: number}> = ({
  x = 190,
  y = 1520,
  r = 190,
  lit = 1,
}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        overflow: 'hidden',
        // lit side upper-left, terminator lower-right: one shadow, no rim light
        background: `radial-gradient(circle at 34% 28%, #33566F 0%, #1D3B52 30%, #122A3C 52%, #08192A 74%, #040C16 100%)`,
      }}
    >
      {[
        {x: 20, y: 40, w: 0.42, h: 0.30, r: -16},
        {x: 40, y: 58, w: 0.50, h: 0.34, r: 10},
        {x: 26, y: 22, w: 0.30, h: 0.16, r: 28},
        {x: 62, y: 34, w: 0.26, h: 0.22, r: -34},
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: r * c.w * 2,
            height: r * c.h * 2,
            borderRadius: '46% 54% 38% 62% / 52% 40% 60% 48%',
            background: alpha('#6F7F5E', 0.34),
            transform: `rotate(${c.r}deg)`,
          }}
        />
      ))}
      {/* terminator */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `linear-gradient(118deg, transparent 26%, ${alpha('#04060D', 0.55)} 52%, ${alpha('#04060D', 0.95)} 76%)`,
        }}
      />
    </div>
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        border: `1.5px solid ${alpha(C.warm, 0.10 * lit)}`,
      }}
    />
  </div>
);

/* A dotted orbit arc with a body on it. Used for "Bulan mengorbit" and for the
   recession scene. */
export const OrbitArc: React.FC<{
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  rot?: number;
  dash?: string;
  progress?: number;
  color?: string;
  opacity?: number;
  width?: number;
}> = ({cx = W / 2, cy = 1000, rx = 560, ry = 250, rot = -12, dash = '3 13', progress = 1, color = C.muted, opacity = 0.5, width = 2}) => {
  const circ = Math.PI * (rx + ry);
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity, pointerEvents: 'none'}}>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeDashoffset={0}
        transform={`rotate(${rot} ${cx} ${cy})`}
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={color}
        strokeWidth={width * 1.4}
        strokeDasharray={`${circ * clamp(progress)} ${circ}`}
        transform={`rotate(${rot} ${cx} ${cy})`}
        opacity={0.9}
      />
    </svg>
  );
};

/* A small moon riding an ellipse, positioned by angle in degrees. */
export const OrbitMoon: React.FC<{
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  rot?: number;
  angle: number;
  r?: number;
}> = ({cx = W / 2, cy = 1000, rx = 560, ry = 250, rot = -12, angle, r = 26}) => {
  const a = (angle * Math.PI) / 180;
  const x0 = Math.cos(a) * rx;
  const y0 = Math.sin(a) * ry;
  const rr = (rot * Math.PI) / 180;
  const x = cx + x0 * Math.cos(rr) - y0 * Math.sin(rr);
  const y = cy + x0 * Math.sin(rr) + y0 * Math.cos(rr);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle at 36% 32%, #D7D0BE 0%, #A9A190 46%, #5D5A4E 100%)`,
      }}
    />
  );
};

/* Distance ruler: two bodies with a measured span between them. This is the
   clearest way to show 384 400 km without a photograph. */
export const Span: React.FC<{
  x0: number;
  x1: number;
  y: number;
  label: string;
  sub?: string;
  at: number;
  t: number;
  color?: string;
}> = ({x0, x1, y, label, sub, at, t, color = C.gold}) => {
  const p = clamp((t - at) / 0.85);
  const e = 1 - Math.pow(1 - p, 3);
  const xe = lerp(x0, x1, e);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x0, top: y, width: Math.max(1, xe - x0), height: 2, background: alpha(color, 0.9)}} />
      <div style={{position: 'absolute', left: x0 - 1, top: y - 16, width: 2, height: 34, background: alpha(color, 0.9)}} />
      <div style={{position: 'absolute', left: xe - 1, top: y - 16, width: 2, height: 34, background: alpha(color, 0.9)}} />
      <div
        style={{
          position: 'absolute',
          left: x0,
          width: x1 - x0,
          top: y - 92,
          textAlign: 'center',
          opacity: e,
          fontFamily: '"SpaceGrotesk"',
          fontSize: 62,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: C.ink,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {label}
      </div>
      {sub ? (
        <div
          style={{
            position: 'absolute',
            left: x0,
            width: x1 - x0,
            top: y + 26,
            textAlign: 'center',
            opacity: e * 0.9,
            fontFamily: '"PlexMono"',
            fontSize: 21,
            letterSpacing: '0.24em',
            color: C.muted,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

/* The moon seen flat-on, used when the scene needs a surface rather than a
   body: craters, a reflector patch, a laser hit. */
export const MoonFace: React.FC<{cx?: number; cy?: number; r?: number; opacity?: number}> = ({
  cx = W / 2,
  cy = 900,
  r = 380,
  opacity = 1,
}) => <MoonDisk cx={cx} cy={cy} r={r} phase={0.25} seed={11} opacity={opacity} />;
