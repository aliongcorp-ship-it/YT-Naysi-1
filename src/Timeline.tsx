import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {tl, actAt, type Act, type Shot} from './timeline';
import {FontGate} from './Fonts';
import {Grain, Optics} from './ui/Atmosphere';
import {DepthRail, Marks, Strap} from './ui/Hud';
import {Caption} from './ui/Caption';
import {C, clamp, eOut} from './theme';
import {Maps} from './scenes/Maps';
import {DepthTease} from './scenes/DepthTease';
import {Grid} from './scenes/Grid';
import {Targets} from './scenes/Targets';
import {Descend} from './scenes/Descend';
import {Peel} from './scenes/Peel';
import {Slab} from './scenes/Slab';
import {Specimens} from './scenes/Specimens';
import {Column} from './scenes/Column';
import {Spectrum} from './scenes/Spectrum';
import {Ridge} from './scenes/Ridge';
import {Stakes} from './scenes/Stakes';
import {Surface} from './scenes/Surface';

type SceneComp = React.FC<{act: Act; shot: Shot}>;
const SCENES: Record<string, SceneComp> = {
  Maps,
  DepthTease,
  Grid,
  Targets,
  Descend,
  Peel,
  Slab,
  Specimens,
  Column,
  Spectrum,
  Ridge,
  Stakes,
  Surface,
};

// What each shot tells the HUD: where we are in the water, and what colour the
// chapter accent is. Kept in one table so the film never contradicts itself.
type ShotMeta = {depth: (local: number, shot: Shot, act: Act) => number; accent: string; rail: boolean};
const META: Record<string, ShotMeta> = {
  Maps: {depth: () => 0, accent: C.sonar, rail: false},
  DepthTease: {depth: (l) => 7440 * clamp((l - 0.5) / 6.6), accent: C.sonar, rail: true},
  Grid: {depth: () => 120, accent: C.sonar, rail: false},
  Targets: {depth: () => 420, accent: C.sonar, rail: true},
  Descend: {depth: (l) => 7440 * clamp((l - 1) / 16), accent: C.sonar, rail: true},
  Peel: {depth: () => 7440, accent: C.iris, rail: true},
  Slab: {depth: () => 7440, accent: C.iris, rail: false},
  Specimens: {depth: () => 6800, accent: C.sonar, rail: false},
  Column: {depth: (l) => 7100 * clamp((l - 1) / 9.4), accent: C.ember, rail: false},
  Spectrum: {depth: (l) => 300 + 2400 * clamp(l / 7.4), accent: C.iris, rail: true},
  Ridge: {depth: () => 2400, accent: C.magma, rail: false},
  Stakes: {depth: () => 3000, accent: C.sonar, rail: true},
  Surface: {depth: (l) => 300 * (1 - clamp((l - 0.4) / 4.4)), accent: C.foam, rail: true},
};

const cutAt = (t: number) => {
  let found = tl.shots[0];
  for (const s of tl.shots) if (t >= s.start - 0.0001) found = s;
  return found;
};

// A designed cut: 3 frames of underwater bloom, a 0.4% camera punch, and a
// hairline that draws itself across the top of frame.
const Cut: React.FC<{local: number}> = ({local}) => {
  const d = clamp(local / 0.24);
  const o = Math.pow(1 - Math.min(1, local / 0.16), 2);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {local < 0.24 ? (
        <>
          <AbsoluteFill style={{background: '#DFF9F6', opacity: o * 0.12}} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(95,243,224,0.16), transparent 40%)', opacity: o * 0.9}} />
        </>
      ) : null}
      {d < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: 3,
            width: `${eOut(d) * 100}%`,
            background: `linear-gradient(90deg, transparent, ${C.sonar}, transparent)`,
            opacity: (1 - d) * 0.8,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const shot = cutAt(t);
  const act = actAt(t);
  const Comp = SCENES[shot.scene] ?? Maps;
  const meta = META[shot.scene] ?? META.Maps;
  const local = t - shot.start;
  const localClamped = Math.min(local, shot.frames / fps + 0.4);
  const depth = meta.depth(Math.max(0, localClamped), shot, act);

  const enter = eOut(clamp(local / 0.4));
  const punch = 1 + 0.004 * (1 - enter);
  const fadeIn = interpolate(t, [0, 0.45], [0, 1], {extrapolateRight: 'clamp'});
  const isLast = shot.index === tl.shots.length - 1;
  const fadeOut = isLast ? interpolate(t, [tl.durationSec - 1.2, tl.durationSec - 0.05], [1, 0], {extrapolateRight: 'clamp'}) : 1;
  const chrome = interpolate(t, [0.25, 1.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <FontGate>
      <AbsoluteFill style={{background: C.void}}>
        <AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut), transform: `scale(${punch})`, transformOrigin: '50% 46%'}}>
          <Comp act={act} shot={shot} />
          <Cut local={local} />
        </AbsoluteFill>

        {/* captions live outside the shot so they never restart on a cut */}
        <div style={{opacity: Math.min(fadeIn, fadeOut)}}>
          <Caption act={act} t={t} accent={meta.accent} />
        </div>

        <div style={{opacity: chrome * (isLast ? fadeOut : 1)}}>
          <Marks opacity={0.24} />
          <Strap tl={tl} act={act} t={t} accent={meta.accent} shot={shot} />
          {meta.rail ? <DepthRail depth={depth} opacity={0.9} /> : null}
        </div>

        
        <Grain opacity={0.05} />
        <Optics />
        <AbsoluteFill style={{background: '#000', opacity: 1 - Math.min(fadeIn, fadeOut)}} />
        <Audio src={staticFile('audio/master.wav')} />
      </AbsoluteFill>
    </FontGate>
  );
};
