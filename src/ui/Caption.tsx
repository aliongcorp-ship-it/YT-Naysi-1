import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F, SAFE} from '../theme';
import type {Act} from '../timeline';

// The reference film keeps one sentence on screen at a time, centred, three
// lines maximum, and hands the colour accent only to the words that carry the
// number. We do the same, but the emphasis is driven by the act's `em` list so
// the highlighted word always matches the beat being spoken.

const isEm = (word: string, em: string[]) => {
  const bare = word.toLowerCase().replace(/[^a-z0-9,.]/g, '');
  return em.some((e) => {
    const t = e.toLowerCase().replace(/[^a-z0-9,.]/g, '');
    return t.length > 0 && (bare === t || bare.startsWith(t) || t.startsWith(bare));
  });
};

type Flat = {w: string; t: number; d: number};
type Card = {start: number; end: number; words: {w: string; t: number}[]};

// Cards are built on the sentence, then on the clause, and only as a last
// resort on the word — never on a character count, because that is what turns
// "tiga ratus delapan puluh empat ribu" into a meaningless "puluh empat ribu".
const pack = (words: Flat[], max: number): Flat[][] => {
  const out: Flat[][] = [];
  let cur: Flat[] = [];
  const len = (ws: Flat[]) => ws.reduce((a, w) => a + w.w.length + 1, 0);
  for (const w of words) {
    const test = [...cur, w];
    if (cur.length && len(test) > max) {
      out.push(cur);
      cur = [w];
    } else {
      cur = test;
    }
    // a comma is a free break: close the card when the clause ends and the
    // card is already substantial
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
  // 1. split into sentences on terminal punctuation
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
    // 2. a sentence that will not fit on three lines is split at its clauses,
    //    and only if a single clause is still too long, at the word
    const groups = pack(sent, 52);
    for (const g of groups) {
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
  if (chars <= 24) return 84;
  if (chars <= 38) return 74;
  if (chars <= 52) return 66;
  return 60;
};

export const Caption: React.FC<{act: Act; t: number}> = ({act, t}) => {
  // flatten the act's words once, then let the card builder group them
  const flat: Flat[] = act.words.map((w) => ({w: w.w, t: w.t, d: w.d}));
  const groups = cards(flat);
  let current = -1;
  for (let i = 0; i < groups.length; i++) {
    const next = groups[i + 1];
    if (t >= groups[i].start - 0.08 && (!next || t < next.start - 0.08)) current = i;
  }
  if (current < 0) return null;
  const g = groups[current];
  const next = groups[current + 1];

  // cards cross-fade quickly so the sentence feels replaced, not animated in
  const inP = interpolate(t, [g.start - 0.08, g.start + 0.20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitStart = next ? next.start - 0.20 : g.end + 0.6;
  const exit = interpolate(t, [exitStart, exitStart + 0.16], [0, 1], {
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
        transform: `translateY(${(1 - inP) * 16 - exit * 12}px)`,
        fontFamily: F.display,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.16,
        letterSpacing: '-0.021em',
        color: C.ink,
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
              color: hot ? C.gold : C.ink,
              // unspoken words are dimmed rather than hidden: it reads as a
              // teleprompter keeping pace with the voice
              opacity: spoken ? 1 : 0.55,
              transition: 'none',
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

// A thin progress rule under the episode chrome, like the reference's segment
// ticks: it tells the viewer how many chapters are left without a number.
export const ChapterRule: React.FC<{act: Act; total: number; t: number}> = ({act, total, t}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        right: 1440 - SAFE.right,
        top: 2062,
        height: 3,
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        opacity: 0.9,
      }}
    >
      {Array.from({length: total}).map((_, i) => {
        const on = i + 1 < act.index;
        const now = i + 1 === act.index;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: now ? 3 : 2,
              background: on ? C.goldDim : now ? C.gold : C.faint,
            }}
          />
        );
      })}
    </div>
  );
};
