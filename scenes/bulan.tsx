/* ============================================================================
   scenes/bulan.tsx — the topic file.

   One episode, one file. This is where the film decides how it looks: the
   palette, the type pairing, the way a number is set, the way a measurement is
   drawn, the way a cut happens, and every instrument the shots are built from.

   Nothing in here is a shared default. A different topic gets a different file
   (scenes/gps.tsx, scenes/otak.tsx) with a different skin, and the only thing
   that carries over is the discipline: hairline geometry, real values, no glow,
   no photograph, no 3D.

   Episode 01 — "Bulan menjauh 3,8 cm tiap tahun"
   ---------------------------------------------------------------------------
   Identity: SIDEREAL PLATE. A cold astronomical plate from an observatory that
   still prints on paper. Deep blue-black ground, bone type, one amber for the
   thing being measured, one signal cyan for the thing that was verified, one
   rust for the thing that is leaving. Everything is ruled: tick scales, leaders,
   brackets, graticules. Numbers are tabular and they move like instruments, not
   like text. Texture is paper fibre and halftone, never bloom.

   Sections
     01  identity ........ palette, type, motion, layout
     02  substrate ....... paper, grid, hatch, dust, edge shade
     03  typography ...... labels, figures, numerals, notes, sources
     04  instruments ..... ticks, brackets, leaders, gauges, plates, tables
     05  celestial ....... moon, earth, stars, ridge
     06  diagrams ........ corner cube, array, telescope, tide, coral
     07  stage ........... the frame every shot is built on
   ========================================================================= */

import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {alpha, clamp, eIn, eInOut, eOut, eOutQuint, hash, lerp, mix, smooth, span} from '../src/theme';

// Re-exported so a shot needs one import, not two: the plate and its arithmetic
// come from the same file, which is also the file that defines the look.
export {alpha, clamp, eIn, eInOut, eOut, eOutQuint, hash, lerp, mix, smooth, span};

/* ───────────────────────────  01 identity  ───────────────────────────────── */

export type Palette = {
  void: string; abyss: string; deep: string; mid: string; shallow: string;
  ink: string; muted: string; faint: string; grid: string;
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
export type Dot = {x: number; y: number; r: number; a: number};

export const ID: Identity = {
  id: 'sidereal',
  name: 'Sidereal Plate',

  palette: {
    void: '#06070B',      // the ground the plate sits on
    abyss: '#0A0C12',
    deep: '#10141C',
    mid: '#191F2A',
    shallow: '#26303E',
    ink: '#F2EDE3',       // bone paper
    muted: '#A9A498',     // weathered annotation
    faint: '#4C5261',
    grid: '#26303E',      // hairline blue-grey
    accent: '#E9A13B',    // amber: the measurement
    accentDim: '#A2701F',
    hot: '#D2603F',       // rust: something leaving
    warm: '#FFD9A0',
    alt: '#7FBFC9',       // signal cyan: verified, returned, counted
  },

  type: {
    // Newsreader has a real italic, which is what annotations are set in;
    // JetBrains Mono carries every number so digits never shift width.
    display: 'Newsreader',
    mono: 'JetBrains',
    editorial: 'Newsreader',
  },

  // cut: 'paper' — the frame advances like a sheet being drawn through a plate
  // press: 6 px of travel, a bone hairline crossing, then the new picture.
  motion: {cut: 'paper', punch: 1.022, grain: 0.055, ease: 'quint'},

  chrome: {watermark: true, marks: false, rail: false},
};

export const P = ID.palette;

export const fonts: Face[] = [
  {family: 'Newsreader', file: 'fonts/newsreader.woff2', weight: '200 800', style: 'normal'},
  {family: 'Newsreader', file: 'fonts/newsreader-italic.woff2', weight: '200 800', style: 'italic'},
  {family: 'JetBrains', file: 'fonts/jetbrains-400.woff2', weight: '400', style: 'normal'},
  {family: 'JetBrains', file: 'fonts/jetbrains-700.woff2', weight: '700', style: 'normal'},
];

export const T = {
  display: `'${ID.type.display}', Georgia, serif`,
  mono: `'${ID.type.mono}', ui-monospace, 'SF Mono', monospace`,
  italic: `'${ID.type.editorial}', Georgia, serif`,
};

/* Layout. The plate is 1440 × 2560; the composition lives inside a 1176-wide
   measure with a 132 px margin, and stops 700 px above the bottom so nothing
   important sits under the Shorts shelf. */
export const L = {
  w: 1440,
  h: 2560,
  left: 132,
  right: 1308,
  top: 196,
  bottom: 1860,
  measure: 1176,
  baseline: 8,
  caption: 1798,
};

/* The type scale, in px. Everything on screen is one of these sizes. */
export const SZ = {
  micro: 17,
  small: 21,
  body: 25,
  label: 27,
  sub: 34,
  head: 62,
  figure: 96,
  hero: 148,
  mega: 232,
};

/* ────────────────────────────  motion  ───────────────────────────────────── */
// Every shot is a set of layers that arrive in a stated order. These helpers
// keep that order inside the drawing code instead of inside a timeline file,
// so a shot can be read top to bottom and still be understood.

/** Local seconds -> 0..1 over [at, at + dur], eased. */
export const rev = (local: number, at: number, dur = 0.5, ease: (t: number) => number = eOut) =>
  ease(span(local, at, at + dur));

/** A stagger index -> seconds. Used to walk a row of ticks or a list of rows. */
export const step = (i: number, every = 0.035) => i * every;

/** Slow oscillator, for things that should never be perfectly still. */
export const breathe = (local: number, amp = 1, hz = 0.19, phase = 0) =>
  Math.sin((local * hz + phase) * Math.PI * 2) * amp;

/** A camera rig: pan + push applied as one transform. The only camera move. */
export const rig = (local: number, {from = 1, push = 0.02, dx = 0, dy = 0, dur = 6} = {}) => {
  const e = eInOut(clamp(local / dur));
  return `translate(${dx * e}px, ${dy * e}px) scale(${from + push * e})`;
};

/** Clip-path inset for a wipe. dir: 'x' | 'y' | '-x' | '-y'. */
export const wipe = (p: number, dir: 'x' | 'y' | '-x' | '-y' = 'x', soft = 0) => {
  const q = clamp(p);
  if (dir === 'x') return `inset(0 ${(1 - q) * 100}% 0 0)`;
  if (dir === '-x') return `inset(0 0 0 ${(1 - q) * 100}%)`;
  if (dir === 'y') return `inset(0 0 ${(1 - q) * 100}% 0)`;
  return `inset(${(1 - q) * 100}% 0 0 0)`;
};

/* ───────────────────────────  02 substrate  ──────────────────────────────── */
// The plate is printed, so the ground is paper: a fibre wash, a halftone screen
// at the edges, and a hairline grid that only shows where the drawing needs a
// coordinate system. No bloom, no light leaks, no lens artefacts.

/** Paper fibre. Static by design: the sheet does not move, the drawing does. */
export const Paper: React.FC<{opacity?: number; tint?: string; seed?: number}> = ({
  opacity = 0.5,
  tint = P.warm,
  seed = 3,
}) => {
  const url =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>" +
    "<filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.62' numOctaves='4' seed='" +
    seed +
    "' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/>" +
    "<feComponentTransfer><feFuncA type='linear' slope='0.55'/></feComponentTransfer></filter>" +
    "<rect width='240' height='240' filter='url(%23f)' fill='%23" +
    tint.slice(1) +
    "' opacity='0.5'/></svg>\")";
  return (
    <AbsoluteFill
      style={{
        opacity,
        pointerEvents: 'none',
        mixBlendMode: 'soft-light',
        backgroundImage: url,
        backgroundSize: '240px 240px',
      }}
    />
  );
};

/** The coordinate grid. Ruled, never dotted, and it fades before it reaches type. */
export const Grid: React.FC<{
  cell?: number; opacity?: number; color?: string; fade?: number;
}> = ({cell = 98, opacity = 0.5, color = P.grid, fade = 0.55}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
    <svg width={L.w} height={L.h}>
      <defs>
        <linearGradient id="gridfade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
          <stop offset={`${fade * 100}%`} stopColor="#fff" stopOpacity={0.28} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id="gridmask">
          <rect width={L.w} height={L.h} fill="url(#gridfade)" />
        </mask>
      </defs>
      <g mask="url(#gridmask)" stroke={color} strokeWidth={1}>
        {Array.from({length: Math.ceil(L.w / cell) + 1}).map((_, i) => (
          <line key={`v${i}`} x1={i * cell} y1={0} x2={i * cell} y2={L.h} opacity={i % 3 === 0 ? 0.55 : 0.22} />
        ))}
        {Array.from({length: Math.ceil(L.h / cell) + 1}).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * cell} x2={L.w} y2={i * cell} opacity={i % 3 === 0 ? 0.55 : 0.22} />
        ))}
      </g>
    </svg>
  </AbsoluteFill>
);

