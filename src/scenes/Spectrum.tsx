import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {WaterColumn} from '../ui/Atmosphere';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp} from '../theme';
import type {Act, Shot} from '../timeline';

/*  SHOT — light stops, so light gets manufactured.
    A spectrum analyser for three emission bands, then the division of labour
    between sunlight and bioluminescence, stated as numbers.                  */

const BANDS: {nm: string; name: string; color: string; depth: string}[] = [
  {nm: '470 nm', name: 'BIRU', color: '#3FA9FF', depth: 'menembus paling jauh'},
  {nm: '505 nm', name: 'HIJAU', color: '#4BEBA0', depth: 'paling umum di laut dalam'},
  {nm: '650 nm', name: 'MERAH', color: '#FF4D4D', depth: 'hampir tak terlihat'},
];

export const Spectrum: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  const dive = eOut(clamp((t + 0.1) / 6.0));
  const depth = lerp(560, 1500, dive);
  const lightOut = 1 - clamp(depth / 380);
  const stats = eOut(clamp((t - 2.6) / 0.9));
  const line = eOut(clamp((t - 5.8) / 0.9));

  return (
    <AbsoluteFill>
      <WaterColumn depth={depth + 2100} intensity={0.4} rays={lightOut * 0.28} seed={29} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,6,10,0.9) 0%, rgba(1,6,10,0.15) 16%, transparent 30%)'}} />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 330,
          width: 1120,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 80,
          lineHeight: 0.97,
          letterSpacing: '-0.045em',
          color: C.ink,
          opacity: eOut(clamp(t / 0.7)),
        }}
      >
        Di bawah 200 meter,
        <br />
        cahaya <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 500, color: C.iris}}>berhenti</span>.
      </div>

      

      {/* analyser */}
      <div style={{position: 'absolute', left: SAFE.left, top: 620, width: 1180}}>
        {BANDS.map((b, i) => {
          const p = eOutQuint(clamp((t + 0.05 - i * 0.5) / 0.7));
          if (p <= 0) return null;
          const amp = 0.6 + 0.4 * Math.sin(t * 2.2 + i * 2);
          return (
            <div key={b.nm} style={{marginBottom: 26, opacity: p, transform: `translateX(${(1 - p) * -34}px)`}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10}}>
                <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.muted}}>
                  <span style={{color: b.color, fontWeight: 700}}>{b.nm}</span> · {b.name}
                </div>
                <div style={{fontFamily: F.mono, fontSize: 15, letterSpacing: '0.14em', color: `${C.muted}99`}}>{b.depth}</div>
              </div>
              <svg width={1180} height={62} style={{display: 'block'}}>
                <path
                  d={Array.from({length: 118}).map((_, k) => {
                    const x = k * 10;
                    const env = Math.exp(-Math.pow((x - 590) / 320, 2));
                    const y = 31 + Math.sin(k * 0.58 + t * 3.4 + i) * 24 * env * amp;
                    return `${k === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke={b.color}
                  strokeWidth={2.4}
                  style={{filter: `drop-shadow(0 0 12px ${b.color}88)`}}
                />
                <line x1={0} y1={31} x2={1180} y2={31} stroke={C.faint} strokeWidth={1} />
              </svg>
            </div>
          );
        })}
      </div>

      {/* the division of labour */}
      <div style={{position: 'absolute', left: SAFE.left, top: 960, display: 'flex', alignItems: 'flex-start', gap: 46, opacity: stats}}>
        <div style={{width: 470}}>
          <div style={{fontFamily: F.mono, fontSize: 16, letterSpacing: '0.26em', color: C.muted}}>MATAHARI DI 1.000 M</div>
          <div style={{fontFamily: F.display, fontSize: 84, fontWeight: 700, letterSpacing: '-0.05em', color: C.ink, lineHeight: 0.9, marginTop: 6}}>0,0%</div>
        </div>
        <div style={{width: 1, height: 150, background: `${C.faint}`}} />
        <div style={{width: 470}}>
          <div style={{fontFamily: F.mono, fontSize: 16, letterSpacing: '0.26em', color: C.iris}}>DARI HEWAN YANG BERCahaya</div>
          <div style={{fontFamily: F.display, fontSize: 84, fontWeight: 700, letterSpacing: '-0.05em', color: C.iris, lineHeight: 0.9, marginTop: 6}}>76%</div>
          <div style={{fontFamily: F.mono, fontSize: 15, letterSpacing: '0.1em', color: `${C.muted}CC`, marginTop: 10, lineHeight: 1.5}}>
            hampir semua biota laut dalam bisa membuat cahayanya sendiri
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 1330,
          width: 1120,
          fontFamily: F.display,
          fontSize: 46,
          fontWeight: 500,
          letterSpacing: '-0.028em',
          lineHeight: 1.12,
          color: C.ink,
          opacity: line,
        }}
      >
        Mereka berbicara dengan cahaya.
        <br />
        <span style={{color: C.muted}}>Kita baru belajar bahasanya.</span>
      </div>
    </AbsoluteFill>
  );
};
