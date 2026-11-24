import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ContourField, WaterColumn} from '../ui/Atmosphere';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp} from '../theme';
import type {Act, Shot} from '../timeline';

/*  ACT 1 — the thesis, shown as a machine.
    A scanned globed ocean on one side, a razor-sharp Mars on the other,
    separated by a hairline that keeps sliding away. No stock footage.          */

const MarsDisc: React.FC<{r: number; p: number; f: number}> = ({r, p, f}) => {
  const craters = [
    [-0.42, 0.22, 0.13],
    [0.3, -0.34, 0.09],
    [0.08, 0.44, 0.16],
    [-0.18, -0.12, 0.07],
    [0.52, 0.16, 0.06],
    [-0.05, 0.02, 0.2],
  ];
  return (
    <div style={{position: 'relative', width: r * 2, height: r * 2}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle at 32% 28%, #E2906A 0%, #B25A3C 38%, #6B2E22 72%, #2A100C 100%)`,
          boxShadow: `0 0 ${r * 0.5}px rgba(226,144,106,0.28), inset -${r * 0.18}px -${r * 0.1}px ${r * 0.4}px rgba(0,0,0,0.75)`,
          opacity: p,
        }}
      />
      {craters.map(([cx, cy, cr], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: r + cx * r - cr * r,
            top: r + cy * r - cr * r,
            width: cr * r * 2,
            height: cr * r * 2,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 36%, rgba(0,0,0,0.42), rgba(255,190,160,0.18) 78%, transparent 100%)',
            opacity: p * 0.9,
          }}
        />
      ))}
      {/* polar cap */}
      <div
        style={{
          position: 'absolute',
          left: r * 0.28,
          top: -r * 0.02,
          width: r * 1.44,
          height: r * 0.34,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,245,238,0.85), rgba(255,245,238,0) 72%)',
          opacity: p * 0.8,
          filter: 'blur(3px)',
        }}
      />
      {/* survey scanline sweeping down the sphere */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: r * 2 * ((f / 90 / 3.2) % 1),
          height: 3,
          background: `linear-gradient(90deg, transparent, ${C.ember}, transparent)`,
          opacity: p * 0.85,
          boxShadow: `0 0 22px ${C.ember}`,
        }}
      />
    </div>
  );
};