/** Halftone screen: dots that grow outward, used where a gradient would soften. */
export const Halftone: React.FC<{
  x?: number; y?: number; w?: number; h?: number; cell?: number;
  opacity?: number; color?: string; reverse?: boolean;
}> = ({x = 0, y = 0, w = L.w, h = L.h, cell = 13, opacity = 0.4, color = P.ink, reverse = false}) => {
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const u = i / cols;
      const v = j / rows;
      const d = reverse ? Math.hypot(0.5 - u, 0.5 - v) : Math.hypot(u - 0.5, v - 0.5);
      const r = clamp(d * 1.9) * (cell * 0.34);
      if (r < 0.35) continue;
      dots.push(<circle key={`${i}-${j}`} cx={x + i * cell + cell / 2} cy={y + j * cell + cell / 2} r={r} fill={color} />);
    }
  }
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      <svg width={L.w} height={L.h}>{dots}</svg>
    </AbsoluteFill>
  );
};

/** Diagonal hatching, the plate printer's way of building shade without light. */
export const HatchFill: React.FC<{
  id: string; color?: string; gap?: number; width?: number; angle?: number; opacity?: number;
}> = ({id, color = P.ink, gap = 7, width = 1, angle = 45, opacity = 0.5}) => (
  <defs>
    <pattern
      id={id}
      width={gap}
      height={gap}
      patternUnits="userSpaceOnUse"
      patternTransform={`rotate(${angle})`}
      opacity={opacity}
    >
      <line x1={0} y1={0} x2={0} y2={gap} stroke={color} strokeWidth={width} />
    </pattern>
  </defs>
);

