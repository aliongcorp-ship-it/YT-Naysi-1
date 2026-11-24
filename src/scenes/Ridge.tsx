import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {WaterColumn, fbm} from '../ui/Atmosphere';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp} from '../theme';
import type {Act, Shot} from '../timeline';

/*  ACT 8 — the longest mountain range on Earth.
    A cross-section ridge that grows as the counter climbs to 78.000 km, with
    hydrothermal plumes venting magma into freezing water.                     */

const RidgeProfile: React.FC<{p: number; t: number}> = ({p, t}) => {
  const Wv = 1240;
  const Hv = 420;
  const path = useMemo(() => {
    const pts: string[] = [];
    for (let x = 0; x <= Wv; x += 10) {
      const n = fbm(x / 130, 1.7, 41, 4);
      const spike = Math.pow(Math.abs(Math.sin(x / 96)), 6) * 30;
      const y = Hv * 0.5 - n * 88 - spike;
      pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return pts.join(' ');
  }, []);
  const vents = [180, 470, 760, 1040];
  return (
    <div style={{position: 'absolute', left: SAFE.left - 20, top: 700, width: Wv, height: Hv}}>
      <svg viewBox={`0 0 ${Wv} ${Hv}`} width={Wv} height={Hv} style={{overflow: 'visible'}}>
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#12303C" />
            <stop offset="100%" stopColor="#020A0F" />
          </linearGradient>
          <clipPath id="ridgeClip">
            <rect x={0} y={0} width={Wv * p} height={Hv} />
          </clipPath>
        </defs>
        <g clipPath="url(#ridgeClip)">
          <path d={`${path} L ${Wv} ${Hv} L 0 ${Hv} Z`} fill="url(#rg)" stroke={C.sonarDim} strokeWidth={2} />
          {/* magma seam along the rift */}
          <path d={`${path}`} fill="none" stroke={C.magma} strokeWidth={3} opacity={0.5} strokeDasharray="22 16" strokeDashoffset={-t * 26} />
        </g>
        {vents.map((vx, i) => {
          const vp = clamp((p * 1.15 - i * 0.18) / 0.3);
          if (vp <= 0) return null;
          const baseY = Hv * 0.5 - fbm(vx / 130, 1.7, 41, 4) * 88 - Math.pow(Math.abs(Math.sin(vx / 96)), 6) * 30;
          return (
            <g key={vx} opacity={vp}>
              {/* plume */}
              <path
                d={`M ${vx} ${baseY} C ${vx - 16} ${baseY - 60} ${vx + 22} ${baseY - 110} ${vx - 4} ${baseY - 120}`}
                stroke={C.magma}
                strokeWidth={4}
                fill="none"
                opacity={0.5}
                strokeLinecap="round"
              />
              <path
                d={`M ${vx} ${baseY} C ${vx + 18} ${baseY - 70} ${vx - 20} ${baseY - 120} ${vx + 6} ${baseY - 138}`}
                stroke={C.ember}
                strokeWidth={3}
                fill="none"
                opacity={0.35}
                strokeLinecap="round"
              />
              <circle cx={vx} cy={baseY} r={7 + 2 * Math.sin(t * 3 + i)} fill={C.ember} />
              <circle cx={vx} cy={baseY} r={20} fill={C.magma} opacity={0.18} />
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, bottom: -54, fontFamily: F.mono, fontSize: 17, letterSpacing: '0.24em', color: C.muted}}>
        POTONGAN MELINTANG · PUNGGUNGAN TENGAH SAMUDRA
      </div>
    </div>
  );
};

export const Ridge: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  const grow = eOutQuint(clamp((t - 1.2) / 7.2));
  const km = 78000 * grow;

  return (
    <AbsoluteFill>
      <WaterColumn depth={2400} intensity={0.32} rays={0} seed={31} tint={C.magma} />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 330,
          width: 1180,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 84,
          lineHeight: 0.98,
          letterSpacing: '-0.045em',
          color: C.ink,
          opacity: eOut(clamp(t / 0.7)),
        }}
      >
        Pegunungan terpanjang
        <br />
        di Bumi <span style={{color: C.muted}}>tidak ada di darat.</span>
      </div>

      <div style={{position: 'absolute', left: SAFE.left, top: 660, display: 'flex', alignItems: 'baseline', gap: 18}}>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 136,
            fontWeight: 700,
            letterSpacing: '-0.06em',
            color: C.ember,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 0.85,
            textShadow: `0 0 70px ${C.magma}55`,
          }}
        >
          {Math.round(km).toLocaleString('id-ID')}
        </div>
        <div style={{fontFamily: F.mono, fontSize: 28, letterSpacing: '0.2em', color: C.muted}}>KM</div>
      </div>

      <RidgeProfile p={grow} t={t} />

      <div style={{position: 'absolute', left: SAFE.left, top: 1270, display: 'flex', gap: 54, opacity: eOut(clamp((t - 6.4) / 0.8))}}>
        {[
          ['HIMALAYA', '2.400 KM'],
          ['ANDES', '7.000 KM'],
          ['PUNGGUNGAN LAUT', '78.000 KM'],
        ].map(([k, v], i) => (
          <div key={k} style={{borderTop: `2px solid ${i === 2 ? C.magma : C.faint}`, paddingTop: 14, minWidth: 260}}>
            <div style={{fontFamily: F.mono, fontSize: 15, letterSpacing: '0.24em', color: C.muted}}>{k}</div>
            <div style={{fontFamily: F.display, fontSize: 34, fontWeight: 600, color: i === 2 ? C.ember : C.ink, letterSpacing: '-0.02em', marginTop: 4}}>
              {v}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 1430,
          fontFamily: F.display,
          fontSize: 44,
          fontWeight: 500,
          letterSpacing: '-0.025em',
          color: C.ink,
          opacity: eOut(clamp((t - 9.2) / 0.9)),
        }}
      >
        Di sana, kehidupan tidak butuh matahari. <span style={{color: C.ember}}>Ia butuh batu.</span>
      </div>
    </AbsoluteFill>
  );
};
