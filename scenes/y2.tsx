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
import { Backdrop, FilmGrain, Mono, RuleLine, useTex } from './hujan';

const hash2 = (x: number, y: number, seed: number): number => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 362437);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

const makeRng = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ============================================================================
// 1. SCENE 07 — "KOMPAS GURUN": A PANORAMA READ AS A LANDSCAPE, NOT A CARD
// ============================================================================

const Camel: React.FC<{ x: number; y: number; s: number; walk: number; color: string; flip?: boolean; rider?: boolean }> = ({
  x,
  y,
  s,
  walk,
  color,
  flip = false,
  rider = false,
}) => {
  const legs = [
    { x0: -60, ph: 0, front: false },
    { x0: -46, ph: 0.5, front: false },
    { x0: 42, ph: 0.5, front: true },
    { x0: 58, ph: 0, front: true },
  ];
  return (
    <g transform={`translate(${x}, ${y}) scale(${flip ? -s : s}, ${s})`}>
      {/* far-side legs, dimmed a touch for depth */}
      {legs
        .filter((l) => l.ph > 0.4)
        .map((l, i) => {
          const sw = Math.sin(walk * Math.PI * 2 + l.ph * Math.PI * 2) * 11;
          return (
            <g key={i} opacity={0.72}>
              <path
                d={`M ${l.x0},${-96} C ${l.x0 + sw * 0.2},${-70} ${l.x0 + sw * 0.6},${-46} ${l.x0 + sw},${-24}`}
                fill="none"
                stroke={color}
                strokeWidth={13}
                strokeLinecap="round"
              />
              <path
                d={`M ${l.x0 + sw},${-28} C ${l.x0 + sw * 1.1},${-20} ${l.x0 + sw * 1.1},${-8} ${l.x0 + sw * 1.05},${-2}`}
                fill="none"
                stroke={color}
                strokeWidth={8}
                strokeLinecap="round"
              />
              <ellipse cx={l.x0 + sw * 1.05} cy={-2} rx={11} ry={5} fill={color} />
            </g>
          );
        })}

      {/* tail with a dark tuft */}
      <path d="M -72,-120 C -92,-116 -100,-96 -96,-74" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
      <path d="M -96,-76 C -100,-66 -100,-58 -96,-54" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />

      {/* body: deep chest, single hump, sloping rump */}
      <path
        d="M -70,-132 C -48,-148 -30,-146 -18,-140 C -6,-172 26,-174 36,-142 C 52,-140 64,-138 70,-124 C 76,-102 62,-88 44,-88 L -54,-88 C -72,-92 -78,-110 -70,-132 Z"
        fill={color}
      />
      {/* belly line break for volume */}
      <path d="M -50,-92 C -16,-84 20,-84 50,-92" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth={3} />

      {/* neck: a long S from the shoulder into the skull */}
      <path
        d="M 56,-140 C 80,-152 92,-176 98,-196 C 103,-214 116,-222 126,-214 L 134,-206 C 120,-198 112,-184 106,-166 C 98,-142 84,-120 66,-110 Z"
        fill={color}
      />
      {/* skull, muzzle, jaw */}
      <path d="M 120,-218 C 134,-222 148,-214 152,-202 C 156,-190 148,-182 136,-180 C 126,-179 118,-186 118,-196 C 118,-204 118,-212 120,-218 Z" fill={color} />
      <path d="M 146,-206 C 158,-208 166,-204 166,-198 C 166,-193 158,-190 150,-192 Z" fill={color} />
      <path d="M 118,-186 C 128,-184 138,-186 144,-190" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={2.4} />
      {/* ear */}
      <path d="M 120,-218 L 114,-230 L 124,-226 Z" fill={color} />

      {/* near-side legs, fully weighted */}
      {legs
        .filter((l) => l.ph <= 0.4)
        .map((l, i) => {
          const sw = Math.sin(walk * Math.PI * 2 + l.ph * Math.PI * 2) * 11;
          return (
            <g key={i}>
              <path
                d={`M ${l.x0},${-96} C ${l.x0 + sw * 0.15},${-72} ${l.x0 + sw * 0.55},${-48} ${l.x0 + sw},${-26}`}
                fill="none"
                stroke={color}
                strokeWidth={15}
                strokeLinecap="round"
              />
              <path
                d={`M ${l.x0 + sw},${-30} C ${l.x0 + sw * 1.12},${-22} ${l.x0 + sw * 1.12},${-9} ${l.x0 + sw * 1.06},${-3}`}
                fill="none"
                stroke={color}
                strokeWidth={8.5}
                strokeLinecap="round"
              />
              <ellipse cx={l.x0 + sw * 1.06} cy={-3} rx={12} ry={5.5} fill={color} />
            </g>
          );
        })}

      {/* cargo roll, or a seated rider */}
      {rider ? (
        <g fill={color}>
          <path d="M -6,-172 C -14,-186 -6,-198 6,-198 C 16,-198 22,-188 20,-176 L 16,-152 L 2,-152 Z" />
          <circle cx={8} cy={-206} r={9} />
          <path d="M 18,-196 C 28,-184 30,-168 24,-158 L 14,-160 C 18,-170 16,-182 10,-190 Z" />
        </g>
      ) : (
        <g>
          <ellipse cx={-4} cy={-172} rx={26} ry={13} fill={color} transform="rotate(-6 -4 -172)" />
          <ellipse cx={-4} cy={-172} rx={26} ry={13} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={2} transform="rotate(-6 -4 -172)" />
          <path d="M -30,-176 C -20,-166 -4,-164 12,-168" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
        </g>
      )}
    </g>
  );
};

