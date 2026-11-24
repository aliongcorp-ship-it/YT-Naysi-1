import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {WaterColumn} from '../ui/Atmosphere';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp} from '../theme';
import type {Act, Shot} from '../timeline';

/*  ACT 5 — the residents.
    Three specimens drawn as field illustrations: line work, hatching, labelled
    parts. Bioluminescence is additive layers, never a neon blob.              */

type Spec = {name: string; latin: string; notes: string[]; accent: string; blurb: string};

const SPECS: Spec[] = [
  {
    name: 'FANGTOOTH',
    latin: 'Anoplogaster cornuta',
    notes: ['GIGI > RAHANG', 'MATA KECIL', '500 – 5.000 M'],
    accent: C.sonar,
    blurb: 'Gigi atasnya terlalu panjang, jadi mulutnya punya kantong khusus untuk menutup.',
  },
  {
    name: 'VIPERFISH',
    latin: 'Chauliodus sloani',
    notes: ['FOTOFOR MENYALA', 'GIGI 1/3 KEPALA', 'SERANG VERTIKAL'],
    accent: C.iris,
    blurb: 'Memancing dengan lampu di punggung, lalu melesat ke atas seperti tombak.',
  },
  {
    name: 'ANGLERFISH',
    latin: 'Melanocetus johnsonii',
    notes: ['UMPAN DI KEPALA', 'MULUT 3× TUBUH', 'SIMBIOSIS BAKTERI'],
    accent: C.ember,
    blurb: 'Lampu di kepalanya bukan miliknya; itu koloni bakteri yang dia pelihara.',
  },
];

const Accent: React.FC<{d: string; color: string; w?: number; op?: number; dash?: string}> = ({d, color, w = 3.4, op = 1, dash}) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} opacity={op} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
);

const Fangtooth: React.FC<{accent: string; f: number}> = ({accent, f}) => (
  <g>
    {/* body: blunt, deep, almost bulldog */}
    <Accent d="M 44 108 C 46 62 92 34 152 32 C 212 30 268 54 292 84 C 304 100 300 118 282 130 C 250 152 196 168 148 166 C 96 164 52 146 44 108 Z" color={accent} w={4} />
    <Accent d="M 44 110 C 62 118 82 120 104 116" color={accent} w={4} />
    {/* jaw line, mouth agape */}
    <Accent d="M 60 128 C 86 152 122 164 156 162" color={accent} w={3} op={0.8} />
    {/* needle teeth, interlocking */}
    {[0, 1, 2, 3].map((k) => (
      <Accent key={`u${k}`} d={`M ${74 + k * 17} 122 L ${82 + k * 17} 150`} color={C.foam} w={2.6} op={0.92} />
    ))}
    {[0, 1, 2, 3].map((k) => (
      <Accent key={`l${k}`} d={`M ${88 + k * 17} 156 L ${94 + k * 17} 126`} color={C.foam} w={2.6} op={0.92} />
    ))}
    {/* gouge: adult fangtooth keeps juvenile spikes */}
    {[0, 1, 2].map((k) => (
      <Accent key={`s${k}`} d={`M ${212 + k * 20} 46 L ${218 + k * 20} 30`} color={accent} w={2.4} op={0.7} />
    ))}
    {/* tail + fins */}
    <Accent d="M 292 88 C 320 66 342 60 356 74 C 344 88 340 102 352 116 C 336 126 314 120 292 108" color={accent} w={4} />
    <Accent d="M 186 164 C 196 186 214 192 232 178" color={accent} w={3} op={0.7} />
    <Accent d="M 150 40 C 168 22 196 24 208 38" color={accent} w={3} op={0.7} />
    {/* eye with a catchlight */}
    <circle cx={104} cy={96} r={9} fill="none" stroke={accent} strokeWidth={3} />
    <circle cx={104} cy={96} r={3.4} fill={accent} opacity={0.9} />
    {/* lateral pore line */}
    <Accent d="M 120 118 C 168 126 218 122 266 108" color={accent} w={1.6} op={0.35} dash="5 7" />
  </g>
);

