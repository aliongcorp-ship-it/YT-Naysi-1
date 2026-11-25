import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, H, W, alpha, clamp, eOut, lerp} from '../theme';
import {SpaceBackdrop, StarField, Grain} from '../ui/Atmosphere';
import {Readout} from '../ui/Hud';
import type {Act, Shot} from '../timeline';

/* 04 — MILIMETER.
   The measurement itself: a pulse goes out, comes back 2.56 s later, and the
   round trip is timed to picoseconds. Drawn as an instrument trace — an
   outgoing spike, a long flat line, a returning spike that keeps being sampled
   until the mean settles on a millimetre. */
export const Precision: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const local = t - shot.start;

  const send = clamp(local / 0.35);
  const flight = clamp((local - 0.35) / 2.56);
  const received = local > 2.91;
  const settle = clamp((local - 3.4) / 2.2);

  const gx0 = 170;
  const gx1 = W - 170;
  const gy = 900;
  const gw = gx1 - gx0;

  // the trace is built from the actual story timings, not decoration
  const path: string[] = [];
  path.push(`M${gx0} ${gy}`);
  path.push(`L${gx0 + gw * 0.06} ${gy}`);
  if (send > 0) {
    const px = gx0 + gw * 0.06;
    path.push(`L${px + 6} ${gy - 150 * send}`);
    path.push(`L${px + 12} ${gy}`);
  }
  const travelEnd = gx0 + gw * (0.06 + 0.88 * eOut(flight));
  path.push(`L${received ? travelEnd - 12 : travelEnd} ${gy}`);
  if (received) {
    path.push(`L${travelEnd - 6} ${gy - 96}`);
    path.push(`L${travelEnd} ${gy}`);
  }
  path.push(`L${gx1} ${gy}`);

  return (
    <AbsoluteFill style={{background: C.void}}>
      <SpaceBackdrop from={C.abyss} to={C.void} />
      <StarField opacity={0.35} drift={0.2} seed={31} />

      {/* instrument panel */}
      <div
        style={{
          position: 'absolute',
          left: gx0 - 46,
          top: gy - 320,
          width: gw + 92,
          height: 560,
          border: `1px solid ${alpha(C.shallow, 0.55)}`,
          background: alpha(C.abyss, 0.55),
        }}
      />
      <div style={{position: 'absolute', left: gx0, top: gy - 292, fontFamily: '"PlexMono"', fontSize: 19, letterSpacing: '0.26em', color: C.muted}}>
        APOLLO · APACHE POINT
      </div>
      <div style={{position: 'absolute', left: gx0, top: gy - 292, width: gw, textAlign: 'right', fontFamily: '"PlexMono"', fontSize: 19, letterSpacing: '0.26em', color: C.mint}}>
        {received ? 'KUNCI' : 'MENEMBAK'}
      </div>

      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
        <path d={path.join(' ')} fill="none" stroke={C.mint} strokeWidth={3} strokeLinejoin="miter" />
        {/* baseline, hairline */}
        <line x1={gx0} y1={gy} x2={gx1} y2={gy} stroke={alpha(C.shallow, 0.5)} strokeWidth={1} />
      </svg>

      {/* the 2.56 s bracket: the number the whole chapter is about */}
      <div style={{position: 'absolute', left: gx0 + gw * 0.06, top: gy + 60, width: gw * 0.88 * eOut(flight), height: 1, background: alpha(C.muted, 0.45)}} />
      <div style={{position: 'absolute', left: gx0 + gw * 0.5 - 130, top: gy + 78, width: 260, textAlign: 'center', fontFamily: '"PlexMono"', fontSize: 22, letterSpacing: '0.2em', color: C.muted, opacity: eOut(flight)}}>
        2,56 DETIK
      </div>

      {/* repeated samples stacking into a mean */}
      <div style={{position: 'absolute', left: gx0, top: gy + 200, opacity: settle}}>
        <div style={{fontFamily: '"PlexMono"', fontSize: 20, letterSpacing: '0.24em', color: C.muted}}>SIMPLANGAN PULANG</div>
        <div style={{display: 'flex', gap: 7, marginTop: 20, alignItems: 'flex-end'}}>
          {Array.from({length: 34}).map((_, i) => {
            const h = 16 + Math.abs(Math.sin(i * 2.7)) * 74;
            const on = settle > i / 34;
            return <div key={i} style={{width: 9, height: h, background: on ? alpha(C.mint, 0.75) : alpha(C.shallow, 0.28)}} />;
          })}
        </div>
      </div>

      <Readout value="1" unit="mm" note="ketelitian jarak, tiap malam" at={shot.start + 3.9} t={t} y={380} color={C.mint} size={170} />

      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: 1380,
          textAlign: 'center',
          opacity: clamp((local - 5.4) / 0.7),
          fontFamily: '"Fraunces"',
          fontStyle: 'italic',
          fontSize: 46,
          color: C.muted,
        }}
      >
        lima dekade, satu milimeter demi satu
      </div>
    </AbsoluteFill>
  );
};
