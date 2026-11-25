/* y2 — 3,8 cm
   The number the whole film rests on, drawn as a printed figure: a hero numeral
   that counts up, a millimetre rule at plate scale, and one 1:1 band that gives
   the number a body — the width of a fingernail's growth in a year, drawn at the
   size it actually is.

   The reveal order is the argument: the figure, then the rule that measures it,
   then the same distance at 1:1 beside a nail. Nothing overlaps; every block has
   its own band on the sheet. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, Counter, Figure, Label, L, Note, P, SZ, Span, Stage, T, Ticks, alpha, clamp, rev,
} from './bulan';

const RULE_Y = 700;                 // the millimetre rule
const MM = (L.measure - 40) / 62;   // px per millimetre on that rule
const BAND_TOP = 1180;              // the 1:1 band: 38 mm at 4,6 px/mm
const PX_MM = 4.6;
const BAND = 38 * PX_MM;            // 174,8 px

export const Compo: React.FC<SceneProps> = ({local}) => {
  const fig = rev(local, 0.05, 0.85);
  const rule = rev(local, 0.4, 0.7);
  const span = rev(local, 0.75, 0.6);
  const band = rev(local, 1.2, 0.9);
  const nail = rev(local, 1.5, 0.9);
  const note = rev(local, 2.1, 0.9);

  return (
    <Stage grid={0.34} gridCell={112} paper={0.44} dustSeed={2} shade={0.92}>
      <Label text="PENGUKURAN · SATU TAHUN" y={L.top} on={rev(local, 0, 0.6)} />

      {/* the hero, counted up from zero */}
      <div style={{opacity: fig, transform: `translateY(${(1 - fig) * 22}px)`}}>
        <Figure
          value={<Counter from={0} to={3.8} at={0.1} dur={1.1} local={local} digits={1} /> as unknown as string}
          x={L.left}
          y={252}
          size={214}
          unit="CM / TAHUN"
          unitColor={P.accent}
          tracking={-0.045}
        />
      </div>

      {/* the rule: 62 mm across the measure, one tick per millimetre */}
      <Ticks
        x0={L.left}
        x1={L.left + 62 * MM}
        y={RULE_Y}
        n={62}
        major={10}
        height={24}
        reveal={rule}
        color={alpha(P.ink, 0.72)}
        labels={['0', '10', '20', '30', '40', '50', '60']}
        labelSize={16}
      />
      <div
        style={{
          position: 'absolute',
          left: L.left,
          top: RULE_Y + 96,
          fontFamily: T.mono,
          fontSize: 15,
          letterSpacing: '0.26em',
          color: alpha(P.muted, 0.62),
          opacity: rule,
        }}
      >
        MILIMETER
      </div>

      {/* the measured 3,8 inside the rule */}
      <Span
        x0={L.left}
        x1={L.left + 38 * MM}
        y={RULE_Y - 46}
        label="3,8 CM"
        reveal={span}
        on={span}
        size={SZ.small}
      />

      {/* the 1:1 band: this year's growth, drawn at the size it is */}
      <div style={{opacity: band}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <pattern id="growthhatch" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1={0} y1={0} x2={0} y2={7} stroke={alpha(P.accent, 0.8)} strokeWidth={1} />
            </pattern>
          </defs>
          <rect x={L.left} y={BAND_TOP} width={L.measure} height={BAND} fill="url(#growthhatch)" opacity={0.15} />
          <line x1={L.left} y1={BAND_TOP} x2={L.right} y2={BAND_TOP} stroke={alpha(P.ink, 0.5)} strokeWidth={1.2} />
          <line x1={L.left} y1={BAND_TOP + BAND} x2={L.right} y2={BAND_TOP + BAND} stroke={alpha(P.accent, 0.85)} strokeWidth={1.2} />
          {/* the two ends, measured */}
          <line x1={L.left - 14} y1={BAND_TOP} x2={L.left - 14} y2={BAND_TOP + BAND} stroke={alpha(P.ink, 0.6)} strokeWidth={1.2} />
          <line x1={L.left - 22} y1={BAND_TOP} x2={L.left - 6} y2={BAND_TOP} stroke={alpha(P.ink, 0.6)} strokeWidth={1.2} />
          <line x1={L.left - 22} y1={BAND_TOP + BAND} x2={L.left - 6} y2={BAND_TOP + BAND} stroke={alpha(P.ink, 0.6)} strokeWidth={1.2} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: BAND_TOP - 40,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.3em',
            color: alpha(P.muted, 0.75),
          }}
        >
          TAHUN INI
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: BAND_TOP + BAND + 18,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.3em',
            color: alpha(P.accent, 0.95),
          }}
        >
          TAHUN DEPAN
        </div>
      </div>

      {/* the nail, beside the band, at the same scale */}
      <div style={{opacity: nail}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          {/* the plate of the nail, seen from above */}
          <path
            d={`M${L.right - 300} ${BAND_TOP - 150}
                L${L.right - 232} ${BAND_TOP - 168}
                Q${L.right - 176} ${BAND_TOP - 90} ${L.right - 196} ${BAND_TOP + 30}
                L${L.right - 196} ${BAND_TOP + 210}
                L${L.right - 300} ${BAND_TOP + 210} Z`}
            fill={alpha(P.warm, 0.07)}
            stroke={alpha(P.warm, 0.55)}
            strokeWidth={1.3}
          />
          {/* the free edge, and where it will be in a year */}
          <line x1={L.right - 300} y1={BAND_TOP + 22} x2={L.right - 196} y2={BAND_TOP + 22} stroke={alpha(P.ink, 0.5)} strokeWidth={1} strokeDasharray="4 6" />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: L.right - 470,
            width: 240,
            top: BAND_TOP + BAND + 18,
            textAlign: 'right',
            fontFamily: T.mono,
            fontSize: 14,
            letterSpacing: '0.24em',
            color: alpha(P.muted, 0.6),
          }}
        >
          KUKU · SKALA 1:1
        </div>
      </div>

      <Note
        text="Terukur, bukan perkiraan: 3,8 cm per tahun, ± 0,1 cm."
        x={L.left}
        y={1600}
        side="right"
        width={1000}
        on={note}
        size={SZ.body}
        color={alpha(P.muted, 0.88)}
      />

      <Brackets x0={L.left - 32} y0={RULE_Y - 84} x1={L.left + 62 * MM + 24} y1={RULE_Y + 92} len={22} on={span * 0.7} />
    </Stage>
  );
};

export default Compo;
