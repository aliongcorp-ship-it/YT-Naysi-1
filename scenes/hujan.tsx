import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  CHAPTER_ART,
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  easeOutExpo,
  easeOutQuart,
  prog,
  smoothstep,
} from './script';

// ============================================================================
// 1. DETERMINISTIC VALUE NOISE / RNG (NO RANDOMNESS BETWEEN TAKES)
// ============================================================================

const hash2 = (x: number, y: number, seed: number): number => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 362437);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

const noise2 = (x: number, y: number, seed: number): number => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
};

const fbm = (x: number, y: number, seed: number, octaves = 4): number => {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += noise2(x * freq, y * freq, seed + i * 31) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
};

const makeRng = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ============================================================================
// 2. PROCEDURAL PRINT / MATERIAL TEXTURES (CANVAS, CACHED ONCE PER TAB)
// ============================================================================

export type TexKind =
  | 'slate-moss'
  | 'laterite'
  | 'clay-crack'
  | 'humus-fibre'
  | 'agar'
  | 'rice-paper'
  | 'sand-ripple'
  | 'rain-glass'
  | 'press-grain'
  | 'walnut'
  | 'brass-plate'
  | 'soot';

const texCache = new Map<string, string>();

const paintTexture = (kind: TexKind): string => {
  const S = 620;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const img = ctx.createImageData(S, S);
  const put = (i: number, r: number, g: number, b: number, a = 255) => {
    img.data[i] = r;
    img.data[i + 1] = g;
    img.data[i + 2] = b;
    img.data[i + 3] = a;
  };

  if (kind === 'slate-moss' || kind === 'soot') {
    const isSoot = kind === 'soot';
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        const base = fbm(x * 0.012, y * 0.012, 7, 4);
        const fine = fbm(x * 0.09, y * 0.09, 19, 3);
        const streak = fbm(x * 0.006, y * 0.05, 41, 2);
        const v = clamp01(base * 0.52 + fine * 0.24 + streak * 0.24);
        if (isSoot) {
          put(i, 10 + v * 16, 10 + v * 15, 9 + v * 13);
        } else {
          put(i, 9 + v * 20, 15 + v * 30, 14 + v * 24);
        }
      }
    }
  } else if (kind === 'laterite' || kind === 'clay-crack') {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        const loam = fbm(x * 0.014, y * 0.014, 3, 4);
        const grit = fbm(x * 0.11, y * 0.11, 23, 3);
        const cell = Math.abs(fbm(x * 0.02, y * 0.02, 61, 2) - 0.5);
        const crack = clamp01(1 - cell * 26);
        const v = clamp01(0.3 + loam * 0.36 + grit * 0.2 - crack * 0.34);
        put(
          i,
          Math.round(56 + v * 96 + grit * 12),
          Math.round(32 + v * 58 + grit * 6),
          Math.round(23 + v * 40),
        );
      }
    }
  } else if (kind === 'humus-fibre' || kind === 'walnut') {
    const wood = kind === 'walnut';
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        if (wood) {
          const ring = Math.sin((y * 0.05 + fbm(x * 0.01, y * 0.01, 9, 3) * 6) * 2.2) * 0.5 + 0.5;
          const grain = fbm(x * 0.5, y * 0.03, 33, 3);
          const v = clamp01(ring * 0.55 + grain * 0.45);
          put(i, Math.round(26 + v * 30), Math.round(18 + v * 19), Math.round(13 + v * 12));
        } else {
          const fib = fbm(x * 0.4, y * 0.02, 77, 3);
          const patch = fbm(x * 0.01, y * 0.01, 15, 4);
          const v = clamp01(fib * 0.5 + patch * 0.5);
          put(i, Math.round(20 + v * 34), Math.round(15 + v * 24), Math.round(10 + v * 15));
        }
      }
    }
  } else if (kind === 'agar') {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        const dx = x / S - 0.5;
        const dy = y / S - 0.5;
        const rr = Math.hypot(dx, dy);
        const cloudy = fbm(x * 0.02, y * 0.02, 13, 4);
        const rings = Math.sin(rr * 78 + cloudy * 4) * 0.5 + 0.5;
        const v = clamp01(0.38 + cloudy * 0.34 + rings * 0.24 - rr * 0.3);
        put(i, Math.round(70 + v * 96), Math.round(58 + v * 74), Math.round(40 + v * 46));
      }
    }
  } else if (kind === 'rice-paper' || kind === 'brass-plate') {
    const paper = kind === 'rice-paper';
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        const fiber = fbm(x * 0.5, y * 0.05, 5, 3) * 0.5 + fbm(x * 0.04, y * 0.4, 8, 2) * 0.5;
        const fox = clamp01((fbm(x * 0.008, y * 0.008, 27, 3) - 0.56) * 5);
        if (paper) {
          const v = clamp01(0.9 + fiber * 0.1 - fox * 0.16);
          put(i, Math.round(228 * v), Math.round(216 * v), Math.round(196 * v));
        } else {
          const v = clamp01(0.42 + fiber * 0.3 + Math.sin((x + y) * 0.06) * 0.06 - fox * 0.18);
          put(i, Math.round(96 + v * 112), Math.round(74 + v * 86), Math.round(38 + v * 42));
        }
      }
    }
  } else if (kind === 'sand-ripple') {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        const ripple = Math.sin(y * 0.14 + fbm(x * 0.01, y * 0.01, 17, 3) * 9) * 0.5 + 0.5;
        const grain = fbm(x * 0.3, y * 0.3, 29, 2);
        const v = clamp01(0.42 + ripple * 0.34 + grain * 0.24);
        put(i, Math.round(124 + v * 78), Math.round(92 + v * 62), Math.round(54 + v * 40));
      }
    }
  } else if (kind === 'rain-glass' || kind === 'press-grain') {
    const grainOnly = kind === 'press-grain';
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        const n = hash2(x, y, 991);
        if (grainOnly) {
          const a = n > 0.62 ? Math.round(20 + n * 54) : 0;
          put(i, 255, 255, 255, a);
        } else {
          const blur = fbm(x * 0.02, y * 0.02, 43, 3);
          const v = clamp01(0.16 + blur * 0.24);
          put(i, Math.round(12 + v * 34), Math.round(21 + v * 40), Math.round(24 + v * 38));
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  // --- path-based passes: material detail that pixel noise cannot carry ----
  const rnd = makeRng(kind.length * 971 + 13);

  if (kind === 'laterite' || kind === 'clay-crack') {
    ctx.lineCap = 'round';
    for (let c = 0; c < 16; c++) {
      ctx.beginPath();
      let px = rnd() * S;
      let py = rnd() * S;
      ctx.moveTo(px, py);
      const steps = 6 + Math.floor(rnd() * 9);
      for (let s = 0; s < steps; s++) {
        px += (rnd() - 0.5) * 150;
        py += (rnd() - 0.5) * 150;
        ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `rgba(26, 13, 8, ${0.28 + rnd() * 0.34})`;
      ctx.lineWidth = 1.4 + rnd() * 2.4;
      ctx.stroke();
    }
    for (let c = 0; c < 90; c++) {
      ctx.beginPath();
      ctx.arc(rnd() * S, rnd() * S, 0.8 + rnd() * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(214, 132, 88, ${0.18 + rnd() * 0.35})`;
      ctx.fill();
    }
  }

  if (kind === 'humus-fibre') {
    for (let f = 0; f < 1500; f++) {
      const x = rnd() * S;
      const y = rnd() * S;
      const len = 8 + rnd() * 46;
      const ang = rnd() * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x + Math.cos(ang) * len * 0.5 + (rnd() - 0.5) * 14,
        y + Math.sin(ang) * len * 0.5 + (rnd() - 0.5) * 14,
        x + Math.cos(ang) * len,
        y + Math.sin(ang) * len,
      );
      ctx.strokeStyle = `rgba(${120 + rnd() * 60}, ${88 + rnd() * 40}, ${52 + rnd() * 30}, ${0.1 + rnd() * 0.26})`;
      ctx.lineWidth = 0.6 + rnd() * 1.3;
      ctx.stroke();
    }
  }

  if (kind === 'rice-paper' || kind === 'brass-plate') {
    for (let f = 0; f < 380; f++) {
      const x = rnd() * S;
      const y = rnd() * S;
      const len = 10 + rnd() * 60;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y + (rnd() - 0.5) * 6);
      ctx.strokeStyle =
        kind === 'rice-paper'
          ? `rgba(150, 132, 104, ${0.05 + rnd() * 0.1})`
          : `rgba(238, 206, 148, ${0.04 + rnd() * 0.1})`;
      ctx.lineWidth = 0.5 + rnd() * 0.8;
      ctx.stroke();
    }
  }

  if (kind === 'rain-glass') {
    for (let d = 0; d < 190; d++) {
      const x = rnd() * S;
      const y = rnd() * S;
      const r = 1.4 + rnd() * 7;
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 0, x, y, r * 1.5);
      g.addColorStop(0, 'rgba(226, 240, 238, 0.5)');
      g.addColorStop(0.45, 'rgba(120, 158, 158, 0.2)');
      g.addColorStop(1, 'rgba(10, 18, 20, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return canvas.toDataURL('image/png');
};

export const useTex = (kind: TexKind): string =>
  useMemo(() => {
    const cached = texCache.get(kind);
    if (cached) return cached;
    const url = paintTexture(kind);
    texCache.set(kind, url);
    return url;
  }, [kind]);

// ============================================================================
// 3. CINEMATIC BACKDROPS: LIGHT, HAZE, GRAIN, VIGNETTE
// ============================================================================

export const Backdrop: React.FC<{
  top: string;
  bottom: string;
  tex: TexKind;
  texOpacity?: number;
  texScale?: number;
  light?: { x: number; y: number; rx: number; ry: number; color: string; strength: number };
  vignette?: number;
  children?: React.ReactNode;
}> = ({ top, bottom, tex, texOpacity = 0.25, texScale = 620, light, vignette = 0.62, children }) => {
  const url = useTex(tex);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(176deg, ${top} 0%, ${bottom} 100%)`, overflow: 'hidden' }}>
      {url && (
        <div
          style={{
            position: 'absolute',
            inset: -40,
            backgroundImage: `url(${url})`,
            backgroundSize: `${texScale}px ${texScale}px`,
            backgroundRepeat: 'repeat',
            opacity: texOpacity,
            mixBlendMode: 'overlay',
          }}
        />
      )}
      {light && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse ${light.rx}px ${light.ry}px at ${light.x}px ${light.y}px, ${light.color} 0%, rgba(0,0,0,0) 72%)`,
            opacity: light.strength,
            mixBlendMode: 'screen',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 78% 62% at 50% 46%, rgba(0,0,0,0) 46%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

export const FilmGrain: React.FC<{ opacity?: number; scale?: number }> = ({ opacity = 0.16, scale = 260 }) => {
  const frame = useCurrentFrame();
  const url = useTex('press-grain');
  const ox = (frame * 37) % scale;
  const oy = (frame * 53) % scale;
  return (
    <div
      style={{
        position: 'absolute',
        inset: -scale,
        backgroundImage: `url(${url})`,
        backgroundSize: `${scale}px ${scale}px`,
        backgroundPosition: `${ox}px ${oy}px`,
        backgroundRepeat: 'repeat',
        opacity,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

export const DustMotes: React.FC<{ count?: number; color?: string; seed?: number; y0?: number; y1?: number }> = ({
  count = 46,
  color = 'rgba(240, 228, 200, 0.5)',
  seed = 5,
  y0 = 200,
  y1 = 2100,
}) => {
  const frame = useCurrentFrame();
  const motes = useMemo(() => {
    const rnd = makeRng(seed * 811);
    return Array.from({ length: count }).map(() => ({
      x: rnd() * 1440,
      y: y0 + rnd() * (y1 - y0),
      r: 1 + rnd() * 3.4,
      sp: 0.15 + rnd() * 0.5,
      ph: rnd() * Math.PI * 2,
      a: 0.18 + rnd() * 0.5,
    }));
  }, [count, seed, y0, y1]);
  return (
    <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {motes.map((m, i) => {
        const dy = Math.sin(frame * 0.012 * m.sp + m.ph) * 26 - ((frame * m.sp * 0.5) % 90);
        const dx = Math.cos(frame * 0.009 * m.sp + m.ph) * 20;
        return (
          <circle
            key={i}
            cx={m.x + dx}
            cy={m.y + dy}
            r={m.r}
            fill={color}
            opacity={m.a * (0.55 + 0.45 * Math.sin(frame * 0.05 + m.ph))}
          />
        );
      })}
    </svg>
  );
};

// ============================================================================
// 4. TYPOGRAPHIC PRIMITIVES (BESPOKE VOICE PER CHAPTER, NO SHARED HEADER)
// ============================================================================

export const Mono: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  tracking?: number;
  weight?: 400 | 600;
  opacity?: number;
}> = ({ x, y, text, size = 19, color = IDENTITY.stoneText, anchor = 'start', tracking = 0.18, weight = 600, opacity = 1 }) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fill={color}
    opacity={opacity}
    fontFamily={IDENTITY.fontMono}
    fontSize={size}
    fontWeight={weight}
    letterSpacing={`${tracking}em`}
  >
    {text}
  </text>
);

export const LeaderLabel: React.FC<{
  from: [number, number];
  to: [number, number];
  text: string;
  sub?: string;
  color?: string;
  anchor?: 'start' | 'end' | 'middle';
  size?: number;
  dot?: string;
}> = ({ from, to, text, sub, color = '#D9C9A6', anchor = 'start', size = 18, dot }) => {
  const midX = (from[0] + to[0]) / 2;
  return (
    <g>
      <path
        d={`M ${from[0]},${from[1]} L ${midX},${to[1]} L ${to[0]},${to[1]}`}
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        opacity={0.6}
      />
      <circle cx={from[0]} cy={from[1]} r={4} fill={dot ?? color} opacity={0.9} />
      <circle cx={from[0]} cy={from[1]} r={8} fill="none" stroke={dot ?? color} strokeWidth={1} opacity={0.4} />
      <Mono x={anchor === 'end' ? to[0] - 10 : anchor === 'middle' ? to[0] : to[0] + 10} y={to[1] - 8} text={text} size={size} color={color} anchor={anchor} />
      {sub && (
        <Mono
          x={anchor === 'end' ? to[0] - 10 : anchor === 'middle' ? to[0] : to[0] + 10}
          y={to[1] + 16}
          text={sub}
          size={size - 4}
          color="rgba(210, 200, 178, 0.56)"
          anchor={anchor}
          weight={400}
        />
      )}
    </g>
  );
};

export const RuleLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; opacity?: number; dash?: string }> = ({
  x1,
  y1,
  x2,
  y2,
  color = 'rgba(214, 198, 168, 0.5)',
  width = 1.4,
  opacity = 1,
  dash,
}) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} opacity={opacity} strokeDasharray={dash} />;

// Mask-based letterpress reveal used by several chapters, with per-chapter feel.
export const InkReveal: React.FC<{
  x: number;
  y: number;
  p: number;
  dir?: 'left' | 'right' | 'up';
  pad?: number;
  children: React.ReactNode;
}> = ({ x, y, p, dir = 'left', pad = 28, children }) => {
  const id = `ink-${x.toFixed(0)}-${y.toFixed(0)}-${dir}`;
  const tw = 1500;
  const th = 320;
  const q = easeOutQuart(clamp01(p));
  const rx = dir === 'left' ? x - pad : x + pad - tw * q;
  const ry = y - pad;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          {dir === 'up' ? (
            <rect x={x - pad} y={y + th - th * q} width={tw} height={th * q} />
          ) : (
            <rect x={rx} y={ry} width={tw * q} height={th} />
          )}
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} opacity={q > 0.01 ? 1 : 0}>
        {children}
      </g>
    </g>
  );
};

export const ChapterBeat: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const ch = CHAPTERS[index];
  return <>{Math.round(ch.start * 90) + frame}</>;
};

export const useChapterClock = (index: number) => {
  const frame = useCurrentFrame();
  const ch = CHAPTERS[index];
  const localSec = frame / 90;
  return { ch, localSec, globalSec: ch.start + localSec, art: CHAPTER_ART[index] };
};

// ============================================================================
// 5. SHARED MATERIAL SUBJECTS: SOIL, WATER, CRYSTAL, GLASS
// ============================================================================

export const SoilSlab: React.FC<{
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  texUrl: string;
  dry?: number;
  moss?: number;
  rimColor?: string;
  seed?: number;
  uid: string;
}> = ({ x, y, w, d, h, texUrl, dry = 1, moss = 1, rimColor = 'rgba(246, 214, 160, 0.4)', seed = 3, uid }) => {
  const pebbles = useMemo(() => {
    const rnd = makeRng(seed * 383 + 11);
    return Array.from({ length: 26 }).map(() => ({
      px: 60 + rnd() * (w - 120),
      py: 26 + rnd() * (d - 52),
      r: 2.4 + rnd() * 5.6,
      a: 0.07 + rnd() * 0.18,
    }));
  }, [seed, w, d]);

  const cracks = useMemo(() => {
    const rnd = makeRng(seed * 97 + 5);
    return Array.from({ length: 9 }).map(() => {
      let px = 60 + rnd() * (w - 120);
      let py = 20 + rnd() * (d - 40);
      let dPath = `M ${px},${py}`;
      const seg = 3 + Math.floor(rnd() * 3);
      for (let i = 0; i < seg; i++) {
        px += (rnd() - 0.5) * 190;
        py += (rnd() - 0.5) * 90;
        dPath += ` L ${px},${py}`;
      }
      return { dPath, w: 1.1 + rnd() * 2.1, a: 0.2 + rnd() * 0.4 };
    });
  }, [seed, w, d]);

  const topPath = `M ${x + 44},${y} L ${x + w - 44},${y} L ${x + w},${y + d} L ${x},${y + d} Z`;
  const frontPath = `M ${x},${y + d} L ${x + w},${y + d} L ${x + w - 10},${y + d + h} L ${x + 10},${y + d + h} Z`;

  return (
    <g>
      <defs>
        <clipPath id={`${uid}-top`}>
          <path d={topPath} />
        </clipPath>
        <clipPath id={`${uid}-front`}>
          <path d={frontPath} />
        </clipPath>
        <linearGradient id={`${uid}-toplight`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="rgba(255, 231, 198, 0.24)" />
          <stop offset="40%" stopColor="rgba(255, 214, 166, 0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.34)" />
        </linearGradient>
        <linearGradient id={`${uid}-frontshade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5E3121" />
          <stop offset="55%" stopColor="#3C1E14" />
          <stop offset="100%" stopColor="#24110C" />
        </linearGradient>
      </defs>

      {/* contact shadow */}
      <ellipse cx={x + w / 2 + 6} cy={y + d + h + 16} rx={w * 0.53} ry={26} fill="rgba(0,0,0,0.55)" />

      {/* slab front soil wall */}
      <path d={frontPath} fill={`url(#${uid}-frontshade)`} />
      <g clipPath={`url(#${uid}-front)`}>
        {texUrl && <image href={texUrl} x={x} y={y + d} width={w} height={h} preserveAspectRatio="none" opacity={0.5} />}
        {Array.from({ length: 12 }).map((_, i) => (
          <circle key={i} cx={x + 40 + i * 62} cy={y + d + 18 + ((i * 37) % 40)} r={2 + (i % 3)} fill="rgba(236, 214, 176, 0.16)" />
        ))}
      </g>
      <path d={`M ${x},${y + d} L ${x + w},${y + d}`} stroke="rgba(255, 226, 184, 0.22)" strokeWidth={2} />

      {/* slab top surface */}
      <path d={topPath} fill="#8A4A2F" />
      <g clipPath={`url(#${uid}-top)`}>
        {texUrl && <image href={texUrl} x={x} y={y} width={w} height={d} preserveAspectRatio="none" opacity={0.72} />}
        <path d={topPath} fill={`url(#${uid}-toplight)`} />
        {/* desiccation cracks */}
        {cracks.map((c, i) => (
          <path key={i} d={c.dPath} fill="none" stroke={`rgba(38, 18, 10, ${c.a * dry})`} strokeWidth={c.w} strokeLinecap="round" />
        ))}
        {/* light catching the crack rims */}
        {cracks.slice(0, 5).map((c, i) => (
          <path key={`r${i}`} d={c.dPath} fill="none" stroke={`rgba(255, 206, 158, ${0.09 * dry})`} strokeWidth={0.8} transform="translate(1.6, 1.6)" />
        ))}
        {pebbles.map((p, i) => (
          <g key={i}>
            <circle cx={x + p.px} cy={y + p.py} r={p.r} fill={`rgba(196, 150, 112, ${p.a})`} />
            <circle cx={x + p.px - p.r * 0.3} cy={y + p.py - p.r * 0.35} r={p.r * 0.35} fill="rgba(255, 240, 214, 0.2)" />
          </g>
        ))}
        {/* moss & lichen the rain revives */}
        {moss > 0.02 &&
          Array.from({ length: 34 }).map((_, i) => {
            const mx = x + 80 + ((i * 97) % (w - 160));
            const my = y + 22 + ((i * 53) % (d - 44));
            return (
              <g key={`m${i}`} opacity={clamp01(moss) * (0.4 + ((i * 13) % 30) / 60)}>
                <circle cx={mx} cy={my} r={2.4 + (i % 4)} fill="#5F7A48" />
                <circle cx={mx + 3} cy={my - 2} r={1.6 + (i % 3)} fill="#7E9A5C" />
              </g>
            );
          })}
      </g>
      <path d={topPath} fill="none" stroke={rimColor} strokeWidth={1.6} />
    </g>
  );
};

export const DropStreak: React.FC<{ x: number; y: number; len?: number; color?: string; opacity?: number }> = ({
  x,
  y,
  len = 92,
  color = 'rgba(210, 226, 226, 0.5)',
  opacity = 1,
}) => (
  <g opacity={opacity}>
    <line x1={x} y1={y - len} x2={x} y2={y} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <ellipse cx={x} cy={y + 5} rx={3.4} ry={6.4} fill="rgba(228, 242, 242, 0.78)" />
  </g>
);

export const ImpactCrown: React.FC<{ x: number; y: number; p: number; scale?: number; color?: string }> = ({
  x,
  y,
  p,
  scale = 1,
  color = 'rgba(226, 240, 240, 0.8)',
}) => {
  if (p <= 0) return null;
  const h = smoothstep(clamp01(p)) * 42 * scale;
  const spread = 34 * scale + smoothstep(clamp01(p)) * 66 * scale;
  const fade = 1 - clamp01((p - 0.72) / 0.28);
  return (
    <g opacity={fade}>
      {/* crown sheet */}
      <path
        d={`M ${x - spread},${y} C ${x - spread * 0.72},${y - h * 0.96} ${x - spread * 0.24},${y - h * 1.12} ${x},${y - h * 0.3} C ${x + spread * 0.24},${y - h * 1.12} ${x + spread * 0.72},${y - h * 0.96} ${x + spread},${y} Z`}
        fill="rgba(206, 228, 228, 0.16)"
        stroke={color}
        strokeWidth={1.5}
      />
      {/* detached droplets */}
      {Array.from({ length: 11 }).map((_, i) => {
        const a = (i / 10 - 0.5) * 2;
        const dx = a * spread * 1.5;
        const dy = -h * (1.1 + Math.abs(a) * 0.5) - p * 60;
        return <circle key={i} cx={x + dx} cy={y + dy} r={2.2 + (i % 3) * 1.2} fill={color} opacity={0.8} />;
      })}
      {/* ripple rings */}
      <ellipse cx={x} cy={y + 2} rx={spread * 1.5} ry={spread * 0.24} fill="none" stroke="rgba(232, 244, 244, 0.4)" strokeWidth={1.6} />
      <ellipse cx={x} cy={y + 2} rx={spread * 2.2} ry={spread * 0.34} fill="none" stroke="rgba(232, 244, 244, 0.2)" strokeWidth={1.2} />
    </g>
  );
};

export const IsoCrystal: React.FC<{ x: number; y: number; s: number; h: number; hue?: [string, string, string]; opacity?: number }> = ({
  x,
  y,
  s,
  h,
  hue = ['#F0D9A4', '#C9A45C', '#8D6A2E'],
  opacity = 1,
}) => {
  const top = `M ${x},${y} L ${x + s},${y - s * 0.55} L ${x + s * 2},${y} L ${x + s},${y + s * 0.55} Z`;
  return (
    <g opacity={opacity}>
      <path d={`M ${x + s * 2},${y} L ${x + s * 2},${y - h} L ${x + s},${y + s * 0.55 - h} L ${x + s},${y + s * 0.55} Z`} fill={hue[1]} />
      <path d={`M ${x},${y} L ${x},${y - h} L ${x + s},${y - s * 0.55 - h} L ${x + s},${y - s * 0.55} Z`} fill={hue[2]} />
      <path d={`M ${x},${y - h} L ${x + s},${y - s * 0.55 - h} L ${x + s * 2},${y - h} L ${x + s},${y + s * 0.55 - h} Z`} fill={hue[0]} />
      <path d={`M ${x},${y - h} L ${x},${y} M ${x + s},${y - s * 0.55 - h} L ${x + s},${y - s * 0.55}`} stroke="rgba(255, 252, 236, 0.5)" strokeWidth={1} />
    </g>
  );
};

export const VapourWisps: React.FC<{ x: number; y: number; p: number; color?: string; count?: number; height?: number }> = ({
  x,
  y,
  p,
  color = 'rgba(226, 208, 168, 0.4)',
  count = 5,
  height = 320,
}) => {
  if (p <= 0.01) return null;
  return (
    <g opacity={clamp01(p) * 0.9}>
      {Array.from({ length: count }).map((_, i) => {
        const sway = Math.sin(p * 3 + i) * 18;
        const y0 = y - (height / count) * i;
        const y1 = y0 - height * 0.5;
        return (
          <path
            key={i}
            d={`M ${x + i * 12 - count * 6},${y0} C ${x + sway - 26},${y0 - 60} ${x + sway + 34},${y1 + 60} ${x + sway},${y1}`}
            fill="none"
            stroke={color}
            strokeWidth={1.4 + (i % 3) * 0.6}
            strokeLinecap="round"
            strokeDasharray={i % 2 === 0 ? undefined : '5 9'}
          />
        );
      })}
    </g>
  );
};

export const GlassGauge: React.FC<{ x: number; y: number; w: number; h: number; fill: number; uid: string; ticks?: number }> = ({
  x,
  y,
  w,
  h,
  fill,
  uid,
  ticks = 8,
}) => {
  const waterH = h * fill;
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(206, 226, 226, 0.34)" />
          <stop offset="18%" stopColor="rgba(240, 252, 250, 0.14)" />
          <stop offset="62%" stopColor="rgba(150, 186, 186, 0.1)" />
          <stop offset="100%" stopColor="rgba(224, 242, 240, 0.3)" />
        </linearGradient>
        <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(148, 186, 190, 0.55)" />
          <stop offset="100%" stopColor="rgba(52, 88, 96, 0.75)" />
        </linearGradient>
        <clipPath id={`${uid}-inner`}>
          <rect x={x + 10} y={y + 8} width={w - 20} height={h - 16} rx={10} />
        </clipPath>
      </defs>

      <ellipse cx={x + w / 2} cy={y + h + 18} rx={w * 0.66} ry={14} fill="rgba(0,0,0,0.5)" />

      {/* water body */}
      <g clipPath={`url(#${uid}-inner)`}>
        <rect x={x + 10} y={y + h - waterH} width={w - 20} height={waterH} fill={`url(#${uid}-water)`} />
        <ellipse cx={x + w / 2} cy={y + h - waterH} rx={(w - 20) / 2} ry={7} fill="rgba(206, 230, 230, 0.55)" />
        <rect x={x + 10} y={y + 8} width={w - 20} height={h - 16} fill={`url(#${uid}-glass)`} />
        {/* graduation ticks */}
        {Array.from({ length: ticks }).map((_, i) => {
          const ty = y + 34 + (i * (h - 62)) / (ticks - 1);
          const long = i % 2 === 0;
          return (
            <g key={i}>
              <line x1={x + 22} y1={ty} x2={x + 22 + (long ? 30 : 18)} y2={ty} stroke="rgba(226, 240, 238, 0.55)" strokeWidth={1.2} />
              {long && <Mono x={x + 58} y={ty + 5} text={`${(ticks - 1 - i) * 25}`} size={12} color="rgba(226, 240, 238, 0.6)" tracking={0.06} weight={400} />}
            </g>
          );
        })}
        {/* caustic light band */}
        <path d={`M ${x + 18},${y + h} L ${x + w * 0.5},${y + 20} L ${x + w * 0.78},${y + 20} L ${x + w * 0.42},${y + h} Z`} fill="rgba(226, 244, 240, 0.07)" />
      </g>

      {/* glass outline & rim */}
      <rect x={x} y={y} width={w} height={h} rx={12} fill="none" stroke="rgba(232, 246, 244, 0.66)" strokeWidth={2.4} />
      <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} rx={9} fill="none" stroke="rgba(255, 255, 255, 0.16)" strokeWidth={1} />
      <ellipse cx={x + w / 2} cy={y} rx={w / 2} ry={9} fill="rgba(222, 240, 240, 0.16)" stroke="rgba(240, 252, 250, 0.7)" strokeWidth={2} />
      <line x1={x + 18} y1={y + 26} x2={x + 18} y2={y + h - 30} stroke="rgba(255,255,255,0.4)" strokeWidth={2.2} strokeLinecap="round" />
    </g>
  );
};

