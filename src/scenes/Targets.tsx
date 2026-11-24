import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ContourField, WaterColumn} from '../ui/Atmosphere';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp} from '../theme';
import type {Act, Shot} from '../timeline';

/*  SHOT — the comparison that stings: every other world is already imaged.  */

const BODIES: {name: string; res: string; color: string; ring?: boolean; style: 'rock' | 'gas' | 'ice'}[] = [
  {name: 'BULAN', res: '100 M', color: '#B9BEC7', style: 'rock'},
  {name: 'MARS', res: '100 M', color: '#C4704B', style: 'rock'},
  {name: 'VENUS', res: '± 100 M', color: '#D9B37A', style: 'gas'},
  {name: 'ASTEROID BENNU', res: '5 CM', color: '#8A8577', style: 'rock'},
];

const Disc: React.FC<{b: (typeof BODIES)[number]; r: number; p: number}> = ({b, r, p}) => (
  <div style={{position: 'relative', width: r * 2, height: r * 2, opacity: p, transform: `scale(${lerp(0.86, 1, p)})`}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background:
          b.style === 'gas'
            ? `radial-gradient(circle at 34% 30%, #EAD3A6, ${b.color} 46%, #6A4A2C 86%, #1A1208 100%)`
            : `radial-gradient(circle at 33% 28%, ${b.color}, #4E4A44 58%, #12100E 100%)`,
        boxShadow: `inset -${r * 0.2}px -${r * 0.14}px ${r * 0.42}px rgba(0,0,0,0.8)`,
      }}
    />
    {/* scan lines that say "measured" */}
    {Array.from({length: 6}).map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: r * 0.1,
          right: r * 0.1,
          top: r * (2.2 - i * 0.34),
          height: 1,
          background: `${C.foam}55`,
          transform: `scaleX(${Math.sqrt(Math.max(0, 1 - Math.pow((0.5 - i / 5) * 1.9, 2)))})`,
        }}
      />
    ))}
    <div
      style={{
        position: 'absolute',
        inset: -10,
        borderRadius: '50%',
        border: `1px dashed ${C.foam}33`,
      }}
    />
  </div>
);

export const Targets: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  const ours = eOutQuint(clamp((t - 3.4) / 1.2));

  return (
    <AbsoluteFill>
      <WaterColumn depth={420} intensity={0.8} rays={0.6} seed={53} />
      <ContourField opacity={0.2} y={1000} seed={7} zoom={1.15} color={C.sonar} />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 330,
          width: 1140,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 82,
          lineHeight: 0.98,
          letterSpacing: '-0.045em',
          color: C.ink,
          opacity: eOut(clamp(t / 0.7)),
        }}
      >
        Semua sudah dipotret.
        <br />
        <span style={{color: C.muted}}>Kecuali satu.</span>
      </div>

      <div style={{position: 'absolute', left: SAFE.left, top: 640, display: 'flex', flexWrap: 'wrap', gap: 54, width: 1200}}>
        {BODIES.map((b, i) => {
          const p = eOutQuint(clamp((t - 0.6 - i * 0.45) / 0.9));
          return (
            <div key={b.name} style={{width: 250}}>
              <Disc b={b} r={92} p={p} />
              <div style={{marginTop: 20, fontFamily: F.mono, fontSize: 17, letterSpacing: '0.2em', color: C.muted, opacity: p}}>{b.name}</div>
              <div style={{fontFamily: F.display, fontSize: 34, fontWeight: 600, color: C.foam, letterSpacing: '-0.02em', opacity: p}}>{b.res}</div>
            </div>
          );
        })}

        {/* the outlier */}
        <div style={{width: 250}}>
          <div style={{position: 'relative', width: 184, height: 184, opacity: ours, transform: `scale(${lerp(0.9, 1, ours)})`}}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: `radial-gradient(circle at 34% 30%, ${C.deep}, ${C.abyss} 62%, ${C.void} 100%)`,
                border: `1px dashed ${C.sonar}66`,
              }}
            />
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 48, color: C.sonar, opacity: 0.32}}>
              ?
            </div>
            {[0, 1].map((k) => {
              const q = ((t * 0.6 + k * 0.5) % 1);
              return (
                <div
                  key={k}
                  style={{
                    position: 'absolute',
                    left: 92 - 92 * q,
                    top: 92 - 92 * q,
                    width: 184 * q,
                    height: 184 * q,
                    borderRadius: '50%',
                    border: `1.5px solid ${C.sonar}`,
                    opacity: (1 - q) * 0.5 * ours,
                  }}
                />
              );
            })}
          </div>
          <div style={{marginTop: 20, fontFamily: F.mono, fontSize: 17, letterSpacing: '0.2em', color: C.sonar, opacity: ours}}>LAUT KITA</div>
          <div style={{fontFamily: F.display, fontSize: 34, fontWeight: 700, color: C.sonar, letterSpacing: '-0.02em', opacity: ours}}>72,7% ?</div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 1330,
          width: 1150,
          fontFamily: F.mono,
          fontSize: 22,
          lineHeight: 1.7,
          letterSpacing: '0.05em',
          color: C.muted,
          opacity: eOut(clamp((t - 6.4) / 0.9)),
        }}
      >
        <div style={{color: C.sonar}}>BENNU — dipetakan sampai resolusi 5 cm, dari orbit.</div>
        <div style={{color: C.sonar}}>MARS — seluruh permukaan, 100 meter per piksel.</div>
        <div>DASAR LAUT BUMI — 72,7% masih tebakan dari gravitasi satelit.</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 1520,
          width: 1120,
          fontFamily: F.display,
          fontSize: 50,
          fontWeight: 700,
          letterSpacing: '-0.035em',
          lineHeight: 1.02,
          color: C.ink,
          opacity: eOut(clamp((t - 8.8) / 0.9)),
        }}
      >
        Kita tahu bentuk batu di sabuk asteroid.
        <br />
        <span style={{color: C.sonar}}>Kita tidak tahu bentuk rumah sendiri.</span>
      </div>
    </AbsoluteFill>
  );
};
