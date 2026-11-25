import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, H, W, alpha, clamp, eOut, lerp} from '../theme';
import {SpaceBackdrop, StarField, CoordGrid} from '../ui/Atmosphere';
import {EarthAtCorner} from '../ui/Space';
import {Readout} from '../ui/Hud';
import type {Act, Shot} from '../timeline';

/* 03 — SATU FOTON.
   The beam leaves a telescope, widens to 20 km by the time it reaches the
   Moon, and only one dot comes back. Drawn as a cone with a counting readout,
   because the whole point is the ratio, not the light. */
export const Photon: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const local = t - shot.start;

  const travel = clamp((local - 0.9) / 3.2); // beam crossing
  const back = clamp((local - 5.0) / 2.6); // one photon returning
  const hit = clamp((local - 4.2) / 0.5);

  const x0 = 210; // telescope
  const x1 = W - 250; // moon edge
  const y0 = 760;
  const spread = lerp(10, 210, eOut(travel));

  return (
    <AbsoluteFill style={{background: C.void}}>
      <SpaceBackdrop from={C.abyss} to={C.void} />
      <StarField opacity={0.6} drift={0.3} seed={14} />
      <CoordGrid opacity={0.07} step={140} />

      {/* the two ends of the journey */}
      <EarthAtCorner x={x0} y={y0 + 300} r={150} />
      <div
        style={{
          position: 'absolute',
          left: x1 - 10,
          top: y0 - 250,
          width: 20,
          height: 560,
          background: `linear-gradient(180deg, transparent, ${alpha(C.muted, 0.5)} 18%, ${alpha(C.muted, 0.5)} 82%, transparent)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x1 + 34,
          top: y0 - 20,
          fontFamily: '"PlexMono"',
          fontSize: 20,
          letterSpacing: '0.22em',
          color: C.muted,
          lineHeight: 1.9,
        }}
      >
        BULAN
        <br />
        <span style={{color: C.shallow}}>RETROREFLEKTOR</span>
      </div>

      {/* outgoing beam: a cone, hairline edges, faint fill */}
      {travel > 0 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: x0,
              top: y0 - spread / 2,
              width: (x1 - x0) * eOut(travel),
              height: spread,
              background: `linear-gradient(90deg, ${alpha(C.gold, 0.30)}, ${alpha(C.gold, 0.06)})`,
              clipPath: `polygon(0 50%, 100% 0, 100% 100%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: x0,
              top: y0 - drop(spread),
              width: (x1 - x0) * eOut(travel),
              height: 2,
              background: alpha(C.gold, 0.55),
              transform: `rotate(${(Math.atan(spread / 2 / (x1 - x0)) * 180) / Math.PI}deg)`,
              transformOrigin: '0 50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: x0,
              top: y0 + drop(spread),
              width: (x1 - x0) * eOut(travel),
              height: 2,
              background: alpha(C.gold, 0.55),
              transform: `rotate(${(-Math.atan(spread / 2 / (x1 - x0)) * 180) / Math.PI}deg)`,
              transformOrigin: '0 50%',
            }}
          />
        </>
      ) : null}

      {/* the panel being hit */}
      <div
        style={{
          position: 'absolute',
          left: x1 - 4,
          top: y0 - 44,
          width: 8,
          height: 88,
          background: alpha(C.gold, hit),
        }}
      />

      {/* the returning photon: one dot, one trail */}
      {back > 0 && back < 1.001 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: lerp(x1, x0, back),
              top: y0 - 5,
              width: 10,
              height: 10,
              background: C.ink,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: lerp(x1, x0, back),
              top: y0 - 1,
              width: 70,
              height: 2,
              background: alpha(C.ink, 0.35),
            }}
          />
        </>
      ) : null}

      {/* the spread callout */}
      <div style={{position: 'absolute', left: x1 - 350, top: y0 + 300, opacity: clamp((local - 3.4) / 0.6)}}>
        <div style={{fontFamily: '"PlexMono"', fontSize: 21, letterSpacing: '0.22em', color: C.muted}}>BERKAS MELEBAR</div>
        <div style={{fontFamily: '"SpaceGrotesk"', fontSize: 72, fontWeight: 700, color: C.gold, letterSpacing: '-0.03em', marginTop: 8}}>
          20 <span style={{fontSize: 34, color: C.ink}}>KM</span>
        </div>
      </div>

      <Readout
        value="384.400"
        unit="km"
        note="jarak rata-rata Bumi–Bulan"
        at={shot.start + 1.4}
        t={t}
        y={300}
        color={C.ink}
        size={122}
      />
    </AbsoluteFill>
  );
};

const drop = (spread: number) => spread / 2;