// ============================================================================
// 6. SCENE 01 — "RUANG TAKAR": 0,00 ppm, A MEASUREMENT IN THE RAIN
// ============================================================================

export const Scene01RuangTakar: React.FC = () => {
  const { ch, localSec, globalSec, art } = useChapterClock(0);
  const laterite = useTex('laterite');
  const clay = useTex('clay-crack');

  const titleIn = easeOutExpo(prog(localSec, 0.18, 1.5));
  const subIn = easeOutCubic(prog(localSec, 2.3, 3.1));
  const strike = easeInOutCubic(prog(globalSec, 4.62, 5.35));
  const gaugeIn = easeOutCubic(prog(localSec, 0.4, 1.6));
  const firstDrop = prog(localSec, 1.15, 1.75);
  const secondDrop = prog(localSec, 3.3, 3.9);
  const trapIn = easeOutQuart(prog(globalSec, 7.2, 9.3));
  const latticeIn = easeOutExpo(prog(globalSec, 8.1, 10.2));
  const vapour = clamp01(prog(globalSec, 9.0, 11.0));

  const dolly = 1.03 + smoothstep(clamp01(localSec / 11.22)) * 0.035;

  return (
    <AbsoluteFill>
      <Backdrop
        top="#0A110F"
        bottom={art.paper}
        tex="slate-moss"
        texOpacity={0.34}
        light={{ x: 900, y: 620, rx: 760, ry: 660, color: 'rgba(150, 190, 176, 0.16)', strength: 1 }}
      />

      {/* rain curtain — thin backlit streaks, parallax by depth */}
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={0.5}>
          {Array.from({ length: 34 }).map((_, i) => {
            const seedX = ((i * 173) % 1420) + 10;
            const sp = 0.5 + ((i * 7) % 10) / 12;
            const y = ((localSec * 420 * sp + i * 137) % 2760) - 120;
            const len = 60 + ((i * 31) % 90);
            const op = 0.1 + ((i * 17) % 10) / 44;
            return <line key={i} x1={seedX} y1={y} x2={seedX - 16} y2={y + len} stroke={`rgba(206, 226, 222, ${op})`} strokeWidth={1.3} strokeLinecap="round" />;
          })}
        </g>
      </svg>

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(720, 1180) scale(${dolly}) translate(-720, -1180)`}>
          {/* ---------------- typographic architecture (left column) --------- */}
          <g opacity={titleIn}>
            <Mono x={104} y={330} text="FENOMENA PETRIKOR" size={21} color={art.soft} tracking={0.34} />
            <RuleLine x1={104} y1={352} x2={104 + 210 * easeOutCubic(prog(localSec, 0.3, 1.6))} y2={352} color="rgba(196, 176, 138, 0.55)" />
            <text x={100} y={470} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={132} letterSpacing="0.01em">
              BUKAN
            </text>
            <text x={100} y={620} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={132} letterSpacing="0.01em">
              AROMA
            </text>
            <text x={100} y={766} fill="none" stroke={art.ink} strokeWidth={1.6} opacity={0.62} fontFamily={IDENTITY.fontDisplay} fontSize={132} letterSpacing="0.01em">
              AIR
            </text>
            {/* rust strike-through draws across the word */}
            <line
              x1={100}
              y1={730}
              x2={100 + 330 * strike}
              y2={742 + strike * 10}
              stroke={IDENTITY.stampRust}
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.92}
            />
          </g>

          <g opacity={subIn} transform={`translate(0, ${(1 - subIn) * 18})`}>
            <Mono x={104} y={836} text="AIR HUJAN MURNI TIDAK PUNYA BAU" size={24} color="rgba(236, 230, 214, 0.86)" tracking={0.16} />
            <text x={102} y={902} fill={art.accent} fontFamily={IDENTITY.fontFraunces} fontSize={44} fontStyle="italic">
              yang kita hirup adalah parfum tanah
            </text>
          </g>

          {/* ---------------- rain gauge, cropped by left margin ------------ */}
          <g opacity={gaugeIn}>
            <GlassGauge x={-46} y={1010} w={252} h={470} fill={0.34} uid="s1-gauge" ticks={7} />
            <Mono x={222} y={1044} text="TAKARAN HUJAN" size={15} color="rgba(206, 214, 206, 0.72)" tracking={0.2} weight={400} />
            <Mono x={222} y={1076} text="0,00 ppm" size={27} color={art.accent} tracking={0.06} />
            <LeaderLabel from={[196, 1152]} to={[352, 1104]} text="H₂O MURNI" sub="TANPA MOLEKUL BAU" color="rgba(214, 206, 186, 0.72)" size={16} dot={art.accent} />
          </g>

          {/* ---------------- macro laterite slab bleeding off right -------- */}
          <g>
            <SoilSlab x={330} y={1146} w={1250} d={300} h={158} texUrl={laterite} dry={1} moss={0.5} uid="s1-slab" seed={7} rimColor="rgba(246, 214, 160, 0.34)" />
            {/* standing water film in the slab depressions */}
            <ellipse cx={706} cy={1300} rx={116} ry={24} fill="rgba(150, 190, 192, 0.18)" />
            <ellipse cx={706} cy={1297} rx={74} ry={13} fill="rgba(206, 230, 226, 0.2)" />
            <ellipse cx={1146} cy={1322} rx={90} ry={17} fill="rgba(150, 190, 192, 0.14)" />

            {/* first drop + crown */}
            <DropStreak x={706} y={946 + firstDrop * 330} len={118} opacity={firstDrop > 0 && firstDrop < 1 ? 0.9 : 0} />
            {localSec > 1.62 && localSec < 2.85 && (
              <ImpactCrown x={706} y={1300} p={clamp01((localSec - 1.62) / 0.85)} scale={1.35} />
            )}
            <DropStreak x={1146} y={886 + secondDrop * 380} len={92} opacity={secondDrop > 0 && secondDrop < 1 ? 0.75 : 0} />
            {localSec > 3.42 && localSec < 4.5 && (
              <ImpactCrown x={1146} y={1322} p={clamp01((localSec - 3.42) / 0.8)} scale={0.92} />
            )}

            {/* the chemical trap blooming out of the soil */}
            <g opacity={trapIn} transform={`translate(0, ${(1 - trapIn) * 40})`}>
              <g transform="translate(952, 1300)">
                <IsoCrystal x={0} y={0} s={30} h={46 * latticeIn} opacity={latticeIn} />
                <IsoCrystal x={58} y={16} s={22} h={64 * latticeIn} hue={['#F6E3B4', '#D3A963', '#8F6A34']} opacity={latticeIn} />
                <IsoCrystal x={-48} y={20} s={18} h={38 * latticeIn} hue={['#EBD6A6', '#C39A54', '#7C5C2C']} opacity={latticeIn * 0.9} />
                <IsoCrystal x={26} y={-16} s={14} h={30 * latticeIn} opacity={latticeIn * 0.8} />
              </g>
              <VapourWisps x={978} y={1268} p={vapour} count={4} height={330} />
              <LeaderLabel
                from={[952, 1298]}
                to={[1250, 1086]}
                text="GEOSMIN · C₁₂H₂₂O"
                sub="ALKOHOL BISIKLIK TANAH"
                color="rgba(226, 206, 166, 0.8)"
                anchor="start"
                size={17}
                dot={art.accent}
              />
            </g>
          </g>

          {/* ---------------- marginalia: thin measured notes ----------------- */}
          <g opacity={trapIn * 0.9}>
            <RuleLine x1={104} y1={1668} x2={612} y2={1668} color="rgba(200, 190, 166, 0.28)" />
            <Mono x={104} y={1708} text="JEBAKAN KIMIA" size={17} color={IDENTITY.stampRust} tracking={0.26} />
            <Mono x={104} y={1740} text="DIPASANG BAKTERI TANAH UNTUK MENYEBAR SPORA" size={15} color="rgba(214, 206, 188, 0.6)" tracking={0.12} weight={400} />
            <Mono x={1336} y={1708} text="BEAR & THOMAS · 1964" size={15} color="rgba(214, 206, 188, 0.5)" tracking={0.16} anchor="end" weight={400} />
            <RuleLine x1={104} y1={1826} x2={1336} y2={1826} color="rgba(200, 190, 166, 0.2)" />
            <Mono x={104} y={1866} text="AMBANG BAU MANUSIA TERHADAP GEOSMIN" size={15} color="rgba(214, 206, 188, 0.44)" tracking={0.16} weight={400} />
            <Mono x={1336} y={1866} text="5 BAGIAN PER TRILIUN" size={17} color={IDENTITY.amberLight} tracking={0.2} anchor="end" />
          </g>
        </g>
      </svg>

      <FilmGrain opacity={0.13} />
    </AbsoluteFill>
  );
};

// ============================================================================
// 7. SCENE 02 — "STRIP KAMERA CEPAT": A HIGH-SPEED FILM STRIP, NOT A CARD
// ============================================================================

type FastPhase = 'jatuh' | 'hentakan' | 'perangkap' | 'letupan' | 'kabut';

const SoilGrainBand: React.FC<{ x: number; y: number; w: number; h: number; seed: number; opaque?: number }> = ({
  x,
  y,
  w,
  h,
  seed,
  opaque = 1,
}) => {
  const grains = useMemo(() => {
    const rnd = makeRng(seed * 733 + 19);
    const out: { cx: number; cy: number; rx: number; ry: number; rot: number; tone: number }[] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 17; col++) {
        const cx = x - 20 + col * ((w + 40) / 16) + (row % 2) * 21 + (rnd() - 0.5) * 18;
        const cy = y + row * (h / 9) + (rnd() - 0.5) * 12;
        out.push({ cx, cy, rx: 16 + rnd() * 26, ry: 10 + rnd() * 16, rot: rnd() * 180, tone: rnd() });
      }
    }
    return out;
  }, [x, y, w, h, seed]);

  return (
    <g opacity={opaque}>
      {grains.map((g, i) => (
        <g key={i} transform={`rotate(${g.rot} ${g.cx} ${g.cy})`}>
          <ellipse cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} fill={`rgb(${74 + g.tone * 44}, ${44 + g.tone * 30}, ${30 + g.tone * 20})`} />
          <ellipse cx={g.cx - g.rx * 0.24} cy={g.cy - g.ry * 0.28} rx={g.rx * 0.58} ry={g.ry * 0.52} fill="rgba(255, 226, 190, 0.1)" />
          <ellipse cx={g.cx + g.rx * 0.3} cy={g.cy + g.ry * 0.34} rx={g.rx * 0.5} ry={g.ry * 0.42} fill="rgba(20, 10, 6, 0.22)" />
        </g>
      ))}
    </g>
  );
};

const HighSpeedFrame: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  phase: FastPhase;
  p: number;
  label: string;
  uid: string;
}> = ({ x, y, w, h, phase, p, label, uid }) => {
  const surfaceY = y + h * 0.56;
  const cx = x + w * 0.5;

  const bubbleP = phase === 'perangkap' ? clamp01(p) : phase === 'letupan' || phase === 'kabut' ? 1 : 0;
  const crownP = phase === 'hentakan' ? clamp01((p - 0.15) / 0.7) : phase === 'perangkap' ? 1 : 0;
  const plumeP = phase === 'letupan' ? clamp01(p) : phase === 'kabut' ? 1 : 0;

  return (
    <g>
      <defs>
        <clipPath id={`${uid}-clip`}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#101819" />
          <stop offset="70%" stopColor="#16201F" />
          <stop offset="100%" stopColor="#0C1211" />
        </linearGradient>
        <radialGradient id={`${uid}-lamp`} cx="50%" cy="18%" r="72%">
          <stop offset="0%" stopColor="rgba(238, 214, 168, 0.2)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      <rect x={x} y={y} width={w} height={h} fill={`url(#${uid}-sky)`} />

      <g clipPath={`url(#${uid}-clip)`}>
        <rect x={x} y={y} width={w} height={h} fill={`url(#${uid}-lamp)`} />

        {/* porous soil cross-section */}
        <SoilGrainBand x={x} y={surfaceY} w={w} h={h * 0.46} seed={phase.length + 3} opaque={0.98} />
        {/* dark voids between grains = air capillaries */}
        {Array.from({ length: 7 }).map((_, i) => (
          <ellipse
            key={i}
            cx={x + w * (0.12 + i * 0.125)}
            cy={surfaceY + 22 + ((i * 47) % 96)}
            rx={12 + (i % 4) * 5}
            ry={16 + (i % 3) * 8}
            fill="rgba(10, 12, 11, 0.72)"
            stroke="rgba(214, 190, 150, 0.14)"
            strokeWidth={1}
          />
        ))}

        {/* rain film pooling on the surface */}
        <path
          d={`M ${x},${surfaceY} Q ${cx - w * 0.24},${surfaceY - 16} ${cx},${surfaceY - 6} Q ${cx + w * 0.26},${surfaceY - 18} ${x + w},${surfaceY}`}
          stroke="rgba(214, 236, 236, 0.42)"
          strokeWidth={2}
          fill="none"
        />

        {/* --- phase-specific physics --- */}

        {/* falling drop */}
        {(phase === 'jatuh' || (phase === 'hentakan' && p < 0.2)) && (
          <g opacity={phase === 'jatuh' ? 0.95 : 0.6}>
            <ellipse cx={cx} cy={y + h * (0.14 + clamp01(p) * 0.3)} rx={12} ry={17} fill="rgba(228, 244, 244, 0.94)" />
            <line x1={cx} y1={y + h * (0.02 + clamp01(p) * 0.28)} x2={cx} y2={y + h * (0.14 + clamp01(p) * 0.28)} stroke="rgba(220, 238, 238, 0.34)" strokeWidth={2} />
          </g>
        )}

        {/* impact crown + trapped bubble */}
        {crownP > 0.02 && <ImpactCrown x={cx} y={surfaceY} p={crownP} scale={1.3} />}

        {bubbleP > 0.02 && (
          <g>
            {/* the air pocket dragged under the drop */}
            <ellipse cx={cx} cy={surfaceY + 56} rx={44} ry={28} fill="rgba(206, 228, 228, 0.16)" stroke="rgba(232, 246, 244, 0.66)" strokeWidth={1.6} />
            <ellipse cx={cx - 8} cy={surfaceY + 40} rx={9} ry={5} fill="rgba(255, 255, 255, 0.5)" />
            {/* rising chain */}
            {Array.from({ length: 6 }).map((_, i) => {
              const rise = clamp01(bubbleP * 1.5 - i * 0.16);
              if (rise <= 0) return null;
              const by = surfaceY + 30 - rise * (120 + i * 12);
              const bx = cx + Math.sin(i * 1.7 + p * 2) * (10 + i * 1.6);
              return (
                <g key={i} opacity={0.45 + rise * 0.5}>
                  <circle cx={bx} cy={by} r={5 + i * 1.4} fill="rgba(214, 236, 234, 0.18)" stroke="rgba(240, 250, 248, 0.7)" strokeWidth={1.1} />
                  <circle cx={bx - 1.2} cy={by - 1.2} r={(3.6 + i * 0.9) * 0.34} fill="rgba(255,255,255,0.7)" />
                </g>
              );
            })}
          </g>
        )}

        {/* burst plume of aerosols */}
        {plumeP > 0.02 &&
          Array.from({ length: 46 }).map((_, i) => {
            const rndA = hash2(i, 7, 31);
            const rndB = hash2(i, 13, 57);
            const life = clamp01(plumeP * 1.35 - rndA * 0.5);
            if (life <= 0) return null;
            const ang = -Math.PI / 2 + (rndA - 0.5) * 1.9;
            const dist = life * (110 + rndB * 300);
            const px = cx + Math.cos(ang) * dist + Math.sin(life * 4 + i) * 12;
            const py = surfaceY - 10 + Math.sin(ang) * dist - life * 40;
            return (
              <g key={i} opacity={clamp01(1.2 - life * 0.8)}>
                <circle cx={px} cy={py} r={2.6 + rndB * 6.4} fill="rgba(230, 242, 238, 0.78)" />
                {rndA > 0.62 && <circle cx={px} cy={py} r={1.6 + rndB * 3} fill="rgba(208, 168, 104, 0.9)" />}
              </g>
            );
          })}

        {/* wind vectors */}
        {phase === 'kabut' && (
          <g opacity={clamp01(p * 1.6)}>
            {Array.from({ length: 5 }).map((_, i) => {
              const yy = y + h * (0.14 + i * 0.075);
              return (
                <path
                  key={i}
                  d={`M ${x + 40},${yy} C ${x + w * 0.34},${yy - 14} ${x + w * 0.62},${yy + 14} ${x + w - 40},${yy - 6}`}
                  fill="none"
                  stroke="rgba(206, 222, 218, 0.28)"
                  strokeWidth={1.2}
                  strokeDasharray="6 10"
                  strokeDashoffset={-p * 60}
                />
              );
            })}
          </g>
        )}

        {/* frame micro-vignette + scanline sheen */}
        <rect x={x} y={y} width={w} height={h} fill="none" stroke="rgba(10, 12, 12, 0.9)" strokeWidth={26} />
        <rect x={x + 13} y={y + 13} width={w - 26} height={h - 26} fill="none" stroke="rgba(214, 228, 224, 0.16)" strokeWidth={1} />
      </g>

      {/* burned-in lab label, only on the frame that sits in the gate */}
      {label.length > 0 && (
        <g>
          <Mono x={x + 30} y={y + h - 26} text={label} size={17} color="rgba(232, 238, 232, 0.82)" tracking={0.26} />
          <circle cx={x + 19} cy={y + h - 31} r={4} fill="rgba(226, 190, 120, 0.92)" />
        </g>
      )}
    </g>
  );
};

export const Scene02StripCepat: React.FC = () => {
  const { art, localSec, globalSec } = useChapterClock(1);

  const stripW = 940;
  const frameW = stripW - 100;
  const frameH = 604;
  const stripX = 250;
  const stepGap = 668;

  // strip advances as each measurement lands; eased between 5 stations
  const stations = [
    { t: 11.62, i: 0 },
    { t: 15.66, i: 1 },
    { t: 18.06, i: 2 },
    { t: 20.62, i: 3 },
    { t: 22.92, i: 4 },
  ];
  let pos = 0;
  for (let i = 0; i < stations.length - 1; i++) {
    const a = stations[i];
    const b = stations[i + 1];
    const k = easeInOutCubic(prog(globalSec, a.t, b.t));
    pos = a.i + (b.i - a.i) * k;
  }

  const phases: FastPhase[] = ['jatuh', 'hentakan', 'perangkap', 'letupan', 'kabut'];
  const labels = ['JATUH', 'HENTAKAN', 'PERANGKAP UDARA', 'LETUPAN', 'KABUT'];
  const phaseStart = [11.62, 15.66, 18.06, 20.62, 22.92];

  const flicker = 0.94 + 0.06 * Math.sin(localSec * 47) * Math.sin(localSec * 13.4);
  const stripTop = 868;

  return (
    <AbsoluteFill>
      <Backdrop top="#0A0F10" bottom={art.paper} tex="soot" texOpacity={0.5} />

      {/* projector beam */}
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="s2-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(240, 214, 164, 0.18)" />
            <stop offset="62%" stopColor="rgba(240, 214, 164, 0.05)" />
            <stop offset="100%" stopColor="rgba(240, 214, 164, 0)" />
          </linearGradient>
        </defs>
        <polygon points="700,60 780,60 1250,2200 210,2200" fill="url(#s2-beam)" opacity={flicker} style={{ mixBlendMode: 'screen' }} />
      </svg>

      <DustMotes count={54} seed={12} color="rgba(240, 224, 192, 0.55)" y0={120} y1={2100} />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="s2-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(6, 8, 9, 0.94)" />
            <stop offset="60%" stopColor="rgba(6, 8, 9, 0.34)" />
            <stop offset="100%" stopColor="rgba(6, 8, 9, 0)" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1440} height={300} fill="url(#s2-top)" />
      </svg>

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        {/* ---------------- the film strip ---------------- */}
        <g>
          <rect x={stripX - 6} y={-260} width={stripW + 12} height={3100} fill="#0E1213" />
          <rect x={stripX - 6} y={-260} width={stripW + 12} height={3100} fill="none" stroke="rgba(210, 224, 220, 0.12)" strokeWidth={2} />

          {/* sprocket holes */}
          {Array.from({ length: 68 }).map((_, i) => {
            const yy = -240 + i * 46 - ((pos * stepGap) % 46);
            return (
              <g key={i} opacity={0.72}>
                <rect x={stripX + 8} y={yy} width={30} height={24} rx={5} fill="#05080A" stroke="rgba(198, 214, 210, 0.22)" strokeWidth={1} />
                <rect x={stripX + stripW - 38} y={yy} width={30} height={24} rx={5} fill="#05080A" stroke="rgba(198, 214, 210, 0.22)" strokeWidth={1} />
              </g>
            );
          })}

          {/* scratches on the emulsion */}
          {[0.18, 0.42, 0.77].map((fx, i) => (
            <line
              key={i}
              x1={stripX + stripW * fx}
              y1={-200}
              x2={stripX + stripW * fx + 8}
              y2={2300}
              stroke="rgba(240, 232, 210, 0.06)"
              strokeWidth={1 + i * 0.6}
            />
          ))}

          {phases.map((ph, i) => {
            const frameY = stripTop + (i - pos) * stepGap - frameH / 2;
            const visible = Math.abs(i - pos) < 1.6;
            if (!visible) return null;
            const p = clamp01((globalSec - phaseStart[i]) / 2.6);
            return (
              <g key={ph}>
                <HighSpeedFrame
                  x={stripX + 48}
                  y={frameY}
                  w={frameW}
                  h={frameH}
                  phase={ph}
                  p={p}
                  label={Math.abs(i - pos) < 0.45 ? labels[i] : ''}
                  uid={`s2-${i}`}
                />
              </g>
            );
          })}
        </g>

        {/* ---------------- typography, set like a lab slate ---------------- */}
        <g>
          <Mono x={64} y={126} text="REKAMAN KAMERA KECEPATAN TINGGI" size={17} color="rgba(212, 206, 188, 0.62)" tracking={0.22} weight={400} />
          <RuleLine x1={64} y1={150} x2={64 + 320 * easeOutCubic(prog(localSec, 0.2, 1.4))} y2={150} color="rgba(208, 196, 170, 0.4)" />

          {/* giant tempo figure, set sideways along the left margin */}
          <g transform="translate(148, 1520) rotate(-90)">
            <text x={0} y={0} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={150} letterSpacing="0.02em">
              200.000
            </text>
            <text x={8} y={44} fill={art.accent} fontFamily={IDENTITY.fontMono} fontSize={26} fontWeight={600} letterSpacing="0.4em">
              FPS · TETES PER DETIK
            </text>
          </g>

          {/* lab credit running up the right margin */}
          <g transform="translate(1306, 1300) rotate(90)">
            <Mono x={0} y={0} text="JOUNG & BUIE" size={19} color="rgba(226, 216, 194, 0.74)" tracking={0.24} />
            <Mono x={0} y={30} text="MIT — NATURE COMMUNICATIONS 2015" size={15} color="rgba(200, 192, 172, 0.5)" tracking={0.14} weight={400} />
            <RuleLine x1={0} y1={48} x2={430} y2={48} color="rgba(200, 192, 172, 0.28)" />
          </g>

          {/* measured comparison: a slate note laid over the strip, no card */}
          <g opacity={easeOutCubic(prog(globalSec, 21.2, 22.4))}>
            <defs>
              <linearGradient id="s2-scrim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(6, 8, 8, 0)" />
                <stop offset="34%" stopColor="rgba(6, 8, 8, 0.86)" />
                <stop offset="100%" stopColor="rgba(6, 8, 8, 0.94)" />
              </linearGradient>
            </defs>
            <rect x={250} y={1600} width={940} height={260} fill="url(#s2-scrim)" />
            <RuleLine x1={286} y1={1660} x2={1154} y2={1660} color="rgba(206, 196, 172, 0.26)" />
            <Mono x={286} y={1700} text="GERIMIS PELAN" size={16} color={art.accent} tracking={0.26} />
            <Mono x={286} y={1734} text="gelembung sempat meletup" size={26} color="rgba(240, 234, 220, 0.94)" tracking={0.02} weight={600} />
            <Mono x={1154} y={1700} text="HUJAN DERAS" size={16} color="rgba(198, 202, 194, 0.44)" tracking={0.26} anchor="end" />
            <Mono x={1154} y={1734} text="gelembung gagal terbentuk" size={26} color="rgba(226, 222, 210, 0.34)" tracking={0.02} anchor="end" weight={600} />
          </g>
        </g>
      </svg>

      <FilmGrain opacity={0.2} scale={210} />
    </AbsoluteFill>
  );
};

