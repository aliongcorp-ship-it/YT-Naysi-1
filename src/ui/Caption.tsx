import React from 'react';
import {spring, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {C, F, SAFE} from '../theme';
import type {Act} from '../timeline';

const sizeFor = (chars: number, n: number) => {
  const byLen = interpolate(chars, [12, 46], [122, 84], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return Math.round(n >= 4 ? byLen * 0.94 : byLen);
};

export const Caption: React.FC<{act: Act; t: number}> = ({act, t}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phrases = act.phrases;
  let current = -1;
  for (let i = 0; i < phrases.length; i++) {
    const next = phrases[i + 1];
    if (t >= phrases[i].start - 0.06 && (!next || t < next.start - 0.06)) current = i;
  }
  if (current < 0) return null;
  const ph = phrases[current];
  const next = phrases[current + 1];
  const exitStart = next ? next.start - 0.14 : ph.end + 0.05;
  const exit = interpolate(t, [exitStart, exitStart + 0.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const chars = ph.words.reduce((a, w) => a + w.w.length + 1, 0);
  const size = sizeFor(chars, ph.words.length);
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        right: 1440 - SAFE.right + 60,
        top: SAFE.caption,
        opacity: 1 - exit,
        transform: `translateY(${-26 * exit}px)`,
        fontFamily: F.display,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: '-0.024em',
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: '0.24em',
        rowGap: '0.02em',
        textShadow: '0 10px 40px rgba(0,0,0,0.75)',
      }}
    >
      {ph.words.map((word, i) => {
        const startFrame = word.t * fps;
        const s = spring({frame: frame - startFrame, fps, config: {damping: 22, mass: 0.55, stiffness: 240}});
        const active = t >= word.t && t < word.t + word.d + 0.02;
        const spoken = t >= word.t;
        return (
          <span
            key={`${current}-${i}`}
            style={{
              display: 'inline-block',
              color: active ? C.amber : spoken ? C.ink : 'rgba(244,241,234,0.24)',
              opacity: spoken ? 1 : 0,
              transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px) scale(${interpolate(s, [0, 1], [0.94, 1])})`,
              filter: active ? `drop-shadow(0 0 26px rgba(255,192,74,0.35))` : undefined,
            }}
          >
            {word.w}
          </span>
        );
      })}
    </div>
  );
};
