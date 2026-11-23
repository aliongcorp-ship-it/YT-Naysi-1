import React from 'react';
import {C} from '../theme';

const Mark: React.FC<{x: number; y: number; rot: number; color?: string; opacity?: number}> = ({x, y, rot, color = C.ink, opacity = 0.28}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 46, height: 46, transform: `rotate(${rot}deg)`, opacity}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 46, height: 2, background: color}} />
    <div style={{position: 'absolute', left: 0, top: 0, width: 2, height: 46, background: color}} />
  </div>
);

export const CropMarks: React.FC = () => (
  <>
    <Mark x={54} y={54} rot={0} />
    <Mark x={1440 - 100} y={54} rot={90} />
    <Mark x={1440 - 100} y={2560 - 100} rot={180} />
    <Mark x={54} y={2560 - 100} rot={270} />
  </>
);

export const ActStatement: React.FC<{children: React.ReactNode; opacity?: number; y?: number}> = ({children, opacity = 1, y = 1520}) => (
  <div
    style={{
      position: 'absolute', left: 96, right: 144, top: y, opacity,
      fontFamily: 'Bricolage', fontWeight: 800, fontSize: 74, letterSpacing: '-0.03em',
      color: C.ink, lineHeight: 1.02, textTransform: 'uppercase',
    }}
  >
    {children}
  </div>
);
