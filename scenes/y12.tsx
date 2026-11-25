/* y12 — 400 vs 365 hari
   The comparison, forced. Two columns of day-marks: 400 in the left band, 365 in
   the right, drawn as actual countable strokes rather than as bars. The missing
   35 are the visible gap at the bottom, and they are the only thing in rust.

   A bar chart would say "less"; the strokes say "thirty-five days gone". */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, Figure, Label, L, Note, P, SZ, Source, Stage, Span, T, alpha, clamp, hash, rev,
} from './bulan';

const COL_W = 420;
const LX = L.left + 60;
const RX = L.left + 620;
const TOP = 470;
const BOTTOM = 1360;
const PER_ROW = 20;                // 20 marks per row, 20 rows = 400
const CELL_W = COL_W / PER_ROW;
const CELL_H = 34;

export const Compo: React.FC<SceneProps> = ({local}) => {
  const on = rev(local, 0, 0.8);
  const left = clamp((local - 0.4) / 2.4);
  const right = clamp((local - 2.6) / 2.2);
  const gap = rev(local, 4.4, 1.0);
  const fig = rev(local, 5.0, 1.0);

  const marks = (n: number, p: number, x: number, color: string, seed: number) => {
    const out: React.ReactNode[] = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / PER_ROW);
      const c = i % PER_ROW;
      const local_ = clamp(p * 1.4 - (i / n) * 0.6);
      if (local_ <= 0) continue;
      out.push(
        <rect
          key={i}
          x={x + c * CELL_W + CELL_W * 0.2}
          y={TOP + r * CELL_H + hash(i, seed, 4) * 3}
          width={CELL_W * 0.5}
          height={CELL_H * 0.42}
          fill={color}
          opacity={local_ * (0.55 + hash(i, 1, seed) * 0.4)}
        />
      );
    }
    return out;
  };

  return (
    <Stage grid={0.24} gridCell={160} paper={0.4} dustSeed={12} shade={0.92}>
      <Label text="HARI DALAM SATU TAHUN" y={L.top} on={on} />

      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        {marks(400, left, LX, P.warm, 12)}
        {marks(365, right, RX, P.ink, 13)}
        {/* the missing band, marked at the bottom of the left column */}
        {gap > 0 ? (
          <>
            <rect
              x={LX - 8}
              y={TOP + 18 * CELL_H + 18}
              width={COL_W + 16}
              height={CELL_H * 2 + 4}
              fill={alpha(P.hot, 0.1 * gap)}
              stroke={alpha(P.hot, 0.55 * gap)}
              strokeWidth={1}
            />
            <line x1={LX - 8} y1={TOP + 18 * CELL_H + 18} x2={LX + COL_W + 8} y2={TOP + 18 * CELL_H + 18} stroke={alpha(P.hot, 0.7 * gap)} strokeWidth={1} />
          </>
        ) : null}
      </svg>

      {/* column heads */}
      <div style={{opacity: on}}>
        <div
          style={{
            position: 'absolute',
            left: LX,
            top: BOTTOM + 30,
            fontFamily: T.display,
            fontSize: 74,
            fontWeight: 300,
            letterSpacing: '-0.03em',
            color: P.ink,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          400
        </div>
        <div
          style={{
            position: 'absolute',
            left: LX,
            top: BOTTOM + 104,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.28em',
            color: alpha(P.muted, 0.72),
          }}
        >
          HARI · 400 JUTA TAHUN LALU
        </div>
        <div
          style={{
            position: 'absolute',
            left: RX,
            top: BOTTOM + 30,
            fontFamily: T.display,
            fontSize: 74,
            fontWeight: 300,
            letterSpacing: '-0.03em',
            color: P.ink,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          365
        </div>
        <div
          style={{
            position: 'absolute',
            left: RX,
            top: BOTTOM + 104,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.28em',
            color: alpha(P.muted, 0.72),
          }}
        >
          HARI · SEKARANG
        </div>
      </div>

      {/* the difference, stated once */}
      <div style={{opacity: fig}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1560,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.24),
          }}
        />
        <Figure value="35" x={L.left} y={1586} size={96} unit="HARI HILANG" unitColor={alpha(P.hot, 0.95)} />
        <Note
          text="Tahunnya tidak memendek. Yang memanjang adalah harinya."
          x={L.left + 520}
          y={1612}
          side="right"
          width={640}
          size={SZ.small}
          on={fig}
          color={alpha(P.muted, 0.88)}
        />
      </div>

      <Span x0={LX} x1={LX + COL_W} y={TOP - 40} label="400" reveal={left} on={left * 0.7} size={SZ.small} />
      <Span x0={RX} x1={RX + COL_W} y={TOP - 40} label="365" reveal={right} on={right * 0.7} size={SZ.small} color={alpha(P.ink, 0.5)} />

      <Brackets x0={L.left - 10} y0={TOP - 72} x1={L.right + 10} y1={BOTTOM + 8} len={22} on={on * 0.45} />
      <Source text="WELLS 1963 · KARANG DEVON · 400 HARI PER TAHUN" on={rev(local, 5.4, 0.9)} y={1738} />
    </Stage>
  );
};

export default Compo;
