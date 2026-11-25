/* y10 — seribu detik
   The same bill, accumulated. A profile of day length against geological time:
   22 h at 400 Ma, 24 h now, and the seconds between them added up. The readout
   travels along the curve, so the number and the position are the same fact.

   The curve is a straight line on purpose: over this span the rate is close to
   constant, and a curve would imply precision the record does not have. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, Counter, Figure, Label, L, P, Ruler, SZ, Source, Stage, T, Ticks, alpha, clamp, lerp, rev,
} from './bulan';

const X0 = L.left + 40;
const X1 = L.right;
const Y0 = 420;      // 25 h
const Y1 = 1180;     // 21 h
const H = Y1 - Y0;
const hourY = (h: number) => Y0 + ((25 - h) / 4) * H;

export const Compo: React.FC<SceneProps> = ({local}) => {
  const frameOn = rev(local, 0, 0.8);
  const plot = rev(local, 0.45, 1.7);
  const travel = clamp((local - 1.9) / 1.9);
  const answer = rev(local, 3.0, 0.9);
  const foot = rev(local, 3.7, 0.9);

  const nowH = 24;
  const thenH = 22;
  const yNow = hourY(nowH);
  const yThen = hourY(thenH);

  // the readout rides the line from "then" to "now"
  const xr = lerp(X0, X1, travel);
  const hr = lerp(thenH, nowH, travel);
  const yr = hourY(hr);
  const seconds = Math.round(lerp(0, 7200, travel));

  return (
    <Stage grid={0.22} gridCell={176} paper={0.42} dustSeed={10} shade={0.92}>
      <Label text="PANJANG HARI · SKALA GEOLOGI" y={L.top} on={frameOn} />

      {/* axes */}
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0, opacity: frameOn}}>
        <line x1={X0} y1={Y0 - 40} x2={X0} y2={Y1 + 40} stroke={alpha(P.ink, 0.3)} strokeWidth={1} />
        <line x1={X0} y1={Y1 + 40} x2={X1} y2={Y1 + 40} stroke={alpha(P.ink, 0.3)} strokeWidth={1} />
        {[21, 22, 23, 24, 25].map((h) => (
          <g key={h}>
            <line x1={X0 - 12} y1={hourY(h)} x2={X1} y2={hourY(h)} stroke={alpha(P.ink, h === 24 || h === 22 ? 0.16 : 0.07)} strokeWidth={1} />
            <text x={X0 - 22} y={hourY(h) + 6} fill={alpha(P.muted, 0.7)} fontFamily={T.mono} fontSize={17} textAnchor="end" letterSpacing={1.6}>
              {h} J
            </text>
          </g>
        ))}
        {/* the line, clipped by `plot` */}
        <line
          x1={X0}
          y1={yThen}
          x2={lerp(X0, X1, plot)}
          y2={lerp(yThen, yNow, plot)}
          stroke={P.accent}
          strokeWidth={2.4}
        />
        {/* the endpoints, marked once the line reaches them */}
        {plot > 0.02 ? <circle cx={X0} cy={yThen} r={5.5} fill={P.hot} /> : null}
        {plot > 0.98 ? <circle cx={X1} cy={yNow} r={5.5} fill={P.accent} /> : null}
        {/* the travelling index */}
        <line x1={xr} y1={yr - 34} x2={xr} y2={Y1 + 40} stroke={alpha(P.warm, 0.5)} strokeWidth={1} strokeDasharray="3 6" />
        <circle cx={xr} cy={yr} r={7} fill={P.warm} />
      </svg>

      {/* axis names */}
      <div style={{opacity: frameOn}}>
        <div
          style={{
            position: 'absolute',
            left: X0,
            top: Y1 + 64,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.3em',
            color: alpha(P.muted, 0.7),
          }}
        >
          400 JUTA TAHUN LALU
        </div>
        <div
          style={{
            position: 'absolute',
            right: L.w - X1,
            top: Y1 + 64,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.3em',
            color: alpha(P.muted, 0.7),
          }}
        >
          SEKARANG
        </div>
        <div
          style={{
            position: 'absolute',
            left: X0 - 92,
            top: Y0 - 84,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.28em',
            color: alpha(P.muted, 0.62),
          }}
        >
          JAM / HARI
        </div>
      </div>

      {/* the answer: seconds gained, counted */}
      <div style={{opacity: answer}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1300,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.24),
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1338,
            fontFamily: T.display,
            fontSize: 158,
            fontWeight: 300,
            letterSpacing: '-0.045em',
            lineHeight: 1,
            color: P.ink,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <Counter from={0} to={7200} at={3.0} dur={1.4} local={local} digits={0} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left + 660,
            top: 1400,
            fontFamily: T.mono,
            fontSize: 18,
            letterSpacing: '0.3em',
            lineHeight: 1.8,
            color: alpha(P.accent, 0.95),
          }}
        >
          DETIK
          <br />
          <span style={{color: alpha(P.muted, 0.7)}}>DITAMBAHKAN KE SATU HARI</span>
        </div>
      </div>

      <div style={{opacity: foot}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1560,
            width: 1000,
            fontFamily: T.italic,
            fontStyle: 'italic',
            fontSize: SZ.sub,
            lineHeight: 1.34,
            color: alpha(P.muted, 0.92),
          }}
        >
          Dua jam. Tujuh ribu dua ratus detik. Itu harga
          <br />
          yang dibayar Bumi untuk mengusir Bulan.
        </div>
      </div>

      <Brackets x0={X0 - 40} y0={Y0 - 60} x1={X1} y1={Y1 + 60} len={22} on={frameOn * 0.55} />
      <Source text="LAJU 1,8 MS/ABAD · REKONSTRUKSI DARI KARANG & LAPISAN PASANG" on={rev(local, 4.4, 0.9)} y={1738} />
    </Stage>
  );
};

export default Compo;
