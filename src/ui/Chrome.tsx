import React from 'react';
import {interpolate} from 'remotion';
import type {Act} from '../timeline';
import {SAFE, clamp, eOut} from '../theme';
import {P, T} from '../../scenes/bulan.mjs';

/* ───────────────────────────────  watermark  ─────────────────────────────── */
// The only chrome in the film: the channel name, set small, in the top-right
// corner of the safe area, at a fixed opacity. No act index, no chapter name,
// no series tag, no progress rule, no corner brackets. It fades in once at the
// head and out once at the tail so it never pops.
export const Watermark: React.FC<{t: number; total: number}> = ({t, total}) => {
  const inP = interpolate(t, [0.35, 1.15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outP = interpolate(t, [total - 1.0, total - 0.15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        right: 1440 - SAFE.right,
        top: SAFE.top - 34,
        opacity: inP * outP * 0.6,
        fontFamily: T.mono,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: '0.42em',
        color: P.ink,
      }}
    >
      NAYSI
    </div>
  );
};

/* ───────────────────────────────  captions  ──────────────────────────────── */
// One thought on screen at a time, serif, centred above the Shorts shelf.
// Words are packed into cards by the clause so a number never gets orphaned;
// emphasis is handed to the words the act declares in `em`.

const isEm = (word: string, em: string[]) => {
  const bare = word.toLowerCase().replace(/[^a-z0-9,.]/g, '');
  return em.some((e) => {
    const t = e.toLowerCase().replace(/[^a-z0-9,.]/g, '');
    return t.length > 0 && (bare === t || bare.startsWith(t) || t.startsWith(bare));
  });
};

type Flat = {w: string; t: number; d: number};
type Card = {start: number; end: number; words: {w: string; t: number}[]};

const pack = (words: Flat[], max: number): Flat[][] => {
  const out: Flat[][] = [];
  let cur: Flat[] = [];
  const len = (ws: Flat[]) => ws.reduce((a, w) => a + w.w.length + 1, 0);
  for (const w of words) {
    const test = [...cur, w];
    if (cur.length && len(test) > max) {
      out.push(cur);
      cur = [w];
    } else cur = test;
    if (/[,;:]$/.test(w.w) && len(cur) >= max * 0.55) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

const cards = (words: Flat[]): Card[] => {
  const out: Card[] = [];
  const sentences: Flat[][] = [];
  let s: Flat[] = [];
  for (const w of words) {
    s.push(w);
    if (/[.!?]$/.test(w.w)) {
      sentences.push(s);
      s = [];
    }
  }
  if (s.length) sentences.push(s);
  for (const sent of sentences) {
    for (const g of pack(sent, 34)) {
      const chars = g.reduce((a, w) => a + w.w.length + 1, 0);
      const prev = out[out.length - 1];
      if (prev && (g.length <= 2 || chars < 20)) {
        prev.words.push(...g.map(({w, t}) => ({w, t})));
        prev.end = +(g[g.length - 1].t + g[g.length - 1].d).toFixed(3);
        continue;
      }
      out.push({
        start: g[0].t,
        end: +(g[g.length - 1].t + g[g.length - 1].d).toFixed(3),
        words: g.map(({w, t}) => ({w, t})),
      });
    }
  }
  return out;
};

const sizeFor = (chars: number) => {
  if (chars <= 16) return 92;
  if (chars <= 26) return 82;
  if (chars <= 34) return 74;
  return 68;
};

export const Caption: React.FC<{act: Act; t: number}> = ({act, t}) => {
  const groups = cards(act.words.map((w) => ({w: w.w, t: w.t, d: w.d})));
  let current = -1;
  for (let i = 0; i < groups.length; i++) {
    const next = groups[i + 1];
    if (t >= groups[i].start - 0.07 && (!next || t < next.start - 0.07)) current = i;
  }
  if (current < 0) return null;
  const g = groups[current];
  const next = groups[current + 1];

  const inP = interpolate(t, [g.start - 0.07, g.start + 0.22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitStart = next ? next.start - 0.18 : g.end + 1.05;
  const exit = interpolate(t, [exitStart, exitStart + 0.15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const chars = g.words.reduce((a, w) => a + w.w.length + 1, 0);
  const size = sizeFor(chars);
  const em = act.em ?? [];

  return (
    <div
      style={{
        position: 'absolute',
        left: (1440 - SAFE.captionWidth) / 2,
        width: SAFE.captionWidth,
        top: SAFE.caption,
        textAlign: 'center',
        opacity: Math.min(inP, 1 - exit),
        transform: `translateY(${(1 - inP) * 14 - exit * 10}px)`,
        fontFamily: T.display,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: '-0.014em',
        color: P.ink,
        textWrap: 'balance',
      }}
    >
      {g.words.map((w, i) => {
        const hot = isEm(w.w, em);
        const spoken = t >= w.t;
        return (
          <span
            key={i}
            style={{
              color: hot ? P.accent : P.ink,
              fontStyle: hot ? 'italic' : 'normal',
              opacity: spoken ? 1 : 0.5,
            }}
          >
            {w.w}
            {i < g.words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};

/* ───────────────────────────  topic caption  ─────────────────────────────── */
// A headline that belongs to the picture rather than to the narration: the
// opening question, sitting above the moon like a plate caption.
export const Kicker: React.FC<{text: string; at: number; t: number; y?: number; hold?: number; color?: string}> = ({
  text,
  at,
  t,
  y = 430,
  hold = 99,
  color = P.muted,
}) => {
  const local = t - at;
  if (local < -0.01) return null;
  const inP = eOut(clamp(local / 0.6));
  const out = clamp((local - hold) / 0.6);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: 1440,
        top: y,
        textAlign: 'center',
        opacity: inP * (1 - out),
        transform: `translateY(${(1 - inP) * 18}px)`,
        fontFamily: T.mono,
        fontSize: 24,
        letterSpacing: '0.34em',
        color,
      }}
    >
      {text}
    </div>
  );
};
