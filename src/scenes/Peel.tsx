import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ContourField, WaterColumn, fbm} from '../ui/Atmosphere';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp} from '../theme';
import type {Act, Shot} from '../timeline';

/*  ACT 4 — the mechanism nobody expected.
    Two crustal slabs; the lower one does not dive, it peels. A century of
    wrong diagrams replaced by the 2018 observation, drawn as a side section.   */

const Section: React.FC<{t: number; peel: number}> = ({t, peel}) => {
  const X = 150;
  const Y = 900;
  const W = 1140;
  const H = 560;
  const path = (() => {
    const pts: string[] = [];
    for (let x = 0; x <= W; x += 12) {
      const n = fbm(x / 190, 3.1, 21, 4);
      const y = H * 0.42 + n * 70;
      pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return pts.join(' ');
  })();

  return (
    <div style={{position: 'absolute', left: X, top: Y, width: W, height: H}}>
      {/* water */}
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${C.deep}AA, ${C.void}EE)`, border: `1px solid ${C.faint}`, borderRadius: 6, overflow: 'hidden'}}>
        {Array.from({length: 14}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: (i + 1) * (H / 15), height: 1, background: `${C.sonar}12`}} />
        ))}

        {/* the descending slab (old explanation) fading out */}
        <div
          style={{
            position: 'absolute',
            left: W * 0.66,
            top: H * 0.2,
            width: 46,
            height: H * 0.9,
            background: `linear-gradient(180deg, ${C.muted}44, transparent)`,
            transform: `rotate(${34 + Math.sin(t) * 1.2}deg)`,
            transformOrigin: 'top center',
            opacity: (1 - peel) * 0.75,
            borderRadius: 8,
          }}
        />

        {/* crust body */}
        <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
            <defs>
              <linearGradient id="crust" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#123745" />
                <stop offset="100%" stopColor="#040D13" />
              </linearGradient>
              <linearGradient id="mantle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4A2A5E" />
                <stop offset="100%" stopColor="#0B0E1F" />
              </linearGradient>
            </defs>
            <path d={`${path} L ${W} ${H} L 0 ${H} Z`} fill="url(#crust)" stroke={C.sonarDim} strokeWidth={2} opacity={0.95} />
            {/* mantle wedge, exposed as the slab peels away */}
            <path
              d={`M ${W * 0.5} ${H * 0.34} L ${W * 0.96} ${H * 0.3} L ${W} ${H * 0.72} L ${W * 0.55} ${H * 0.7} Z`}
              fill="url(#mantle)"
              opacity={0.55 + 0.45 * peel}
              stroke={C.iris}
              strokeWidth={1.5}
            />
            {/* peeled slab: rotating, detaching, sinking */}
            <g transform={`translate(${lerp(W * 0.52, W * 0.62, peel)} ${lerp(H * 0.36, H * 1.02, peel)}) rotate(${lerp(0, 46, peel)})`} opacity={peel > 0.02 ? 1 : 0}>
              <rect x={-W * 0.16} y={-16} width={W * 0.32} height={30} rx={4} fill="#2B4A5C" stroke={C.sonar} strokeWidth={2.5} />
              <rect x={-W * 0.16} y={-16} width={W * 0.32} height={9} rx={4} fill={C.sonar} opacity={0.35} />
            </g>
          </svg>
        </div>

        {/* measurement tape across the slab */}
        <div
          style={{
            position: 'absolute',
            left: W * 0.2,
            top: H * 0.36,
            width: W * 0.3 * clamp(peel * 1.6),
            height: 2,
            background: C.sonar,
            boxShadow: `0 0 20px ${C.sonar}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: W * 0.2,
            top: H * 0.36 - 34,
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: '0.16em',
            color: C.sonar,
            opacity: clamp(peel * 2),
          }}
        >
          150 KM
        </div>
      </div>
    </div>
  );
};

export const Peel: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  const q = eOutQuint(clamp((t - 9.0) / 4.4));
  const oldFade = 1 - eOut(clamp((t - 8.0) / 1.2));
  const year = eOut(clamp((t - 7.6) / 1.0));

  return (
    <AbsoluteFill>
      <WaterColumn depth={7440} intensity={0.45} rays={0} seed={11} tint={C.iris} />
      <ContourField opacity={0.24} y={620} seed={13} color={C.iris} zoom={1.2} />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 330,
          width: 1150,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 92,
          lineHeight: 0.96,
          letterSpacing: '-0.045em',
          color: C.ink,
          opacity: eOut(clamp(t / 0.7)),
        }}
      >
        Bukan menunjam.
        <br />
        <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 500, color: C.iris}}>Terkelupas.</span>
      </div>

      <Section t={t} peel={q} />

      {/* century of wrong diagrams, struck through */}
      <div
        style={{
          position: 'absolute',
          left: X0(),
          top: 820,
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: '0.26em',
          color: C.muted,
          opacity: oldFade * 0.9,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span>HIPOTESIS 1929 — LEMPENG MENUNJAM</span>
        <span style={{width: 300, height: 1, background: `${C.magma}AA`, position: 'absolute', left: 6, top: 12}} />
      </div>

      {/* 2018 reveal */}
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 1520,
          opacity: year,
          transform: `translateY(${(1 - year) * 24}px)`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <div style={{fontFamily: F.display, fontSize: 132, fontWeight: 700, letterSpacing: '-0.06em', color: C.sonar, lineHeight: 0.85}}>
            2018
          </div>
          <div style={{borderLeft: `2px solid ${C.faint}`, paddingLeft: 22}}>
            <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.26em', color: C.muted}}>SURVEI GEBCO / MONTEREY BAY</div>
            <div style={{fontFamily: F.display, fontSize: 34, color: C.ink, letterSpacing: '-0.02em', marginTop: 6}}>
              Batuan mantel terangkat di dinding palung
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const X0 = () => SAFE.left;
