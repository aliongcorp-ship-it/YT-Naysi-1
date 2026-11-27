// ============================================================================
// NAYSI — PLAT 12: "8 MENIT SETELAH MATAHARI MATI"
// ----------------------------------------------------------------------------
// One file, twelve plates. Every chapter is a single SVG scene driven by the
// chapter clock in scenes/timing.ts, so captions, voice-over and animation
// cannot drift apart.
//
//   furniture   crop marks · slug · pips · plate grid · rails · dial · header
//   stage       backdrop + dust + grain + vignette (shared by all plates)
//   head        kicker, plate number, serif subline
//   insets      one measured figure per plate:
//                 01 limb darkening        08 depth ladder
//                 02 long division         09 vent chemistry
//                 03 local star map        10 stellar evolution
//                 04 vector diagram        11 white-dwarf table
//                 05 orbit → straight       12 light-time diagram
//                 06 cooling table         02b unit chain
//                 07 moon phases           03b log scale
//                                          04b delay window
//                                          06b temperature scale
//   scenes      Scene01 … Scene12, in airing order
//
// Palette per chapter comes from CHAPTER_ART in scenes/script.tsx; the twelve
// font stacks come from IDENTITY. Nothing in this file uses raster assets: all
// shapes are procedural SVG, so a re-render at any size stays sharp.
// ============================================================================

import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  CHAPTERS,
  CHAPTER_ART,
  CHAPTER_KICKERS,
  CHAPTER_TITLES,
  IDENTITY,
  clamp01,
  easeOutCubic,
  hash,
  lerp,
  prog,
} from './script';
import { Backdrop, Camera, ChapterEyebrow, DustMotes, FilmGrain, LeaderLabel, Mono, RuleLine, useChapterClock } from './kit';
import { BigNumber, Brackets, Corona4K, EarthGlobe, MilkyWay, MoonDisc, PhotonPacket, Prominence, StarField, SunCore, TickRule } from './graphics';
import { Counter, GhostSun, ThermoGauge, VectorArrow } from './sol';

// ============================================================================
// furniture — crop marks, slug, pips. the frame should look ruled, not empty.
// ============================================================================
export const Furniture: React.FC<{ i: number; t: number; color: string; note?: string }> = ({ i, t, color, note }) => (
  <g opacity={easeOutCubic(prog(t, 0.2, 1.2))}>
    {[
      [40, 40, 1, 1],
      [1400, 40, -1, 1],
      [40, 2000, 1, -1],
      [1400, 2000, -1, -1],
    ].map(([x, y, sx, sy], k) => (
      <g key={k} stroke="rgba(238,228,208,0.28)" strokeWidth={1.6}>
        <line x1={x} y1={y} x2={x + sx * 26} y2={y} />
        <line x1={x} y1={y} x2={x} y2={y + sy * 26} />
      </g>
    ))}
    <Mono x={40} y={1958} text={`BAB ${String(i + 1).padStart(2, '0')} — ${CHAPTERS[i].slug.toUpperCase()}`} size={17} color="rgba(238,228,208,0.34)" tracking={0.24} />
    {note && <Mono x={1400} y={1958} text={note} size={17} color="rgba(238,228,208,0.3)" tracking={0.2} anchor="end" />}
    {Array.from({ length: 12 }).map((_, k) => (
      <rect key={k} x={40 + k * 20} y={1990} width={12} height={3} fill={k === i ? color : 'rgba(238,228,208,0.22)'} />
    ))}
    <PlateGrid color="rgba(238,228,208,1)" opacity={0.05} />
    <ProgressRail i={i} t={t} color={color} />
    <RailLabel x={46} y={1620} text="URUTAN BAB" />
    <RailLabel x={1398} y={1620} text="SKALA RELATIF" flip />
    <MicroRuler t={t} color={color} />
    <ExposureDial i={i} t={t} color={color} />
    <PlateHeader i={i} t={t} dur={CHAPTERS[i].end - CHAPTERS[i].start} color={color} />
    <DotField x={118} y={150} w={210} h={54} cols={22} rows={5} color="rgba(238,228,208,0.5)" opacity={0.16} />
    <DotField x={1104} y={1852} w={226} h={58} cols={24} rows={5} color="rgba(238,228,208,0.5)" opacity={0.12} />
    <PlateFoot i={i} />
    <CornerStamp i={i} color={color} />
    <FilmEdge />
    <GridCoords />
  </g>
);


// ============================================================================
// density layer — rails, rulers, dials, plate header. the frame should read
// like a printed plate from an observatory logbook, never like an empty slide.
// ============================================================================
const fmtNum = (v: number, digits = 3) => v.toFixed(digits).replace('.', ',');
const fmtInt = (v: number) => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const pctStr = (v: number) => `${Math.round(clamp01(v) * 100)}%`;
const lerpAngle = (a0: number, a1: number, p: number) => a0 + (a1 - a0) * clamp01(p);

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const ProgressRail: React.FC<{ i: number; t: number; color: string }> = ({ i, t, color }) => {
  const top = 620;
  const bottom = 1900;
  const step = (bottom - top) / 11;
  const draw = easeOutCubic(prog(t, 0.15, 1.4));
  return (
    <g>
      <line x1={66} y1={top} x2={66} y2={top + (bottom - top) * draw} stroke="rgba(238,228,208,0.14)" strokeWidth={1.2} />
      {Array.from({ length: 12 }).map((_, k) => {
        const y = top + k * step;
        const cur = k === i;
        const past = k < i;
        return (
          <g key={k}>
            <line
              x1={56}
              y1={y}
              x2={66}
              y2={y}
              stroke={cur ? color : past ? 'rgba(238,228,208,0.46)' : 'rgba(238,228,208,0.16)'}
              strokeWidth={cur ? 2.6 : 1.2}
            />
            <text
              x={48}
              y={y + 4}
              textAnchor="end"
              fontFamily={IDENTITY.fontMono}
              fontSize={11}
              letterSpacing="0.14em"
              fill={cur ? color : past ? 'rgba(238,228,208,0.3)' : 'rgba(238,228,208,0.16)'}
            >
              {ROMAN[k]}
            </text>
          </g>
        );
      })}
      <rect x={62} y={top + i * step - 16} width={9} height={32} fill={color} opacity={0.92} />
    </g>
  );
};

const MicroRuler: React.FC<{ t: number; color: string }> = ({ t, color: _color }) => {
  const top = 620;
  const bottom = 1900;
  const n = 64;
  const step = (bottom - top) / n;
  const draw = easeOutCubic(prog(t, 0.25, 1.7));
  return (
    <g>
      <line x1={1388} y1={top} x2={1388} y2={bottom} stroke="rgba(238,228,208,0.12)" strokeWidth={1} />
      {Array.from({ length: n + 1 }).map((_, k) => {
        const y = top + k * step;
        const major = k % 8 === 0;
        return (
          <line
            key={k}
            x1={1388}
            y1={y}
            x2={1388 - (major ? 13 : 5)}
            y2={y}
            stroke={`rgba(238,228,208,${major ? 0.4 : 0.16})`}
            strokeWidth={1}
            opacity={k / n <= draw ? 1 : 0}
          />
        );
      })}
      {[0, 16, 32, 48, 64].map((k) => (
        <text
          key={k}
          x={1368}
          y={top + k * step + 4}
          textAnchor="end"
          fontFamily={IDENTITY.fontMono}
          fontSize={10}
          fill="rgba(238,228,208,0.26)"
        >
          {k}
        </text>
      ))}
    </g>
  );
};

const RailLabel: React.FC<{ x: number; y: number; text: string; flip?: boolean }> = ({ x, y, text, flip }) => (
  <text
    x={x}
    y={y}
    transform={`rotate(${flip ? 90 : -90} ${x} ${y})`}
    fontFamily={IDENTITY.fontMono}
    fontSize={9}
    letterSpacing="0.36em"
    fill="rgba(238,228,208,0.22)"
  >
    {text}
  </text>
);

