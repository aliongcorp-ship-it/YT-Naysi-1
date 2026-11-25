/* y14 — bulan tergantung
   The end state, drawn from the Moon's own ground: Earth hangs in one place and
   never rises or sets, because the Moon's face is locked to us already.

   The shot is a horizon: ground at the bottom, empty sky above, Earth as the only
   object, held at a fixed height for the whole shot. Nothing travels — that is
   the argument. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, EarthDisc, Label, L, MoonGround, Note, P, SZ, Source, Stage, Stars, T, Ticks, alpha, breathe, rev,
} from './bulan';

const EX = 760;
const EY = 730;
const ER = 128;
const HORIZON = 1560;

export const Compo: React.FC<SceneProps> = ({local}) => {
  const on = rev(local, 0, 1.0);
  const earth = rev(local, 0.5, 1.4);
  const hang = rev(local, 1.8, 1.2);
  const note = rev(local, 2.8, 1.2);
  const noRise = rev(local, 4.0, 1.2);

  // the only motion: the Earth turns in place, slowly, and does not move
  const spin = local * 1.6;

  return (
    <Stage grid={0} paper={0.42} dust={0.5} dustSeed={14} shade={0.96}>
      <Stars n={340} h={1500} seed={14} twinkle opacity={0.9} />
      <Label text="DARI PERMUKAAN BULAN · SISI YANG SAMA" y={L.top} on={on} />

      <div style={{opacity: earth}}>
        <EarthDisc cx={EX} cy={EY} r={ER} on={1} spin={spin} meridian detail={0.8} />
        {/* the halo is a ring, not a glow */}
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <circle cx={EX} cy={EY} r={ER + 22} fill="none" stroke={alpha(P.alt, 0.22)} strokeWidth={1} />
          <circle cx={EX} cy={EY} r={ER + 54} fill="none" stroke={alpha(P.alt, 0.1)} strokeWidth={1} strokeDasharray="2 10" />
        </svg>
      </div>

      {/* the fixed height, measured against the horizon */}
      <div style={{opacity: hang}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={EX} y1={EY + ER + 60} x2={EX} y2={HORIZON} stroke={alpha(P.accent, 0.4)} strokeWidth={1} strokeDasharray="5 9" />
          <line x1={EX - 26} y1={HORIZON} x2={EX + 26} y2={HORIZON} stroke={alpha(P.accent, 0.7)} strokeWidth={1.4} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: EX + 44,
            top: HORIZON - 160,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.28em',
            color: alpha(P.accent, 0.85),
          }}
        >
          SELALU DI TITIK YANG SAMA
        </div>
      </div>

      <div style={{transform: `translateY(${breathe(local, 1.2, 0.08)}px)`}}>
        <MoonGround y={HORIZON} rocks={14} seed={14} />
      </div>

      <Note
        text="Bulan sudah terkunci: satu putaran satu putaran orbit. Tidak ada matahari terbit di sana."
        x={L.left + 8}
        y={1296}
        side="right"
        width={560}
        on={note}
        size={SZ.body}
        color={alpha(P.muted, 0.9)}
      />

      {/* the no-more-earthrise statement, set as a conclusion */}
      <div style={{opacity: noRise}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1120,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.22),
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1152,
            width: 780,
            fontFamily: T.display,
            fontSize: 50,
            fontWeight: 300,
            lineHeight: 1.18,
            letterSpacing: '-0.02em',
            color: P.ink,
          }}
        >
          Suatu hari, Bumi
          <span style={{fontStyle: 'italic', color: P.accent}}> berhenti terbit</span>.
        </div>
      </div>

      <Ticks x0={L.left} x1={L.right} y={1064} n={40} major={8} height={14} reveal={hang} color={alpha(P.ink, 0.3)} />
      <Brackets x0={L.left - 16} y0={L.top + 60} x1={L.right + 16} y1={HORIZON - 40} len={22} on={on * 0.4} />
      <Source text="SISI DEKAT BULAN SELALU SAMA · LIBRASI ± 6°" on={rev(local, 5.2, 0.9)} y={1738} />
    </Stage>
  );
};

export default Compo;
