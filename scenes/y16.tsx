/* y16 — langit malam
   The close. The sky, the Moon a little further away than it was, and the three
   facts the film is willing to leave the viewer with — set as a numbered list,
   because the film's argument was ordered and its ending should be too.

   The Moon recedes by a visible amount across the shot and by a real amount in
   the caption. The last frame holds. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, Label, L, MoonDisc, Note, P, SZ, Source, Stage, Stars, T,
  alpha, lerp, rev,
} from './bulan';

export const Compo: React.FC<SceneProps> = ({local}) => {
  const sky = rev(local, 0, 1.2);
  const drift = rev(local, 0.6, 6.0);
  const lines = rev(local, 2.2, 1.0);
  const last = rev(local, 4.0, 1.2);

  // the Moon loses 26 px of apparent size across the shot
  const r = lerp(58, 46, drift);
  const mx = lerp(1004, 1030, drift);
  const my = lerp(560, 546, drift);

  return (
    <Stage grid={0} paper={0.42} dust={0.34} dustSeed={16} shade={0.97}>
      <Stars n={360} h={2000} seed={16} twinkle opacity={0.95} />

      <div style={{opacity: sky}}>
        <MoonDisc cx={mx} cy={my} r={r} detail={0.5} seed={41} />
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <circle cx={mx} cy={my} r={r + 30} fill="none" stroke={alpha(P.warm, 0.16)} strokeWidth={1} />
        </svg>
      </div>

      {/* the three findings, numbered, as the film's own index */}
      <div style={{opacity: lines}}>
        <Label text="YANG TERSISA" y={900} on={lines} />
        {[
          ['01', 'Bulan menjauh', '3,8 cm per tahun, terukur laser sejak 1969.'],
          ['02', 'Bumi melambat', '1,8 ms per abad; hari bertambah, bukan tahun.'],
          ['03', 'Gerhana akan berakhir', 'Total hanya selama dua piringan masih sama.'],
        ].map(([n, head, sub], i) => (
          <div key={n} style={{position: 'absolute', left: L.left, top: 962 + i * 196, width: L.measure}}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 4,
                fontFamily: T.mono,
                fontSize: 15,
                letterSpacing: '0.28em',
                color: alpha(P.accent, 0.85),
              }}
            >
              {n}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 84,
                top: -6,
                fontFamily: T.display,
                fontSize: 46,
                fontWeight: 300,
                letterSpacing: '-0.02em',
                color: P.ink,
                lineHeight: 1.1,
              }}
            >
              {head}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 84,
                top: 62,
                width: 900,
                fontFamily: T.italic,
                fontStyle: 'italic',
                fontSize: SZ.small,
                lineHeight: 1.3,
                color: alpha(P.muted, 0.88),
              }}
            >
              {sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{opacity: last}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1570,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.24),
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1602,
            width: 1020,
            fontFamily: T.display,
            fontSize: 66,
            fontWeight: 300,
            lineHeight: 1.14,
            letterSpacing: '-0.025em',
            color: P.ink,
          }}
        >
          Tengadah malam ini.
          <br />
          Bulan sudah <span style={{fontStyle: 'italic', color: P.accent}}>lebih jauh</span> dari kemarin.
        </div>
      </div>

      <Note
        text="3,8 cm · kira-kira selebar kuku Anda"
        x={L.right}
        y={700}
        side="left"
        width={400}
        on={sky * 0.9}
        size={SZ.small}
        color={alpha(P.muted, 0.72)}
      />

      <Brackets x0={L.left - 16} y0={866} x1={L.right + 16} y1={1620} len={22} on={lines * 0.4} />
      <Source text="NASA/JPL · APOLLO LUNAR SURFACE EXPERIMENTS · LLR · WELLS 1963" on={rev(local, 5.2, 1.0)} y={1738} />
    </Stage>
  );
};

export default Compo;
