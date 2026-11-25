/* y4 — laser & satu foton
   The whole distance in one frame, to scale on the diagonal: the telescope at
   the bottom left, the Moon at the top right, and a beam that leaves as a
   needle and arrives as a 20 km smear — because that is what happens. Then the
   return trip: one photon out of a trillion comes back, and the film follows
   that one dot the whole way home. */

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {P, T, Metric} from './bulan.mjs';
import {MoonDisc} from '../src/ui/Moon';
import {Dust} from '../src/ui/Texture';
import {alpha, clamp, eOut, eIn, lerp} from '../src/theme';

const TX = 262; // telescope
const TY = 1478;
const MX = 1082; // the Moon's near limb
const MY = 620;
const MR = 196;

export const Compo = ({local, act}) => {
  const D = act.end - act.start;

  // Beat map, in fractions of the act: the beam leaves at "ditembakkan", the
  // spread is explained on "384 ribu kilometer", the return starts at "Dari
  // triliunan foton", and the single photon lands on "satu yang pulang".
  const out = eOut(clamp((local - 0.7) / 2.4));
  const spread = eOut(clamp((local - 3.1) / 2.2));
  const back = eIn(clamp((local - (D * 0.62)) / (D * 0.3)));
  const landed = clamp((local - (D * 0.9)) / 0.7);

  // the returning photon's position, from the Moon's limb back to the telescope
  const px = lerp(MX, TX, back);
  const py = lerp(MY, TY, back);

  return (
    <AbsoluteFill style={{background: P.void}}>
      <AbsoluteFill style={{background: 'linear-gradient(168deg, #0B0806 0%, #090605 54%, #060403 100%)'}} />
      <Dust n={620} seed={52} opacity={0.44} color={P.ink} />

      {/* stars, thin here: near the telescope the sky is a working sky */}
      <Stars />

      {/* the Moon, small but unmistakable, at the far end of the line */}
      <MoonDisc cx={MX} cy={MY} r={MR} detail={0.9} lit={0.88} tilt={18} seed={9} opacity={0.95} />

      {/* the outgoing beam: a needle that becomes a cone */}
      <OutgoingBeam out={out} spread={spread} />

      {/* the return trip */}
      <div
        style={{
          position: 'absolute',
          left: px - 10,
          top: py - 10,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: P.alt,
          opacity: back > 0 && landed < 1 ? 1 : 0,
          boxShadow: `0 0 18px 4px ${alpha(P.alt, 0.55)}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: px - 34,
          top: py - 34,
          width: 68,
          height: 68,
          borderRadius: '50%',
          border: `1px solid ${alpha(P.alt, 0.6)}`,
          opacity: back > 0 && landed < 1 ? 1 : 0,
        }}
      />

      {/* the return trail, drawn faintly so the eye can follow it */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1440,
          height: 2560,
          opacity: back > 0 ? 0.5 : 0,
        }}
      >
        <svg width={1440} height={2560} style={{position: 'absolute', left: 0, top: 0}}>
          <line
            x1={MX}
            y1={MY}
            x2={px}
            y2={py}
            stroke={P.alt}
            strokeWidth={1.2}
            opacity={0.5}
            strokeDasharray="3 9"
          />
        </svg>
      </div>

      {/* the telescope */}
      <Telescope landed={landed} />

      {/* distance read out along the beam */}
      <div style={{opacity: eOut(clamp((local - 2.0) / 1.2))}}>
        <Metric
          x0={TX + 40}
          x1={MX}
          y={1626}
          label="384.400 KM"
          sub="PERJALANAN SATU ARAH"
          color={P.accent}
        />
      </div>

      {/* the photon's own label, only while it is coming back */}
      <div
        style={{
          position: 'absolute',
          left: px - 150,
          top: py - 52,
          width: 130,
          textAlign: 'right',
          opacity: clamp(back * 4) * (1 - clamp((landed - 0.2) / 0.5)),
          fontFamily: T.mono,
          fontSize: 19,
          letterSpacing: '0.24em',
          color: P.alt,
        }}
      >
        1 FOTON
      </div>

      <SpreadLabel spread={spread} />
      <Observatory />
    </AbsoluteFill>
  );
};

/* From the telescope: a single hairline for the first metre, opening into a
   translucent wedge. Both are one element each — a rotated gradient. */
const OutgoingBeam = ({out, spread}) => {
  const dx = MX - TX;
  const dy = MY - TY;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const width = lerp(2, 26, spread);
  return (
    <div style={{position: 'absolute', left: TX, top: TY, width: len, height: 1, transformOrigin: '0 50%', transform: `rotate(${ang}deg)`}}>
      {/* the drawn part of the beam */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: -width / 2,
          width: len * out,
          height: width,
          background: `linear-gradient(90deg, ${alpha(P.accent, 0.9)} 0%, ${alpha(P.accent, 0.5)} 46%, ${alpha(P.accent, 0.16)} 100%)`,
          clipPath: 'polygon(0 46%, 100% 0, 100% 100%, 0 54%)',
        }}
      />
      {/* the core, which never widens */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: -1,
          width: len * out,
          height: 2,
          background: `linear-gradient(90deg, ${P.warm}, ${alpha(P.warm, 0.7)} 60%, ${alpha(P.warm, 0)} 100%)`,
        }}
      />
      {/* the head of the beam */}
      <div
        style={{
          position: 'absolute',
          left: len * out - 5,
          top: -3,
          width: 10,
          height: 6,
          background: P.warm,
          opacity: out < 1 ? 1 : 0,
        }}
      />
    </div>
  );
};

/* 20 km at the Moon is the reason the return is one photon in a trillion. The
   label sits at the far end where the spread is widest. */
const SpreadLabel = ({spread}) => {
  const e = eOut(clamp(spread));
  if (e <= 0) return null;
  const x = MX + 40;
  const y = MY + MR + 54;
  return (
    <div style={{position: 'absolute', left: x - 300, top: y, width: 300, textAlign: 'left', opacity: e}}>
      <div style={{marginLeft: 0, width: 260, height: 1, background: alpha(P.accent, 0.5)}} />
      <div style={{marginTop: 12, fontFamily: T.mono, fontSize: 21, letterSpacing: '0.2em', color: P.accent}}>LEBAR 20 KM</div>
      <div style={{marginTop: 8, fontFamily: T.mono, fontSize: 17, letterSpacing: '0.22em', color: alpha(P.ink, 0.5)}}>BERKAS DI BULAN</div>
    </div>
  );
};

/* A telescope drawn in section: a tube, a fork, a pier, and a stub of light.
   Nothing photographic — it is a diagram that happens to sit in the dark. */
const Telescope = ({landed}) => (
  <div style={{position: 'absolute', left: TX - 118, top: TY - 130, width: 260, height: 240}}>
    <svg width={260} height={240} style={{position: 'absolute', left: 0, top: 0}}>
      {/* tube, aimed along the beam */}
      <g transform={`translate(118 130) rotate(${(Math.atan2(MY - TY, MX - TX) * 180) / Math.PI})`}>
        <rect x={-96} y={-22} width={186} height={44} fill="#22190F" stroke="rgba(246,235,212,0.5)" strokeWidth={1.4} />
        <rect x={82} y={-26} width={12} height={52} fill="#2E2317" stroke="rgba(246,235,212,0.55)" strokeWidth={1.2} />
        <line x1={-96} y1={-22} x2={-96} y2={22} stroke="rgba(246,235,212,0.3)" strokeWidth={1} />
      </g>
      {/* fork + pier */}
      <path d="M96 150 L96 196 M140 150 L140 196" stroke="rgba(246,235,212,0.42)" strokeWidth={3} fill="none" />
      <rect x={80} y={196} width={76} height={12} fill="#241B11" stroke="rgba(246,235,212,0.4)" strokeWidth={1.2} />
      <rect x={104} y={208} width={28} height={24} fill="#1B140D" stroke="rgba(246,235,212,0.3)" strokeWidth={1} />
    </svg>
    {/* the warm light at the aperture, brighter the moment a photon lands */}
    <div
      style={{
        position: 'absolute',
        left: 116,
        top: 108,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(P.alt, 0.5 + landed * 0.4)} 0%, ${alpha(P.alt, 0)} 70%)`,
        opacity: 0.5 + landed * 0.5,
      }}
    />
  </div>
);

/* The ground the telescope stands on, and the dome it lives in. Pure
   silhouette, low in frame: it closes the bottom of the picture and says
   "this is an observatory, not a satellite". */
const Observatory = () => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1440, height: 2560, pointerEvents: 'none'}}>
    <svg width={1440} height={2560} style={{position: 'absolute', left: 0, top: 0}}>
      <path d="M0 2118 L120 2102 L260 2112 L400 2094 L560 2110 L720 2098 L880 2114 L1040 2104 L1200 2118 L1330 2106 L1440 2114 L1440 2560 L0 2560 Z" fill="#070504" />
      {/* dome, left of centre, with its slit open */}
      <g>
        <path d="M84 2112 A 92 92 0 0 1 268 2112 Z" fill="#100B07" stroke="rgba(246,235,212,0.22)" strokeWidth={1.4} />
        <path d="M172 2020 L186 2012 L196 2112 L164 2112 Z" fill="#060403" />
        <rect x={70} y={2106} width={212} height={10} fill="#0B0806" />
      </g>
      {/* a service hut further right, so the site is not one lonely dome */}
      <rect x={1064} y={2078} width={86} height={40} fill="#0A0705" stroke="rgba(246,235,212,0.16)" strokeWidth={1} />
      <rect x={1096} y={2066} width={10} height={14} fill="#0A0705" />
    </svg>
    {/* the faintest warm line where the site meets the sky */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 2096,
        width: 1440,
        height: 26,
        background: 'linear-gradient(180deg, rgba(196,146,86,0), rgba(196,146,86,0.18), rgba(196,146,86,0))',
      }}
    />
  </div>
);

const Stars = () => {
  const stars = React.useMemo(
    () =>
      Array.from({length: 150}, (_, i) => {
        const a = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
        const b = Math.abs(Math.sin(i * 78.233) * 12345.6789) % 1;
        return {x: a * 1440, y: b * 1700, s: 1 + (a * 1.6), o: 0.14 + b * 0.5};
      }),
    []
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {stars.map((s, i) => (
        <div key={i} style={{position: 'absolute', left: s.x, top: s.y, width: s.s, height: s.s, background: P.ink, opacity: s.o * 0.7}} />
      ))}
    </AbsoluteFill>
  );
};

export default Compo;
