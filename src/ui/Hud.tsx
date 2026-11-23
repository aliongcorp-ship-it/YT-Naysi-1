import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, F, SAFE} from '../theme';
import type {Timeline} from '../timeline';

export const Hud: React.FC<{tl: Timeline; actIndex: number}> = ({tl, actIndex}) => {
  const f = useCurrentFrame();
  const t = f / tl.fps;
  const p = interpolate(t, [0, tl.durationSec], [0, 1], {extrapolateRight: 'clamp'});
  const act = tl.acts[actIndex];
  const appear = interpolate(t, [0.2, 0.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{fontFamily: F.mono, color: C.dim, opacity: appear}}>
      <div style={{position: 'absolute', left: SAFE.left, top: 104, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: C.amber, boxShadow: `0 0 22px ${C.amber}`}} />
        <span style={{fontSize: 30, letterSpacing: '0.42em', color: C.ink, fontWeight: 700}}>NAYSI</span>
        <span style={{fontSize: 26, letterSpacing: '0.3em', color: C.steel}}>/{String(act.index).padStart(2, '0')}</span>
      </div>
      <div style={{position: 'absolute', right: 232, top: 104, fontSize: 27, letterSpacing: '0.28em', color: C.dim, textAlign: 'right'}}>
        {act.label}
      </div>
      <div style={{position: 'absolute', left: SAFE.left, right: 260, top: 2216, height: 3, background: 'rgba(244,241,234,0.12)'}}>
        <div style={{width: `${p * 100}%`, height: 3, background: C.amber, boxShadow: `0 0 16px ${C.amber}`}} />
        {tl.acts.map((a) => (
          <div key={a.id} style={{position: 'absolute', left: `${(a.start / tl.durationSec) * 100}%`, top: -5, width: 2, height: 13, background: 'rgba(244,241,234,0.35)'}} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
