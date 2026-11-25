import {AbsoluteFill, useCurrentFrame} from 'remotion';
import React from 'react';
import {alpha} from '../src/theme';
/* =============================================================================
   scenes/bulan.tsx — the topic file. "bulan" is the subject of this episode.

   One episode, one file: this is where the episode decides how it looks. A
   different topic gets a different file with a different palette, a different
   type pairing, a different camera grammar and a different way of drawing
   things. Nothing here is a shared default — copy the shape, not the skin.

     IDENTITY   palette + type + texture + camera; consumed by Timeline/captions
     DRAW       the primitives this episode draws with (its "ink")
     Shots      drawn in y1…y10, assembled by src/Timeline.tsx

   Episode 01 — "Bulan menjauh 3,8 cm tiap tahun"
   ---------------------------------------------------------------------------
   Visual identity: REGOLITH. Not a spacecraft console and not neon noir — a
   warm sepia field survey. The Moon is the subject, so the picture is made of
   the things you find on it: dust, basalt, glass, and light that has to travel
   384 400 km to get here. Paper-bone type on an umber ground, one hot amber
   for measurement, one cold mint for verified data, a rust red for recession.
   Everything is drawn, nothing is photographic, and there is no glow: contrast
   comes from density and outline, so the film looks like a plate in a survey
   report that happens to be moving.
   ========================================================================== */

// The compositions are imported by the renderer, not here: this file is also
// read by build scripts in Node, which cannot parse the JSX the shots contain.
// `Timeline.tsx` owns the table, in the same order `script.mjs` lists.

/* ───────────────────────────────  IDENTITY  ─────────────────────────────── */
export type Palette = {
  void: string; abyss: string; deep: string; mid: string; shallow: string;
  ink: string; muted: string; faint: string;
  accent: string; accentDim: string; hot: string; warm: string; alt: string;
};
export type Identity = {
  id: string;
  name: string;
  palette: Palette;
  type: {display: string; mono: string; editorial: string};
  motion: {cut: 'bloom' | 'paper' | 'cut' | 'iris'; punch: number; grain: number; ease: string};
  chrome: {watermark: boolean; marks: boolean; rail: boolean};
};
export type Face = {family: string; file: string; weight: string; style: string};
export type Dust = {x: number; y: number; r: number; a: number};

export const ID: Identity = {
  id: 'regolith',
  name: 'Regolith Survey',

  // Umber ground, bone ink, and three working colours with one job each.
  palette: {
    void: '#0C0805', // the ground the film sits on
    abyss: '#140E09',
    deep: '#1D150E',
    mid: '#2B2016',
    shallow: '#3D2E20',
    ink: '#F2E7D5', // bone paper
    muted: '#9C8A72', // weathered bone, for secondary labels
    faint: '#4A3A29',
    accent: '#F0A63C', // hot amber: the measurement itself
    accentDim: '#A8701F',
    hot: '#C6533A', // rust: something leaving
    warm: '#FFD9A0',
    alt: '#7FC8A9', // mint: verified, returned, counted
  },

  type: {
    // Newsreader carries the voice; JetBrains Mono carries the instrument.
    display: 'Newsreader',
    mono: 'JetBrains',
    editorial: 'Newsreader',
  },

  // Camera + texture. Cut is a hard replace (no flash); every shot opens on a
  // slow settle; grain is coarse because the film is supposed to be printed.
  motion: {cut: 'cut', punch: 1.026, grain: 0.085, ease: 'quint'},

  // The only on-screen chrome this episode permits is the channel watermark.
  chrome: {watermark: true, marks: false, rail: false},
};

export const P = ID.palette;

/* The font files this episode loads. A new topic ships its own list (and its
   own .woff2 files in public/fonts): the type pairing is part of the identity,
   so it is declared here and handed to the font gate by the timeline. */