const OceanDisc: React.FC<{r: number; p: number; f: number}> = ({r, p, f}) => (
  <div style={{position: 'relative', width: r * 2, height: r * 2}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: `radial-gradient(circle at 34% 26%, #12586C 0%, #08303F 42%, #041822 74%, #01080D 100%)`,
        boxShadow: `0 0 ${r * 0.55}px rgba(95,243,224,0.22), inset -${r * 0.2}px -${r * 0.12}px ${r * 0.42}px rgba(0,0,0,0.85)`,
        opacity: p,
        overflow: 'hidden',
      }}
    >
      {/* only the top 27% is "surveyed": a lit cap, the rest stays dark */}
      <div style={{position: 'absolute', inset: 0, opacity: 0.95}}>
        {Array.from({length: 9}).map((_, i) => {
          const yy = 6 + i * 7.5;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${yy}%`,
                height: 1.5,
                background:
                  i < 3
                    ? `linear-gradient(90deg, transparent, ${C.sonar}cc, transparent)`
                    : `linear-gradient(90deg, transparent, ${C.sonar}22, transparent)`,
                opacity: i < 3 ? 0.9 : 0.5,
                transform: `rotate(${(i - 4) * 0.6}deg)`,
              }}
            />
          );
        })}
      </div>
    </div>
    {/* the sonar ping that starts the whole film */}
    {[0, 1, 2].map((k) => {
      const q = ((f / 90 + k * 0.55) % 1.65) / 1.65;
      return (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: r - r * q,
            top: r - r * q,
            width: r * 2 * q,
            height: r * 2 * q,
            borderRadius: '50%',
            border: `2px solid ${C.sonar}`,
            opacity: (1 - q) * 0.55 * p,
          }}
        />
      );
    })}
  </div>
);

export const Maps: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  const reveal = eOutQuint(clamp((t - 0.15) / 1.5));
  const marsIn = eOut(clamp((t - 3.4) / 0.9));
  const hair = clamp((t - 5.6) / 0.7);
  const drift = clamp((t - 7.4) / 4.2);

  const r = 210;
  const lx = lerp(390, 300, drift);
  const rx = lerp(1040, 1140, drift);

  return (
    <AbsoluteFill>
      <WaterColumn depth={0} intensity={1} rays={1} seed={2} />
      <ContourField opacity={0.34} y={980} seed={3} zoom={1.2} tilt={9} />

      {/* headline, top of frame */}
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 330,
          width: 1180,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 96,
          lineHeight: 0.96,
          letterSpacing: '-0.042em',
          color: C.ink,
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 40}px)`,
        }}
      >
        Kita punya peta
        <br />
        untuk{' '}
        <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 500, color: C.ember, letterSpacing: '-0.02em'}}>
          Mars
        </span>
        ,
        <br />
        bukan untuk{' '}
        <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 500, color: C.sonar, letterSpacing: '-0.02em'}}>
          rumah
        </span>
        .
      </div>

      {/* two discs, one hairline between them */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 830, height: 460}}>
        <div style={{position: 'absolute', left: lx - r, top: 20}}>
          <OceanDisc r={r} p={eOut(clamp(t / 1.1))} f={f} />
          <div
            style={{
              position: 'absolute',
              left: -r * 0.2,
              right: -r * 0.2,
              top: r * 2 + 34,
              textAlign: 'center',
              fontFamily: F.mono,
              fontSize: 22,
              letterSpacing: '0.3em',
              color: C.sonar,
              opacity: reveal,
            }}
          >
            LAUT KITA
          </div>
          <div
            style={{
              position: 'absolute',
              left: -r * 0.2,
              right: -r * 0.2,
              top: r * 2 + 74,
              textAlign: 'center',
              fontFamily: F.mono,
              fontSize: 30,
              fontWeight: 600,
              color: C.foam,
              opacity: reveal,
              letterSpacing: '-0.01em',
            }}
          >
            27,3%
          </div>
        </div>

        <div style={{position: 'absolute', left: rx - r, top: 20, opacity: marsIn, transform: `scale(${lerp(0.9, 1, marsIn)})`}}>
          <MarsDisc r={r} p={marsIn} f={f} />
          <div
            style={{
              position: 'absolute',
              left: -r * 0.2,
              right: -r * 0.2,
              top: r * 2 + 34,
              textAlign: 'center',
              fontFamily: F.mono,
              fontSize: 22,
              letterSpacing: '0.3em',
              color: C.ember,
              opacity: marsIn,
            }}
          >
            MARS
          </div>
          <div
            style={{
              position: 'absolute',
              left: -r * 0.2,
              right: -r * 0.2,
              top: r * 2 + 74,
              textAlign: 'center',
              fontFamily: F.mono,
              fontSize: 30,
              fontWeight: 600,
              color: C.foam,
              opacity: marsIn,
            }}
          >
            100%
          </div>
        </div>

        {/* the dividing scan line */}
        <div
          style={{
            position: 'absolute',
            left: lerp(lx + r + 40, rx - r - 40, hair),
            top: -30,
            bottom: -40,
            width: 1.5,
            background: `linear-gradient(180deg, transparent, ${C.sonar}88, transparent)`,
            opacity: hair,
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 1630,
          fontFamily: F.mono,
          fontSize: 21,
          letterSpacing: '0.28em',
          color: C.muted,
          opacity: clamp((t - 7.2) / 0.6) * 0.95,
          display: 'flex',
          gap: 22,
          alignItems: 'center',
        }}
      >
        <span style={{color: C.sonarDim}}>GEBCO · SEABED 2030</span>
        <span style={{width: 34, height: 1, background: `${C.muted}55`}} />
        <span>RESOLUSI 100 M VS 800 M</span>
      </div>
    </AbsoluteFill>
  );
};
