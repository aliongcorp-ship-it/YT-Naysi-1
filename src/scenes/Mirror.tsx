import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, H, W, alpha, clamp, eOut, lerp} from '../theme';
import {SpaceBackdrop, StarField, Grain} from '../ui/Atmosphere';
import {MoonDisk} from '../ui/Atmosphere';
import {Readout} from '../ui/Hud';
import type {Act, Shot} from '../timeline';

/* 02 — CERMIN.
   The Apollo array as an object, not a photo: a 10x10 aluminium panel of
   corner cubes, tilted, with one prism lighting up to show the retroreflector
   trick. The panel is drawn to scale against the boot print beside it. */
const PANEL = 620; // px
const N = 10;

export const Mirror: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const local = t - shot.start;

  const enter = eOut(clamp(local / 1.0));
  const grid = clamp((local - 0.5) / 1.6);
  const hit = clamp((local - 4.2) / 0.5);
  const sweep = clamp((local - 4.6) / 2.2);

  const cx = W / 2;
  const cy = 880;

  return (
    <AbsoluteFill style={{background: C.void}}>
      <SpaceBackdrop from={C.abyss} to={C.void} />
      <StarField opacity={0.55} drift={0.35} seed={9} />
      <MoonDisk cx={W / 2} cy={2380} r={1500} phase={0.42} seed={21} opacity={0.52} />
      {/* regolith haze: texture, not light */}
      <AbsoluteFill style={{background: `linear-gradient(0deg, ${alpha('#08080A', 0.80)} 0%, ${alpha('#08080A', 0.35)} 34%, transparent 58%)`}} />

      <AbsoluteFill style={{opacity: enter}}>
        {/* panel body */}
        <div
          style={{
            position: 'absolute',
            left: cx - PANEL / 2,
            top: cy - PANEL / 2,
            width: PANEL,
            height: PANEL,
            transform: `perspective(1500px) rotateX(24deg) rotateZ(-7deg) scale(${lerp(0.96, 1, enter)})`,
            background: `linear-gradient(158deg, #4C4A42 0%, #33322C 46%, #22221E 100%)`,
            border: `2px solid ${alpha(C.ink, 0.18)}`,
            boxShadow: `inset 0 0 60px ${alpha('#000000', 0.6)}`,
          }}
        >
          {Array.from({length: N * N}).map((_, i) => {
            const col = i % N;
            const row = Math.floor(i / N);
            const order = (col + row) / (N * 2 - 2);
            const on = grid > order;
            const isHot = Math.abs(col - 4) <= 1 && Math.abs(row - 5) <= 1;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: (col / N) * PANEL + 6,
                  top: (row / N) * PANEL + 6,
                  width: PANEL / N - 12,
                  height: PANEL / N - 12,
                  background: on
                    ? isHot && hit > 0
                      ? `linear-gradient(140deg, ${alpha(C.gold, 0.55 * hit)}, ${alpha(C.gold, 0.12)})`
                      : `linear-gradient(140deg, ${alpha('#8E8B7E', 0.30)}, ${alpha('#3A3931', 0.30)})`
                    : alpha('#000000', 0.35),
                  border: `1px solid ${alpha(C.ink, on ? 0.12 : 0.05)}`,
                }}
              />
            );
          })}
        </div>

        {/* dimension leaders, like a technical drawing */}
        <div style={{position: 'absolute', left: cx - PANEL / 2, top: cy + PANEL / 2 + 46, width: PANEL, height: 1, background: alpha(C.gold, 0.5 * grid)}} />
        <div style={{position: 'absolute', left: cx - 168, top: cy + PANEL / 2 + 62, fontFamily: '"PlexMono"', fontSize: 24, letterSpacing: '0.16em', color: C.gold, opacity: grid}}>
          46 CM
        </div>
        <div style={{position: 'absolute', left: cx + PANEL / 2 + 34, top: cy - 12, width: 1, height: PANEL, background: alpha(C.gold, 0.35 * grid)}} />
        <div
          style={{
            position: 'absolute',
            left: cx + PANEL / 2 + 50,
            top: cy + PANEL / 2 - 40,
            fontFamily: '"PlexMono"',
            fontSize: 22,
            letterSpacing: '0.14em',
            color: C.muted,
            opacity: grid,
            lineHeight: 1.5,
          }}
        >
          100 PRISMA
          <br />
          <span style={{color: C.shallow}}>FUSED SILICA</span>
        </div>
      </AbsoluteFill>

      {/* the laser that comes back: a single sweep across the panel */}
      {sweep > 0 && sweep < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: cx - PANEL / 2 + sweep * PANEL,
            top: cy - PANEL / 2 - 30,
            width: 4,
            height: PANEL + 60,
            background: alpha(C.gold, 0.7 * Math.sin(sweep * Math.PI)),
          }}
        />
      ) : null}

      <Readout value="1969" unit="" note="Laut Ketenangan" at={shot.start + 4.9} t={t} y={420} color={C.ink} size={150} />
    </AbsoluteFill>
  );
};