// ============================================================================
// 8. SCENE 03 — "CAWAN AGAR": A LIVING CULTURE PLATE IN OBLIQUE LIGHT
// ============================================================================

const Colony: React.FC<{ cx: number; cy: number; r: number; tone: number; grow: number; raised?: boolean; seed: number; dry?: number }> = ({
  cx,
  cy,
  r,
  tone,
  grow,
  raised = false,
  seed,
  dry = 0,
}) => {
  const rr = r * easeOutCubic(grow);
  if (rr < 0.4) return null;
  const palette = [
    ['#B08A4E', '#D8BC85', '#7C5C2C'],
    ['#C7B58A', '#E6DAC0', '#8E7C55'],
    ['#8E6C3C', '#B99B62', '#5E4522'],
    ['#D6C9A6', '#EFE6CE', '#9C8A66'],
    ['#A2763F', '#CBAE76', '#6B4C22'],
  ][Math.floor(tone * 5) % 5];

  const blob = useMemo(() => {
    const n = 44;
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k =
        1 +
        0.1 * Math.sin(3 * a + seed * 1.7) +
        0.07 * Math.sin(5 * a + seed * 2.9) +
        0.045 * Math.sin(9 * a + seed * 4.3) +
        0.03 * Math.sin(15 * a + seed);
      pts.push([Math.cos(a) * rr * k, Math.sin(a) * rr * k]);
    }
    return pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ') + ' Z';
  }, [rr, seed]);

  return (
    <g transform={`translate(${cx}, ${cy})`} opacity={clamp01(grow * 1.7)}>
      {raised && <path d={blob} transform="translate(4, 6)" fill="rgba(16, 10, 4, 0.5)" />}
      <path d={blob} fill={palette[0]} />
      <defs>
        <radialGradient id={`col-${seed}`} cx="34%" cy="30%" r="76%">
          <stop offset="0%" stopColor={palette[1]} stopOpacity={0.9} />
          <stop offset="58%" stopColor={palette[0]} stopOpacity={0.5} />
          <stop offset="100%" stopColor={palette[2]} stopOpacity={0.72} />
        </radialGradient>
        <clipPath id={`colclip-${seed}`}>
          <path d={blob} />
        </clipPath>
      </defs>
      <path d={blob} fill={`url(#col-${seed})`} />
      <g clipPath={`url(#colclip-${seed})`}>
        {/* concentric growth wave, offset from centre for a hand-made look */}
        {[0.82, 0.62, 0.42, 0.24].map((k, i) => (
          <ellipse
            key={i}
            cx={rr * 0.12 * Math.sin(seed + i)}
            cy={rr * 0.1 * Math.cos(seed * 1.3 + i)}
            rx={rr * k}
            ry={rr * k * 0.94}
            fill="none"
            stroke={`rgba(60, 42, 20, ${0.2 - i * 0.03})`}
            strokeWidth={1.5}
            strokeDasharray={i % 2 === 0 ? undefined : '7 9'}
          />
        ))}
        {/* mottled speckle */}
        {Array.from({ length: 26 }).map((_, i) => {
          const a = hash2(i, Math.round(seed), 17) * Math.PI * 2;
          const rad = hash2(i, Math.round(seed), 29) * rr * 0.88;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * rad}
              cy={Math.sin(a) * rad}
              r={1.4 + hash2(i, 5, 3) * 4}
              fill={i % 3 === 0 ? 'rgba(255, 246, 220, 0.34)' : 'rgba(52, 36, 16, 0.22)'}
            />
          );
        })}
        {/* dry, cracked rim as the colony starves */}
        {dry > 0.02 &&
          Array.from({ length: 7 }).map((_, i) => {
            const a = (i / 7) * Math.PI * 2 + seed;
            return (
              <path
                key={i}
                d={`M 0,0 L ${Math.cos(a) * rr * 0.96},${Math.sin(a) * rr * 0.96}`}
                stroke={`rgba(30, 18, 8, ${0.24 * dry})`}
                strokeWidth={2.4}
                strokeLinecap="round"
              />
            );
          })}
      </g>

      {/* fuzzy aerial mycelium around the rim */}
      {Array.from({ length: 30 }).map((_, i) => {
        const a = (i / 30) * Math.PI * 2;
        const len = rr * (0.05 + hash2(i, Math.round(seed * 7), 5) * 0.16);
        return (
          <line
            key={`f${i}`}
            x1={Math.cos(a) * rr * 0.97}
            y1={Math.sin(a) * rr * 0.97}
            x2={Math.cos(a) * (rr + len)}
            y2={Math.sin(a) * (rr + len)}
            stroke="rgba(240, 228, 198, 0.34)"
            strokeWidth={1.1}
          />
        );
      })}
      <path d={blob} fill="none" stroke={palette[1]} strokeWidth={1.6} opacity={0.6} />
    </g>
  );
};