const CompassRose: React.FC<{ x: number; y: number; r: number; p: number; color: string }> = ({ x, y, r, p, color }) => {
  const g = easeOutCubic(clamp01(p));
  if (g < 0.02) return null;
  const star = (long: number, short: number, w: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
      const rad = i % 2 === 0 ? (i % 4 === 0 ? long : short) : w;
      pts.push(`${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`);
    }
    return pts.join(' ');
  };
  return (
    <g transform={`translate(${x}, ${y}) scale(${0.86 + 0.14 * g})`} opacity={g}>
      <circle r={r} fill="rgba(10, 8, 6, 0.34)" stroke="rgba(224, 192, 138, 0.34)" strokeWidth={1.6} />
      <circle r={r * 0.86} fill="none" stroke="rgba(224, 192, 138, 0.16)" strokeWidth={1} />
      {Array.from({ length: 32 }).map((_, i) => {
        const a = (i / 32) * Math.PI * 2;
        const long = i % 4 === 0;
        return (
          <line
            key={i}
            x1={Math.cos(a) * r * (long ? 0.8 : 0.86)}
            y1={Math.sin(a) * r * (long ? 0.8 : 0.86)}
            x2={Math.cos(a) * r * 0.94}
            y2={Math.sin(a) * r * 0.94}
            stroke="rgba(228, 198, 142, 0.5)"
            strokeWidth={long ? 1.8 : 0.9}
          />
        );
      })}
      <polygon points={star(r * 0.72, r * 0.46, r * 0.1)} fill="rgba(238, 210, 156, 0.16)" stroke="rgba(232, 200, 144, 0.7)" strokeWidth={1.2} />
      {/* the north needle, lit */}
      <polygon points={`0,${-r * 0.72} ${-r * 0.11},0 0,${r * 0.12}`} fill="rgba(248, 222, 166, 0.94)" />
      <polygon points={`0,${-r * 0.72} ${r * 0.11},0 0,${r * 0.12}`} fill="rgba(196, 160, 96, 0.9)" />
      <polygon points={`0,${r * 0.72} ${-r * 0.11},0 0,${-r * 0.12}`} fill="rgba(148, 126, 88, 0.7)" />
      <polygon points={`0,${r * 0.72} ${r * 0.11},0 0,${-r * 0.12}`} fill="rgba(112, 94, 66, 0.7)" />
      {[
        ['U', 0, -1],
        ['T', 1, 0],
        ['S', 0, 1],
        ['B', -1, 0],
      ].map(([lab, dx, dy], i) => (
        <text
          key={i}
          x={Number(dx) * r * 1.0}
          y={Number(dy) * r * 1.0 + 8}
          textAnchor="middle"
          fill="rgba(238, 214, 170, 0.86)"
          fontFamily={IDENTITY.fontMono}
          fontSize={19}
          fontWeight={600}
          letterSpacing="0.1em"
        >
          {lab}
        </text>
      ))}
      <circle r={r * 0.05} fill="rgba(248, 226, 180, 0.9)" />
    </g>
  );
};

