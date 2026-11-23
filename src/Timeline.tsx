import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {tl} from './timeline';
import {FontGate} from './Fonts';
import {Hud} from './ui/Hud';
import {Grain, Vignette} from './ui/Backdrop';
import {CropMarks} from './ui/Frame';
import {Act1} from './acts/Act1';
import {Act2} from './acts/Act2';
import {Act3} from './acts/Act3';
import {Act4} from './acts/Act4';
import {Act5} from './acts/Act5';
import {Act6} from './acts/Act6';
import {Act7} from './acts/Act7';
import {C} from './theme';

const ACTS = [Act1, Act2, Act3, Act4, Act5, Act6, Act7];

const CutFlash: React.FC<{t: number}> = ({t}) => {
  const boundary = tl.acts.find((a) => Math.abs(t - a.start) < 0.16);
  if (!boundary) return null;
  const d = Math.abs(t - boundary.start);
  const o = interpolate(d, [0, 0.16], [0.5, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.amber}00, ${C.amber}44, ${C.amber}00)`, opacity: o}} />
      <AbsoluteFill style={{background: '#fff', opacity: o * 0.06}} />
    </AbsoluteFill>
  );
};

export const Naysi: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const hit = tl.acts.findIndex((a) => t >= a.start && t < a.end);
  // after the last act ends we keep holding its final frame through the tail
  const actIndex = hit === -1 ? tl.acts.length - 1 : hit;
  const Current = ACTS[Math.min(actIndex, ACTS.length - 1)];
  const act = tl.acts[Math.min(actIndex, tl.acts.length - 1)];
  const fadeIn = interpolate(t, [0, 0.5], [0, 1], {extrapolateRight: 'clamp'});
  const tail = 1 - interpolate(t, [tl.durationSec - 0.7, tl.durationSec - 0.05], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <FontGate>
      <AbsoluteFill style={{background: C.bg}}>
        <AbsoluteFill style={{opacity: Math.min(fadeIn, tail)}}>
          <Current act={act} />
        </AbsoluteFill>
        <Hud tl={tl} actIndex={Math.min(actIndex, tl.acts.length - 1)} />
        <CutFlash t={t} />
        <CropMarks />
        <Grain opacity={0.075} />
        <Vignette />
        <Audio src={staticFile('audio/master.wav')} />
      </AbsoluteFill>
    </FontGate>
  );
};
