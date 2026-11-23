import raw from './data/timeline.json';

export type Word = {w: string; t: number; d: number};
export type Phrase = {words: Word[]; start: number; end: number; index: number};
export type Act = {
  index: number; id: string; label: string; vo: string;
  voStart: number; voEnd: number; start: number; end: number;
  words: Word[]; phrases: Phrase[];
};
export type Timeline = {
  fps: number; width: number; height: number; durationInFrames: number; durationSec: number; acts: Act[];
};
export const tl = raw as unknown as Timeline;
export const actByIndex = (i: number) => tl.acts[i];
