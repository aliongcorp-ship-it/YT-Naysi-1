/* y7 — dua pasang, satu poros
   The mechanism, drawn on the plate. Earth in section, two bulges, the Moon to
   the right. First the bulges sit on the Earth–Moon line (axis 0), then they
   swing ahead of it, and the arc between the two axes is the lead.

   The shot is deliberately the slowest in the film: two states, one rotation,
   and a label that names what moved. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, Label, L, Note, P, SZ, Source, Stage, T, TideDiagram, alpha, clamp, eInOut, lerp, rev,
} from './bulan';

const EX = 470;
const EY = 900;
const ER = 232;
const MX = 1180;
const MY = 700;
const MR = 96;

export const Compo: React.FC<SceneProps> = ({local}) => {
  const base = rev(local, 0, 1.1);
  const swing = eInOut(clamp((local - 1.3) / 1.8));
  const axis = 24 * swing;              // the lead, in degrees
  const arrow = rev(local, 3.1, 1.0);
  const label = rev(local, 3.4, 1.0);
  const both = rev(local, 4.0, 1.0);

  return (
    <Stage grid={0.26} gridCell={156} paper={0.44} dustSeed={7} shade={0.9}>
      <Label text="PASANG · POTONGAN KHATULISTIWA" y={L.top} on={base} />

      <TideDiagram
        ex={EX}
        ey={EY}
        er={ER}
        mx={MX}
        my={MY}
        mr={MR}
        axis={axis}
        on={base}
        arrows={arrow}
      />

      {/* the two named bulges, labelled once they exist */}
      <div style={{opacity: swing}}>
        <div
          style={{
            position: 'absolute',
            left: EX + 380,
            top: EY - 36,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.28em',
            color: alpha(P.alt, 0.85),
          }}
        >
          PASANG DEPAN
        </div>
        <div
          style={{
            position: 'absolute',
            left: EX - 560,
            top: EY - 36,
            width: 300,
            textAlign: 'right',
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.28em',
            color: alpha(P.alt, 0.6),
          }}
        >
          PASANG BELAKANG
        </div>
      </div>

      {/* the rotation, named */}
      <div style={{opacity: label}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <path
            d={`M${EX} ${EY - ER - 76} A${ER + 76} ${ER + 76} 0 0 1 ${EX + ER + 52} ${EY - 30}`}
            fill="none"
            stroke={alpha(P.warm, 0.55)}
            strokeWidth={1.5}
          />
          <path
            d={`M${EX + ER + 52} ${EY - 30} l-22 -4 l10 20`}
            fill="none"
            stroke={alpha(P.warm, 0.8)}
            strokeWidth={1.8}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: EX + 96,
            top: EY - ER - 118,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.3em',
            color: alpha(P.warm, 0.85),
          }}
        >
          BUMI BERPUTAR
        </div>
        <div
          style={{
            position: 'absolute',
            left: EX + 96,
            top: EY - ER - 92,
            fontFamily: T.italic,
            fontStyle: 'italic',
            fontSize: SZ.small,
            color: alpha(P.muted, 0.85),
          }}
        >
          sekali per 24 jam
        </div>
      </div>

      {/* the lead angle, quoted as the one number in the shot */}
      <div style={{opacity: both}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1300,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.22),
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1330,
            fontFamily: T.display,
            fontSize: 108,
            fontWeight: 300,
            letterSpacing: '-0.035em',
            color: P.ink,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {axis.toFixed(1).replace('.', ',')}°
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left + 300,
            top: 1342,
            width: 700,
            fontFamily: T.mono,
            fontSize: 16,
            letterSpacing: '0.26em',
            lineHeight: 1.9,
            color: alpha(P.muted, 0.8),
          }}
        >
          SUDUT MENDAHULUI
          <br />
          GARIS BUMI–BULAN
        </div>

        <Note
          text="Air butuh waktu untuk mengikuti. Jadi pasang selalu sedikit di depan, bukan tepat di bawah Bulan."
          x={L.left}
          y={1520}
          side="right"
          width={980}
          on={both}
          size={SZ.body}
          color={alpha(P.muted, 0.9)}
        />
      </div>

      <Brackets x0={L.left - 20} y0={300} x1={L.right + 20} y1={1180} len={24} on={base * 0.6} />
      <Source text="DIAGRAM SKEMATIS · SKALA TINGGI PASANG DIPERBESAR" on={rev(local, 4.4, 0.9)} y={1738} />
    </Stage>
  );
};

export default Compo;
