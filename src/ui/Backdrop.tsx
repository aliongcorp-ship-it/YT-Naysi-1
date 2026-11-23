import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, staticFile} from 'remotion';
import {C, W, H} from '../theme';

export const Backdrop: React.FC<{warm?: number; cool?: number}> = ({warm = 1, cool = 1}) => {
  const f = useCurrentFrame();
  const drift = (s: number, amp: number) => Math.sin(f / (90 * s)) * amp;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px 900px at ${28 + drift(9, 2)}% ${18 + drift(11, 2)}%, rgba(255,192,74,${0.13 * warm}), rgba(255,192,74,0) 62%),
            radial-gradient(1200px 1000px at ${78 + drift(13, 2)}% ${74 + drift(7, 2)}%, rgba(255,81,72,${0.11 * cool}), rgba(255,81,72,0) 60%),
            radial-gradient(1400px 1200px at 50% 50%, rgba(32,48,74,0.35), rgba(6,7,10,0) 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(to right, rgba(244,241,234,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,241,234,0.045) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(1200px 1500px at 50% 42%, black 10%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(1200px 1500px at 50% 42%, black 10%, transparent 78%)',
          opacity: 0.9,
        }}
      />
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(6,7,10,0.85) 0%, rgba(6,7,10,0) 26%, rgba(6,7,10,0) 62%, rgba(6,7,10,0.92) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

export const Scan: React.FC<{speed?: number}> = ({speed = 1}) => {
  const f = useCurrentFrame();
  const y = interpolate((f * speed) % (90 * 7), [0, 90 * 7], [-400, H + 400]);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: y,
          height: 300,
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(160,200,255,0.045) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.085}) => {
  const f = useCurrentFrame();
  const x = (f * 37) % 512;
  const y = (f * 71) % 512;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('grain.png')})`,
        backgroundSize: '512px 512px',
        backgroundPosition: `${x}px ${y}px`,
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(120% 85% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.42) 78%, rgba(0,0,0,0.78) 100%)',
      pointerEvents: 'none',
    }}
  />
);