const Viperfish: React.FC<{accent: string; f: number}> = ({accent, f}) => (
  <g>
    {/* body: pointed snout, deep shoulder, long taper to a forked tail */}
    <Accent d="M 26 114 C 56 100 92 88 132 85 C 190 81 250 87 292 98 C 306 102 306 113 292 117 C 244 130 190 137 138 134 C 92 131 50 126 27 119 Z" color={accent} w={4} />
    {/* tail */}
    <Accent d="M 292 98 C 322 78 350 68 366 76 C 352 92 352 112 368 126 C 348 134 320 126 292 117" color={accent} w={4} />
    {/* dorsal: the absurd first ray, then a sail membrane */}
    <Accent d="M 138 85 C 146 46 170 18 196 14" color={accent} w={3.6} />
    <Accent d="M 196 14 C 208 30 208 56 200 84" color={accent} w={2.4} op={0.75} />
    <Accent d="M 160 84 C 176 58 194 44 206 44" color={accent} w={1.8} op={0.5} />
    {/* anal fin */}
    <Accent d="M 214 135 C 226 158 246 166 262 158" color={accent} w={3} op={0.8} />
    <Accent d="M 236 158 C 244 168 256 170 264 164" color={accent} w={2} op={0.5} />
    {/* fangs rise from the lower jaw */}
    {[0, 1, 2, 3, 4].map((k) => (
      <Accent key={`v${k}`} d={`M ${48 + k * 20} 120 L ${52 + k * 20} 84`} color={C.foam} w={2.6} op={0.95} />
    ))}
    {/* photophores along the belly: additive, pulsing */}
    {Array.from({length: 9}).map((_, k) => {
      const x = 62 + k * 26;
      const y = 128 + Math.sin(k * 0.55) * 3;
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(f / 24 + k * 0.85));
      return (
        <g key={k}>
          <circle cx={x} cy={y} r={10} fill={C.foam} opacity={0.1 * pulse} />
          <circle cx={x} cy={y} r={3.4} fill={C.foam} opacity={0.22 + 0.78 * pulse} />
        </g>
      );
    })}
    <Accent d="M 110 96 C 170 100 220 102 268 104" color={accent} w={1.6} op={0.35} dash="5 7" />
    <circle cx={44} cy={104} r={7.5} fill="none" stroke={accent} strokeWidth={2.6} />
    <circle cx={44} cy={104} r={3} fill={accent} />
  </g>
);

const Anglerfish: React.FC<{accent: string; f: number}> = ({accent, f}) => (
  <g>
    <Accent d="M 74 116 C 70 62 128 26 198 34 C 258 40 300 74 300 108 C 300 146 246 172 186 170 C 122 168 78 152 74 116 Z" color={accent} w={4} />
    {/* gaping jaw */}
    <Accent d="M 76 120 C 108 146 148 160 186 168" color={accent} w={3.6} />
    {[0, 1, 2, 3].map((k) => (
      <Accent key={`a${k}`} d={`M ${92 + k * 20} 126 L ${98 + k * 20} 156`} color={C.foam} w={2.6} op={0.9} />
    ))}
    {[0, 1, 2].map((k) => (
      <Accent key={`b${k}`} d={`M ${104 + k * 20} 160 L ${110 + k * 20} 132`} color={C.foam} w={2.4} op={0.85} />
    ))}
    {/* the illicium: stalk over the head to the lure */}
    <Accent d="M 168 34 C 172 -2 214 -18 236 -6" color={accent} w={3.4} />
    <Accent d="M 236 -6 C 250 4 250 18 240 24" color={accent} w={3.4} />
    <circle cx={238} cy={16} r={13} fill={accent} opacity={0.28} />
    <circle cx={238} cy={16} r={6} fill={C.foam} opacity={0.9} />
    <circle cx={238} cy={16} r={26 + 4 * Math.sin(f / 16)} fill={C.ember} opacity={0.1} />
    {/* gill + fin detail */}
    <Accent d="M 268 118 C 288 112 302 122 300 136" color={accent} w={2.6} op={0.7} />
    <Accent d="M 150 40 C 160 30 176 30 184 40" color={accent} w={2} op={0.5} />
    <circle cx={112} cy={92} r={8} fill="none" stroke={accent} strokeWidth={2.6} />
    <circle cx={112} cy={92} r={3} fill={accent} />
  </g>
);