const StreptoFilament: React.FC<{
  d: string;
  p: number;
  color?: string;
  sporeEvery?: number;
  sporeR?: number;
  chain?: boolean;
}> = ({ d, p, color = 'rgba(238, 230, 208, 0.92)', sporeEvery = 0, sporeR = 5, chain = false }) => {
  const g = easeOutCubic(clamp01(p));
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={4.2}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - g}
      />
      {chain &&
        Array.from({ length: 11 }).map((_, i) => {
          const k = i / 10;
          if (k > g) return null;
          // sample along the end of the path using the same parametric curve
          return null;
        })}
      {sporeEvery > 0 &&
        Array.from({ length: Math.ceil(g * 9) }).map((_, i) => (
          <circle key={i} cx={0} cy={0} r={sporeR * 0.001} fill={color} opacity={0} />
        ))}
    </g>
  );
};

const SpiralSporeChain: React.FC<{ x: number; y: number; len: number; p: number; r?: number; color?: string; rot?: number }> = ({
  x,
  y,
  len,
  p,
  r = 5.4,
  color = '#E8CFA0',
  rot = 0,
}) => {
  const g = easeOutCubic(clamp01(p));
  const beads = 11;
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rot})`}>
      {Array.from({ length: beads }).map((_, i) => {
        const k = i / (beads - 1);
        if (k > g) return null;
        const ang = k * Math.PI * 3.1;
        const bx = Math.cos(ang) * (r * 1.9) * (0.25 + k * 0.9);
        const by = -k * len;
        const rr = r * (0.55 + 0.5 * Math.sin(k * Math.PI));
        return (
          <g key={i}>
            <circle cx={bx} cy={by} r={rr} fill={color} opacity={0.95} />
            <circle cx={bx - rr * 0.3} cy={by - rr * 0.34} r={rr * 0.34} fill="rgba(255, 250, 232, 0.8)" />
            <circle cx={bx + rr * 0.34} cy={by + rr * 0.4} r={rr * 0.4} fill="rgba(120, 88, 40, 0.24)" />
          </g>
        );
      })}
    </g>
  );
};

const FrostCrystal: React.FC<{ x: number; y: number; size: number; p: number; color?: string; rot?: number }> = ({
  x,
  y,
  size,
  p,
  color = 'rgba(244, 232, 202, 0.86)',
  rot = 0,
}) => {
  const g = easeOutExpo(clamp01(p));
  if (g < 0.02) return null;
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rot})`} opacity={clamp01(g * 1.4)}>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const ex = Math.cos(a) * size * g;
        const ey = Math.sin(a) * size * g;
        return (
          <g key={i}>
            <line x1={0} y1={0} x2={ex} y2={ey} stroke={color} strokeWidth={2} strokeLinecap="round" />
            {[0.45, 0.7].map((k, j) => (
              <g key={j}>
                <line
                  x1={ex * k}
                  y1={ey * k}
                  x2={ex * k + Math.cos(a + 0.9) * size * 0.26 * g}
                  y2={ey * k + Math.sin(a + 0.9) * size * 0.26 * g}
                  stroke={color}
                  strokeWidth={1.3}
                  strokeLinecap="round"
                />
                <line
                  x1={ex * k}
                  y1={ey * k}
                  x2={ex * k + Math.cos(a - 0.9) * size * 0.26 * g}
                  y2={ey * k + Math.sin(a - 0.9) * size * 0.26 * g}
                  stroke={color}
                  strokeWidth={1.3}
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
};

export const Scene03CawanAgar: React.FC = () => {
  const { art, localSec, globalSec } = useChapterClock(2);
  const agarUrl = useTex('agar');
  const plate = useTex('brass-plate');

  const cx = 720;
  const cy = 996;
  const R = 596;

  const dishIn = easeOutExpo(prog(localSec, 0.1, 1.6));
  const colonyGrow = prog(globalSec, 26.9, 33.0);
  const nameIn = prog(globalSec, 30.3, 31.9);
  const filamentGrow = prog(globalSec, 33.8, 39.4);
  const drought = prog(globalSec, 36.2, 40.6);
  const bloom = prog(globalSec, 39.6, 42.6);
  const vapour = clamp01(prog(globalSec, 41.0, 42.7));
  const rotation = -localSec * 0.85;

  const colonies = useMemo(() => {
    const rnd = makeRng(9102);
    const clusters = Array.from({ length: 6 }).map(() => {
      const a = rnd() * Math.PI * 2;
      const rad = 90 + rnd() * (R - 230);
      return { cx: Math.cos(a) * rad, cy: Math.sin(a) * rad };
    });
    const out: { cx: number; cy: number; r: number; tone: number; delay: number; seed: number }[] = [];
    clusters.forEach((c, ci) => {
      const n = 4 + Math.floor(rnd() * 4);
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2;
        const rad = 20 + rnd() * 120;
        const px = c.cx + Math.cos(a) * rad;
        const py = c.cy + Math.sin(a) * rad;
        if (Math.hypot(px, py) > R - 70) continue;
        out.push({
          cx: px,
          cy: py,
          r: 22 + rnd() * (i === 0 ? 96 : 58),
          tone: rnd(),
          delay: rnd() * 0.45,
          seed: ci * 31 + i * 7 + 3,
        });
      }
    });
    return out;
  }, [R]);

  const filaments = useMemo(() => {
    const rnd = makeRng(551);
    return Array.from({ length: 13 }).map((_, i) => {
      const a = -Math.PI * 0.92 + i * 0.21 + rnd() * 0.08;
      const r0 = 40 + rnd() * 120;
      const x0 = Math.cos(a) * r0;
      const y0 = Math.sin(a) * r0;
      const len = 170 + rnd() * 190;
      const bend = (rnd() - 0.5) * 130;
      const x1 = x0 + Math.cos(a) * len + bend;
      const y1 = y0 + Math.sin(a) * len * 0.7;
      const cxp = x0 + Math.cos(a) * len * 0.42 + bend * 0.9;
      const cyp = y0 + Math.sin(a) * len * 0.28;
      const bx = x0 + (x1 - x0) * 0.55 + 44;
      const by = y0 + (y1 - y0) * 0.55 - 26;
      return {
        d: `M ${x0},${y0} Q ${cxp},${cyp} ${x1},${y1}`,
        branch: `M ${bx},${by} q 30,-26 62,-30`,
        branchTip: [bx + 62, by - 30] as [number, number],
        tip: [x1, y1] as [number, number],
        delay: rnd() * 0.3,
      };
    });
  }, []);

  return (
    <AbsoluteFill>
      <Backdrop
        top="#171009"
        bottom={art.paper}
        tex="humus-fibre"
        texOpacity={0.3}
        light={{ x: 1180, y: 360, rx: 900, ry: 780, color: 'rgba(226, 176, 112, 0.2)', strength: 1 }}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        {/* ---------------- type architecture: asymmetric, plate-like ------- */}
        <g opacity={easeOutCubic(prog(localSec, 0.2, 1.2))}>
          <Mono x={92} y={300} text="MIKROBIOLOGI TANAH" size={19} color={art.soft} tracking={0.34} />
          <RuleLine x1={92} y1={322} x2={330} y2={322} color="rgba(198, 176, 136, 0.4)" />
          <Mono x={92} y={352} text="KOLONI AKTINOBACTERIA" size={15} color="rgba(214, 200, 172, 0.5)" tracking={0.22} weight={400} />
        </g>

        {/* ---------------- the culture dish ---------------- */}
        <g
          opacity={dishIn}
          transform={`translate(${cx}, ${cy}) scale(${0.93 + 0.07 * dishIn}) translate(${-cx}, ${-cy})`}
        >
          {/* cast shadow */}
          <ellipse cx={cx + 18} cy={cy + R * 0.92} rx={R * 0.92} ry={R * 0.2} fill="rgba(0,0,0,0.6)" />

          {/* dish body / agar */}
          <circle cx={cx} cy={cy} r={R} fill="#170F07" />
          <g>
            <defs>
              <clipPath id="s3-agar">
                <circle cx={cx} cy={cy} r={R - 12} />
              </clipPath>
            </defs>
            <g clipPath="url(#s3-agar)">
              {agarUrl && <image href={agarUrl} x={cx - R} y={cy - R} width={R * 2} height={R * 2} opacity={0.55} />}
              <circle cx={cx} cy={cy} r={R} fill="rgba(58, 40, 20, 0.62)" />
              {/* oblique light sweeping across wet agar */}
              <ellipse cx={cx - R * 0.28} cy={cy - R * 0.34} rx={R * 0.76} ry={R * 0.5} fill="rgba(248, 220, 170, 0.14)" />
              {/* radial pouring striations */}
              {Array.from({ length: 42 }).map((_, i) => {
                const a = (i / 42) * Math.PI * 2 + 0.3;
                return (
                  <line
                    key={i}
                    x1={cx + Math.cos(a) * 60}
                    y1={cy + Math.sin(a) * 60}
                    x2={cx + Math.cos(a) * (R - 16)}
                    y2={cy + Math.sin(a) * (R - 16)}
                    stroke="rgba(246, 226, 186, 0.05)"
                    strokeWidth={1 + (i % 3)}
                  />
                );
              })}

              <g transform={`rotate(${rotation} ${cx} ${cy})`}>
                {colonies.map((c, i) => (
                  <Colony
                    key={i}
                    cx={cx + c.cx}
                    cy={cy + c.cy}
                    r={c.r}
                    tone={c.tone}
                    grow={clamp01(colonyGrow * 1.5 - c.delay)}
                    raised={i % 3 === 0}
                    seed={c.seed}
                    dry={drought}
                  />
                ))}
              </g>

              {/* condensation ring inside the lid */}
              {Array.from({ length: 34 }).map((_, i) => {
                const a = (i / 34) * Math.PI * 2;
                const rr = R - 30 - (i % 5) * 7;
                return (
                  <circle
                    key={`c${i}`}
                    cx={cx + Math.cos(a) * rr}
                    cy={cy + Math.sin(a) * rr}
                    r={3 + (i % 4)}
                    fill="rgba(240, 246, 240, 0.22)"
                    stroke="rgba(255, 255, 255, 0.28)"
                    strokeWidth={0.7}
                  />
                );
              })}

              {/* aerial filaments rising out of the agar */}
              <g transform={`translate(${cx}, ${cy + 40})`}>
                {filaments.map((f, i) => {
                  const gp = clamp01((filamentGrow - f.delay * 2) / 0.8);
                  return (
                    <g key={i}>
                      <StreptoFilament d={f.d} p={gp} color="rgba(238, 228, 204, 0.88)" />
                      <StreptoFilament d={f.branch} p={clamp01(gp * 1.5 - 0.5)} color="rgba(232, 220, 194, 0.7)" />
                      <SpiralSporeChain x={f.tip[0]} y={f.tip[1]} len={66} p={gp} rot={(i - 6) * 6} />
                      <SpiralSporeChain x={f.branchTip[0]} y={f.branchTip[1]} len={44} p={clamp01(gp * 1.6 - 0.5)} rot={(i - 3) * 9} r={4.2} color="#E4C895" />
                    </g>
                  );
                })}
              </g>

              {/* drought: agar dries & splits */}
              {drought > 0.02 && (
                <g opacity={clamp01(drought * 1.4)}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const a = (i / 5) * Math.PI * 2 + 0.9;
                    const pts: string[] = [];
                    for (let k = 0; k < 5; k++) {
                      const rad = R * (0.94 - k * 0.17);
                      const aa = a + Math.sin(k * 1.7 + i) * 0.12;
                      pts.push(`${k === 0 ? 'M' : 'L'} ${cx + Math.cos(aa) * rad},${cy + Math.sin(aa) * rad}`);
                    }
                    return <path key={i} d={pts.join(' ')} fill="none" stroke="rgba(24, 14, 6, 0.5)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />;
                  })}
                  <circle cx={cx} cy={cy} r={R - 12} fill="rgba(64, 44, 26, 0.28)" />
                </g>
              )}

              {/* geosmin frost blooming out of the dying colony */}
              {bloom > 0.01 && (
                <g>
                  {Array.from({ length: 9 }).map((_, i) => {
                    const a = (i / 9) * Math.PI * 2 + 0.9;
                    const rad = 70 + (i % 4) * 96;
                    return (
                      <FrostCrystal
                        key={i}
                        x={cx + Math.cos(a) * rad}
                        y={cy + Math.sin(a) * rad}
                        size={38 + (i % 3) * 26}
                        p={clamp01(bloom * 1.6 - i * 0.06)}
                        rot={i * 23}
                      />
                    );
                  })}
                </g>
              )}
            </g>

            {/* glass rim: double machined edge with specular run */}
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(206, 190, 160, 0.5)" strokeWidth={16} />
            <circle cx={cx} cy={cy} r={R - 10} fill="none" stroke="rgba(255, 250, 232, 0.22)" strokeWidth={1.6} />
            <circle cx={cx} cy={cy} r={R + 5} fill="none" stroke="rgba(30, 22, 14, 0.85)" strokeWidth={2} />
            <path
              d={`M ${cx - R * 0.86},${cy - R * 0.6} A ${R} ${R} 0 0 1 ${cx + R * 0.34},${cy - R * 0.94}`}
              fill="none"
              stroke="rgba(255, 250, 236, 0.6)"
              strokeWidth={4}
              strokeLinecap="round"
            />
          </g>

          {/* engraved brass tag clipped to the rim */}
          <g transform={`translate(${cx + 168}, ${cy + R - 152}) rotate(-3.4)`}>
            <rect x={0} y={0} width={392} height={68} rx={3} fill="#2B2216" stroke={art.accent} strokeWidth={1.6} />
            <rect x={5} y={5} width={382} height={58} fill="none" stroke="rgba(232, 208, 158, 0.28)" strokeWidth={0.8} />
            {plate && <image href={plate} x={5} y={5} width={382} height={58} opacity={0.28} preserveAspectRatio="none" />}
            <Mono x={20} y={29} text="C₁₂H₂₂O" size={22} color="#F4E6C6" tracking={0.1} />
            <Mono x={20} y={52} text="GEOSMIN · ALKOHOL BISIKLIK" size={13} color="rgba(228, 206, 162, 0.7)" tracking={0.14} weight={400} />
            <circle cx={356} cy={34} r={13} fill="none" stroke="rgba(232, 208, 158, 0.5)" strokeWidth={1.2} />
            <circle cx={356} cy={34} r={3} fill="rgba(232, 208, 158, 0.8)" />
          </g>
        </g>

        {/* ---------------- scale bar attached under the plate --------------- */}
        <g opacity={easeOutCubic(prog(localSec, 0.9, 2.0))}>
          <RuleLine x1={cx - 116} y1={cy + R - 52} x2={cx + 116} y2={cy + R - 52} color="rgba(240, 232, 210, 0.86)" width={2.2} />
          <RuleLine x1={cx - 116} y1={cy + R - 62} x2={cx - 116} y2={cy + R - 42} color="rgba(240, 232, 210, 0.86)" width={2.2} />
          <RuleLine x1={cx + 116} y1={cy + R - 62} x2={cx + 116} y2={cy + R - 42} color="rgba(240, 232, 210, 0.86)" width={2.2} />
          <Mono x={cx} y={cy + R - 22} text="PERBESARAN 1.200× · 10 MIKROMETER" size={15} color="rgba(236, 226, 204, 0.82)" anchor="middle" tracking={0.16} />
        </g>

        {/* ---------------- scientific name set in a living serif ---------- */}
        <g>
          <InkReveal x={84} y={1566} p={nameIn} dir="up" pad={10}>
            <text x={84} y={1690} fill={art.ink} fontFamily={IDENTITY.fontInstrument} fontStyle="italic" fontSize={124} letterSpacing="-0.02em">
              Streptomyces
            </text>
          </InkReveal>
          <g opacity={easeOutCubic(prog(globalSec, 31.0, 32.2))}>
            <RuleLine x1={92} y1={1734} x2={92 + 620 * easeOutCubic(prog(globalSec, 31.0, 32.4))} y2={1734} color="rgba(206, 190, 160, 0.36)" />
            <Mono x={92} y={1776} text="BAKTERI BENANG · PENGHASIL 2/3 ANTIBIOTIK DUNIA" size={17} color="rgba(222, 212, 190, 0.7)" tracking={0.14} />
          </g>
        </g>

        {/* ---------------- plate annotation lines ------------------------- */}
        <g opacity={easeOutCubic(prog(globalSec, 34.4, 35.6))}>
          <LeaderLabel from={[cx + 232, cy - 322]} to={[cx + 430, cy - 470]} text="RANTAI SPORA" sub="TERTAHAN DI UJUNG HIFA" color="rgba(232, 218, 190, 0.7)" size={16} dot={art.accent} />
          <LeaderLabel from={[cx - 300, cy + 232]} to={[cx - 520, cy + 330]} text="KOLONI TANAH" sub="TERANCAM KERING" color="rgba(232, 218, 190, 0.7)" size={16} dot={art.accent} anchor="end" />
        </g>

        <VapourWisps x={cx + 60} y={cy - 120} p={vapour} count={5} height={420} color="rgba(236, 212, 164, 0.4)" />
      </svg>

      <FilmGrain opacity={0.15} />
    </AbsoluteFill>
  );
};

