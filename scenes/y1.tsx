import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  CHAPTER_ART,
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  easeOutExpo,
  prog,
  smoothstep,
} from './script';
import { Backdrop, FilmGrain, IsoCrystal, LeaderLabel, Mono, RuleLine, VapourWisps, useTex } from './hujan';

const hash2 = (x: number, y: number, seed: number): number => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 362437);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

// ============================================================================
// 1. THE HERO ORGANISM — ANATOMICAL 2D SPRINGTAIL (COLLEMBOLA)
// ============================================================================

export const Springtail: React.FC<{
  x: number;
  y: number;
  s: number;
  walk?: number;
  look?: number;
  furcula?: number;
  gut?: number;
  sporeP?: number;
  alpha?: number;
  bodyFill?: string;
  rim?: string;
}> = ({ x, y, s, walk = 0, look = 0, furcula = 0, gut = 0, sporeP = 0, alpha = 1, bodyFill = '#E5D9BC', rim = 'rgba(255, 248, 226, 0.7)' }) => {
  const segs = [
    { cx: -146, cy: 4, rx: 26, ry: 22 },
    { cx: -116, cy: 2, rx: 28, ry: 25 },
    { cx: -84, cy: 0, rx: 30, ry: 28 },
    { cx: -50, cy: -2, rx: 31, ry: 31 },
    { cx: -16, cy: -3, rx: 30, ry: 33 },
  ];
  const legs = [
    { x0: -60, y0: 24, kx: -78, ky: 62, x1: -96, y1: 92, ph: 0 },
    { x0: -34, y0: 27, kx: -40, ky: 70, x1: -56, y1: 100, ph: 0.5 },
    { x0: -8, y0: 29, kx: -2, ky: 72, x1: -14, y1: 104, ph: 1 },
    { x0: 14, y0: 27, kx: 26, ky: 66, x1: 18, y1: 98, ph: 1.5 },
    { x0: 34, y0: 23, kx: 48, ky: 60, x1: 44, y1: 90, ph: 2 },
    { x0: 50, y0: 18, kx: 64, ky: 52, x1: 62, y1: 80, ph: 2.5 },
  ];

  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} opacity={alpha}>
      {/* contact shadow */}
      <ellipse cx={-60} cy={112} rx={150} ry={16} fill="rgba(0,0,0,0.42)" />

      {/* antennae (two, jointed, with sensory setae at the tips) */}
      {[
        { d: 'M 74,-16 Q 128,-52 176,-44 Q 206,-40 224,-58', ph: 0 },
        { d: 'M 78,-4 Q 132,-18 176,2 Q 208,14 232,4', ph: 1.4 },
      ].map((a, i) => (
        <g key={i}>
          <path d={a.d} fill="none" stroke={bodyFill} strokeWidth={7} strokeLinecap="round" />
          <path d={a.d} fill="none" stroke={rim} strokeWidth={1.4} strokeLinecap="round" opacity={0.55} />
          {[0.32, 0.6, 0.9].map((k, j) => {
            const t = k;
            const px = 74 + (224 - 74) * t + (i === 0 ? -6 : 2) * Math.sin(t * 3);
            const py = -16 + (i === 0 ? -42 + look * 6 : 20) * t;
            return <circle key={j} cx={px} cy={py} r={4.4} fill={bodyFill} stroke={rim} strokeWidth={0.8} opacity={0.9} />;
          })}
          {/* geosmin-sensitive sensilla */}
          <line x1={224} y1={i === 0 ? -58 : 4} x2={238} y2={i === 0 ? -74 : 14} stroke={bodyFill} strokeWidth={2.4} strokeLinecap="round" />
        </g>
      ))}

      {/* furcula: folded under, or fully extended in a launch */}
      {furcula > 0.02 ? (
        <g>
          <path
            d={`M -150,16 Q ${-150 - 120 * furcula},${40 - 90 * furcula} ${-150 - 250 * furcula},${74 - 176 * furcula}`}
            fill="none"
            stroke={bodyFill}
            strokeWidth={9}
            strokeLinecap="round"
            opacity={0.95}
          />
          <path
            d={`M -150,16 Q ${-150 - 108 * furcula},${60 - 60 * furcula} ${-150 - 238 * furcula},${96 - 150 * furcula}`}
            fill="none"
            stroke={bodyFill}
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.7}
          />
          <circle cx={-150 - 250 * furcula} cy={74 - 176 * furcula} r={6} fill={bodyFill} />
        </g>
      ) : (
        <path d="M -150,14 Q -196,44 -196,66" fill="none" stroke={bodyFill} strokeWidth={7} strokeLinecap="round" opacity={0.85} />
      )}

      {/* legs with walking cycle */}
      {legs.map((l, i) => {
        const swing = Math.sin(walk * Math.PI * 2 + l.ph) * 10;
        return (
          <g key={i}>
            <path
              d={`M ${l.x0},${l.y0} Q ${l.kx + swing},${l.ky} ${l.x1 + swing * 1.6},${l.y1}`}
              fill="none"
              stroke={bodyFill}
              strokeWidth={6.4}
              strokeLinecap="round"
              opacity={0.96}
            />
            <path
              d={`M ${l.x0},${l.y0} Q ${l.kx + swing},${l.ky} ${l.x1 + swing * 1.6},${l.y1}`}
              fill="none"
              stroke={rim}
              strokeWidth={1.1}
              strokeLinecap="round"
              opacity={0.4}
            />
            <line x1={l.x1 + swing * 1.6} y1={l.y1} x2={l.x1 + swing * 1.6 + 5} y2={l.y1 + 6} stroke={bodyFill} strokeWidth={2.6} strokeLinecap="round" />
          </g>
        );
      })}

      {/* abdominal segments, from tail to thorax */}
      {segs.map((sg, i) => (
        <g key={i}>
          <ellipse cx={sg.cx} cy={sg.cy} rx={sg.rx} ry={sg.ry} fill={bodyFill} />
          <ellipse cx={sg.cx - sg.rx * 0.26} cy={sg.cy - sg.ry * 0.32} rx={sg.rx * 0.62} ry={sg.ry * 0.5} fill="rgba(255, 252, 240, 0.45)" />
          <ellipse cx={sg.cx + sg.rx * 0.2} cy={sg.cy + sg.ry * 0.36} rx={sg.rx * 0.7} ry={sg.ry * 0.44} fill="rgba(120, 96, 58, 0.16)" />
          <ellipse cx={sg.cx} cy={sg.cy} rx={sg.rx} ry={sg.ry} fill="none" stroke="rgba(96, 76, 44, 0.22)" strokeWidth={1.2} />
        </g>
      ))}

      {/* head, eye patch, mouth cone */}
      <ellipse cx={54} cy={-24} rx={38} ry={33} fill={bodyFill} />
      <ellipse cx={44} cy={-38} rx={24} ry={18} fill="rgba(255, 252, 240, 0.5)" />
      <ellipse cx={64} cy={-20} rx={11} ry={10} fill="#2A2318" opacity={0.82} />
      <circle cx={61} cy={-23} r={3} fill="rgba(255, 255, 255, 0.65)" />
      <path d="M 82,2 Q 92,10 84,20" fill="none" stroke={bodyFill} strokeWidth={6} strokeLinecap="round" />
      <path d="M 86,14 Q 96,16 98,24" fill="none" stroke="rgba(96, 76, 44, 0.6)" strokeWidth={2} strokeLinecap="round" />

      {/* fine body setae */}
      {Array.from({ length: 16 }).map((_, i) => {
        const bx = -150 + i * 13;
        const by = -26 - Math.sin((i / 16) * Math.PI) * 12;
        return <line key={i} x1={bx} y1={by} x2={bx - 4} y2={by - 12} stroke="rgba(240, 228, 200, 0.5)" strokeWidth={1.2} strokeLinecap="round" />;
      })}

      {/* translucent gut + surviving spores */}
      {gut > 0.01 && (
        <g opacity={clamp01(gut)}>
          <path
            d="M 34,10 C 4,26 -40,30 -76,18 C -108,8 -130,16 -148,30"
            fill="none"
            stroke="rgba(196, 158, 96, 0.34)"
            strokeWidth={17}
            strokeLinecap="round"
          />
          <path
            d="M 34,10 C 4,26 -40,30 -76,18 C -108,8 -130,16 -148,30"
            fill="none"
            stroke="rgba(240, 226, 190, 0.22)"
            strokeWidth={11}
            strokeLinecap="round"
          />
          {Array.from({ length: 12 }).map((_, i) => {
            const t = i / 11;
            const px = 30 - t * 176;
            const py = 12 + Math.sin(t * Math.PI) * 16;
            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={4.6}
                fill="#D8A148"
                opacity={clamp01(sporeP * 1.5 - t * 0.4)}
                stroke="rgba(60, 40, 16, 0.5)"
                strokeWidth={0.8}
              />
            );
          })}
        </g>
      )}
    </g>
  );
};

