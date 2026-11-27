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
}> = ({ x, y, s, walk = 0, look = 0, furcula = 0, gut = 0, sporeP = 0, alpha = 1, bodyFill = '#DCCFAD', rim = 'rgba(255, 250, 232, 0.66)' }) => {
  const uid = `sp-${Math.round(x)}-${Math.round(y)}-${Math.round(s * 100)}`;

  // thorax legs: three pairs, each with a real knee and two claws
  const legs = [
    { x0: 30, y0: 16, kx: 44, ky: 40, x1: 54, y1: 62, ph: 0 },
    { x0: 12, y0: 20, kx: 20, ky: 44, x1: 24, y1: 68, ph: 1.6 },
    { x0: -6, y0: 20, kx: -14, ky: 44, x1: -12, y1: 66, ph: 3.1 },
  ];

  const body =
    'M -152,-4 C -154,-18 -140,-28 -120,-30 C -96,-34 -66,-32 -44,-26 C -24,-22 -8,-18 6,-12 C 20,-8 30,-3 33,5 C 35,15 24,20 10,22 C -12,26 -46,28 -76,24 C -106,22 -132,18 -146,8 C -152,4 -152,0 -152,-4 Z';
  const head =
    'M 30,-14 C 36,-30 54,-36 70,-28 C 84,-20 88,-2 82,10 C 76,22 58,26 46,20 C 34,13 27,2 30,-14 Z';

  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} opacity={alpha}>
      <ellipse cx={-40} cy={70} rx={112} ry={11} fill="rgba(0,0,0,0.34)" />

      {/* antennae: two four-segment, beaded feelers off the snout */}
      {[
        { a: -18, spread: -1, ph: 0 },
        { a: 4, spread: 1, ph: 1.7 },
      ].map((ant, i) => {
        const sway = Math.sin(look * 2 + ant.ph) * 3;
        const x0 = 80;
        const y0 = ant.a;
        const d = `M ${x0},${y0} C ${x0 + 26},${y0 - 10 + sway * ant.spread} ${x0 + 44},${y0 + 12} ${x0 + 62},${y0 + 6 + sway}`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={bodyFill} strokeWidth={5} strokeLinecap="round" />
            <path d={d} fill="none" stroke="rgba(96, 76, 44, 0.3)" strokeWidth={1.2} strokeLinecap="round" transform="translate(0.8, 1.2)" />
            {[0.25, 0.48, 0.7, 0.9, 1].map((k, j) => {
              const px = x0 + 62 * k;
              const py = y0 + Math.sin(k * 2.6) * 8 + sway * k;
              return <circle key={j} cx={px} cy={py} r={j === 4 ? 2.4 : 2.9} fill="rgba(250, 244, 226, 0.92)" stroke="rgba(96, 76, 44, 0.42)" strokeWidth={0.6} />;
            })}
          </g>
        );
      })}

      {/* furcula: folded beneath the abdomen, or snapped open for the jump */}
      <g>
        <path
          d={furcula > 0.02
            ? `M -34,20 Q ${-34 - 64 * furcula},${26 + 34 * furcula} ${-34 - 150 * furcula},${10 + 96 * furcula}`
            : 'M -34,20 Q -70,34 -104,30'}
          fill="none"
          stroke={bodyFill}
          strokeWidth={4.6}
          strokeLinecap="round"
        />
        {furcula > 0.02 && (
          <path
            d={`M ${-34 - 150 * furcula},${10 + 96 * furcula} l -12,${-8 * furcula - 4} M ${-34 - 150 * furcula},${10 + 96 * furcula} l -12,${8 * furcula + 4}`}
            fill="none"
            stroke={bodyFill}
            strokeWidth={3.6}
            strokeLinecap="round"
          />
        )}
      </g>

      {/* legs */}
      {legs.map((l, i) => {
        const swing = Math.sin(walk * Math.PI * 2 + l.ph) * 7;
        return (
          <g key={i}>
            <path
              d={`M ${l.x0},${l.y0} Q ${l.kx + swing * 0.4},${l.ky} ${l.x1 + swing},${l.y1}`}
              fill="none"
              stroke={bodyFill}
              strokeWidth={4.8}
              strokeLinecap="round"
            />
            <path
              d={`M ${l.x0},${l.y0} Q ${l.kx + swing * 0.4},${l.ky} ${l.x1 + swing},${l.y1}`}
              fill="none"
              stroke="rgba(104, 82, 48, 0.26)"
              strokeWidth={1.2}
              strokeLinecap="round"
              transform="translate(0.8, 1)"
            />
            <path d={`M ${l.x1 + swing},${l.y1} l 5,7 M ${l.x1 + swing},${l.y1} l -5,7`} fill="none" stroke={bodyFill} strokeWidth={2.2} strokeLinecap="round" />
          </g>
        );
      })}

      {/* abdomen + thorax */}
      <defs>
        <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0.1" y2="1">
          <stop offset="0%" stopColor="rgba(255, 250, 234, 0.62)" />
          <stop offset="46%" stopColor="rgba(255, 246, 222, 0.1)" />
          <stop offset="100%" stopColor="rgba(104, 80, 44, 0.34)" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d={body} fill={bodyFill} />
      <path d={body} fill={`url(#${uid}-fill)`} />
      <g clipPath={`url(#${uid}-clip)`}>
        {/* abdominal segment ridges, shallow and curved */}
        {[-136, -114, -92, -70, -48, -26].map((sx, i) => (
          <path
            key={i}
            d={`M ${sx},${-30 + i * 0.4} C ${sx + 7},${-14} ${sx + 7},${10} ${sx},${24}`}
            fill="none"
            stroke="rgba(104, 80, 44, 0.2)"
            strokeWidth={1.5}
          />
        ))}
        {/* translucent gut */}
        {gut > 0.01 && (
          <g opacity={clamp01(gut)}>
            <path d="M 34,2 C 6,10 -30,14 -70,8 C -104,3 -128,6 -146,2" fill="none" stroke="rgba(178, 138, 78, 0.34)" strokeWidth={11} strokeLinecap="round" />
            <path d="M 34,2 C 6,10 -30,14 -70,8 C -104,3 -128,6 -146,2" fill="none" stroke="rgba(248, 238, 210, 0.22)" strokeWidth={5} strokeLinecap="round" />
            {sporeP > 0.01 &&
              Array.from({ length: 14 }).map((_, i) => {
                const t = i / 13;
                if (t > sporeP * 1.2) return null;
                const px = 24 - t * 160;
                const py = 4 + Math.sin(t * Math.PI * 1.3) * 7;
                return (
                  <g key={i}>
                    <circle cx={px} cy={py} r={3.1} fill="rgba(226, 176, 96, 0.92)" />
                    <circle cx={px - 0.9} cy={py - 0.9} r={1.1} fill="rgba(255, 246, 216, 0.9)" />
                  </g>
                );
              })}
          </g>
        )}
        {/* body sheen */}
        <ellipse cx={-70} cy={-12} rx={70} ry={11} fill="rgba(255, 252, 240, 0.16)" />
      </g>
      <path d={body} fill="none" stroke="rgba(108, 84, 46, 0.36)" strokeWidth={1.2} />

      {/* dorsal setae */}
      {Array.from({ length: 22 }).map((_, i) => {
        const bx = -140 + i * 7.6;
        const by = -30 + Math.abs(bx + 60) * 0.03;
        return <line key={i} x1={bx} y1={by} x2={bx - 4} y2={by - 7} stroke="rgba(250, 242, 218, 0.42)" strokeWidth={0.9} strokeLinecap="round" />;
      })}

      {/* collophore tube under the thorax */}
      <path d="M 6,22 L 4,32 L 12,32 Z" fill={bodyFill} stroke="rgba(108, 84, 46, 0.3)" strokeWidth={0.8} />

      {/* head capsule, set slightly forward of the thorax */}
      <path d={head} fill={bodyFill} stroke="rgba(108, 84, 46, 0.36)" strokeWidth={1.2} />
      <path d="M 36,-16 C 44,-30 60,-32 72,-26" fill="none" stroke={rim} strokeWidth={2.4} strokeLinecap="round" opacity={0.6} />
      {/* eye patch: a small cluster of ommatidia, not one cartoon eye */}
      <g>
        <ellipse cx={62} cy={-6} rx={12} ry={11} fill="rgba(38, 28, 16, 0.8)" />
        {[
          [58, -10],
          [66, -9],
          [57, -2],
          [64, -1],
          [61, -6],
        ].map(([ox, oy], i) => (
          <circle key={i} cx={ox} cy={oy} r={2.3} fill="#171008" />
        ))}
        <circle cx={57.4} cy={-11.4} r={1.4} fill="rgba(255, 250, 232, 0.7)" />
      </g>
      {/* mouth cone */}
      <path d="M 76,10 C 84,16 84,26 76,32" fill="none" stroke={bodyFill} strokeWidth={5} strokeLinecap="round" />
      <path d="M 78,28 C 84,30 86,34 84,38" fill="none" stroke="rgba(96, 76, 44, 0.5)" strokeWidth={1.6} strokeLinecap="round" />
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
          {/* lens shadow on the ground, soft-edged */}
          <ellipse cx={cx + 26} cy={cy + R + 96} rx={R * 0.78} ry={44} fill="rgba(0,0,0,0.34)" opacity={0.7} />
          <ellipse cx={cx + 26} cy={cy + R + 96} rx={R * 0.46} ry={26} fill="rgba(0,0,0,0.22)" />

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
              <ellipse cx={6} cy={148} rx={190} ry={20} fill="rgba(20, 14, 8, 0.42)" />
              <Springtail x={0} y={0} s={1.62} walk={walkP * 4} look={Math.sin(localSec * 1.1)} gut={0.2} sporeP={0.2} />
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

            {/* refraction: the glass brightens and bends what sits near its rim */}
            <rect x={cx - R} y={cy - R} width={R * 2} height={R * 2} fill="url(#s5-lamp)" opacity={0.5} />
            <circle cx={cx} cy={cy} r={R - 20} fill="none" stroke="rgba(255, 244, 216, 0.16)" strokeWidth={48} />
            <circle cx={cx} cy={cy} r={R - 46} fill="none" stroke="rgba(120, 150, 150, 0.12)" strokeWidth={3} />

            {/* chromatic fringe at the bean edge and a broad specular sweep */}
            <circle cx={cx} cy={cy} r={R - 20} fill="none" stroke="rgba(240, 176, 120, 0.16)" strokeWidth={5} />
            <circle cx={cx} cy={cy} r={R - 26} fill="none" stroke="rgba(150, 196, 206, 0.14)" strokeWidth={3} />
            <ellipse cx={cx - R * 0.32} cy={cy - R * 0.42} rx={R * 0.52} ry={R * 0.24} fill="rgba(255, 250, 232, 0.1)" transform={`rotate(-32 ${cx} ${cy})`} />
            <path d={`M ${cx - R * 0.72},${cy - R * 0.1} A ${R * 0.74} ${R * 0.74} 0 0 1 ${cx - R * 0.1},${cy - R * 0.72}`} fill="none" stroke="rgba(255, 250, 232, 0.3)" strokeWidth={7} strokeLinecap="round" />

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
          {/* engraved magnification tag on the ring */}
          <g transform={`translate(${cx - 6}, ${cy + R + 4})`}>
            <rect x={-52} y={-20} width={104} height={40} rx={4} fill="#3A2C16" stroke="rgba(246, 220, 168, 0.55)" strokeWidth={1.6} />
            <text x={0} y={8} textAnchor="middle" fill="rgba(248, 226, 178, 0.94)" fontFamily={IDENTITY.fontMono} fontSize={20} fontWeight={600} letterSpacing="0.1em">
              10×
            </text>
          </g>
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
          <LeaderLabel from={[cx - 96, cy - 148]} to={[238, 640]} text="ANTENA PELACAK" sub="SENSILA GEOSMIN" color="rgba(232, 216, 184, 0.74)" size={17} dot="#D8A148" anchor="end" />
          <LeaderLabel from={[cx + 96, cy - 26]} to={[1182, 1052]} text="RONGGA PERUT" sub="CANGKANG SPORA LOLOS UTUH" color="rgba(232, 216, 184, 0.66)" size={16} dot="#D8A148" />
          <LeaderLabel from={[cx - 24, cy + 158]} to={[1182, 1290]} text="MULUT PENGGERUS" sub="SISA KOLONI BAKTERI" color="rgba(232, 216, 184, 0.66)" size={16} dot="#D8A148" />
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

        <g opacity={easeOutCubic(prog(globalSec, 64.4, 66.0))}>
          <RuleLine x1={92} y1={1740} x2={1348} y2={1740} color="rgba(214, 198, 168, 0.22)" />
          <Mono x={92} y={1782} text="TAKSONOMI" size={14} color="rgba(214, 200, 172, 0.42)" tracking={0.26} weight={400} />
          <Mono x={92} y={1818} text="HEXAPODA · COLLEMBOLA · FOLSOMIA" size={17} color="rgba(232, 220, 196, 0.7)" tracking={0.14} />
          <Mono x={1348} y={1782} text="PANJANG TUBUH" size={14} color="rgba(214, 200, 172, 0.42)" anchor="end" tracking={0.26} weight={400} />
          <Mono x={1348} y={1818} text="1 – 3 MM" size={17} color="rgba(232, 220, 196, 0.7)" anchor="end" tracking={0.14} />
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
  const islands = { leftX: 322, rightX: 1128, groundY: bandTop + 430 };
  const arc = (t: number): [number, number] => {
    const x = islands.leftX + (islands.rightX - islands.leftX) * t;
    const y = islands.groundY - Math.sin(Math.PI * t) * 336;
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
          <g transform={`translate(716, 1044) scale(2.5)`}>
            <Springtail x={0} y={0} s={1} walk={localSec * 1.2} gut={clamp01(gutIn * 1.4)} sporeP={clamp01(gutIn * 1.3)} />
          </g>

          {/* gut magnification disc, hung under the specimen */}
          <GutInset cx={1082} cy={1486} r={156} p={gutIn} uid="s6-gut" />
          <path
            d="M 900,1120 C 990,1180 1060,1290 1074,1330"
            fill="none"
            stroke="rgba(214, 190, 148, 0.34)"
            strokeWidth={1.4}
            strokeDasharray="6 8"
            opacity={clamp01(gutIn * 1.2)}
          />

          {/* annotations */}
          <g opacity={easeOutCubic(prog(globalSec, 79.4, 80.6))}>
            <LeaderLabel from={[820, 1082]} to={[1006, 1188]} text="SALURAN CERNA" sub="SPORA BERTAHAN DARI ENZIM" color="rgba(232, 218, 190, 0.74)" size={16} dot="#D8A148" />
            <LeaderLabel from={[604, 986]} to={[404, 868]} text="KUTIKULA BERBULU" sub="TEMPAT SPORA MENEMPEL" color="rgba(232, 218, 190, 0.7)" size={16} dot="#D8A148" anchor="end" />
            <LeaderLabel from={[436, 1112]} to={[436, 1330]} text="EKOR PEGAS (FURCULA)" sub="PELONTAR 30× TINGGI TUBUH" color="rgba(232, 218, 190, 0.7)" size={15} dot="#D8A148" anchor="end" />
          </g>

          {/* measured scale bar */}
          <g opacity={easeOutCubic(prog(globalSec, 80.0, 81.4))} transform="translate(1016, 1748)">
            <RuleLine x1={0} y1={0} x2={300} y2={0} color="rgba(232, 220, 196, 0.8)" width={2} />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={i * 100} y1={-9} x2={i * 100} y2={9} stroke="rgba(232, 220, 196, 0.8)" strokeWidth={2} />
            ))}
            <Mono x={0} y={34} text="0" size={13} color="rgba(232, 220, 196, 0.58)" tracking={0.1} weight={400} />
            <Mono x={300} y={34} text="1,5 MM" size={13} color="rgba(232, 220, 196, 0.58)" anchor="end" tracking={0.1} weight={400} />
          </g>

          {/* the strategy, stated as typography not as a chart */}
          <g opacity={easeOutCubic(prog(globalSec, 80.4, 81.8))}>
            <RuleLine x1={92} y1={1720} x2={1348} y2={1720} color="rgba(206, 192, 162, 0.24)" />
            <text x={90} y={1788} fill={art.ink} fontFamily={IDENTITY.fontGrotesk} fontSize={36} fontWeight={500} letterSpacing="-0.01em">
              korban satu koloni,
            </text>
            <text x={90} y={1840} fill={art.accent} fontFamily={IDENTITY.fontFraunces} fontStyle="italic" fontSize={44}>
              ribuan spora pindah rumah
            </text>
            <Mono x={1348} y={1720 - 26} text="PLAT VI · FOLSOMIA CANDIDA" size={14} color="rgba(206, 194, 168, 0.44)" anchor="end" tracking={0.16} weight={400} />
          </g>
        </g>

        {/* ================= ACT 2: THE LETTERBOX LAUNCH ================= */}
        <g opacity={bandIn}>
          <defs>
            <clipPath id="s6-band">
              <rect x={0} y={bandTop + (bandH - bandOpen) / 2} width={1440} height={bandOpen} />
            </clipPath>
            <linearGradient id="s6-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0E1418" />
              <stop offset="46%" stopColor="#1E2724" />
              <stop offset="78%" stopColor="#3A3626" />
              <stop offset="100%" stopColor="#4A3F28" />
            </linearGradient>
            <linearGradient id="s6-soil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A3020" />
              <stop offset="100%" stopColor="#1E1209" />
            </linearGradient>
            <clipPath id="s6-left">
              <path d={`M ${islands.leftX - 250},${bandTop + bandH} L ${islands.leftX - 250},${islands.groundY - 34} C ${islands.leftX - 170},${islands.groundY - 74} ${islands.leftX - 60},${islands.groundY - 6} ${islands.leftX + 30},${islands.groundY - 26} C ${islands.leftX + 110},${islands.groundY - 46} ${islands.leftX + 180},${islands.groundY + 4} ${islands.leftX + 232},${islands.groundY - 14} L ${islands.leftX + 232},${bandTop + bandH} Z`} />
            </clipPath>
            <clipPath id="s6-right">
              <path d={`M ${islands.rightX - 250},${bandTop + bandH} L ${islands.rightX - 250},${islands.groundY - 26} C ${islands.rightX - 160},${islands.groundY - 12} ${islands.rightX - 70},${islands.groundY - 54} ${islands.rightX + 20},${islands.groundY - 30} C ${islands.rightX + 110},${islands.groundY - 6} ${islands.rightX + 180},${islands.groundY - 40} ${islands.rightX + 250},${islands.groundY - 18} L ${islands.rightX + 250},${bandTop + bandH} Z`} />
            </clipPath>
          </defs>

          <g clipPath="url(#s6-band)">
            <rect x={0} y={bandTop} width={1440} height={bandH} fill="url(#s6-sky)" />

            {/* far ridges, two depths */}
            <path d={`M -40,${islands.groundY - 6} C 180,${islands.groundY - 96} 360,${islands.groundY - 26} 560,${islands.groundY - 62} C 760,${islands.groundY - 98} 980,${islands.groundY - 18} 1180,${islands.groundY - 54} L 1480,${islands.groundY - 20} L 1480,${bandTop + bandH} L -40,${bandTop + bandH} Z`} fill="rgba(36, 40, 30, 0.72)" />
            <path d={`M -40,${islands.groundY + 18} C 200,${islands.groundY - 40} 420,${islands.groundY + 6} 640,${islands.groundY - 22} C 880,${islands.groundY - 54} 1080,${islands.groundY + 8} 1280,${islands.groundY - 18} L 1480,${islands.groundY + 4} L 1480,${bandTop + bandH} L -40,${bandTop + bandH} Z`} fill="rgba(26, 30, 22, 0.8)" />

            {/* hot horizon band */}
            <rect x={0} y={islands.groundY - 120} width={1440} height={130} fill="rgba(214, 164, 96, 0.16)" />

            {/* LEFT: dry, cracked laterite cliff */}
            <g>
              <path d={`M ${islands.leftX - 250},${islands.groundY} L ${islands.leftX + 232},${islands.groundY} L ${islands.leftX + 232},${bandTop + bandH} L ${islands.leftX - 250},${bandTop + bandH} Z`} fill="url(#s6-soil)" />
              <g clipPath="url(#s6-left)">
                {humus && <image href={humus} x={islands.leftX - 260} y={islands.groundY - 90} width={500} height={300} opacity={0.5} preserveAspectRatio="none" />}
                {Array.from({ length: 16 }).map((_, i) => (
                  <ellipse key={i} cx={islands.leftX - 226 + i * 30} cy={islands.groundY + 26 + (i % 4) * 22} rx={17} ry={11} fill={`rgba(${88 + (i % 3) * 16}, ${56 + (i % 2) * 12}, 36, 0.55)`} />
                ))}
                {[0, 1, 2, 3, 4].map((i) => (
                  <path key={i} d={`M ${islands.leftX - 190 + i * 78},${islands.groundY - 6} l ${16 + (i % 3) * 8},{30 + (i % 2) * 16} l -12,20`} fill="none" stroke="rgba(20, 10, 4, 0.55)" strokeWidth={2.2} />
                ))}
              </g>
              <path d={`M ${islands.leftX - 250},${islands.groundY - 34} C ${islands.leftX - 170},${islands.groundY - 74} ${islands.leftX - 60},${islands.groundY - 6} ${islands.leftX + 30},${islands.groundY - 26} C ${islands.leftX + 110},${islands.groundY - 46} ${islands.leftX + 180},${islands.groundY + 4} ${islands.leftX + 232},${islands.groundY - 14}`} fill="none" stroke="rgba(238, 196, 138, 0.5)" strokeWidth={2.4} />
              {/* dry grass tufts */}
              {Array.from({ length: 9 }).map((_, i) => {
                const gx = islands.leftX - 180 + i * 42;
                const sway = Math.sin(localSec * 1.2 + i) * 4;
                return <path key={i} d={`M ${gx},${islands.groundY - 18} C ${gx + sway},${islands.groundY - 44} ${gx + 6 + sway},${islands.groundY - 62} ${gx + 2 + sway},${islands.groundY - 78}`} fill="none" stroke="rgba(150, 132, 88, 0.6)" strokeWidth={2} strokeLinecap="round" />;
              })}
              <text x={islands.leftX - 236} y={bandTop + bandH - 24} fill="rgba(232, 214, 182, 0.62)" fontFamily={IDENTITY.fontMono} fontSize={15} letterSpacing="0.2em">
                TANAH LAMA · KERING
              </text>
            </g>

            {/* RIGHT: damp soil with a fresh colony */}
            <g>
              <path d={`M ${islands.rightX - 250},${islands.groundY} L ${islands.rightX + 250},${islands.groundY} L ${islands.rightX + 250},${bandTop + bandH} L ${islands.rightX - 250},${bandTop + bandH} Z`} fill="#241A11" />
              <g clipPath="url(#s6-right)">
                {humus && <image href={humus} x={islands.rightX - 250} y={islands.groundY - 80} width={500} height={290} opacity={0.6} preserveAspectRatio="none" />}
                {Array.from({ length: 14 }).map((_, i) => (
                  <ellipse key={i} cx={islands.rightX - 220 + i * 32} cy={islands.groundY + 30 + (i % 5) * 20} rx={18} ry={11} fill={`rgba(${50 + (i % 3) * 12}, ${42 + (i % 4) * 10}, 28, 0.7)`} />
                ))}
              </g>
              <path d={`M ${islands.rightX - 250},${islands.groundY - 26} C ${islands.rightX - 160},${islands.groundY - 12} ${islands.rightX - 70},${islands.groundY - 54} ${islands.rightX + 20},${islands.groundY - 30} C ${islands.rightX + 110},${islands.groundY - 6} ${islands.rightX + 180},${islands.groundY - 40} ${islands.rightX + 250},${islands.groundY - 18}`} fill="none" stroke="rgba(196, 210, 190, 0.42)" strokeWidth={2.2} />
              {/* damp sheen + water film */}
              <ellipse cx={islands.rightX + 24} cy={islands.groundY - 18} rx={130} ry={20} fill="rgba(128, 164, 156, 0.22)" />
              <ellipse cx={islands.rightX + 24} cy={islands.groundY - 20} rx={92} ry={12} fill="rgba(186, 214, 204, 0.16)" />
              {/* new colony rising from the landing point */}
              {Array.from({ length: 7 }).map((_, i) => {
                const gp = clamp01(sprout * 1.4 - i * 0.09);
                const bx = islands.rightX - 54 + i * 20;
                return (
                  <g key={i} opacity={gp}>
                    <path d={`M ${bx},${islands.groundY - 12} C ${bx - 8},${islands.groundY - 46} ${bx + 10},${islands.groundY - 70} ${bx - 4},${islands.groundY - 108 * gp - 12}`} fill="none" stroke="rgba(240, 230, 202, 0.86)" strokeWidth={2.6} strokeLinecap="round" />
                    <circle cx={bx - 4} cy={islands.groundY - 108 * gp - 14} r={5} fill="#D8A148" opacity={clamp01(gp * 1.4 - 0.3)} />
                  </g>
                );
              })}
              <text x={islands.rightX + 236} y={bandTop + bandH - 24} textAnchor="end" fill="rgba(232, 214, 182, 0.62)" fontFamily={IDENTITY.fontMono} fontSize={15} letterSpacing="0.2em">
                TANAH LEMBAP · BARU
              </text>
            </g>

            {/* trajectory */}
            <path
              d={`M ${islands.leftX},${islands.groundY - 34} Q 720,${islands.groundY - 660} ${islands.rightX},${islands.groundY - 30}`}
              fill="none"
              stroke="rgba(216, 161, 72, 0.5)"
              strokeWidth={2.2}
              strokeDasharray="8 13"
              strokeDashoffset={-(launch * 120)}
            />
            {Array.from({ length: 9 }).map((_, i) => {
              const t = (i + 1) / 11;
              const [tx, ty] = arc(t);
              return <circle key={i} cx={tx} cy={ty} r={2.6} fill="rgba(232, 200, 140, 0.55)" opacity={clamp01(launch * 1.6 - t * 0.9)} />;
            })}

            {/* launch dust */}
            {dust > 0.02 &&
              Array.from({ length: 20 }).map((_, i) => {
                const a = Math.PI + (i / 19) * Math.PI;
                const rad = easeOutCubic(dust) * (40 + (i % 6) * 24);
                return (
                  <circle
                    key={i}
                    cx={islands.leftX + Math.cos(a) * rad}
                    cy={islands.groundY - 26 + Math.sin(a) * rad * 0.5}
                    r={5 + (i % 4) * 2.4}
                    fill="rgba(198, 170, 128, 0.34)"
                    opacity={clamp01(1 - dust)}
                  />
                );
              })}

            {/* the animal in flight, with speed ghosts */}
            {launch > 0.03 && launch < 0.99 && (
              <g transform={`translate(${jx}, ${jy}) rotate(${jumpAngle})`}>
                {[0.16, 0.09].map((k, i) => {
                  const [gx, gy] = arc(clamp01(launch - k));
                  return (
                    <g key={i} transform={`translate(${gx - jx}, ${gy - jy})`} opacity={0.16 + i * 0.12}>
                      <Springtail x={0} y={0} s={1.9} furcula={1} alpha={0.85} />
                    </g>
                  );
                })}
                <Springtail x={0} y={0} s={2.0} furcula={1} alpha={1} />
              </g>
            )}

            {/* letterbox inner shading */}
            <rect x={0} y={bandTop} width={1440} height={80} fill="url(#s6-sky)" opacity={0.72} />
            <rect x={0} y={bandTop + bandH - 90} width={1440} height={90} fill="#150D06" opacity={0.5} />
          </g>

          {/* thin brass rules marking the letterbox */}
          <RuleLine x1={0} y1={bandTop} x2={1440} y2={bandTop} color="rgba(206, 190, 160, 0.26)" width={1.4} />
          <RuleLine x1={0} y1={bandTop + bandH} x2={1440} y2={bandTop + bandH} color="rgba(206, 190, 160, 0.26)" width={1.4} />
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
