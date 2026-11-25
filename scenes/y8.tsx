/* y8 — dorongan & spiral
   Why the lead matters: the bulge pulls the Moon forward, and a forward pull
   raises the orbit. So the shot draws the orbit twice — this year's arc and next
   year's — with the gap between them stated.

   The gap is 3,8 cm on a 384.400 km radius, which is invisible at any honest
   scale. It is therefore drawn with a stated exaggeration, marked on the plate,
   and the caption carries the true number. Nothing here pretends to be to scale. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, Figure, Label, L, MoonDisc, Note, P, SZ, Source, Stage, T, alpha, clamp, eInOut, lerp, rev,
} from './bulan';

const EX = 322;          // Earth, left of centre
const EY = 1180;
const ER = 62;
const R0 = 560;          // this year's radius
const R1 = 604;          // next year's radius (exaggerated on the plate)

// the arc sweeps across the top of the plate, so the Moon sits high and right
const A0 = -112;
const A1 = -30;
const polar = (r: number, a: number): [number, number] => [
  EX + Math.cos((a * Math.PI) / 180) * r,
  EY + Math.sin((a * Math.PI) / 180) * r,
];

export const Compo: React.FC<SceneProps> = ({local}) => {
  const on = rev(local, 0, 0.8);
  const drift = eInOut(clamp((local - 1.0) / 3.6));
  const arrow = rev(local, 1.4, 0.8);
  const gap = rev(local, 3.0, 1.0);
  const num = rev(local, 3.6, 1.0);
  const note = rev(local, 4.3, 0.9);

  const rNow = R0;
  const rNext = lerp(R0, R1, drift);

  const arc = (r: number, a0: number, a1: number) => {
    const [x0, y0] = polar(r, a0);
    const [x1, y1] = polar(r, a1);
    return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
  };

  const [mx, my] = polar(rNow, A1);
  const [nx, ny] = polar(rNext, A1 + 0.8);

  return (
    <Stage grid={0.18} gridCell={192} paper={0.4} dustSeed={8} shade={0.92}>
      <Label text="TORSI · ORBIT MELEBAR" y={L.top} on={on} />
      <Label text="PERBESARAN TIDAK BERSKALA" y={L.top + 46} x={L.left} rule={26} on={on} size={14} color={alpha(P.muted, 0.6)} />

      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0, opacity: on}}>
        {/* next year's arc, drawn first so this year's reads on top */}
        <path d={arc(rNext, A0, A1 + 0.8)} fill="none" stroke={alpha(P.hot, 0.55 * gap)} strokeWidth={1.6} strokeDasharray="10 8" />
        {/* this year's */}
        <path d={arc(rNow, A0, A1)} fill="none" stroke={alpha(P.ink, 0.5)} strokeWidth={1.8} />
        {/* graduations, so the arc is a scale and not a swoosh */}
        {Array.from({length: 22}).map((_, i) => {
          const a = lerp(A0, A1, i / 21);
          const [x0, y0] = polar(rNow - 12, a);
          const [x1, y1] = polar(rNow + 12, a);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={alpha(P.ink, i % 5 === 0 ? 0.45 : 0.18)} strokeWidth={1} />;
        })}
        {/* the Earth–Moon line, as a measurement */}
        <line x1={EX} y1={EY} x2={mx} y2={my} stroke={alpha(P.ink, 0.16)} strokeWidth={1} strokeDasharray="2 9" />
        {/* the outward step, at the Moon's position */}
        <line x1={mx} y1={my} x2={mx + (nx - mx) * gap} y2={my + (ny - my) * gap} stroke={alpha(P.hot, 0.9)} strokeWidth={2.4} />
        {gap > 0.6 ? (
          <>
            <line x1={nx} y1={ny} x2={nx + 96} y2={ny - 34} stroke={alpha(P.hot, 0.7)} strokeWidth={1} />
            <line x1={mx} y1={my} x2={mx + 96} y2={my + 46} stroke={alpha(P.hot, 0.7)} strokeWidth={1} />
          </>
        ) : null}
        {/* the impulse: tangential, forward along the orbit */}
        {arrow > 0 ? (
          <g opacity={arrow} stroke={P.accent} strokeWidth={2.6} fill="none">
            <line x1={mx} y1={my} x2={mx + 118} y2={my - 46} />
            <path d={`M${mx + 118} ${my - 46} l-24 2 M${mx + 118} ${my - 46} l-10 22`} />
          </g>
        ) : null}
      </svg>

      <div style={{opacity: on}}>
        <MoonDisc cx={mx} cy={my} r={62} detail={0.3} seed={21} />
      </div>

      {/* the Earth, with the bulge nudge that does the pulling */}
      <div style={{opacity: on}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <ellipse cx={EX} cy={EY} rx={ER * 1.16} ry={ER * 0.98} fill={alpha(P.alt, 0.1)} stroke={alpha(P.alt, 0.6)} strokeWidth={1.3} />
          <circle cx={EX} cy={EY} r={ER} fill="#22383F" stroke={alpha(P.warm, 0.5)} strokeWidth={1.5} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: EX - 40,
            top: EY + ER + 18,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.3em',
            color: alpha(P.muted, 0.75),
          }}
        >
          BUMI
        </div>
      </div>

      {/* the two arcs, named where there is room for it */}
      <div style={{opacity: gap}}>
        <div
          style={{
            position: 'absolute',
            left: nx + 104,
            width: 340,
            top: ny - 44,
            fontFamily: T.mono,
            fontSize: 14,
            letterSpacing: '0.22em',
            lineHeight: 1.9,
            color: alpha(P.hot, 0.9),
          }}
        >
          ORBIT TAHUN DEPAN
          <br />
          <span style={{color: alpha(P.muted, 0.6)}}>+3,8 CM</span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: mx + 104,
            width: 340,
            top: my + 34,
            fontFamily: T.mono,
            fontSize: 14,
            letterSpacing: '0.22em',
            color: alpha(P.muted, 0.72),
          }}
        >
          ORBIT SEKARANG
        </div>
      </div>

      {/* the number, stated plainly under the diagram */}
      <div style={{opacity: num}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1372,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.24),
          }}
        />
        <Figure value="+3,8" x={L.left} y={1404} size={104} unit="CM / TAHUN" unitColor={alpha(P.accent, 0.95)} />
        <Note
          text="Satu dorongan kecil, setiap kali Bulan lewat."
          x={L.left + 520}
          y={1462}
          side="right"
          width={620}
          size={SZ.body}
          on={num}
          color={alpha(P.muted, 0.9)}
        />
      </div>

      <Note
        text="Jarak antar-busur sangat diperbesar; angkanya ada di bawah."
        x={L.left}
        y={1560}
        on={note}
        width={720}
        size={SZ.small}
        color={alpha(P.muted, 0.62)}
      />

      <Brackets x0={L.left - 18} y0={L.top + 70} x1={L.right + 18} y1={1380} len={22} on={on * 0.4} />
      <Source text="TORSI PASANG · PASANG DEPAN MENARIK BULAN KE ARAH GERAK" on={rev(local, 4.6, 0.9)} y={1738} />
    </Stage>
  );
};

export default Compo;
