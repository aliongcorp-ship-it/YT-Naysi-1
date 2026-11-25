/* y1 — cakrawala & bulan
   The establishing frame. We are on the ground, at night, looking up: the
   Earth's own horizon at the bottom, a star field, and the Moon small and high.
   Nothing is labelled. The only motion is the Moon climbing and the stars
   turning behind it, which is what the sentence is actually about: it is
   getting further away, so it looks smaller every year. */

import React from 'react';
import type {SceneProps} from './types';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {P, T, Ridge, Stars} from './bulan';
import {MoonDisc} from '../src/ui/Moon';
import {Dust} from '../src/ui/Texture';
import {clamp, eOut, lerp} from '../src/theme';

export const Compo: React.FC<SceneProps> = ({local}) => {
  const e = eOut(clamp(local / 1.6));

  // The sky turns slowly: the whole field rotates 0.8° over the shot, as if the
  // camera were fixed to the ground and the planet were doing the moving.
  const skyTurn = lerp(-0.9, 0.4, clamp(local / 3.9));

  // The Moon climbs 46 px and loses 3 % of its size across the shot. Small
  // enough to be real, large enough to be felt.
  const moonY = lerp(690, 586, eOut(clamp(local / 3.6)));
  const moonR = lerp(58, 55, clamp(local / 3.8));

  return (
    <AbsoluteFill style={{background: P.void}}>
      {/* sky: warm at the horizon, umber-black overhead */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, #0A0705 0%, #120C08 34%, #1A1109 62%, #2A1B10 84%, #3A2617 100%)`,
        }}
      />

      <AbsoluteFill style={{transform: `rotate(${skyTurn}deg)`, transformOrigin: '50% 88%'}}>
        <Stars n={260} h={2100} seed={1} twinkle />
        <Dust n={620} seed={9} opacity={0.45} color={P.ink} />
        <MoonDisc cx={934} cy={moonY} r={moonR} detail={0.85} lit={0.92} tilt={-14} seed={4} opacity={0.96} />
        {/* the Moon's own halo is a ring, not a glow: one hairline at 2 r */}
        <div
          style={{
            position: 'absolute',
            left: 934 - moonR * 1.9,
            top: moonY - moonR * 1.9,
            width: moonR * 3.8,
            height: moonR * 3.8,
            borderRadius: '50%',
            border: `1px solid rgba(240,231,213,0.07)`,
            opacity: 0.8,
          }}
        />
      </AbsoluteFill>

      {/* foreground: a low ridge, so the bottom of frame is land and not a
          vignette. The warm band above it is the last of the light. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 1660,
          width: 1440,
          height: 900,
          background: 'linear-gradient(180deg, rgba(185,138,82,0) 0%, rgba(185,138,82,0.14) 46%, rgba(176,116,60,0.34) 82%, rgba(150,96,48,0.42) 100%)',
        }}
      />
      <Ridge
        layers={[
          {
            points: '0,2232 140,2206 300,2218 470,2190 640,2212 800,2188 980,2214 1160,2196 1300,2218 1440,2204',
            fill: '#0A0705',
            stroke: 'rgba(214,164,104,0.55)',
            strokeWidth: 2,
          },
          {
            points: '0,2262 120,2236 260,2250 430,2220 600,2244 790,2218 970,2246 1140,2226 1310,2248 1440,2234',
            fill: '#050302',
          },
        ]}
        lights={[[318, 2246], [906, 2232], [1188, 2240], [142, 2248]]}
      />
    </AbsoluteFill>
  );
};

/* A ridge line: one SVG polygon, so the silhouette is a mountain and not a
   row of blocks. Three layers at different darkness give the hill depth. */
/* Three parallax shells of stars, each a fixed lattice shifted by the shot's
   own clock so the field is alive but never twitchy. */
export default Compo;
