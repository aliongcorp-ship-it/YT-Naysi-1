/* y4 — teleskop & pulsa
   The measurement itself, drawn as a beam diagram on a dark plate. A telescope
   at the lower left fires, the beam leaves on a slight upward diagonal, and the
   Moon sits at the far end. Two clocks run underneath: the outbound leg and the
   full round trip, and the round trip is stated in the narration (2,56 s).

   The beam is drawn twice: a wide cone (the pulse) and a hairline (the axis).
   The cone narrows with distance, which is the honest shape. */

import React from 'react';
import type {SceneProps} from './types';
import {
  L, P, SZ, Span, Stage, Stars, T, Telescope, Ticks, alpha, clamp, eOut, lerp, rev, smooth,
} from './bulan';

const TX = 352;      // telescope base
const TY = 1196;
const MX = 1104;     // Moon centre
const MY = 586;
const MR = 150;
const OX = 424;       // the muzzle: 74 px along the beam from the base
const OY = 1140;

export const Compo: React.FC<SceneProps> = ({local}) => {
  const on = rev(local, 0, 1.0);
  const fire = rev(local, 0.55, 0.5);
  const travel = clamp((local - 0.9) / 2.1);
  const back = clamp((local - 3.1) / 2.0);
  const clocks = rev(local, 1.2, 1.0);

  // the beam head, travelling out and (fainter) returning
  const bx = lerp(OX, MX, eOut(travel));
  const by = lerp(OY, MY, eOut(travel));
  const rx = lerp(MX, OX, eOut(back));
  const ry = lerp(MY, OY, eOut(back));

  return (
    <Stage grid={0.24} gridCell={164} paper={0.42} dustSeed={4} shade={0.94}>
      <Stars n={220} h={1500} seed={4} opacity={0.9} />

      {/* the path, drawn before the beam so the beam sits on top of it */}
      <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
        <line
          x1={OX}
          y1={OY}
          x2={MX}
          y2={MY}
          stroke={alpha(P.ink, 0.2)}
          strokeWidth={1}
          strokeDasharray="2 10"
        />
        {/* the cone: a widening wedge from the aperture, clipped by `fire` */}
        <path
          d={`M${TX} ${TY - 74} L${MX - 18} ${MY + 52} L${MX + 26} ${MY - 44} Z`}
          fill={alpha(P.warm, 0.055)}
          opacity={fire * (1 - travel * 0.4)}
        />
        <line x1={OX} y1={OY} x2={MX - 18} y2={MY + 52} stroke={alpha(P.warm, 0.2)} strokeWidth={1} opacity={fire} />
        <line x1={OX} y1={OY} x2={MX + 26} y2={MY - 44} stroke={alpha(P.warm, 0.2)} strokeWidth={1} opacity={fire} />

        {/* outbound pulse */}
        {travel > 0 && travel < 1 ? (
          <circle cx={bx} cy={by} r={4} fill={P.warm} />
        ) : null}
        {/* the beam the pulse leaves behind */}
        <line
          x1={OX}
          y1={OY}
          x2={lerp(TX, MX, eOut(travel))}
          y2={lerp(TY - 74, MY, eOut(travel))}
          stroke={alpha(P.warm, 0.55)}
          strokeWidth={2}
        />
        {/* the return: one photon, faint, coming home */}
        {back > 0 && back < 1 ? (
          <>
            <line x1={rx} y1={ry} x2={lerp(rx, MX, 0.1)} y2={lerp(ry, MY, 0.1)} stroke={alpha(P.alt, 0.8)} strokeWidth={2} />
            <circle cx={rx} cy={ry} r={3.4} fill={P.alt} />
          </>
        ) : null}
        {back >= 1 ? <circle cx={TX} cy={OY + 4} r={5} fill={P.alt} opacity={0.9} /> : null}
      </svg>

      <Telescope x={TX} y={TY} s={1} aim={36 - 1.5 * smooth(travel)} on={on} fired={fire} />
      <div
        style={{
          position: 'absolute',
          left: (TX + MX) / 2 - 40,
          top: (TY + MY) / 2 + 44,
          fontFamily: T.mono,
          fontSize: 16,
          letterSpacing: '0.3em',
          color: alpha(P.muted, 0.8),
          opacity: on,
        }}
      >
        384.400 KM
      </div>

      {/* the Moon at the far end, with a ring where the beam lands */}
      <div style={{position: 'absolute', opacity: on}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <circle cx={MX} cy={MY} r={MR} fill="#E9DCC2" />
          <circle cx={MX} cy={MY} r={MR} fill="none" stroke={alpha(P.warm, 0.45)} strokeWidth={1.5} />
          <g fill="#A08A66" opacity={0.5}>
            <ellipse cx={MX - 40} cy={MY - 46} rx={54} ry={42} />
            <ellipse cx={MX + 44} cy={MY - 20} rx={26} ry={22} />
            <ellipse cx={MX + 8} cy={MY + 54} rx={44} ry={30} />
            <ellipse cx={MX - 58} cy={MY + 58} rx={20} ry={24} />
          </g>
          <g fill="none" stroke="#FFF7E6" strokeWidth={1} opacity={0.45}>
            {[18, 34, 52, 68].map((d, i) => (
              <circle key={i} cx={MX + Math.cos(i * 1.7) * 78} cy={MY + Math.sin(i * 2.1) * 82} r={5 + i * 2} />
            ))}
          </g>
          {/* the retroreflector site, marked */}
          <circle cx={MX + 4} cy={MY + 6} r={11} fill="none" stroke={P.accent} strokeWidth={1.6} opacity={on} />
          <line x1={MX + 4} y1={MY + 6} x2={MX + 128} y2={MY + 108} stroke={alpha(P.accent, 0.6)} strokeWidth={1} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: MX + 136,
            top: MY + 96,
            fontFamily: T.mono,
            fontSize: SZ.micro,
            letterSpacing: '0.24em',
            color: P.accent,
            opacity: on,
          }}
        >
          CERMIN
        </div>
        <div
          style={{
            position: 'absolute',
            left: MX - 180,
            width: 360,
            top: MY - MR - 62,
            textAlign: 'center',
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.3em',
            color: alpha(P.muted, 0.8),
          }}
        >
          BULAN
        </div>
      </div>

      {/* the two clocks: out and back */}
      <div style={{opacity: clocks}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1298,
            fontFamily: T.mono,
            fontSize: 15,
            letterSpacing: '0.34em',
            color: alpha(P.muted, 0.7),
          }}
        >
          WAKTU TEMPUH
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1332,
            display: 'flex',
            alignItems: 'baseline',
            gap: 26,
          }}
        >
          <span
            style={{
              fontFamily: T.display,
              fontSize: 128,
              fontWeight: 300,
              color: P.ink,
              letterSpacing: '-0.035em',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            2,56
          </span>
          <span style={{fontFamily: T.mono, fontSize: 24, letterSpacing: '0.24em', color: P.accent}}>DETIK</span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1490,
            fontFamily: T.mono,
            fontSize: 16,
            letterSpacing: '0.2em',
            color: alpha(P.muted, 0.72),
          }}
        >
          PULANG PERGI · 384.400 KM × 2
        </div>
      </div>

      {/* a scale under the beam, so the diagram is a diagram and not an illustration */}
      <Ticks x0={L.left} x1={MX + MR} y={1600} n={48} major={8} height={16} reveal={rev(local, 1.6, 1.2)} color={alpha(P.ink, 0.55)} labels={['0', '100k', '200k', '300k', '384k']} />
    </Stage>
  );
};

export default Compo;
