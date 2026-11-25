/* y10 — malam ini
   The closing shot: the night the viewer is standing in. The same ridge as the
   opening, but from higher up and closer to the Moon, which has moved a little
   further out. The film ends on a held frame with one line under it, and the
   Moon still climbing. Everything that was measured earlier is settled; only
   the picture is left. */

import React from 'react';
import type {SceneProps} from './types';
import {AbsoluteFill} from 'remotion';
import {P, T} from './bulan';
import {MoonDisc} from '../src/ui/Moon';
import {Dust} from '../src/ui/Texture';
import {alpha, clamp, eOut, eOutQuint, lerp} from '../src/theme';

export const Compo: React.FC<SceneProps> = ({local, total}) => {
  const settle = eOut(clamp(local / 1.8));
  const ridge = eOutQuint(clamp(local / 1.4));
  const line = eOut(clamp((local - 2.2) / 1.2));

  // The Moon climbs and, very slightly, recedes: 1,5 % smaller over the shot.
  const moonY = lerp(716, 640, settle);
  const moonR = lerp(74, 73, clamp(local / 6.2));

  return (
    <AbsoluteFill style={{background: P.void}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #080604 0%, #0E0906 34%, #180F08 66%, #2A1A0E 88%, #3A2413 100%)'}} />
      <Stars />
      <Dust n={560} seed={31} opacity={0.42} color={P.ink} />

      <MoonDisc cx={726} cy={moonY} r={moonR} detail={0.9} lit={0.94} tilt={-10} seed={23} opacity={0.98} />

      {/* the Moon's ring, the same one the opening used: this is the same sky */}
      <div
        style={{
          position: 'absolute',
          left: 726 - moonR * 1.72,
          top: moonY - moonR * 1.72,
          width: moonR * 3.44,
          height: moonR * 3.44,
          borderRadius: '50%',
          border: `1px solid ${alpha(P.ink, 0.07)}`,
        }}
      />

      {/* the horizon, now closer: we are higher up and further out ourselves */}
      <Ridge on={ridge} />

      {/* the closing line, set as a plate caption under the sky */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 1440,
          top: 2292,
          textAlign: 'center',
          opacity: line,
          fontFamily: T.italic,
          fontStyle: 'italic',
          fontSize: 46,
          letterSpacing: '-0.01em',
          color: alpha(P.warm, 0.72),
        }}
      >
        begitu pun besok malam
      </div>
    </AbsoluteFill>
  );
};

const Ridge: React.FC<{on: number}> = ({on}) => {
  if (on <= 0) return null;
  const near = '0,2150 130,2124 280,2140 450,2112 620,2136 800,2110 970,2140 1140,2118 1300,2142 1440,2126';
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}}>
      <svg width={1440} height={2560} style={{position: 'absolute', left: 0, top: 0}}>
        <polygon points={`${near} 1440,2560 0,2560`} fill="#050302" stroke="rgba(206,150,88,0.5)" strokeWidth={1.6} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 1900,
          width: 1440,
          height: 340,
          background: 'linear-gradient(180deg, rgba(196,140,80,0) 0%, rgba(196,140,80,0.14) 72%, rgba(170,112,58,0.3) 100%)',
        }}
      />
      {[[392, 2168], [1022, 2158], [1196, 2164]].map(([x, y], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: P.warm,
            opacity: 0.55,
            boxShadow: `0 0 6px 1px rgba(255,217,160,0.32)`,
          }}
        />
      ))}
    </div>
  );
};

const Stars = () => {
  const stars = React.useMemo(
    () =>
      Array.from({length: 230}, (_, i) => {
        const a = Math.abs(Math.sin(i * 91.17) * 43758.5453) % 1;
        const b = Math.abs(Math.sin(i * 47.31) * 12345.6789) % 1;
        return {x: a * 1440, y: b * 2000, s: 1.1 + a * 1.8, o: 0.14 + b * 0.5};
      }),
    []
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {stars.map((s, i) => (
        <div key={i} style={{position: 'absolute', left: s.x, top: s.y, width: s.s, height: s.s, background: P.ink, opacity: s.o * 0.72}} />
      ))}
    </AbsoluteFill>
  );
};

export default Compo;
