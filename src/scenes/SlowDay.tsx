import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, H, W, alpha, clamp, eOut, lerp} from '../theme';
import {SpaceBackdrop, StarField} from '../ui/Atmosphere';
import {Readout} from '../ui/Hud';
import type {Act, Shot} from '../timeline';

/* 06 — HARI.
   Two clocks side by side: the day we have and the day the Devonian had.
   Hands move at the real ratio, both tick, and the difference is the story. */
const Clock: React.FC<{
  cx: number;
  cy: number;
  r: number;
  label: string;
  sub: string;
  hours: number;
  tick: number;
  accent: string;
  dim?: boolean;
}> = ({cx, cy, r, label, sub, hours, tick, accent, dim}) => {
  const hourA = (hours % 12) * 30 + (hours % 1) * 30;
  const minA = ((hours * 60) % 60) * 6;
  return (
    <div style={{position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, opacity: dim ? 0.55 : 1}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${alpha(C.ink, 0.28)}`, background: alpha(C.abyss, 0.65)}} />
      {Array.from({length: 60}).map((_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const big = i % 5 === 0;
        const r1 = r * (big ? 0.80 : 0.86);
        const r2 = r * 0.90;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx - cx + r + Math.sin(a) * r1,
              top: r + -Math.cos(a) * r1,
              width: big ? 4 : 2,
              height: r2 - r1,
              background: alpha(C.ink, big ? 0.55 : 0.22),
              transform: `rotate(${i * 6}deg)`,
              transformOrigin: '50% 0%',
            }}
          />
        );
      })}
      {/* hour hand */}
      <div style={{position: 'absolute', left: r - 5, top: r - r * 0.52, width: 10, height: r * 0.52, background: C.ink, transform: `rotate(${hourA}deg)`, transformOrigin: '50% 100%'}} />
      {/* minute hand */}
      <div style={{position: 'absolute', left: r - 3, top: r - r * 0.78, width: 6, height: r * 0.78, background: accent, transform: `rotate(${minA}deg)`, transformOrigin: '50% 100%'}} />
      <div style={{position: 'absolute', left: r - 8, top: r - 8, width: 16, height: 16, borderRadius: '50%', background: accent}} />
      <div style={{position: 'absolute', left: -r, top: r * 2 + 26, width: r * 2, textAlign: 'center', fontFamily: '"SpaceGrotesk"', fontSize: 54, fontWeight: 700, color: accent, letterSpacing: '-0.02em'}}>
        {label}
      </div>
      <div style={{position: 'absolute', left: -r, top: r * 2 + 92, width: r * 2, textAlign: 'center', fontFamily: '"PlexMono"', fontSize: 19, letterSpacing: '0.22em', color: C.muted}}>
        {sub}
      </div>
    </div>
  );
};

export const SlowDay: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const local = t - shot.start;

  const enter = eOut(clamp(local / 0.9));
  const tick = local;

  // today 24 h, Devonian 22 h. Both run from the same start so the gap opens.
  const nowH = 7 + local * 1.2;
  const pastH = 7 + local * 0.9167 * 1.2 * (22 / 24) * (24 / 22); // same rate, shorter dial day
  const gap = clamp((local - 3.2) / 1.6);

  return (
    <AbsoluteFill style={{background: C.void}}>
      <SpaceBackdrop from={C.deep} to={C.void} />
      <StarField opacity={0.3} drift={0.15} seed={52} />

      <AbsoluteFill style={{opacity: enter}}>
        <Clock cx={430} cy={860} r={252} label="24 JAM" sub="SEKARANG" hours={nowH} tick={tick} accent={C.gold} />
        <Clock cx={1010} cy={860} r={252} label="22 JAM" sub="400 JUTA TAHUN LALU" hours={pastH} tick={tick} accent={C.mint} dim />
      </AbsoluteFill>

      {/* the gap between the two day-lengths, drawn as a proper bracket with a
          label, so the coral reads as a measurement rather than a stray rule */}
      {gap > 0 ? (
        <div style={{position: 'absolute', left: 720, top: 690, width: 2, height: 340, background: alpha(C.coral, 0.75 * gap), opacity: gap}}>
          <div style={{position: 'absolute', left: -14, top: 0, width: 30, height: 2, background: alpha(C.coral, 0.75 * gap)}} />
          <div style={{position: 'absolute', left: -14, top: 338, width: 30, height: 2, background: alpha(C.coral, 0.75 * gap)}} />
          <div
            style={{
              position: 'absolute',
              left: 26,
              top: 132,
              fontFamily: '"PlexMono"',
              fontSize: 21,
              letterSpacing: '0.18em',
              color: C.coral,
              whiteSpace: 'nowrap',
            }}
          >
            −2 JAM
          </div>
        </div>
      ) : null}

      <Readout value="+1,8" unit="ms / abad" note="hari makin panjang, tanpa terasa" at={shot.start + 4.4} t={t} y={1500} color={C.gold} size={138} />
    </AbsoluteFill>
  );
};
