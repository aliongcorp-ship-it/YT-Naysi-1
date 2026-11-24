import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ContourField, WaterColumn} from '../ui/Atmosphere';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp} from '../theme';
import type {Act, Shot} from '../timeline';

/*  ACT 9 — why the map is insurance, not luxury.
    Three columns of risk resolve into one ledger: cables, faults, heat.      */

const Ledger: React.FC<{i: number; p: number; head: string; big: string; sub: string; accent: string}> = ({
  i,
  p,
  head,
  big,
  sub,
  accent,
}) => (
  <div
    style={{
      opacity: p,
      transform: `translateY(${(1 - p) * 40}px)`,
      borderTop: `2px solid ${accent}`,
      paddingTop: 20,
      width: 340,
    }}
  >
    <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: '0.26em', color: accent}}>0{i}</div>
    <div style={{fontFamily: F.mono, fontSize: 16, letterSpacing: '0.22em', color: C.muted, marginTop: 12}}>{head}</div>
    <div style={{fontFamily: F.display, fontSize: 68, fontWeight: 700, letterSpacing: '-0.045em', color: C.ink, lineHeight: 0.94, marginTop: 8}}>
      {big}
    </div>
    <div style={{fontFamily: F.mono, fontSize: 15, letterSpacing: '0.1em', color: `${C.muted}CC`, marginTop: 12, lineHeight: 1.5}}>{sub}</div>
  </div>
);

export const Stakes: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  const cable = eOutQuint(clamp((t + 0.25) / 1.8));
  const quake = eOut(clamp((t - 5.6) / 0.7));
  const heat = eOut(clamp((t - 6.4) / 1.0));
  const shake = quake > 0 && quake < 1 ? Math.sin(t * 120) * 6 * (1 - quake) : 0;

  return (
    <AbsoluteFill>
      <WaterColumn depth={3000} intensity={0.4} rays={0} seed={37} />
      <ContourField opacity={0.15} y={820} seed={19} color={C.sonar} zoom={0.92} />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left + shake,
          top: 330,
          width: 1180,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 92,
          lineHeight: 0.96,
          letterSpacing: '-0.045em',
          color: C.ink,
          opacity: eOut(clamp(t / 0.7)),
        }}
      >
        Peta ini bukan
        <br />
        kemewahan.
        <br />
        <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 500, color: C.sonar}}>Ini asuransi.</span>
      </div>

      {/* cable arc from Java to Sumatra to the world */}
      <div style={{position: 'absolute', left: SAFE.left, top: 730, width: 1180, height: 210, opacity: cable}}>
        <svg width={1180} height={210} style={{overflow: 'visible'}}>
          <path
            d="M 40 170 C 260 40 520 30 760 110 C 940 172 1080 150 1140 96"
            fill="none"
            stroke={C.sonar}
            strokeWidth={4}
            strokeDasharray="1400"
            strokeDashoffset={1400 * (1 - cable)}
            style={{filter: `drop-shadow(0 0 16px ${C.sonar}88)`}}
          />
          {[40, 300, 620, 900, 1140].map((x, i) => (
            <circle key={x} cx={x} cy={[170, 82, 56, 132, 96][i]} r={6} fill={C.foam} opacity={cable} />
          ))}
        </svg>
        <div style={{position: 'absolute', right: 0, top: 4, fontFamily: F.mono, fontSize: 16, letterSpacing: '0.22em', color: C.sonar}}>
          KABEL BAWAH LAUT · 99% LALU LINTAS INTERNET
        </div>
      </div>

      <div style={{position: 'absolute', left: SAFE.left, top: 1010, display: 'flex', gap: 30}}>
        <Ledger i={1} p={eOut(clamp((t - 2.2) / 0.8))} head="INTERNET" big="99%" sub="data antar benua lewat kabel dasar laut" accent={C.sonar} />
        <Ledger i={2} p={quake} head="GEMPA" big="1.500+" sub="gempa M5+ tiap tahun; banyak lahir di palung" accent={C.magma} />
        <Ledger i={3} p={heat} head="PANAS" big="90%" sub="kelebihan panas Bumi diserap laut" accent={C.ember} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 1440,
          width: 1120,
          fontFamily: F.display,
          fontSize: 46,
          fontWeight: 500,
          letterSpacing: '-0.028em',
          lineHeight: 1.12,
          color: C.ink,
          opacity: eOut(clamp((t - 8.4) / 0.9)),
        }}
      >
        Setiap garis di peta bawah laut
        <br />
        <span style={{color: C.muted}}>adalah nyawa yang kita abaikan.</span>
      </div>
    </AbsoluteFill>
  );
};