export const Scene07KompasGurun: React.FC = () => {
  const frame = useCurrentFrame();
  const ch = CHAPTERS[6];
  const localSec = frame / 90;
  const globalSec = ch.start + localSec;
  const art = CHAPTER_ART[6];
  const sand = useTex('sand-ripple');

  const reveal = easeOutExpo(prog(localSec, 0.1, 2.2));
  const plume = prog(globalSec, 96.6, 100.6);
  const camelsIn = easeInOutCubic(prog(globalSec, 93.4, 97.2));
  const camelWalk = clamp01(prog(globalSec, 93.4, 102.2));
  const stars = easeOutCubic(prog(localSec, 0.2, 2.0));

  const dune = (baseY: number, amp: number, phase: number, freq: number): string => {
    let d = `M -80,${baseY}`;
    for (let x = 0; x <= 1600; x += 40) {
      const y =
        baseY -
        Math.sin((x + phase * 90) / freq) * amp -
        Math.sin((x * 0.63) / (freq * 0.85) + phase) * amp * 0.42 -
        Math.sin((x * 1.7) / freq + phase * 2) * amp * 0.14;
      d += ` L ${x},${y.toFixed(1)}`;
    }
    return `${d} L 1600,2600 L -80,2600 Z`;
  };

  const duneFar = dune(1158, 26, 0.2, 240);
  const duneMid = dune(1298, 40, 1.1, 210);
  const duneWalk = dune(1462, 44, 2.4, 260);
  const duneNear = dune(1790, 72, 3.1, 300);
  const duneFront = dune(2110, 96, 4.3, 340);

  const horizonY = 1290;

  return (
    <AbsoluteFill>
      <Backdrop top="#0B0D14" bottom={art.paper} tex="sand-ripple" texOpacity={0.1} vignette={0.5} />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="s7-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#080A11" />
            <stop offset="28%" stopColor="#141420" />
            <stop offset="56%" stopColor="#2E2620" />
            <stop offset="78%" stopColor="#5C4026" />
            <stop offset="100%" stopColor="#8A5F36" />
          </linearGradient>
          <linearGradient id="s7-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7E5B36" />
            <stop offset="100%" stopColor="#6A4828" />
          </linearGradient>
          <linearGradient id="s7-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6A4728" />
            <stop offset="100%" stopColor="#4C301A" />
          </linearGradient>
          <linearGradient id="s7-walk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#52351C" />
            <stop offset="100%" stopColor="#33200F" />
          </linearGradient>
          <linearGradient id="s7-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A1A0C" />
            <stop offset="100%" stopColor="#170D05" />
          </linearGradient>
          <linearGradient id="s7-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#120A04" />
            <stop offset="100%" stopColor="#080502" />
          </linearGradient>
          <linearGradient id="s7-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B6E52" />
            <stop offset="42%" stopColor="#4E5644" />
            <stop offset="100%" stopColor="#2A2E22" />
          </linearGradient>
          <linearGradient id="s7-plume" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(232, 190, 116, 0.02)" />
            <stop offset="55%" stopColor="rgba(238, 200, 130, 0.62)" />
            <stop offset="100%" stopColor="rgba(246, 220, 170, 0.92)" />
          </linearGradient>
          <radialGradient id="s7-glow" cx="80%" cy="58%" r="42%">
            <stop offset="0%" stopColor="rgba(246, 198, 128, 0.3)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* sky */}
        <rect x={0} y={0} width={1440} height={1400} fill="url(#s7-sky)" />

        {/* stars, thinning toward the warm horizon */}
        <g opacity={stars * 0.9}>
          {Array.from({ length: 96 }).map((_, i) => {
            const sx = hash2(i, 3, 7) * 1440;
            const sy = hash2(i, 5, 13) * 900;
            const tw = 0.35 + 0.65 * Math.abs(Math.sin(localSec * 0.8 + i));
            return <circle key={i} cx={sx} cy={sy} r={hash2(i, 9, 3) * 1.6 + 0.35} fill="rgba(238, 232, 214, 0.92)" opacity={tw * (1 - sy / 1100)} />;
          })}
        </g>

        <rect x={0} y={700} width={1440} height={600} fill="url(#s7-glow)" />

        {/* far dunes */}
        <path d={duneFar} fill="url(#s7-far)" transform={`translate(${-localSec * 1.6}, 0)`} />
        <path d={duneFar} fill="none" stroke="rgba(250, 214, 158, 0.16)" strokeWidth={2} transform={`translate(${-localSec * 1.6}, 0)`} />
        <path d={duneMid} fill="url(#s7-mid)" transform={`translate(${-localSec * 3.2}, 0)`} />
        <path d={duneMid} fill="none" stroke="rgba(250, 216, 160, 0.12)" strokeWidth={1.6} transform={`translate(${-localSec * 3.2}, 0)`} />

        {/* the walking surface, then the caravan and the waterhole on top of it */}
        <path d={duneWalk} fill="url(#s7-walk)" transform={`translate(${-localSec * 6}, 0)`} />

        <g transform={`translate(${-90 + camelWalk * 160}, 0)`} opacity={camelsIn}>
          <ellipse cx={540} cy={1444} rx={330} ry={18} fill="rgba(0,0,0,0.26)" />
          <Camel x={420} y={1408} s={1.02} walk={camelWalk * 3.2} color="#180E06" rider />
          <Camel x={664} y={1424} s={0.86} walk={camelWalk * 3.2 + 0.34} color="#140B05" />
          <Camel x={820} y={1438} s={0.7} walk={camelWalk * 3.2 + 0.62} color="#110803" />
          <g transform="translate(846, 1432)">
            <ellipse cx={0} cy={0} rx={14} ry={4} fill="rgba(0,0,0,0.32)" />
            <path d="M -6,-2 L -4,-38 L 6,-38 L 8,-2 Z" fill="#150B04" />
            <path d="M -6,-38 C -6,-50 6,-50 6,-38 Z" fill="#150B04" />
            <line x1={8} y1={-28} x2={24} y2={-4} stroke="#150B04" strokeWidth={2.6} />
          </g>
        </g>

        {/* waterhole */}
        <g>
          <ellipse cx={1078} cy={1462} rx={256} ry={58} fill="rgba(12, 8, 4, 0.5)" />
          <ellipse cx={1078} cy={1454} rx={244} ry={50} fill="url(#s7-water)" />
          <ellipse cx={1078} cy={1454} rx={244} ry={50} fill="url(#s7-glow)" opacity={0.8} />
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse key={i} cx={1078 - 170 + i * 44} cy={1444 + (i % 3) * 12} rx={50 - i * 2} ry={4.4} fill="rgba(232, 214, 172, 0.16)" />
          ))}
          {/* far bank + reeds */}
          <path d="M 836,1442 C 900,1424 980,1428 1040,1436 C 1120,1446 1200,1438 1318,1428 L 1318,1460 L 836,1460 Z" fill="rgba(38, 32, 20, 0.8)" />
          {Array.from({ length: 15 }).map((_, i) => {
            const rx = 866 + i * 30;
            const sway = Math.sin(localSec * 0.7 + i) * 5;
            return (
              <g key={i}>
                <path d={`M ${rx},${1444} C ${rx + sway},${1404} ${rx + 9 + sway},${1372} ${rx + 3 + sway * 1.6},${1340}`} fill="none" stroke="#4B5738" strokeWidth={2.6} strokeLinecap="round" />
                <path d={`M ${rx + 1 + sway * 1.6},${1344} l -8,-15 M ${rx + 1 + sway * 1.6},${1344} l 9,-17 M ${rx + 1 + sway * 1.6},${1344} l 1,-20`} fill="none" stroke="#5C6B44" strokeWidth={1.8} strokeLinecap="round" />
              </g>
            );
          })}
        </g>

        {/* the geosmin plume, carried from the waterhole toward the caravan */}
        <g opacity={plume * 0.95}>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${1060},${1436 - i * 22} C ${880},${1372 - i * 26} ${700},${1316 - i * 18} ${470},${1336 - i * 30} S ${250},${1290 - i * 18} ${112},${1240 - i * 24}`}
              fill="none"
              stroke="url(#s7-plume)"
              strokeWidth={9 - i * 2.4}
              strokeLinecap="round"
              opacity={0.62 - i * 0.14}
              strokeDasharray={i === 0 ? undefined : `${28 + i * 16} ${20 + i * 10}`}
              strokeDashoffset={-plume * 150}
            />
          ))}
          {Array.from({ length: 16 }).map((_, i) => {
            const t = i / 15;
            const px = 1060 - t * 950;
            const py = 1436 - t * 196 + Math.sin(t * 5.2) * 22;
            return <circle key={i} cx={px} cy={py} r={1.5 + (i % 3)} fill="rgba(246, 218, 166, 0.78)" opacity={clamp01(plume * 1.5 - t * 0.7)} />;
          })}
        </g>

        {/* near + foreground dunes, softly lit along the crest */}
        <path d={duneNear} fill="url(#s7-near)" transform={`translate(${-localSec * 12}, 0)`} />
        <path d={duneNear} fill="none" stroke="rgba(226, 176, 118, 0.14)" strokeWidth={2.4} transform={`translate(${-localSec * 12}, -2)`} />
        <path d={duneFront} fill="url(#s7-front)" transform={`translate(${-localSec * 20}, 0)`} />
        {sand && <image href={sand} x={0} y={2060} width={1440} height={540} opacity={0.1} preserveAspectRatio="none" />}

        {/* drifting sand */}
        <g opacity={0.4}>
          {Array.from({ length: 44 }).map((_, i) => {
            const sp = 26 + (i % 7) * 14;
            const px = (i * 137 + localSec * sp) % 1500 - 30;
            const py = 1300 + ((i * 71) % 760);
            return <circle key={i} cx={px} cy={py} r={0.8 + (i % 3) * 0.6} fill="rgba(228, 200, 156, 0.7)" />;
          })}
        </g>

        {/* compass */}
        <CompassRose x={1216} y={420} r={128} p={prog(globalSec, 96.9, 99.0)} color="rgba(228, 196, 140, 0.82)" />

        {/* typography */}
        <g opacity={reveal}>
          <g transform="translate(150, 940) rotate(-90)">
            <text x={0} y={0} fill={art.ink} fontFamily={IDENTITY.fontInstrument} fontStyle="italic" fontSize={104} letterSpacing="-0.02em">
              Kompas
            </text>
          </g>
          <g transform="translate(96, 1290)">
            <RuleLine x1={0} y1={0} x2={250 * easeOutCubic(prog(localSec, 0.5, 1.8))} y2={0} color="rgba(216, 198, 166, 0.4)" />
            <Mono x={0} y={34} text="AROMA SEBAGAI PETA" size={16} color="rgba(232, 218, 192, 0.7)" tracking={0.2} />
            <Mono x={0} y={60} text="± 80 KM DARI SUMBER AIR" size={13} color="rgba(214, 200, 174, 0.46)" tracking={0.14} weight={400} />
          </g>
        </g>

        <g opacity={easeOutCubic(prog(globalSec, 97.4, 99.4))}>
          <defs>
            <linearGradient id="s7-foot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(10, 6, 3, 0)" />
              <stop offset="45%" stopColor="rgba(10, 6, 3, 0.72)" />
              <stop offset="100%" stopColor="rgba(10, 6, 3, 0.86)" />
            </linearGradient>
          </defs>
          <rect x={0} y={1760} width={1440} height={250} fill="url(#s7-foot)" />
          <Mono x={92} y={1832} text="NALURI YANG DIWARISKAN" size={16} color={art.accent} tracking={0.3} />
          <text x={90} y={1906} fill={art.ink} fontFamily={IDENTITY.fontGrotesk} fontSize={44} fontWeight={500} letterSpacing="-0.02em">
            gurun menyimpan arah
          </text>
          <text x={90} y={1954} fill="rgba(238, 228, 208, 0.62)" fontFamily={IDENTITY.fontGrotesk} fontSize={27} fontWeight={400}>
            dalam bentuk yang bisa dihirup
          </text>
        </g>
      </svg>

      <FilmGrain opacity={0.16} />
    </AbsoluteFill>
  );
};

// ============================================================================
// 2. SCENE 08 — "STILL LIFE & JENDELA": ONE MOLECULE, TWO VERDICTS
// ============================================================================

const CatfishPlate: React.FC<{ x: number; y: number; s: number; p: number; uid: string }> = ({ x, y, s, p, uid }) => {
  const g = easeOutCubic(clamp01(p));
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} opacity={0.35 + g * 0.65}>
      <defs>
        <radialGradient id={`${uid}-plate`} cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#F3EBD9" />
          <stop offset="72%" stopColor="#E2D5BC" />
          <stop offset="100%" stopColor="#C0AC8C" />
        </radialGradient>
        <linearGradient id={`${uid}-fish`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4E3A22" />
          <stop offset="42%" stopColor="#6E5432" />
          <stop offset="62%" stopColor="#B39A6E" />
          <stop offset="100%" stopColor="#DCCBAA" />
        </linearGradient>
      </defs>

      {/* plate shadow, then plate with a warm rim light */}
      <ellipse cx={12} cy={26} rx={268} ry={218} fill="rgba(0,0,0,0.42)" />
      <ellipse cx={0} cy={0} rx={268} ry={218} fill={`url(#${uid}-plate)`} />
      <ellipse cx={0} cy={2} rx={196} ry={158} fill="none" stroke="rgba(120, 100, 72, 0.22)" strokeWidth={2} />
      <ellipse cx={0} cy={2} rx={160} ry={126} fill="#EFE5D0" opacity={0.6} />
      <path d="M -232,-58 A 268 218 0 0 1 40,-206" fill="none" stroke="rgba(255, 252, 240, 0.7)" strokeWidth={6} strokeLinecap="round" />

      {/* whole catfish, head left */}
      <g transform="translate(-4, 4)">
        <path d="M -168,-10 C -120,-52 -30,-64 60,-54 C 118,-46 150,-24 162,2 C 150,32 112,52 54,60 C -34,70 -122,54 -168,18 Z" fill={`url(#${uid}-fish)`} stroke="rgba(44, 30, 16, 0.6)" strokeWidth={2} />
        {/* back hatching for scales */}
        {Array.from({ length: 16 }).map((_, i) => (
          <path
            key={i}
            d={`M ${-120 + i * 17},${-40 + i * 1.2} q 12,10 2,22`}
            fill="none"
            stroke="rgba(40, 28, 14, 0.22)"
            strokeWidth={1.3}
          />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <path
            key={`s${i}`}
            d={`M ${-110 + i * 20},${-14 + (i % 3) * 8} q 10,12 -2,20`}
            fill="none"
            stroke="rgba(74, 56, 32, 0.24)"
            strokeWidth={1.2}
          />
        ))}
        {/* tail fin */}
        <path d="M 160,2 L 214,-42 C 226,-8 224,22 210,54 Z" fill="#4A3620" stroke="rgba(44, 30, 16, 0.5)" strokeWidth={1.6} />
        {/* dorsal fin */}
        <path d="M -30,-56 C -10,-96 48,-98 76,-62 Z" fill="#4A3620" opacity={0.9} />
        {/* pectoral fin */}
        <path d="M -96,26 C -104,64 -70,78 -46,48 Z" fill="#5A4326" opacity={0.9} />
        {/* head, mouth, eye */}
        <path d="M -166,-8 C -196,-4 -206,10 -196,22 C -180,34 -168,30 -162,20 Z" fill="#5E4528" />
        <path d="M -196,16 C -184,22 -172,22 -162,18" fill="none" stroke="rgba(30, 20, 10, 0.7)" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={-148} cy={-14} r={9} fill="#1E1509" />
        <circle cx={-151} cy={-17} r={2.6} fill="rgba(255, 246, 226, 0.8)" />
        {/* four barbels */}
        {[
          'M -188,22 C -232,26 -244,58 -228,86',
          'M -184,26 C -214,42 -212,72 -196,96',
          'M -176,26 C -186,54 -170,70 -150,80',
          'M -192,14 C -238,4 -258,28 -252,54',
        ].map((d, i) => (
          <path key={i} d={d} fill="none" stroke="rgba(88, 66, 40, 0.9)" strokeWidth={2.6} strokeLinecap="round" />
        ))}
        {/* steam, because it is still hot */}
        {[0, 1, 2].map((i) => (
          <path
            key={`v${i}`}
            d={`M ${-60 + i * 54},${-80} C ${-72 + i * 54},${-124} ${-40 + i * 54},${-150} ${-58 + i * 54},${-196}`}
            fill="none"
            stroke="rgba(244, 236, 218, 0.2)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="10 14"
            strokeDashoffset={-p * 60 - i * 20}
          />
        ))}
        {/* lime wedge */}
        <g transform="translate(120, 40) rotate(-14)">
          <path d="M 0,0 A 34 34 0 0 1 62,18 L 4,26 Z" fill="#B7BE6E" stroke="rgba(60, 70, 30, 0.5)" strokeWidth={1.4} />
          <path d="M 4,4 A 30 30 0 0 1 56,20" fill="none" stroke="rgba(245, 250, 214, 0.6)" strokeWidth={3} />
        </g>
      </g>
    </g>
  );
};

