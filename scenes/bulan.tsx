import React from 'react';
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

/* ────────────────────────────────  shots  ───────────────────────────────── */
// Nothing to export here: the compositions live in `src/Timeline.tsx`, which
// imports them by name, in the order `script.mjs` lists.


