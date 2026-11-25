/* y15 — 384.400 km
   The distance, made touchable: put a 30 cm globe in your hand and the Moon is
   9,4 m away, across a room. So the plate draws a measured room.

   One metre is 100 px, and the whole shot obeys it: a 1,7 m figure at the origin,
   the globe at the height of a held hand, a rule that runs the full 9,4 m, and a
   mark where the Moon would be. The Moon itself is 1,9 cm at this scale — too
   small to draw honestly — so it is a marked point with a leader that says so. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, Figure, Label, L, Note, P, SZ, Source, Stage, T, alpha, clamp, lerp, rev,
} from './bulan';

const M = 118;                  // px per metre
const X0 = L.left + 46;         // the origin: where the figure stands
const FLOOR = 1002;             // the rule sits on the floor line
const REACH = 9.4 * M;          // the Moon's mark

export const Compo: React.FC<SceneProps> = ({local}) => {
  const on = rev(local, 0, 0.8);
  const rule = rev(local, 0.4, 1.3);
  const fig = rev(local, 1.1, 1.0);
  const walk = clamp((local - 1.7) / 2.8);
  const answer = rev(local, 4.1, 1.0);
  const note = rev(local, 4.7, 0.9);

  const mx = X0 + REACH * walk;

  return (
    <Stage grid={0.22} gridCell={168} paper={0.44} dustSeed={15} shade={0.92}>
      <Label text="SKALA SATU BANDING SEPULUH JUTA" y={L.top} on={on} />

      {/* the floor rule: one metre, one hundred pixels */}
      <div style={{opacity: rule}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={X0} y1={FLOOR} x2={X0 + REACH * Math.max(rule, 0.02)} y2={FLOOR} stroke={alpha(P.ink, 0.3)} strokeWidth={1.2} />
          {Array.from({length: 20}).map((_, i) => {
            const x = X0 + i * (M / 2);
            const big = i % 2 === 0;
            return (
              <line
                key={i}
                x1={x}
                y1={FLOOR}
                x2={x}
                y2={FLOOR + (big ? 24 : 13)}
                stroke={alpha(P.ink, big ? 0.6 : 0.26)}
                strokeWidth={1}
              />
            );
          })}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((m) => (
            <text
              key={m}
              x={X0 + m * M}
              y={FLOOR + 54}
              fill={alpha(P.muted, 0.7)}
              fontFamily={T.mono}
              fontSize={15}
              letterSpacing={1.6}
              textAnchor="middle"
            >
              {m}
            </text>
          ))}
          <text x={X0 + REACH} y={FLOOR + 54} fill={alpha(P.accent, 0.9)} fontFamily={T.mono} fontSize={15} letterSpacing={1.6} textAnchor="middle">
            9,4
          </text>
        </svg>
        <div
          style={{
            position: 'absolute',
            left: X0 + 320,
            top: FLOOR + 74,
            fontFamily: T.mono,
            fontSize: 14,
            letterSpacing: '0.3em',
            color: alpha(P.muted, 0.5),
          }}
        >
          METER
        </div>
      </div>

      {/* the figure, 1,7 m, at the origin: the only thing here at true scale */}
      <div style={{opacity: fig}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <g fill={alpha(P.ink, 0.2)} stroke={alpha(P.warm, 0.55)} strokeWidth={1.2}>
            <circle cx={X0} cy={FLOOR - 156} r={13} />
            <path d={`M${X0 - 15} ${FLOOR - 140} L${X0 + 15} ${FLOOR - 140} L${X0 + 12} ${FLOOR - 74} L${X0 - 12} ${FLOOR - 74} Z`} />
            <path d={`M${X0 - 12} ${FLOOR - 74} L${X0 - 16} ${FLOOR} L${X0 - 4} ${FLOOR} L${X0} ${FLOOR - 40} L${X0 + 4} ${FLOOR} L${X0 + 16} ${FLOOR} L${X0 + 12} ${FLOOR - 74} Z`} />
            <path d={`M${X0 + 14} ${FLOOR - 132} L${X0 + 34} ${FLOOR - 104}`} />
          </g>
          {/* the globe, 30 cm = 30 px, held at arm's length */}
          <circle cx={X0 + 36} cy={FLOOR - 100} r={15} fill="#2C444C" stroke={alpha(P.warm, 0.7)} strokeWidth={1.2} />
          <ellipse cx={X0 + 36} cy={FLOOR - 100} rx={15} ry={5} fill="none" stroke={alpha(P.warm, 0.35)} strokeWidth={0.9} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: X0 - 40,
            width: 260,
            top: FLOOR - 268,
            fontFamily: T.mono,
            fontSize: 14,
            letterSpacing: '0.22em',
            color: alpha(P.muted, 0.68),
          }}
        >
          1,7 M · 30 CM
        </div>
      </div>

      {/* the Moon's mark, at 9,4 m, with the honest note about its size */}
      <div style={{opacity: fig}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={mx} y1={FLOOR} x2={mx} y2={FLOOR - 168} stroke={alpha(P.alt, 0.4)} strokeWidth={1} strokeDasharray="4 7" />
          <circle cx={mx} cy={FLOOR - 176} r={6} fill="none" stroke={alpha(P.alt, 0.9)} strokeWidth={1.4} />
          <line x1={mx} y1={FLOOR - 176} x2={mx - 86} y2={FLOOR - 244} stroke={alpha(P.alt, 0.6)} strokeWidth={1} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: mx - 390,
            top: FLOOR - 268,
            width: 296,
            textAlign: 'right',
            fontFamily: T.mono,
            fontSize: 14,
            letterSpacing: '0.2em',
            lineHeight: 1.9,
            color: alpha(P.alt, 0.9),
          }}
        >
          BULAN · 1,9 CM
          <br />
          <span style={{color: alpha(P.muted, 0.6)}}>DIPERBESAR</span>
        </div>
      </div>

      {/* the number and the instruction */}
      <div style={{opacity: answer}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1240,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.24),
          }}
        />
        <Figure value="9,4" x={L.left} y={1278} size={132} unit="METER" unitColor={alpha(P.accent, 0.95)} />
        <div
          style={{
            position: 'absolute',
            left: L.left + 470,
            top: 1330,
            width: 660,
            fontFamily: T.italic,
            fontStyle: 'italic',
            fontSize: SZ.sub,
            lineHeight: 1.32,
            color: alpha(P.muted, 0.94),
          }}
        >
          Bola di ujung lengan, Bulan di seberang ruangan.
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: L.left,
          top: 1420,
          fontFamily: T.mono,
          fontSize: 16,
          letterSpacing: '0.24em',
          color: alpha(P.muted, 0.7),
          opacity: answer,
        }}
      >
        SATU MASA HIDUP = + 3 METER
      </div>

      <Note
        text="384.400 km ÷ 10 juta = 9,4 m"
        x={L.left}
        y={1520}
        on={note}
        width={620}
        size={SZ.small}
        color={alpha(P.accent, 0.8)}
      />

      <div style={{opacity: note}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1616,
            fontFamily: T.mono,
            fontSize: 14,
            letterSpacing: '0.26em',
            color: alpha(P.muted, 0.62),
          }}
        >
          384.400 KM ≈ 30 GARIS TENGAH BUMI
        </div>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          {Array.from({length: 30}).map((_, i) => (
            <circle
              key={i}
              cx={L.left + 9 + i * 38}
              cy={1672}
              r={11}
              fill={alpha(P.alt, 0.12)}
              stroke={alpha(P.alt, 0.55)}
              strokeWidth={1}
            />
          ))}
        </svg>
      </div>

      <Brackets x0={L.left - 16} y0={FLOOR - 300} x1={L.right + 16} y1={FLOOR + 96} len={22} on={rule * 0.45} />
      <Source text="SKALA 1 : 10.000.000 · DIAMETER BULAN 3.474 KM" on={rev(local, 5.2, 0.9)} y={1738} />
    </Stage>
  );
};

export default Compo;