const Specimen: React.FC<{i: number; accent: string; f: number}> = ({i, accent, f}) => (
  <svg viewBox="0 -30 380 220" width={1120} height={648} style={{display: 'block', overflow: 'visible'}}>
    {/* survey grid behind the drawing */}
    {Array.from({length: 6}).map((_, k) => (
      <line key={`v${k}`} x1={k * 76} y1={-30} x2={k * 76} y2={190} stroke={accent} strokeWidth={0.6} opacity={0.09} />
    ))}
    {Array.from({length: 4}).map((_, k) => (
      <line key={`h${k}`} x1={0} y1={k * 55} x2={380} y2={k * 55} stroke={accent} strokeWidth={0.6} opacity={0.09} />
    ))}
    {i === 0 ? <Fangtooth accent={accent} f={f} /> : i === 1 ? <Viperfish accent={accent} f={f} /> : <Anglerfish accent={accent} f={f} />}
  </svg>
);

export const Specimens: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  // each specimen owns a beat: card in, hold, card out
  const beats = [1.5, 5.0, 8.2].map((at, i) => {
    const p = eOutQuint(clamp((t - at) / 0.85));
    const out = eOut(clamp((t - at - 3.5) / 0.5));
    return {p, vis: p * (1 - out), i};
  });

  return (
    <AbsoluteFill>
      <WaterColumn depth={6800} intensity={0.6} rays={0} seed={17} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(58% 38% at 72% 58%, ${C.sonar}12, transparent 72%)`,
          opacity: 0.7 + 0.3 * Math.sin(t * 0.9),
        }}
      />

      <div style={{position: 'absolute', left: SAFE.left, top: 300, fontFamily: F.mono, fontSize: 21, letterSpacing: '0.32em', color: C.sonar, opacity: eOut(clamp(t / 0.6))}}>
        ZONA BATIPELAGIK · 6.800 M
      </div>

      {beats.map(({p, vis, i}) => {
        if (vis <= 0.001) return null;
        const s = SPECS[i];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: SAFE.left - 8,
              top: 500,
              width: 1240,
              opacity: vis,
              transform: `translateY(${(1 - p) * 44}px)`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 6}}>
              <div style={{fontFamily: F.mono, fontSize: 19, letterSpacing: '0.3em', color: s.accent}}>SPESIMEN 0{i + 1} / 03</div>
              <div style={{flex: 1, height: 1, background: `${s.accent}44`}} />
              <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: '0.24em', color: C.muted}}>{s.notes[2]}</div>
            </div>

            <Specimen i={i} accent={s.accent} f={f} />

            <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 30, marginTop: -6}}>
              <div style={{maxWidth: 700}}>
                <div style={{fontFamily: F.display, fontSize: 76, fontWeight: 700, letterSpacing: '-0.045em', color: C.ink, lineHeight: 0.9}}>{s.name}</div>
                <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 32, color: s.accent, marginTop: 10}}>{s.latin}</div>
              </div>
              <div style={{maxWidth: 420, paddingTop: 4}}>
                {s.notes.slice(0, 2).map((n) => (
                  <div key={n} style={{display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8}}>
                    <div style={{width: 5, height: 5, borderRadius: 5, background: s.accent}} />
                    <div style={{fontFamily: F.mono, fontSize: 16, letterSpacing: '0.14em', color: C.muted}}>{n}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: `1px solid ${s.accent}33`,
                fontFamily: F.display,
                fontSize: 32,
                lineHeight: 1.28,
                letterSpacing: '-0.012em',
                color: `${C.muted}`,
                maxWidth: 1080,
              }}
            >
              {s.blurb}
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 1300,
          opacity: eOut(clamp((t - 11.4) / 0.9)),
          fontFamily: F.display,
          fontSize: 54,
          fontWeight: 700,
          letterSpacing: '-0.038em',
          color: C.ink,
          lineHeight: 1.02,
        }}
      >
        Bukan monster.
        <br />
        <span style={{color: C.sonar}}>Makhluk yang cuma kerja shift malam.</span>
      </div>
    </AbsoluteFill>
  );
};
