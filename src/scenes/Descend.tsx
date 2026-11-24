import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ContourField, WaterColumn} from '../ui/Atmosphere';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp} from '../theme';
import type {Act, Shot} from '../timeline';

/*  ACT 3 — the descent.
    A 7.440 m measuring stick built out of 56 Monas, with a live depth counter
    and a pressure gauge that fills as we sink.                                */

const MONAS_H = 132;
const MAX = 7440;
const BARS = 56;

export const Descend: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  const sink = eOutQuint(clamp((t - 1.0) / 9.6));
  const depth = lerp(0, MAX, sink);
  const stackP = clamp((t - 2.6) / 7.4);
  const done = eOut(clamp((t - 10.2) / 0.7));

  const colX = 1010;
  const colTop = 620;
  const colBot = 1620;
  const colH = colBot - colTop;

  return (
    <AbsoluteFill>
      <WaterColumn depth={depth} intensity={1 - 0.7 * (depth / MAX)} rays={clamp(1 - depth / 2200, 0, 1)} seed={7} />
      <ContourField opacity={0.32} y={880} seed={9} zoom={1.4} color={C.sonar} />

      {/* headline changes as the number falls */}
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 330,
          width: 820,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 104,
          lineHeight: 0.94,
          letterSpacing: '-0.048em',
          color: C.ink,
          opacity: eOut(clamp(t / 0.7)),
        }}
      >
        Laut Banda
        <br />
        <span style={{color: C.sonar}}>7.440</span> meter
        <div style={{fontFamily: F.mono, fontSize: 21, letterSpacing: '0.3em', color: C.muted, marginTop: 26}}>
          PALUNG WEBER · 6°22′S 130°12′E
        </div>
      </div>

      {/* measuring stick */}
      <div style={{position: 'absolute', left: colX, top: colTop, width: 260, height: colH}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: `linear-gradient(180deg, ${C.sonar}33, ${C.sonar}AA)`}} />
        {/* 56 Monas bars stacking upward */}
        {Array.from({length: BARS}).map((_, i) => {
          const appear = clamp((stackP * BARS - i) / 1.6);
          if (appear <= 0) return null;
          const h = colH / BARS - 2;
          const y = colBot - (i + 1) * (colH / BARS);
          const newest = stackP * BARS - i < 2.4;
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  position: 'absolute',
                  left: 14,
                  top: y,
                  width: 190 * eOut(appear),
                  height: h,
                  background: newest
                    ? `linear-gradient(90deg, ${C.sonar}, ${C.sonarDim})`
                    : `linear-gradient(90deg, ${C.sonar}66, ${C.sonar}18)`,
                  borderRight: `2px solid ${newest ? C.foam : `${C.sonar}77`}`,
                  boxShadow: newest ? `0 0 24px ${C.sonar}77` : 'none',
                  opacity: 0.35 + 0.65 * appear,
                }}
              />
              {i % 8 === 0 ? (
                <div
                  style={{
                    position: 'absolute',
                    left: 214,
                    top: y - 11,
                    fontFamily: F.mono,
                    fontSize: 17,
                    letterSpacing: '0.1em',
                    color: `${C.muted}`,
                    opacity: appear,
                  }}
                >
                  {Math.round((i + 1) * MONAS_H).toLocaleString('id-ID')}m
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
        {/* depth cursor */}
        <div
          style={{
            position: 'absolute',
            left: -8,
            top: clamp(depth / MAX) * colH - 2,
            width: 46,
            height: 4,
            background: C.magma,
            boxShadow: `0 0 26px ${C.magma}`,
          }}
        />
      </div>

      {/* live readouts */}
      <div style={{position: 'absolute', left: SAFE.left, top: 1050, width: 640}}>
        <div style={{fontFamily: F.mono, fontSize: 19, letterSpacing: '0.34em', color: C.muted}}>KEDALAMAN</div>
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 700,
            fontSize: 150,
            lineHeight: 0.92,
            letterSpacing: '-0.055em',
            color: C.foam,
            fontVariantNumeric: 'tabular-nums',
            textShadow: `0 0 70px ${C.sonar}44`,
          }}
        >
          {Math.round(depth).toLocaleString('id-ID')}
          <span style={{fontSize: 54, color: C.sonar, marginLeft: 12, letterSpacing: '0'}}>M</span>
        </div>

        <div style={{marginTop: 34, display: 'flex', gap: 46}}>
          <div>
            <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: '0.28em', color: C.muted}}>TEKANAN</div>
            <div style={{fontFamily: F.display, fontSize: 44, fontWeight: 600, color: C.ember, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>
              {Math.round((depth / 10.06) * 0.98).toLocaleString('id-ID')}
              <span style={{fontSize: 20, color: C.muted, marginLeft: 6}}>kg/cm²</span>
            </div>
          </div>
          <div>
            <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: '0.28em', color: C.muted}}>CAHAYA</div>
            <div style={{fontFamily: F.display, fontSize: 44, fontWeight: 600, color: depth > 200 ? C.iris : C.foam, letterSpacing: '-0.03em'}}>
              {depth < 200 ? `${Math.round(100 * Math.pow(0.5, depth / 60))}%` : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* the 56 Monas conclusion */}
      <div
        style={{
          position: 'absolute',
          left: 604,
          top: 1418,
          opacity: done,
          transform: `translateY(${(1 - done) * 26}px)`,
          borderLeft: `4px solid ${C.sonar}`,
          paddingLeft: 26,
        }}
      >
        <div style={{fontFamily: F.display, fontSize: 54, fontWeight: 700, letterSpacing: '-0.035em', color: C.ink, lineHeight: 1}}>
          56 × Monas
        </div>
        <div style={{fontFamily: F.mono, fontSize: 19, letterSpacing: '0.22em', color: C.muted, marginTop: 12}}>
          7.392 M DITUMPUK — DAN MASIH ADA SISA 48 M
        </div>
      </div>
    </AbsoluteFill>
  );
};