/** Edge shade. Pure darkening in the plate's own colour, never a glow. */
export const EdgeShade: React.FC<{strength?: number; color?: string}> = ({
  strength = 0.9,
  color = P.void,
}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(126% 88% at 50% 44%, ${alpha(color, 0)} 34%, ${alpha(color, 0.42 * strength)} 74%, ${alpha(color, 0.94 * strength)} 100%)`,
    }}
  />
);

/** Dust: fixed specks of paper tooth, denser at the plate edges. */
export const dustField = (
  n: number,
  {seed = 1, w = L.w, h = L.h, min = 1, max = 3.2, edge = 0.35}: {seed?: number; w?: number; h?: number; min?: number; max?: number; edge?: number} = {}
): Dot[] => {
  const rnd = (i: number, k: number) => {
    const v = Math.sin(i * 127.1 + k * 311.7 + seed * 47.3) * 43758.5453;
    return v - Math.floor(v);
  };
  return Array.from({length: n}, (_, i) => {
    const x = rnd(i, 1) * w;
    const y = rnd(i, 2) * h;
    // specks cluster toward the edges, where a real plate picks up tooth
    const edgePull = edge * clamp(Math.hypot((x / w - 0.5) * 2, (y / h - 0.5) * 2) * 1.4);
    return {
      x,
      y,
      r: min + rnd(i, 3) * (max - min),
      a: clamp(0.06 + rnd(i, 4) * 0.4 + edgePull * 0.4),
    };
  });
};

export const Dust: React.FC<{n?: number; seed?: number; opacity?: number; color?: string}> = ({
  n = 420,
  seed = 5,
  opacity = 0.5,
  color = P.ink,
}) => {
  const dots = React.useMemo(() => dustField(n, {seed}), [n, seed]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: d.x,
            top: d.y,
            width: d.r,
            height: d.r,
            borderRadius: '50%',
            background: color,
            opacity: d.a,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/* ───────────────────────────  03 typography  ─────────────────────────────── */
// Type is part of the instrument: labels are mono and tracked, figures are
// tabular, annotations are serif italic with a leader rule. Nothing is centred
// unless it is a hero number; everything else sits on the left margin.

/** A section label: a rule, then small caps mono. Used above every figure. */
export const Label: React.FC<{
  text: string; x?: number; y: number; color?: string; rule?: number; on?: number; size?: number;
}> = ({text, x = L.left, y, color = P.muted, rule = 54, on = 1, size = SZ.micro}) => {
  if (on <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: on, display: 'flex', alignItems: 'center', gap: 16}}>
      {rule > 0 ? <div style={{width: rule * on, height: 1, background: alpha(color, 0.7)}} /> : null}
      <div
        style={{
          fontFamily: T.mono,
          fontSize: size,
          letterSpacing: '0.36em',
          color,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Right-aligned counter-label, for the far end of a rule. */
export const LabelR: React.FC<{text: string; x?: number; y: number; color?: string; on?: number; size?: number}> = ({
  text,
  x = L.right,
  y,
  color = P.muted,
  on = 1,
  size = SZ.micro,
}) => {
  if (on <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        right: L.w - x,
        top: y,
        opacity: on,
        fontFamily: T.mono,
        fontSize: size,
        letterSpacing: '0.36em',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/**
 * A figure: tabular numerals that can be counted, with an optional unit set
 * beside them in mono. This is the workhorse of the film — the number is the
 * picture, so it gets the plate's full attention.
 */
export const Figure: React.FC<{
  value: string; x?: number; y: number; size?: number; unit?: string; unitColor?: string;
  color?: string; align?: 'left' | 'center' | 'right'; on?: number; weight?: number; italic?: boolean;
  tracking?: number;
}> = ({
  value, x = L.left, y, size = SZ.figure, unit, unitColor = P.muted,
  color = P.ink, align = 'left', on = 1, weight = 300, italic = false, tracking = -0.03,
}) => {
  if (on <= 0) return null;
  const just = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
  const left = align === 'center' ? 0 : align === 'right' ? 0 : x;
  const width = align === 'center' ? L.w : align === 'right' ? L.w - x : undefined;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        right: align === 'right' ? L.w - x : undefined,
        top: y,
        width,
        textAlign: just,
        opacity: on,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        gap: 18,
      }}
    >
      <span
        style={{
          fontFamily: T.display,
          fontSize: size,
          fontWeight: weight,
          fontStyle: italic ? 'italic' : 'normal',
          letterSpacing: `${tracking}em`,
          color,
          lineHeight: 0.98,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
      {unit ? (
        <span
          style={{
            fontFamily: T.mono,
            fontSize: Math.max(19, size * 0.2),
            letterSpacing: '0.22em',
            color: unitColor,
            paddingBottom: size * 0.08,
            whiteSpace: 'nowrap',
          }}
        >
          {unit}
        </span>
      ) : null}
    </div>
  );
};

/**
 * A numeral counter: displays a value that is interpolated from `from` to `to`
 * over `dur`, with the decimal separator the language uses. This is what makes
 * a number feel measured rather than printed.
 */
export const Counter: React.FC<{
  from: number; to: number; at: number; dur: number; local: number;
  digits?: number; sep?: boolean; suffix?: string; prefix?: string;
}> = ({from, to, at, dur, local, digits = 0, sep = true, suffix = '', prefix = ''}) => {
  const p = clamp((local - at) / dur);
  const v = lerp(from, to, eOut(p));
  const txt = sep
    ? v.toLocaleString('id-ID', {minimumFractionDigits: digits, maximumFractionDigits: digits})
    : v.toFixed(digits).replace('.', ',');
  return (
    <>
      {prefix}
      {txt}
      {suffix}
    </>
  );
};

/** Serif italic annotation with a leader rule attached to a point. */
export const Note: React.FC<{
  text: string; x: number; y: number; to?: [number, number]; color?: string; on?: number;
  size?: number; side?: 'left' | 'right'; width?: number;
}> = ({text, x, y, to, color = P.muted, on = 1, size = SZ.small, side = 'right', width = 360}) => {
  if (on <= 0) return null;
  const anchor = side === 'right' ? 'left' : 'right';
  return (
    <>
      {to ? (
        <svg style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}} width={L.w} height={L.h}>
          <line
            x1={x}
            y1={y}
            x2={to[0]}
            y2={to[1]}
            stroke={alpha(color, 0.55 * on)}
            strokeWidth={1}
            strokeDasharray="1 4"
          />
        </svg>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: side === 'right' ? x + 14 : undefined,
          right: side === 'left' ? L.w - x + 14 : undefined,
          top: y - size * 0.72,
          width,
          textAlign: anchor === 'left' ? 'left' : 'right',
          opacity: on,
          fontFamily: T.italic,
          fontStyle: 'italic',
          fontSize: size,
          lineHeight: 1.32,
          color,
        }}
      >
        {text}
      </div>
    </>
  );
};

/** Source line. Every claim on screen has a datum; this is where it is named. */
export const Source: React.FC<{text: string; on?: number; y?: number; x?: number}> = ({
  text,
  on = 1,
  y = 1738,
  x = L.left,
}) => {
  if (on <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        maxWidth: L.measure,
        opacity: on * 0.5,
        fontFamily: T.mono,
        fontSize: 16,
        letterSpacing: '0.18em',
        color: P.faint,
        lineHeight: 1.6,
      }}
    >
      {text}
    </div>
  );
};

/* ───────────────────────────  04 instruments  ────────────────────────────── */
// The vocabulary of the plate: ruled scales, brackets, leaders, gauges, table
// rows, status plates. Every one of them is drawn in code from a real value.

/** A horizontal tick scale. Reveals left to right; optional labelled majors. */
export const Ticks: React.FC<{
  x0: number; x1: number; y: number; n?: number; major?: number;
  reveal?: number; color?: string; height?: number; labels?: string[];
  labelColor?: string; labelSize?: number; dir?: 1 | -1;
}> = ({
  x0, x1, y, n = 40, major = 5, reveal = 1, color = P.muted,
  height = 16, labels, labelColor, labelSize = SZ.micro, dir = 1,
}) => {
  const w = (x1 - x0) * clamp(reveal);
  if (w <= 0.5) return null;
  const out: React.ReactNode[] = [];
  out.push(<line key="base" x1={x0} y1={y} x2={x0 + w} y2={y} stroke={alpha(color, 0.5)} strokeWidth={1} />);
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    if (x > x0 + w + 0.5) break;
    const isMajor = i % major === 0;
    const isMid = i % Math.max(1, Math.round(major / 2)) === 0;
    const h = isMajor ? height : isMid ? height * 0.62 : height * 0.34;
    out.push(
      <line
        key={`t${i}`}
        x1={x}
        y1={y}
        x2={x}
        y2={y + h * dir}
        stroke={alpha(color, isMajor ? 0.85 : isMid ? 0.5 : 0.28)}
        strokeWidth={1}
      />
    );
    if (isMajor && labels && labels[i / major]) {
      out.push(
        <text
          key={`l${i}`}
          x={x}
          y={y + (dir === 1 ? height + labelSize + 6 : -height - 12)}
          fill={labelColor ?? color}
          fontFamily={T.mono}
          fontSize={labelSize}
          letterSpacing={1.4}
          textAnchor="middle"
          opacity={0.85}
        >
          {labels[i / major]}
        </text>
      );
    }
  }
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}} width={L.w} height={L.h}>
      {out}
    </svg>
  );
};

/** A measured span: rule with serifed end caps and a label above the middle. */
export const Span: React.FC<{
  x0: number; x1: number; y: number; label: string; sub?: string;
  reveal?: number; on?: number; color?: string; fg?: string; up?: boolean; size?: number;
}> = ({x0, x1, y, label, sub, reveal = 1, on = 1, color = P.accent, fg = P.ink, up = true, size = SZ.label}) => {
  if (on <= 0) return null;
  const w = (x1 - x0) * clamp(reveal);
  const cx = x0 + (x1 - x0) / 2;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={x0} y1={y} x2={x0 + w} y2={y} stroke={color} strokeWidth={1.4} />
        <line x1={x0} y1={y - 13} x2={x0} y2={y + 13} stroke={color} strokeWidth={1.4} />
        <line x1={x0 + w} y1={y - 13} x2={x0 + w} y2={y + 13} stroke={color} strokeWidth={1.4} />
        {/* serifs: two small inward flicks at each cap, the surveyor's mark */}
        <line x1={x0 + 2} y1={y - 22} x2={x0 + 2} y2={y - 13} stroke={alpha(color, 0.8)} strokeWidth={1} />
        <line x1={x0 + w - 2} y1={y - 22} x2={x0 + w - 2} y2={y - 13} stroke={alpha(color, 0.8)} strokeWidth={1} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: cx - 340,
          width: 680,
          top: up ? y - 22 - size - 12 : y + 26,
          textAlign: 'center',
          fontFamily: T.mono,
          fontSize: size,
          fontWeight: 700,
          letterSpacing: '0.16em',
          color,
        }}
      >
        {label}
        {sub ? (
          <div style={{marginTop: 9, fontSize: SZ.micro, fontWeight: 400, letterSpacing: '0.26em', color: alpha(fg, 0.7)}}>
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** A vertical rule with end caps: the mark of a measured height. */
export const VSpan: React.FC<{x: number; y0: number; y1: number; label?: string; reveal?: number; color?: string}> = ({
  x, y0, y1, label, reveal = 1, color = P.accent,
}) => {
  const h = (y1 - y0) * clamp(reveal);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={x} y1={y0} x2={x} y2={y0 + h} stroke={color} strokeWidth={1.2} />
        <line x1={x - 10} y1={y0} x2={x + 10} y2={y0} stroke={color} strokeWidth={1.2} />
        <line x1={x - 10} y1={y0 + h} x2={x + 10} y2={y0 + h} stroke={color} strokeWidth={1.2} />
      </svg>
      {label ? (
        <div
          style={{
            position: 'absolute',
            left: x + 20,
            top: y0 + h / 2 - 14,
            fontFamily: T.mono,
            fontSize: SZ.small,
            letterSpacing: '0.2em',
            color,
            opacity: reveal,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/** Corner brackets. A plate registration mark, drawn from four lines. */
export const Brackets: React.FC<{x0: number; y0: number; x1: number; y1: number; len?: number; color?: string; on?: number}> = ({
  x0, y0, x1, y1, len = 34, color = P.ink, on = 1,
}) => {
  if (on <= 0) return null;
  const c = alpha(color, 0.5 * on);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}} width={L.w} height={L.h}>
      <g stroke={c} strokeWidth={1.4} fill="none">
        <path d={`M${x0} ${y0 + len} L${x0} ${y0} L${x0 + len} ${y0}`} />
        <path d={`M${x1 - len} ${y0} L${x1} ${y0} L${x1} ${y0 + len}`} />
        <path d={`M${x0} ${y1 - len} L${x0} ${y1} L${x0 + len} ${y1}`} />
        <path d={`M${x1 - len} ${y1} L${x1} ${y1} L${x1} ${y1 - len}`} />
      </g>
    </svg>
  );
};

/**
 * A gauge: an arc dial with a needle and a swept scale. Used where a value has
 * a range and the range is the point. Values are real: the arc is the scale.
 */
export const Gauge: React.FC<{
  cx: number; cy: number; r: number; value: number; min?: number; max?: number;
  label?: string; unit?: string; on?: number; color?: string; track?: string;
  ticks?: number; sweep?: number; decimals?: number;
}> = ({
  cx, cy, r, value, min = 0, max = 1, label, unit, on = 1, color = P.accent,
  track = P.faint, ticks = 60, sweep = 0.86, decimals = 0,
}) => {
  if (on <= 0) return null;
  const a0 = -90 - sweep * 180 * 0.5;
  const a1 = -90 + sweep * 180 * 0.5;
  const frac = clamp((value - min) / (max - min));
  const ang = lerp(a0, a1, frac);
  const pt = (a: number, rad: number) => [cx + Math.cos((a * Math.PI) / 180) * rad, cy + Math.sin((a * Math.PI) / 180) * rad];
  const arc = (a: number, b: number, rad: number) => {
    const [x0, y0] = pt(a, rad);
    const [x1, y1] = pt(b, rad);
    const large = Math.abs(b - a) > 180 ? 1 : 0;
    return `M${x0} ${y0} A${rad} ${rad} 0 ${large} 1 ${x1} ${y1}`;
  };
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={arc(a0, a1, r)} fill="none" stroke={alpha(track, 0.55)} strokeWidth={1.4} />
        <path d={arc(a0, ang, r)} fill="none" stroke={color} strokeWidth={3} />
        {Array.from({length: ticks + 1}).map((_, i) => {
          const a = lerp(a0, a1, i / ticks);
          const big = i % 10 === 0;
          const [x0, y0] = pt(a, r - (big ? 20 : 11));
          const [x1, y1] = pt(a, r - 4);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={alpha(P.ink, big ? 0.55 : 0.26)} strokeWidth={1} />;
        })}
        <line x1={cx} y1={cy} x2={pt(ang, r - 8)[0]} y2={pt(ang, r - 8)[1]} stroke={color} strokeWidth={1.8} />
        <circle cx={cx} cy={cy} r={4.5} fill={color} />
      </svg>
      {label ? (
        <div
          style={{
            position: 'absolute',
            left: cx - 260,
            width: 520,
            top: cy + r * 0.36,
            textAlign: 'center',
            fontFamily: T.display,
            fontSize: Math.round(r * 0.46),
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: P.ink,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {label}
          {unit ? (
            <span style={{fontFamily: T.mono, fontSize: SZ.small, letterSpacing: '0.2em', color: P.muted, marginLeft: 10}}>
              {unit}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

/** A ruler with a travelling readout, for quantities that are being read off. */
export const Ruler: React.FC<{
  x0: number; x1: number; y: number; marks: number; travel?: number;
  label?: string; color?: string; unit?: number;
}> = ({x0, x1, y, marks = 48, travel = 1, label, color = P.ink, unit = 10}) => {
  const w = x1 - x0;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={x0} y1={y} x2={x1} y2={y} stroke={alpha(color, 0.42)} strokeWidth={1} />
        {Array.from({length: marks + 1}).map((_, i) => {
          const x = x0 + (w * i) / marks;
          const big = i % 5 === 0;
          const h = big ? 26 : i % 1 === 0 ? 13 : 8;
          return <line key={i} x1={x} y1={y - h} x2={x} y2={y} stroke={alpha(color, big ? 0.7 : 0.3)} strokeWidth={1} />;
        })}
        {/* the travelling index */}
        <g transform={`translate(${x0 + w * clamp(travel)} 0)`}>
          <line x1={0} y1={y - 52} x2={0} y2={y + 16} stroke={P.accent} strokeWidth={1.6} />
          <path d={`M-7 ${y - 52} L7 ${y - 52} L0 ${y - 42} Z`} fill={P.accent} />
          <rect x={0} y={y + 18} width={unit} height={1} fill={P.accent} />
        </g>
      </svg>
      {label ? (
        <div
          style={{
            position: 'absolute',
            left: x0 + w * clamp(travel) + 16,
            top: y - 84,
            fontFamily: T.mono,
            fontSize: SZ.small,
            letterSpacing: '0.14em',
            color: P.accent,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/** A data table. Rows arrive one at a time; the active row is marked. */
export const Table: React.FC<{
  x: number; y: number; width: number; rows: string[][]; head?: string[];
  colWidths?: number[]; on?: number; rowH?: number; active?: number; size?: number;
}> = ({x, y, width, rows, head, colWidths, on = 1, rowH = 62, active = -1, size = SZ.small}) => {
  if (on <= 0) return null;
  const cols = colWidths ?? (head ?? rows[0]).map(() => width / (head ?? rows[0]).length);
  const mono = (i: number) => i > 0;
  return (
    <div style={{position: 'absolute', left: x, top: y, width, opacity: on}}>
      {head ? (
        <div style={{display: 'flex', borderBottom: `1px solid ${alpha(P.ink, 0.3)}`, paddingBottom: 12, marginBottom: 6}}>
          {head.map((h, i) => (
            <div
              key={i}
              style={{
                width: cols[i],
                fontFamily: T.mono,
                fontSize: SZ.micro,
                letterSpacing: '0.24em',
                color: P.muted,
                textAlign: i === 0 ? 'left' : 'right',
              }}
            >
              {h}
            </div>
          ))}
        </div>
      ) : null}
      {rows.map((r, j) => {
        const p = clamp(on * 1.6 - j * 0.14);
        return (
          <div
            key={j}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              height: rowH,
              borderBottom: `1px solid ${alpha(P.ink, active === j ? 0.22 : 0.09)}`,
              opacity: p,
              transform: `translateX(${(1 - p) * -14}px)`,
              background: active === j ? alpha(P.accent, 0.055) : 'transparent',
            }}
          >
            {r.map((c, i) => (
              <div
                key={i}
                style={{
                  width: cols[i],
                  fontFamily: mono(i) ? T.mono : T.display,
                  fontSize: i === 0 ? size : size * 0.92,
                  letterSpacing: mono(i) ? '0.06em' : '0',
                  color: active === j ? (i === 0 ? P.ink : P.accent) : i === 0 ? P.ink : P.muted,
                  textAlign: i === 0 ? 'left' : 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {c}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

/** A status capsule: a dot, a word, a rule. Reads as "verified" in one glance. */
export const Status: React.FC<{text: string; x: number; y: number; on?: number; color?: string; dot?: boolean}> = ({
  text, x, y, on = 1, color = P.alt, dot = true,
}) => {
  if (on <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: on, display: 'flex', alignItems: 'center', gap: 12}}>
      {dot ? <div style={{width: 7, height: 7, borderRadius: '50%', background: color}} /> : null}
      <div style={{fontFamily: T.mono, fontSize: SZ.micro, letterSpacing: '0.3em', color}}>{text}</div>
    </div>
  );
};

/* ───────────────────────────  05 celestial  ──────────────────────────────── */
// The Moon is drawn as an engraved plate: hard-edged maria, ringed craters at
// 1.5 px, a hatched terminator. No gradient sphere, no bloom. It is the one
// object in the film allowed to be beautiful, so everything else stays ruled.

export const MoonDisc: React.FC<{
  cx: number; cy: number; r: number; detail?: number; lit?: number; tilt?: number;
  opacity?: number; seed?: number; mask?: boolean; terminator?: boolean; rim?: number;
}> = ({cx, cy, r, detail = 1, lit = 1, tilt = 0, opacity = 1, seed = 11, mask = true, terminator = true, rim = 1.6}) => {
  // Maria: fixed, hand-placed seas, in disc space 0..1. They are the shape
  // memory of the Moon, so they may not be randomised.
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

  const craters = React.useMemo(() => {
    const n = Math.round(64 * detail) + 16;
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

  // the ray system of Tycho: a few long thin rays, which is what makes the
  // disc legible at 120 px as well as at 480 px
  const rays = React.useMemo(
    () =>
      Array.from({length: 7}, (_, i) => {
        const a = -1.9 + i * 0.36;
        return {a, len: 0.42 + hash(i, 9, seed) * 0.4, w: 0.6 + hash(i, 8, seed) * 1.4};
      }),
    [seed]
  );

  const sun = 0.24 + lit * 0.28;
  const uid = `moon-${Math.round(cx)}-${Math.round(cy)}-${Math.round(r)}-${seed}`;

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
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: mask ? 'hidden' : 'visible',
          background: `radial-gradient(circle at ${sun * 100}% 30%, #F7EEDB 0%, #EDE0C8 26%, #DACAAE 54%, #BCA886 80%, #8C7856 100%)`,
        }}
      >
        <svg width={r * 2} height={r * 2} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0}}>
          <defs>
            <clipPath id={`${uid}-clip`}>
              <circle cx={50} cy={50} r={50} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${uid}-clip)`}>
            {/* maria */}
            <g fill="#8E7B5E" opacity={0.62}>
              {seas.map((s, i) => (
                <ellipse key={i} cx={s.cx * 100} cy={s.cy * 100} rx={s.w * 50} ry={s.h * 50} transform={`rotate(${s.rot} ${s.cx * 100} ${s.cy * 100})`} />
              ))}
            </g>
            {/* rays from the southern highlands */}
            <g stroke="#FBF3E2" strokeLinecap="round" opacity={0.22}>
              {rays.map((ray, i) => (
                <line
                  key={i}
                  x1={50 + Math.cos(ray.a) * 12}
                  y1={72 + Math.sin(ray.a) * 12}
                  x2={50 + Math.cos(ray.a) * 12 + Math.cos(ray.a) * ray.len * 46}
                  y2={72 + Math.sin(ray.a) * 12 + Math.sin(ray.a) * ray.len * 46}
                  strokeWidth={ray.w * 0.5}
                />
              ))}
            </g>
            {/* craters: rim + floor + a shadow on the sunward side */}
            {craters.map((c, i) => (
              <g key={i}>
                <circle cx={c.x * 100} cy={c.y * 100} r={c.s * 100} fill="#7E6C51" opacity={c.a * 0.34} />
                <circle cx={c.x * 100} cy={c.y * 100} r={c.s * 100} fill="none" stroke="#FFF6E4" strokeWidth={0.34} opacity={c.a * 0.5} />
              </g>
            ))}
            {/* the terminator: hatching, not a gradient */}
            {terminator ? (
              <g opacity={0.5}>
                <rect x={50 + (1 - lit) * 22} y={0} width={60} height={100} fill="url(#hatch)" />
              </g>
            ) : null}
          </g>
          <defs>
            <pattern id="hatch" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
              <line x1={0} y1={0} x2={0} y2={2.2} stroke="#2A2116" strokeWidth={0.55} />
            </pattern>
          </defs>
        </svg>
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          boxShadow: `inset 0 0 0 ${rim}px ${alpha('#FFE9C8', 0.34)}, inset ${-r * 0.06}px ${-r * 0.05}px ${r * 0.16}px ${alpha('#3A1E0E', 0.22)}`,
        }}
      />
    </div>
  );
};

/**
 * The Moon in section: a dark regolith plain with a lit horizon, a gravel band
 * and a scatter of stones. Deliberately almost black — the ground is a horizon,
 * not a surface study, and the Earth (or the sky) has to stay the subject.
 */
export const MoonGround: React.FC<{y: number; opacity?: number; rocks?: number; seed?: number}> = ({
  y, opacity = 1, rocks = 46, seed = 7,
}) => {
  const field = React.useMemo(
    () =>
      Array.from({length: rocks}, (_, i) => {
        const x = hash(i, 1, seed) * L.w;
        const near = hash(i, 2, seed);
        return {
          x,
          y: y + 8 + near * 200,
          w: 5 + hash(i, 3, seed) * 26 * (1 - near * 0.5),
          h: 3 + hash(i, 4, seed) * 10 * (1 - near * 0.5),
          c: 0.12 + hash(i, 5, seed) * 0.3,
        };
      }),
    [rocks, seed, y]
  );
  return (
    <div style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          {/* the plain: three printed bands, no smooth falloff */}
          <pattern id="mgravel" width={9} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
            <line x1={0} y1={0} x2={0} y2={6} stroke={alpha(P.warm, 0.16)} strokeWidth={0.8} />
          </pattern>
        </defs>
        <rect x={0} y={y} width={L.w} height={L.h - y} fill="#07080A" />
        <rect x={0} y={y} width={L.w} height={160} fill="#0C0B0A" />
        <rect x={0} y={y} width={L.w} height={160} fill="url(#mgravel)" opacity={0.5} />
        <rect x={0} y={y + 160} width={L.w} height={L.h - y - 160} fill="#060708" />
        {/* the horizon edge: a lit line, then a second one as the far crest */}
        <line x1={0} y1={y} x2={L.w} y2={y} stroke={alpha(P.warm, 0.7)} strokeWidth={1.8} />
        <line x1={0} y1={y + 160} x2={L.w} y2={y + 160} stroke={alpha(P.warm, 0.14)} strokeWidth={1} />
        {field.map((s, i) => (
          <ellipse key={i} cx={s.x} cy={s.y} rx={s.w / 2} ry={s.h / 2} fill="#000000" opacity={s.c} />
        ))}
        {field.slice(0, 10).map((s, i) => (
          <ellipse key={`l${i}`} cx={s.x} cy={s.y - 1} rx={s.w / 2} ry={s.h / 2} fill="none" stroke={alpha(P.warm, 0.18)} strokeWidth={0.8} />
        ))}
      </svg>
    </div>
  );
};

/** Stars: three sizes, dim at the edges, with an optional slow twinkle. */
export const Stars: React.FC<{
  n?: number; h?: number; seed?: number; twinkle?: boolean; opacity?: number; color?: string;
}> = ({n = 260, h = 2100, seed = 1, twinkle = false, opacity = 1, color = P.ink}) => {
  const field = React.useMemo(() => {
    const rnd = (i: number, k: number) => {
      const v = Math.sin(i * (12.9898 + seed * 2.17) + k * (78.233 + seed * 1.31)) * 43758.5453;
      return v - Math.floor(v);
    };
    return Array.from({length: n}, (_, i) => ({
      x: rnd(i, 1) * L.w,
      y: rnd(i, 2) * h,
      s: 1.2 + Math.pow(rnd(i, 3), 2) * 2.6,
      o: 0.14 + rnd(i, 4) * 0.62,
      ph: rnd(i, 5) * 6.28,
      warm: rnd(i, 6) > 0.82,
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
            borderRadius: s.s > 2.6 ? '50%' : 0,
            background: s.warm ? P.warm : color,
            opacity: twinkle ? s.o * (0.66 + 0.34 * Math.sin(frame * 0.05 + s.ph)) : s.o * 0.74,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** Polaris-style cross flare, for the two or three brightest stars only. */
export const StarFlare: React.FC<{x: number; y: number; size?: number; on?: number; color?: string}> = ({
  x, y, size = 26, on = 1, color = P.warm,
}) => {
  if (on <= 0) return null;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}} width={L.w} height={L.h}>
      <line x1={x - size} y1={y} x2={x + size} y2={y} stroke={alpha(color, 0.7)} strokeWidth={1} />
      <line x1={x} y1={y - size} x2={x} y2={y + size} stroke={alpha(color, 0.7)} strokeWidth={1} />
      <circle cx={x} cy={y} r={1.8} fill={color} />
    </svg>
  );
};

/** Turn "x,y x,y x,y" into a ridge path: midpoint quadratics, so the horizon
    curves the way land curves instead of reading as a line chart. */
const ridgePath = (pts: string, smooth: boolean): string => {
  const p = pts
    .trim()
    .split(/\s+/)
    .map((s) => s.split(',').map(Number) as [number, number]);
  if (!p.length) return '';
  if (!smooth) return `${pts} ${p[p.length - 1][0]},${L.h} 0,${L.h}`;
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2;
    const my = (p[i][1] + p[i + 1][1]) / 2;
    d += ` Q${p[i][0]} ${p[i][1]} ${mx} ${my}`;
  }
  const last = p[p.length - 1];
  d += ` T${last[0]} ${last[1]} L${L.w} ${last[1]} L${L.w} ${L.h} L0 ${L.h} Z`;
  return d;
};

/** A horizon: curved layers, window lights, an optional warm band. */
export const Ridge: React.FC<{
  layers: {points: string; fill: string; stroke?: string; strokeWidth?: number}[];
  smooth?: boolean;
  lights?: [number, number][];
  lightSize?: number;
  band?: {top: number; height: number; from: string; to: string} | null;
  opacity?: number;
}> = ({layers, smooth = true, lights = [], lightSize = 5, band = null, opacity = 1}) => {
  if (opacity <= 0) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none'}}>
      {band ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: band.top,
            width: L.w,
            height: band.height,
            background: `linear-gradient(180deg, ${band.from} 0%, ${band.to} 100%)`,
          }}
        />
      ) : null}
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        {layers.map((l, i) => (
          <path key={i} d={ridgePath(l.points, smooth)} fill={l.fill} stroke={l.stroke} strokeWidth={l.strokeWidth} />
        ))}
      </svg>
      {/* Lights are marks, not bulbs: a lit square with a one-pixel cross, so
          the ground reads as inhabited without a single glow on the plate. */}
      {lights.map(([x, y], i) => (
        <div key={`w${i}`} style={{position: 'absolute', left: x, top: y, width: lightSize, height: lightSize}}>
          <div style={{position: 'absolute', inset: 0, background: P.warm, opacity: 0.72}} />
          <div style={{position: 'absolute', left: -lightSize * 0.9, top: lightSize / 2, width: lightSize * 2.8, height: 1, background: alpha(P.warm, 0.3)}} />
          <div style={{position: 'absolute', left: lightSize / 2, top: -lightSize * 0.9, width: 1, height: lightSize * 2.8, background: alpha(P.warm, 0.3)}} />
        </div>
      ))}
    </div>
  );
};

/** The Earth, drawn once and reused: ocean, hard coastlines, terminator, rim. */
export const EarthDisc: React.FC<{
  cx: number; cy: number; r: number; on?: number; spin?: number; meridian?: boolean; detail?: number;
}> = ({cx, cy, r, on = 1, spin = 0, meridian = false, detail = 1}) => {
  if (on <= 0) return null;
  const land = [
    'M -0.66 -0.44 L -0.52 -0.52 L -0.40 -0.46 L -0.34 -0.34 L -0.38 -0.24 L -0.30 -0.14 L -0.33 -0.02 L -0.24 0.06 L -0.20 0.18 L -0.10 0.24 L -0.06 0.36 L -0.14 0.44 L -0.24 0.40 L -0.30 0.30 L -0.40 0.26 L -0.46 0.14 L -0.52 0.02 L -0.58 -0.10 L -0.62 -0.22 L -0.70 -0.30 Z',
    'M 0.02 -0.52 L 0.14 -0.44 L 0.10 -0.32 L 0.20 -0.24 L 0.18 -0.10 L 0.28 0.00 L 0.26 0.14 L 0.34 0.24 L 0.28 0.38 L 0.18 0.46 L 0.10 0.40 L 0.06 0.28 L -0.02 0.20 L -0.06 0.06 L -0.02 -0.06 L -0.08 -0.18 L -0.04 -0.30 L 0.00 -0.40 Z',
    'M 0.30 -0.50 L 0.46 -0.54 L 0.60 -0.46 L 0.66 -0.32 L 0.58 -0.22 L 0.64 -0.12 L 0.54 -0.02 L 0.44 0.02 L 0.36 -0.06 L 0.28 -0.16 L 0.24 -0.30 L 0.26 -0.42 Z',
    'M 0.34 0.30 L 0.46 0.26 L 0.54 0.34 L 0.50 0.44 L 0.38 0.44 L 0.32 0.38 Z',
  ];
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
        background: 'radial-gradient(circle at 32% 28%, #6F858C 0%, #4B6672 28%, #324A56 60%, #182B33 86%, #0C1A20 100%)',
      }}
    >
      <svg width={r * 2} height={r * 2} style={{position: 'absolute', left: 0, top: 0}}>
        <g
          transform={`translate(${r} ${r}) rotate(${spin}) scale(${r})`}
          fill="rgba(46,64,42,0.92)"
          stroke="rgba(196,208,158,0.42)"
          strokeWidth={0.006}
          strokeLinejoin="round"
        >
          {land.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g stroke={alpha(P.warm, 0.1)} strokeWidth={1}>
          <line x1={0} y1={r} x2={r * 2} y2={r} />
          <line x1={r} y1={0} x2={r} y2={r * 2} />
          {detail > 1
            ? [0.5, 1.5].map((k) => <ellipse key={k} cx={r} cy={r} rx={r * k * 0.5} ry={r} fill="none" />)
            : null}
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(84deg, rgba(6,14,18,0) 38%, rgba(6,14,18,0.62) 74%, rgba(6,14,18,0.95) 100%)',
        }}
      />
      {meridian ? <div style={{position: 'absolute', left: r - 1, top: 0, width: 1, height: r * 2, background: alpha(P.warm, 0.18)}} /> : null}
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px rgba(255,232,200,0.30)'}} />
    </div>
  );
};

/** A photon: a short bright dash with a fading tail, travelling on a path. */
export const Photon: React.FC<{
  x: number; y: number; angle: number; len?: number; on?: number; color?: string; trail?: number;
}> = ({x, y, angle, len = 46, on = 1, color = P.warm, trail = 180}) => {
  if (on <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <linearGradient id="ptrail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0} />
            <stop offset="100%" stopColor={color} stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <g transform={`translate(${x} ${y}) rotate(${angle})`}>
          <rect x={-trail} y={-1} width={trail} height={2} fill="url(#ptrail)" />
          <rect x={-len} y={-1.6} width={len} height={3.2} fill={color} opacity={0.9} />
          <circle cx={0} cy={0} r={3.2} fill={color} />
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────  06 diagrams  ───────────────────────────────── */
// Everything in this film that shows how something works is a diagram made of
// rules and hatching. These are the ones the episode needs.

/** A corner cube: three mutually perpendicular mirrors, drawn in plan. */
export const CornerCube: React.FC<{x: number; y: number; s: number; on?: number; beam?: number; color?: string}> = ({
  x, y, s, on = 1, beam = 0, color = P.accent,
}) => {
  if (on <= 0) return null;
  // the cube seen face-on: an equilateral triangle with the two internal edges
  const h = s * 0.866;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <g stroke={P.ink} fill="none" strokeWidth={1.4}>
          <path d={`M${x} ${y} L${x + s} ${y} L${x + s / 2} ${y - h} Z`} opacity={0.85} />
          <path d={`M${x + s / 2} ${y - h} L${x + s / 2} ${y - h * 0.34}`} opacity={0.5} />
          <path d={`M${x + s / 2} ${y - h * 0.34} L${x + s * 0.16} ${y}`} opacity={0.5} />
          <path d={`M${x + s / 2} ${y - h * 0.34} L${x + s * 0.84} ${y}`} opacity={0.5} />
        </g>
        {/* the incoming beam splits at the three faces and returns: three
            short segments inside the cube, which is what a corner cube does */}
        <g stroke={color} strokeWidth={1.6} opacity={0.35 + beam * 0.65}>
          <line x1={x + s / 2} y1={y - h * 0.92} x2={x + s / 2} y2={y - h * 0.5} />
          <line x1={x + s / 2} y1={y - h * 0.5} x2={x + s * 0.3} y2={y - h * 0.2} />
          <line x1={x + s / 2} y1={y - h * 0.5} x2={x + s * 0.7} y2={y - h * 0.2} />
          <line x1={x + s / 2} y1={y - h * 0.5} x2={x + s / 2} y2={y - h * 0.18} />
        </g>
      </svg>
    </div>
  );
};

/**
 * The retroreflector array: a panel of corner cubes, drawn as a true axonometric
 * grid — two basis vectors, every cell a parallelogram of the same two vectors,
 * so the cells tile and the panel reads as a plate of prisms rather than as a
 * pattern. Each cell rises into place as `fill` advances.
 */
export const RetroArray: React.FC<{
  cx: number; cy: number; cols?: number; rows?: number; cell?: number;
  dx?: number; dy?: number; skew?: number; tilt?: number; fill?: number;
  on?: number; seed?: number;
}> = ({cx, cy, cols = 10, rows = 10, cell = 44, skew = 0.42, tilt = 0.3, fill = 1, on = 1, seed = 21}) => {
  if (on <= 0) return null;
  const du: [number, number] = [cell, -cell * 0.06];              // across a row
  const dv: [number, number] = [-cell * skew, -cell * tilt];      // up a column
  const W = cols * du[0] + rows * dv[0];
  const H = rows * Math.abs(dv[1]) + cell * 0.1;
  const ox = cx + (W - cols * du[0]) / 2;   // centre the parallelogram
  const oy = cy + rows * Math.abs(dv[1]) * 0.5;

  const AT = (u: number, v: number): [number, number] => [
    ox + u * du[0] + v * dv[0],
    oy + u * du[1] + v * dv[1],
  ];

  const cells: React.ReactNode[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const order = (j / rows) * 0.6 + (i / cols) * 0.4;
      const p = clamp((fill - order * 0.5) / 0.3);
      if (p <= 0) continue;
      const lift = (1 - p) * 16;
      const [x0, y0] = AT(i, j);
      const [x1, y1] = AT(i + 0.92, j + 0.06);
      const [x2, y2] = AT(i + 0.92, j + 0.92);
      const [x3, y3] = AT(i + 0.06, j + 0.92);
      const light = hash(i, j, seed);
      cells.push(
        <g key={`${i}-${j}`} opacity={p} transform={`translate(0 ${lift})`}>
          <path
            d={`M${x0} ${y0} L${x1} ${y1} L${x2} ${y2} L${x3} ${y3} Z`}
            fill={alpha(P.warm, 0.06 + light * 0.16)}
            stroke={alpha(P.ink, 0.3)}
            strokeWidth={1}
          />
          {/* the corner: one shared edge catches the light, one stays in shadow */}
          <path d={`M${x3} ${y3} L${x0} ${y0} L${x1} ${y1}`} fill="none" stroke={alpha(P.warm, 0.5)} strokeWidth={1.4} />
        </g>
      );
    }
  }

  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        {/* the panel's own edge, before any cell arrives */}
        <path
          d={`M${AT(0, 0)[0]} ${AT(0, 0)[1]} L${AT(cols, 0)[0]} ${AT(cols, 0)[1]} L${AT(cols, rows)[0]} ${AT(cols, rows)[1]} L${AT(0, rows)[0]} ${AT(0, rows)[1]} Z`}
          fill="none"
          stroke={alpha(P.accent, 0.35)}
          strokeWidth={1}
          strokeDasharray="5 7"
          opacity={clamp(fill * 3) * 0.6}
        />
        {cells}
      </svg>
    </div>
  );
};

/** A telescope in elevation, drawn as a tube on a yoke. */
export const Telescope: React.FC<{
  x: number; y: number; s?: number; aim?: number; on?: number; fired?: number;
}> = ({x, y, s = 1, aim = -38, on = 1, fired = 0}) => {
  if (on <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(${x} ${y}) scale(${s})`}>
          {/* yoke */}
          <path d={`M-54 0 L-54 -74 L54 -74 L54 0`} fill="none" stroke={alpha(P.ink, 0.5)} strokeWidth={2} />
          <line x1={-84} y1={0} x2={84} y2={0} stroke={alpha(P.ink, 0.7)} strokeWidth={3} />
          <line x1={-54} y1={-74} x2={0} y2={-74} stroke={alpha(P.ink, 0.35)} strokeWidth={1.4} />
          {/* the tube, rotating about the yoke axis */}
          <g transform={`rotate(${aim} 0 -74)`}>
            <rect x={-22} y={-176} width={44} height={150} rx={4} fill={P.deep} stroke={alpha(P.ink, 0.62)} strokeWidth={1.8} />
            <rect x={-30} y={-186} width={60} height={16} rx={3} fill={P.mid} stroke={alpha(P.ink, 0.55)} strokeWidth={1.4} />
            <rect x={-14} y={-300} width={28} height={118} rx={3} fill={P.deep} stroke={alpha(P.ink, 0.45)} strokeWidth={1.4} />
            <circle cx={0} cy={-74} r={9} fill={P.mid} stroke={alpha(P.ink, 0.6)} strokeWidth={1.4} />
            {/* the pulse leaving the aperture */}
            <circle cx={0} cy={-304} r={4 + fired * 22} fill="none" stroke={alpha(P.warm, 0.6 * (1 - fired))} strokeWidth={1.6} />
          </g>
        </g>
      </svg>
    </div>
  );
};

