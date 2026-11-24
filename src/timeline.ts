import raw from './data/timeline.json';

export type Word = {w: string; t: number; d: number};
export type Phrase = {words: Word[]; start: number; end: number; index: number};
export type Act = {
  index: number;
  id: string;
  chapter: string;
  slate: string;
  em: string[];
  vo: string;
  voStart: number;
  voEnd: number;
  start: number;
  end: number;
  startFrame: number;
  endFrame: number;
  words: Word[];
  phrases: Phrase[];
};
export type Shot = {
  index: number;
  act: string;
  actIndex: number;
  scene: string;
  label: string;
  start: number;
  end: number;
  startFrame: number;
  endFrame: number;
  outFrame: number;
  frames: number;
};

export type Timeline = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  durationSec: number;
  acts: Act[];
  shots: Shot[];
};

export const tl = raw as unknown as Timeline;
export const actAt = (t: number): Act => {
  let found = tl.acts[0];
  for (const a of tl.acts) if (t >= a.start - 0.0001) found = a;
  return found;
};
