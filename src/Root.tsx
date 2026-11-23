import React from 'react';
import {Composition} from 'remotion';
import {Naysi} from './Timeline';
import {tl} from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Naysi"
    component={Naysi}
    durationInFrames={tl.durationInFrames}
    fps={tl.fps}
    width={tl.width}
    height={tl.height}
  />
);