// ============================================================================
// 9. SCENE 04 — "SPREAD EDITORIAL": TWO PRINTED LEAVES ON A WALNUT TABLE
// ============================================================================

const PlasterNose: React.FC<{ x: number; y: number; s: number; p: number; uid: string }> = ({ x, y, s, p, uid }) => {
  const outline =
    'M 300,0 L 252,0 C 244,34 236,58 228,78 C 220,96 210,104 204,118 C 198,134 194,152 186,170 C 176,192 156,206 148,222 C 142,234 148,244 162,246 C 174,248 182,244 190,240 C 186,252 176,262 160,268 C 150,272 146,282 154,288 C 140,296 136,310 148,318 C 138,330 140,346 152,354 C 146,372 156,390 174,398 C 200,410 246,416 300,418 Z';

  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <defs>
        <clipPath id={`${uid}-face`}>
          <path d={outline} />
        </clipPath>
        <linearGradient id={`${uid}-plaster`} x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#FAF3E2" />
          <stop offset="46%" stopColor="#EADFC6" />
          <stop offset="100%" stopColor="#BDA98A" />
        </linearGradient>
        <linearGradient id={`${uid}-scent`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(158, 59, 42, 0)" />
          <stop offset="100%" stopColor="rgba(158, 59, 42, 0.8)" />
        </linearGradient>
      </defs>

      {/* cast shadow of the plaster relief */}
      <ellipse cx={186} cy={430} rx={112} ry={14} fill="rgba(52, 38, 22, 0.2)" />

      {/* the relief itself */}
      <path d={outline} fill={`url(#${uid}-plaster)`} stroke="rgba(74, 58, 38, 0.5)" strokeWidth={1.8} />

      <g clipPath={`url(#${uid}-face)`}>
        {/* modelling shadow to the right of the profile */}
        <path d="M 300,0 L 300,418 L 196,410 C 214,352 224,300 226,244 C 228,186 246,110 300,0 Z" fill="rgba(96, 74, 46, 0.16)" />
        <path d="M 208,120 C 236,150 244,210 232,268 C 224,320 232,364 262,392" fill="none" stroke="rgba(120, 96, 62, 0.22)" strokeWidth={2.4} />
        <ellipse cx={166} cy={208} rx={30} ry={64} fill="rgba(255, 252, 240, 0.5)" />
        <ellipse cx={158} cy={252} rx={22} ry={30} fill="rgba(255, 252, 240, 0.38)" />

        {/* engraved hatching, denser where the light falls away */}
        {Array.from({ length: 52 }).map((_, i) => {
          const yy = 6 + i * 8;
          return (
            <line key={i} x1={214 + (i % 6) * 4} y1={yy} x2={300} y2={yy - 22} stroke="rgba(84, 64, 38, 0.11)" strokeWidth={1 + (i % 3) * 0.3} />
          );
        })}
        {Array.from({ length: 26 }).map((_, i) => (
          <line key={`c${i}`} x1={128 + (i % 5) * 3} y1={300 + i * 4} x2={214} y2={296 + i * 4} stroke="rgba(96, 74, 46, 0.1)" strokeWidth={0.9} />
        ))}

        {/* brow, eye socket, cheek, mouth, chin */}
        <path d="M 196,112 C 214,100 236,104 246,118" fill="none" stroke="rgba(96, 72, 44, 0.34)" strokeWidth={3} strokeLinecap="round" />
        <path d="M 206,132 C 220,124 236,126 244,136 C 236,146 218,148 208,140 Z" fill="rgba(92, 70, 42, 0.16)" />
        <path d="M 158,236 C 168,240 180,240 188,236" fill="none" stroke="rgba(60, 42, 24, 0.55)" strokeWidth={2} strokeLinecap="round" />
        <ellipse cx={166} cy={236} rx={9} ry={4.4} fill="rgba(52, 36, 20, 0.62)" transform="rotate(-14 166 236)" />
        <path d="M 150,288 C 172,290 196,294 214,300" fill="none" stroke="rgba(120, 78, 58, 0.44)" strokeWidth={2.4} strokeLinecap="round" />
        <path d="M 146,314 C 166,314 188,316 204,320" fill="none" stroke="rgba(120, 78, 58, 0.3)" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M 152,352 C 168,352 184,354 198,358" fill="none" stroke="rgba(120, 78, 58, 0.24)" strokeWidth={1.6} strokeLinecap="round" />
      </g>

      {/* scent ribbons reaching into the nostril */}
      {[0, 1, 2].map((i) => {
        const p2 = clamp01((p - i * 0.07) * 1.25);
        return (
          <path
            key={i}
            d={`M ${-170 - i * 22},${200 + i * 26} C ${-80},${186 + i * 28} ${20},${224 + i * 14} ${160},${232 + i * 3}`}
            fill="none"
            stroke={`url(#${uid}-scent)`}
            strokeWidth={2.4 - i * 0.4}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - p2}
            opacity={0.85}
          />
        );
      })}

      {/* receptor cluster & its caption */}
      <g opacity={clamp01(p * 1.4)}>
        {Array.from({ length: 9 }).map((_, i) => (
          <circle key={i} cx={176 + (i % 3) * 8} cy={228 + Math.floor(i / 3) * 8} r={2.2} fill="#9E3B2A" />
        ))}
        <line x1={212} y1={236} x2={268} y2={206} stroke="rgba(158, 59, 42, 0.55)" strokeWidth={1.1} />
        <text x={274} y={204} fill="#9E3B2A" fontFamily={IDENTITY.fontMono} fontSize={16} fontWeight={600} letterSpacing="0.1em">
          OR4D2
        </text>
      </g>
    </g>
  );
};