export const fonts: Face[] = [
  {family: 'Newsreader', file: 'fonts/newsreader.woff2', weight: '200 800', style: 'normal'},
  {family: 'Newsreader', file: 'fonts/newsreader-italic.woff2', weight: '200 800', style: 'italic'},
  {family: 'JetBrains', file: 'fonts/jetbrains-400.woff2', weight: '400', style: 'normal'},
  {family: 'JetBrains', file: 'fonts/jetbrains-700.woff2', weight: '700', style: 'normal'},
];

/* ────────────────────────────────  type  ────────────────────────────────── */
export const T = {
  display: `'${ID.type.display}', Georgia, serif`,
  mono: `'${ID.type.mono}', ui-monospace, monospace`,
  italic: `'${ID.type.display}', Georgia, serif`,
};

/* ─────────────────────────────  primitives  ─────────────────────────────── */

// A printed plate: a hairline frame inset from the safe area, with a tiny
// register tick at each corner. It is drawn from CSS, never an image.
export const plate = (opacity = 0.5): React.CSSProperties => ({
  position: 'absolute',
  left: 92,
  top: 150,
  right: 92,
  bottom: 470,
  border: `1px solid rgba(240,231,213,${0.14 * opacity})`,
  pointerEvents: 'none',
});

// Dust: the surface of the Moon is the actual subject of several scenes, so it
// gets a reusable field rather than being redrawn per shot.
export const dustField = (
  n: number,
  {seed = 1, w = 1440, h = 2100, min = 1, max = 3.4}: {seed?: number; w?: number; h?: number; min?: number; max?: number} = {}
): Dust[] => {
  const rnd = (i: number, k: number) => {
    const v = Math.sin(i * 127.1 + k * 311.7 + seed * 47.3) * 43758.5453;
    return v - Math.floor(v);
  };
  return Array.from({length: n}, (_, i) => ({
    x: rnd(i, 1) * w,
    y: rnd(i, 2) * h,
    r: min + rnd(i, 3) * (max - min),
    a: 0.12 + rnd(i, 4) * 0.5,
  }));
};

