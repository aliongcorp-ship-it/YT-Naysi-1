/* y7 — 22 vs 24 jam
   A day, drawn as a clock face — twice. The left dial is today: 24 hours, a
   full circle. The right dial is 400 million years ago: 22 hours, so the same
   rotation covers a smaller arc and the missing two hours are the wedge that
   the Moon stole. The Earth turns behind both of them, and the numbers do the
   rest. Instrument dials, not neon rings. */

import React from 'react';
import type {SceneProps} from './types';
import {AbsoluteFill} from 'remotion';
import {P, T} from './bulan';
import {Dust} from '../src/ui/Texture';
import {alpha, clamp, eOut, hash, lerp, smooth} from '../src/theme';

const R = 232; // dial radius
const LX = 392; // left dial centre
const RX = 1052; // right dial centre
const CY = 856;

export const Compo: React.FC<SceneProps> = ({local, act}) => {
  const D = act.end - act.start;

  const now = eOut(clamp((local - 0.3) / 1.6));
  const then = eOut(clamp((local - (D * 0.5)) / 2.0));
  const slow = eOut(clamp((local - 1.4) / 1.2));
  const ms = eOut(clamp((local - (D * 0.26)) / 1.4));

  // the hands: today's makes one turn per act-third; the ancient one lags
  const spin = (local / (D * 0.55)) % 1;

  return (
    <AbsoluteFill style={{background: '#080605'}}>
      <AbsoluteFill style={{background: 'linear-gradient(184deg, #0B0806 0%, #080605 52%, #050403 100%)'}} />
      <Dust n={460} seed={83} opacity={0.38} color={P.ink} />

      <Dial cx={LX} cy={CY} r={R} hours={24} title="SEKARANG" on={now} spin={spin} accent={P.ink} />
      <Dial cx={RX} cy={CY} r={R} hours={22} title="400 JUTA TAHUN LALU" on={then} spin={spin * 0.92} accent={P.accent} />

      <div style={{opacity: now}}>
        <div style={{position: 'absolute', left: LX - 120, top: CY + R + 46, width: 240, textAlign: 'center'}}>
          <div style={{fontFamily: T.display, fontSize: 92, fontWeight: 500, color: P.ink, lineHeight: 1, letterSpacing: '-0.03em'}}>24</div>
          <div style={{marginTop: 2, fontFamily: T.mono, fontSize: 19, letterSpacing: '0.34em', color: alpha(P.ink, 0.55)}}>JAM</div>
        </div>
      </div>
      <div style={{opacity: then}}>
        <div style={{position: 'absolute', left: RX - 120, top: CY + R + 46, width: 240, textAlign: 'center'}}>
          <div style={{fontFamily: T.display, fontSize: 92, fontWeight: 500, color: P.accent, lineHeight: 1, letterSpacing: '-0.03em'}}>22</div>
          <div style={{marginTop: 2, fontFamily: T.mono, fontSize: 19, letterSpacing: '0.34em', color: alpha(P.ink, 0.55)}}>JAM</div>
        </div>
      </div>

      <Header on={now} />
      <Difference on={then} />
      <Slowdown on={slow} ms={ms} />
    </AbsoluteFill>
  );
};

/* One dial. The rim carries 24 (or 22) hour ticks; the sweep is a wedge of
   lit paper; the hand is a single line with a counterweight. */
const Dial: React.FC<{
  cx: number; cy: number; r: number; hours: number;
  title: string; on: number; spin: number; accent: string;
}> = ({cx, cy, r, hours, title, on, spin, accent}) => {
  if (on <= 0) return null;
  const ticks = 24;
  return (
    <div style={{position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, opacity: on}}>
      <svg width={r * 2} height={r * 2} style={{position: 'absolute', left: 0, top: 0}}>
        {/* face */}
        <circle cx={r} cy={r} r={r - 2} fill="rgba(22,15,10,0.72)" stroke={alpha(P.ink, 0.4)} strokeWidth={2} />
        <circle cx={r} cy={r} r={r - 18} fill="none" stroke={alpha(P.ink, 0.1)} strokeWidth={1} />
        {/* hour ticks */}
        {Array.from({length: ticks}).map((_, i) => {
          const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
          const major = i % 6 === 0;
          const r0 = r - (major ? 34 : 22);
          const r1 = r - 8;
          return (
            <line
              key={i}
              x1={r + Math.cos(a) * r0}
              y1={r + Math.sin(a) * r0}
              x2={r + Math.cos(a) * r1}
              y2={r + Math.sin(a) * r1}
              stroke={alpha(P.ink, major ? 0.72 : 0.34)}
              strokeWidth={major ? 2 : 1}
            />
          );
        })}
        {/* the day's arc: the fraction of the circle that one rotation covers */}
        <path
          d={arc(r, r, r - 46, -90, -90 + (hours / 24) * 360)}
          fill="none"
          stroke={accent}
          strokeWidth={3}
          opacity={0.75}
        />
        {/* the hand */}
        <g transform={`rotate(${spin * 360} ${r} ${r})`}>
          <line x1={r} y1={r} x2={r} y2={r - r + 60} stroke={accent} strokeWidth={2.6} />
          <line x1={r} y1={r + 30} x2={r} y2={r - 24} stroke={alpha(accent, 0.7)} strokeWidth={2} />
          <circle cx={r} cy={r} r={7} fill={accent} />
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: -52,
          width: r * 2,
          textAlign: 'center',
          fontFamily: T.mono,
          fontSize: 17,
          letterSpacing: '0.3em',
          color: alpha(P.ink, 0.46),
        }}
      >
        {title}
      </div>
    </div>
  );
};