const EngravedShark: React.FC<{ x: number; y: number; s: number; p: number; uid: string }> = ({ x, y, s, p, uid }) => {
  const body =
    'M 40,150 C 130,96 300,74 430,86 C 512,94 566,116 604,140 C 566,168 508,186 430,192 C 300,204 130,190 40,150 Z';
  const g = easeOutCubic(clamp01(p));
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} opacity={0.45 + g * 0.55}>
      <defs>
        <clipPath id={`${uid}-shark`}>
          <path d={body} />
        </clipPath>
        <linearGradient id={`${uid}-sharkfill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#42545A" />
          <stop offset="54%" stopColor="#66797C" />
          <stop offset="56%" stopColor="#C6CDCB" />
          <stop offset="100%" stopColor="#EDE7D6" />
        </linearGradient>
      </defs>

      {/* caudal & dorsal fins drawn as engraved plates */}
      <path d="M 62,150 L -34,74 C -6,116 2,136 12,150 C 2,164 -6,186 -26,222 Z" fill="#5C6D72" stroke="rgba(40, 34, 26, 0.7)" strokeWidth={1.6} />
      <path d="M 286,96 L 330,18 C 344,50 356,74 372,94 Z" fill="#5C6D72" stroke="rgba(40, 34, 26, 0.7)" strokeWidth={1.6} />
      <path d="M 300,190 L 246,266 C 288,246 324,222 350,196 Z" fill="#4E5F66" stroke="rgba(40, 34, 26, 0.7)" strokeWidth={1.6} />

      <path d={body} fill={`url(#${uid}-sharkfill)`} stroke="rgba(40, 34, 26, 0.8)" strokeWidth={2} />
      <g clipPath={`url(#${uid}-shark)`}>
        {/* fine engraving hatch following the fish */}
        {Array.from({ length: 64 }).map((_, i) => {
          const yy = 76 + i * 1.9;
          return <line key={i} x1={20} y1={yy} x2={610} y2={yy - 26} stroke="rgba(28, 24, 18, 0.3)" strokeWidth={0.9} />;
        })}
        {Array.from({ length: 26 }).map((_, i) => {
          const xx = 60 + i * 21;
          return <line key={`v${i}`} x1={xx} y1={80} x2={xx - 10} y2={196} stroke="rgba(28, 24, 18, 0.16)" strokeWidth={0.7} />;
        })}
        {/* copperplate sheen */}
        <ellipse cx={300} cy={128} rx={210} ry={34} fill="rgba(255, 250, 236, 0.22)" />
      </g>

      {/* gills, eye, mouth, teeth */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={402 + i * 12} y1={116} x2={396 + i * 12} y2={172} stroke="#2C3438" strokeWidth={2} strokeLinecap="round" />
      ))}
      <circle cx={534} cy={132} r={7} fill="#1D2427" stroke="#EFE7D4" strokeWidth={1.6} />
      <circle cx={531} cy={129} r={2.2} fill="rgba(255,255,255,0.7)" />
      <path d="M 574,158 C 590,160 598,164 604,168" fill="none" stroke="rgba(40, 34, 26, 0.7)" strokeWidth={2} />
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M ${566 + i * 6},${158 + i * 1.4} l 4,7 l 3,-7`} fill="none" stroke="rgba(40, 34, 26, 0.55)" strokeWidth={1} />
      ))}

      {/* blood trace + ripple of scent */}
      <circle cx={646} cy={150} r={5} fill="#9E3B2A" opacity={g} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={646} cy={150} r={16 + i * 22 + ((p * 40) % 20)} fill="none" stroke="rgba(158, 59, 42, 0.34)" strokeWidth={1.2} opacity={g} />
      ))}
    </g>
  );
};

export const Scene04SpreadEditorial: React.FC = () => {
  const { art, localSec, globalSec } = useChapterClock(3);
  const paperTex = useTex('rice-paper');

  const open = easeOutExpo(prog(globalSec, 42.9, 44.4));
  const noseIn = prog(globalSec, 43.6, 47.0);
  const sharkIn = prog(globalSec, 53.3, 55.4);
  const flip = easeInOutCubic(prog(globalSec, 53.0, 54.6));
  const tint = clamp01(prog(globalSec, 53.4, 55.0));

  const pageW = 596;
  const pageH = 1258;
  const leftX = 96 - (1 - open) * 260;
  const rightX = 748 + (1 - open) * 260;
  const drift = 1.012 + smoothstep(clamp01(localSec / 16.7)) * 0.02;

  return (
    <AbsoluteFill>
      <Backdrop
        top="#171310"
        bottom={art.paper}
        tex="walnut"
        texOpacity={0.42}
        light={{ x: 520, y: 420, rx: 900, ry: 780, color: 'rgba(226, 190, 136, 0.2)', strength: 1 }}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(720, 1200) scale(${drift}) translate(-720, -1200)`}>
          {/* table shadow pool */}
          <defs>
            <radialGradient id="s4-pool" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.46)" />
              <stop offset="70%" stopColor="rgba(0,0,0,0.18)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>
          <ellipse cx={720} cy={1760} rx={720} ry={150} fill="url(#s4-pool)" />

          {/* -------------------- LEFT LEAF -------------------- */}
          <g transform={`translate(${leftX}, ${430 + (1 - open) * 40}) rotate(-1.5)`}>
            <rect x={0} y={0} width={pageW} height={pageH} fill="#EFE6D2" />
            {paperTex && <image href={paperTex} x={0} y={0} width={pageW} height={pageH} opacity={0.6} preserveAspectRatio="none" />}
            {/* printed header */}
            <Mono x={46} y={72} text="LEMBAR SATU — PENCIUMAN" size={16} color="rgba(60, 50, 36, 0.6)" tracking={0.22} weight={400} />
            <RuleLine x1={46} y1={94} x2={pageW - 46} y2={94} color="rgba(60, 50, 36, 0.4)" width={1.6} />
            <text x={44} y={190} fill="#231D15" fontFamily={IDENTITY.fontInstrument} fontStyle="italic" fontSize={74} letterSpacing="-0.02em">
              Lima bagian
            </text>
            <text x={44} y={266} fill="#231D15" fontFamily={IDENTITY.fontInstrument} fontStyle="italic" fontSize={74} letterSpacing="-0.02em">
              per triliun
            </text>
            <Mono x={46} y={310} text="AMBANG BAU GEOSMIN PADA MANUSIA" size={15} color="rgba(60, 50, 36, 0.66)" tracking={0.14} weight={400} />

            {/* letterpress numeral */}
            <text x={pageW - 46} y={1136} textAnchor="end" fill="#9E3B2A" fontFamily={IDENTITY.fontDisplay} fontSize={104} letterSpacing="0.01em">
              5 PPT
            </text>

            {/* plaster relief */}
            <PlasterNose x={112} y={368} s={0.98} p={noseIn} uid="s4-nose" />

            {/* footnotes, set as real editorial columns */}
            <RuleLine x1={46} y1={986} x2={pageW - 46} y2={986} color="rgba(60, 50, 36, 0.32)" />
            <text x={46} y={1028} fill="#3A3128" fontFamily={IDENTITY.fontBody} fontSize={23} fontWeight={500}>
              Satu sendok teh geosmin
            </text>
            <text x={46} y={1062} fill="#4A4034" fontFamily={IDENTITY.fontBody} fontSize={23} fontWeight={500}>
              di 400 kolam renang Olimpiade
            </text>
            <text x={46} y={1186} fill="rgba(58, 49, 40, 0.62)" fontFamily={IDENTITY.fontMono} fontSize={14} letterSpacing="0.1em">
              BEAR &amp; THOMAS · NATURE 1964
            </text>
            <Mono x={pageW - 46} y={1186} text="1 MILIAR LITER" size={14} color="rgba(58, 49, 40, 0.5)" anchor="end" tracking={0.12} weight={400} />

            {/* page edge highlight */}
            <rect x={0} y={0} width={pageW} height={pageH} fill="none" stroke="rgba(80, 64, 44, 0.3)" strokeWidth={1.4} />
            <rect x={pageW - 26} y={0} width={26} height={pageH} fill="url(#s4-pageShade)" opacity={0.5} />
          </g>

          {/* -------------------- RIGHT LEAF -------------------- */}
          <defs>
            <linearGradient id="s4-pageShade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(60, 48, 32, 0)" />
              <stop offset="100%" stopColor="rgba(60, 48, 32, 0.5)" />
            </linearGradient>
            <linearGradient id="s4-pageShadeL" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(60, 48, 32, 0)" />
              <stop offset="100%" stopColor="rgba(60, 48, 32, 0.5)" />
            </linearGradient>
          </defs>

          <g transform={`translate(${rightX}, ${430 + (1 - open) * 40}) rotate(1.2)`}>
            <rect x={0} y={0} width={pageW} height={pageH} fill="#EFE6D2" />
            {paperTex && <image href={paperTex} x={0} y={0} width={pageW} height={pageH} opacity={0.6} preserveAspectRatio="none" />}
            <rect x={0} y={0} width={26} height={pageH} fill="url(#s4-pageShadeL)" opacity={0.5} />

            <g opacity={clamp01(1 - tint * 1.55)}>
              <Mono x={46} y={72} text="LEMBAR DUA — PEMBANDING LAUT" size={16} color="rgba(60, 50, 36, 0.6)" tracking={0.22} weight={400} />
              <RuleLine x1={46} y1={94} x2={pageW - 46} y2={94} color="rgba(60, 50, 36, 0.4)" width={1.6} />
              <text x={44} y={186} fill="#231D15" fontFamily={IDENTITY.fontInstrument} fontStyle="italic" fontSize={68} letterSpacing="-0.02em">
                Hiu mencium
              </text>
              <text x={44} y={254} fill="#231D15" fontFamily={IDENTITY.fontInstrument} fontStyle="italic" fontSize={68} letterSpacing="-0.02em">
                setetes darah
              </text>
              <text x={pageW - 46} y={344} textAnchor="end" fill="#9E3B2A" fontFamily={IDENTITY.fontDisplay} fontSize={86}>
                1 PPM
              </text>

              <EngravedShark x={-6} y={420} s={0.86} p={sharkIn} uid="s4-shark" />

              <RuleLine x1={46} y1={812} x2={pageW - 46} y2={812} color="rgba(60, 50, 36, 0.3)" />
              <text x={44} y={860} fill="#3A3128" fontFamily={IDENTITY.fontBody} fontSize={23} fontWeight={500}>
                Satu bagian per juta —
              </text>
              <text x={44} y={894} fill="#4A4034" fontFamily={IDENTITY.fontBody} fontSize={23} fontWeight={500}>
                200.000 kali lebih pekat
              </text>
              <text x={44} y={928} fill="#4A4034" fontFamily={IDENTITY.fontBody} fontSize={23} fontWeight={500}>
                daripada ambang geosmin.
              </text>

              {/* engraved caption block, mimicking an old naturalist plate */}
              <g opacity={0.9}>
                <RuleLine x1={46} y1={988} x2={pageW - 46} y2={988} color="rgba(60, 50, 36, 0.26)" />
                <Mono x={46} y={1018} text="CARCHARODON CARCHARIAS" size={15} color="rgba(58, 49, 40, 0.62)" tracking={0.16} weight={400} />
                <Mono x={pageW - 46} y={1018} text="PLATE VII" size={15} color="rgba(58, 49, 40, 0.62)" anchor="end" tracking={0.16} weight={400} />
              </g>
              <Mono x={46} y={1216} text="GRAVURE · SELEMBAR KERTAS · TINTA BESI" size={13} color="rgba(58, 49, 40, 0.42)" tracking={0.12} weight={400} />
            </g>

            {/* the reversal: our nose beats the shark by five orders of magnitude */}
            <g opacity={tint * tint * (3 - 2 * tint)} transform={`translate(0, ${(1 - tint) * 50})`}>
              <Mono x={46} y={72} text="KESIMPULAN TAKARAN" size={16} color="rgba(60, 50, 36, 0.62)" tracking={0.22} weight={400} />
              <RuleLine x1={46} y1={94} x2={pageW - 46} y2={94} color="rgba(60, 50, 36, 0.4)" width={1.6} />
              <text x={40} y={282} fill="#231D15" fontFamily={IDENTITY.fontDisplay} fontSize={188} letterSpacing="-0.01em">
                200.000
              </text>
              <text x={46} y={330} fill="#9E3B2A" fontFamily={IDENTITY.fontInstrument} fontStyle="italic" fontSize={72}>
                kali lebih tajam
              </text>
              <text x={46} y={404} fill="#3A3128" fontFamily={IDENTITY.fontBody} fontSize={26} fontWeight={600}>
                Hidung kita menangkap geosmin
              </text>
              <text x={46} y={440} fill="#4A4034" fontFamily={IDENTITY.fontBody} fontSize={26} fontWeight={500}>
                pada 5 bagian per triliun.
              </text>

              {/* tiny shark silhouette for scale, drawn as a woodcut */}
              <g transform="translate(360, 470) scale(0.34)" opacity={0.9}>
                <path
                  d="M 40,150 C 130,96 300,74 430,86 C 512,94 566,116 604,140 C 566,168 508,186 430,192 C 300,204 130,190 40,150 Z"
                  fill="#2A241B"
                />
                <path d="M 62,150 L -34,74 C -6,116 2,136 12,150 C 2,164 -6,186 -26,222 Z" fill="#2A241B" />
                <path d="M 286,96 L 330,18 C 344,50 356,74 372,94 Z" fill="#2A241B" />
              </g>
              <Mono x={46} y={700} text="SKALA PEMBANDING · HIU PUTIH BESAR" size={14} color="rgba(58, 49, 40, 0.5)" tracking={0.12} weight={400} />

              <RuleLine x1={46} y1={830} x2={pageW - 46} y2={830} color="rgba(60, 50, 36, 0.3)" />
              <text x={44} y={886} fill="#3A3128" fontFamily={IDENTITY.fontBody} fontSize={24} fontWeight={500}>
                Bagi hidung manusia,
              </text>
              <text x={44} y={922} fill="#4A4034" fontFamily={IDENTITY.fontBody} fontSize={24} fontWeight={500}>
                gerimis adalah peta.
              </text>
              <Mono x={46} y={1216} text="GEOSMIN · C₁₂H₂₂O · AMBANG 5 PPT" size={13} color="rgba(58, 49, 40, 0.42)" tracking={0.12} weight={400} />
              <g transform="translate(46, 1080) rotate(-5)">
                <rect x={0} y={0} width={252} height={64} fill="none" stroke="#9E3B2A" strokeWidth={3.4} />
                <text x={126} y={43} textAnchor="middle" fill="#9E3B2A" fontFamily={IDENTITY.fontMono} fontSize={22} fontWeight={600} letterSpacing="0.14em">
                  REKOR HIDUNG
                </text>
              </g>
            </g>

            <rect x={0} y={0} width={pageW} height={pageH} fill="none" stroke="rgba(80, 64, 44, 0.3)" strokeWidth={1.4} />
          </g>

          {/* -------------------- GUTTER: vertical title --------------------- */}
          <g opacity={open}>
            <line x1={718} y1={470} x2={718} y2={1640} stroke="rgba(214, 198, 168, 0.2)" strokeWidth={1.2} />
            <g transform="translate(714, 1055) rotate(-90)">
              <Mono x={0} y={0} text="SATU MOLEKUL · DUA HIDUNG" size={17} color="rgba(226, 214, 190, 0.6)" tracking={0.34} anchor="middle" />
            </g>
            <g transform="translate(722, 1360) rotate(-90)">
              <Mono x={0} y={0} text="C₁₂H₂₂O" size={15} color="rgba(226, 214, 190, 0.4)" tracking={0.24} anchor="middle" weight={400} />
            </g>
          </g>
        </g>

        {/* top marginalia, set above the leaves like a book running head */}
        <g opacity={easeOutCubic(prog(localSec, 0.4, 1.6))}>
          <Mono x={96} y={300} text="CATATAN PENCIUMAN" size={18} color="rgba(214, 200, 172, 0.6)" tracking={0.34} />
          <RuleLine x1={96} y1={320} x2={372} y2={320} color="rgba(206, 192, 164, 0.32)" />
          <Mono x={1344} y={300} text="GEOSMIN · AMBANG BAU" size={16} color="rgba(214, 200, 172, 0.5)" tracking={0.22} anchor="end" weight={400} />
        </g>
      </svg>

      <FilmGrain opacity={0.12} />
    </AbsoluteFill>
  );
};
