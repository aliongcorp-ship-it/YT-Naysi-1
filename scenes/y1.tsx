/* y1 — horizon
   The claim, before any evidence: a Moon over a ridge, small and ordinary, with
   the plate's measuring furniture already in place around it. The camera pushes
   a hair. Nothing else moves except the stars and a slow drift of the ridge
   lights, because the point of this shot is scale, not spectacle.

   Everything sits above y = 1760: from there down the frame belongs to the
   caption, and the picture must not compete with the line being spoken. */

import React from 'react';
import type {SceneProps} from './types';
import {
  L, P, Ridge, SZ, Stage, StarFlare, Stars, T, alpha, clamp, hash, rev,
} from './bulan';

const MX = 1024;
const MY = 430;
const MR = 104;
const HORIZON = 1652;

export const Compo: React.FC<SceneProps> = ({local}) => {
  const rise = rev(local, 0.1, 1.2);
  const moonOn = rev(local, 0.35, 1.0);
  const kick = rev(local, 0.95, 0.8);
  const scale = rev(local, 1.2, 1.0);
  const lift = -18 * rev(local, 0, 6);

  return (
    <Stage grid={0} paper={0.5} dust={0.42} dustSeed={1} shade={0.86}>
      <Stars n={300} h={1500} seed={1} twinkle />

      {/* the vertical measure: the Moon's height above the ridge, ruled */}
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={MX} y1={MY + MR + 10} x2={MX} y2={HORIZON - 24} stroke={alpha(P.ink, 0.16 * kick)} strokeWidth={1} />
        {Array.from({length: 26}).map((_, i) => {
          const y = MY + MR + 24 + i * ((HORIZON - MY - MR - 48) / 25);
          const big = i % 5 === 0;
          return (
            <line
              key={i}
              x1={MX - (big ? 16 : 8)}
              y1={y}
              x2={MX + (big ? 16 : 8)}
              y2={y}
              stroke={alpha(P.ink, (big ? 0.42 : 0.18) * kick)}
              strokeWidth={1}
            />
          );
        })}
      </svg>

      {/* the Moon */}
      <div style={{position: 'absolute', opacity: moonOn}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <circle cx={MX} cy={MY} r={MR} fill="#EFE2C6" />
          <circle cx={MX} cy={MY} r={MR} fill="none" stroke={alpha(P.warm, 0.5)} strokeWidth={1.6} />
          <g fill="#A9936E" opacity={0.5}>
            <ellipse cx={MX - 26} cy={MY - 30} rx={30} ry={25} />
            <ellipse cx={MX + 20} cy={MY - 40} rx={15} ry={12} />
            <ellipse cx={MX + 10} cy={MY + 28} rx={27} ry={18} />
            <ellipse cx={MX - 40} cy={MY + 40} rx={13} ry={15} />
            <ellipse cx={MX + 42} cy={MY + 36} rx={11} ry={12} />
            <ellipse cx={MX - 6} cy={MY - 62} rx={11} ry={9} />
          </g>
          <g fill="none" stroke="#FFF6E2" strokeWidth={0.9} opacity={0.45}>
            <circle cx={MX - 34} cy={MY - 8} r={6} />
            <circle cx={MX + 26} cy={MY - 4} r={4.5} />
            <circle cx={MX - 2} cy={MY + 52} r={3.6} />
            <circle cx={MX + 50} cy={MY - 24} r={5} />
          </g>
          {/* the terminator, hatched rather than faded */}
          <g opacity={0.3}>
            <rect x={MX + 6} y={MY - MR} width={MR} height={MR * 2} fill="url(#limbhatch)" />
          </g>
          <defs>
            <pattern id="limbhatch" width={4} height={4} patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
              <line x1={0} y1={0} x2={0} y2={4} stroke="#1A1410" strokeWidth={0.8} />
            </pattern>
          </defs>
        </svg>
        <StarFlare x={MX - 232} y={MY - 96} size={13} on={kick * 0.55} />
        <StarFlare x={MX + 196} y={MY + 188} size={9} on={kick * 0.4} />
      </div>

      {/* the caption block: a label, the claim, and what it is measured against */}
      <div style={{opacity: rise * kick}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 690,
            fontFamily: T.mono,
            fontSize: 17,
            letterSpacing: '0.42em',
            color: alpha(P.muted, 0.9),
          }}
        >
          JARAK RATA-RATA · 384.400 KM
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 748,
            width: 840,
            fontFamily: T.display,
            fontSize: 86,
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: '-0.028em',
            color: P.ink,
          }}
        >
          Sebuah benda yang
          <br />
          <span style={{fontStyle: 'italic', color: P.accent}}>perlahan</span> menghilang.
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 966,
            width: 520,
            height: 1,
            background: alpha(P.ink, 0.22),
            transform: `scaleX(${clamp((local - 1.0) / 1.0)})`,
            transformOrigin: 'left',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 986,
            fontFamily: T.mono,
            fontSize: 16,
            letterSpacing: '0.3em',
            color: alpha(P.muted, 0.75),
            opacity: rev(local, 1.3, 0.8),
          }}
        >
          MENGUKUR SELAMA 56 TAHUN
        </div>
      </div>

      {/* the scale under everything: 0 to 384.400 km */}
      <div style={{opacity: scale}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={L.left} y1={1232} x2={L.right} y2={1232} stroke={alpha(P.ink, 0.32)} strokeWidth={1} />
          {Array.from({length: 61}).map((_, i) => {
            const x = L.left + ((L.right - L.left) * i) / 60;
            const big = i % 10 === 0;
            return (
              <line
                key={i}
                x1={x}
                y1={1232}
                x2={x}
                y2={1232 + (big ? 22 : 11)}
                stroke={alpha(P.ink, big ? 0.6 : 0.24)}
                strokeWidth={1}
              />
            );
          })}
          {/* the Moon's position on that scale */}
          <line x1={L.right} y1={1204} x2={L.right} y2={1262} stroke={P.accent} strokeWidth={1.6} />
        </svg>
        {['0', '64.067', '128.133', '192.200', '256.267', '320.333', '384.400'].map((t, i) => (
          <div
            key={t}
            style={{
              position: 'absolute',
              left: L.left + (L.measure * i) / 6 - (i === 0 ? 0 : 40),
              width: i === 0 ? 80 : 80,
              top: 1268,
              fontFamily: T.mono,
              fontSize: 14,
              letterSpacing: '0.14em',
              color: alpha(P.muted, 0.62),
              textAlign: i === 0 ? 'left' : i === 6 ? 'right' : 'center',
            }}
          >
            {t}
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1316,
            fontFamily: T.mono,
            fontSize: 14,
            letterSpacing: '0.3em',
            color: alpha(P.muted, 0.5),
          }}
        >
          KILOMETER
        </div>
      </div>

      {/* the ridge, kept above the caption */}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${lift}px)`}}>
        <Ridge
          layers={[
            {
              points: `0,${HORIZON + 40} 132,${HORIZON - 6} 300,${HORIZON + 30} 470,${HORIZON - 22} 640,${HORIZON + 18} 800,${HORIZON - 34} 980,${HORIZON + 26} 1160,${HORIZON - 10} 1300,${HORIZON + 32} 1440,${HORIZON + 6}`,
              fill: '#121A26',
              stroke: 'rgba(255,217,160,0.5)',
              strokeWidth: 1.6,
            },
            {
              points: `0,${HORIZON + 96} 120,${HORIZON + 62} 260,${HORIZON + 84} 430,${HORIZON + 44} 600,${HORIZON + 78} 790,${HORIZON + 38} 970,${HORIZON + 84} 1140,${HORIZON + 52} 1310,${HORIZON + 88} 1440,${HORIZON + 58}`,
              fill: '#0A0E15',
            },
          ]}
          lights={[
            [318, HORIZON + 92],
            [906, HORIZON + 78],
            [1188, HORIZON + 86],
            [548, HORIZON + 72],
            [142, HORIZON + 100],
            [742, HORIZON + 116],
            [1032, HORIZON + 104],
            [420, HORIZON + 126],
          ]}
          lightSize={4.2}
        />
      </div>
    </Stage>
  );
};

export default Compo;
