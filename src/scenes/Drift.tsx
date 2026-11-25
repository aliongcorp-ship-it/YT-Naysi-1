import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, H, W, alpha, clamp, eOut, lerp} from '../theme';
import {SpaceBackdrop, StarField, EarthLimb} from '../ui/Atmosphere';
import {Span} from '../ui/Space';
import {Readout} from '../ui/Hud';
import type {Act, Shot} from '../timeline';

/* 08 — AKHIR.
   The same system we opened on, but now the gap is measured and permanent.
   The film closes on the viewer's own night sky, with the question left open. */
export const Drift: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const local = t - shot.start;

  const enter = eOut(clamp(local / 1.1));
  const open = clamp((local - 0.8) / 4.2);
  const horizon = clamp((local - 5.4) / 1.8);

  const earthX = 250;
  const moonX = lerp(760, W - 240, eOut(open));

  return (
    <AbsoluteFill style={{background: C.void}}>
      <SpaceBackdrop from={C.abyss} to={C.void} earthLight={1} />
      <StarField opacity={0.9} drift={0.5} seed={77} />

      <AbsoluteFill style={{opacity: enter}}>
        {/* Earth, small, on the left */}
        <div
          style={{
            position: 'absolute',
            left: earthX - 130,
            top: 760 - 130,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: `radial-gradient(circle at 34% 28%, #2E4A63 0%, #16304A 42%, #081525 78%)`,
          }}
        />
        <div style={{position: 'absolute', left: earthX - 130, top: 760 - 130, width: 260, height: 260, borderRadius: '50%', border: `2px solid ${alpha(C.warm, 0.16)}`}} />

        {/* the Moon, receding to the right */}
        <div
          style={{
            position: 'absolute',
            left: moonX - 96,
            top: 760 - 96,
            width: 192,
            height: 192,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 36% 30%, #D7D0BE 0%, #A9A190 46%, #57544A 100%)',
            overflow: 'hidden',
          }}
        >
          {Array.from({length: 16}).map((_, i) => {
            const a = (i * 137.5 * Math.PI) / 180;
            const rr = Math.sqrt((i % 7) / 7) * 0.8;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${50 + Math.cos(a) * rr * 50}%`,
                  top: `${50 + Math.sin(a) * rr * 50}%`,
                  width: 10 + (i % 4) * 6,
                  height: 10 + (i % 4) * 6,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 38% 34%, rgba(255,255,255,0.08), rgba(0,0,0,${0.08 + (i % 3) * 0.05}) 62%)`,
                }}
              />
            );
          })}
        </div>

        <Span x0={earthX + 140} x1={moonX - 106} y={760} label="384.400 KM" sub="DAN BERTAMBAH 3,8 CM / TAHUN" at={shot.start + 1.2} t={t} color={C.gold} />
      </AbsoluteFill>

      {/* the closing readout */}
      <Readout value="+3,8" unit="cm" note="setiap tahun, selamanya" at={shot.start + 5.6} t={t} y={1180} color={C.ink} size={126} />

      {/* final frame: the horizon you would see tonight */}
      <AbsoluteFill style={{opacity: horizon * 0.9}}>
        <EarthLimb cx={W / 2} cy={H + 620} r={1750} lit={0.65} tilt={-10} detail={0.4} />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: 1400,
          textAlign: 'center',
          opacity: clamp((local - 6.2) / 0.9),
          fontFamily: '"Fraunces"',
          fontStyle: 'italic',
          fontSize: 50,
          color: C.muted,
          letterSpacing: '-0.01em',
        }}
      >
        begitu pun besok malam
      </div>
    </AbsoluteFill>
  );
};
