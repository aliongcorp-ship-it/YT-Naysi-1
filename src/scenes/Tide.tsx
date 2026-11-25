import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, H, W, alpha, clamp, eOut, lerp} from '../theme';
import {SpaceBackdrop, StarField, CoordGrid} from '../ui/Atmosphere';
import {Readout} from '../ui/Hud';
import type {Act, Shot} from '../timeline';

/* 05 — PASANG.
   The mechanism, drawn from above: Earth spinning, two tidal bulges dragged
   ahead of the Moon, and the offset that pushes it outward. The key frame is
   the moment the bulge leads — that is the actual physics. */
export const Tide: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const local = t - shot.start;

  const cx = W / 2;
  const cy = 900;
  const R = 330;

  const spin = local * 26; // degrees
  const lead = clamp((local - 1.6) / 1.6); // bulges pulling ahead
  const push = clamp((local - 3.4) / 2.4);

  const moonA = -24 + local * 2.2;
  const mr = 780;
  const moonX = cx + Math.cos((moonA * Math.PI) / 180) * mr;
  const moonY = cy + Math.sin((moonA * Math.PI) / 180) * mr * 0.44;

  return (
    <AbsoluteFill style={{background: C.void}}>
      <SpaceBackdrop from={C.abyss} to={C.void} />
      <StarField opacity={0.45} drift={0.25} seed={44} />
      <CoordGrid opacity={0.06} step={150} />

      {/* orbit line out to the moon */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <ellipse cx={cx} cy={cy} rx={mr} ry={mr * 0.44} fill="none" stroke={alpha(C.shallow, 0.45)} strokeWidth={1.5} strokeDasharray="4 14" />
      </svg>

      {/* the moon, and the line of pull */}
      <div
        style={{
          position: 'absolute',
          left: moonX - 30,
          top: moonY - 30,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 36% 32%, #D7D0BE, #8C8577 62%, #4A473D)',
        }}
      />

      {/* The mechanism has to be visible, so the ocean envelope is drawn as a
          single rotated ellipse: its long axis points at the Moon and its two
          lobes stick out past the globe — those lobes are the bulges. */}
      <div
        style={{
          position: 'absolute',
          left: cx - R * 2.2,
          top: cy - R * 2.2,
          width: R * 4.4,
          height: R * 4.4,
          transform: `rotate(${lead * 30 - 8}deg)`,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: R * 2 * 1.46,
            height: R * 2 * 1.02,
            marginLeft: -R * 1.46,
            marginTop: -R * 1.02,
            borderRadius: '50%',
            border: `1.5px solid ${alpha(C.shallow, 0.85)}`,
            background: `radial-gradient(closest-side, ${alpha(C.shallow, 0.02)} 52%, ${alpha(C.shallow, 0.30)} 74%, ${alpha(C.shallow, 0.10)} 100%)`,
          }}
        />
        {/* the two lobes get their own fill so they read as water, not a halo */}
        {[0, 1].map((k) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: R * 0.92,
              height: R * 1.62,
              marginLeft: -R * 0.46 + (k ? R * 1.02 : -R * 1.02) - R * 0.02,
              marginTop: -R * 0.81,
              borderRadius: '50%',
              background: `radial-gradient(closest-side, ${alpha(C.shallow, 0.42)}, ${alpha(C.shallow, 0.03)} 88%)`,
            }}
          />
        ))}
      </div>

      {/* the planet, drawn over the envelope's middle so only the lobes show */}
      <div
        style={{
          position: 'absolute',
          left: cx - R,
          top: cy - R,
          width: R * 2,
          height: R * 2,
          borderRadius: '50%',
          overflow: 'hidden',
          background: `radial-gradient(circle at 34% 28%, #33566F 0%, #1D3B52 32%, #0E2233 62%, #050D18 100%)`,
          boxShadow: `0 0 0 1px ${alpha(C.shallow, 0.55)}`,
        }}
      >
        {[
          {x: 22, y: 36, w: 0.40, h: 0.30, r: -12},
          {x: 46, y: 56, w: 0.44, h: 0.30, r: 10},
          {x: 30, y: 20, w: 0.26, h: 0.14, r: 24},
        ].map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: R * c.w * 2,
              height: R * c.h * 2,
              borderRadius: '46% 54% 38% 62% / 52% 40% 60% 48%',
              background: alpha('#6F7F5E', 0.32),
              transform: `rotate(${c.r}deg)`,
            }}
          />
        ))}
        {/* the spin: meridians that actually turn */}
        {[-38, 0, 38].map((deg, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              width: 1,
              height: '100%',
              background: alpha(C.ink, 0.09),
              transform: `rotate(${deg + spin}deg)`,
              transformOrigin: '50% 50%',
            }}
          />
        ))}
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(118deg, transparent 24%, ${alpha('#04060D', 0.55)} 56%, ${alpha('#04060D', 0.94)} 84%)`}} />
      </div>

      {/* the offset arrow: bulge ahead of the moon pulls the moon forward */}
      {lead > 0.6 ? (
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: clamp((lead - 0.6) / 0.4)}}>
          <defs>
            <marker id="arw" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
              <path d="M0,0 L9,4.5 L0,9 z" fill={C.coral} />
            </marker>
          </defs>
          <line x1={moonX - 60} y1={moonY + 74} x2={moonX - 60 + 210 * eOut(push)} y2={moonY + 74} stroke={C.coral} strokeWidth={3} markerEnd="url(#arw)" />
        </svg>
      ) : null}

      <Readout value="+3,8" unit="cm / tahun" note="dorongan pasang, terus-menerus" at={shot.start + 4.2} t={t} y={1520} color={C.coral} size={140} />
    </AbsoluteFill>
  );
};
