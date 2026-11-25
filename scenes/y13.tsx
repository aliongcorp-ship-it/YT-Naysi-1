/* y13 — busur & gerhana
   Why the retreat matters to a viewer: the total solar eclipse is a coincidence
   of two angular sizes, and one of them is shrinking.

   Two discs, drawn at the angular scale they hold in the sky (the Sun's is
   fixed at 0,53°, the Moon's starts at 0,55° and falls), with the arc that
   measures the overlap. As the Moon's disc shrinks the ring closes, and the
   number under it counts the years down. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, Counter, Figure, Label, L, MoonDisc, Note, P, SZ, Source, Stage, T, alpha, clamp, lerp, rev, smooth,
} from './bulan';

const CX = 470;
const CY = 646;
// px per degree: the Sun's 0,53° is drawn at 300 px radius, so 566 px/deg
const PPK = 300 / 0.53;

export const Compo: React.FC<SceneProps> = ({local}) => {
  const on = rev(local, 0, 0.8);
  const draw = rev(local, 0.4, 1.2);
  const shrink = clamp((local - 1.4) / 4.0);
  // the Moon's angular diameter falls from 0,552 to 0,508 over the shot
  const moonDeg = lerp(0.552, 0.508, smooth(shrink));
  const sunDeg = 0.532;
  const cover = clamp(moonDeg / sunDeg);
  const ring = rev(local, 4.2, 1.2);
  const num = rev(local, 4.6, 1.0);

  return (
    <Stage grid={0.2} gridCell={192} paper={0.4} dustSeed={13} shade={0.94}>
      <Label text="UKURAN SUDUT · GERHANA TOTAL" y={L.top} on={on} />

      {/* the Sun, fixed */}
      <div style={{opacity: draw}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <circle cx={CX} cy={CY} r={300} fill={alpha(P.warm, 0.07)} stroke={alpha(P.warm, 0.5)} strokeWidth={1.2} />
          <circle cx={CX} cy={CY} r={300 * cover} fill="#0B0C11" stroke={alpha(P.ink, 0.28)} strokeWidth={1} />
          {/* the corona, drawn as radial hairlines rather than as a glow */}
          {Array.from({length: 96}).map((_, i) => {
            const a = (i / 96) * Math.PI * 2;
            const r0 = 300;
            const r1 = 300 + 26 + Math.abs(Math.sin(i * 2.7)) * 46;
            return (
              <line
                key={i}
                x1={CX + Math.cos(a) * r0}
                y1={CY + Math.sin(a) * r0}
                x2={CX + Math.cos(a) * r1}
                y2={CY + Math.sin(a) * r1}
                stroke={alpha(P.warm, 0.32)}
                strokeWidth={1}
                opacity={ring}
              />
            );
          })}
          {/* the rim: the thin remaining ring */}
          {ring > 0 ? (
            <circle cx={CX} cy={CY} r={300 + 6} fill="none" stroke={alpha(P.hot, 0.7 * ring)} strokeWidth={2.4} strokeDasharray="1 3" />
          ) : null}
        </svg>

      </div>

      {/* the angular readout, right column */}
      <div style={{opacity: on}}>
        <div style={{position: 'absolute', left: 900, top: 470}}>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 15,
              letterSpacing: '0.32em',
              color: alpha(P.muted, 0.7),
            }}
          >
            DIAMETER SUDUT BULAN
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: T.display,
              fontSize: 132,
              fontWeight: 300,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              color: P.ink,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {moonDeg.toFixed(3).replace('.', ',')}°
          </div>
          <div
            style={{
              marginTop: 20,
              fontFamily: T.mono,
              fontSize: 16,
              letterSpacing: '0.26em',
              color: alpha(P.accent, 0.9),
            }}
          >
            MENYUSUT {((1 - moonDeg / 0.552) * 100).toFixed(1).replace('.', ',')}%
          </div>
          <div
            style={{
              marginTop: 46,
              width: 420,
              height: 1,
              background: alpha(P.ink, 0.24),
            }}
          />
          <div
            style={{
              marginTop: 28,
              width: 420,
              fontFamily: T.italic,
              fontStyle: 'italic',
              fontSize: SZ.body,
              lineHeight: 1.36,
              color: alpha(P.muted, 0.92),
            }}
          >
            Total hanya terjadi selama dua piringan
            itu masih sama besar.
          </div>
        </div>
      </div>

      {/* the two angular sizes, side by side as bars: the coincidence, drawn */}
      <div style={{opacity: ring}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={L.left} y1={1068} x2={L.left + 600 * (sunDeg / 0.6)} y2={1068} stroke={alpha(P.warm, 0.7)} strokeWidth={10} />
          <line x1={L.left} y1={1128} x2={L.left + 600 * (moonDeg / 0.6)} y2={1128} stroke={alpha(P.ink, 0.75)} strokeWidth={10} />
          {/* the shortfall, in rust */}
          <line x1={L.left + 600 * (moonDeg / 0.6)} y1={1128} x2={L.left + 600 * (sunDeg / 0.6)} y2={1128} stroke={P.hot} strokeWidth={10} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1022,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.28em',
            color: alpha(P.muted, 0.7),
          }}
        >
          MATAHARI
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1156,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.28em',
            color: alpha(P.muted, 0.7),
          }}
        >
          BULAN · SEKARANG
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left + 600 * (sunDeg / 0.6) + 22,
            top: 1086,
            fontFamily: T.mono,
            fontSize: 14,
            letterSpacing: '0.2em',
            color: alpha(P.hot, 0.9),
          }}
        >
          −4,5%
        </div>
      </div>

      {/* the countdown, as a stated figure rather than a counter: the number is
          an order of magnitude, and counting it would claim precision it lacks */}
      <div style={{opacity: num}}>
        <Figure value="± 600 JUTA" x={L.left} y={1240} size={104} unit="TAHUN LAGI" unitColor={alpha(P.hot, 0.95)} />
        <Note
          text="Cincin akan menggantikan mahkota. Tidak ada yang bisa menghentikannya."
          x={L.left}
          y={1408}
          side="right"
          width={1020}
          size={SZ.body}
          on={num}
          color={alpha(P.muted, 0.9)}
        />
      </div>

      <Brackets x0={CX - 360} y0={CY - 400} x1={CX + 360} y1={CY + 396} len={24} on={on * 0.45} />
      <Source text="DIAMETER SUDUT DIUKUR DARI PERMUKAAN BUMI · PERKIRAAN BERAKHIRNYA GERHANA TOTAL" on={rev(local, 5.6, 0.9)} y={1738} />
    </Stage>
  );
};

export default Compo;
