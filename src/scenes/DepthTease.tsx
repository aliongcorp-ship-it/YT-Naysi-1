import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ContourField, WaterColumn} from '../ui/Atmosphere';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp} from '../theme';
import type {Act, Shot} from '../timeline';

/*  SHOT — the tease after the thesis: the country's floor simply drops away.
    A single sounding line falls past every landmark we have above sea level.  */
const MARKS: [number, string][] = [
  [0, 'PERMUKAAN'],
  [884, 'PUNCAK JAYA 4.884 M'],
  [132, 'MONAS 132 M'],
  [7290, 'PALUNG JAWA 7.290 M'],
  [7440, 'PALUNG WEBER 7.440 M'],
];

export const DepthTease: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  const fall = eOutQuint(clamp((t - 0.5) / 6.6));
  const depth = lerp(0, 7440, fall);
  const y0 = 470;
  const y1 = 1500;
  const p = depth / 7440;
  const cursorY = lerp(y0, y1, p);
  const end = eOut(clamp((t - 6.8) / 0.9));

  return (
    <AbsoluteFill>
      <WaterColumn depth={depth} intensity={0.9 - 0.7 * p} rays={clamp(1 - p * 2.2, 0, 1)} seed={47} />
      <ContourField opacity={0.22} y={940} seed={5} zoom={1.3} color={C.sonar} />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 330,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 88,
          lineHeight: 0.98,
          letterSpacing: '-0.045em',
          color: C.ink,
          opacity: eOut(clamp(t / 0.7)),
          width: 620,
        }}
      >
        Di bawah sana,
        <br />
        lantainya <span style={{color: C.sonar}}>hilang</span>.
      </div>

      {/* the sounding line */}
      <div style={{position: 'absolute', left: 742, top: y0, width: 2, height: y1 - y0, background: `linear-gradient(180deg, ${C.sonar}66, ${C.sonar}11)`}} />
      {MARKS.map(([m, label], i) => {
        const yy = lerp(y0, y1, m / 7440);
        const reached = depth >= m - 40;
        const hi = i === MARKS.length - 1;
        return (
          <div key={label} style={{position: 'absolute', left: 742, top: yy, opacity: reached ? 1 : 0.34}}>
            <div style={{position: 'absolute', left: -18, top: -1, width: 38, height: 2, background: reached ? (hi ? C.magma : C.sonar) : C.faint}} />
            <div
              style={{
                position: 'absolute',
                left: 108,
                top: -20,
                fontFamily: F.mono,
                fontSize: hi ? 24 : 19,
                letterSpacing: '0.2em',
                color: reached ? (hi ? C.ember : C.foam) : C.faint,
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </div>
            <div
              style={{
                position: 'absolute',
                left: -104,
                top: -16,
                width: 88,
                textAlign: 'right',
                fontFamily: F.mono,
                fontSize: 18,
                color: reached ? (hi ? C.magma : C.sonarDim) : C.faint,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {m.toLocaleString('id-ID')} m
            </div>
          </div>
        );
      })}

      {/* falling cursor */}
      <div
        style={{
          position: 'absolute',
          left: 720,
          top: cursorY - 5,
          width: 52,
          height: 10,
          borderRadius: 4,
          background: C.foam,
          boxShadow: `0 0 30px ${C.sonar}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 790,
          top: cursorY - 34,
          fontFamily: F.display,
          fontSize: 54,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: C.foam,
          fontVariantNumeric: 'tabular-nums',
          textShadow: `0 0 40px ${C.sonar}55`,
          opacity: 0.96,
        }}
      >
        {Math.round(depth).toLocaleString('id-ID')}
        <span style={{fontSize: 22, color: C.sonarDim, marginLeft: 8, letterSpacing: '0.1em'}}>M</span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 1600,
          opacity: end,
          transform: `translateY(${(1 - end) * 22}px)`,
          borderLeft: `4px solid ${C.sonar}`,
          paddingLeft: 24,
        }}
      >
        <div style={{fontFamily: F.display, fontSize: 52, fontWeight: 700, letterSpacing: '-0.035em', color: C.ink, lineHeight: 1}}>
          Lebih dalam dari Puncak Jaya itu tinggi.
        </div>
        <div style={{fontFamily: F.mono, fontSize: 19, letterSpacing: '0.24em', color: C.muted, marginTop: 12}}>
          7.440 M · LAUT BANDA · MALUKU
        </div>
      </div>
    </AbsoluteFill>
  );
};
