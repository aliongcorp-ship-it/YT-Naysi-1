/* y9 — 384.400 km
   The distance, laid out flat. Earth on the left edge, the Moon on the right,
   and a measured rule between them with the number written on it. Under the
   rule, the same distance cut into a hundred years: 3,8 cm each. Nothing else
   moves except the measure being drawn, because the number is the picture. */

import React from 'react';
import type {SceneProps} from './types';
import {AbsoluteFill} from 'remotion';
import {P, T, Metric} from './bulan';
import {MoonDisc} from '../src/ui/Moon';
import {Dust} from '../src/ui/Texture';
import {alpha, clamp, eOut, eOutQuint, hash} from '../src/theme';

const EX = 168;
const EY = 1010;
const ER = 132;
const MX = 1204;
const MY = 1010;
const MR = 154;

export const Compo: React.FC<SceneProps> = ({local}) => {
  const draw = eOutQuint(clamp(local / 1.6));
  const earth = eOut(clamp((local - 0.1) / 0.9));
  const moon = eOut(clamp((local - 0.35) / 0.9));
  const years = eOut(clamp((local - 2.1) / 1.3));

  return (
    <AbsoluteFill style={{background: '#050403'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #080605 0%, #060504 58%, #040302 100%)'}} />
      <Dust n={480} seed={99} opacity={0.34} color={P.ink} />

      {/* the two bodies, small, at the ends of the rule */}
      <EarthDisc on={earth} />
      <div style={{opacity: moon}}>
        <MoonDisc cx={MX} cy={MY} r={MR} detail={0.85} lit={0.9} tilt={-8} seed={17} opacity={0.95} />
      </div>

      {/* the measured line: a rule with a tick every 10 000 km */}
      <Rule draw={draw} />
      <div style={{opacity: eOut(clamp((local - 0.9) / 1.0))}}>
        <Metric x0={EX + ER + 26} x1={MX - MR - 26} y={MY} label="384.400 KM" sub="RATA-RATA, TIAP MALAM BERUBAH" color={P.accent} up={false} />
      </div>

      <Headline />
      {/* a drop line from the middle of the rule down to the hundred years, so
          the two scales are visibly the same distance */}
      <div style={{position: 'absolute', left: 720, top: MY + 22, width: 1, height: 1288 - MY - 22, background: alpha(P.ink, 0.12), opacity: draw, pointerEvents: 'none'}} />
      <Years on={years} />
      <Footer />
    </AbsoluteFill>
  );
};

const EarthDisc: React.FC<{on: number}> = ({on}) => {
  if (on <= 0) return null;
  return (
    <div style={{position: 'absolute', left: EX - ER, top: EY - ER, width: ER * 2, height: ER * 2, opacity: on}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 32% 28%, #7E959D 0%, #5A7683 26%, #38525E 58%, #1C313A 84%, #0D1E25 100%)',
        }}
      >
        <svg width={ER * 2} height={ER * 2} style={{position: 'absolute', left: 0, top: 0}}>
          <g fill="rgba(52,62,46,0.8)" stroke="rgba(200,190,158,0.34)" strokeWidth={1} strokeLinejoin="round">
            <polygon points="34,62 52,44 76,40 92,52 104,46 110,60 100,74 82,76 68,86 52,80 40,72" />
            <polygon points="108,92 126,82 146,86 152,100 142,112 126,116 112,110" />
            <polygon points="62,124 80,118 92,128 88,142 72,146 60,136" />
          </g>
        </svg>
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(84deg, rgba(5,12,16,0) 40%, rgba(5,12,16,0.6) 74%, rgba(5,12,16,0.95) 100%)'}} />
      </div>
    </div>
  );
};

/* A long rule with ticks: ten thousand kilometres per major tick, a thousand per
   minor. Drawn by clipping, so the drawing motion is a reveal and not a redraw. */
const Rule: React.FC<{draw: number}> = ({draw}) => {
  const x0 = EX + ER + 26;
  const x1 = MX - MR - 26;
  const y = MY;
  const n = 38;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <svg width={1440} height={2560} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <clipPath id="ruleClip">
            <rect x={x0 - 4} y={y - 60} width={(x1 - x0 + 8) * draw} height={120} />
          </clipPath>
        </defs>
        <g clipPath="url(#ruleClip)">
          <line x1={x0} y1={y} x2={x1} y2={y} stroke={alpha(P.ink, 0.5)} strokeWidth={1.4} />
          {Array.from({length: n + 1}).map((_, i) => {
            const x = x0 + (i / n) * (x1 - x0);
            const major = i % 10 === 0;
            const mid = i % 5 === 0;
            return <line key={i} x1={x} y1={y - (major ? 20 : mid ? 13 : 7)} x2={x} y2={y + (major ? 20 : mid ? 13 : 7)} stroke={alpha(P.ink, major ? 0.6 : 0.3)} strokeWidth={1} />;
          })}
          {/* the 3,8 cm step, drawn at real scale in the corner of the rule */}
          <line x1={x0} y1={y + 62} x2={x0 + 0.9} y2={y + 62} stroke={P.hot} strokeWidth={6} />
        </g>
      </svg>
    </div>
  );
};

const Headline = () => (
  <div style={{position: 'absolute', left: 0, width: 1440, top: 372, textAlign: 'center', pointerEvents: 'none'}}>
    <div style={{fontFamily: T.mono, fontSize: 19, letterSpacing: '0.44em', color: alpha(P.ink, 0.46)}}>JARAK RATA-RATA</div>
  </div>
);

/* A hundred years of recession, as a row of marks that marches off the right
   edge: the point is that it does not stop. */
const Years: React.FC<{on: number}> = ({on}) => {
  if (on <= 0) return null;
  const x0 = 168;
  const y = 1288;
  const n = 100;
  const dx = 13.4;
  return (
    <AbsoluteFill style={{opacity: on, pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const x = x0 + i * dx;
        if (x > 1330) return null;
        const on2 = clamp((on * 1.4 - i / n) * 3);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 1, height: 44, background: alpha(P.ink, 0.13), opacity: on2}} />;
      })}
      <div style={{position: 'absolute', left: x0, top: y + 62, fontFamily: T.mono, fontSize: 17, letterSpacing: '0.3em', color: alpha(P.ink, 0.4)}}>100 TAHUN</div>
      <div style={{position: 'absolute', left: x0 + 3, top: y - 26, width: 100, fontFamily: T.mono, fontSize: 18, letterSpacing: '0.14em', color: P.hot}}>
        +3,8 M
      </div>
      <div style={{position: 'absolute', left: x0, top: y + 118, fontFamily: T.italic, fontStyle: 'italic', fontSize: 34, color: alpha(P.ink, 0.5)}}>
        satu abad, sepanjang lengan
      </div>
    </AbsoluteFill>
  );
};

const Footer = () => (
  <div style={{position: 'absolute', left: 0, width: 1440, top: 1790, textAlign: 'center', pointerEvents: 'none'}}>
    <div style={{width: 1, height: 96, background: alpha(P.ink, 0.18), margin: '0 auto'}} />
  </div>
);

export default Compo;
