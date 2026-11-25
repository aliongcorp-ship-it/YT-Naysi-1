import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, H, W, alpha, clamp, eOut, lerp} from '../theme';
import {SpaceBackdrop, StarField, CoordGrid, EarthLimb} from '../ui/Atmosphere';
import {OrbitArc, OrbitMoon, EarthAtCorner} from '../ui/Space';
import {Readout} from '../ui/Hud';
import type {Act, Shot} from '../timeline';

/* 01 — PERGI.
   Establishes the system in one breath: Earth below the frame, the Moon on a
   dotted orbit, and the gap between them opening as the camera holds still.
   The number arrives only after the picture has explained the sentence. */
export const Depart: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const local = t - shot.start;

  const enter = eOut(clamp(local / 1.1));
  const drift = clamp(local / 10);

  // the moon slides outward along its arc as the line is spoken
  const angle = lerp(-32, -8, eOut(clamp(local / 9)));
  const rx = lerp(520, 600, drift);

  return (
    <AbsoluteFill style={{background: C.void}}>
      <SpaceBackdrop from={C.abyss} to={C.void} earthLight={0.8} />
      <StarField opacity={0.85} drift={0.6} seed={4} />
      <CoordGrid opacity={0.075} step={160} />

      {/* the planet we are standing on, cropped by the bottom of frame */}
      <EarthLimb cx={W / 2} cy={H + 300} r={1560} lit={1} tilt={-14} />

      <AbsoluteFill style={{opacity: enter * 0.95}}>
        <OrbitArc cx={W / 2} cy={880} rx={rx} ry={236} rot={-11} progress={0.62} color={C.shallow} opacity={0.55} />
        <OrbitMoon cx={W / 2} cy={880} rx={rx} ry={236} rot={-11} angle={angle} r={44} />
      </AbsoluteFill>

      {/* a hairline from Earth's centre outward, so the recede reads as motion */}
      <div
        style={{
          position: 'absolute',
          left: W / 2 - 470,
          top: 1080,
          width: lerp(620, 900, drift) * enter,
          height: 1,
          background: `linear-gradient(90deg, ${alpha(C.gold, 0.55)}, ${alpha(C.gold, 0)})`,
        }}
      />

      <Readout
        value="3,8"
        unit="cm / tahun"
        note="secepat kuku Anda tumbuh"
        at={shot.start + 3.1}
        t={t}
        y={520}
        color={C.gold}
        size={168}
      />

      {/* the word that opens the film, big, quiet, no effects */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: 1330,
          textAlign: 'center',
          opacity: eOut(clamp((local - 0.35) / 0.8)) * (1 - clamp((local - 3.0) / 0.6)),
          fontFamily: '"Fraunces"',
          fontStyle: 'italic',
          fontSize: 54,
          color: C.muted,
          letterSpacing: '-0.01em',
        }}
      >
        setiap malam, sedikit lebih jauh
      </div>
    </AbsoluteFill>
  );
};
