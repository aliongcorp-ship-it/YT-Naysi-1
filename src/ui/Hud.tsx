import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {C, F, SAFE, alpha, clamp, eOut} from '../theme';
import type {Act, Shot, Timeline} from '../timeline';

/* Header: the reference's two ends — a squared amber dot with NAYSI on the
   left, the series tag on the right. Nothing else lives up here. */
export const Strap: React.FC<{act: Act; t: number; shot?: Shot; total: number}> = ({act, t, shot, total}) => {
  const appear = interpolate(t, [0.1, 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const swap = eOut(clamp((t - act.start) / 0.42));
  return (
    <AbsoluteFill style={{opacity: appear, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: SAFE.left, top: 116, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 13, height: 13, background: C.gold}} />
        <div style={{fontFamily: F.mono, fontSize: 25, fontWeight: 600, letterSpacing: '0.34em', color: C.ink}}>NAYSI</div>
      </div>

      <div style={{position: 'absolute', right: 1440 - SAFE.right, top: 122, fontFamily: F.mono, fontSize: 20, letterSpacing: '0.30em', color: C.muted}}>
        NAYSI · FISIKA
      </div>

      {/* chapter label, swapped on the act boundary with a vertical wipe */}
      <div style={{position: 'absolute', left: SAFE.left, top: 168, height: 28, overflow: 'hidden', width: 760}}>
        <div style={{transform: `translateY(${(1 - swap) * 30}px)`, opacity: swap}}>
          <span style={{fontFamily: F.mono, fontSize: 19, letterSpacing: '0.28em', color: C.gold}}>{act.chapter}</span>
          {shot ? (
            <span style={{fontFamily: F.mono, fontSize: 17, letterSpacing: '0.22em', color: C.muted, marginLeft: 18}}>
              {String(shot.index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
            </span>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* Corner registration marks. Hairlines, 1 px, low opacity — the only "camera"
   tell in the film. */
export const Marks: React.FC<{opacity?: number}> = ({opacity = 0.30}) => {
  const mark = (rot: number, x: number, y: number) => (
    <div key={`${x}-${y}`} style={{position: 'absolute', left: x, top: y, width: 34, height: 34, transform: `rotate(${rot}deg)`, opacity}}>
      <div style={{position: 'absolute', inset: 0, borderTop: `1px solid ${C.muted}`, borderLeft: `1px solid ${C.muted}`}} />
    </div>
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {mark(0, 44, 44)}
      {mark(90, 1440 - 78, 44)}
      {mark(180, 1440 - 78, 2560 - 78)}
      {mark(270, 44, 2560 - 78)}
    </AbsoluteFill>
  );
};

/* A right-hand rail that measures the thing the episode is actually about:
   lunar distance in kilometres, from 384 400 down/up as the story needs. */
export const DistanceRail: React.FC<{km: number; opacity?: number; min?: number; max?: number}> = ({
  km,
  opacity = 0.85,
  min = 360000,
  max = 406000,
}) => {
  const y0 = 520;
  const y1 = 1580;
  const p = clamp((km - min) / (max - min));
  const y = y1 - p * (y1 - y0);
  const ticks = [360000, 380000, 384400, 400000];
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', right: 86, top: y0, width: 1, height: y1 - y0, background: alpha(C.muted, 0.35)}} />
      {ticks.map((tk) => {
        const ty = y1 - clamp((tk - min) / (max - min)) * (y1 - y0);
        const on = tk === 384400;
        return (
          <React.Fragment key={tk}>
            <div style={{position: 'absolute', right: 72, top: ty, width: on ? 28 : 16, height: 1, background: on ? C.gold : alpha(C.muted, 0.5)}} />
            <div
              style={{
                position: 'absolute',
                right: 108,
                top: ty - 11,
                fontFamily: F.mono,
                fontSize: 16,
                letterSpacing: '0.05em',
                color: on ? C.gold : C.muted,
                textAlign: 'right',
                width: 110,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {(tk / 1000).toFixed(1)}k
            </div>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', right: 60, top: y - 5, width: 40, height: 10, background: C.gold}} />
      <div
        style={{
          position: 'absolute',
          right: 108,
          top: y + 20,
          fontFamily: F.mono,
          fontSize: 24,
          fontWeight: 600,
          color: C.ink,
          textAlign: 'right',
          width: 160,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {Math.round(km).toLocaleString('id-ID')}
      </div>
      <div style={{position: 'absolute', right: 108, top: y + 52, fontFamily: F.mono, fontSize: 14, letterSpacing: '0.26em', color: C.muted, textAlign: 'right', width: 160}}>
        KM
      </div>
    </AbsoluteFill>
  );
};

/* Instrument panel: a bordered plate with a label strip, a big value, and an
   optional note. This is the reference's "SELISIH WAKTU" card and it is the
   single most reused object in the film, so it lives here. */
export const Panel: React.FC<{
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  at: number;
  t: number;
  y?: number;
  color?: string;
  size?: number;
  width?: number;
  accentRight?: string;
}> = ({label, value, unit, sub, at, t, y = 380, color = C.gold, size = 108, width = 1060, accentRight}) => {
  const local = t - at;
  if (local < -0.01) return null;
  const inP = eOut(clamp(local / 0.5));
  const out = clamp((local - 8.6) / 0.7);
  const x = (1440 - width) / 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        padding: '26px 34px 30px',
        border: `1px solid ${alpha(C.shallow, 0.9)}`,
        background: alpha(C.abyss, 0.92),
        opacity: inP * (1 - out),
        transform: `translateY(${(1 - inP) * 20}px)`,
      }}
    >
      {/* label strip */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontFamily: F.mono, fontSize: 19, letterSpacing: '0.26em', color: C.muted}}>{label}</span>
        {accentRight ? (
          <span style={{fontFamily: F.mono, fontSize: 19, letterSpacing: '0.24em', color}}>{accentRight}</span>
        ) : null}
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 14}}>
        <span
          style={{
            fontFamily: F.display,
            fontSize: size,
            fontWeight: 700,
            letterSpacing: '-0.035em',
            color,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {unit ? <span style={{fontFamily: F.display, fontSize: size * 0.34, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em'}}>{unit}</span> : null}
      </div>
      {sub ? (
        <div style={{marginTop: 14, fontFamily: F.mono, fontSize: 20, letterSpacing: '0.1em', color: C.muted}}>{sub}</div>
      ) : null}
    </div>
  );
};

/* The big measured readout: a value, a unit, and a caption under it. This is
   the workhorse of the reference's visual language, so it is shared. */
export const Readout: React.FC<{
  value: string;
  unit?: string;
  note?: string;
  at: number;
  t: number;
  y?: number;
  color?: string;
  size?: number;
  align?: 'center' | 'left';
}> = ({value, unit, note, at, t, y = 560, color = C.gold, size = 132, align = 'center'}) => {
  const local = t - at;
  if (local < -0.01) return null;
  const inP = eOut(clamp(local / 0.5));
  const dim = clamp(1 - (local - 9) / 0.8);
  return (
    <div
      style={{
        position: 'absolute',
        left: align === 'center' ? 120 : SAFE.left,
        width: align === 'center' ? 1200 : 1100,
        top: y,
        textAlign: align,
        opacity: inP * dim,
        transform: `translateY(${(1 - inP) * 24}px)`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: 14}}>
        <span
          style={{
            fontFamily: F.display,
            fontSize: size,
            fontWeight: 700,
            letterSpacing: '-0.035em',
            color,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {unit ? (
          <span style={{fontFamily: F.display, fontSize: size * 0.36, fontWeight: 600, letterSpacing: '-0.01em', color: C.ink}}>{unit}</span>
        ) : null}
      </div>
      {note ? (
        <div style={{marginTop: 18, fontFamily: F.serif, fontStyle: 'italic', fontSize: 38, color: C.muted, letterSpacing: '-0.01em'}}>{note}</div>
      ) : null}
    </div>
  );
};