/* The plate's headline. One word, serif, with the instrument label above it —
   typography doing the job a chapter card would otherwise do. */
const Header: React.FC<{on: number}> = ({on}) => {
  if (on <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 132, top: 402, opacity: on, pointerEvents: 'none'}}>
      <div style={{fontFamily: T.mono, fontSize: 18, letterSpacing: '0.42em', color: alpha(P.ink, 0.44)}}>PANJANG SATU PUTARAN</div>
      <div style={{marginTop: 18, width: 58, height: 1, background: alpha(P.ink, 0.34)}} />
    </div>
  );
};

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (deg: number) => [cx + Math.cos((deg * Math.PI) / 180) * r, cy + Math.sin((deg * Math.PI) / 180) * r];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

/* The two hours that are missing: a wedge between the dials, hatched. */
const Difference: React.FC<{on: number}> = ({on}) => {
  if (on <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: on, pointerEvents: 'none'}}>
      <svg width={1440} height={2560} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <pattern id="diffHatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(34)">
            <line x1="0" y1="0" x2="0" y2="9" stroke={alpha(P.hot, 0.55)} strokeWidth={1.3} />
          </pattern>
        </defs>
        <path
          d={`M${LX + R + 26} ${CY - 62} L${RX - R - 26} ${CY - 62} L${RX - R - 26} ${CY + 62} L${LX + R + 26} ${CY + 62} Z`}
          fill="url(#diffHatch)"
          opacity={0.5}
        />
        <line x1={LX + R + 26} y1={CY - 62} x2={RX - R - 26} y2={CY - 62} stroke={alpha(P.hot, 0.45)} strokeWidth={1} />
        <line x1={LX + R + 26} y1={CY + 62} x2={RX - R - 26} y2={CY + 62} stroke={alpha(P.hot, 0.45)} strokeWidth={1} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: (LX + R + RX - R) / 2 - 130,
          top: CY - 148,
          width: 260,
          textAlign: 'center',
        }}
      >
        <div style={{fontFamily: T.mono, fontSize: 20, letterSpacing: '0.26em', color: P.hot}}>DUA JAM</div>
        <div style={{marginTop: 8, fontFamily: T.mono, fontSize: 16, letterSpacing: '0.24em', color: alpha(P.ink, 0.44)}}>HILANG</div>
      </div>
    </div>
  );
};

/* The slowdown, stated once, small, under everything: 1,8 ms per century is the
   number the whole act exists to deliver. */
const Slowdown: React.FC<{on: number, ms: number}> = ({on, ms}) => {
  if (on <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: on, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, width: 1440, top: 1360, textAlign: 'center'}}>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 16}}>
          <span style={{fontFamily: T.display, fontSize: 128, fontWeight: 500, color: P.ink, lineHeight: 1, letterSpacing: '-0.04em'}}>1,8</span>
          <span style={{fontFamily: T.mono, fontSize: 28, fontWeight: 700, letterSpacing: '0.16em', color: P.alt}}>MS</span>
        </div>
        <div style={{marginTop: 6, fontFamily: T.mono, fontSize: 20, letterSpacing: '0.4em', color: alpha(P.ink, 0.58)}}>PER ABAD, LEBIH LAMBAT</div>
      </div>
      <div style={{position: 'absolute', left: 0, width: 1440, top: 1562, textAlign: 'center', opacity: clamp(ms * 1.2)}}>
        <div style={{width: 156, height: 1, background: alpha(P.ink, 0.3), margin: '0 auto'}} />
        <div style={{marginTop: 14, fontFamily: T.italic, fontStyle: 'italic', fontSize: 34, color: alpha(P.ink, 0.6)}}>
          dan hari pun memanjang
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Compo;
