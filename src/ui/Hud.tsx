import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, F, SAFE, H, clamp, eOut, lerp} from '../theme';
import type {Act, Shot, Timeline} from '../timeline';

/* Left rail: a bathymetric depth scale that physically tracks the narration. */
export const DepthRail: React.FC<{depth: number; opacity?: number; max?: number}> = ({depth, opacity = 1, max = 7440}) => {
  const f = useCurrentFrame();
  const y0 = 320;
  const y1 = 1700;
  const p = clamp(depth / max);
  const y = lerp(y0, y1, p);
  const ticks = [0, 1000, 2000, 4000, 6000, 7440];
  return (
    <AbsoluteFill style={{opacity}}>
      <div style={{position: 'absolute', left: 52, top: y0, width: 2, height: y1 - y0, background: `linear-gradient(180deg, ${C.sonar}55, ${C.sonar}11)`}} />
      {ticks.map((tk) => {
        const ty = lerp(y0, y1, tk / max);
        return (
          <React.Fragment key={tk}>
            <div style={{position: 'absolute', left: 40, top: ty, width: 26, height: 2, background: tk <= depth ? C.sonarDim : C.faint, opacity: tk <= depth ? 0.85 : 0.5}} />
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: ty - 10,
                fontFamily: F.mono,
                fontSize: 17,
                letterSpacing: '0.02em',
                color: tk <= depth ? C.sonar : C.faint,
                opacity: tk <= depth ? 0.95 : 0.55,
                width: 32,
                textAlign: 'right',
              }}
            >
              {tk === 0 ? '0' : `${(tk / 1000).toFixed(tk % 1000 === 0 ? 0 : 1)}k`}
            </div>
          </React.Fragment>
        );
      })}
      {/* current depth marker */}
      <div style={{position: 'absolute', left: 30, top: y - 7, width: 44, height: 14, borderRadius: 3, background: C.sonar, boxShadow: `0 0 24px ${C.sonar}`}} />
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: y + 18,
          fontFamily: F.mono,
          fontSize: 26,
          fontWeight: 700,
          color: C.foam,
          letterSpacing: '-0.01em',
          textShadow: `0 0 22px ${C.sonar}77`,
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          opacity: 0.95,
        }}
      >
        <span style={{fontVariantNumeric: 'tabular-nums'}}>{Math.round(depth).toLocaleString('id-ID')}</span>
        <span style={{fontSize: 15, color: C.sonarDim, letterSpacing: '0.2em'}}>M</span>
      </div>
      <div style={{position: 'absolute', left: 40, top: y + 50, fontFamily: F.mono, fontSize: 13, letterSpacing: '0.28em', color: C.muted}}>
        {f % 90 < 45 ? 'KEDALAMAN' : 'DEPTH  ·  MSL'}
      </div>
    </AbsoluteFill>
  );
};

/* Top strap: episode identity, always small, always out of the way. */
export const Strap: React.FC<{tl: Timeline; act: Act; t: number; accent?: string; shot?: Shot}> = ({tl, act, t, accent = C.sonar, shot}) => {
  const appear = interpolate(t, [0.15, 0.85], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const p = clamp((t - act.start) / 0.5);
  return (
    <AbsoluteFill style={{opacity: appear, fontFamily: F.mono, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: SAFE.left, top: 128, display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{width: 9, height: 9, borderRadius: 9, background: accent, boxShadow: `0 0 18px ${accent}`}} />
        <div style={{fontSize: 22, letterSpacing: '0.42em', color: C.foam, fontWeight: 600}}>NAYSI</div>
        <div style={{width: 44, height: 1, background: `${C.foam}44`}} />
        <div style={{fontSize: 20, letterSpacing: '0.3em', color: C.muted}}>DASAR YANG GELAP</div>
      </div>
      {/* chapter, swaps with a wipe on every act boundary */}
      <div style={{position: 'absolute', left: SAFE.left, top: 186, height: 30, overflow: 'hidden', width: 900}}>
        <div style={{transform: `translateY(${(1 - eOut(p)) * 34}px)`, opacity: eOut(p)}}>
          <span style={{fontSize: 21, letterSpacing: '0.26em', color: accent}}>{act.chapter}</span>
          {shot ? (
            <span style={{fontSize: 16, letterSpacing: '0.24em', color: C.muted, marginLeft: 20}}>
              {String(shot.index + 1).padStart(2, '0')}/{String(tl.shots.length).padStart(2, '0')}
            </span>
          ) : null}
        </div>
      </div>
      {/* right: running timecode + progress */}
      <div style={{position: 'absolute', right: 1440 - SAFE.right, top: 128, textAlign: 'right'}}>
        <div style={{fontSize: 20, letterSpacing: '0.24em', color: C.muted, fontVariantNumeric: 'tabular-nums'}}>
          {String(Math.floor(t / 60)).padStart(2, '0')}:{String(Math.floor(t % 60)).padStart(2, '0')} /{' '}
          {String(Math.floor(tl.durationSec / 60)).padStart(2, '0')}:{String(Math.floor(tl.durationSec % 60)).padStart(2, '0')}
        </div>
        <div style={{marginTop: 14, width: 190, height: 2, background: `${C.foam}22`, marginLeft: 'auto', position: 'relative'}}>
          <div style={{position: 'absolute', inset: 0, width: `${clamp(t / tl.durationSec) * 100}%`, background: accent, boxShadow: `0 0 14px ${accent}`}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* Slate: the number/fact stamp that lands when a claim is made. */
export const Slate: React.FC<{text: string; at: number; t: number; accent?: string; top?: number}> = ({
  text,
  at,
  t,
  accent = C.sonar,
  top = 1652,
}) => {
  const {fps} = useVideoConfigSafe();
  const local = t - at;
  if (local < -0.01) return null;
  const inP = eOut(clamp(local / 0.45));
  const out = eOut(clamp((local - 4.4) / 0.4));
  const chars = text.length;
  const size = chars > 26 ? 44 : chars > 16 ? 56 : 68;
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        top,
        opacity: inP * (1 - out),
        transform: `translateY(${(1 - inP) * 22 - out * 16}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
      }}
    >
      <div style={{width: 4, height: size * 1.05, background: accent, boxShadow: `0 0 22px ${accent}`}} />
      <div
        style={{
          fontFamily: F.mono,
          fontSize: size,
          fontWeight: 600,
          letterSpacing: '0.02em',
          color: C.foam,
          whiteSpace: 'nowrap',
          textShadow: `0 0 40px ${accent}44`,
        }}
      >
        {text}
      </div>
      <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.3em', color: C.muted, marginLeft: 8}}>
        {String(Math.round((local * fps) / fps)).padStart(2, '0')}
      </div>
    </div>
  );
};

// tiny indirection so Slate doesn't need the hook import in its signature
import {useVideoConfig} from 'remotion';
const useVideoConfigSafe = () => useVideoConfig();

/* Corner registration marks — the "survey instrument" tell. */
export const Marks: React.FC<{opacity?: number; color?: string}> = ({opacity = 0.34, color = C.foam}) => {
  const mark = (rot: number, x: number, y: number) => (
    <div key={`${x}-${y}`} style={{position: 'absolute', left: x, top: y, width: 40, height: 40, transform: `rotate(${rot}deg)`, opacity}}>
      <div style={{position: 'absolute', inset: 0, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}`}} />
    </div>
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {mark(0, 44, 44)}
      {mark(90, 1440 - 84, 44)}
      {mark(180, 1440 - 84, H - 84)}
      {mark(270, 44, H - 84)}
    </AbsoluteFill>
  );
};
