import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, eOut, eOutQuint} from '../theme';

export const useLocal = (startSec: number) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {t: f / fps - startSec, frame: f - startSec * fps, fps};
};

export const ease = (t: number, at: number, dur = 0.5) => eOut(clamp((t - at) / dur, 0, 1));
export const easeQ = (t: number, at: number, dur = 0.5) => eOutQuint(clamp((t - at) / dur, 0, 1));
export const appear = (t: number, at: number, dur = 0.4) => clamp((t - at) / dur, 0, 1);
export const fadeOut = (t: number, at: number, dur = 0.4) => 1 - clamp((t - at) / dur, 0, 1);
export const sp = (frame: number, fps: number, config = {damping: 24, mass: 0.6, stiffness: 180}) =>
  spring({frame, fps, config});
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
