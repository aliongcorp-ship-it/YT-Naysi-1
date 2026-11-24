import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ContourField, WaterColumn} from '../ui/Atmosphere';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp} from '../theme';
import type {Act, Shot} from '../timeline';

/*  ACT 10 — back to the surface.
    The horizon appears, the water gets loud again, and the last line lands.   */

export const Surface: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  const rise = eOutQuint(clamp((t - 0.6) / 4.2));
  const depth = lerp(900, 120, rise);
  const horizon = lerp(1980, 1560, rise);
  const shotEnd = shot.frames / 90;
  const plate = eOut(clamp((t - (shotEnd - 2.1)) / 0.8));
  const headOut = 1 - clamp((plate - 0.35) / 0.5);

  return (
    <AbsoluteFill>
      <WaterColumn depth={depth} intensity={0.55 + 0.45 * rise} rays={rise} seed={43} />

      {/* surface + horizon */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: horizon,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${C.foam}AA, transparent)`,
          opacity: rise,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: horizon,
          height: 700,
          background: `linear-gradient(180deg, rgba(6,34,49,0.2), rgba(1,6,10,0.92))`,
          opacity: rise,
        }}
      />

      <ContourField opacity={0.14 * (1 - rise) + 0.05} y={860} seed={23} color={C.sonar} zoom={1.5} />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 360,
          width: 1180,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 96,
          lineHeight: 0.95,
          letterSpacing: '-0.048em',
          color: C.ink,
          opacity: eOut(clamp(t / 0.8)) * headOut,
        }}
      >
        Yang kamu lihat
        <br />
        cuma <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 500, color: C.sonar}}>kulitnya</span>.
      </div>

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 760,
          fontFamily: F.mono,
          fontSize: 21,
          letterSpacing: '0.3em',
          color: C.muted,
          opacity: eOut(clamp((t - 1.2) / 0.8)) * headOut,
        }}
      >
        INDONESIA · ± 17.500 PULAU · 2/3 WILAYAH ADALAH LAUT
      </div>

      {/* end plate: only in the tail, when the narration is over */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 980,
          opacity: plate,
          transform: `translateY(${(1 - plate) * 26}px)`,
          textAlign: 'center',
        }}
      >
        <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.44em', color: C.sonar, marginBottom: 22}}>NAYSI</div>
        <div style={{width: 84, height: 2, background: C.sonar, margin: '0 auto 30px', boxShadow: `0 0 22px ${C.sonar}`}} />
        <div style={{fontFamily: F.display, fontSize: 92, fontWeight: 700, letterSpacing: '-0.05em', color: C.ink, lineHeight: 0.94}}>
          Dasar
          <br />
          yang Gelap
        </div>
        <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: '0.3em', color: C.muted, marginTop: 30}}>
          EPISODE 01 · GEBCO / SEABED 2030
        </div>
      </div>

    </AbsoluteFill>
  );
};