/**
 * The oscilloscope trace: a baseline with one narrow return pulse. The shape is
 * a real measurement read-out, not a decorative waveform — a flat line, a spike,
 * a decay. `sweep` is the pen position, `noise` adds the shot noise of a real
 * detector.
 */
export const Trace: React.FC<{
  x0: number; x1: number; y: number; h: number; sweep: number; noise?: number;
  color?: string; pulse?: number; seed?: number; ghost?: number;
}> = ({x0, x1, y, h, sweep, noise = 1, color = P.accent, pulse = 0.42, seed = 3, ghost = 0}) => {
  const w = x1 - x0;
  const n = 340;
  const path = (scale: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const x = x0 + u * w;
      const d = Math.abs(u - pulse);
      const spike = Math.exp(-Math.pow(d / 0.012, 2)) * h * 0.94;
      const ring = Math.exp(-d / 0.05) * Math.sin(d * 190) * h * 0.06 * (u > pulse ? 1 : 0);
      const base = -Math.exp(-Math.pow(d / 0.06, 2)) * h * 0.02;
      const nz = (hash(i, 7, seed) - 0.5) * h * 0.012 * noise;
      pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${(y + base - (spike + ring) * scale + nz).toFixed(1)}`);
    }
    return pts.join(' ');
  };
  const clipW = w * clamp(sweep);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <clipPath id="traceclip">
            <rect x={x0} y={y - h * 1.2} width={clipW} height={h * 1.9} />
          </clipPath>
        </defs>
        <line x1={x0} y1={y} x2={x1} y2={y} stroke={alpha(P.ink, 0.18)} strokeWidth={1} />
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={x0} y1={y - h * g} x2={x1} y2={y - h * g} stroke={alpha(P.ink, 0.06)} strokeWidth={1} strokeDasharray="2 8" />
        ))}
        <g clipPath="url(#traceclip)">
          {ghost > 0 ? <path d={path(ghost)} fill="none" stroke={alpha(color, 0.22)} strokeWidth={1} /> : null}
          <path d={path(1)} fill="none" stroke={color} strokeWidth={2.2} />
        </g>
        {/* the pen */}
        <line x1={x0 + clipW} y1={y - h * 0.1} x2={x0 + clipW} y2={y + 22} stroke={alpha(P.warm, 0.5)} strokeWidth={1} />
      </svg>
    </div>
  );
};

/**
 * The tidal diagram: Earth in section, two bulges, and the Moon off to one
 * side. `axis` is the angle of the bulge axis measured from the Earth–Moon
 * line — the lead, which is the entire mechanism.
 */
export const TideDiagram: React.FC<{
  ex: number; ey: number; er: number; mx: number; my: number; mr: number;
  axis: number; on?: number; arrows?: number;
}> = ({ex, ey, er, mx, my, mr, axis, on = 1, arrows = 1}) => {
  if (on <= 0) return null;
  const emAngle = (Math.atan2(my - ey, mx - ex) * 180) / Math.PI;
  const uid = `tide-${Math.round(ex)}-${Math.round(ey)}`;
  const a = emAngle + axis;
  const rx = er * 1.62;
  const ry = er * 1.14;
  const knob = (ang: number): [number, number] => [ex + Math.cos((ang * Math.PI) / 180) * rx, ey + Math.sin((ang * Math.PI) / 180) * rx];
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <HatchFill id={`${uid}-h`} color={P.alt} gap={5} width={1.1} angle={52} opacity={0.85} />
          <radialGradient id={`${uid}-o`} cx="34%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#26414A" />
            <stop offset="100%" stopColor="#0B1A1F" />
          </radialGradient>
        </defs>
        {/* the two bulges, drawn as one lens shape on the tilted axis */}
        <g transform={`rotate(${a} ${ex} ${ey})`}>
          <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill={`url(#${uid}-h)`} stroke={alpha(P.alt, 0.8)} strokeWidth={1.6} />
          <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="none" stroke={alpha(P.alt, 0.24)} strokeWidth={1} strokeDasharray="4 6" />
        </g>
        {/* the Earth */}
        <circle cx={ex} cy={ey} r={er} fill={`url(#${uid}-o)`} stroke={alpha(P.warm, 0.4)} strokeWidth={1.6} />
        <g stroke={alpha(P.warm, 0.12)} strokeWidth={1}>
          <line x1={ex - er} y1={ey} x2={ex + er} y2={ey} />
          <line x1={ex} y1={ey - er} x2={ex} y2={ey + er} />
        </g>
        {/* the offset: the bulge axis is ahead of the Earth–Moon line */}
        {axis !== 0 ? (
          <g>
            <path
              d={`M${ex + Math.cos((emAngle * Math.PI) / 180) * (er + 54)} ${ey + Math.sin((emAngle * Math.PI) / 180) * (er + 54)} A${er + 54} ${er + 54} 0 0 1 ${ex + Math.cos((a * Math.PI) / 180) * (er + 54)} ${ey + Math.sin((a * Math.PI) / 180) * (er + 54)}`}
              fill="none"
              stroke={P.accent}
              strokeWidth={1.6}
            />
            <line x1={ex} y1={ey} x2={ex + Math.cos((emAngle * Math.PI) / 180) * (er + 70)} y2={ey + Math.sin((emAngle * Math.PI) / 180) * (er + 70)} stroke={alpha(P.ink, 0.4)} strokeWidth={1} strokeDasharray="6 8" />
          </g>
        ) : null}
        {/* the drag: a tangential arrow at the leading bulge */}
        {arrows > 0 ? (
          <g opacity={arrows}>
            {(() => {
              const [bx, by] = knob(a);
              const tx = -Math.sin((a * Math.PI) / 180);
              const ty = Math.cos((a * Math.PI) / 180);
              const L0 = 118;
              return (
                <g stroke={P.accent} strokeWidth={2.4} fill="none">
                  <line x1={bx} y1={by} x2={bx + tx * L0} y2={by + ty * L0} />
                  <path
                    d={`M${bx + tx * L0} ${by + ty * L0} l${-tx * 20 + ty * 12} ${-ty * 20 - tx * 12} M${bx + tx * L0} ${by + ty * L0} l${-tx * 20 - ty * 12} ${-ty * 20 + tx * 12}`}
                  />
                </g>
              );
            })()}
          </g>
        ) : null}
        {/* the Moon */}
        <circle cx={mx} cy={my} r={mr} fill="#E8DCC4" stroke={alpha(P.warm, 0.5)} strokeWidth={1.4} />
        <circle cx={mx - mr * 0.3} cy={my - mr * 0.3} r={mr * 0.18} fill="#B7A382" opacity={0.5} />
        <circle cx={mx + mr * 0.35} cy={my + mr * 0.2} r={mr * 0.12} fill="#B7A382" opacity={0.4} />
      </svg>
    </div>
  );
};

/**
 * A section of fossil coral: annual bands as horizontal rows, daily growth
 * lines as vertical hairlines inside each band. The count is the evidence.
 */
export const CoralSection: React.FC<{
  x0: number; x1: number; y0: number; years: number; daysPerYear: number;
  reveal?: number; on?: number; markYear?: number; seed?: number;
}> = ({x0, x1, y0, years, daysPerYear, reveal = 1, on = 1, markYear = -1, seed = 4}) => {
  if (on <= 0) return null;
  const w = x1 - x0;
  const rowH = 118;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <HatchFill id="coral-hatch" color={P.warm} gap={9} width={0.8} angle={-24} opacity={0.16} />
        </defs>
        <rect x={x0} y={y0} width={w * clamp(reveal)} height={years * rowH} fill={alpha('#2A2118', 0.9)} stroke={alpha(P.warm, 0.4)} strokeWidth={1.2} />
        <rect x={x0} y={y0} width={w * clamp(reveal)} height={years * rowH} fill="url(#coral-hatch)" />
        {Array.from({length: years}).map((_, r) => {
          const y = y0 + r * rowH;
          const p = clamp(reveal * years * 1.25 - r);
          if (p <= 0) return null;
          const days = daysPerYear - Math.round(hash(r, 3, seed) * 14);
          return (
            <g key={r} opacity={p}>
              <line x1={x0} y1={y} x2={x0 + w} y2={y} stroke={alpha(P.warm, r === markYear ? 0.8 : 0.3)} strokeWidth={r === markYear ? 1.6 : 1} />
              {Array.from({length: days}).map((_, d) => {
                const x = x0 + (w * (d + 0.5)) / days;
                const jag = hash(d, r, seed) * 6;
                return (
                  <line
                    key={d}
                    x1={x}
                    y1={y + 8 + jag * 0.4}
                    x2={x + (hash(d, r + 1, seed) - 0.5) * 5}
                    y2={y + rowH - 10 - jag * 0.5}
                    stroke={alpha(P.ink, 0.1 + hash(d, r, seed + 2) * 0.22)}
                    strokeWidth={0.9}
                  />
                );
              })}
            </g>
          );
        })}
        <line x1={x0} y1={y0} x2={x0 + w * clamp(reveal)} y2={y0} stroke={alpha(P.warm, 0.7)} strokeWidth={1.6} />
        <line x1={x0} y1={y0 + years * rowH} x2={x0 + w * clamp(reveal)} y2={y0 + years * rowH} stroke={alpha(P.warm, 0.5)} strokeWidth={1.4} />
      </svg>
    </div>
  );
};

