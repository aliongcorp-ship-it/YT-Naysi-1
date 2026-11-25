/* y5 — pikodetik
   The measurement itself. A return pulse on a scope graticule, measured two
   ways at once: the time axis in picoseconds and the distance axis in
   millimetres. Under it, fifty-five years of nights, one tick each, drifting
   upward by 3,8 cm a year. The pulse is drawn, the graticule is drawn, and the
   only light in the room is the trace. */

import React from 'react';
import type {SceneProps} from './types';
import {AbsoluteFill} from 'remotion';
import {P, T} from './bulan';
import {Dust} from '../src/ui/Texture';
import {alpha, clamp, eOut, eOutQuint, hash, lerp} from '../src/theme';

const GX0 = 214;
const GX1 = 1226;
const GY0 = 520;
const GY1 = 1104;

export const Compo: React.FC<SceneProps> = ({local, act}) => {
  const D = act.end - act.start;
  const sweep = eOutQuint(clamp((local - 0.15) / 2.3));
  const readout = eOut(clamp((local - 2.4) / 0.9));
  const years = eOut(clamp((local - 6.4) / 2.0));

  return (
    <AbsoluteFill style={{background: '#090604'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #0B0806 0%, #070504 62%, #050403 100%)'}} />
      <Dust n={420} seed={63} opacity={0.34} color={P.ink} />

      <Graticule opacity={0.5} />
      <Trace sweep={sweep} local={local} />
      <AxisLabels readout={readout} />
      <Readouts readout={readout} />
      <Decades years={years} />
    </AbsoluteFill>
  );
};

/* The scope graticule: a lattice of hairlines with a heavier centre cross.
   Ten divisions across, eight down — the same proportion as the reference
   instrument, drawn at 1 px so it never reads as a gradient. */
const Graticule: React.FC<{opacity: number}> = ({opacity}) => {
  const cols = 10;
  const rows = 8;
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: GX0, top: GY0, width: GX1 - GX0, height: GY1 - GY0, border: `1px solid ${alpha(P.ink, 0.18)}`}} />
      {Array.from({length: cols - 1}).map((_, i) => {
        const x = GX0 + ((i + 1) / cols) * (GX1 - GX0);
        return <div key={`c${i}`} style={{position: 'absolute', left: x, top: GY0, width: 1, height: GY1 - GY0, background: alpha(P.ink, 0.07)}} />;
      })}
      {Array.from({length: rows - 1}).map((_, i) => {
        const y = GY0 + ((i + 1) / rows) * (GY1 - GY0);
        return <div key={`r${i}`} style={{position: 'absolute', left: GX0, top: y, width: GX1 - GX0, height: 1, background: alpha(P.ink, 0.07)}} />;
      })}
      {/* the centre cross */}
      <div style={{position: 'absolute', left: GX0, top: (GY0 + GY1) / 2, width: GX1 - GX0, height: 1, background: alpha(P.ink, 0.2)}} />
      <div style={{position: 'absolute', left: (GX0 + GX1) / 2, top: GY0, width: 1, height: GY1 - GY0, background: alpha(P.ink, 0.2)}} />
      {/* distance ticks along the bottom, one per millimetre */}
      {Array.from({length: 21}).map((_, i) => {
        const x = GX0 + (i / 20) * (GX1 - GX0);
        const major = i % 5 === 0;
        return (
          <div key={`t${i}`} style={{position: 'absolute', left: x, top: GY1, width: 1, height: major ? 14 : 7, background: alpha(P.ink, major ? 0.4 : 0.2)}} />
        );
      })}
    </AbsoluteFill>
  );
};

/* The trace. A flat line that lifts into one narrow pulse and a decaying echo:
   the shape a single photon makes after 2,56 seconds of silence. The pulse is
   drawn by clipping the path to the sweep position. */
const Trace: React.FC<{sweep: number, local: number}> = ({sweep, local}) => {
  const w = GX1 - GX0;
  const h = GY1 - GY0;
  const pt = (u: number) => {
    // u: 0..1 across the screen
    const x = GX0 + u * w;
    const base = GY0 + h * 0.72;
    const main = Math.exp(-Math.pow((u - 0.42) / 0.016, 2)) * h * 0.46;
    const ring = Math.exp(-Math.pow((u - 0.455) / 0.02, 2)) * h * 0.14;
    const ring2 = Math.exp(-Math.pow((u - 0.485) / 0.03, 2)) * h * 0.05;
    const noise = (hash(Math.round(u * 900), 3, 5) - 0.5) * 3.2;
    return {x, y: base - main - ring - ring2 + noise};
  };
  const n = 260;
  const pts = Array.from({length: n + 1}, (_, i) => pt(i / n));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // the sweep line rides ahead of the trace
  const sweepX = GX0 + sweep * w;
  return (
    <div style={{position: 'absolute', left: 0, top: 0}}>
      <svg width={1440} height={2560} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <clipPath id="sweepClip">
            <rect x={GX0} y={GY0} width={Math.max(0, sweepX - GX0)} height={h} />
          </clipPath>
        </defs>
        {/* the glow is a wider, fainter copy of the same path — still one shape */}
        <path d={path} fill="none" stroke={alpha(P.accent, 0.16)} strokeWidth={9} clipPath="url(#sweepClip)" />
        <path d={path} fill="none" stroke={P.accent} strokeWidth={2.2} clipPath="url(#sweepClip)" />
        {sweep < 1 ? (
          <line x1={sweepX} y1={GY0} x2={sweepX} y2={GY1} stroke={alpha(P.alt, 0.5)} strokeWidth={1.4} />
        ) : null}
        {/* the peak marker */}
        <line x1={GX0 + 0.42 * w} y1={GY0 + h * 0.06} x2={GX0 + 0.42 * w} y2={GY0 + h * 0.72} stroke={alpha(P.ink, 0.16)} strokeWidth={1} strokeDasharray="2 6" />
      </svg>
    </div>
  );
};