// ============================================================================
// 2. SCENE 05 — "LOUPE NATURALIS": ONE SMALL ANIMAL UNDER A BRASS LENS
// ============================================================================

export const Scene05Loupe: React.FC = () => {
  const frameArt = CHAPTER_ART[4];
  const ch = CHAPTERS[4];
  const frame = useCurrentFrame();
  const localSec = frame / 90;
  const globalSec = ch.start + localSec;

  const humus = useTex('humus-fibre');
  const lensIn = easeOutExpo(prog(localSec, 0.1, 1.7));
  const animalIn = clamp01(prog(globalSec, 62.3, 64.4));
  const walkP = clamp01(prog(globalSec, 63.0, 69.4));
  const antennaP = prog(globalSec, 69.4, 71.4);
  const credit = easeOutCubic(prog(globalSec, 62.6, 63.8));

  const cx = 706;
  const cy = 946;
  const R = 430;
  const drift = Math.sin(localSec * 0.35) * 6;

  return (
    <AbsoluteFill>
      <Backdrop
        top="#10160F"
        bottom={frameArt.paper}
        tex="humus-fibre"
        texOpacity={0.42}
        light={{ x: 1080, y: 420, rx: 820, ry: 720, color: 'rgba(226, 186, 118, 0.18)', strength: 1 }}
      />

      {/* out-of-focus litter in the foreground, framing the lens */}
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={0.9}>
          {Array.from({ length: 9 }).map((_, i) => {
            const lx = i * 166 - 60;
            const sway = Math.sin(localSec * 0.5 + i) * 4;
            return (
              <ellipse
                key={i}
                cx={lx + 60}
                cy={1920 + (i % 3) * 70}
                rx={150 + (i % 4) * 40}
                ry={34 + (i % 3) * 16}
                fill="rgba(12, 14, 10, 0.86)"
                transform={`rotate(${(i % 2 ? 6 : -5) + sway} ${lx + 60} ${1920})`}
              />
            );
          })}
        </g>
      </svg>

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        {/* ---------------- type: naturalist's notebook margins ------------- */}
        <g opacity={easeOutCubic(prog(localSec, 0.2, 1.4))}>
          <Mono x={96} y={296} text="EVOLUSI ± 450 JUTA TAHUN" size={18} color={frameArt.soft} tracking={0.32} />
          <RuleLine x1={96} y1={318} x2={96 + 300 * easeOutCubic(prog(localSec, 0.3, 1.6))} y2={318} color="rgba(206, 192, 162, 0.36)" />
          <Mono x={1344} y={296} text="COLLEMBOLA" size={18} color="rgba(214, 200, 172, 0.6)" anchor="end" tracking={0.3} />
        </g>

        {/* ---------------- the brass loupe ---------------- */}
        <g
          opacity={lensIn}
          transform={`translate(${cx + drift}, ${cy}) scale(${0.9 + 0.1 * lensIn}) translate(${-cx - drift}, ${-cy})`}
        >
          {/* lens shadow on the ground */}
          <ellipse cx={cx + 30} cy={cy + R + 120} rx={R * 0.86} ry={60} fill="rgba(0,0,0,0.45)" />

          {/* lens interior */}
          <defs>
            <clipPath id="s5-lens">
              <circle cx={cx} cy={cy} r={R - 18} />
            </clipPath>
            <radialGradient id="s5-glass" cx="36%" cy="28%" r="76%">
              <stop offset="0%" stopColor="rgba(255, 250, 232, 0.14)" />
              <stop offset="62%" stopColor="rgba(255, 240, 210, 0.03)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0.32)" />
            </radialGradient>
            <radialGradient id="s5-lamp" cx="50%" cy="42%" r="60%">
              <stop offset="0%" stopColor="rgba(240, 208, 150, 0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          <g clipPath="url(#s5-lens)">
            <rect x={cx - R} y={cy - R} width={R * 2} height={R * 2} fill="#1A1710" />
            {humus && <image href={humus} x={cx - R} y={cy - R} width={R * 2} height={R * 2} opacity={0.9} />}
            <rect x={cx - R} y={cy - R} width={R * 2} height={R * 2} fill="url(#s5-lamp)" />

            {/* soil crumbs & root hairs inside the lens */}
            {Array.from({ length: 14 }).map((_, i) => {
              const a = hash2(i, 3, 11) * Math.PI * 2;
              const rad = 120 + hash2(i, 9, 21) * (R - 130);
              return (
                <g key={i} opacity={0.7}>
                  <ellipse cx={cx + Math.cos(a) * rad} cy={cy + Math.sin(a) * rad} rx={10 + hash2(i, 5, 3) * 22} ry={7 + hash2(i, 7, 5) * 14} fill="rgba(60, 44, 28, 0.9)" />
                  <ellipse cx={cx + Math.cos(a) * rad - 3} cy={cy + Math.sin(a) * rad - 4} rx={6} ry={4} fill="rgba(214, 182, 130, 0.22)" />
                </g>
              );
            })}
            {Array.from({ length: 9 }).map((_, i) => (
              <path
                key={i}
                d={`M ${cx - 220 + i * 54},${cy + 176} C ${cx - 240 + i * 52},${cy + 60} ${cx - 170 + i * 48},${cy + 20} ${cx - 210 + i * 50},${cy - 90}`}
                fill="none"
                stroke="rgba(212, 190, 148, 0.16)"
                strokeWidth={1.6}
              />
            ))}

            {/* bait colony: geosmin crystals among dead filaments */}
            <g transform={`translate(${cx - 250}, ${cy + 96})`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <path
                  key={i}
                  d={`M 0,0 Q ${-16 + i * 9},${-40 - i * 8} ${6 + i * 6},${-78 - i * 12}`}
                  fill="none"
                  stroke="rgba(232, 220, 190, 0.5)"
                  strokeWidth={2.4}
                />
              ))}
              <IsoCrystal x={-16} y={6} s={17} h={30} opacity={0.9} />
              <IsoCrystal x={16} y={12} s={12} h={40} opacity={0.85} />
              <IsoCrystal x={2} y={-6} s={9} h={22} opacity={0.8} />
              <VapourWisps x={2} y={-10} p={antennaP} count={3} height={180} color="rgba(230, 200, 150, 0.34)" />
            </g>

            {/* the animal itself */}
            <g transform={`translate(${cx + 30 - walkP * 26}, ${cy + 74})`}>
              <Springtail x={0} y={0} s={1.42} walk={walkP * 4} look={Math.sin(localSec * 1.1)} gut={0.2} sporeP={0.2} />
            </g>

            {/* scent trail: geosmin drifting into the antennae */}
            <g>
              <path
                d={`M ${cx - 208},${cy + 30} C ${cx - 150},${cy - 30} ${cx - 60},${cy - 20} ${cx + 66},${cy - 40}`}
                fill="none"
                stroke="rgba(214, 168, 96, 0.66)"
                strokeWidth={2}
                strokeDasharray="3 9"
                strokeDashoffset={-localSec * 26}
              />
              {[0.3, 0.62, 0.86].map((k, i) => {
                const px = cx - 208 + (cx + 66 - (cx - 208)) * k;
                const py = cy + 30 + (cy - 40 - (cy + 30)) * k + Math.sin(k * 6) * 14;
                return (
                  <circle
                    key={i}
                    cx={px}
                    cy={py}
                    r={5 - i * 0.6}
                    fill="none"
                    stroke="rgba(226, 188, 120, 0.8)"
                    strokeWidth={1.4}
                    opacity={clamp01(antennaP * 1.6 - i * 0.15)}
                  />
                );
              })}
            </g>

            {/* needle-tip scale reference, tucked inside the lens */}
            <g transform={`translate(${cx + 232}, ${cy + 300}) rotate(-16)`} opacity={easeOutCubic(prog(globalSec, 69.8, 71.2))}>
              <polygon points="150,-6 18,2 150,10" fill="#C9CFCB" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
              <ellipse cx={126} cy={2} rx={9} ry={2.4} fill="#1A1710" />
              <RuleLine x1={-4} y1={18} x2={44} y2={18} color="rgba(238, 226, 198, 0.9)" width={1.8} />
              <RuleLine x1={-4} y1={12} x2={-4} y2={24} color="rgba(238, 226, 198, 0.9)" width={1.8} />
              <RuleLine x1={44} y1={12} x2={44} y2={24} color="rgba(238, 226, 198, 0.9)" width={1.8} />
              <Mono x={-10} y={44} text="1,5 MM" size={15} color="rgba(244, 234, 210, 0.9)" tracking={0.18} />
            </g>

            {/* glass coating */}
            <rect x={cx - R} y={cy - R} width={R * 2} height={R * 2} fill="url(#s5-glass)" />
          </g>

          {/* brass ring, knurled */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#8C7343" strokeWidth={30} />
          <circle cx={cx} cy={cy} r={R + 8} fill="none" stroke="rgba(244, 216, 158, 0.5)" strokeWidth={3} />
          <circle cx={cx} cy={cy} r={R - 16} fill="none" stroke="rgba(40, 30, 16, 0.8)" strokeWidth={3} />
          {Array.from({ length: 84 }).map((_, i) => {
            const a = (i / 84) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={cx + Math.cos(a) * (R - 14)}
                y1={cy + Math.sin(a) * (R - 14)}
                x2={cx + Math.cos(a) * (R + 14)}
                y2={cy + Math.sin(a) * (R + 14)}
                stroke={i % 2 === 0 ? 'rgba(246, 222, 172, 0.34)' : 'rgba(40, 30, 16, 0.36)'}
                strokeWidth={2}
              />
            );
          })}
          {/* ring highlight */}
          <path
            d={`M ${cx - R * 0.82},${cy - R * 0.58} A ${R} ${R} 0 0 1 ${cx + R * 0.2},${cy - R * 0.97}`}
            fill="none"
            stroke="rgba(255, 246, 216, 0.66)"
            strokeWidth={6}
            strokeLinecap="round"
          />
          {/* handle */}
          <g transform={`translate(${cx + R * 0.72}, ${cy + R * 0.72}) rotate(38)`}>
            <rect x={0} y={-26} width={340} height={52} rx={10} fill="#6E5934" stroke="rgba(244, 216, 158, 0.5)" strokeWidth={2} />
            <rect x={0} y={-26} width={340} height={18} rx={9} fill="rgba(246, 224, 176, 0.22)" />
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={i} x1={52 + i * 58} y1={-24} x2={52 + i * 58} y2={24} stroke="rgba(24, 18, 10, 0.4)" strokeWidth={3} />
            ))}
          </g>
        </g>

        {/* ---------------- annotations with leader lines ------------------- */}
        <g opacity={credit}>
          <LeaderLabel from={[cx - 150, cy - 118]} to={[cx - 348, cy - 232]} text="ANTENA PELACAK" sub="SENSILA GEOSMIN" color="rgba(232, 216, 184, 0.72)" size={16} dot="#D8A148" anchor="end" />
          <LeaderLabel from={[cx - 96, cy + 176]} to={[cx + 210, cy + 268]} text="MULUT PENGGERUS" sub="SISA KOLONI BAKTERI" color="rgba(232, 216, 184, 0.72)" size={16} dot="#D8A148" />
          <LeaderLabel from={[cx + 96, cy + 118]} to={[cx + 300, cy + 34]} text="RONGGA PERUT" sub="CANGKANG SPORA LOLOS" color="rgba(232, 216, 184, 0.6)" size={15} dot="#D8A148" />
        </g>

        {/* ---------------- name plate, set like a museum label ------------ */}
        <g opacity={easeOutCubic(prog(globalSec, 62.8, 64.2))}>
          <text x={92} y={1508} fill={frameArt.ink} fontFamily={IDENTITY.fontFraunces} fontStyle="italic" fontSize={104} letterSpacing="-0.02em">
            Kutu pegas
          </text>
          <g transform="translate(96, 1546)">
            <RuleLine x1={0} y1={0} x2={380 * easeOutCubic(prog(globalSec, 63.2, 64.8))} y2={0} color="rgba(214, 198, 168, 0.42)" />
            <Mono x={0} y={36} text="COLLEMBOLA · FOLSOMIA CANDIDA" size={17} color="rgba(226, 214, 190, 0.72)" tracking={0.16} />
          </g>
          <text x={92} y={1652} fill="rgba(230, 220, 198, 0.62)" fontFamily={IDENTITY.fontGrotesk} fontSize={30} fontWeight={400} letterSpacing="-0.01em">
            arthropoda tanah seukuran ujung jarum
          </text>
        </g>

        <g opacity={credit}>
          <Mono x={1344} y={1636} text="BECHER ET AL." size={17} color="rgba(226, 214, 190, 0.66)" anchor="end" tracking={0.2} />
          <Mono x={1344} y={1666} text="NATURE MICROBIOLOGY · 2020" size={14} color="rgba(200, 190, 168, 0.46)" anchor="end" tracking={0.14} weight={400} />
        </g>
      </svg>

      <FilmGrain opacity={0.16} />
    </AbsoluteFill>
  );
};