/**
 * Two clocks side by side: a 24 h dial and a 22 h dial, both turning at the same
 * rate, so the difference accumulates visibly as a wedge.
 */
export const Dial: React.FC<{
  cx: number; cy: number; r: number; hours: number; turn: number; on?: number;
  title: string; sub?: string; color?: string; accent?: string; ticks?: number;
}> = ({cx, cy, r, hours, turn, on = 1, title, sub, color = P.ink, accent = P.accent, ticks = 24}) => {
  if (on <= 0) return null;
  const ang = turn * 360;
  const pt = (a: number, rad: number) => [cx + Math.cos(((a - 90) * Math.PI) / 180) * rad, cy + Math.sin(((a - 90) * Math.PI) / 180) * rad];
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}}>
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <circle cx={cx} cy={cy} r={r} fill={alpha(P.deep, 0.55)} stroke={alpha(color, 0.3)} strokeWidth={1.4} />
        <circle cx={cx} cy={cy} r={r - 14} fill="none" stroke={alpha(color, 0.12)} strokeWidth={1} />
        {Array.from({length: ticks}).map((_, i) => {
          const a = (360 / ticks) * i;
          const big = i % 6 === 0;
          const [x0, y0] = pt(a, r - (big ? 34 : 20));
          const [x1, y1] = pt(a, r - 6);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={alpha(color, big ? 0.7 : 0.3)} strokeWidth={big ? 1.6 : 1} />;
        })}
        {/* the day's arc: how much of the circle one rotation covers */}
        <circle
          cx={cx}
          cy={cy}
          r={r - 30}
          fill="none"
          stroke={alpha(accent, 0.7)}
          strokeWidth={2.4}
          strokeDasharray={`${2 * Math.PI * (r - 30) * (hours / 24) * 0.999} ${2 * Math.PI * (r - 30)}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* the hand */}
        <g transform={`rotate(${ang} ${cx} ${cy})`}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - r + 44} stroke={color} strokeWidth={2.2} />
          <line x1={cx} y1={cy + 18} x2={cx} y2={cy - 30} stroke={alpha(color, 0.6)} strokeWidth={1.6} />
        </g>
        <circle cx={cx} cy={cy} r={6} fill={accent} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: cx - r,
          width: r * 2,
          top: cy + r + 30,
          textAlign: 'center',
          fontFamily: T.display,
          fontSize: 92,
          fontWeight: 300,
          color,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {hours}
      </div>
      <div
        style={{
          position: 'absolute',
          left: cx - r,
          width: r * 2,
          top: cy + r + 132,
          textAlign: 'center',
          fontFamily: T.mono,
          fontSize: SZ.micro,
          letterSpacing: '0.34em',
          color: P.muted,
        }}
      >
        {title}
      </div>
      {sub ? (
        <div
          style={{
            position: 'absolute',
            left: cx - r,
            width: r * 2,
            top: cy + r + 170,
            textAlign: 'center',
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.2em',
            color: alpha(P.muted, 0.75),
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

/* ────────────────────────────  07 stage  ─────────────────────────────────── */
/**
 * The stage: what every shot is built on. Paper, grid, rules, dust, and the
 * opportunity to say what the plate is before the drawing starts.
 *
 * A shot composes its own picture; this only guarantees that the ground is the
 * same ground, so a cut never lands on a different-looking film.
 */
export const Stage: React.FC<{
  grid?: boolean | number; gridCell?: number; paper?: number; dust?: number; dustSeed?: number;
  shade?: number; fade?: number; children?: React.ReactNode;
}> = ({grid = 0.5, gridCell = 98, paper = 0.42, dust = 0.4, dustSeed = 5, shade = 0.9, fade = 1, children}) => (
  <AbsoluteFill style={{background: P.void, opacity: fade}}>
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 30%, ${P.abyss} 0%, ${P.void} 62%, #040508 100%)`}} />
    {grid ? <Grid cell={gridCell} opacity={typeof grid === 'number' ? grid : 0.5} /> : null}
    {children}
    <Paper opacity={paper} />
    {dust ? <Dust n={Math.round(420 * dust)} seed={dustSeed} opacity={0.6} /> : null}
    <EdgeShade strength={shade} />
  </AbsoluteFill>
);

/** A plate header: the section name and the shot's own index, set small. */
export const PlateHead: React.FC<{left: string; right?: string; on?: number; y?: number}> = ({
  left, right, on = 1, y = 96,
}) => (
  <>
    <Label text={left} y={y} on={on} rule={0} size={15} color={alpha(P.muted, 0.8)} />
    {right ? <LabelR text={right} y={y} on={on} size={15} color={alpha(P.muted, 0.6)} /> : null}
  </>
);
