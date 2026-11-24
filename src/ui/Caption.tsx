import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F, SAFE, clamp, eOut} from '../theme';
import type {Act} from '../timeline';

// Caption sizing: wide lines get smaller, dense lines break earlier.
const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N},.]/gu, '').replace(/,$/, '');

const sizeFor = (ph: {words: {w: string}[]}) => {
  const chars = ph.words.reduce((a, w) => a + w.w.length + 1, 0);
  const longest = Math.max(...ph.words.map((w) => w.w.length));
  let s = interpolate(chars, [10, 44], [120, 76], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (longest > 14) s = Math.min(s, 70);
  if (ph.words.length > 5) s *= 0.92;
  if (chars > 34) s *= 0.9;
  return Math.round(s);
};

export const Caption: React.FC<{act: Act; t: number; accent?: string}> = ({act, t, accent = C.sonar}) => {
  const em = new Set((act.em ?? []).map(norm));
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phrases = act.phrases;

  let current = -1;
  for (let i = 0; i < phrases.length; i++) {
    const next = phrases[i + 1];
    const holdTo = next ? next.start - 0.05 : phrases[i].end + 0.75;
    if (t >= phrases[i].start - 0.04 && t < holdTo) current = i;
  }
  if (current < 0) return null;
  const ph = phrases[current];
  const next = phrases[current + 1];
  const exitAt = next ? next.start - 0.05 : ph.end + 0.75;
  const exit = eOut(clamp((t - exitAt) / 0.22));
  const size = sizeFor(ph);

  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        width: 1110,
        top: SAFE.caption,
        opacity: 1 - exit,
        transform: `translateY(${-30 * exit}px)`,
        fontFamily: F.display,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 0.97,
        letterSpacing: '-0.028em',
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: '0.26em',
        rowGap: '0.04em',
        textShadow: '0 14px 54px rgba(0,0,0,0.9), 0 2px 0 rgba(0,0,0,0.5)',
      }}
    >
      {ph.words.map((word, i) => {
        const startFrame = word.t * fps;
        const s = spring({frame: frame - startFrame, fps, config: {damping: 21, mass: 0.52, stiffness: 260}});
        const spoken = t >= word.t - 0.02;
        const active = t >= word.t - 0.02 && t < word.t + Math.max(0.2, word.d) + 0.05;
        const emphasized = em.has(norm(word.w)) || /\d/.test(word.w);
        return (
          <span key={`${current}-${i}`} style={{display: 'inline-block', position: 'relative'}}>
            <span
              style={{
                display: 'inline-block',
                color: active || (emphasized && spoken) ? accent : spoken ? C.ink : 'rgba(242,251,251,0.2)',
                opacity: spoken ? 1 : 0,
                transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px) scale(${interpolate(s, [0, 1], [0.92, 1])}) scale(${active ? 1.035 : 1})`,
                transformOrigin: 'left center',
                filter: active || emphasized ? `drop-shadow(0 0 28px ${accent}${active ? '77' : '44'})` : undefined,
                transition: 'none',
              }}
            >
              {word.w}
            </span>
            {active ? (
              <span
                style={{
                  position: 'absolute',
                  left: -2,
                  right: -2,
                  bottom: -size * 0.12,
                  height: 4,
                  background: accent,
                  borderRadius: 4,
                  transform: `scaleX(${clamp((t - word.t) / 0.16)})`,
                  transformOrigin: 'left center',
                  boxShadow: `0 0 18px ${accent}`,
                }}
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
};