// ============================================================================
// 3. SCENE 06 — "ATLAS & LONTARAN": CUTAWAY PLATE, THEN A LETTERBOX JUMP
// ============================================================================

const GutInset: React.FC<{ cx: number; cy: number; r: number; p: number; uid: string }> = ({ cx, cy, r, p, uid }) => {
  const g = easeOutCubic(clamp01(p));
  return (
    <g>
      <defs>
        <clipPath id={uid}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <radialGradient id={`${uid}-wall`} cx="42%" cy="36%" r="70%">
          <stop offset="0%" stopColor="#7A5A34" />
          <stop offset="70%" stopColor="#4A3320" />
          <stop offset="100%" stopColor="#241708" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="#120D08" />
      <g clipPath={`url(#${uid})`} opacity={g}>
        <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-wall)`} />
        {/* folded gut wall */}
        {Array.from({ length: 18 }).map((_, i) => (
          <path
            key={i}
            d={`M ${cx - r},${cy - r + i * (r / 9)} Q ${cx},${cy - r + i * (r / 9) + 18} ${cx + r},${cy - r + i * (r / 9)}`}
            fill="none"
            stroke="rgba(232, 206, 160, 0.16)"
            strokeWidth={2}
          />
        ))}
        {/* intact spore shells clinging to the wall */}
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2 + 0.6;
          const rad = r * (0.42 + (i % 3) * 0.16);
          return (
            <g key={i}>
              <circle cx={cx + Math.cos(a) * rad} cy={cy + Math.sin(a) * rad} r={13 + (i % 3) * 3} fill="#D8A148" stroke="rgba(60, 38, 12, 0.7)" strokeWidth={1.4} />
              <circle cx={cx + Math.cos(a) * rad - 4} cy={cy + Math.sin(a) * rad - 4} r={4.4} fill="rgba(255, 246, 220, 0.55)" />
            </g>
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#B08C58" strokeWidth={12} />
      <circle cx={cx} cy={cy} r={r + 7} fill="none" stroke="rgba(240, 214, 168, 0.4)" strokeWidth={2} />
      <Mono x={cx} y={cy + r + 42} text="PERBESARAN SALURAN CERNA" size={14} color="rgba(226, 212, 186, 0.6)" anchor="middle" tracking={0.14} weight={400} />
    </g>
  );
};

export const Scene06AtlasLontaran: React.FC = () => {
  const frame = useCurrentFrame();
  const ch = CHAPTERS[5];
  const localSec = frame / 90;
  const globalSec = ch.start + localSec;
  const art = CHAPTER_ART[5];

  const humus = useTex('humus-fibre');

  const atlasIn = easeOutCubic(prog(localSec, 0.1, 1.2));
  const gutIn = prog(globalSec, 78.2, 80.2);
  const atlasOut = easeInOutCubic(prog(globalSec, 83.0, 84.2));
  const bandIn = easeInOutCubic(prog(globalSec, 83.1, 84.6));
  const launch = easeInOutCubic(prog(globalSec, 84.4, 86.5));
  const dust = prog(globalSec, 86.4, 87.6);
  const sprout = prog(globalSec, 86.9, 88.9);

  const bandTop = 726;
  const bandH = 604;
  const bandOpen = Math.max(2, bandH * bandIn);

  // ballistic arc between the two islands
  const islands = { leftX: 236, rightX: 1204, groundY: bandTop + 452 };
  const arc = (t: number): [number, number] => {
    const x = islands.leftX + (islands.rightX - islands.leftX) * t;
    const y = islands.groundY - Math.sin(Math.PI * t) * 300;
    return [x, y];
  };
  const [jx, jy] = arc(launch);
  const jumpAngle = (() => {
    const [ax, ay] = arc(clamp01(launch - 0.02));
    const [bx, by] = arc(clamp01(launch + 0.02));
    return (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
  })();

  return (
    <AbsoluteFill>
      <Backdrop top="#0C0F0C" bottom={art.paper} tex="soot" texOpacity={0.45} light={{ x: 420, y: 560, rx: 760, ry: 640, color: 'rgba(196, 168, 118, 0.14)', strength: 1 }} />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        {/* ================= ACT 1: THE DISSECTION PLATE ================= */}
        <g opacity={atlasIn * (1 - atlasOut)} transform={`translate(0, ${-atlasOut * 60})`}>
          <Mono x={92} y={300} text="ATLAS ANATOMI · PENYEBARAN SPORA" size={18} color={art.soft} tracking={0.3} />
          <RuleLine x1={92} y1={322} x2={392} y2={322} color="rgba(206, 192, 162, 0.34)" />

          <text x={90} y={452} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={124} letterSpacing="0.01em">
            CANGKANG
          </text>
          <text x={90} y={560} fill="none" stroke={art.ink} strokeWidth={1.6} opacity={0.7} fontFamily={IDENTITY.fontDisplay} fontSize={124} letterSpacing="0.01em">
            LOLOS UTUH
          </text>

          {/* the animal, translucent enough to read its gut */}
          <g transform={`translate(700, 1010) scale(2.35)`}>
            <Springtail x={0} y={0} s={1} walk={localSec * 1.2} gut={clamp01(gutIn * 1.4)} sporeP={clamp01(gutIn * 1.3)} />
          </g>

          {/* gut magnification disc */}
          <GutInset cx={300} cy={1120} r={182} p={gutIn} uid="s6-gut" />

          {/* annotations */}
          <g opacity={easeOutCubic(prog(globalSec, 79.4, 80.6))}>
            <LeaderLabel from={[712, 1078]} to={[1004, 1210]} text="SALURAN CERNA" sub="SPORA BERTAHAN DARI ENZIM" color="rgba(232, 218, 190, 0.74)" size={16} dot="#D8A148" />
            <LeaderLabel from={[560, 902]} to={[396, 812]} text="KUTIKULA BERBULU" sub="TEMPAT SPORA MENEMPEL" color="rgba(232, 218, 190, 0.7)" size={16} dot="#D8A148" anchor="end" />
            <LeaderLabel from={[878, 1140]} to={[1082, 1290]} text="EKOR PEGAS (FURCULA)" sub="PELONTAR PULUHAN KALI TINGGI TUBUH" color="rgba(232, 218, 190, 0.7)" size={15} dot="#D8A148" />
          </g>

          {/* the strategy, stated as typography not as a chart */}
          <g opacity={easeOutCubic(prog(globalSec, 80.4, 81.8))}>
            <RuleLine x1={92} y1={1456} x2={1348} y2={1456} color="rgba(206, 192, 162, 0.24)" />
            <text x={90} y={1524} fill={art.ink} fontFamily={IDENTITY.fontGrotesk} fontSize={36} fontWeight={500} letterSpacing="-0.01em">
              korban satu koloni,
            </text>
            <text x={90} y={1572} fill={art.accent} fontFamily={IDENTITY.fontFraunces} fontStyle="italic" fontSize={44}>
              ribuan spora pindah rumah
            </text>
          </g>
        </g>

        {/* ================= ACT 2: THE LETTERBOX LAUNCH ================= */}
        <g opacity={bandIn}>
          <defs>
            <clipPath id="s6-band">
              <rect x={0} y={bandTop + (bandH - bandOpen) / 2} width={1440} height={bandOpen} />
            </clipPath>
            <linearGradient id="s6-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#161C18" />
              <stop offset="58%" stopColor="#20302A" />
              <stop offset="100%" stopColor="#101512" />
            </linearGradient>
          </defs>

          <g clipPath="url(#s6-band)">
            <rect x={0} y={bandTop} width={1440} height={bandH} fill="url(#s6-sky)" />
            {humus && <image href={humus} x={0} y={bandTop + bandH - 200} width={1440} height={260} opacity={0.5} preserveAspectRatio="none" />}

            {/* distant haze */}
            <ellipse cx={720} cy={bandTop + 300} rx={640} ry={190} fill="rgba(150, 176, 150, 0.08)" />

            {/* left island: dry, cracked */}
            <g>
              <path d={`M ${islands.leftX - 250},${islands.groundY} L ${islands.leftX + 236},${islands.groundY} L ${islands.leftX + 210},${islands.groundY + 120} L ${islands.leftX - 214},${islands.groundY + 120} Z`} fill="#2A1A10" />
              {Array.from({ length: 26 }).map((_, i) => (
                <ellipse key={i} cx={islands.leftX - 220 + i * 18} cy={islands.groundY + 22 + (i % 5) * 17} rx={12} ry={7} fill={`rgba(${96 + (i % 4) * 22}, ${58 + (i % 3) * 16}, 38, 0.7)`} />
              ))}
              {Array.from({ length: 7 }).map((_, i) => (
                <path
                  key={`c${i}`}
                  d={`M ${islands.leftX - 200 + i * 62},${islands.groundY + 4} l ${18 + (i % 3) * 9},${26 + (i % 4) * 12} l ${-14},${26}`}
                  fill="none"
                  stroke="rgba(18, 10, 6, 0.7)"
                  strokeWidth={2}
                />
              ))}
              <text x={islands.leftX - 214} y={islands.groundY + 158} fill="rgba(232, 214, 182, 0.6)" fontFamily={IDENTITY.fontMono} fontSize={16} letterSpacing="0.2em">
                TANAH LAMA · KERING
              </text>
            </g>

            {/* right island: damp, with a fresh colony sprouting */}
            <g>
              <path d={`M ${islands.rightX - 236},${islands.groundY} L ${islands.rightX + 250},${islands.groundY} L ${islands.rightX + 226},${islands.groundY + 128} L ${islands.rightX - 212},${islands.groundY + 128} Z`} fill="#241A12" />
              {Array.from({ length: 28 }).map((_, i) => (
                <ellipse key={i} cx={islands.rightX - 226 + i * 18} cy={islands.groundY + 20 + (i % 6) * 18} rx={13} ry={8} fill={`rgba(${52 + (i % 4) * 18}, ${44 + (i % 5) * 14}, 30, 0.8)`} />
              ))}
              <ellipse cx={islands.rightX + 6} cy={islands.groundY + 8} rx={92} ry={14} fill="rgba(140, 176, 164, 0.14)" />
              {/* new colony filaments rising from the landing point */}
              {Array.from({ length: 6 }).map((_, i) => {
                const gp = clamp01(sprout * 1.4 - i * 0.1);
                return (
                  <g key={i}>
                    <path
                      d={`M ${islands.rightX - 30 + i * 20},${islands.groundY + 6} Q ${islands.rightX - 24 + i * 20},${islands.groundY - 40 * gp} ${islands.rightX - 40 + i * 22},${islands.groundY - 96 * gp}`}
                      fill="none"
                      stroke="rgba(238, 228, 200, 0.8)"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      opacity={gp}
                    />
                    {gp > 0.6 && <circle cx={islands.rightX - 40 + i * 22} cy={islands.groundY - 96 * gp} r={4.6} fill="#D8A148" opacity={gp} />}
                  </g>
                );
              })}
              <text x={islands.rightX + 222} y={islands.groundY + 158} textAnchor="end" fill="rgba(232, 214, 182, 0.6)" fontFamily={IDENTITY.fontMono} fontSize={16} letterSpacing="0.2em">
                TANAH LEMBAP · BARU
              </text>
            </g>

            {/* ballistic trajectory */}
            <path
              d={`M ${islands.leftX},${islands.groundY - 40} Q ${720},${islands.groundY - 620} ${islands.rightX},${islands.groundY - 40}`}
              fill="none"
              stroke="rgba(216, 161, 72, 0.46)"
              strokeWidth={2}
              strokeDasharray="7 12"
              strokeDashoffset={-(launch * 120)}
              opacity={clamp01(bandIn)}
            />
            {Array.from({ length: 9 }).map((_, i) => {
              const t = (i + 1) / 11;
              const [tx, ty] = arc(t);
              return <circle key={i} cx={tx} cy={ty} r={2.6} fill="rgba(232, 200, 140, 0.5)" opacity={clamp01(launch * 1.6 - t * 0.9)} />;
            })}

            {/* launch dust */}
            {dust > 0.02 &&
              Array.from({ length: 18 }).map((_, i) => {
                const a = Math.PI + (i / 17) * Math.PI;
                const rad = easeOutCubic(dust) * (40 + (i % 6) * 20);
                return (
                  <circle
                    key={i}
                    cx={islands.leftX + Math.cos(a) * rad}
                    cy={islands.groundY - 10 + Math.sin(a) * rad * 0.5}
                    r={4 + (i % 4) * 2}
                    fill="rgba(196, 168, 126, 0.4)"
                    opacity={clamp01(1 - dust)}
                  />
                );
              })}

            {/* the animal in flight, with speed ghosts */}
            {launch > 0.03 && launch < 0.99 && (
              <g transform={`translate(${jx}, ${jy}) rotate(${jumpAngle})`}>
                {[0.14, 0.08].map((k, i) => {
                  const [gx, gy] = arc(clamp01(launch - k));
                  return (
                    <g key={i} transform={`translate(${gx - jx}, ${gy - jy})`} opacity={0.18 + i * 0.12}>
                      <Springtail x={0} y={0} s={1.28} furcula={1} alpha={0.8} />
                    </g>
                  );
                })}
                <Springtail x={0} y={0} s={1.34} furcula={1} alpha={1} />
              </g>
            )}

            {/* letterbox inner shading */}
            <rect x={0} y={bandTop} width={1440} height={70} fill="url(#s6-sky)" opacity={0.8} />
            <rect x={0} y={bandTop + bandH - 70} width={1440} height={70} fill="url(#s6-sky)" opacity={0.8} />
          </g>

          {/* thin brass rules marking the letterbox */}
          <RuleLine x1={0} y1={bandTop} x2={1440} y2={bandTop} color="rgba(206, 190, 160, 0.24)" width={1.4} />
          <RuleLine x1={0} y1={bandTop + bandH} x2={1440} y2={bandTop + bandH} color="rgba(206, 190, 160, 0.24)" width={1.4} />
        </g>

        {/* ================= typography outside the band ================== */}
        <g opacity={easeOutCubic(prog(globalSec, 84.0, 85.4))}>
          <text x={90} y={540} fill={art.ink} fontFamily={IDENTITY.fontInstrument} fontStyle="italic" fontSize={116} letterSpacing="-0.02em">
            melenting
          </text>
          <text x={90} y={640} fill={art.ink} fontFamily={IDENTITY.fontInstrument} fontStyle="italic" fontSize={116} letterSpacing="-0.02em" opacity={0.9}>
            jauh
          </text>
          <RuleLine x1={92} y1={686} x2={92 + 320 * easeOutCubic(prog(globalSec, 84.4, 85.8))} y2={686} color="rgba(214, 196, 164, 0.42)" />
          <Mono x={94} y={722} text="TANPA SAYAP, TANPA BULU TERBANG" size={16} color="rgba(224, 210, 184, 0.66)" tracking={0.16} />
        </g>

        <g opacity={easeOutCubic(prog(globalSec, 86.2, 87.6))}>
          <Mono x={92} y={1452} text="KURIR MIKROSKOPIS" size={16} color={art.accent} tracking={0.3} />
          <text x={90} y={1528} fill={art.ink} fontFamily={IDENTITY.fontGrotesk} fontSize={46} fontWeight={500} letterSpacing="-0.02em">
            spora menumpang,
          </text>
          <text x={90} y={1580} fill={art.ink} fontFamily={IDENTITY.fontGrotesk} fontSize={46} fontWeight={500} letterSpacing="-0.02em">
            koloni berpindah
          </text>
          <Mono x={1348} y={1580} text="100% CANGKANG UTUH" size={16} color="rgba(224, 210, 184, 0.6)" anchor="end" tracking={0.18} />
        </g>
      </svg>

      <FilmGrain opacity={0.17} />
    </AbsoluteFill>
  );
};
