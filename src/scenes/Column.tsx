import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {WaterColumn} from '../ui/Atmosphere';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp} from '../theme';
import type {Act, Shot} from '../timeline';

/*  SHOT — pressure as a physical stack.
    Forty 10-metre blocks = 400 atmospheres, a live gauge, and the zone ladder
    every oceanographer actually uses. Nothing decorative: it all reads.       */

const ZONES: [string, number, number, string][] = [
  ['EPIPELAGIK', 0, 200, 'cahaya matahari'],
  ['MESOPELAGIK', 200, 1000, 'senja'],
  ['BATIPELAGIK', 1000, 4000, 'gelap total'],
  ['ABISAL', 4000, 6000, 'dingin, 2–4°C'],
  ['HADAL', 6000, 11000, 'palung'],
];

export const Column: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  const sink = eOutQuint(clamp((t + 0.15) / 7.4));
  const depth = lerp(0, 7100, sink);
  const bars = 36;
  const hit = eOut(clamp((t + 0.05) / 0.5));
  const human = eOut(clamp((t - 4.6) / 0.9));

  return (
    <AbsoluteFill>
      <WaterColumn depth={depth} intensity={0.44} rays={0} seed={23} tint={C.ember} />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 320,
          width: 1080,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 84,
          lineHeight: 0.96,
          letterSpacing: '-0.045em',
          color: C.ink,
          opacity: eOut(clamp(t / 0.7)),
        }}
      >
        Setiap 10 meter,
        <br />
        satu atmosfer lagi.
      </div>

      {/* stack of blocks */}
      <div style={{position: 'absolute', left: SAFE.left, top: 620, width: 420}}>
        {Array.from({length: bars}).map((_, i) => {
          const p = clamp((sink * bars - i) / 3.2);
          if (p <= 0) return null;
          const heavy = i > bars * 0.55;
          const newest = sink * bars - i < 2.2;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                top: i * 23,
                width: 340 * eOut(p),
                height: 19,
                background: newest
                  ? `linear-gradient(90deg, ${C.magma}, ${C.ember})`
                  : heavy
                    ? `linear-gradient(90deg, ${C.magma}55, ${C.magma}0A)`
                    : `linear-gradient(90deg, ${C.sonar}44, ${C.sonar}08)`,
                borderLeft: `3px solid ${newest ? C.foam : heavy ? C.magma : C.sonarDim}`,
                opacity: 0.5 + 0.5 * p,
                boxShadow: newest ? `0 0 22px ${C.magma}88` : 'none',
              }}
            />
          );
        })}
        <div style={{position: 'absolute', left: 356, top: 0, bottom: -10, width: 1, background: `${C.faint}`}} />
      </div>

      {/* gauge */}
      <div style={{position: 'absolute', right: 130, top: 600, width: 400, opacity: hit}}>
        <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: '0.3em', color: C.muted, textAlign: 'right'}}>TEKANAN</div>
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 700,
            fontSize: 132,
            letterSpacing: '-0.055em',
            color: C.ember,
            textAlign: 'right',
            lineHeight: 0.88,
            fontVariantNumeric: 'tabular-nums',
            textShadow: `0 0 60px ${C.magma}55`,
          }}
        >
          {Math.round(depth / 10).toLocaleString('id-ID')}
        </div>
        <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.2em', color: C.muted, textAlign: 'right', marginTop: 6}}>
          ATM · {Math.round(depth).toLocaleString('id-ID')} M
        </div>
        <div style={{marginTop: 18, height: 5, background: `${C.foam}18`, borderRadius: 6, overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${clamp(depth / 7100) * 100}%`, background: `linear-gradient(90deg, ${C.sonar}, ${C.magma})`}} />
        </div>
      </div>

      {/* zone ladder fills the lower right, and is true */}
      <div style={{position: 'absolute', left: 620, top: 980, width: 700}}>
        {ZONES.map(([name, a, b, note], i) => {
          const active = depth >= a && depth < b;
          const p = eOut(clamp((t - 1.6 - i * 0.35) / 0.7));
          return (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 16,
                opacity: p * (active ? 1 : 0.62),
                transform: `translateX(${(1 - p) * 20}px)`,
              }}
            >
              <div style={{width: 46, height: active ? 3 : 1.5, background: active ? C.ember : C.faint, flex: '0 0 auto', boxShadow: active ? `0 0 16px ${C.ember}` : 'none'}} />
              <div style={{fontFamily: F.mono, fontSize: 15, letterSpacing: '0.24em', color: active ? C.ember : C.muted, width: 220}}>{name}</div>
              <div style={{fontFamily: F.mono, fontSize: 15, color: active ? C.foam : `${C.muted}99`, width: 160, fontVariantNumeric: 'tabular-nums'}}>
                {a.toLocaleString('id-ID')}–{b.toLocaleString('id-ID')}
              </div>
              <div style={{fontFamily: F.mono, fontSize: 13, letterSpacing: '0.1em', color: active ? `${C.foam}AA` : `${C.muted}77`}}>{note}</div>
            </div>
          );
        })}
      </div>

      <div style={{position: 'absolute', left: SAFE.left, top: 1420, opacity: human, transform: `translateY(${(1 - human) * 20}px)`}}>
        <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: '0.26em', color: C.muted}}>MANUSIA TANPA PERLINDUNGAN</div>
        <div style={{fontFamily: F.display, fontSize: 50, fontWeight: 700, letterSpacing: '-0.035em', color: C.magma, marginTop: 8, lineHeight: 1}}>
          paru-paru kolaps di bawah 200 m
        </div>
      </div>
    </AbsoluteFill>
  );
};
