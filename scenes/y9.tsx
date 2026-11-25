/* y9 — 24 vs 22 jam
   The bill. Two dials turn at the same rate — a day now, a day 400 million years
   ago — and the wedge between them is the whole cost of the Moon's retreat.

   The shot is built so the eye compares the two hands before it reads a word. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, Counter, Dial, Figure, Label, L, Note, P, SZ, Source, Stage, T, alpha, breathe, clamp, rev,
} from './bulan';

const CY = 830;
const R = 268;

export const Compo: React.FC<SceneProps> = ({local}) => {
  const on = rev(local, 0, 0.9);
  const turn = clamp((local - 0.35) / 4.6);        // one shared rotation
  const wedge = rev(local, 2.7, 0.9);
  const rate = rev(local, 3.1, 0.9);
  const note = rev(local, 3.7, 0.9);

  return (
    <Stage grid={0.3} gridCell={128} paper={0.42} dustSeed={9} shade={0.9}>
      <Label text="HARI · SEKARANG & 400 JUTA TAHUN LALU" y={L.top} on={on} />

      <Dial cx={L.left + 268} cy={CY} r={R} hours={24} turn={turn} title="SEKARANG" sub="24 JAM" on={on} color={P.ink} accent={P.accent} ticks={24} />
      <Dial cx={L.right - 268} cy={CY} r={R} hours={22} turn={turn} title="400 JUTA TAHUN LALU" sub="22 JAM" on={on} color={alpha(P.ink, 0.72)} accent={P.hot} ticks={22} />

      {/* the wedge: what the missing two hours look like on a dial */}
      <div style={{opacity: wedge}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={L.left + 268} y1={CY - R - 34} x2={L.left + 268} y2={CY - R + 46} stroke={alpha(P.accent, 0.8)} strokeWidth={1.6} />
          <line x1={L.right - 268} y1={CY - R - 34} x2={L.right - 268} y2={CY - R + 46} stroke={alpha(P.hot, 0.8)} strokeWidth={1.6} />
          <line x1={L.left + 268} y1={CY - R - 34} x2={L.right - 268} y2={CY - R - 34} stroke={alpha(P.ink, 0.3)} strokeWidth={1} strokeDasharray="4 8" />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: L.left + 268,
            width: 640,
            top: CY - R - 92,
            textAlign: 'center',
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.32em',
            color: alpha(P.muted, 0.75),
          }}
        >
          SELISIH 2 JAM PER HARI
        </div>
      </div>

      {/* the rate, quoted small, because it is the cause and not the headline */}
      <div style={{opacity: rate}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1368,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.22),
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1400,
            fontFamily: T.display,
            fontSize: 96,
            fontWeight: 300,
            letterSpacing: '-0.03em',
            color: P.ink,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          <Counter from={0} to={1.8} at={3.1} dur={1.0} local={local} digits={1} sep={false} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left + 250,
            top: 1412,
            fontFamily: T.mono,
            fontSize: 18,
            letterSpacing: '0.3em',
            color: alpha(P.accent, 0.95),
          }}
        >
          MILIDETIK / ABAD
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left + 250,
            top: 1452,
            width: 620,
            fontFamily: T.italic,
            fontStyle: 'italic',
            fontSize: SZ.body,
            lineHeight: 1.36,
            color: alpha(P.muted, 0.9),
          }}
        >
          Bumi melambat karena harus menyeret pasangnya sendiri.
        </div>
      </div>

      <Note
        text="dua jam lebih pendek, bukan dua menit."
        x={L.left}
        y={1590}
        on={note}
        width={720}
        size={SZ.body}
        color={alpha(P.muted, 0.92)}
      />

      <Brackets x0={L.left - 12} y0={430} x1={L.right + 12} y1={1230} len={22} on={on * 0.5} />
      <Source text="DARI REKAMAN PASANG & KARANG · LAJU 1,8 MS/ABAD" on={rev(local, 4.2, 0.9)} y={1738} />
    </Stage>
  );
};

export default Compo;
