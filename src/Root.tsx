import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Timeline';
import {tl} from './timeline';
import {ID} from '../scenes/bulan';

/* The composition id is the episode's own identity slug, so a still is asked for
   by name (`remotion still src/index.ts sidereal`) and the old episode's output
   can never be produced by accident. */
export const RemotionRoot: React.FC = () => (
  <Composition
    id={ID.id}
    component={Film}
    durationInFrames={tl.durationInFrames}
    fps={tl.fps}
    width={tl.width}
    height={tl.height}
  />
);
