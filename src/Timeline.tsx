import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {tl, actAt, type Act, type Shot} from './timeline';
import {FontGate} from './Fonts';
import {Grain, Vignette} from './ui/Atmosphere';
import {Marks, Strap} from './ui/Hud';
import {Caption, ChapterRule} from './ui/Caption';
import {C, clamp, eOut} from './theme';
import {Depart} from './scenes/Depart';
import {Mirror} from './scenes/Mirror';
import {Photon} from './scenes/Photon';
import {Precision} from './scenes/Precision';
import {Tide} from './scenes/Tide';
import {SlowDay} from './scenes/SlowDay';
import {Archive} from './scenes/Archive';
import {Drift} from './scenes/Drift';

type SceneComp = React.FC<{act: Act; shot: Shot}>;
const SCENES: Record<string, SceneComp> = {
  Depart,
  Mirror,
  Photon,
  Precision,
  Tide,
  SlowDay,
  Archive,
  Drift,
};

const cutAt = (t: number) => {
  let found = tl.shots[0];
  for (const s of tl.shots) if (t >= s.start - 0.0001) found = s;
  return found;
};

/* A designed cut, not an effect: one frame of the outgoing picture holding,
   then a hard swap with a 2 px gold hairline that wipes left-to-right in 0.18 s.
   No flash, no bloom — the reference cuts on a dissolve, so ours is a clean
   replace with a measured rule. */
const Cut: React.FC<{local: number}> = ({local}) => {
  const d = clamp(local / 0.22);
  if (d >= 1) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: 2,
          width: `${eOut(d) * 100}%`,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          opacity: (1 - d) * 0.55,
        }}
      />
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const shot = cutAt(t);
  const act = actAt(t);
  const Comp = SCENES[shot.scene] ?? Depart;
  const local = t - shot.start;

  const enter = eOut(clamp(local / 0.4));
  // every shot opens on a slow settle rather than a still frame
  const push = 1.045 - 0.045 * eOut(clamp(local / 1.6));
  const punch = (1 + 0.0025 * (1 - enter)) * push;

  const fadeIn = interpolate(t, [0, 0.5], [0, 1], {extrapolateRight: 'clamp'});
  const isLast = shot.index === tl.shots.length - 1;
  const fadeOut = isLast
    ? interpolate(t, [tl.durationSec - 1.4, tl.durationSec - 0.05], [1, 0], {extrapolateRight: 'clamp'})
    : 1;
  const chrome = interpolate(t, [0.2, 0.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <FontGate>
      <AbsoluteFill style={{background: C.void}}>
        <AbsoluteFill
          style={{
            opacity: Math.min(fadeIn, fadeOut),
            transform: `scale(${punch})`,
            transformOrigin: '50% 50%',
          }}
        >
          <Comp act={act} shot={shot} />
          <Cut local={local} />
        </AbsoluteFill>

        {/* captions sit outside the shot so they never restart on a cut */}
        <div style={{opacity: Math.min(fadeIn, fadeOut)}}>
          <Caption act={act} t={t} />
          <ChapterRule act={act} total={tl.acts.length} t={t} />
        </div>

        <div style={{opacity: chrome * (isLast ? fadeOut : 1)}}>
          <Marks opacity={0.26} />
          <Strap act={act} t={t} shot={shot} total={tl.shots.length} />
        </div>

        <Grain opacity={0.045} />
        <Vignette strength={0.7} />
        <AbsoluteFill style={{background: '#04060D', opacity: 1 - Math.min(fadeIn, fadeOut)}} />
        <Audio src={staticFile('audio/master.wav')} />
      </AbsoluteFill>
    </FontGate>
  );
};
