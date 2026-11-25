/* y6 — pasang mendahului
   The mechanism, drawn as a diagram on a dark plate: the Earth in section,
   wrapped in the two tidal bulges, with the Moon off to the right. The bulge
   axis is deliberately not on the Earth–Moon line — it leads it, because the
   Earth turns faster than the Moon orbits. That lead is the whole story: the
   offset pulls, the pull accelerates the Moon, and the Moon recedes.
   No glow, no neon: water is hatched, rock is solid, force is a single arrow. */

import React from 'react';
import type {SceneProps} from './types';
import {AbsoluteFill} from 'remotion';
import {P, T, EarthDisc} from './bulan';
import {Dust} from '../src/ui/Texture';
import {alpha, clamp, eOut, lerp, smooth} from '../src/theme';

const EX = 628; // Earth's centre
const EY = 1120;
const ER = 288; // Earth's radius
const MX = 1192; // Moon's centre
const MY = 806;
const MR = 96;

export const Compo: React.FC<SceneProps> = ({local, act}) => {
  const D = act.end - act.start;

  // Beats: the bulge appears on "pasang"; the lead appears on "mendahului";
  // the tangential arrow appears on "dorongan".
  const bulge = eOut(clamp((local - 0.4) / 2.0));
  const lead = eOut(clamp((local - (D * 0.4)) / 2.2));
  const push = eOut(clamp((local - (D * 0.72)) / 1.8));

  // the bulge axis swings from "pointing at the Moon" to "leading it"
  const axis = lerp(0, -38, lead);

  return (
    <AbsoluteFill style={{background: '#080605'}}>
      <AbsoluteFill style={{background: 'linear-gradient(172deg, #0C0907 0%, #080605 58%, #050403 100%)'}} />
      <Dust n={520} seed={71} opacity={0.4} color={P.ink} />

      <Plate />
      <OrbitGuide opacity={0.5} />

      {/* the water, under the land so the coast overlaps it */}
      <Bulge axis={axis} amount={bulge} />
      <EarthDisc cx={EX} cy={EY} r={ER} spin={-14} meridian />
      <MoonDisc />

      <EarthMoonLine lead={lead} />
      <LeadAngle lead={lead} axis={axis} />
      <PushArrow push={push} />

      <Labels bulge={bulge} lead={lead} push={push} />
    </AbsoluteFill>
  );
};

/* A surveyor's plate: the frame, and the cross-hairs of the drawing field. */
const Plate = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 96, top: 330, width: 1248, height: 1420, border: `1px solid ${alpha(P.ink, 0.1)}`}} />
    <div style={{position: 'absolute', left: 96, top: 330, width: 60, height: 1, background: alpha(P.ink, 0.3)}} />
    <div style={{position: 'absolute', left: 96, top: 330, width: 1, height: 60, background: alpha(P.ink, 0.3)}} />
    <div style={{position: 'absolute', left: 1284, top: 330, width: 60, height: 1, background: alpha(P.ink, 0.3), transform: 'translateX(-60px)'}} />
    <div style={{position: 'absolute', left: 1343, top: 330, width: 1, height: 60, background: alpha(P.ink, 0.3)}} />
  </AbsoluteFill>
);

/* The Moon's orbit, as an arc behind everything: it explains why the bulge is
   late without a single word. */
const OrbitGuide: React.FC<{opacity: number}> = ({opacity}) => (
  <div style={{position: 'absolute', left: 0, top: 0, opacity}}>
    <svg width={1440} height={2560} style={{position: 'absolute', left: 0, top: 0}}>
      <circle cx={EX} cy={EY} r={Math.hypot(MX - EX, MY - EY)} fill="none" stroke={alpha(P.ink, 0.12)} strokeWidth={1} strokeDasharray="3 10" />
    </svg>
  </div>
);

/* The tidal envelope: two lobes, drawn as one closed path that swells along the
   bulge axis. The water is picked out with fine hatching lines clipped to the
   lobe, so it reads as a body of water and not as a bar of colour. */
const Bulge: React.FC<{axis: number, amount: number}> = ({axis, amount}) => {
  if (amount <= 0) return null;
  const a = ER * lerp(1.02, 1.62, amount);
  const b = ER * lerp(1.02, 0.94, amount);
  return (
    <div
      style={{
        position: 'absolute',
        left: EX,
        top: EY,
        width: 1,
        height: 1,
        transform: `rotate(${axis}deg)`,
      }}
    >
      <svg width={1440} height={2560} style={{position: 'absolute', left: -EX, top: -EY, overflow: 'visible'}}>
        <defs>
          <clipPath id="bulgeClip">
            <ellipse cx={EX} cy={EY} rx={a} ry={b} />
          </clipPath>
          <pattern id="water" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <line x1="0" y1="0" x2="0" y2="10" stroke={alpha(P.alt, 0.62)} strokeWidth={1.3} />
          </pattern>
        </defs>
        <ellipse cx={EX} cy={EY} rx={a} ry={b} fill="rgba(18,30,28,0.5)" stroke={alpha(P.alt, 0.55)} strokeWidth={1.4} />
        <ellipse cx={EX} cy={EY} rx={a} ry={b} fill="url(#water)" clipPath="url(#bulgeClip)" opacity={0.72} />
        {/* the two crests, marked */}
        <circle cx={EX - a + 8} cy={EY} r={5} fill={P.alt} />
        <circle cx={EX + a - 8} cy={EY} r={5} fill={P.alt} />
      </svg>
    </div>
  );
};

/* The Earth: solid rock, continents in flat bone-grey, a terminator on the far
   side. Same engraving rules as the Moon, cool instead of warm, because water
   and rock are the only cool things on this plate. */

