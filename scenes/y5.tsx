/* y5 — satu foton pulang
   One in a hundred million. Drawn as a departure field: every mark is a photon
   that left, the field is nearly all dark, and exactly one mark is cyan because
   it came back. The ratio is set as the picture, not as a caption.

   The field assembles in a wave from the left, so the eye can count a little
   before it gives up — which is the point of the number. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, Figure, Label, L, Note, P, SZ, Source, Stage, Status, T, alpha, clamp, hash, rev,
} from './bulan';

const COLS = 62;
const ROWS = 26;
const X0 = L.left;
const Y0 = 470;
const CELL = (L.measure / COLS);

export const Compo: React.FC<SceneProps> = ({local}) => {
  const field = clamp((local - 0.15) / 2.3);
  const survivor = rev(local, 2.2, 0.8);
  const ratio = rev(local, 2.7, 1.0);
  const note = rev(local, 3.4, 1.0);

  // the one that returns: a fixed cell, chosen once, never re-rolled
  const rCol = 43;
  const rRow = 9;

  const dots: React.ReactNode[] = [];
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const i = c * ROWS + r;
      // staggered so the field fills like a scan, not like a fade
      const p = clamp(field * 1.35 - (c / COLS) * 0.75);
      if (p <= 0) continue;
      const isOne = c === rCol && r === rRow;
      const jx = (hash(c, r, 9) - 0.5) * CELL * 0.22;
      const jy = (hash(c, r, 12) - 0.5) * CELL * 0.22;
      const a = 0.055 + hash(c, r, 3) * 0.16;
      dots.push(
        <rect
          key={i}
          x={X0 + c * CELL + CELL * 0.34 + jx}
          y={Y0 + r * CELL + CELL * 0.34 + jy}
          width={isOne ? 9 : 3.1}
          height={isOne ? 9 : 3.1}
          fill={isOne ? P.alt : P.ink}
          opacity={(isOne ? survivor : a) * p}
        />
      );
    }
  }

  return (
    <Stage grid={0.22} gridCell={196} paper={0.4} dustSeed={5} shade={0.92}>
      <Label text="FOTON · BERANGKAT & KEMBALI" y={L.top} on={rev(local, 0, 0.8)} />
      <Label text={`${(COLS * ROWS).toLocaleString('id-ID')} TITIK · SATU KEMBALI`} y={L.top} x={L.right - 520} rule={26} on={rev(local, 1.2, 0.9)} size={15} color={alpha(P.muted, 0.75)} />

      {/* the field */}
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        {dots}
        {/* the survivor's return path, drawn only once it has been found */}
        <line
          x1={X0 + rCol * CELL + 10}
          y1={Y0 + rRow * CELL + 4}
          x2={X0 + rCol * CELL + 96}
          y2={Y0 + rRow * CELL - 46}
          stroke={alpha(P.alt, 0.5 * survivor)}
          strokeWidth={1}
          strokeDasharray="3 7"
        />
        <circle
          cx={X0 + rCol * CELL + 4}
          cy={Y0 + rRow * CELL + 4}
          r={16 * survivor}
          fill="none"
          stroke={alpha(P.alt, 0.75)}
          strokeWidth={1.2}
        />
      </svg>

      <Brackets x0={X0 - 18} y0={Y0 - 18} x1={L.right + 18} y1={Y0 + ROWS * CELL + 18} len={20} on={field * 0.55} />

      <Note
        text="satu ditangkap."
        x={X0 + rCol * CELL + 102}
        y={Y0 + rRow * CELL - 48}
        on={survivor}
        width={300}
        size={SZ.small}
        color={alpha(P.alt, 0.95)}
      />

      {/* the ratio, as the plate's answer */}
      <div style={{opacity: ratio}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1216,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.2),
          }}
        />
        <Figure value="1" x={L.left} y={1246} size={172} unit="/ 100.000.000" unitColor={alpha(P.accent, 0.9)} tracking={-0.05} />
        <div
          style={{
            position: 'absolute',
            left: L.left + 470,
            top: 1290,
            fontFamily: T.italic,
            fontStyle: 'italic',
            fontSize: SZ.sub,
            lineHeight: 1.3,
            width: 660,
            color: alpha(P.muted, 0.95),
          }}
        >
          Sembilan dari sepuluh foton hilang di cermin,
          <br />
          di debu, di atmosfer.
        </div>
      </div>

      {/* the timeline of the round trip: what 2,56 s actually is */}
      <div style={{opacity: note}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1476,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.32em',
            color: alpha(P.muted, 0.68),
          }}
        >
          SATU PULANG-PERGI
        </div>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={L.left} y1={1530} x2={L.right} y2={1530} stroke={alpha(P.ink, 0.24)} strokeWidth={1} />
          {[
            {f: 0, t: 'LASER'},
            {f: 0.5, t: 'BULAN'},
            {f: 1, t: 'KEMBALI'},
          ].map((m, i) => (
            <g key={i}>
              <line x1={L.left + (L.measure * m.f)} y1={1518} x2={L.left + (L.measure * m.f)} y2={1544} stroke={alpha(P.ink, 0.6)} strokeWidth={1} />
              <circle cx={L.left + L.measure * m.f} cy={1530} r={4} fill={i === 1 ? P.warm : P.alt} />
            </g>
          ))}
        </svg>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1560,
            width: L.measure,
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.26em',
            color: alpha(P.muted, 0.7),
          }}
        >
          <span>0,00 S</span>
          <span>1,28 S</span>
          <span>2,56 S</span>
        </div>
      </div>

      <Status text="TERUKUR SETIAP MALAM" x={L.left} y={1660} on={rev(local, 4.0, 0.8)} />
      <Source text="APOLLO LUNAR SURFACE EXPERIMENTS · McDONALD OBSERVATORY" on={rev(local, 4.3, 0.9)} y={1738} />
    </Stage>
  );
};

export default Compo;