// A measured interval with serifed end ticks — the episode's way of saying
// "this distance was measured" instead of "this is a graphic".
type MetricProps = {
  x0: number; x1: number; y: number;
  label: string; sub?: string; opacity?: number;
  color?: string; fg?: string; up?: boolean;
};
export const Metric: React.FC<MetricProps> = ({
  x0, x1, y, label, sub, opacity = 1, color = P.accent, fg = P.ink, up = true,
}) => {
  const w = Math.max(2, x1 - x0);
  const tick = 14;
  return (
    <div style={{position: 'absolute', left: 0, top: y, width: 1440, opacity, fontFamily: T.mono}}>
      <div style={{position: 'absolute', left: x0, top: 0, width: w, height: 1, background: color}} />
      <div style={{position: 'absolute', left: x0, top: -tick / 2, width: 1, height: tick, background: color}} />
      <div style={{position: 'absolute', left: x1 - 1, top: -tick / 2, width: 1, height: tick, background: color}} />
      <div
        style={{
          position: 'absolute',
          left: x0,
          width: w,
          top: up ? -44 : 26,
          textAlign: 'center',
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color,
        }}
      >
        {label}
      </div>
      {sub ? (
        <div
          style={{
            position: 'absolute',
            left: x0,
            width: w,
            top: up ? -86 : 66,
            textAlign: 'center',
            fontSize: 21,
            letterSpacing: '0.22em',
            color: fg,
            opacity: 0.72,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

/* ─────────────────────  finder frame (camera, not page)  ─────────────────── */
// Four L-corners, 44 px, 1 px hairline, sitting well inside the safe area. Read
// as "this is being looked through a viewfinder", which is a property of the
// shot, not an overlay of information about the episode.
type FinderProps = {opacity?: number; inset?: number; color?: string; tick?: number};
export const Finder: React.FC<FinderProps> = ({opacity = 0.34, inset = 78, color = P.ink, tick = 46}) => {
  const corner = (h: 'l' | 'r', v: 't' | 'b'): React.CSSProperties => ({
    position: 'absolute',
    width: tick,
    height: tick,
    left: h === 'l' ? inset : undefined,
    right: h === 'r' ? inset : undefined,
    top: v === 't' ? inset + 96 : undefined,
    bottom: v === 'b' ? inset + 96 : undefined,
    borderTop: v === 't' ? `1px solid ${color}` : undefined,
    borderBottom: v === 'b' ? `1px solid ${color}` : undefined,
    borderLeft: h === 'l' ? `1px solid ${color}` : undefined,
    borderRight: h === 'r' ? `1px solid ${color}` : undefined,
    opacity,
  });
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <div style={corner('l', 't')} />
      <div style={corner('r', 't')} />
      <div style={corner('l', 'b')} />
      <div style={corner('r', 'b')} />
    </div>
  );
};


/* ─────────────────────────────  the night sky  ───────────────────────────── */
// Two shots need stars and two need a horizon, and a third needs the horizon
// again with a different profile. They are the same three ideas drawn at
// different densities, so they live here rather than being copied per shot:
// a copy drifts, and a drifted sky is worse than a dull one.
export const Stars: React.FC<{
  n?: number; h?: number; seed?: number; twinkle?: boolean; opacity?: number;
}> = ({n = 240, h = 2050, seed = 1, twinkle = false, opacity = 1}) => {
  const field = React.useMemo(() => {
    const rnd = (i: number, k: number) => {
      const v = Math.sin(i * (12.9898 + seed * 2.17) + k * (78.233 + seed * 1.31)) * 43758.5453;
      return v - Math.floor(v);
    };
    return Array.from({length: n}, (_, i) => ({
      x: rnd(i, 1) * 1440,
      y: rnd(i, 2) * h,
      s: 1.1 + rnd(i, 3) * 1.9,
      o: 0.16 + rnd(i, 4) * 0.6,
      ph: rnd(i, 5) * 6.28,
    }));
  }, [n, h, seed]);
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      {field.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.s,
            height: s.s,
            background: P.ink,
            opacity: twinkle ? s.o * (0.72 + 0.28 * Math.sin(frame * 0.07 + s.ph)) : s.o * 0.72,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// A horizon is one SVG polygon per layer, plus a handful of window lights and
// an optional warm band on the sky above it. The lights are the whole point:
// without them a ridge is a shape, with them it is somewhere people are.
export const Ridge: React.FC<{
  layers: {points: string; fill: string; stroke?: string; strokeWidth?: number}[];
  lights?: [number, number][];
  lightSize?: number;
  band?: {top: number; height: number; from: string; to: string} | null;
  opacity?: number;
}> = ({layers, lights = [], lightSize = 5, band = null, opacity = 1}) => {
  if (opacity <= 0) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none'}}>
      {band ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: band.top,
            width: 1440,
            height: band.height,
            background: `linear-gradient(180deg, ${band.from} 0%, ${band.to} 100%)`,
          }}
        />
      ) : null}
      <svg width={1440} height={2560} style={{position: 'absolute', left: 0, top: 0}}>
        {layers.map((l, i) => (
          <polygon
            key={i}
            points={`${l.points} 1440,2560 0,2560`}
            fill={l.fill}
            stroke={l.stroke}
            strokeWidth={l.strokeWidth}
          />
        ))}
      </svg>
      {lights.map(([x, y], i) => (
        <div
          key={`w${i}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: lightSize,
            height: lightSize,
            borderRadius: '50%',
            background: P.warm,
            opacity: 0.58,
            boxShadow: '0 0 7px 1px rgba(255,217,160,0.34)',
          }}
        />
      ))}
    </div>
  );
};

/* ────────────────────────────────  the Earth  ────────────────────────────── */
// Two shots show the Earth and they must be the same planet: same ocean, same
// hard-edged continents, same terminator, same rim. Drawn in unit space and
// scaled, so it holds at r = 132 and at r = 288 without being redrawn.
//
// The light is fixed (upper left) — a planet that changes its sun between cuts
// reads as two different planets.
export const EarthDisc: React.FC<{
  cx: number;
  cy: number;
  r: number;
  on?: number;
  /** rotation of the land, in degrees; the terminator does not turn with it */
  spin?: number;
  /** a single meridian at the centre, so a still frame still reads as turning */
  meridian?: boolean;
}> = ({cx, cy, r, on = 1, spin = 0, meridian = false}) => {
  if (on <= 0) return null;
  // Coarse coastlines: many short segments with uneven angles, because a land
  // mass drawn with four corners reads as a hexagon, not as a continent. Ocean
  // stays the majority of the disc — the Earth is a water planet.
  const land = [
    // the Americas, west side
    'M -0.66 -0.44 L -0.52 -0.52 L -0.40 -0.46 L -0.34 -0.34 L -0.38 -0.24 L -0.30 -0.14 L -0.33 -0.02 L -0.24 0.06 L -0.20 0.18 L -0.10 0.24 L -0.06 0.36 L -0.14 0.44 L -0.24 0.40 L -0.30 0.30 L -0.40 0.26 L -0.46 0.14 L -0.52 0.02 L -0.58 -0.10 L -0.62 -0.22 L -0.70 -0.30 Z',
    // Africa + Europe, centre
    'M 0.02 -0.52 L 0.14 -0.44 L 0.10 -0.32 L 0.20 -0.24 L 0.18 -0.10 L 0.28 0.00 L 0.26 0.14 L 0.34 0.24 L 0.28 0.38 L 0.18 0.46 L 0.10 0.40 L 0.06 0.28 L -0.02 0.20 L -0.06 0.06 L -0.02 -0.06 L -0.08 -0.18 L -0.04 -0.30 L 0.00 -0.40 Z',
    // Asia, east
    'M 0.30 -0.50 L 0.46 -0.54 L 0.60 -0.46 L 0.66 -0.32 L 0.58 -0.22 L 0.64 -0.12 L 0.54 -0.02 L 0.44 0.02 L 0.36 -0.06 L 0.28 -0.16 L 0.24 -0.30 L 0.26 -0.42 Z',
    // a southern fragment, so the sphere is not all in one hemisphere
    'M 0.34 0.30 L 0.46 0.26 L 0.54 0.34 L 0.50 0.44 L 0.38 0.44 L 0.32 0.38 Z',
  ];
  const uid = `earth-${Math.round(cx)}-${Math.round(cy)}-${Math.round(r)}`;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        opacity: on,
        borderRadius: '50%',
        overflow: 'hidden',
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 32% 28%, #7E959D 0%, #5A7683 26%, #38525E 58%, #1C313A 84%, #0D1E25 100%)',
      }}
    >
      <svg width={r * 2} height={r * 2} style={{position: 'absolute', left: 0, top: 0}}>
        <g
          transform={`translate(${r} ${r}) rotate(${spin}) scale(${r})`}
          fill="rgba(56,74,52,0.9)"
          stroke="rgba(214,206,170,0.5)"
          strokeWidth={0.008}
          strokeLinejoin="round"
        >
          {land.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {/* graticule: two lines are enough to say "sphere", more is noise */}
        <g stroke={alpha(P.warm, 0.10)} strokeWidth={1}>
          <line x1={0} y1={r} x2={r * 2} y2={r} />
          <line x1={r} y1={0} x2={r} y2={r * 2} />
        </g>
      </svg>
      {/* the terminator, on the disc, not on the land */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(84deg, rgba(6,14,18,0) 38%, rgba(6,14,18,0.62) 74%, rgba(6,14,18,0.95) 100%)',
        }}
      />
      {meridian ? (
        <div style={{position: 'absolute', left: r - 1, top: 0, width: 1, height: r * 2, background: alpha(P.warm, 0.18)}} />
      ) : null}
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset 0 0 0 1.4px rgba(255,232,200,0.30)`}} />
    </div>
  );
};

/* ────────────────────────────────  shots  ───────────────────────────────── */
// Nothing to export here: the compositions live in `src/Timeline.tsx`, which
// imports them by name, in the order `script.mjs` lists.


