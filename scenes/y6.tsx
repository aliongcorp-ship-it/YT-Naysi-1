/* y6 — trace & angka
   Precision, drawn as an instrument reading. An oscilloscope trace sweeps across
   the plate; the return pulse lands at a marked time. Under it, the three numbers
   that make the claim: the clock (pikodetik), the resolution (3 mm), and the
   record (56 tahun).

   The gauge is the honest part: 3 mm on a 384.400 km baseline is a needle that
   barely moves, so the needle is shown barely moving. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, Counter, Figure, Gauge, Label, L, Note, P, SZ, Source, Stage, T, Ticks, Trace, alpha, clamp, lerp, rev,
} from './bulan';

const GX0 = L.left + 620;
const GX1 = L.right;
const GY = 1150;

export const Compo: React.FC<SceneProps> = ({local}) => {
  const frameOn = rev(local, 0, 0.7);
  const sweep = clamp((local - 0.35) / 2.4);
  const read = rev(local, 2.5, 0.9);
  const numbers = rev(local, 3.0, 1.0);
  const gauge = rev(local, 3.6, 1.4);

  // the needle creeps from 0 to the 3 mm mark over the last third
  const needle = 3 * clamp((local - 3.6) / 2.6);

  return (
    <Stage grid={0.3} gridCell={144} paper={0.4} dustSeed={6} shade={0.94}>
      <Label text="OSILOSKOP · KEMBALIAN" y={L.top} on={frameOn} />
      <Label text="SKALA 0,2 NS / PETAK" y={L.top + 222} on={frameOn * 0.8} rule={0} size={14} color={alpha(P.muted, 0.65)} />

      {/* the instrument face */}
      <div
        style={{
          position: 'absolute',
          left: L.left - 26,
          top: 320,
          width: L.measure + 52,
          height: 620,
          border: `1px solid ${alpha(P.ink, 0.16)}`,
          background: `linear-gradient(180deg, ${alpha(P.deep, 0.6)} 0%, ${alpha(P.abyss, 0.28)} 100%)`,
          opacity: frameOn,
        }}
      />
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0, opacity: frameOn}}>
        {/* the graticule: 10 × 8 divisions, every fifth heavier */}
        {Array.from({length: 11}).map((_, i) => (
          <line
            key={`v${i}`}
            x1={L.left - 26 + ((L.measure + 52) / 10) * i}
            y1={320}
            x2={L.left - 26 + ((L.measure + 52) / 10) * i}
            y2={940}
            stroke={alpha(P.alt, i % 5 === 0 ? 0.2 : 0.075)}
            strokeWidth={1}
          />
        ))}
        {Array.from({length: 9}).map((_, i) => (
          <line
            key={`h${i}`}
            x1={L.left - 26}
            y1={320 + (620 / 8) * i}
            x2={L.right + 26}
            y2={320 + (620 / 8) * i}
            stroke={alpha(P.alt, i % 4 === 0 ? 0.2 : 0.075)}
            strokeWidth={1}
          />
        ))}
        <line x1={L.left - 26} y1={710} x2={L.right + 26} y2={710} stroke={alpha(P.alt, 0.32)} strokeWidth={1} />
      </svg>

      <Trace x0={L.left - 10} x1={L.right + 10} y={710} h={300} sweep={sweep} pulse={0.62} noise={1} color={P.accent} ghost={0.22} seed={6} />

      {/* the grid readout, mono, in the corner of the face */}
      <div
        style={{
          position: 'absolute',
          left: L.left + 10,
          top: 842,
          fontFamily: T.mono,
          fontSize: 16,
          letterSpacing: '0.22em',
          color: alpha(P.alt, 0.75),
          opacity: frameOn,
        }}
      >
        CH1 · 2 mV/div · 62 ms/div
      </div>
      <div
        style={{
          position: 'absolute',
          right: L.w - L.right + 10,
          top: 842,
          fontFamily: T.mono,
          fontSize: 16,
          letterSpacing: '0.22em',
          color: alpha(P.accent, 0.85),
          opacity: read,
        }}
      >
        t = 2,560000000 S
      </div>

      <Note
        text="satu pulsa, satu angka."
        x={L.left + 700}
        y={392}
        to={[L.left + L.measure * 0.62, 566]}
        on={read}
        width={300}
        size={SZ.small}
      />

      {/* the three numbers, as a row of readings */}
      <div style={{opacity: numbers}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1032,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.22),
          }}
        />
        <Figure value="PICO" x={L.left} y={1064} size={76} unit="DETIK" unitColor={alpha(P.accent, 0.9)} tracking={0.01} />
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1164,
            width: 360,
            fontFamily: T.italic,
            fontStyle: 'italic',
            fontSize: SZ.body,
            lineHeight: 1.3,
            color: alpha(P.muted, 0.92),
          }}
        >
          10⁻¹² detik.
          <br />
          Satu pikodetik = 0,3 mm cahaya.
        </div>
      </div>

      {/* the resolution, as a linear micrometer: 0–10 mm with the needle at 3.
          A dial would hide the point — that 3 mm is a sliver of the baseline. */}
      <div style={{opacity: gauge}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={GX0} y1={GY} x2={GX1} y2={GY} stroke={alpha(P.ink, 0.4)} strokeWidth={1.2} />
          {Array.from({length: 41}).map((_, i) => {
            const x = GX0 + ((GX1 - GX0) * i) / 40;
            const big = i % 10 === 0;
            const mid = i % 5 === 0;
            return (
              <line
                key={i}
                x1={x}
                y1={GY}
                x2={x}
                y2={GY - (big ? 30 : mid ? 20 : 11)}
                stroke={alpha(P.ink, big ? 0.72 : mid ? 0.44 : 0.2)}
                strokeWidth={1}
              />
            );
          })}
          {/* the needle sits where the measurement lands */}
          <g transform={`translate(${GX0 + ((GX1 - GX0) * needle) / 10} 0)`}>
            <line x1={0} y1={GY - 62} x2={0} y2={GY + 34} stroke={P.accent} strokeWidth={2} />
            <path d={`M-8 ${GY - 62} L8 ${GY - 62} L0 ${GY - 50} Z`} fill={P.accent} />
          </g>
        </svg>
        <div
          style={{
            position: 'absolute',
            left: GX0,
            top: GY + 52,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.26em',
            color: alpha(P.muted, 0.68),
          }}
        >
          0
        </div>
        <div
          style={{
            position: 'absolute',
            left: GX1 - 80,
            width: 80,
            top: GY + 52,
            textAlign: 'right',
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.26em',
            color: alpha(P.muted, 0.68),
          }}
        >
          10 MM
        </div>
        <div
          style={{
            position: 'absolute',
            left: GX0 + ((GX1 - GX0) * needle) / 10 - 120,
            width: 240,
            top: GY - 130,
            textAlign: 'center',
            fontFamily: T.display,
            fontSize: 96,
            fontWeight: 300,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: P.ink,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {needle.toFixed(1).replace('.', ',')}
        </div>
        <div
          style={{
            position: 'absolute',
            left: GX0,
            top: GY + 104,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.3em',
            color: alpha(P.accent, 0.9),
          }}
        >
          KETELITIAN JARAK · MILIMETER
        </div>
      </div>

      {/* the arithmetic that turns a clock into a ruler, stated once */}
      <div style={{opacity: read}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1320,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.14),
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1348,
            fontFamily: T.display,
            fontSize: 62,
            fontWeight: 300,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            color: P.ink,
          }}
        >
          1 mm pergi-pulang = <span style={{color: P.accent}}>6,7 pikodetik</span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1436,
            fontFamily: T.mono,
            fontSize: 16,
            letterSpacing: '0.24em',
            color: alpha(P.muted, 0.62),
          }}
        >
          2 × 1 mm ÷ 299.792 km/s
        </div>
      </div>

      {/* the baseline, for scale: 384.400 km with 3 mm marked */}
      <div style={{opacity: read}}>
        <Ticks
          x0={L.left}
          x1={L.right}
          y={1596}
          n={120}
          major={20}
          height={20}
          reveal={1}
          color={alpha(P.ink, 0.5)}
          labels={['0', '64.000', '128.000', '192.000', '256.000', '320.000', '384.400']}
        />
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1658,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.26em',
            color: alpha(P.muted, 0.7),
          }}
        >
          KILOMETER
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.right - 300,
            top: 1658,
            fontFamily: T.italic,
            fontStyle: 'italic',
            fontSize: SZ.small,
            color: alpha(P.accent, 0.9),
          }}
        >
          3 mm dari 384.400 km = 1 : 10¹¹
        </div>
      </div>

      <Brackets x0={L.left - 26} y0={314} x1={L.right + 26} y1={946} len={22} on={frameOn * 0.7} />
      <Source text="LUNAR LASER RANGING · APOLLO 15 ARRAY · 1971–SEKARANG" on={rev(local, 4.4, 0.9)} y={1738} />
    </Stage>
  );
};

export default Compo;
