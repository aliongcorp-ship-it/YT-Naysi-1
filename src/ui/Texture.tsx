import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/* ────────────────────────────  film grain  ───────────────────────────────── */
// SVG fractal noise, re-seeded every frame so it behaves like emulsion rather
// than a texture stuck to the lens. `tint` warms it for the sepia identity.
export const Grain: React.FC<{opacity?: number; tint?: string}> = ({opacity = 0.06, tint = '#FFFFFF'}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity,
        pointerEvents: 'none',
        mixBlendMode: 'soft-light',
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='190' height='190'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='linear' slope='0.9'/></feComponentTransfer></filter><rect width='190' height='190' filter='url(%23n)' fill='%23" +
          tint.slice(1) +
          "' opacity='0.6'/></svg>\")",
        backgroundPosition: `${(frame * 37) % 190}px ${(frame * 61) % 190}px`,
      }}
    />
  );
};

/* ──────────────────────────  vignette  ───────────────────────────────────── */
// Pure darkening at the edges in the episode's own void colour. No colour
// fringing, so nothing on screen can read as neon.
export const Vignette: React.FC<{strength?: number; color?: string}> = ({strength = 0.8, color = '#000000'}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(118% 84% at 50% 42%, rgba(0,0,0,0) 38%, ${rgba(color, 0.34 * strength)} 76%, ${rgba(color, 0.92 * strength)} 100%)`,
    }}
  />
);

const rgba = (h: string, a: number) => {
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

/* ─────────────────────────  paper / dust field  ──────────────────────────── */
// Coarse grain that holds still: the page the picture is printed on.
export const Dust: React.FC<{n?: number; seed?: number; opacity?: number; color?: string}> = ({
  n = 900,
  seed = 3,
  opacity = 0.5,
  color = '#F2E7D5',
}) => {
  const dots = React.useMemo(() => {
    const rnd = (i: number, k: number) => {
      const v = Math.sin(i * 91.7 + k * 233.1 + seed * 61.3) * 43758.5453;
      return v - Math.floor(v);
    };
    return Array.from({length: n}, (_, i) => ({
      x: rnd(i, 1) * 1440,
      y: rnd(i, 2) * 2560,
      s: 1 + rnd(i, 3) * 2.2,
      a: 0.06 + rnd(i, 4) * 0.34,
    }));
  }, [n, seed]);
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      {dots.map((d, i) => (
        <div key={i} style={{position: 'absolute', left: d.x, top: d.y, width: d.s, height: d.s, borderRadius: '50%', background: color, opacity: d.a}} />
      ))}
    </AbsoluteFill>
  );
};
