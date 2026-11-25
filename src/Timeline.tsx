import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {tl, actAt, type Act, type Shot} from './timeline';
import {FontGate} from './Fonts';
import {Caption, Watermark} from './ui/Chrome';
import {Grain, Vignette} from './ui/Texture';
import {ID, fonts} from '../scenes/bulan';
import y1 from '../scenes/y1';
import y2 from '../scenes/y2';
import y3 from '../scenes/y3';
import y4 from '../scenes/y4';
import y5 from '../scenes/y5';
import y6 from '../scenes/y6';
import y7 from '../scenes/y7';
import y8 from '../scenes/y8';
import y9 from '../scenes/y9';
import y10 from '../scenes/y10';
import y11 from '../scenes/y11';
import y12 from '../scenes/y12';
import y13 from '../scenes/y13';
import y14 from '../scenes/y14';
import y15 from '../scenes/y15';
import y16 from '../scenes/y16';
import type {SceneProps} from '../scenes/types';
import {clamp, eOut, eOutQuint} from './theme';

// The shot table: file name -> composition, exactly the names `script.tsx` uses.
// A new episode replaces these imports and its own topic file; the rest of this
// component is episode-agnostic. A shot named in the script but missing here
// renders nothing rather than borrowing a neighbour's picture.
const SCENES: Record<string, React.FC<SceneProps>> = {
  y1, y2, y3, y4, y5, y6, y7, y8, y9, y10, y11, y12, y13, y14, y15, y16,
};

const shotAt = (t: number): Shot => {
  let found = tl.shots[0];
  for (const s of tl.shots) if (t >= s.start - 0.0001) found = s;
  return found;
};

/* The cut. `motion.cut` in the topic file decides which one happens.
   'paper' — this episode: the new sheet arrives 6 px low and settles, with a
   bone hairline drawn across the join and retracted. It reads as a press
   impression, not as a flash, so it never costs the viewer a frame of legibility.
   'cut' — a 1 px rule sweeping across the top third. 'iris', 'bloom' — unused. */
const Cut: React.FC<{local: number; index: number}> = ({local, index}) => {
  if (index === 0) return null;
  if (ID.motion.cut === 'paper') {
    const d = clamp(local / 0.34);
    if (d >= 1) return null;
    const settle = 6 * (1 - eOutQuint(d));
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1180 - settle,
            height: 1,
            background: `linear-gradient(90deg, transparent 0%, ${ID.palette.ink} 18%, ${ID.palette.ink} 82%, transparent 100%)`,
            opacity: (1 - d) * 0.28,
          }}
        />
      </AbsoluteFill>
    );
  }
  if (ID.motion.cut !== 'cut') return null;
  const d = clamp(local / 0.24);
  if (d >= 1) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: 620,
          left: 0,
          height: 1,
          width: `${eOutQuint(d) * 100}%`,
          background: `linear-gradient(90deg, ${ID.palette.ink} 0%, ${ID.palette.ink} 70%, transparent 100%)`,
          opacity: (1 - d) * 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const shot = shotAt(t);
  const act = actAt(t);
  const Comp = SCENES[shot.file];
  const local = t - shot.start;

  // Every shot opens on a settle rather than a freeze: the punch (1.022) relaxes
  // over the first 1.8 s, and on a 'paper' cut the sheet also arrives 6 px low.
  // It is the only camera move in the film.
  const enter = eOut(clamp(local / 0.42));
  const push = 1 + (ID.motion.punch - 1) * (1 - eOut(clamp(local / 1.8)));

  const fadeIn = interpolate(t, [0, 0.55], [0, 1], {extrapolateRight: 'clamp'});
  const isLast = shot.index === tl.shots.length - 1;
  const fadeOut = isLast
    ? interpolate(t, [tl.durationSec - 1.1, tl.durationSec - 0.03], [1, 0], {extrapolateRight: 'clamp'})
    : 1;
  const veil = Math.min(fadeIn, fadeOut);

  return (
    <FontGate faces={fonts}>
      <AbsoluteFill style={{background: ID.palette.void}}>
        <AbsoluteFill style={{opacity: veil, transform: `scale(${push})`, transformOrigin: '50% 52%'}}>
          {Comp ? <Comp act={act} shot={shot} t={t} local={local} total={tl.durationSec} /> : null}
          <Cut local={local} index={shot.index} />
        </AbsoluteFill>

        {/* Captions live outside the shot so a cut never restarts the sentence. */}
        <div style={{opacity: veil}}>
          <Caption act={act} t={t} />
          <Watermark t={t} total={tl.durationSec} />
        </div>

        <Grain opacity={ID.motion.grain} tint={ID.palette.warm} />
        <Vignette strength={0.82} color={ID.palette.void} />
        <AbsoluteFill style={{background: ID.palette.void, opacity: 1 - veil}} />
        <Audio src={staticFile('audio/master.flac')} />
      </AbsoluteFill>
    </FontGate>
  );
};
