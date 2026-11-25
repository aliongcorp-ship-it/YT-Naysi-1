/* y11 — karang & garis harian
   The evidence that the day was shorter: fossil coral. A section, cut as a
   printed plate, with annual bands as rows and daily growth lines inside them.
   The lines are counted by a travelling rule, because counting is the argument.

   The section is the picture; the labels stay off it until the count lands. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, CoralSection, Counter, Label, L, Note, P, SZ, Source, Stage, T, alpha, clamp, rev,
} from './bulan';

const X0 = L.left + 30;
const X1 = L.right - 20;
const Y0 = 470;
const ROW_H = 118;
const YEARS = 3;

export const Compo: React.FC<SceneProps> = ({local}) => {
  const on = rev(local, 0, 0.8);
  const reveal = clamp((local - 0.5) / 3.0);
  const rule = rev(local, 2.6, 1.2);
  const count = rev(local, 3.2, 1.0);
  const doubt = rev(local, 4.6, 1.0);

  // the counting rule travels across one band
  const travel = clamp((local - 2.8) / 1.8);
  const rx = X0 + (X1 - X0) * travel;

  return (
    <Stage grid={0.18} gridCell={208} paper={0.5} dustSeed={11} shade={0.92}>
      <Label text="SAYATAN KARANG FOSIL · DEVON" y={L.top} on={on} />

      <CoralSection x0={X0} x1={X1} y0={Y0} years={YEARS} daysPerYear={400} reveal={reveal} on={on} markYear={1} seed={11} />

      {/* the three year lines, labelled at the right edge only */}
      <div style={{opacity: on * 0.9}}>
        {Array.from({length: YEARS}).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: X1 + 18,
              top: Y0 + i * ROW_H + (i === 0 ? 40 : 34),
              fontFamily: T.mono,
              fontSize: 14,
              letterSpacing: '0.24em',
              color: alpha(P.muted, 0.6),
            }}
          >
            {i === 1 ? 'TAHUN' : ''}
          </div>
        ))}
      </div>

      {/* the counting rule */}
      <div style={{opacity: rule}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={X0} y1={Y0 - 26} x2={X1} y2={Y0 - 26} stroke={alpha(P.warm, 0.42)} strokeWidth={1} />
          <g transform={`translate(${rx} 0)`}>
            <line x1={0} y1={Y0 - 46} x2={0} y2={Y0 + YEARS * ROW_H + 18} stroke={P.accent} strokeWidth={1.6} />
            <path d={`M-8 ${Y0 - 46} L8 ${Y0 - 46} L0 ${Y0 - 34} Z`} fill={P.accent} />
          </g>
        </svg>
        <div
          style={{
            position: 'absolute',
            left: Math.min(rx + 16, X1 - 320),
            top: Y0 + YEARS * ROW_H + 26,
            fontFamily: T.mono,
            fontSize: SZ.small,
            letterSpacing: '0.22em',
            color: P.accent,
          }}
        >
          {Math.round(400 * travel).toLocaleString('id-ID')} GARIS
        </div>
      </div>

      {/* the count, as the finding */}
      <div style={{opacity: count}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1000,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.24),
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1036,
            fontFamily: T.display,
            fontSize: 148,
            fontWeight: 300,
            letterSpacing: '-0.045em',
            lineHeight: 1,
            color: P.ink,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <Counter from={0} to={400} at={3.2} dur={1.5} local={local} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left + 430,
            top: 1094,
            fontFamily: T.mono,
            fontSize: 18,
            letterSpacing: '0.3em',
            lineHeight: 1.8,
            color: alpha(P.accent, 0.95),
          }}
        >
          GARIS / TAHUN
          <br />
          <span style={{color: alpha(P.muted, 0.68)}}>SEKARANG: 365</span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1250,
            width: 980,
            fontFamily: T.italic,
            fontStyle: 'italic',
            fontSize: SZ.sub,
            lineHeight: 1.34,
            color: alpha(P.muted, 0.94),
          }}
        >
          Tiap garis adalah satu hari. Karang menghitung
          <br />
          apa yang tidak bisa dihitung Bulan.
        </div>
      </div>

      {/* the honest caveat, set small and late, because the claim is physical */}
      <Note
        text="Seksi sayatan: tebal tiap baris tidak sebanding skala."
        x={L.left}
        y={1500}
        on={doubt}
        width={760}
        size={SZ.small}
        color={alpha(P.muted, 0.72)}
      />

      <Brackets x0={X0 - 18} y0={Y0 - 14} x1={X1 + 18} y1={Y0 + YEARS * ROW_H + 14} len={20} on={on * 0.5} />
      <Source text="KARANG DEVON · WELLS 1963 · GARIS PERTUMBUHAN HARIAN" on={rev(local, 4.9, 0.9)} y={1738} />
    </Stage>
  );
};

export default Compo;
