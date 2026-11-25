/* y8 — karang purba
   The archive in the rock. A cut section of fossil coral: growth bands that are
   one day each, grouped into years, with the annual bundles slowly getting
   denser toward the top of the core. It reads as a core sample in a survey
   report, because that is what it is — Devonian coral counting 400 days to the
   year, before the Moon had finished moving out. */

import React from 'react';
import type {SceneProps} from './types';
import {AbsoluteFill} from 'remotion';
import {P, T} from './bulan';
import {Dust} from '../src/ui/Texture';
import {alpha, clamp, eOut, hash, lerp} from '../src/theme';

const X0 = 232; // the core, left edge
const X1 = 1208; // right edge
const Y0 = 486;
const COLS = 27; // one column = one day
const YEARS = 6;

export const Compo: React.FC<SceneProps> = ({local, act}) => {
  const D = act.end - act.start;

  // The core is read from the bottom up: the oldest days first, the newest at
  // the top, exactly how you would count a specimen.
  const read = clamp((local - 0.5) / (D * 0.62));
  const count = eOut(clamp((local - (D * 0.68)) / 1.8));
  const old = eOut(clamp((local - 0.4) / 1.6));

  return (
    <AbsoluteFill style={{background: '#080605'}}>
      <AbsoluteFill style={{background: 'linear-gradient(178deg, #0B0806 0%, #090605 56%, #050403 100%)'}} />
      <Dust n={520} seed={91} opacity={0.36} color={P.ink} />

      <Section read={read} />
      <Scale read={read} />
      <Headline old={old} />
      <Counter count={count} />
    </AbsoluteFill>
  );
};

/* The section: a coral slab, cut and polished, with one hairline per day. The
   bands are not decorative — their count is the argument. */
const Section: React.FC<{read: number}> = ({read}) => {
  const rowH = 124;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* the slab */}
      <div
        style={{
          position: 'absolute',
          left: X0 - 26,
          top: Y0 - 26,
          width: X1 - X0 + 52,
          height: YEARS * rowH + 52,
          background: 'linear-gradient(168deg, #2A2118 0%, #1E1710 46%, #14100B 100%)',
          border: `1px solid ${alpha(P.warm, 0.24)}`,
        }}
      />
      {Array.from({length: YEARS}).map((_, y) => {
        const top = Y0 + y * rowH;
        // the days per year: 400 in the Devonian, drawn a little tighter each
        // row toward the top so the density itself is the story
        const days = 27;
        return (
          <div key={y} style={{position: 'absolute', left: X0, top, width: X1 - X0, height: rowH}}>
            {/* annual bundle boundary */}
            <div style={{position: 'absolute', left: 0, top: 0, width: X1 - X0, height: 1, background: alpha(P.warm, 0.34)}} />
            {Array.from({length: days}).map((_, i) => {
              const x = (i / days) * (X1 - X0);
              const on = clamp((read * YEARS * days - (y * days + i)) / 8);
              if (on <= 0) return null;
              const h = hash(y, i, 13);
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: 14,
                    width: 1 + h * 1.4,
                    height: rowH - 26,
                    background: alpha(P.ink, 0.12 + h * 0.3),
                    opacity: on,
                  }}
                />
              );
            })}
            {/* the year's own label, at the right edge of its bundle */}
            {y === 0 || y === YEARS - 1 ? (
              <div
                style={{
                  position: 'absolute',
                  right: -104,
                  top: rowH / 2 - 12,
                  width: 90,
                  textAlign: 'right',
                  fontFamily: T.mono,
                  fontSize: 16,
                  letterSpacing: '0.12em',
                  color: alpha(P.ink, 0.42),
                }}
              >
                {y === 0 ? 'TERTUA' : 'TERMUDA'}
              </div>
            ) : null}
          </div>
        );
      })}
      {/* the cut edge, bright: a polished section catches light on one side */}
      <div style={{position: 'absolute', left: X0 - 26, top: Y0 - 26, width: 3, height: YEARS * rowH + 52, background: alpha(P.warm, 0.5)}} />
    </AbsoluteFill>
  );
};

/* A scale in days along the top of the slab, so the hairlines are legible as
   data and not as texture. */
const Scale: React.FC<{read: number}> = ({read}) => {
  const e = clamp(read * 3);
  if (e <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: e, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: X0, top: Y0 - 46, width: 300, fontFamily: T.mono, fontSize: 17, letterSpacing: '0.32em', color: alpha(P.ink, 0.45)}}>
        SATU GARIS = SATU HARI
      </div>
      <div style={{position: 'absolute', left: X1 - 310, top: Y0 - 46, width: 310, textAlign: 'right', fontFamily: T.mono, fontSize: 17, letterSpacing: '0.2em', color: alpha(P.accent, 0.8)}}>
        400 HARI / TAHUN
      </div>
    </AbsoluteFill>
  );
};

const Headline: React.FC<{old: number}> = ({old}) => {
  if (old <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 132, top: 196, opacity: old, pointerEvents: 'none'}}>
      <div style={{fontFamily: T.mono, fontSize: 18, letterSpacing: '0.42em', color: alpha(P.ink, 0.44)}}>KARANG DEVON</div>
      <div style={{marginTop: 14, fontFamily: T.display, fontSize: 92, fontWeight: 300, letterSpacing: '-0.04em', color: P.ink, lineHeight: 1}}>
        400 juta tahun
      </div>
    </div>
  );
};

/* The counter: 400 days, brought to the screen one at a time. It is the only
   number the act needs, so it is the only one allowed to be this big. */
const Counter: React.FC<{count: number}> = ({count}) => {
  if (count <= 0) return null;
  const n = Math.round(lerp(0, 400, count));
  return (
    <AbsoluteFill style={{opacity: count, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 132, top: 1336}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <span style={{fontFamily: T.display, fontSize: 176, fontWeight: 400, color: P.warm, lineHeight: 0.9, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>
            {n}
          </span>
          <span style={{fontFamily: T.mono, fontSize: 26, letterSpacing: '0.3em', color: alpha(P.ink, 0.6)}}>HARI</span>
        </div>
        <div style={{marginTop: 10, fontFamily: T.mono, fontSize: 19, letterSpacing: '0.36em', color: alpha(P.ink, 0.5)}}>DALAM SATU TAHUN</div>
      </div>
      <div style={{position: 'absolute', left: 132, top: 1576, width: 300, height: 1, background: alpha(P.ink, 0.24)}} />
    </AbsoluteFill>
  );
};

export default Compo;
