import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Timeline';
import {tl} from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition id="Specimen" component={Film} durationInFrames={tl.durationInFrames} fps={tl.fps} width={tl.width} height={tl.height} />
);