const RainWindow: React.FC<{ x: number; y: number; w: number; h: number; p: number; uid: string; localSec: number }> = ({
  x,
  y,
  w,
  h,
  p,
  uid,
  localSec,
}) => {
  const g = easeOutCubic(clamp01(p));
  const gx = x + 22;
  const gy = y + 22;
  const gw = w - 44;
  const gh = h - 44;

  const bokeh = Array.from({ length: 16 }).map((_, i) => ({
    bx: gx + hash2(i, 4, 9) * gw,
    by: gy + hash2(i, 8, 3) * gh * 0.72,
    br: 7 + hash2(i, 2, 7) * 26,
    warm: i % 3 !== 0,
    op: 0.1 + hash2(i, 6, 5) * 0.22,
  }));

  const beads = Array.from({ length: 44 }).map((_, i) => {
    const slow = (hash2(i, 11, 5) - 0.5) * 6;
    const dy = gy + ((hash2(i, 9, 7) * gh + localSec * slow) % gh + gh) % gh;
    return {
      bx: gx + 8 + hash2(i, 5, 3) * (gw - 16),
      by: dy,
      br: 1.4 + hash2(i, 3, 11) * 5.4,
      trail: hash2(i, 7, 13) > 0.72,
    };
  });

  const rivulets = [0.24, 0.52, 0.78].map((k, i) => {
    const rx = gx + gw * k;
    const drift = Math.sin(localSec * 0.6 + i * 2) * 3;
    let d = `M ${rx},${gy}`;
    for (let j = 1; j <= 6; j++) {
      const yy = gy + (gh / 6) * j;
      const xx = rx + Math.sin(j * 1.4 + i) * 5 + drift;
      d += ` Q ${rx + Math.sin(j * 1.4 + i) * 9},${yy - gh / 12} ${xx},${yy}`;
    }
    return d;
  });

  return (
    <g opacity={g}>
      <defs>
        <linearGradient id={`${uid}-outside`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1214" />
          <stop offset="40%" stopColor="#152226" />
          <stop offset="72%" stopColor="#20302C" />
          <stop offset="100%" stopColor="#0E1512" />
        </linearGradient>
        <linearGradient id={`${uid}-frame`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#96693A" />
          <stop offset="34%" stopColor="#6E4A27" />
          <stop offset="100%" stopColor="#462C17" />
        </linearGradient>
        <linearGradient id={`${uid}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(196, 226, 222, 0.14)" />
          <stop offset="100%" stopColor="rgba(196, 226, 222, 0.03)" />
        </linearGradient>
        <clipPath id={`${uid}-glass`}>
          <rect x={gx} y={gy} width={gw} height={gh} />
        </clipPath>
      </defs>

      <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} fill="rgba(0,0,0,0.34)" />

      <g clipPath={`url(#${uid}-glass)`}>
        <rect x={gx} y={gy} width={gw} height={gh} fill={`url(#${uid}-outside)`} />

        {/* rooftops and a wet street beyond the glass */}
        <path d={`M ${gx},${gy + gh * 0.66} L ${gx + gw * 0.2},${gy + gh * 0.6} L ${gx + gw * 0.34},${gy + gh * 0.63} L ${gx + gw * 0.55},${gy + gh * 0.55} L ${gx + gw * 0.7},${gy + gh * 0.6} L ${gx + gw},${gy + gh * 0.54} L ${gx + gw},${gy + gh} L ${gx},${gy + gh} Z`} fill="#0C1315" opacity={0.92} />
        <path d={`M ${gx},${gy + gh * 0.86} L ${gx + gw},${gy + gh * 0.82} L ${gx + gw},${gy + gh} L ${gx},${gy + gh} Z`} fill="#0A1012" />
        {/* street lamp glow + bokeh */}
        <circle cx={gx + gw * 0.72} cy={gy + gh * 0.52} r={gw * 0.3} fill="rgba(232, 176, 108, 0.16)" />
        {bokeh.map((b, i) => (
          <circle key={i} cx={b.bx} cy={b.by} r={b.br} fill={b.warm ? `rgba(244, 190, 122, ${b.op})` : `rgba(168, 206, 208, ${b.op * 0.6})`} />
        ))}
        {/* rain outside, long and fast */}
        {Array.from({ length: 54 }).map((_, i) => {
          const rx = gx + ((i * 37) % gw);
          const ry = gy + (((i * 113 + localSec * 900) % (gh + 80)) as number) - 40;
          return <line key={i} x1={rx} y1={ry} x2={rx - 9} y2={ry + 52} stroke="rgba(202, 226, 220, 0.3)" strokeWidth={1.3} strokeLinecap="round" />;
        })}

        {/* condensation haze on the inside */}
        <rect x={gx} y={gy} width={gw} height={gh} fill={`url(#${uid}-haze)`} />

        {/* beaded drops, each with a dark refracted rim and a specular dot */}
        {beads.map((b, i) => (
          <g key={i}>
            {b.trail && (
              <path
                d={`M ${b.bx + 1},${b.by - b.br * 6} q ${b.br * 0.8},${b.br * 2} 0,${b.br * 5}`}
                fill="none"
                stroke="rgba(206, 230, 226, 0.14)"
                strokeWidth={b.br * 0.7}
                strokeLinecap="round"
              />
            )}
            <circle cx={b.bx} cy={b.by} r={b.br} fill="rgba(120, 152, 148, 0.2)" />
            <circle cx={b.bx} cy={b.by} r={b.br} fill="none" stroke="rgba(232, 246, 240, 0.5)" strokeWidth={0.9} />
            <circle cx={b.bx + b.br * 0.22} cy={b.by + b.br * 0.24} r={b.br * 0.62} fill="rgba(210, 236, 230, 0.16)" />
            <circle cx={b.bx - b.br * 0.3} cy={b.by - b.br * 0.36} r={b.br * 0.22} fill="rgba(255, 255, 255, 0.8)" />
          </g>
        ))}

        {/* rivulets running down the pane */}
        {rivulets.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="rgba(210, 234, 228, 0.14)" strokeWidth={7} strokeLinecap="round" />
            <path d={d} fill="none" stroke="rgba(244, 252, 248, 0.3)" strokeWidth={1.6} strokeLinecap="round" />
          </g>
        ))}

        {/* the room's warm lamp mirrored in the glass */}
        <ellipse cx={gx + gw * 0.18} cy={gy + gh * 0.2} rx={gw * 0.22} ry={gh * 0.1} fill="rgba(248, 206, 148, 0.14)" />
        <ellipse cx={gx + gw * 0.18} cy={gy + gh * 0.2} rx={gw * 0.1} ry={gh * 0.045} fill="rgba(252, 224, 172, 0.14)" />
        {/* specular sweep across the pane */}
        <path d={`M ${gx},${gy + gh * 0.3} L ${gx + gw * 0.42},${gy} L ${gx + gw * 0.58},${gy} L ${gx},${gy + gh * 0.48} Z`} fill="rgba(255, 250, 236, 0.05)" />
      </g>

      {/* wooden frame, mullions and sill */}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={`url(#${uid}-frame)`} strokeWidth={22} />
      <rect x={x + 11} y={y + 11} width={w - 22} height={h - 22} fill="none" stroke="rgba(246, 220, 174, 0.26)" strokeWidth={2} />
      <line x1={x + w / 2} y1={y + 16} x2={x + w / 2} y2={y + h - 16} stroke={`url(#${uid}-frame)`} strokeWidth={16} />
      <line x1={x + 16} y1={y + h * 0.46} x2={x + w - 16} y2={y + h * 0.46} stroke={`url(#${uid}-frame)`} strokeWidth={14} />
      <line x1={x + w / 2 + 4} y1={y + 16} x2={x + w / 2 + 4} y2={y + h - 16} stroke="rgba(30, 20, 10, 0.5)" strokeWidth={2} />
      <rect x={x - 18} y={y + h - 6} width={w + 36} height={16} fill="#5A3A20" />
      <rect x={x - 18} y={y + h - 6} width={w + 36} height={4} fill="rgba(248, 220, 172, 0.28)" />
    </g>
  );
};

export const Scene08StillLife: React.FC = () => {
  const frame = useCurrentFrame();
  const ch = CHAPTERS[7];
  const localSec = frame / 90;
  const globalSec = ch.start + localSec;
  const art = CHAPTER_ART[7];
  const wood = useTex('walnut');
  const paper = useTex('rice-paper');

  const tableIn = easeOutExpo(prog(localSec, 0.1, 1.4));
  const fishIn = easeOutCubic(prog(globalSec, 102.4, 104.4));
  const windowIn = easeOutCubic(prog(globalSec, 102.6, 104.8));
  const link = prog(globalSec, 104.2, 107.2);
  const zoom = easeInOutCubic(prog(globalSec, 110.1, 112.2));
  const noteIn = easeOutCubic(prog(globalSec, 111.85, 113.0));

  const winX = 902;
  const winY = 512;
  const winW = 404;
  const winH = 700;
  const cxW = winX + winW / 2;
  const cyW = winY + winH / 2;
  const zoomS = 1 + zoom * 1.12;

  return (
    <AbsoluteFill>
      <Backdrop top="#191310" bottom={art.paper} tex="walnut" texOpacity={0.5} vignette={0.55} />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="s8-warm" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(238, 190, 126, 0.2)" />
            <stop offset="46%" stopColor="rgba(238, 190, 126, 0.03)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
          <linearGradient id="s8-cold" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(148, 182, 178, 0.16)" />
            <stop offset="50%" stopColor="rgba(148, 182, 178, 0.02)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>

        {/* tabletop */}
        <rect x={0} y={420} width={1440} height={1900} fill="#1B1410" opacity={tableIn} />
        {wood && <image href={wood} x={0} y={420} width={1440} height={1900} opacity={0.5 * tableIn} preserveAspectRatio="none" />}
        <rect x={0} y={420} width={820} height={1900} fill="url(#s8-warm)" />
        <rect x={700} y={420} width={740} height={1900} fill="url(#s8-cold)" />
        <RuleLine x1={0} y1={420} x2={1440} y2={420} color="rgba(240, 220, 184, 0.14)" width={2} />

        {/* ---------------- left: the plate and the fish ---------------- */}
        <g opacity={clamp01(1 - zoom * 1.3)}>
          <CatfishPlate x={470} y={890} s={1.06} p={fishIn} uid="s8-fish" />

          <g opacity={easeOutCubic(prog(globalSec, 103.0, 104.4))}>
            <Mono x={96} y={552} text="DI LIDAH — DIBENCI" size={18} color="#C0703F" tracking={0.26} />
            <RuleLine x1={96} y1={574} x2={96 + 240 * easeOutCubic(prog(globalSec, 103.2, 104.6))} y2={574} color="rgba(206, 160, 120, 0.4)" />
            <text x={92} y={1170} fill={art.ink} fontFamily={IDENTITY.fontFraunces} fontStyle="italic" fontSize={66} letterSpacing="-0.02em">
              lele &amp; gurame
            </text>
            <Mono x={96} y={1212} text="SENSASI “BAU TANAH” YANG DIRASAKAN PERUT" size={14} color="rgba(228, 214, 188, 0.6)" tracking={0.12} weight={400} />
          </g>
        </g>

        {/* ---------------- right: the window with rain ---------------- */}
        <g transform={`translate(${cxW}, ${cyW}) scale(${zoomS}) translate(${-cxW}, ${-cyW})`}>
          <RainWindow x={winX} y={winY} w={winW} h={winH} p={windowIn} uid="s8-win" localSec={localSec} />
          <g opacity={easeOutCubic(prog(globalSec, 103.4, 104.9)) * clamp01(1 - zoom * 1.5)}>
            <Mono x={winX} y={winY - 34} text="DI HIDUNG — DIPUJA" size={18} color="#B7A46A" tracking={0.24} />
            <Mono x={winX + winW} y={winY - 34} text="GERIMIS 17.40" size={14} color="rgba(220, 210, 186, 0.5)" anchor="end" tracking={0.14} weight={400} />
          </g>
        </g>

        {/* ---------------- the single molecule linking both worlds ------- */}
        <g opacity={clamp01(link * 1.2) * (1 - zoom)}>
          <path
            d="M 700,1188 C 790,1178 848,1140 900,1090"
            fill="none"
            stroke="rgba(216, 161, 72, 0.66)"
            strokeWidth={2.2}
            strokeDasharray="5 10"
            strokeDashoffset={-link * 60}
            pathLength={1}
          />
          <g transform="translate(700, 1188)">
            <circle cx={0} cy={0} r={34} fill="#17120C" stroke="rgba(216, 161, 72, 0.8)" strokeWidth={2} />
            <text x={0} y={7} textAnchor="middle" fill="#ECC77E" fontFamily={IDENTITY.fontMono} fontSize={16} fontWeight={600} letterSpacing="0.04em">
              C₁₂H₂₂O
            </text>
            <Mono x={0} y={62} text="SATU MOLEKUL" size={12} color="rgba(226, 206, 172, 0.6)" anchor="middle" tracking={0.14} weight={400} />
          </g>
        </g>

        {/* ---------------- closing note, torn paper, no glass card -------- */}
        <g opacity={noteIn} transform={`translate(0, ${(1 - noteIn) * 34})`}>
          <g opacity={easeOutCubic(prog(globalSec, 111.9, 112.6))}>
            <path
              d="M 132,1478 L 1308,1470 L 1312,1806 L 1300,1812 L 1160,1806 L 1012,1814 L 872,1806 L 720,1814 L 578,1806 L 440,1814 L 300,1806 L 150,1812 Z"
              fill="#EFE6D2"
            />
            <path
              d="M 132,1478 L 1308,1470 L 1312,1806 L 1300,1812 L 1160,1806 L 1012,1814 L 872,1806 L 720,1814 L 578,1806 L 440,1814 L 300,1806 L 150,1812 Z"
              fill="none"
              stroke="rgba(60, 46, 28, 0.4)"
              strokeWidth={1.4}
            />
            {paper && (
              <image
                href={paper}
                x={132}
                y={1470}
                width={1180}
                height={344}
                opacity={0.45}
                preserveAspectRatio="none"
                style={{ mixBlendMode: 'multiply' }}
              />
            )}
            {/* pencil-drawn underline */}
            <path d="M 196,1720 C 400,1712 720,1730 1000,1716" fill="none" stroke="rgba(158, 59, 42, 0.7)" strokeWidth={3.4} strokeLinecap="round" opacity={easeOutCubic(prog(globalSec, 112.3, 113.4))} />
            <text x={186} y={1596} fill="#231D15" fontFamily={IDENTITY.fontFraunces} fontStyle="italic" fontSize={58} letterSpacing="-0.02em">
              kamu tim keluar,
            </text>
            <text x={186} y={1672} fill="#231D15" fontFamily={IDENTITY.fontFraunces} fontStyle="italic" fontSize={58} letterSpacing="-0.02em">
              atau tetap di rumah?
            </text>
            <Mono x={186} y={1766} text="TULIS DI KOMENTAR" size={18} color="#9E3B2A" tracking={0.28} />
            {/* hand-drawn comment glyph */}
            <g transform="translate(1130, 1690)" opacity={easeOutCubic(prog(globalSec, 112.4, 113.4))}>
              <path d="M -46,-34 L 46,-38 L 50,26 L 8,28 L -6,46 L -4,26 L -44,24 Z" fill="none" stroke="rgba(60, 46, 28, 0.66)" strokeWidth={2.6} strokeLinejoin="round" />
              {[0, 1, 2].map((i) => (
                <circle key={i} cx={-16 + i * 18} cy={-6} r={3.6} fill="rgba(60, 46, 28, 0.66)" />
              ))}
            </g>
          </g>
        </g>

        {/* top marginalia */}
        <g opacity={easeOutCubic(prog(localSec, 0.3, 1.6)) * (1 - zoom)}>
          <Mono x={96} y={300} text="SATU MOLEKUL · DUA WAJAH" size={18} color="rgba(224, 210, 182, 0.62)" tracking={0.3} />
          <RuleLine x1={96} y1={352} x2={372} y2={352} color="rgba(206, 190, 160, 0.28)" />
        </g>
      </svg>

      <FilmGrain opacity={0.15} />
    </AbsoluteFill>
  );
};
