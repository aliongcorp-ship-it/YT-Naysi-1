import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ContourField, WaterColumn} from '../ui/Atmosphere';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp} from '../theme';
import type {Act, Shot} from '../timeline';

/*  SHOT — the consequence of the peel: 150 km of crust letting go.
    Drawn from above as a bathymetric scar, with the slab separating in plan.  */

export const Slab: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  const sep = eOutQuint(clamp((t - 1.2) / 5.0));
  const label = eOut(clamp((t - 4.6) / 0.9));

  return (
    <AbsoluteFill>
      <WaterColumn depth={7440} intensity={0.42} rays={0} seed={59} tint={C.iris} />
      <ContourField opacity={0.26} y={700} seed={31} color={C.iris} zoom={1.35} />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 330,
          width: 1120,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 86,
          lineHeight: 0.97,
          letterSpacing: '-0.045em',
          color: C.ink,
          opacity: eOut(clamp(t / 0.7)),
        }}
      >
        Satu slab
        <span style={{color: C.iris}}> 150 km</span>
        <br />
        terlepas.
      </div>

      {/* plan view: one block sliding out of a scar */}
      <div style={{position: 'absolute', left: 150, top: 760, width: 1140, height: 620, perspective: 1300}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateX(46deg) rotateZ(-8deg)',
            transformOrigin: '50% 50%',
          }}
        >
          {/* scar */}
          <div
            style={{
              position: 'absolute',
              left: 60,
              top: 120,
              width: 900,
              height: 330,
              background: `linear-gradient(160deg, ${C.void}, #060A16)`,
              border: `1.5px solid ${C.iris}55`,
              borderRadius: 6,
              boxShadow: `inset 0 0 90px ${C.iris}22`,
            }}
          >
            {Array.from({length: 9}).map((_, i) => (
              <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 18 + i * 36, height: 1, background: `${C.iris}14`}} />
            ))}
          </div>
          {/* fault hatching */}
          {Array.from({length: 16}).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 60 + i * 56,
                top: 120,
                width: 1.5,
                height: 330,
                background: `${C.iris}12`,
              }}
            />
          ))}
          {/* the sliding slab */}
          <div
            style={{
              position: 'absolute',
              left: 60 + 150 * sep,
              top: 120 - 90 * sep,
              width: 380,
              height: 300,
              background: `linear-gradient(150deg, ${C.iris}33, ${C.iris}0A)`,
              border: `2.5px solid ${C.iris}`,
              borderRadius: 5,
              transform: `rotate(${-6 * sep}deg) scale(${1 - 0.06 * sep})`,
              boxShadow: `0 0 ${50 * sep}px ${C.iris}55`,
            }}
          >
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 26, letterSpacing: '0.2em', color: C.foam}}>
              SLAB
            </div>
          </div>
          {/* measure tape */}
          <div style={{position: 'absolute', left: 60, top: 500, width: 380, height: 2, background: C.sonar, opacity: label}} />
          <div style={{position: 'absolute', left: 60, top: 508, fontFamily: F.mono, fontSize: 24, letterSpacing: '0.16em', color: C.sonar, opacity: label}}>
            ± 150 KM
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 1420,
          width: 1130,
          opacity: label,
          transform: `translateY(${(1 - label) * 22}px)`,
          fontFamily: F.display,
          fontSize: 42,
          lineHeight: 1.24,
          letterSpacing: '-0.02em',
          color: C.muted,
        }}
      >
        Bukan lempeng yang menyelam ke mantel.
        <br />
        <span style={{color: C.ink}}>Cangkangnya sendiri yang lepas</span>, lalu jatuh ribuan meter.
      </div>

      <div style={{position: 'absolute', left: SAFE.left, top: 1600, display: 'flex', gap: 34, opacity: label}}>
        {[
          ['PERIODE', '2018'],
          ['METODE', 'SONAR MULTIBEAM'],
          ['BUKTI', 'BATUAN MANTEL'],
        ].map(([k, v]) => (
          <div key={k} style={{borderTop: `1.5px solid ${C.iris}66`, paddingTop: 12, minWidth: 250}}>
            <div style={{fontFamily: F.mono, fontSize: 15, letterSpacing: '0.26em', color: C.muted}}>{k}</div>
            <div style={{fontFamily: F.mono, fontSize: 24, color: C.foam, marginTop: 4}}>{v}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