const ExposureDial: React.FC<{ i: number; t: number; color: string }> = ({ i, t, color }) => {
  const cx = 118;
  const cy = 196;
  const r = 40;
  const a0 = -212;
  const a1 = 32;
  const frac = (i + clamp01(prog(t, 0, 1))) / 12;
  const pt = (deg: number, rr: number) => [cx + Math.cos((deg * Math.PI) / 180) * rr, cy + Math.sin((deg * Math.PI) / 180) * rr];
  const arc = (from: number, to: number, rr: number) => {
    const [x1, y1] = pt(from, rr);
    const [x2, y2] = pt(to, rr);
    const large = to - from > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${rr} ${rr} 0 ${large} 1 ${x2} ${y2}`;
  };
  const ang = lerp(a0, a1, frac);
  const [nx, ny] = pt(ang, r - 15);
  return (
    <g>
      <path d={arc(a0, a1, r)} fill="none" stroke="rgba(238,228,208,0.16)" strokeWidth={1.2} />
      <path d={arc(a0, a0 + (a1 - a0) * frac, r)} fill="none" stroke={color} strokeWidth={2} />
      {Array.from({ length: 25 }).map((_, k) => {
        const deg = a0 + ((a1 - a0) * k) / 24;
        const [x1, y1] = pt(deg, r - 8);
        const [x2, y2] = pt(deg, r - 2);
        return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(238,228,208,0.24)" strokeWidth={1} />;
      })}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={3} fill={color} />
      <Mono x={cx} y={cy + 34} text={String(i + 1).padStart(2, '0')} size={12} color="rgba(238,228,208,0.44)" tracking={0.18} anchor="middle" />
    </g>
  );
};

const DotField: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
  color: string;
  opacity?: number;
}> = ({ x, y, w, h, cols, rows, color, opacity = 0.28 }) => (
  <g opacity={opacity}>
    {Array.from({ length: cols * rows }).map((_, k) => {
      const c = k % cols;
      const r = Math.floor(k / cols);
      const rr = 0.9 + 1.5 * Math.sin((c / (cols - 1)) * Math.PI) * Math.cos((r / (rows - 1)) * Math.PI * 0.8);
      return <circle key={k} cx={x + (w * c) / (cols - 1)} cy={y + (h * r) / (rows - 1)} r={Math.max(0.55, rr)} fill={color} />;
    })}
  </g>
);

const PlateHeader: React.FC<{ i: number; t: number; dur: number; color: string }> = ({ i, t, dur, color }) => {
  const local = Math.round(clamp01(t / Math.max(dur, 0.001)) * 1347);
  return (
    <g>
      <rect x={1108} y={228} width={4} height={12} fill={color} opacity={0.85} />
      <Mono x={1330} y={236} text={`SPESIMEN ${String(i + 1).padStart(2, '0')} / 12 · 90 FPS`}
        size={12} color="rgba(238,228,208,0.34)" tracking={0.22} anchor="end" />
      <Mono
        x={1330}
        y={258}
        text={`FR ${String(i * 1347 + local).padStart(5, '0')} / 16167`}
        size={11}
        color="rgba(238,228,208,0.2)"
        tracking={0.18}
        anchor="end"
      />
    </g>
  );
};


const fmtSec = (v: number) => `${Math.floor(v / 60)}:${String(Math.round(v % 60)).padStart(2, '0')}`;

const PlateFoot: React.FC<{ i: number }> = ({ i }) => {
  const ch = CHAPTERS[i];
  const dur = ch.end - ch.start;
  return (
    <g opacity={0.9}>
      <line x1={110} y1={1912} x2={1330} y2={1912} stroke="rgba(238,228,208,0.1)" strokeWidth={1} />
      <Mono x={110} y={1934} text={`DURASI ${dur.toFixed(1)} DETIK`} size={11} color="rgba(238,228,208,0.26)" tracking={0.2} />
      <Mono
        x={1050}
        y={1934}
        text={`FR ${fmtInt(ch.start * 90)} – ${fmtInt(ch.end * 90)}`}
        size={11}
        color="rgba(238,228,208,0.26)"
        tracking={0.18}
        anchor="end"
      />
      <Mono x={110} y={1952} text="PLAT CETAK · NAYSI" size={9} color="rgba(238,228,208,0.14)" tracking={0.3} opacity={0} />
      <Mono x={1330} y={1952} text={`${String(i + 1).padStart(2, '0')} / 12`} size={10} color="rgba(238,228,208,0.2)" tracking={0.18} anchor="end" opacity={0} />
    </g>
  );
};

const CornerStamp: React.FC<{ i: number; color: string }> = ({ i, color }) => (
  <g opacity={0.75}>
    <text
      x={1424}
      y={1880}
      transform="rotate(-90 1424 1880)"
      fontFamily={IDENTITY.fontMono}
      fontSize={11}
      letterSpacing="0.32em"
      fill="rgba(238,228,208,0.22)"
    >
      {`NAYSI · ASTRONOMI · PLAT ${String(i + 1).padStart(2, '0')}`}
    </text>
    <rect x={1418} y={1848} width={3} height={14} fill={color} opacity={0.7} />
  </g>
);


const FilmEdge: React.FC = () => (
  <g opacity={0.22}>
    {Array.from({ length: 17 }).map((_, k) => (
      <rect key={`l${k}`} x={16} y={200 + k * 104} width={7} height={26} rx={2} fill="rgba(238,228,208,0.5)" />
    ))}
    {Array.from({ length: 17 }).map((_, k) => (
      <rect key={`r${k}`} x={1417} y={200 + k * 104} width={7} height={26} rx={2} fill="rgba(238,228,208,0.5)" />
    ))}
  </g>
);

const GridCoords: React.FC = () => (
  <g opacity={0.3}>
    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter, k) => (
      <text
        key={letter}
        x={96}
        y={380 + k * 197.5}
        textAnchor="end"
        fontFamily={IDENTITY.fontMono}
        fontSize={9}
        letterSpacing="0.1em"
        fill="rgba(238,228,208,0.35)"
      >
        {letter}
      </text>
    ))}
    {[1, 2, 3, 4, 5, 6].map((num, k) => (
      <text
        key={num}
        x={174 + k * 197.5}
        y={1958}
        fontFamily={IDENTITY.fontMono}
        fontSize={9}
        letterSpacing="0.1em"
        fill="rgba(238,228,208,0.26)"
        opacity={0}
      >
        {num}
      </text>
    ))}
  </g>
);

const PlateGrid: React.FC<{ color: string; opacity?: number }> = ({ color, opacity = 0.05 }) => (
  <g opacity={opacity}>
    <line x1={110} y1={360} x2={110} y2={1940} stroke={color} strokeWidth={1} />
    <line x1={1330} y1={360} x2={1330} y2={1940} stroke={color} strokeWidth={1} />
    <line x1={110} y1={1940} x2={1330} y2={1940} stroke={color} strokeWidth={1} />
    {Array.from({ length: 9 }).map((_, k) => (
      <line key={k} x1={110} y1={360 + k * 197.5} x2={122} y2={360 + k * 197.5} stroke={color} strokeWidth={1} />
    ))}
    {Array.from({ length: 9 }).map((_, k) => (
      <line key={`r${k}`} x1={1318} y1={360 + k * 197.5} x2={1330} y2={360 + k * 197.5} stroke={color} strokeWidth={1} />
    ))}
  </g>
);

export const Stage: React.FC<{ i: number; children: React.ReactNode; note?: string }> = ({ i, children, note }) => {
  const ch = CHAPTERS[i];
  return (
    <AbsoluteFill style={{ backgroundColor: ch.groundBottom, overflow: 'hidden' }}>
      {children}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(128% 92% at 50% 44%, rgba(0,0,0,0) 44%, rgba(0,0,0,0.26) 76%, rgba(0,0,0,0.58) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.028,
          backgroundImage:
            'repeating-linear-gradient(180deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 5px)',
        }}
      />
      <DustMotes count={13} seed={i + 5} y0={280} y1={1860} color="rgba(244,232,208,0.16)" />
      <FilmGrain opacity={0.055} scale={208} />
    </AbsoluteFill>
  );
};

const Head: React.FC<{ i: number; t: number; y?: number; size?: number }> = ({ i, t, y = 640, size = 92 }) => {
  const art = CHAPTER_ART[i];
  const p = easeOutCubic(prog(t, 0.2, 1.2));
  return (
    <g opacity={p} transform={`translate(0 ${(1 - p) * 16})`}>
      <Mono x={116} y={y - 92} text={`${String(i + 1).padStart(2, '0')} / 12`} size={20} color={art.accent} tracking={0.3} />
      <text x={110} y={y} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={size} letterSpacing="0.014em">
        {CHAPTER_TITLES[i]}
      </text>
      <text x={116} y={y + 50} fill="rgba(240,232,216,0.46)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={32}>
        {CHAPTER_KICKERS[i]}
      </text>
    </g>
  );
};


// ============================================================================
// chapter insets — every plate carries one small measured diagram, the way a
// science page carries a figure next to its body copy.
// ============================================================================
const InsetFrame: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  note?: string;
  color: string;
  p?: number;
  children: React.ReactNode;
}> = ({ x, y, w, h, title, note, color, p = 1, children }) => {
  const draw = easeOutCubic(clamp01(p));
  return (
    <g opacity={draw}>
      <rect x={x} y={y} width={w} height={h} fill="rgba(8,8,10,0.42)" stroke="rgba(238,228,208,0.16)" strokeWidth={1} />
      {[
        [x, y, 1, 1],
        [x + w, y, -1, 1],
        [x, y + h, 1, -1],
        [x + w, y + h, -1, -1],
      ].map(([cx, cy, sx, sy], k) => (
        <g key={k} stroke={color} strokeWidth={1.2} opacity={0.7}>
          <line x1={cx} y1={cy} x2={cx + sx * 12} y2={cy} />
          <line x1={cx} y1={cy} x2={cx} y2={cy + sy * 12} />
        </g>
      ))}
      <Mono x={x + 14} y={y + 24} text={title} size={13} color="rgba(238,228,208,0.55)" tracking={0.26} />
      {note && <Mono x={x + w - 14} y={y + 24} text={note} size={11} color="rgba(238,228,208,0.26)" tracking={0.18} anchor="end" />}
      <line x1={x + 14} y1={y + 34} x2={x + w - 14} y2={y + 34} stroke="rgba(238,228,208,0.12)" strokeWidth={1} />
      {children}
    </g>
  );
};

const InsetLimbDarkening: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 950;
  const y = 372;
  const w = 380;
  const h = 226;
  const gx = x + 34;
  const gy = y + 186;
  const gw = w - 62;
  const gh = 118;
  const curve = Array.from({ length: 41 })
    .map((_, k) => {
      const u = k / 40;
      const v = Math.pow(1 - Math.pow(u, 2.3), 0.55) * 0.94 + 0.06;
      return `${k === 0 ? 'M' : 'L'} ${gx + u * gw} ${gy - v * gh}`;
    })
    .join(' ');
  const sweep = easeOutCubic(prog(t, 1.4, 4.2));
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="LIMB DARKENING" note="I/I₀" color={color} p={prog(t, 0.5, 1.4)}>
      {Array.from({ length: 5 }).map((_, k) => (
        <line key={k} x1={gx} y1={gy - (k / 4) * gh} x2={gx + gw} y2={gy - (k / 4) * gh} stroke="rgba(238,228,208,0.09)" strokeWidth={1} />
      ))}
      <line x1={gx} y1={gy} x2={gx + gw} y2={gy} stroke="rgba(238,228,208,0.3)" strokeWidth={1} />
      <line x1={gx} y1={gy} x2={gx} y2={gy - gh} stroke="rgba(238,228,208,0.3)" strokeWidth={1} />
      <path d={curve} fill="none" stroke={color} strokeWidth={2.2} strokeDasharray="900" strokeDashoffset={900 * (1 - sweep)} />
      {[
        ['0', 0],
        ['0,5', 0.5],
        ['1,0', 1],
      ].map(([label, u], k) => (
        <g key={k}>
          <line x1={gx + Number(u) * gw} y1={gy} x2={gx + Number(u) * gw} y2={gy + 7} stroke="rgba(238,228,208,0.35)" strokeWidth={1} />
          <text x={gx + Number(u) * gw} y={gy + 24} textAnchor="middle" fontFamily={IDENTITY.fontMono} fontSize={11} fill="rgba(238,228,208,0.34)">
            {label}
          </text>
        </g>
      ))}
      <Mono x={gx + gw * 0.5} y={y + h - 16} text="JARAK DARI PUSAT PIRINGAN" size={11} color="rgba(238,228,208,0.26)" tracking={0.18} anchor="middle" />
      <Mono x={x + 16} y={gy + 60} text="TEPI PIRINGAN LEBIH DINGIN ± 2.000 K" size={10} color="rgba(238,228,208,0.22)" tracking={0.14} />
      <Mono x={x + w - 16} y={gy - gh + 4} text="1,0" size={11} color="rgba(238,228,208,0.3)" tracking={0.14} anchor="end" />
    </InsetFrame>
  );
};

const InsetDivision: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 950;
  const y = 372;
  const w = 380;
  const h = 226;
  const p = easeOutCubic(prog(t, 1.0, 3.4));
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="PEMBAGIAN PANJANG" note="SATUAN: DETIK" color={color} p={prog(t, 0.4, 1.3)}>
      <Mono x={x + 20} y={y + 66} text="299 792" size={17} color="rgba(238,228,208,0.6)" tracking={0.16} />
      <line x1={x + 20} y1={y + 76} x2={x + w - 20} y2={y + 76} stroke="rgba(238,228,208,0.22)" strokeWidth={1} />
      <Mono x={x + 20} y={y + 100} text="149 600 000" size={17} color="rgba(238,228,208,0.72)" tracking={0.16} />
      <Mono x={x + w - 20} y={y + 100} text="4" size={17} color="rgba(238,228,208,0.4)" tracking={0.1} anchor="end" />
      <Mono x={x + 20} y={y + 126} text="− 119 916 800" size={15} color="rgba(238,228,208,0.34)" tracking={0.14} />
      <line x1={x + 20} y1={y + 136} x2={x + w - 20} y2={y + 136} stroke="rgba(238,228,208,0.14)" strokeWidth={1} />
      <Mono x={x + 20} y={y + 160} text="29 683 200" size={17} color="rgba(238,228,208,0.72)" tracking={0.16} />
      <Mono x={x + w - 20} y={y + 160} text="0,9" size={17} color="rgba(238,228,208,0.4)" tracking={0.1} anchor="end" />
      <line x1={x + 20} y1={y + 172} x2={x + 20 + (w - 40) * p} y2={y + 172} stroke={color} strokeWidth={2} />
      <Mono x={x + 20} y={y + 196} text="SISA 199 664 → 499 DETIK" size={13} color={color} tracking={0.16} opacity={p} />
      <line x1={x + 20} y1={y + 206} x2={x + w - 20} y2={y + 206} stroke="rgba(238,228,208,0.1)" strokeWidth={1} />
      <Mono x={x + 20} y={y + 222} text="DIBULATKAN: 8 MNT 19 DTK" size={10} color="rgba(238,228,208,0.28)" tracking={0.16} />
    </InsetFrame>
  );
};

const InsetStarMap: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 950;
  const y = 372;
  const w = 380;
  const h = 226;
  const pts = [
    [0.12, 0.74],
    [0.26, 0.56],
    [0.38, 0.62],
    [0.5, 0.4],
    [0.62, 0.52],
    [0.74, 0.3],
    [0.88, 0.42],
  ];
  const drawn = easeOutCubic(prog(t, 1.2, 3.6));
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="PETA BINTANG LOKAL" note="SKALA LOGARITMIK" color={color} p={prog(t, 0.5, 1.4)}>
      {Array.from({ length: 40 }).map((_, k) => (
        <circle
          key={k}
          cx={x + 18 + hash(k, 91) * (w - 36)}
          cy={y + 44 + hash(k, 92) * (h - 74)}
          r={0.8 + hash(k, 93) * 1.3}
          fill="rgba(226,238,244,0.5)"
          opacity={0.2 + hash(k, 94) * 0.5}
        />
      ))}
      {pts.slice(0, -1).map((pt, k) => {
        const a = pt;
        const b = pts[k + 1];
        const seg = clamp01(drawn * 6 - k);
        return (
          <line
            key={k}
            x1={x + 18 + a[0] * (w - 36)}
            y1={y + 44 + a[1] * (h - 74)}
            x2={x + 18 + b[0] * (w - 36)}
            y2={y + 44 + b[1] * (h - 74)}
            stroke="rgba(200,220,236,0.42)"
            strokeWidth={1.2}
            opacity={seg}
          />
        );
      })}
      {[0, 1, 2, 3].map((k) => {
        const idx = [1, 3, 5, 6][k];
        const pt = pts[idx];
        return (
          <g key={k} opacity={clamp01(drawn * 4 - k)}>
            <circle cx={x + 18 + pt[0] * (w - 36)} cy={y + 44 + pt[1] * (h - 74)} r={3.4} fill={k === 3 ? color : 'rgba(232,240,248,0.85)'} />
            <text
              x={x + 18 + pt[0] * (w - 36) + 8}
              y={y + 44 + pt[1] * (h - 74) + 4}
              fontFamily={IDENTITY.fontMono}
              fontSize={10}
              fill="rgba(226,238,244,0.5)"
              letterSpacing="0.12em"
            >
              {['α Cen', 'Barnard', 'Sirius', 'Bintang mati'][k]}
            </text>
          </g>
        );
      })}
      <Mono x={x + w - 16} y={y + h - 14} text="1 px ≈ 1 tahun cahaya" size={10} color="rgba(238,228,208,0.24)" tracking={0.14} anchor="end" />
      <g opacity={0.5}>
        <line x1={x + 18} y1={y + h - 18} x2={x + 18 + 44} y2={y + h - 18} stroke="rgba(238,228,208,0.4)" strokeWidth={1.4} />
        <line x1={x + 18} y1={y + h - 24} x2={x + 18} y2={y + h - 12} stroke="rgba(238,228,208,0.4)" strokeWidth={1.4} />
        <line x1={x + 62} y1={y + h - 24} x2={x + 62} y2={y + h - 12} stroke="rgba(238,228,208,0.4)" strokeWidth={1.4} />
      </g>
    </InsetFrame>
  );
};

const InsetVector: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 950;
  const y = 372;
  const w = 380;
  const h = 226;
  const ox = x + 40;
  const oy = y + h - 40;
  const len = 118;
  const p1 = easeOutCubic(prog(t, 1.2, 2.8));
  const p2 = easeOutCubic(prog(t, 2.6, 4.2));
  const p3 = easeOutCubic(prog(t, 4.0, 5.4));
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="DIAGRAM VEKTOR" note="TANGENSIAL + RADIAL" color={color} p={prog(t, 0.5, 1.4)}>
      {Array.from({ length: 6 }).map((_, k) => (
        <line key={`h${k}`} x1={x + 20} y1={oy - k * 22} x2={x + w - 20} y2={oy - k * 22} stroke="rgba(238,228,208,0.07)" strokeWidth={1} />
      ))}
      {Array.from({ length: 6 }).map((_, k) => (
        <line key={`v${k}`} x1={ox + k * 58} y1={y + 44} x2={ox + k * 58} y2={oy} stroke="rgba(238,228,208,0.07)" strokeWidth={1} />
      ))}
      <line x1={ox} y1={oy} x2={ox + len * p1} y2={oy} stroke="rgba(232,240,248,0.75)" strokeWidth={2} />
      <path d={`M ${ox + len * p1} ${oy} l -9 -5 l 0 10 Z`} fill="rgba(232,240,248,0.75)" opacity={p1} />
      <line x1={ox} y1={oy} x2={ox} y2={oy - len * 0.72 * p2} stroke={color} strokeWidth={2} />
      <path d={`M ${ox} ${oy - len * 0.72 * p2} l -5 9 l 10 0 Z`} fill={color} opacity={p2} />
      <line x1={ox} y1={oy} x2={ox + len * p1} y2={oy - len * 0.72 * p2} stroke="rgba(255,236,196,0.6)" strokeWidth={1.4} strokeDasharray="6 5" opacity={p3} />
      <text x={ox + len * p1 + 10} y={oy + 5} fontFamily={IDENTITY.fontMono} fontSize={11} fill="rgba(232,240,248,0.6)">
        v tan
      </text>
      <text x={ox + 8} y={oy - len * 0.72 * p2 - 8} fontFamily={IDENTITY.fontMono} fontSize={11} fill={color}>
        v rad
      </text>
      <Mono x={x + 20} y={y + 56} text="|v| = 29,8 km/dtk" size={12} color="rgba(238,228,208,0.4)" tracking={0.16} />
    </InsetFrame>
  );
};

const InsetTrajectory: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 950;
  const y = 372;
  const w = 380;
  const h = 226;
  const sx = x + 60;
  const sy = y + h - 46;
  const straight = easeOutCubic(prog(t, 1.6, 4.6));
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="ORBIT → GARIS LURUS" note="TANPA GAYA TARIK" color={color} p={prog(t, 0.5, 1.4)}>
      <circle cx={sx} cy={sy} r={9} fill="#F4C25E" opacity={0.9} />
      <circle cx={sx} cy={sy} r={16} fill="none" stroke="rgba(244,194,94,0.3)" strokeWidth={1} />
      {[26, 44, 62].map((r, k) => (
        <circle key={k} cx={sx} cy={sy} r={r} fill="none" stroke="rgba(200,214,226,0.16)" strokeWidth={1} strokeDasharray="4 7" />
      ))}
      <path
        d={`M ${sx + 52} ${sy - 22} A 58 58 0 0 1 ${sx + 18} ${sy + 56}`}
        fill="none"
        stroke="rgba(210,224,236,0.6)"
        strokeWidth={1.8}
      />
      <line x1={sx + 52} y1={sy - 22} x2={sx + 52 + 190 * straight} y2={sy - 70 - 26 * straight} stroke={color} strokeWidth={2.2} />
      <circle cx={sx + 52 + 190 * straight} cy={sy - 70 - 26 * straight} r={4} fill={color} />
      <text x={sx + 62} y={sy + 52} fontFamily={IDENTITY.fontMono} fontSize={10} fill="rgba(210,224,236,0.45)" letterSpacing="0.12em">
        orbit lama
      </text>
      <text x={sx + 150} y={sy - 78} fontFamily={IDENTITY.fontMono} fontSize={10} fill={color} letterSpacing="0.12em" opacity={straight}>
        v = 107.000 km/jam
      </text>
    </InsetFrame>
  );
};

const InsetCoolingTable: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 950;
  const y = 372;
  const w = 380;
  const h = 226;
  const rows = [
    ['1 jam', '≈ +12 °C', 0.25],
    ['1 minggu', '−18 °C', 0.4],
    ['1 tahun', '−73 °C', 0.6],
    ['100 tahun', '−180 °C', 0.8],
    ['10 ribu tahun', '−210 °C', 0.9],
    ['juta tahun', '−240 °C', 1],
  ];
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="TABEL PENDINGINAN" note="RATA-RATA GLOBAL" color={color} p={prog(t, 0.5, 1.4)}>
      {rows.map(([kala, suhu, at], k) => {
        const p = easeOutCubic(prog(t, 1.0 + k * 0.55, 1.7 + k * 0.55));
        const rowY = y + 66 + k * 32;
        return (
          <g key={k} opacity={p}>
            <Mono x={x + 20} y={rowY} text={String(kala)} size={13} color="rgba(238,228,208,0.46)" tracking={0.16} />
            <line x1={x + 132} y1={rowY - 4} x2={x + w - 108} y2={rowY - 4} stroke="rgba(238,228,208,0.16)" strokeWidth={1} strokeDasharray="2 5" />
            <Mono x={x + w - 20} y={rowY} text={String(suhu)} size={13} color={String(suhu).includes('−') && Number(at) >= 0.6 ? color : 'rgba(238,228,208,0.72)'} tracking={0.14} anchor="end" />
          </g>
        );
      })}
    </InsetFrame>
  );
};



const InsetUnitChain: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 700;
  const y = 1618;
  const w = 630;
  const h = 224;
  const rows: [string, string, number][] = [
    ['1 detik cahaya', '299.792 km', 0.1],
    ['1 menit cahaya', '17,9 juta km', 0.35],
    ['1 SA (Bumi–Matahari)', '149,6 juta km', 0.62],
    ['8 mnt 19 dtk cahaya', '1 SA', 0.86],
    ['1 tahun cahaya', '9,46 triliun km', 1],
    ['1 parsek', '3,26 tahun cahaya', 1],
  ];
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="RANTAI SATUAN" note="JARAK = WAKTU × c" color={color} p={prog(t, 1.6, 2.6)}>
      {rows.map(([label, val, at], k) => {
        const p = easeOutCubic(prog(t, 2.0 + k * 0.45, 2.7 + k * 0.45));
        const yy = y + 62 + k * 32;
        return (
          <g key={k} opacity={p}>
            <Mono x={x + 20} y={yy} text={label} size={11} color="rgba(238,228,208,0.42)" tracking={0.14} />
            <line x1={x + 250} y1={yy - 4} x2={x + 400} y2={yy - 4} stroke="rgba(238,228,208,0.16)" strokeWidth={1} strokeDasharray="2 5" />
            <Mono x={x + w - 20} y={yy} text={val} size={12} color={at > 0.8 ? color : 'rgba(238,228,208,0.7)'} tracking={0.1} anchor="end" />
          </g>
        );
      })}
    </InsetFrame>
  );
};

const InsetLogScale: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 700;
  const y = 1618;
  const w = 630;
  const h = 224;
  const bx = x + 34;
  const by = y + 150;
  const bw = w - 68;
  const marks: [number, string][] = [
    [0.08, '1 km'],
    [0.34, '1 SA'],
    [0.62, '1 th cahaya'],
    [0.88, '100 th cahaya'],
    [0.98, '1.000 th'],
  ];
  const sweep = easeOutCubic(prog(t, 2.0, 4.0));
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="SKALA LOGARITMIK" note="10⁰ → 10¹⁸ m" color={color} p={prog(t, 1.6, 2.6)}>
      <line x1={bx} y1={by} x2={bx + bw} y2={by} stroke="rgba(238,228,208,0.28)" strokeWidth={1.2} />
      {Array.from({ length: 19 }).map((_, k) => {
        const px = bx + (bw * k) / 18;
        const major = k % 3 === 0;
        return (
          <line
            key={k}
            x1={px}
            y1={by}
            x2={px}
            y2={by + (major ? 12 : 6)}
            stroke="rgba(238,228,208,0.18)"
            strokeWidth={1}
            opacity={k / 18 <= sweep ? 1 : 0.15}
          />
        );
      })}
      {marks.map(([at, label], k) => {
        const px = bx + bw * at;
        const p = easeOutCubic(prog(t, 2.4 + k * 0.5, 3.0 + k * 0.5));
        return (
          <g key={k} opacity={p}>
            <line x1={px} y1={by - 18} x2={px} y2={by} stroke={color} strokeWidth={1.4} opacity={0.7} />
            <text x={px} y={by - 26} textAnchor="middle" fontFamily={IDENTITY.fontMono} fontSize={10} fill="rgba(238,228,208,0.5)" letterSpacing="0.1em">
              {label}
            </text>
          </g>
        );
      })}
      <Mono x={bx} y={by + 42} text="MATAHARI → PROXIMA: 4 TAHUN CAHAYA" size={10} color="rgba(238,228,208,0.3)" tracking={0.14} />
      <Mono x={bx + bw} y={by + 42} text="LOG10 JARAK" size={9} color="rgba(238,228,208,0.2)" tracking={0.2} anchor="end" />
    </InsetFrame>
  );
};


const InsetThermo: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 700;
  const y = 1640;
  const w = 630;
  const h = 212;
  const bx = x + 34;
  const by = y + 170;
  const bw = w - 68;
  const lo = -260;
  const hi = 30;
  const marks: [number, string][] = [
    [15, '+15'],
    [0, '0'],
    [-18, '−18'],
    [-73, '−73'],
    [-210, '−210'],
    [-240, '−240'],
  ];
  const at = (v: number) => bx + ((v - lo) / (hi - lo)) * bw;
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="SKALA SUHU" note="°C · PERMUKAAN" color={color} p={prog(t, 2.2, 3.2)}>
      <line x1={bx} y1={by} x2={bx + bw} y2={by} stroke="rgba(238,228,208,0.26)" strokeWidth={1.2} />
      {Array.from({ length: 30 }).map((_, k) => {
        const px = bx + (bw * k) / 29;
        return <line key={k} x1={px} y1={by} x2={px} y2={by + 6} stroke="rgba(238,228,208,0.14)" strokeWidth={1} />;
      })}
      {marks.map(([v, label], k) => {
        const px = at(v);
        const p = easeOutCubic(prog(t, 2.6 + k * 0.4, 3.2 + k * 0.4));
        return (
          <g key={k} opacity={p}>
            <line x1={px} y1={by - 14} x2={px} y2={by} stroke={v <= -73 ? color : 'rgba(232,240,248,0.6)'} strokeWidth={1.6} />
            <text x={px} y={by - 22} textAnchor="middle" fontFamily={IDENTITY.fontMono} fontSize={11} fill={v <= -73 ? color : 'rgba(238,228,208,0.5)'}>
              {label}
            </text>
          </g>
        );
      })}
      <rect x={at(-73)} y={by} width={at(15) - at(-73)} height={5} fill="rgba(110,170,200,0.35)" />
      <Mono x={bx} y={by + 38} text="RENTANG SKENARIO: 15 °C → −240 °C" size={10} color="rgba(238,228,208,0.3)" tracking={0.14} />
    </InsetFrame>
  );
};

const InsetGravityDelay: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 700;
  const y = 1636;
  const w = 630;
  const h = 214;
  const bx = x + 34;
  const by = y + 132;
  const bw = w - 68;
  const fill = easeOutCubic(prog(t, 1.6, 6.6));
  const marks: [number, string][] = [
    [0, '0'],
    [2, '2'],
    [4, '4'],
    [6, '6'],
    [8.32, '8:19'],
  ];
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="JENDELA KETERLAMBATAN" note="MENIT" color={color} p={prog(t, 1.4, 2.4)}>
      <rect x={bx} y={by - 16} width={bw} height={32} fill="rgba(238,228,208,0.06)" />
      <rect x={bx} y={by - 16} width={bw * clamp01(fill)} height={32} fill={color} opacity={0.4} />
      {marks.map(([v, label], k) => {
        const px = bx + (bw * v) / 8.32;
        return (
          <g key={k}>
            <line x1={px} y1={by - 16} x2={px} y2={by + 16} stroke="rgba(8,8,10,0.6)" strokeWidth={1.4} />
            <text x={px} y={by + 40} textAnchor="middle" fontFamily={IDENTITY.fontMono} fontSize={10} fill="rgba(238,228,208,0.36)">
              {label}
            </text>
          </g>
        );
      })}
      <Mono x={bx} y={by - 30} text="ORBIT MASIH BERJALAN" size={10} color="rgba(238,228,208,0.42)" tracking={0.16} />
      <Mono x={bx + bw} y={by - 30} text="ORBIT LEPAS" size={10} color={color} tracking={0.16} anchor="end" />
      <Mono x={bx} y={y + h - 18} text="GRAVITASI MERAMBAT DENGAN c — BUKAN SEGERA" size={10} color="rgba(238,228,208,0.28)" tracking={0.12} />
      <Mono x={bx + bw} y={y + h - 18} text="8 MNT 19 DTK" size={10} color="rgba(238,228,208,0.3)" tracking={0.14} anchor="end" />
    </InsetFrame>
  );
};

const InsetPhases: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 330;
  const y = 372;
  const w = 1000;
  const h = 196;
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="FASE BULAN SEPANJANG PEKAN" note="SUMBER CAHAYA HILANG" color={color} p={prog(t, 0.6, 1.5)}>
      {Array.from({ length: 9 }).map((_, k) => {
        const cx = x + 84 + k * 104;
        const cy = y + 108;
        const r = 34;
        const ph = clamp01(1 - k / 8);
        const p = easeOutCubic(prog(t, 0.9 + k * 0.45, 1.5 + k * 0.45));
        return (
          <g key={k} opacity={p}>
            <circle cx={cx} cy={cy} r={r} fill="rgba(214,224,236,0.82)" />
            <rect x={cx - r + r * 2 * ph} y={cy - r} width={r * 2} height={r * 2} fill="rgba(4,6,10,0.92)" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(226,236,246,0.3)" strokeWidth={1} />
            <line x1={cx} y1={cy + r + 8} x2={cx} y2={cy + r + 16} stroke="rgba(238,228,208,0.25)" strokeWidth={1} />
            <text x={cx} y={cy + r + 32} textAnchor="middle" fontFamily={IDENTITY.fontMono} fontSize={10} fill="rgba(238,228,208,0.34)">
              {`H${k + 1}`}
            </text>
          </g>
        );
      })}
    </InsetFrame>
  );
};

const InsetDepthLadder: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 930;
  const y = 1500;
  const w = 400;
  const h = 372;
  const top = y + 62;
  const bottom = y + h - 50;
  const stations: [string, string][] = [
    ['0 m', 'es laut 1–2 m'],
    ['200 m', 'cahaya habis'],
    ['1.000 m', 'air 4 °C'],
    ['2.000 m', 'ventilasi 400 °C'],
    ['4.000 m', 'batuan beku'],
  ];
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="LADDER KEDALAMAN" note="VERTIKAL" color={color} p={prog(t, 0.8, 1.7)}>
      <line x1={x + 64} y1={top} x2={x + 64} y2={bottom} stroke="rgba(238,228,208,0.24)" strokeWidth={1.2} />
      {Array.from({ length: 21 }).map((_, k) => {
        const yy = top + ((bottom - top) * k) / 20;
        const major = k % 5 === 0;
        return (
          <line
            key={k}
            x1={x + 64}
            y1={yy}
            x2={x + 64 + (major ? 12 : 6)}
            y2={yy}
            stroke="rgba(238,228,208,0.2)"
            strokeWidth={1}
          />
        );
      })}
      {stations.map(([depth, label], k) => {
        const yy = top + ((bottom - top) * k) / 4;
        const p = easeOutCubic(prog(t, 1.2 + k * 0.6, 1.9 + k * 0.6));
        return (
          <g key={k} opacity={p}>
            <circle cx={x + 64} cy={yy} r={3.4} fill={k === 3 ? color : 'rgba(232,240,248,0.7)'} />
            <text x={x + 84} y={yy - 4} fontFamily={IDENTITY.fontMono} fontSize={11} fill="rgba(238,228,208,0.4)" letterSpacing="0.14em">
              {depth}
            </text>
            <text x={x + 84} y={yy + 14} fontFamily={IDENTITY.fontMono} fontSize={11} fill={k === 3 ? color : 'rgba(238,228,208,0.62)'} letterSpacing="0.1em">
              {label}
            </text>
          </g>
        );
      })}
    </InsetFrame>
  );
};

const InsetChemistry: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 110;
  const y = 1088;
  const w = 432;
  const h = 262;
  const nodes: [string, string][] = [
    ['H2S', 'dari batuan'],
    ['O2', 'dari air'],
    ['S', 'padatan'],
    ['H2O', 'air'],
    ['CO2', 'karbonat'],
  ];
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="REAKSI DI VENTILASI" note="KEMOSINTESIS" color={color} p={prog(t, 0.9, 1.8)}>
      <line x1={x + 66} y1={y + 70} x2={x + 66} y2={y + 70 + 48 * 3} stroke="rgba(238,228,208,0.18)" strokeWidth={1} strokeDasharray="4 6" />
      {nodes.map(([formula, source], k) => {
        const p = easeOutCubic(prog(t, 1.2 + k * 0.55, 1.9 + k * 0.55));
        const cx = x + 66;
        const cy = y + 70 + k * 48;
        return (
          <g key={k} opacity={p}>
            <circle cx={cx} cy={cy} r={16} fill="rgba(10,20,26,0.92)" stroke={k === 0 ? color : 'rgba(200,220,230,0.4)'} strokeWidth={1.2} />
            <text x={cx} y={cy + 4} textAnchor="middle" fontFamily={IDENTITY.fontMono} fontSize={10} fill="rgba(232,244,248,0.85)">
              {formula}
            </text>
            <text x={cx + 28} y={cy + 4} fontFamily={IDENTITY.fontMono} fontSize={10} fill="rgba(238,228,208,0.34)" letterSpacing="0.12em">
              {source}
            </text>
          </g>
        );
      })}
      <Mono x={x + 196} y={y + 86} text="H2S + O2 → S + H2O" size={12} color="rgba(238,228,208,0.62)" tracking={0.12} />
      <Mono x={x + 196} y={y + 108} text="+ ENERGI" size={12} color={color} tracking={0.14} />
      <Mono x={x + 196} y={y + 146} text="TANPA FOTON" size={11} color="rgba(238,228,208,0.3)" tracking={0.2} />
      <Mono x={x + 196} y={y + 166} text="TANPA KLOROFIL" size={11} color="rgba(238,228,208,0.3)" tracking={0.2} />
      <Mono x={x + 196} y={y + 186} text="TANPA MATAHARI" size={11} color="rgba(238,228,208,0.3)" tracking={0.2} />
      <Mono x={x + 196} y={y + 222} text="BAKTERI → CACING → KEPITING" size={10} color="rgba(238,228,208,0.24)" tracking={0.14} />
      <Mono x={x + 196} y={y + 240} text="RANTAI MAKANAN TANPA FOTOSINTESIS" size={9} color="rgba(238,228,208,0.18)" tracking={0.12} />
    </InsetFrame>
  );
};

const InsetEvolution: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 1046;
  const y = 372;
  const w = 284;
  const h = 356;
  const stages: [string, string, number][] = [
    ['AWAN MOLEKUL', '4,5 M th', 0.22],
    ['DERET UTAMA', '4,6 M th', 0.34],
    ['SUBRAKSASA', '5,0 M th', 0.5],
    ['RAKSASA MERAH', '5,4 M th', 0.68],
    ['NEBULA', '5,5 M th', 0.84],
    ['BARA PUTIH', '6 M th →', 1],
  ];
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="EVOLUSI BINTANG" color={color} p={prog(t, 1.0, 1.9)}>
      <line x1={x + 40} y1={y + 54} x2={x + 40} y2={y + h - 34} stroke="rgba(238,228,208,0.22)" strokeWidth={1.2} />
      {stages.map(([name, time, at], k) => {
        const p = easeOutCubic(prog(t, 1.4 + k * 0.6, 2.1 + k * 0.6));
        const yy = y + 62 + k * 50;
        const r = 5 + at * 10;
        return (
          <g key={k} opacity={p}>
            <circle cx={x + 40} cy={yy} r={r} fill={k >= 2 ? color : 'rgba(244,214,160,0.85)'} opacity={0.85} />
            <circle cx={x + 40} cy={yy} r={r + 5} fill="none" stroke={k >= 2 ? color : 'rgba(244,214,160,0.4)'} strokeWidth={1} opacity={0.4} />
            <text x={x + 72} y={yy - 2} fontFamily={IDENTITY.fontMono} fontSize={11} fill="rgba(238,228,208,0.62)" letterSpacing="0.12em">
              {name}
            </text>
            <text x={x + 72} y={yy + 16} fontFamily={IDENTITY.fontMono} fontSize={10} fill="rgba(238,228,208,0.3)" letterSpacing="0.14em">
              {time}
            </text>
          </g>
        );
      })}
    </InsetFrame>
  );
};

const InsetDwarfTable: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 740;
  const y = 1372;
  const w = 590;
  const h = 214;
  const rows: [string, string][] = [
    ['JARI-JARI', '± 10.000 km'],
    ['MASSA', '0,6 massa matahari'],
    ['DENSITAS', '1 ton / cm³'],
    ['SUHU', '100.000 K → 4.000 K'],
    ['UMUR PANAS', 'miliaran tahun'],
  ];
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="SISA INTI" note="BARA PUTIH" color={color} p={prog(t, 1.0, 1.9)}>
      {rows.map(([k, v], idx) => {
        const p = easeOutCubic(prog(t, 1.4 + idx * 0.5, 2.1 + idx * 0.5));
        const yy = y + 68 + idx * 34;
        return (
          <g key={k} opacity={p}>
            <Mono x={x + 20} y={yy} text={k} size={12} color="rgba(238,228,208,0.42)" tracking={0.2} />
            <line x1={x + 168} y1={yy - 4} x2={x + 386} y2={yy - 4} stroke="rgba(238,228,208,0.16)" strokeWidth={1} strokeDasharray="2 5" />
            <Mono x={x + w - 20} y={yy} text={v} size={13} color="rgba(238,228,208,0.74)" tracking={0.12} anchor="end" />
          </g>
        );
      })}
      <line x1={x + 20} y1={y + h - 30} x2={x + w - 20} y2={y + h - 30} stroke="rgba(238,228,208,0.1)" strokeWidth={1} />
      <Mono x={x + 20} y={y + h - 14} text="TIDAK MELEDAK — HANYA BERHENTI" size={10} color={color} tracking={0.18} />
    </InsetFrame>
  );
};

const InsetLightTime: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const x = 960;
  const y = 1076;
  const w = 370;
  const h = 306;
  const ax = x + 40;
  const ay = y + 210;
  const bx = x + w - 44;
  const beam = easeOutCubic(prog(t, 0.8, 3.4));
  return (
    <InsetFrame x={x} y={y} w={w} h={h} title="JALUR CAHAYA" note="8 MNT 20 DTK" color={color} p={prog(t, 0.5, 1.4)}>
      <line x1={ax} y1={ay} x2={bx} y2={ay} stroke="rgba(238,228,208,0.22)" strokeWidth={1} strokeDasharray="5 7" />
      <circle cx={ax} cy={ay} r={22} fill="#F4C25E" opacity={0.9} />
      <circle cx={ax} cy={ay} r={30} fill="none" stroke="rgba(244,194,94,0.35)" strokeWidth={1} />
      <circle cx={bx} cy={ay} r={12} fill="#5E93B4" />
      <circle cx={bx} cy={ay} r={17} fill="none" stroke="rgba(94,147,180,0.45)" strokeWidth={1} />
      {Array.from({ length: 9 }).map((_, k) => {
        const px = ax + (bx - ax - 20) * ((k + 1) / 10);
        const visible = px <= ax + (bx - ax) * beam;
        return <circle key={k} cx={px} cy={ay} r={2.6} fill="rgba(255,226,168,0.9)" opacity={visible ? 0.85 : 0.12} />;
      })}
      <Mono x={ax} y={ay - 46} text="MATAHARI" size={10} color="rgba(244,194,94,0.7)" tracking={0.2} />
      <Mono x={bx} y={ay - 34} text="BUMI" size={10} color="rgba(140,180,205,0.7)" tracking={0.2} anchor="end" />
      <Mono x={ax + 6} y={ay + 32} text="t = 0" size={10} color="rgba(238,228,208,0.3)" tracking={0.16} />
      <Mono x={ax + 6} y={ay - 66} text="c = 299.792 km/dtk" size={10} color="rgba(238,228,208,0.26)" tracking={0.14} />
      <Mono x={bx} y={ay + 32} text="t = 499 s" size={10} color="rgba(238,228,208,0.42)" tracking={0.16} anchor="end" />
      <Mono x={x + 20} y={y + h - 46} text="YANG KAMU LIHAT: SELALU MASA LALU" size={10} color={color} tracking={0.16} />
      <Mono x={x + 20} y={y + h - 24} text="SELISIH = 8 MENIT 19 DETIK" size={10} color="rgba(238,228,208,0.34)" tracking={0.14} />
    </InsetFrame>
  );
};

// ============================================================================
// 01 — CAHAYA YANG TERLAMBAT
// ============================================================================
export const Scene01: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(0);
  const off = prog(t, 9.4, 10.4);
  const alive = 1 - off;
  const reveal = easeOutCubic(prog(t, 0.1, 1.2));

  return (
    <Stage i={0} note="PLAT 01 · KORONA">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="ink-wash" texOpacity={0.26}
        light={{ x: 720, y: 1120, rx: 900, ry: 900, color: `rgba(255,176,80,${0.3 * alive})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={150} t={t} opacity={0.32 + off * 0.5} />
        <Camera localSec={t} dur={dur} push={0.055} drift={9}>
          <Head i={0} t={t} y={640} size={96} />

          {/* plate: punch holes + ruled border */}
          <g opacity={reveal}>
            <rect x={214} y={766} width={1012} height={1012} fill="rgba(10,8,6,0.38)" stroke="rgba(233,214,186,0.22)" strokeWidth={1.4} />
            {[0, 1, 2, 3].map((k) => (
              <g key={k} opacity={0.55}>
                <line x1={214} y1={766 + k * 337} x2={1226} y2={766 + k * 337} stroke="rgba(233,214,186,0.05)" strokeWidth={1} />
                <line x1={214 + k * 337} y1={766} x2={214 + k * 337} y2={1778} stroke="rgba(233,214,186,0.05)" strokeWidth={1} />
              </g>
            ))}
            <Mono x={214} y={740} text="PELAT FOTOGRAFI · 1/2000 s" size={20} color="rgba(233,214,186,0.5)" tracking={0.26} />
            <Mono x={1226} y={740} text="F/8 · ISO 100" size={20} color="rgba(233,214,186,0.4)" tracking={0.24} anchor="end" />
          </g>

          <Corona4K cx={720} cy={1268} r={296} t={t} strength={0.95 * alive} rays={120} />
          <SunCore cx={720} cy={1268} r={296} t={t} alive={alive} cores={1500} spots={4} limb={0.86} />
          <Prominence cx={720} cy={1268} r={296} angle={-0.55} height={150} t={t} phase={0.4} />
          <Prominence cx={720} cy={1268} r={296} angle={2.45} height={112} t={t} phase={2.1} />
          <Prominence cx={720} cy={1268} r={296} angle={-2.2} height={88} t={t} phase={4.2} />
          <circle cx={720} cy={1268} r={296} fill="none" stroke="rgba(255,236,196,0.55)" strokeWidth={2} />
          {off > 0.12 && <GhostSun cx={720} cy={1268} r={296} t={t} color={art.accent} />}

          {/* light already in flight toward the lower left */}
          <g opacity={easeOutCubic(prog(t, 1.2, 2.2))}>
            {[0.1, 0.32, 0.54, 0.76].map((k, i) => (
              <PhotonPacket key={i} x1={514} y1={1486} x2={190} y2={1830} head={(t * 0.2 + k) % 1}
                color={i % 2 === 0 ? '#FFD79A' : '#FFB463'} trail={110 - i * 18} width={2.6} />
            ))}
            <TickRule x1={190} y1={1856} x2={1250} y2={1856} major={8} minor={4} color="rgba(226,206,172,0.45)"
              labels={['0', '', '', '', '', '', '', '', '8:20']} labelSize={24} progress={prog(t, 2.0, 3.4)} />
            <Mono x={190} y={1824} text="CAHAYA TERAKHIR" size={20} color={art.soft} tracking={0.26} />
          </g>
          <InsetLimbDarkening t={t} color={art.accent} />
          <ChapterEyebrow index={0} localSec={t} x={116} />
        </Camera>
        <Furniture i={0} t={t} color={art.accent} note="499,0 S DARI MATAHARI" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 02 — 499 DETIK
// ============================================================================
export const Scene02: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(1);
  const rows = [
    { label: 'JARAK MATAHARI – BUMI', unit: 'KM', at: 0.5, to: 149600000 },
    { label: 'KECEPATAN CAHAYA', unit: 'KM / DETIK', at: 2.4, to: 299792 },
  ];

  return (
    <Stage i={1} note="ARITMETIKA CAHAYA">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="brass-brushed" texOpacity={0.2}
        light={{ x: 320, y: 720, rx: 860, ry: 820, color: 'rgba(255,196,110,0.13)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        {/* engraved arc texture instead of bokeh */}
        <g opacity={0.3}>
          {Array.from({ length: 9 }).map((_, k) => (
            <circle key={k} cx={1180} cy={980} r={330 + k * 78} fill="none" stroke="rgba(255,214,150,0.12)" strokeWidth={1} />
          ))}
        </g>
        <Camera localSec={t} dur={dur} push={0.03} drift={6}>
          <Head i={1} t={t} y={640} size={96} />

          {rows.map((r, i) => {
            const y = 900 + i * 400;
            const p = easeOutCubic(prog(t, r.at, r.at + 1.4));
            return (
              <g key={r.label} opacity={clamp01(p * 1.8)}>
                <Mono x={116} y={y - 128} text={r.label} size={22} color={art.soft} tracking={0.28} />
                <Mono x={1324} y={y - 128} text={`0${i + 1}`} size={22} color="rgba(241,231,210,0.32)" tracking={0.3} anchor="end" />
                <Counter x={110} y={y} from={0} to={r.to} localSec={t} startSec={r.at} durSec={1.4} size={112} color="rgba(243,233,214,0.96)" weight={400} />
                <Mono x={1324} y={y} text={r.unit} size={26} color="rgba(243,233,214,0.42)" tracking={0.18} anchor="end" />
                <RuleLine x1={116} y1={y + 56} x2={1324} y2={y + 56} color="rgba(226,206,172,0.24)" />
              </g>
            );
          })}

          <g opacity={easeOutCubic(prog(t, 4.2, 5.0))}>
            <line x1={116} y1={1348} x2={1324} y2={1348} stroke={art.accent} strokeWidth={2} opacity={0.5} />
            <Mono x={116} y={1404} text="÷" size={52} color={art.accent} tracking={0} />
            <Mono x={180} y={1400} text="149.600.000 ÷ 299.792" size={28} color="rgba(243,233,214,0.6)" tracking={0.06} />
          </g>

          <g opacity={easeOutCubic(prog(t, 5.0, 6.0))}>
            <Mono x={116} y={1520} text="HASIL" size={22} color={art.accent} tracking={0.3} />
            <Counter x={104} y={1780} from={0} to={499} localSec={t} startSec={5.0} durSec={1.8} size={290} color={art.ink} weight={400} tracking="-0.035em" />
            <Mono x={1324} y={1706} text="DETIK" size={44} color="rgba(243,233,214,0.45)" tracking={0.2} anchor="end" />
            <RuleLine x1={116} y1={1840} x2={1324} y2={1840} color="rgba(226,206,172,0.28)" />
            <text x={116} y={1906} fill="rgba(243,233,214,0.66)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
              499 detik. Matahari yang kamu lihat selalu terlambat.
            </text>
          </g>
          <InsetDivision t={t} color={art.accent} />
          <InsetUnitChain t={t} color={art.accent} />
          <ChapterEyebrow index={1} localSec={t} x={116} />
        </Camera>
        <Furniture i={1} t={t} color={art.accent} note="c = 299.792 km/s" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 03 — MELIHAT MASA LALU
// ============================================================================
export const Scene03: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(2);
  const baseY = 1520;
  const x0 = 150;
  const x1 = 1290;
  const logMin = -1.7;
  const logMax = 6.7;
  const lx = (ly: number) => x0 + ((Math.log10(ly) - logMin) / (logMax - logMin)) * (x1 - x0);

  const objects = [
    { name: 'MATAHARI', ly: 1.58e-5, sub: '8,3 menit', at: 0.5, up: true },
    { name: 'PROXIMA CENTAURI', ly: 4.24, sub: '4,2 tahun', at: 2.0, up: false },
    { name: 'BETELGEUSE', ly: 548, sub: '548 tahun', at: 3.6, up: true },
    { name: 'ANDROMEDA', ly: 2.5e6, sub: '2,5 juta tahun', at: 5.2, up: false },
  ];

  return (
    <Stage i={2} note="SKALA LOGARITMIS">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="paper-fibre" texOpacity={0.12}
        light={{ x: 900, y: 960, rx: 820, ry: 820, color: 'rgba(150,180,215,0.13)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={420} t={t} opacity={0.95} band tintB="#F6E3C4" />
        <MilkyWay t={t} opacity={0.55} />
        <Camera localSec={t} dur={dur} push={0.04} drift={8}>
          <Head i={2} t={t} y={640} size={96} />

          {/* constellation guides */}
          <g opacity={0.35} stroke="#9FB4CC" strokeWidth={1.2}>
            <path d="M 180 900 L 320 800 L 470 860 L 560 760 L 700 830" fill="none" />
            <path d="M 760 1780 L 880 1700 L 1010 1760 L 1120 1680" fill="none" />
            <path d="M 1180 980 L 1280 1060 L 1220 1180" fill="none" />
          </g>
          {[[180, 900], [320, 800], [470, 860], [560, 760], [700, 830], [760, 1780], [880, 1700], [1010, 1760], [1120, 1680], [1180, 980], [1280, 1060], [1220, 1180]].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={3 + (k % 3)} fill="#EAF1F8" opacity={0.75} />
          ))}

          <TickRule x1={x0} y1={baseY} x2={x1} y2={baseY} major={4} minor={4} color="rgba(230,237,244,0.5)"
            labels={['1 hr', '1 th', '1 rb th', '1 jt th', '1 M th']} labelSize={23} progress={prog(t, 0.3, 2.0)} />
          <Mono x={x0} y={baseY + 108} text="SKALA LOGARITMIS · JARAK CAHAYA" size={20} color="rgba(230,237,244,0.42)" tracking={0.24} />

          {objects.map((o, i) => {
            const p = easeOutCubic(prog(t, o.at, o.at + 1.0));
            const x = lx(o.ly);
            const yTop = baseY - (o.up ? 230 : 140);
            const anchor: 'start' | 'middle' | 'end' = i === objects.length - 1 ? 'end' : i === 0 ? 'start' : 'middle';
            const tx = anchor === 'end' ? x + 10 : anchor === 'start' ? x - 10 : x;
            return (
              <g key={o.name} opacity={clamp01(p * 1.6)}>
                <line x1={x} y1={baseY} x2={x} y2={lerp(baseY, yTop, p)} stroke={art.accent} strokeWidth={1.8} />
                <circle cx={x} cy={baseY} r={i === 0 ? 10 : 7} fill={i === 0 ? '#FFD79A' : art.accent} />
                <circle cx={x} cy={baseY} r={i === 0 ? 26 : 16} fill={i === 0 ? 'rgba(255,190,110,0.18)' : 'rgba(143,169,196,0.14)'} />
                <text x={tx} y={yTop - 26} fill={art.ink} fontFamily={IDENTITY.fontMono} fontSize={22} letterSpacing="0.16em" textAnchor={anchor}>
                  {o.name}
                </text>
                <text x={tx} y={yTop } fill="rgba(230,237,244,0.5)" fontFamily={IDENTITY.fontMono} fontSize={19} letterSpacing="0.08em" textAnchor={anchor}>
                  {o.sub}
                </text>
              </g>
            );
          })}

          <g opacity={easeOutCubic(prog(t, 6.2, 7.4))}>
            <RuleLine x1={116} y1={1720} x2={1324} y2={1720} color="rgba(230,237,244,0.26)" />
            <text x={116} y={1800} fill="rgba(230,237,244,0.92)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={42}>
              Teleskop bukan mesin waktu.
            </text>
            <text x={116} y={1856} fill="rgba(230,237,244,0.6)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={42}>
              Ia hanya mengumpulkan cahaya yang sudah tua.
            </text>
          </g>
          <InsetStarMap t={t} color={art.accent} />
          <InsetLogScale t={t} color={art.accent} />
          <ChapterEyebrow index={2} localSec={t} x={116} />
        </Camera>
        <Furniture i={2} t={t} color={art.accent} note="1 TH CAHAYA = 9,46 × 10¹² KM" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 04 — MENGELILINGI BAYANGAN
// ============================================================================
export const Scene04: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(3);
  const cx = 720;
  const cy = 1180;
  const R = 392;
  const ang = -1.15 + t * 0.26;
  const ex = cx + Math.cos(ang) * R;
  const ey = cy + Math.sin(ang) * R;

  return (
    <Stage i={3} note="GRAVITASI = c">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="steel-brushed" texOpacity={0.14}
        light={{ x: cx, y: cy, rx: 720, ry: 720, color: 'rgba(120,170,200,0.14)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={220} t={t} opacity={0.7} tintA="#CFE0EC" />
        <Camera localSec={t} dur={dur} push={0.05} drift={7}>
          <Head i={3} t={t} y={640} size={92} />

          {[0, 1, 2].map((k) => {
            const p = (t * 0.22 + k / 3) % 1;
            return <circle key={k} cx={cx} cy={cy} r={lerp(130, R + 250, p)} fill="none" stroke={art.accent} strokeWidth={3 * (1 - p)} opacity={0.5 * (1 - p)} />;
          })}

          <g opacity={0.9}>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(220,231,236,0.42)" strokeWidth={1.8} />
            <circle cx={cx} cy={cy} r={R * 0.62} fill="none" stroke="rgba(220,231,236,0.16)" strokeWidth={1.2} />
            <TickRule x1={cx - R} y1={cy - R} x2={cx + R} y2={cy - R} major={10} minor={4} color="rgba(220,231,236,0.3)" labelSize={14} />
            <TickRule x1={cx + R} y1={cy + R} x2={cx - R} y2={cy + R} major={10} minor={4} color="rgba(220,231,236,0.3)" labelSize={14} />
          </g>

          <GhostSun cx={cx} cy={cy} r={112} t={t} color={art.accent} />
          <Mono x={cx} y={cy + 196} text="TITIK KOSONG" size={20} color="rgba(220,231,236,0.55)" tracking={0.24} anchor="middle" />

          <path d={`M ${cx + Math.cos(ang - 0.8) * R} ${cy + Math.sin(ang - 0.8) * R} A ${R} ${R} 0 0 1 ${ex} ${ey}`}
            fill="none" stroke={art.ink} strokeWidth={4} opacity={0.6} strokeLinecap="round" />
          <EarthGlobe cx={ex} cy={ey} r={46} t={t} terminator={0.45} atmosphere={0.45} />

          <LeaderLabel from={[cx + 250, cy - 250]} to={[cx + 232, cy - 470]} text="GRAVITASI = CAHAYA" sub="keduanya 299.792 km/dtk" anchor="start"
            progress={prog(t, 2.2, 3.4)} color="rgba(226,238,244,0.85)" size={21} />
          <LeaderLabel from={[ex, ey]} to={[ex + 40, ey - 230]} text="ORBIT MASIH BERJALAN" sub="mengelilingi ketiadaan" anchor="start"
            progress={prog(t, 4.6, 5.8)} color="rgba(226,238,244,0.85)" size={22} />

          <g opacity={easeOutCubic(prog(t, 0.8, 1.8))}>
            <Mono x={116} y={1800} text="T − 8:19" size={30} color={art.accent} tracking={0.28} />
            <Mono x={116} y={1852} text="BUMI BELUM TAHU APA PUN" size={21} color="rgba(220,231,236,0.45)" tracking={0.2} />
          </g>
          <InsetVector t={t} color={art.accent} />
          <InsetGravityDelay t={t} color={art.accent} />
          <ChapterEyebrow index={3} localSec={t} x={116} />
        </Camera>
        <Furniture i={3} t={t} color={art.accent} note="ORBIT 365,25 HARI · 29,8 KM/S" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 05 — ORBIT LEPAS
// ============================================================================
export const Scene05: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(4);
  const sx = 320;
  const sy = 1380;
  const launch = easeOutCubic(prog(t, 1.2, 3.6));

  return (
    <Stage i={4} note="VEKTOR LEPAS">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="glass-mist" texOpacity={0.07}
        light={{ x: 1180, y: 900, rx: 900, ry: 760, color: 'rgba(140,180,210,0.14)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={260} t={t} opacity={0.8} tintA="#D6E4F0" />
        <g opacity={0.7}>
          {Array.from({ length: 70 }).map((_, i) => {
            const y = 320 + hash(i, 31) * 1600;
            const len = 120 + hash(i, 32) * 620;
            const sp = 300 + hash(i, 33) * 520;
            const x = ((hash(i, 34) * 2100 + t * sp) % 2100) - 300;
            return <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke="rgba(200,222,240,0.26)" strokeWidth={1 + hash(i, 35) * 1.8} strokeLinecap="round" />;
          })}
        </g>
        <Camera localSec={t} dur={dur} push={0.05} drift={10}>
          <Head i={4} t={t} y={640} size={96} />

          {/* the sun we leave behind */}
          <g opacity={0.6}>
            <SunCore cx={-96} cy={1240} r={150} t={t} cores={90} spots={2} limb={0.9} />
            <Mono x={96} y={1330} text="MATAHARI" size={19} color="rgba(246,231,213,0.5)" tracking={0.24} />
          </g>

          <path d={`M -220 760 A 740 740 0 0 0 ${sx} ${sy}`} fill="none" stroke={art.soft} strokeWidth={2.4} strokeDasharray="10 14" opacity={0.55} />
          <Mono x={150} y={1180} text="ORBIT LAMA" size={19} color={art.soft} tracking={0.26} />

          <VectorArrow x1={sx} y1={sy} x2={sx + 900} y2={sy - 430} color={art.accent} width={7} progress={prog(t, 1.2, 3.4)} head={42} />
          <EarthGlobe cx={sx + 900 * launch} cy={sy - 430 * launch} r={42} t={t} terminator={0.5} />

          <g opacity={easeOutCubic(prog(t, 3.2, 4.2))}>
            <Mono x={116} y={1500} text="KECEPATAN LEPAS" size={22} color={art.soft} tracking={0.28} />
            <Counter x={108} y={1700} from={0} to={107000} localSec={t} startSec={3.2} durSec={2.4} size={166} color={art.ink} weight={400} />
            <Mono x={116} y={1762} text="KILOMETER / JAM" size={30} color={art.accent} tracking={0.2} />
            <Mono x={1324} y={1700} text="≈ 29,8 KM / DETIK" size={24} color="rgba(233,238,244,0.45)" tracking={0.14} anchor="end" />
          </g>

          <g opacity={easeOutCubic(prog(t, 5.6, 6.8))}>
            <Brackets x={116} y={830} w={660} h={190} color="rgba(143,180,201,0.5)" size={24} />
            <Mono x={144} y={890} text="TANPA PUSAT" size={21} color={art.accent} tracking={0.3} />
            <text x={144} y={962} fill="rgba(233,238,244,0.8)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={40}>
              tidak ada yang menarik kita kembali.
            </text>
          </g>
          <InsetTrajectory t={t} color={art.accent} />
          <ChapterEyebrow index={4} localSec={t} x={116} />
        </Camera>
        <Furniture i={4} t={t} color={art.accent} note="T+8:20 · ORBIT DILEPAS" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 06 — MINGGU PERTAMA
// ============================================================================
export const Scene06: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(5);
  const fall = easeOutCubic(prog(t, 1.0, 5.2));
  const temp = lerp(15, -18, fall);

  const pts: readonly [number, number][] = [[0, 15], [0.5, 6], [1, -2], [2, -9], [4, -14], [7, -18], [14, -26], [30, -40], [90, -58], [180, -66], [365, -73]];
  const gx0 = 150;
  const gx1 = 1290;
  const gy0 = 1780;
  const gy1 = 1160;
  const px = (d: number) => gx0 + (Math.log10(d + 1) / Math.log10(366)) * (gx1 - gx0);
  const py = (c: number) => gy0 - ((c + 80) / 100) * (gy0 - gy1);
  const path = pts.map(([d, c], i) => `${i === 0 ? 'M' : 'L'} ${px(d)} ${py(c)}`).join(' ');

  return (
    <Stage i={5} note="KURVA PENDINGINAN">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="glass-mist" texOpacity={0.15}
        light={{ x: 400, y: 780, rx: 800, ry: 740, color: 'rgba(120,170,200,0.11)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={120} t={t} opacity={0.35} tintA="#CFE0EC" />
        <Camera localSec={t} dur={dur} push={0.04} drift={8}>
          <Head i={5} t={t} y={640} size={96} />

          <ThermoGauge x={1092} y={880} h={560} value={temp} min={-100} max={30} color={art.accent} cold="#2F6E92" t={t} />
          <Mono x={1092} y={1560} text="SUHU RATA-RATA" size={18} color="rgba(226,240,248,0.45)" tracking={0.24} anchor="middle" />

          <g opacity={easeOutCubic(prog(t, 0.4, 1.4))}>
            <BigNumber x={108} y={1010} value={temp > -0.5 ? `+${Math.round(temp)}` : `${Math.round(temp)}`} size={230} color={art.ink} />
            <BigNumber x={430} y={940} value="°C" size={100} color={art.accent} />
            <RuleLine x1={116} y1={1052} x2={860} y2={1052} color="rgba(212,232,242,0.24)" />
            <Mono x={116} y={1108} text="MINGGU 1 · RATA-RATA GLOBAL" size={20} color="rgba(226,240,248,0.5)" tracking={0.22} />
          </g>

          <g opacity={easeOutCubic(prog(t, 1.2, 2.2))}>
            <Mono x={150} y={1144} text="SUHU PERMUKAAN · HARI KE-" size={18} color="rgba(226,240,248,0.45)" tracking={0.22} />
            <line x1={gx0} y1={gy0} x2={gx1} y2={gy0} stroke="rgba(212,232,242,0.32)" strokeWidth={1.6} />
            <line x1={gx0} y1={gy0} x2={gx0} y2={gy1 - 30} stroke="rgba(212,232,242,0.32)" strokeWidth={1.6} />
            {[20, 0, -20, -40, -60, -80].map((c) => (
              <g key={c}>
                <line x1={gx0 - 10} y1={py(c)} x2={gx0} y2={py(c)} stroke="rgba(212,232,242,0.4)" strokeWidth={1.4} />
                <text x={gx0 - 22} y={py(c) + 7} fill="rgba(212,232,242,0.5)" fontFamily={IDENTITY.fontMono} fontSize={18} textAnchor="end">{c}</text>
              </g>
            ))}
            {[1, 7, 30, 365].map((d) => (
              <g key={d}>
                <line x1={px(d)} y1={gy0} x2={px(d)} y2={gy0 + 10} stroke="rgba(212,232,242,0.4)" strokeWidth={1.4} />
                <text x={px(d)} y={gy0 + 38} fill="rgba(212,232,242,0.5)" fontFamily={IDENTITY.fontMono} fontSize={18} textAnchor="middle">
                  {d === 365 ? '1 th' : `${d} hr`}
                </text>
              </g>
            ))}
            <path d={path} fill="none" stroke={art.accent} strokeWidth={3.4} strokeDasharray="1700"
              strokeDashoffset={1700 * (1 - easeOutCubic(prog(t, 2.2, 5.0)))} strokeLinecap="round" />
            {pts.map(([d, c], i) => (
              <circle key={i} cx={px(d)} cy={py(c)} r={4.5} fill={art.ink} opacity={0.65 * easeOutCubic(prog(t, 2.2 + i * 0.1, 2.5 + i * 0.1))} />
            ))}
          </g>

          <text x={116} y={1888} fill="rgba(226,240,248,0.82)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
            Fotosintesis berhenti lebih dulu daripada dinginnya.
          </text>
          <InsetCoolingTable t={t} color={art.accent} />
          <InsetThermo t={t} color={art.accent} />
          <ChapterEyebrow index={5} localSec={t} x={116} />
        </Camera>
        <Furniture i={5} t={t} color={art.accent} note="−18 °C DALAM 7 HARI" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 07 — BULAN IKUT PADAM
// ============================================================================
export const Scene07: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(6);
  const sweep = prog(t, 1.0, 9.0);
  const phase = 1 - sweep * 0.97;
  const moonCx = 720;
  const moonCy = 1080;
  const moonR = 208;

  return (
    <Stage i={6} note="ALBEDO 0,12">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="wall-plaster" texOpacity={0.1}
        light={{ x: 760, y: 1000, rx: 900, ry: 900, color: `rgba(190,205,230,${0.18 * (0.3 + phase)})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={320} t={t} opacity={0.6 + sweep * 0.35} tintA="#D8E2EE" band />
        <Camera localSec={t} dur={dur} push={0.045} drift={7}>
          <Head i={6} t={t} y={640} size={96} />

          {/* reflected light: a narrow bundle, not a disc */}
          <g opacity={0.55 * (1 - sweep * 0.85)}>
            {Array.from({ length: 9 }).map((_, k) => {
              const x0 = moonCx - moonR * 0.7 + k * (moonR * 1.4) / 8;
              const x1 = moonCx - 120 + k * 30;
              return <line key={k} x1={x0} y1={moonCy + moonR * 0.9} x2={x1} y2={1580} stroke="rgba(200,216,235,0.16)" strokeWidth={2} />;
            })}
          </g>

          <MoonDisc cx={moonCx} cy={moonCy} r={moonR} t={t} phase={phase} opacity={0.95} tint="#E2E8EF" />
          <circle cx={moonCx} cy={moonCy} r={moonR + 8} fill="none" stroke="rgba(210,224,240,0.24)" strokeWidth={1.4} strokeDasharray="8 12" />

          <EarthGlobe cx={720} cy={1640} r={44} t={t} terminator={0.58} atmosphere={0.5} />
          <Mono x={720} y={1720} text="BUMI · MALAM PERMANEN" size={19} color="rgba(216,226,238,0.5)" tracking={0.22} anchor="middle" />

          <LeaderLabel from={[moonCx + moonR * 0.75, moonCy - 90]} to={[moonCx + moonR + 150, moonCy - 210]} text="MEMANTULKAN 12%" sub="bukan cahayanya sendiri" anchor="start"
            progress={prog(t, 1.0, 2.2)} color="rgba(216,226,238,0.85)" size={21} />
          <LeaderLabel from={[moonCx - moonR * 0.8, moonCy + 120]} to={[moonCx - moonR - 150, moonCy + 60]} text="SUMBER HABIS" sub="pantulan ikut padam" anchor="end"
            progress={prog(t, 4.6, 5.8)} color="rgba(216,226,238,0.85)" size={21} />

          <g opacity={easeOutCubic(prog(t, 6.4, 7.6))}>
            <RuleLine x1={116} y1={1810} x2={1324} y2={1810} color="rgba(216,226,238,0.26)" />
            <text x={116} y={1884} fill="rgba(216,226,238,0.9)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
              Yang tersisa hanya bintang — terlalu redup untuk membaca.
            </text>
          </g>
          <InsetPhases t={t} color={art.accent} />
          <ChapterEyebrow index={6} localSec={t} x={116} />
        </Camera>
        <Furniture i={6} t={t} color={art.accent} note="FASE BULAN = GEOMETRI" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 08 — TAHUN PERTAMA
// ============================================================================
export const Scene08: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(7);
  const ice = easeOutCubic(prog(t, 0.8, 4.6));
  const panelX = 116;
  const panelW = 1208;
  const skyY = 790;
  const skyH = 46;
  const iceY = skyY + skyH;
  const iceH = 24 + 92 * ice;
  const floorY = 1420;

  return (
    <Stage i={7} note="PENAMPANG LAUT">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="concrete" texOpacity={0.12}
        light={{ x: 720, y: 1500, rx: 880, ry: 560, color: 'rgba(255,140,60,0.12)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={110} t={t} opacity={0.28} tintA="#D3E4EE" />
        <Camera localSec={t} dur={dur} push={0.05} drift={7}>
          <Head i={7} t={t} y={640} size={96} />

          <g>
            <defs>
              <linearGradient id="water8" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F3244" />
                <stop offset="45%" stopColor="#08202C" />
                <stop offset="100%" stopColor="#04121A" />
              </linearGradient>
              <linearGradient id="ice8" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8F6FB" />
                <stop offset="55%" stopColor="#B4D5E5" />
                <stop offset="100%" stopColor="#7FA9BE" />
              </linearGradient>
            </defs>
            {/* sky void */}
            <rect x={panelX} y={skyY} width={panelW} height={skyH} fill="#040A10" />
            {/* water */}
            <rect x={panelX} y={iceY} width={panelW} height={floorY - iceY} fill="url(#water8)" />
            {/* thermoclines */}
            {[0, 1, 2].map((k) => (
              <g key={k} opacity={0.5}>
                <line x1={panelX} y1={iceY + 150 + k * 150} x2={panelX + panelW} y2={iceY + 150 + k * 150}
                  stroke="rgba(140,190,210,0.28)" strokeWidth={1.2} strokeDasharray="10 14" />
              </g>
            ))}
            <Mono x={panelX + panelW - 16} y={iceY + 144} text="4 °C" size={16} color="rgba(150,200,220,0.5)" tracking={0.16} anchor="end" />
            <Mono x={panelX + panelW - 16} y={iceY + 294} text="2 °C" size={16} color="rgba(150,200,220,0.45)" tracking={0.16} anchor="end" />
            <Mono x={panelX + panelW - 16} y={iceY + 444} text="1 °C" size={16} color="rgba(150,200,220,0.4)" tracking={0.16} anchor="end" />
            {/* drifting particles */}
            {Array.from({ length: 40 }).map((_, i) => (
              <circle key={i} cx={panelX + hash(i, 12) * panelW} cy={iceY + 60 + hash(i, 13) * (floorY - iceY - 100)}
                r={1 + hash(i, 14) * 2.2} fill="rgba(190,225,240,0.3)" opacity={0.3 + hash(i, 15) * 0.4} />
            ))}
            {/* ice lid */}
            <rect x={panelX} y={iceY} width={panelW} height={iceH} fill="url(#ice8)" />
            <rect x={panelX} y={iceY} width={panelW} height={5} fill="#F2FBFE" opacity={0.95} />
            <defs>
              <linearGradient id="iceShadow8" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(4,18,26,0.55)" />
                <stop offset="100%" stopColor="rgba(4,18,26,0)" />
              </linearGradient>
            </defs>
            <rect x={panelX} y={iceY + iceH} width={panelW} height={130} fill="url(#iceShadow8)" />
            <path d={`M 640 ${floorY + 6} L 668 ${floorY - 96} L 748 ${floorY - 96} L 776 ${floorY + 6} Z`} fill="#101A1E" stroke="rgba(255,150,80,0.24)" strokeWidth={2} />
            <ellipse cx={708} cy={floorY - 96} rx={40} ry={10} fill="rgba(255,158,84,0.5)" />
            {Array.from({ length: 46 }).map((_, k) => {
              const x = panelX + hash(k, 3, 2) * panelW;
              const w = 40 + hash(k, 5) * 90;
              return (
                <g key={k} opacity={0.5 * ice}>
                  <path d={`M ${x} ${iceY + 2} l ${w * 0.4} ${iceH * 0.35} l ${-w * 0.15} ${iceH * 0.3}`} fill="none" stroke="rgba(30,70,95,0.55)" strokeWidth={1.6} />
                  <path d={`M ${x + 8} ${iceY + iceH} l ${w * 0.5} ${-iceH * 0.4}`} fill="none" stroke="rgba(240,252,255,0.5)" strokeWidth={1.2} />
                </g>
              );
            })}
            {/* seafloor + crust */}
            <path d={`M ${panelX} ${floorY} Q 360 ${floorY - 44} 640 ${floorY - 12} T 980 ${floorY - 26} T ${panelX + panelW} ${floorY - 6} L ${panelX + panelW} 1500 L ${panelX} 1500 Z`} fill="#0A161C" />
            <path d={`M ${panelX} ${floorY + 26} Q 420 ${floorY - 6} 760 ${floorY + 20} T ${panelX + panelW} ${floorY + 10} L ${panelX + panelW} 1500 L ${panelX} 1500 Z`} fill="#0C1A20" />
            <ellipse cx={708} cy={floorY - 4} rx={250} ry={54} fill="rgba(255,140,60,0.14)" />
            <ellipse cx={700} cy={floorY - 6} rx={110} ry={20} fill="rgba(255,178,110,0.26)" />
            {Array.from({ length: 18 }).map((_, i) => {
              const k = (t * 0.4 + i / 18) % 1;
              return <circle key={i} cx={700 + Math.sin(i * 2) * (30 + k * 60)} cy={floorY - 20 - k * 240} r={2 + k * 6} fill="rgba(255,200,150,0.5)" opacity={0.4 * (1 - k)} />;
            })}
            <rect x={panelX} y={skyY} width={panelW} height={1500 - skyY} fill="none" stroke="rgba(155,185,199,0.32)" strokeWidth={1.4} />
            <Mono x={panelX + 12} y={skyY - 18} text="PENAMPANG VERTIKAL · 0 – 4 KM" size={18} color="rgba(226,240,248,0.42)" tracking={0.22} />
            {/* depth ruler */}
            {[0, 1, 2, 3, 4].map((k) => (
              <g key={k}>
                <line x1={panelX - 12} y1={skyY + k * 178} x2={panelX} y2={skyY + k * 178} stroke="rgba(226,240,248,0.35)" strokeWidth={1.4} />
                <text x={panelX - 22} y={skyY + k * 178 + 6} fill="rgba(226,240,248,0.42)" fontFamily={IDENTITY.fontMono} fontSize={16} textAnchor="end">
                  {k} km
                </text>
              </g>
            ))}
          </g>

          <LeaderLabel from={[420, iceY + 20]} to={[300, 700]} text="ES 1–2 M" sub="terbentuk dari atas" anchor="end" progress={prog(t, 3.0, 4.0)} color="rgba(226,240,248,0.85)" size={21} />
          <LeaderLabel from={[980, iceY + 300]} to={[1150, 1120]} text="AIR CAIR" sub="ratusan ribu tahun" anchor="start" progress={prog(t, 4.0, 5.0)} color="rgba(226,240,248,0.85)" size={21} />
          <LeaderLabel from={[700, floorY - 30]} to={[1010, 1300]} text="PANAS INTI BUMI" sub="0,087 W/m²" anchor="start" progress={prog(t, 5.2, 6.2)} color="rgba(250,190,150,0.9)" size={21} />

          <g opacity={easeOutCubic(prog(t, 1.2, 2.2))}>
            <Mono x={116} y={1600} text="SUHU PERMUKAAN · SETELAH SETAHUN" size={20} color="rgba(226,240,248,0.45)" tracking={0.2} />
            <BigNumber x={108} y={1780} value="-73" size={186} color={art.ink} />
            <BigNumber x={470} y={1710} value="°C" size={96} color={art.accent} />
            <Mono x={560} y={1770} text="DI ATAS ES BISA LEBIH RENDAH" size={18} color="rgba(226,240,248,0.4)" tracking={0.16} />
          </g>
          <InsetDepthLadder t={t} color={art.accent} />
          <ChapterEyebrow index={7} localSec={t} x={116} />
        </Camera>
        <Furniture i={7} t={t} color={art.accent} note="STABIL ± −240 °C SETELAH JUTAAN TAHUN" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 09 — HIDUP TANPA CAHAYA
// ============================================================================
export const Scene09: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(8);
  const plume = 0.72 + 0.28 * Math.sin(t * 1.3);

  return (
    <Stage i={8} note="ZONA AFOTIK">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="steel-brushed" texOpacity={0.1}
        light={{ x: 700, y: 1420, rx: 620, ry: 520, color: 'rgba(95,168,160,0.16)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="abyss9" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#051520" />
            <stop offset="62%" stopColor="#020A10" />
            <stop offset="100%" stopColor="#01060A" />
          </linearGradient>
          <linearGradient id="crust9" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#2A211B" />
            <stop offset="60%" stopColor="#171310" />
            <stop offset="100%" stopColor="#0C0A09" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1440} height={2560} fill="url(#abyss9)" />

        <Camera localSec={t} dur={dur} push={0.055} drift={10}>
          <Head i={8} t={t} y={640} size={96} />
          <g opacity={easeOutCubic(prog(t, 0.3, 1.4))}>
            <Mono x={116} y={742} text="KEDALAMAN 2.000 M" size={20} color={art.accent} tracking={0.28} />
            <Mono x={1324} y={742} text="TEKANAN 200 ATM" size={19} color="rgba(217,232,236,0.42)" tracking={0.24} anchor="end" />
          </g>

          {/* seafloor */}
          <path d="M 0 1500 Q 260 1446 460 1492 T 900 1466 T 1320 1500 T 1440 1470 L 1440 2100 L 0 2100 Z" fill="#0B1418" />
          <path d="M 0 1500 Q 260 1446 460 1492 T 900 1466 T 1320 1500 T 1440 1470" fill="none" stroke="rgba(140,190,200,0.26)" strokeWidth={2} />
          {Array.from({ length: 22 }).map((_, i) => (
            <path key={i} d={`M ${60 + i * 62} ${1516 + (i % 3) * 26} q 26 -12 52 0`} fill="none"
              stroke="rgba(120,175,190,0.16)" strokeWidth={2} />
          ))}

          {/* black smoker with crust */}
          <g>
            <path d="M 632 1494 L 664 1130 L 788 1130 L 820 1500 Z" fill="url(#crust9)" stroke="rgba(255,150,80,0.28)" strokeWidth={2} />
            {Array.from({ length: 16 }).map((_, k) => (
              <line key={k} x1={650 + hash(k, 8) * 150} y1={1150 + hash(k, 9) * 330} x2={660 + hash(k, 8) * 150} y2={1170 + hash(k, 9) * 330}
                stroke="rgba(255,190,140,0.18)" strokeWidth={2} />
            ))}
            <ellipse cx={726} cy={1132} rx={62} ry={18} fill="#0B1114" stroke="rgba(255,160,90,0.4)" strokeWidth={2} />
            <ellipse cx={726} cy={1132} rx={44} ry={12} fill={`rgba(255,150,70,${0.75 * plume})`} />
            <ellipse cx={726} cy={1132} rx={86} ry={30} fill={`rgba(255,140,60,${0.14 * plume})`} />
            <ellipse cx={726} cy={1108} rx={120} ry={70} fill="rgba(255,150,80,0.10)" />
            {Array.from({ length: 46 }).map((_, i) => {
              const k = (t * 0.30 + i / 46) % 1;
              const x = 726 + Math.sin(k * 7 + i) * (12 + k * 150);
              const y = 1120 - k * 700;
              return <circle key={i} cx={x} cy={y} r={2.5 + k * 9} fill={i % 3 === 0 ? '#FFC48A' : 'rgba(255,168,104,0.9)'} opacity={0.5 * (1 - k)} />;
            })}
          </g>

          {/* bacterial mat */}
          <g opacity={0.55}>
            {Array.from({ length: 60 }).map((_, i) => (
              <circle key={i} cx={380 + hash(i, 21) * 700} cy={1470 + hash(i, 22) * 40} r={3 + hash(i, 23) * 5}
                fill={i % 3 === 0 ? '#5FA8A0' : '#C9A45C'} opacity={0.25 + hash(i, 24) * 0.4} />
            ))}
          </g>

          {/* tube worm clusters */}
          {[0, 1, 2].map((cluster) =>
            [0, 1, 2, 3, 4].map((i) => {
              const x = 900 + cluster * 130 + i * 24 + hash(cluster * 9 + i, 7) * 10;
              const h = 110 + hash(cluster * 9 + i, 8) * 170;
              const sway = Math.sin(t * 0.9 + i + cluster) * 7;
              return (
                <g key={`${cluster}-${i}`}>
                  <path d={`M ${x} 1490 C ${x - 8} ${1490 - h * 0.5} ${x + sway} ${1490 - h * 0.8} ${x + sway * 1.5} ${1490 - h}`}
                    fill="none" stroke="rgba(228,238,238,0.8)" strokeWidth={9} strokeLinecap="round" />
                  <path d={`M ${x} 1490 C ${x - 8} ${1490 - h * 0.5} ${x + sway} ${1490 - h * 0.8} ${x + sway * 1.5} ${1490 - h}`}
                    fill="none" stroke="rgba(120,60,58,0.9)" strokeWidth={3.4} strokeLinecap="round" />
                  <ellipse cx={x + sway * 1.5} cy={1490 - h - 6} rx={9} ry={12} fill="#C25B4E" />
                  <ellipse cx={x + sway * 1.5} cy={1490 - h - 6} rx={15} ry={18} fill="rgba(194,91,78,0.22)" />
                </g>
              );
            }),
          )}

          <LeaderLabel from={[726, 1132]} to={[420, 1020]} text="FLUIDA 400 °C" sub="kaya hidrogen sulfida" anchor="end" progress={prog(t, 2.2, 3.4)} color="rgba(250,200,160,0.9)" size={21} />
          <LeaderLabel from={[940, 1330]} to={[760, 1250]} text="CACING TABUNG" sub="tanpa mulut, tanpa usus" anchor="end" progress={prog(t, 3.8, 5.0)} color="rgba(217,232,236,0.85)" size={21} />

          <g opacity={easeOutCubic(prog(t, 5.4, 6.6))}>
            <Brackets x={116} y={1650} w={620} h={190} color="rgba(95,168,160,0.5)" size={24} />
            <Mono x={144} y={1712} text="KEMOSINTESIS" size={20} color={art.accent} tracking={0.28} />
            <text x={144} y={1782} fill="rgba(217,232,236,0.78)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
              energi dari batu, bukan dari bintang.
            </text>
            <Mono x={144} y={1826} text="H₂S + O₂ → S + H₂O + ENERGI" size={17} color="rgba(217,232,236,0.4)" tracking={0.14} />
          </g>
          <InsetChemistry t={t} color={art.accent} />
          <ChapterEyebrow index={8} localSec={t} x={116} />
        </Camera>
        <Furniture i={8} t={t} color={art.accent} note="TANPA CAHAYA SEJAK AWAL" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 10 — RAKSASA MERAH
// ============================================================================
export const Scene10: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(9);
  const grow = easeOutCubic(prog(t, 1.0, 4.6));

  const bars = [
    { name: 'BUMI', rel: 0.009, at: 4.4, color: '#5E93B4' },
    { name: 'JUPITER', rel: 0.1, at: 4.9, color: '#C9A45C' },
    { name: 'MATAHARI', rel: 1, at: 5.4, color: '#F4C25E' },
    { name: 'RAKSASA MERAH', rel: 2.4, at: 6.0, color: '#D2703F' },
  ];

  return (
    <Stage i={9} note="DERET UTAMA → RAKSASA">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="oxide-rust" texOpacity={0.16}
        light={{ x: 760, y: 1020, rx: 880, ry: 880, color: 'rgba(255,120,50,0.22)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={140} t={t} opacity={0.32} tintA="#F0D8C0" />
        <Camera localSec={t} dur={dur} push={0.045} drift={8}>
          <Head i={9} t={t} y={640} size={96} />

          <SunCore cx={286} cy={1020} r={70} t={t} cores={80} spots={3} hot="#FFF3CE" mid="#F4C25E" edge="#B9702C" />
          <Mono x={286} y={1132} text="HARI INI" size={18} color="rgba(246,231,213,0.5)" tracking={0.24} anchor="middle" />

          <Corona4K cx={790} cy={1020} r={lerp(70, 236, grow)} t={t} strength={0.75 * grow} rays={92} color="#FF8A4A" />
          <SunCore cx={790} cy={1020} r={lerp(70, 236, grow)} t={t} hot="#FFE2B4" mid="#E8703A" edge="#7E2312" cores={900} spots={4} />
          <Mono x={790} y={1320} text="RAKSASA MERAH" size={19} color="rgba(246,231,213,0.62)" tracking={0.24} anchor="middle" />

          {[0, 1, 2].map((k) => {
            const p = prog(t, 3.2 + k * 0.7, 5.4 + k * 0.6);
            const rr = lerp(390, 200, p);
            const a = k * 2.2 + t * 0.32;
            return (
              <g key={k}>
                <circle cx={790 + Math.cos(a) * rr} cy={1020 + Math.sin(a) * rr * 0.5} r={k === 0 ? 13 : 9}
                  fill={k === 0 ? '#C9A45C' : k === 1 ? '#D9C08A' : '#8FB4C9'} opacity={1 - p * 0.95} />
                <circle cx={790 + Math.cos(a) * rr} cy={1020 + Math.sin(a) * rr * 0.5} r={20} fill="rgba(255,150,90,0.12)" opacity={1 - p} />
              </g>
            );
          })}

          {/* size comparison bars */}
          <g opacity={easeOutCubic(prog(t, 4.2, 5.2))}>
            <Mono x={116} y={1440} text="PERBANDINGAN JARI-JARI" size={19} color="rgba(246,231,213,0.45)" tracking={0.24} />
            {bars.map((b, i) => {
              const p = easeOutCubic(prog(t, b.at, b.at + 1.0));
              const w = 40 + Math.sqrt(b.rel) * 520;
              const y = 1492 + i * 78;
              return (
                <g key={b.name} opacity={p}>
                  <text x={116} y={y + 20} fill="rgba(246,231,213,0.55)" fontFamily={IDENTITY.fontMono} fontSize={17} letterSpacing="0.16em">
                    {b.name}
                  </text>
                  <rect x={380} y={y} width={w * p} height={26} fill={b.color} opacity={0.85} />
                  <text x={380 + w * p + 14} y={y + 20} fill="rgba(246,231,213,0.45)" fontFamily={IDENTITY.fontMono} fontSize={16}>
                    {b.rel >= 1 ? `${fmtNum(b.rel, 1)} ×` : fmtNum(b.rel, 3)}
                  </text>
                </g>
              );
            })}
          </g>

          <text x={116} y={1880} fill="rgba(246,231,213,0.9)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
            Merkurius ditelan. Venus ditelan. Bumi jadi bara.
          </text>
          <InsetEvolution t={t} color={art.accent} />
          <ChapterEyebrow index={9} localSec={t} x={116} />
        </Camera>
        <Furniture i={9} t={t} color={art.accent} note="± 5 MILIAR TAHUN DARI SEKARANG" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 11 — BARA PUTIH
// ============================================================================
export const Scene11: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(10);
  const expand = easeOutCubic(prog(t, 1.0, 6.0));

  return (
    <Stage i={10} note="NEBULA PLANET">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="ink-wash" texOpacity={0.18}
        light={{ x: 720, y: 1040, rx: 800, ry: 800, color: `rgba(150,166,212,${0.16 + 0.06 * expand})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={240} t={t} opacity={0.7} tintA="#E2E6F4" band />
        <Camera localSec={t} dur={dur} push={0.05} drift={8}>
          <Head i={10} t={t} y={640} size={96} />

          {[0, 1, 2, 3, 4, 5].map((k) => {
            const p = clamp01(expand * 1.2 - k * 0.1);
            const r = lerp(80, 520 - k * 34, p);
            return (
              <g key={k} opacity={0.55 * (1 - k * 0.12) * p}>
                <circle cx={720} cy={1140} r={r} fill="none" stroke={k % 2 ? '#9AA6D4' : '#7FB6C9'} strokeWidth={2.4} opacity={0.5} />
                <circle cx={720} cy={1140} r={r * 0.93} fill="none" stroke="#DCE4F6" strokeWidth={1} opacity={0.24} strokeDasharray="5 11" />
              </g>
            );
          })}

          <g opacity={0.55 * expand}>
            {Array.from({ length: 54 }).map((_, i) => {
              const a = hash(i, 61) * Math.PI * 2;
              const rr = 160 + hash(i, 62) * 360;
              return (
                <ellipse key={i} cx={720 + Math.cos(a) * rr} cy={1140 + Math.sin(a) * rr * 0.8}
                  rx={26 + hash(i, 63) * 86} ry={12 + hash(i, 64) * 44}
                  fill={i % 3 === 0 ? 'rgba(154,166,212,0.18)' : 'rgba(127,182,201,0.13)'} />
              );
            })}
          </g>

          <SunCore cx={720} cy={1140} r={24} t={t} hot="#FFFFFF" mid="#D6E8F6" edge="#6E9DBA" cores={22} spots={0} />
          <circle cx={720} cy={1140} r={52} fill="none" stroke="rgba(200,226,244,0.35)" strokeWidth={1.4} />
          <Mono x={720} y={1256} text="BARA PUTIH · ± 10.000 KM" size={18} color="rgba(226,230,244,0.55)" tracking={0.22} anchor="middle" />

          {/* spectrum strip */}
          <g opacity={easeOutCubic(prog(t, 4.4, 5.6))}>
            <defs>
              <linearGradient id="spec11" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6B7BD6" />
                <stop offset="26%" stopColor="#7FB6C9" />
                <stop offset="50%" stopColor="#C9D6E8" />
                <stop offset="76%" stopColor="#E8D6B0" />
                <stop offset="100%" stopColor="#D2703F" />
              </linearGradient>
            </defs>
            <rect x={116} y={1660} width={1208} height={44} fill="url(#spec11)" opacity={0.8} />
            {[0.14, 0.22, 0.38, 0.52, 0.66, 0.74, 0.88].map((k, i) => (
              <rect key={i} x={116 + k * 1208} y={1660} width={3 + (i % 2) * 3} height={44} fill="#05070C" opacity={0.85} />
            ))}
            <Mono x={116} y={1640} text="SPEKTRUM SERAPAN · BARA PUTIH" size={18} color="rgba(226,230,244,0.45)" tracking={0.22} />
            <Mono x={116} y={1740} text="4.000 K → 100.000 K → MENDINGIN SELAMANYA" size={17} color="rgba(226,230,244,0.4)" tracking={0.14} />
          </g>

          <LeaderLabel from={[980, 940]} to={[1150, 856]} text="LAPISAN LUAR TERLEPAS" sub="gas dilempar ke angkasa" anchor="start" progress={prog(t, 3.2, 4.4)} color="rgba(226,230,244,0.85)" size={21} />
          <LeaderLabel from={[610, 1290]} to={[390, 1390]} text="TINGGAL INTI" sub="seukuran bumi, sepadat matahari" anchor="end" progress={prog(t, 5.0, 6.2)} color="rgba(226,230,244,0.85)" size={21} />

          <text x={116} y={1866} fill="rgba(226,230,244,0.9)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
            Tidak ada ledakan. Hanya pendinginan yang panjang.
          </text>
          <InsetDwarfTable t={t} color={art.accent} />
          <ChapterEyebrow index={10} localSec={t} x={116} />
        </Camera>
        <Furniture i={10} t={t} color={art.accent} note="10⁹ TAHUN MENDINGIN" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 12 — PESAN UNTUK MATAHARI
// ============================================================================
export const Scene12: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(11);
  const breathe = 0.5 + 0.5 * Math.sin(t * 0.8);
  const cta = easeOutCubic(prog(t, 7.2, 8.6));

  return (
    <Stage i={11} note="CAHAYA = MASA LALU">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="wall-plaster" texOpacity={0.2}
        light={{ x: 960, y: 900, rx: 780, ry: 800, color: `rgba(255,206,130,${0.16 + 0.05 * breathe})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <Camera localSec={t} dur={dur} push={0.05} drift={9}>
          <g opacity={easeOutCubic(prog(t, 0.2, 1.4))}>
            <rect x={232} y={700} width={650} height={840} fill="#141009" stroke="rgba(240,220,186,0.42)" strokeWidth={6} />
            <rect x={254} y={722} width={606} height={796} fill="none" stroke="rgba(240,220,186,0.16)" strokeWidth={2} />
            <line x1={557} y1={700} x2={557} y2={1540} stroke="rgba(240,220,186,0.36)" strokeWidth={5} />
            <line x1={232} y1={1120} x2={882} y2={1120} stroke="rgba(240,220,186,0.36)" strokeWidth={5} />
            {[0, 1, 2, 3].map((k) => (
              <circle key={k} cx={264 + (k % 2) * 588} cy={748 + Math.floor(k / 2) * 742} r={6} fill="rgba(240,220,186,0.5)" />
            ))}
          </g>

          <g opacity={0.44 + 0.18 * breathe}>
            <defs>
              <linearGradient id="shaft12" x1="0" y1="0" x2="0.6" y2="1">
                <stop offset="0%" stopColor="rgba(255,214,150,0.42)" />
                <stop offset="100%" stopColor="rgba(255,196,120,0.03)" />
              </linearGradient>
            </defs>
            <polygon points="254,722 882,1540 1210,1540 296,722" fill="url(#shaft12)" />
            <ellipse cx={900} cy={1600} rx={350} ry={74} fill="rgba(255,206,140,0.2)" />
            {Array.from({ length: 40 }).map((_, i) => (
              <circle key={i} cx={300 + hash(i, 71) * 880 + Math.sin(t * 0.5 + i) * 12} cy={740 + hash(i, 72) * 800 - ((t * 14 + i * 9) % 140)}
                r={1.4 + hash(i, 73) * 2.8} fill="rgba(255,226,180,0.6)" opacity={0.18 + hash(i, 74) * 0.5} />
            ))}
          </g>

          <g opacity={easeOutCubic(prog(t, 1.2, 2.4))}>
            <rect x={986} y={760} width={280} height={280} fill="#100C08" stroke="rgba(240,220,186,0.32)" strokeWidth={3} />
            <SunCore cx={1126} cy={900} r={96} t={t} cores={70} spots={2} />
            <Mono x={986} y={1070} text="PLAT 12 · 8:20" size={17} color="rgba(240,220,186,0.45)" tracking={0.22} />
          </g>

          <g opacity={easeOutCubic(prog(t, 2.0, 3.4))}>
            <Mono x={232} y={1700} text="YANG KAMU LIHAT" size={20} color={art.soft} tracking={0.28} />
            <text x={224} y={1818} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={124} letterSpacing="0.012em">
              MATAHARI
            </text>
            <text x={224} y={1938} fill={art.accent} fontFamily={IDENTITY.fontDisplay} fontSize={124} letterSpacing="0.012em">
              YANG DULU
            </text>
          </g>

          <g opacity={cta} transform={`translate(0 ${(1 - cta) * 22})`}>
            <Mono x={232} y={1656} text="SELISIH 8 MENIT 20 DETIK" size={20} color="rgba(247,236,217,0.55)" tracking={0.22} />
            <Mono x={1324} y={1656} text="TULIS DI KOMENTAR →" size={20} color={art.accent} tracking={0.24} anchor="end" />
          </g>
          <InsetLightTime t={t} color={art.accent} />
          <ChapterEyebrow index={11} localSec={t} x={116} />
        </Camera>
        <Furniture i={11} t={t} color={art.accent} note="SELALU MATAHARI 8 MENIT LALU" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// reference sheet — the numbers printed on the plates, kept in one place so a
// later edit cannot make the graphics disagree with the narration.
// ============================================================================
export const PLATE_REFERENCE = {
  lightSpeedKmS: 299792,
  auKm: 149600000,
  travelSeconds: 499,
  travelClock: '8 mnt 19 dtk',
  escapeSpeedKmH: 107000,
  week1C: -18,
  year1C: -73,
  stableC: -240,
  geothermalWm2: 0.087,
  ventDepthM: 2000,
  ventFluidC: 400,
  redGiantInYears: 5e9,
  redGiantRadiusX: 2.4,
  whiteDwarfKm: 10000,
  sunRadiusKm: 696340,
  earthRadiusKm: 6371,
  moonAlbedo: 0.12,
} as const;

export const PLATE_SOURCES = [
  'NASA Sun Fact Sheet — jarak rata-rata 149,6 juta km, radius 696.340 km',
  'BIPM — kecepatan cahaya dalam vakum 299.792.458 m/s',
  'David Stevenson (Caltech) — skenario hilangnya matahari, suhu permukaan',
  'NASA/ESA — evolusi bintang deret utama, raksasa merah, bara putih',
  'NOAA PMEL — ventilasi hidrotermal, suhu fluida hingga 400 °C',
  'USGS — fluks panas geotermal rata-rata 0,087 W/m²',
] as const;