const AxisLabels: React.FC<{readout: number}> = ({readout}) => (
  <AbsoluteFill style={{opacity: readout, pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: GX0, top: GY1 - 40, fontFamily: T.mono, fontSize: 17, letterSpacing: '0.3em', color: alpha(P.ink, 0.5)}}>PULANG</div>
    <div style={{position: 'absolute', left: GX0 + 0.42 * (GX1 - GX0) - 60, top: GY1 - 40, width: 120, textAlign: 'center', fontFamily: T.mono, fontSize: 18, letterSpacing: '0.24em', color: P.accent}}>PUNCAK</div>
    <div style={{position: 'absolute', left: GX1 - 90, top: GY1 - 40, textAlign: 'right', width: 90, fontFamily: T.mono, fontSize: 18, letterSpacing: '0.3em', color: alpha(P.ink, 0.55)}}>SENYAP</div>
    <div style={{position: 'absolute', left: GX0, top: GY0 - 40, fontFamily: T.mono, fontSize: 17, letterSpacing: '0.34em', color: alpha(P.ink, 0.45)}}>KEMBALIAN FOTON</div>
    <div style={{position: 'absolute', left: GX1 - 150, top: GY0 - 40, width: 150, textAlign: 'right', fontFamily: T.mono, fontSize: 18, letterSpacing: '0.24em', color: alpha(P.ink, 0.45)}}>1 DIV = 1 MM</div>
  </AbsoluteFill>
);

/* Two numbers, one for each axis of the same measurement. The big one is the
   distance; the small one is the clock that makes it possible. */
const Readouts: React.FC<{readout: number}> = ({readout}) => {
  if (readout <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: readout, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, width: 1440, top: 1176, textAlign: 'center'}}>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 14}}>
          <span style={{fontFamily: T.display, fontSize: 196, fontWeight: 500, lineHeight: 0.9, letterSpacing: '-0.05em', color: P.ink, fontVariantNumeric: 'tabular-nums'}}>
            1,7
          </span>
          <span style={{fontFamily: T.mono, fontSize: 34, fontWeight: 700, letterSpacing: '0.16em', color: P.alt}}>MM</span>
        </div>
        <div style={{marginTop: 10, fontFamily: T.mono, fontSize: 21, letterSpacing: '0.42em', color: alpha(P.ink, 0.6)}}>KETELITIAN JARAK</div>
      </div>
      <div style={{position: 'absolute', left: 0, width: 1440, top: 1424, textAlign: 'center'}}>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 10}}>
          <span style={{fontFamily: T.display, fontSize: 76, fontWeight: 400, color: P.accent, letterSpacing: '-0.02em'}}>± 1</span>
          <span style={{fontFamily: T.mono, fontSize: 24, letterSpacing: '0.22em', color: alpha(P.ink, 0.8)}}>PIKODETIK</span>
        </div>
        <div style={{marginTop: 8, fontFamily: T.mono, fontSize: 18, letterSpacing: '0.34em', color: alpha(P.ink, 0.42)}}>KETELITIAN WAKTU</div>
      </div>
    </AbsoluteFill>
  );
};

/* Fifty-five years of nightly ranging. Each year is a tick with a small upward
   offset; the composite is the drift itself, drawn as data rather than said. */
const Decades: React.FC<{years: number}> = ({years}) => {
  if (years <= 0) return null;
  const x0 = 240;
  const x1 = 1200;
  const baseY = 1704;
  const n = 55;
  const rise = 74;
  return (
    <AbsoluteFill style={{opacity: years, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x0, top: baseY, width: x1 - x0, height: 1, background: alpha(P.ink, 0.28)}} />
      {Array.from({length: n}).map((_, i) => {
        const x = x0 + (i / (n - 1)) * (x1 - x0);
        const on = clamp((years * n * 1.15 - i) / 6);
        const y = baseY - (i / (n - 1)) * rise;
        const decade = i % 11 === 0;
        return (
          <div key={i}>
            <div style={{position: 'absolute', left: x, top: y, width: 1, height: baseY - y, background: alpha(P.ink, 0.1), opacity: on}} />
            <div style={{position: 'absolute', left: x - 3, top: y - 3, width: 7, height: 7, borderRadius: '50%', background: decade ? P.accent : P.ink, opacity: 0.35 + on * 0.65}} />
            {decade ? (
              <div style={{position: 'absolute', left: x - 26, top: baseY + 18, width: 52, textAlign: 'center', fontFamily: T.mono, fontSize: 15, letterSpacing: '0.06em', color: alpha(P.ink, 0.4), opacity: on}}>
                {1969 + i}
              </div>
            ) : null}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: x0, top: baseY - rise - 52, fontFamily: T.mono, fontSize: 19, letterSpacing: '0.32em', color: alpha(P.ink, 0.6)}}>
        LIMA DEKADE, TIAP MALAM
      </div>
      <div style={{position: 'absolute', left: x1 - 220, top: baseY - rise - 52, width: 220, textAlign: 'right', fontFamily: T.mono, fontSize: 19, letterSpacing: '0.2em', color: P.accent}}>
        +2,1 M
      </div>
    </AbsoluteFill>
  );
};

export default Compo;
