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

const Camel: React.FC<{ x: number; y: number; s: number; walk: number; color: string; flip?: boolean }> = ({
  x,
  y,
  s,
  walk,
  color,
  flip = false,
}) => {
  const legs = [
    { x0: -58, ph: 0 },
    { x0: -40, ph: 0.5 },
    { x0: 52, ph: 0.5 },
    { x0: 70, ph: 0 },
  ];
  return (
    <g transform={`translate(${x}, ${y}) scale(${flip ? -s : s}, ${s})`}>
      {/* legs with a slow, heavy gait */}
      {legs.map((l, i) => {
        const sw = Math.sin(walk * Math.PI * 2 + l.ph * Math.PI * 2) * 9;
        return (
          <g key={i}>
            <path
              d={`M ${l.x0},${-92} Q ${l.x0 + sw * 0.4},${-52} ${l.x0 + sw},${-4}`}
              fill="none"
              stroke={color}
              strokeWidth={9}
              strokeLinecap="round"
            />
            <line x1={l.x0 + sw - 5} y1={-4} x2={l.x0 + sw + 6} y2={-2} stroke={color} strokeWidth={7} strokeLinecap="round" />
          </g>
        );
      })}

      {/* body + hump */}
      <path
        d="M -76,-96 C -84,-124 -52,-138 -18,-136 C 8,-152 46,-150 66,-128 C 84,-110 82,-96 78,-92 L -76,-92 Z"
        fill={color}
      />
      <path d="M -70,-96 C -78,-84 -60,-76 -22,-76 L 66,-76 C 78,-80 80,-90 78,-92 L -76,-92 Z" fill={color} />

      {/* neck + head */}
      <path d={`M 66,-120 C 96,-128 104,-160 116,-186 C 122,-200 138,-204 148,-196 L 156,-186 C 144,-178 138,-166 132,-148 C 124,-122 110,-98 82,-92 Z`} fill={color} />
      <path d="M 140,-198 C 152,-204 166,-200 170,-190 C 172,-182 162,-176 152,-178 Z" fill={color} />
      <path d="M 144,-202 L 142,-212 L 150,-206 Z" fill={color} />
      <path d="M 158,-204 L 160,-214 L 166,-206 Z" fill={color} />
      {/* tail */}
      <path d="M -76,-98 C -94,-96 -104,-80 -102,-64" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

const CompassRose: React.FC<{ x: number; y: number; r: number; p: number; color: string }> = ({ x, y, r, p, color }) => {
  const g = easeOutCubic(clamp01(p));
  return (
    <g transform={`translate(${x}, ${y})`} opacity={g}>
      <circle cx={0} cy={0} r={r} fill="rgba(10, 10, 8, 0.42)" stroke={color} strokeWidth={1.6} />
      <circle cx={0} cy={0} r={r - 10} fill="none" stroke={color} strokeWidth={0.8} opacity={0.5} />
      {Array.from({ length: 32 }).map((_, i) => {
        const a = (i / 32) * Math.PI * 2;
        const long = i % 4 === 0;
        return (
          <line
            key={i}
            x1={Math.cos(a) * (r - 16)}
            y1={Math.sin(a) * (r - 16)}
            x2={Math.cos(a) * (r - (long ? 30 : 22))}
            y2={Math.sin(a) * (r - (long ? 30 : 22))}
            stroke={color}
            strokeWidth={long ? 1.6 : 0.9}
            opacity={0.7}
          />
        );
      })}
      {Array.from({ length: 4 }).map((_, i) => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const ex = Math.cos(a) * (r - 34);
        const ey = Math.sin(a) * (r - 34);
        return (
          <g key={i}>
            <path d={`M 0,0 L ${ex * 0.24 - Math.sin(a) * 12},${ey * 0.24 + Math.cos(a) * 12} L ${ex},${ey} L ${ex * 0.24 + Math.sin(a) * 12},${ey * 0.24 - Math.cos(a) * 12} Z`} fill={i === 0 ? color : 'rgba(232, 216, 186, 0.34)'} />
          </g>
        );
      })}
      {[
        { t: 'U', dx: 0, dy: -r - 14 },
        { t: 'T', dx: r + 16, dy: 6 },
        { t: 'S', dx: 0, dy: r + 26 },
        { t: 'B', dx: -r - 16, dy: 6 },
      ].map((c, i) => (
        <text
          key={i}
          x={c.dx}
          y={c.dy}
          textAnchor="middle"
          fill={color}
          fontFamily={IDENTITY.fontMono}
          fontSize={15}
          fontWeight={600}
          letterSpacing="0.1em"
          opacity={0.8}
        >
          {c.t}
        </text>
      ))}
      <circle cx={0} cy={0} r={3.4} fill={color} />
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

  const dunePaths = useMemo(() => {
    const rnd = makeRng(4477);
    return [0, 1, 2, 3].map((i) => {
      const baseY = 1290 + i * 150;
      const amp = 60 - i * 8;
      let d = `M -60,${baseY}`;
      for (let x = 0; x <= 1560; x += 60) {
        const y = baseY - Math.sin((x + i * 220) / 300) * amp - rnd() * 8;
        d += ` Q ${x - 30},${y - amp * 0.35} ${x},${y}`;
      }
      return `${d} L 1560,2560 L -60,2560 Z`;
    });
  }, []);

  const horizonY = 1290;

  return (
    <AbsoluteFill>
      <Backdrop top="#0B0D14" bottom={art.paper} tex="sand-ripple" texOpacity={0.1} vignette={0.5} />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="s7-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A0C13" />
            <stop offset="34%" stopColor="#1B1A1C" />
            <stop offset="62%" stopColor="#3A2A1E" />
            <stop offset="82%" stopColor="#6E4A2A" />
            <stop offset="100%" stopColor="#8D6034" />
          </linearGradient>
          <linearGradient id="s7-dune1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A5430" />
            <stop offset="100%" stopColor="#5A3C22" />
          </linearGradient>
          <linearGradient id="s7-dune2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5A3B22" />
            <stop offset="100%" stopColor="#3D2816" />
          </linearGradient>
          <linearGradient id="s7-dune3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A2515" />
            <stop offset="100%" stopColor="#241609" />
          </linearGradient>
          <linearGradient id="s7-dune4" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B1108" />
            <stop offset="100%" stopColor="#0B0704" />
          </linearGradient>
          <linearGradient id="s7-plume" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(232, 190, 116, 0.05)" />
            <stop offset="60%" stopColor="rgba(236, 198, 128, 0.5)" />
            <stop offset="100%" stopColor="rgba(240, 216, 168, 0.8)" />
          </linearGradient>
          <radialGradient id="s7-glow" cx="78%" cy="70%" r="46%">
            <stop offset="0%" stopColor="rgba(246, 200, 132, 0.22)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* sky */}
        <rect x={0} y={0} width={1440} height={horizonY + 90} fill="url(#s7-sky)" />

        {/* stars, fading as dawn warmth takes over */}
        <g opacity={stars * 0.9}>
          {Array.from({ length: 92 }).map((_, i) => {
            const sx = hash2(i, 3, 7) * 1440;
            const sy = hash2(i, 5, 13) * (horizonY - 260);
            const tw = 0.4 + 0.6 * Math.abs(Math.sin(localSec * 0.9 + i));
            return <circle key={i} cx={sx} cy={sy} r={hash2(i, 9, 3) * 1.7 + 0.4} fill="rgba(236, 230, 212, 0.9)" opacity={tw * (1 - sy / horizonY)} />;
          })}
        </g>

        {/* horizon glow */}
        <rect x={0} y={horizonY - 340} width={1440} height={430} fill="url(#s7-glow)" />

        {/* far dune line */}
        <path d={dunePaths[0]} fill="url(#s7-dune1)" opacity={0.9} transform={`translate(${-localSec * 2.2}, 0)`} />
        <path d={dunePaths[1]} fill="url(#s7-dune2)" transform={`translate(${-localSec * 4.4}, 6)`} />

        {/* camels crossing the middle band */}
        <g opacity={camelsIn} transform={`translate(${-80 + camelWalk * 150}, 0)`}>
          <ellipse cx={620} cy={1428} rx={280} ry={16} fill="rgba(0,0,0,0.22)" />
          <Camel x={520} y={1400} s={1.12} walk={camelWalk * 3.2} color="#241609" />
          <Camel x={676} y={1418} s={0.96} walk={camelWalk * 3.2 + 0.35} color="#1D1107" />
          <Camel x={796} y={1434} s={0.8} walk={camelWalk * 3.2 + 0.62} color="#180D05" />
          {/* the herder */}
          <g transform="translate(880, 1436)">
            <ellipse cx={0} cy={0} rx={16} ry={4} fill="rgba(0,0,0,0.3)" />
            <path d="M -6,-2 L -4,-40 L 6,-40 L 8,-2 Z" fill="#170C05" />
            <path d="M -6,-40 C -6,-52 6,-52 6,-40 Z" fill="#170C05" />
            <line x1={8} y1={-30} x2={26} y2={-6} stroke="#170C05" strokeWidth={3} />
          </g>
        </g>

        {/* mid + near dunes */}
        <path d={dunePaths[2]} fill="url(#s7-dune3)" transform={`translate(${-localSec * 7}, 0)`} />
        {/* waterhole, reeds and reflection */}
        <g>
          <ellipse cx={1082} cy={1520} rx={252} ry={62} fill="#2B1E12" />
          <ellipse cx={1082} cy={1514} rx={236} ry={52} fill="#3E4A42" />
          <ellipse cx={1082} cy={1514} rx={236} ry={52} fill="url(#s7-glow)" opacity={0.7} />
          {Array.from({ length: 7 }).map((_, i) => (
            <ellipse key={i} cx={1082 - 150 + i * 48} cy={1506 + (i % 3) * 12} rx={44 - i * 2} ry={5} fill="rgba(214, 226, 210, 0.16)" />
          ))}
          {Array.from({ length: 13 }).map((_, i) => {
            const rx = 872 + i * 38;
            const sway = Math.sin(localSec * 0.8 + i) * 5;
            return (
              <g key={i}>
                <path d={`M ${rx},${1528} C ${rx + sway},${1486} ${rx + 10 + sway},${1452} ${rx + 4 + sway * 1.6},${1420}`} fill="none" stroke="#4C5B3E" strokeWidth={2.6} strokeLinecap="round" />
                <path d={`M ${rx + 2 + sway * 1.6},${1424} l -8,-14 M ${rx + 2 + sway * 1.6},${1424} l 10,-16`} fill="none" stroke="#5F7048" strokeWidth={2} strokeLinecap="round" />
              </g>
            );
          })}
        </g>

        <path d={dunePaths[3]} fill="url(#s7-dune4)" transform={`translate(${-localSec * 11}, 0)`} />
        {sand && <image href={sand} x={0} y={1840} width={1440} height={760} opacity={0.16} preserveAspectRatio="none" />}

        {/* the geosmin plume: a light ribbon carried on the wind */}
        <g opacity={plume * 0.95}>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${1060},${1470 - i * 26} C ${880},${1400 - i * 30} ${700},${1330 - i * 18} ${470},${1352 - i * 34} S ${250},${1300 - i * 20} ${110},${1246 - i * 26}`}
              fill="none"
              stroke="url(#s7-plume)"
              strokeWidth={9 - i * 2.4}
              strokeLinecap="round"
              opacity={0.7 - i * 0.16}
              strokeDasharray={i === 0 ? undefined : `${26 + i * 16} ${18 + i * 10}`}
              strokeDashoffset={-plume * 160}
            />
          ))}
          {Array.from({ length: 14 }).map((_, i) => {
            const t = i / 13;
            const px = 1060 - t * 940;
            const py = 1470 - t * 210 + Math.sin(t * 5) * 22;
            return <circle key={i} cx={px} cy={py} r={1.6 + (i % 3)} fill="rgba(244, 214, 158, 0.7)" opacity={clamp01(plume * 1.5 - t * 0.7)} />;
          })}
        </g>

        {/* drifting sand */}
        <g opacity={0.42}>
          {Array.from({ length: 40 }).map((_, i) => {
            const sp = 30 + (i % 7) * 12;
            const px = (i * 137 + localSec * sp) % 1500 - 30;
            const py = 1350 + ((i * 71) % 700);
            return <circle key={i} cx={px} cy={py} r={0.8 + (i % 3) * 0.6} fill="rgba(224, 196, 152, 0.7)" />;
          })}
        </g>

        {/* compass, etched in brass */}
        <CompassRose x={1216} y={430} r={132} p={prog(globalSec, 96.9, 99.0)} color="rgba(226, 194, 138, 0.8)" />

        {/* ---------------- typography: vertical masthead ------------------ */}
        <g opacity={reveal}>
          <g transform="translate(78, 900) rotate(-90)">
            <text x={0} y={0} fill={art.ink} fontFamily={IDENTITY.fontInstrument} fontStyle="italic" fontSize={126} letterSpacing="-0.02em">
              Kompas
            </text>
          </g>
          <g transform="translate(96, 1290)">
            <RuleLine x1={0} y1={0} x2={260 * easeOutCubic(prog(localSec, 0.5, 1.8))} y2={0} color="rgba(216, 198, 166, 0.42)" />
            <Mono x={0} y={38} text="AROMA SEBAGAI PETA" size={17} color="rgba(230, 216, 190, 0.68)" tracking={0.2} />
            <Mono x={0} y={66} text="± 80 KM DARI SUMBER AIR" size={14} color="rgba(212, 198, 172, 0.46)" tracking={0.14} weight={400} />
          </g>
        </g>

        <g opacity={easeOutCubic(prog(globalSec, 97.4, 99.4))}>
          <Mono x={92} y={1760} text="NALURI YANG DIWARISKAN" size={16} color={art.accent} tracking={0.3} />
          <text x={90} y={1838} fill={art.ink} fontFamily={IDENTITY.fontGrotesk} fontSize={44} fontWeight={500} letterSpacing="-0.02em">
            gurun menyimpan arah
          </text>
          <text x={90} y={1892} fill="rgba(238, 228, 208, 0.66)" fontFamily={IDENTITY.fontGrotesk} fontSize={30} fontWeight={400}>
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
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-outside`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1C2422" />
          <stop offset="46%" stopColor="#2C3A34" />
          <stop offset="78%" stopColor="#3C4A3C" />
          <stop offset="100%" stopColor="#222C24" />
        </linearGradient>
        <linearGradient id={`${uid}-frame`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#8B6338" />
          <stop offset="38%" stopColor="#6A4626" />
          <stop offset="100%" stopColor="#4A2F19" />
        </linearGradient>
        <clipPath id={`${uid}-glass`}>
          <rect x={x + 22} y={y + 22} width={w - 44} height={h - 44} />
        </clipPath>
      </defs>

      {/* wall shadow around the frame */}
      <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} fill="rgba(0,0,0,0.35)" />

      {/* outdoor view through the glass */}
      <g clipPath={`url(#${uid}-glass)`} opacity={g}>
        <rect x={x + 22} y={y + 22} width={w - 44} height={h - 44} fill={`url(#${uid}-outside)`} />
        {/* distant hills, layered */}
        <path d={`M ${x},${y + h * 0.62} Q ${x + w * 0.28},${y + h * 0.44} ${x + w * 0.52},${y + h * 0.6} T ${x + w},${y + h * 0.56} L ${x + w},${y + h} L ${x},${y + h} Z`} fill="#243127" opacity={0.9} />
        <path d={`M ${x},${y + h * 0.74} Q ${x + w * 0.36},${y + h * 0.6} ${x + w * 0.7},${y + h * 0.76} T ${x + w},${y + h * 0.72} L ${x + w},${y + h} L ${x},${y + h} Z`} fill="#1A241B" />
        {/* rain streaks outside */}
        {Array.from({ length: 46 }).map((_, i) => {
          const rx = x + 20 + ((i * 61) % (w - 40));
          const ry = y + 20 + (((i * 137 + localSec * 520) % (h - 30)) as number);
          return <line key={i} x1={rx} y1={ry} x2={rx - 6} y2={ry + 34} stroke="rgba(206, 226, 216, 0.38)" strokeWidth={1.4} strokeLinecap="round" />;
        })}
        {/* warm kitchen light caught in the glass */}
        <ellipse cx={x + w * 0.3} cy={y + h * 0.24} rx={w * 0.3} ry={h * 0.16} fill="rgba(240, 200, 140, 0.12)" />
        {/* droplets on the inside of the glass */}
        {Array.from({ length: 26 }).map((_, i) => {
          const dx = x + 36 + hash2(i, 5, 3) * (w - 72);
          const dy = y + 30 + hash2(i, 9, 7) * (h - 60);
          const dr = 3 + hash2(i, 3, 11) * 8;
          return (
            <g key={i}>
              <circle cx={dx} cy={dy} r={dr} fill="rgba(226, 240, 234, 0.16)" stroke="rgba(248, 254, 248, 0.42)" strokeWidth={0.8} />
              <ellipse cx={dx - dr * 0.3} cy={dy - dr * 0.34} rx={dr * 0.34} ry={dr * 0.24} fill="rgba(255, 255, 255, 0.55)" />
            </g>
          );
        })}
      </g>

      {/* wooden frame + mullions */}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={`url(#${uid}-frame)`} strokeWidth={22} />
      <rect x={x + 11} y={y + 11} width={w - 22} height={h - 22} fill="none" stroke="rgba(246, 220, 174, 0.3)" strokeWidth={2} />
      <line x1={x + w / 2} y1={y + 16} x2={x + w / 2} y2={y + h - 16} stroke={`url(#${uid}-frame)`} strokeWidth={16} />
      <line x1={x + 16} y1={y + h * 0.46} x2={x + w - 16} y2={y + h * 0.46} stroke={`url(#${uid}-frame)`} strokeWidth={14} />
      <line x1={x + w / 2} y1={y + 16} x2={x + w / 2} y2={y + h - 16} stroke="rgba(246, 220, 174, 0.22)" strokeWidth={2} />
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
        <g opacity={1 - zoom * 0.85}>
          <CatfishPlate x={462} y={880} s={1.02} p={fishIn} uid="s8-fish" />

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
          <g opacity={easeOutCubic(prog(globalSec, 103.4, 104.9)) * (1 - zoom * 0.9)}>
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
          <Mono x={96} y={330} text="SATU MOLEKUL · DUA WAJAH" size={18} color="rgba(224, 210, 182, 0.62)" tracking={0.3} />
          <RuleLine x1={96} y1={352} x2={372} y2={352} color="rgba(206, 190, 160, 0.28)" />
        </g>
      </svg>

      <FilmGrain opacity={0.15} />
    </AbsoluteFill>
  );
};