const MoonDisc = () => (
  <div style={{position: 'absolute', left: MX - MR, top: MY - MR, width: MR * 2, height: MR * 2}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 32% 28%, #F2E8D2 0%, #DCCBA9 40%, #A89372 74%, #55472F 100%)',
      }}
    />
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(96deg, rgba(10,7,5,0) 44%, rgba(10,7,5,0.7) 80%, rgba(10,7,5,0.95) 100%)'}} />
    {[[-0.35, -0.2, 0.1], [0.2, 0.1, 0.13], [-0.1, 0.35, 0.08]].map(([x, y, s], i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: MR + x * MR - s * MR,
          top: MR + y * MR - s * MR,
          width: s * MR * 2,
          height: s * MR * 2,
          borderRadius: '50%',
          border: `1.5px solid rgba(58,48,34,0.5)`,
        }}
      />
    ))}
  </div>
);

/* The line between the two centres: the direction the water would point if the
   Earth stood still. The lead is measured against it. */
const EarthMoonLine: React.FC<{lead: number}> = ({lead}) => (
  <div style={{position: 'absolute', left: 0, top: 0, opacity: lead, pointerEvents: 'none'}}>
    <svg width={1440} height={2560} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={EX} y1={EY} x2={MX} y2={MY} stroke={alpha(P.ink, 0.34)} strokeWidth={1} strokeDasharray="6 8" />
    </svg>
  </div>
);

/* The measured lead: an arc from the Christ–Moon line to the bulge axis, with
   the angle written on it. */
const LeadAngle: React.FC<{lead: number, axis: number}> = ({lead, axis}) => {
  if (lead <= 0) return null;
  const r = ER + 74;
  const a1 = (Math.atan2(MY - EY, MX - EX) * 180) / Math.PI;
  const a2 = a1 + axis;
  const p = (deg: number) => [EX + Math.cos((deg * Math.PI) / 180) * r, EY + Math.sin((deg * Math.PI) / 180) * r];
  const [x1, y1] = p(a1);
  const [x2, y2] = p(a2);
  const large = Math.abs(axis) > 180 ? 1 : 0;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: clamp(lead * 1.4), pointerEvents: 'none'}}>
      <svg width={1440} height={2560} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={`M${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={P.accent} strokeWidth={2} />
        <line x1={EX} y1={EY} x2={x2 * 1.0} y2={y2} stroke={alpha(P.accent, 0.3)} strokeWidth={1} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: (x1 + x2) / 2 - 150,
          top: (y1 + y2) / 2 - 66,
          width: 300,
          textAlign: 'center',
          fontFamily: T.mono,
          fontSize: 18,
          letterSpacing: '0.26em',
          color: P.accent,
        }}
      >
        MENDAHULUI
      </div>
    </div>
  );
};

/* The force: the leading bulge hauls the Moon forward along its orbit. Drawn as
   one tangential arrow at the Moon, in the direction of travel — the only arrow
   in the film, and the point of the whole episode. */
const PushArrow: React.FC<{push: number}> = ({push}) => {
  if (push <= 0) return null;
  // tangent to the orbit at the Moon, counter-clockwise (the way it moves)
  const ux = MX - EX;
  const uy = MY - EY;
  const l = Math.hypot(ux, uy);
  const tx = uy / l;
  const ty = -ux / l;
  const x0 = MX + tx * (MR + 14);
  const y0 = MY + ty * (MR + 14);
  const ex = x0 + tx * 236 * push;
  const ey = y0 + ty * 236 * push;
  const head = 17;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <svg width={1440} height={2560} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={x0} y1={y0} x2={ex} y2={ey} stroke={P.hot} strokeWidth={3.2} />
        <polygon
          points={`${ex},${ey} ${ex - tx * head - ty * head * 0.62},${ey - ty * head + tx * head * 0.62} ${ex - tx * head + ty * head * 0.62},${ey - ty * head - tx * head * 0.62}`}
          fill={P.hot}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: ex + tx * 26 - 210,
          top: ey + ty * 26 - 20,
          width: 210,
          textAlign: 'right',
          fontFamily: T.mono,
          fontSize: 20,
          letterSpacing: '0.18em',
          color: P.hot,
          opacity: clamp(push * 1.6),
        }}
      >
        DORONGAN
      </div>
      <div
        style={{
          position: 'absolute',
          left: ex + tx * 26 - 250,
          top: ey + ty * 26 + 12,
          width: 250,
          textAlign: 'right',
          fontFamily: T.mono,
          fontSize: 16,
          letterSpacing: '0.22em',
          color: alpha(P.hot, 0.72),
          opacity: clamp(push * 1.6),
        }}
      >
        BULAN MAKIN CEPAT
      </div>
    </div>
  );
};

/* Plate labels: three short ones, each attached to the thing it names. */
const Labels: React.FC<{bulge: number, lead: number, push: number}> = ({bulge, lead, push}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 96 + 24, top: 330 + 22, opacity: bulge, fontFamily: T.mono, fontSize: 19, letterSpacing: '0.36em', color: alpha(P.ink, 0.5)}}>
      POTONGAN BUMI &nbsp;·&nbsp; PASANG
    </div>
    <div style={{position: 'absolute', left: MX - 96, top: MY + MR + 34, width: 192, textAlign: 'center', opacity: bulge, fontFamily: T.mono, fontSize: 18, letterSpacing: '0.3em', color: alpha(P.ink, 0.6)}}>
      BULAN
    </div>
    <div style={{position: 'absolute', left: EX - 200, top: EY + ER + 96, width: 400, textAlign: 'center', opacity: bulge, fontFamily: T.italic, fontStyle: 'italic', fontSize: 32, color: alpha(P.ink, 0.62), letterSpacing: '-0.01em'}}>
      laut naik, dan tertinggal
    </div>
  </AbsoluteFill>
);

export default Compo;
