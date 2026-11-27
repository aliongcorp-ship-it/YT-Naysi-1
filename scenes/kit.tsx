import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CHAPTER_ART, CHAPTERS, IDENTITY, clamp01, easeOutCubic, prog, smoothstep } from './script';

// ============================================================================
// 1. MATH & RANDOM — deterministic, frame-safe
// ============================================================================

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const easeInOutSine = (x: number): number => -(Math.cos(Math.PI * clamp01(x)) - 1) / 2;
export const easeOutBack = (x: number): number => {
  const c = clamp01(x);
  const s = 1.70158;
  return 1 + (s + 1) * Math.pow(c - 1, 3) + s * Math.pow(c - 1, 2);
};

export const hash2 = (a: number, b: number, c = 0): number => {
  const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return v - Math.floor(v);
};

export const makeRng = (seed: number): (() => number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

export const noise2 = (x: number, y: number): number => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
};

export const fbm = (x: number, y: number, octaves = 4): number => {
  let value = 0;
  let amp = 0.5;
  let fx = x;
  let fy = y;
  for (let i = 0; i < octaves; i++) {
    value += noise2(fx, fy) * amp;
    fx *= 2.02;
    fy *= 2.02;
    amp *= 0.5;
  }
  return value;
};

// ============================================================================
// 2. PROCEDURAL MATERIAL LIBRARY — real surfaces, generated once per tab
// ============================================================================

export type TexKind =
  | 'paper-fibre'
  | 'wall-plaster'
  | 'walnut'
  | 'brass-brushed'
  | 'steel-brushed'
  | 'felt-green'
  | 'skin-pore'
  | 'ink-wash'
  | 'oxide-rust'
  | 'concrete'
  | 'mylar-tape'
  | 'glass-mist';

const texCache = new Map<TexKind, string>();

const paintTexture = (kind: TexKind): string => {
  const S = 512;
  const cv = document.createElement('canvas');
  cv.width = S;
  cv.height = S;
  const g = cv.getContext('2d');
  if (!g) return '';
  const img = g.createImageData(S, S);
  const d = img.data;

  const palette: Record<TexKind, [number, number, number, number, number, number]> = {
    // base rgb, variation amplitude, grain
    'paper-fibre': [232, 223, 203, 14, 0.5, 0],
    'wall-plaster': [126, 118, 104, 20, 0.7, 0],
    walnut: [74, 48, 30, 26, 0.6, 0],
    'brass-brushed': [168, 132, 74, 22, 0.9, 0],
    'steel-brushed': [118, 126, 130, 16, 0.9, 0],
    'felt-green': [32, 48, 38, 12, 1, 0],
    'skin-pore': [196, 152, 118, 16, 0.8, 0],
    'ink-wash': [64, 56, 46, 30, 0.5, 0],
    'oxide-rust': [116, 62, 38, 30, 0.8, 0],
    concrete: [118, 114, 106, 18, 0.7, 0],
    'mylar-tape': [86, 52, 36, 18, 0.5, 0],
    'glass-mist': [186, 198, 196, 12, 0.6, 0],
  };
  const [br, bg, bb, amp, grain] = palette[kind];

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S;
      const v = y / S;
      let n = fbm(u * 6, v * 6, 4);
      if (kind === 'walnut' || kind === 'mylar-tape') {
        // stretched wood / tape grain
        n = fbm(u * 2.2, v * 26, 3) * 0.72 + fbm(u * 18, v * 2, 2) * 0.28;
      }
      if (kind === 'brass-brushed' || kind === 'steel-brushed') {
        n = fbm(u * 1.2, v * 90, 2) * 0.6 + fbm(u * 24, v * 3, 2) * 0.4;
      }
      if (kind === 'paper-fibre') {
        n = fbm(u * 9, v * 9, 3) * 0.6 + (hash2(x, y) > 0.82 ? 0.35 : 0) * 0.5;
      }
      if (kind === 'skin-pore') {
        const pore = hash2(x * 3, y * 3) > 0.94 ? -0.4 : 0;
        n = fbm(u * 14, v * 14, 3) * 0.7 + pore;
      }
      const g2 = grain * (hash2(x * 7, y * 13) - 0.5) * 26;
      const delta = (n - 0.5) * amp * 2 + g2;
      const i = (y * S + x) * 4;
      d[i] = Math.max(0, Math.min(255, br + delta));
      d[i + 1] = Math.max(0, Math.min(255, bg + delta));
      d[i + 2] = Math.max(0, Math.min(255, bb + delta));
      d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return cv.toDataURL('image/png');
};

export const useTex = (kind: TexKind): string => {
  return useMemo(() => {
    const hit = texCache.get(kind);
    if (hit) return hit;
    const made = paintTexture(kind);
    texCache.set(kind, made);
    return made;
  }, [kind]);
};

// ============================================================================
// 3. ATMOSPHERE
// ============================================================================

export const Backdrop: React.FC<{
  top: string;
  bottom: string;
  tex?: TexKind;
  texOpacity?: number;
  light?: { x: number; y: number; rx: number; ry: number; color: string; strength?: number };
  vignette?: number;
}> = ({ top, bottom, tex, texOpacity = 0.4, light, vignette = 0.36 }) => {
  const url = useTex(tex ?? 'concrete');
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(176deg, ${top} 0%, ${bottom} 100%)` }} />
      {tex && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${url})`,
            backgroundSize: '720px 720px',
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
            background: `radial-gradient(${light.rx}px ${light.ry}px at ${light.x}px ${light.y}px, ${light.color}, rgba(0,0,0,0) 72%)`,
            opacity: light.strength ?? 1,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(1200px 1500px at 50% 42%, rgba(0,0,0,0) 38%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const FilmGrain: React.FC<{ opacity?: number; scale?: number }> = ({ opacity = 0.16, scale = 200 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 7;
  return (
    <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <filter id={`grain-${seed}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={1 / scale} numOctaves={2} seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width={1440} height={2560} filter={`url(#grain-${seed})`} opacity={opacity} style={{ mixBlendMode: 'overlay' }} />
    </svg>
  );
};

export const DustMotes: React.FC<{
  count?: number;
  seed?: number;
  color?: string;
  y0?: number;
  y1?: number;
  drift?: number;
}> = ({ count = 40, seed = 1, color = 'rgba(240, 226, 198, 0.5)', y0 = 100, y1 = 2400, drift = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / 90;
  return (
    <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: count }).map((_, i) => {
        const gx = hash2(i, seed, 3) * 1440;
        const gy = y0 + hash2(i, seed, 7) * (y1 - y0);
        const sp = 6 + hash2(i, seed, 11) * 22;
        const px = (gx + t * sp * drift + Math.sin(t * 0.6 + i) * 16) % 1440;
        const py = (gy - t * sp * 0.35 * drift + 2600) % 2600;
        const r = 0.9 + hash2(i, seed, 13) * 2.2;
        return <circle key={i} cx={px} cy={py} r={r} fill={color} opacity={0.25 + hash2(i, seed, 17) * 0.6} />;
      })}
    </svg>
  );
};

// soft elliptical shadow pool under a physical object
export const ShadowPool: React.FC<{ cx: number; cy: number; rx: number; ry: number; opacity?: number }> = ({
  cx,
  cy,
  rx,
  ry,
  opacity = 0.5,
}) => (
  <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <radialGradient id={`pool-${Math.round(cx)}-${Math.round(cy)}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={`rgba(0,0,0,${opacity})`} />
        <stop offset="62%" stopColor={`rgba(0,0,0,${opacity * 0.44})`} />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
    </defs>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#pool-${Math.round(cx)}-${Math.round(cy)})`} />
  </svg>
);

// ============================================================================
// 4. TYPE SYSTEM
// ============================================================================

export const Mono: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  tracking?: number;
  anchor?: 'start' | 'middle' | 'end';
  weight?: 400 | 500 | 600;
  opacity?: number;
}> = ({ x, y, text, size = 16, color = '#EFE7D6', tracking = 0.2, anchor = 'start', weight = 500, opacity = 1 }) => (
  <text
    x={x}
    y={y}
    fill={color}
    fontFamily={IDENTITY.fontMono}
    fontSize={size}
    fontWeight={weight}
    letterSpacing={`${tracking}em`}
    textAnchor={anchor}
    opacity={opacity}
  >
    {text}
  </text>
);

export const RuleLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  width?: number;
  dash?: string;
}> = ({ x1, y1, x2, y2, color = 'rgba(230, 218, 196, 0.3)', width = 1.4, dash }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
);

export const LeaderLabel: React.FC<{
  from: [number, number];
  to: [number, number];
  text: string;
  sub?: string;
  color?: string;
  size?: number;
  dot?: string;
  anchor?: 'start' | 'end';
  progress?: number;
}> = ({ from, to, text, sub, color = 'rgba(236, 224, 198, 0.78)', size = 16, dot = '#C9A45C', anchor = 'start', progress = 1 }) => {
  const p = clamp01(progress);
  const ex = lerp(from[0], to[0], easeOutCubic(p));
  const ey = lerp(from[1], to[1], easeOutCubic(p));
  const right = anchor === 'start';
  return (
    <g opacity={clamp01(p * 1.6)}>
      <line x1={from[0]} y1={from[1]} x2={ex} y2={ey} stroke={color} strokeWidth={1.1} opacity={0.62} />
      <circle cx={from[0]} cy={from[1]} r={3.4} fill={dot} />
      <circle cx={from[0]} cy={from[1]} r={7} fill="none" stroke={dot} strokeWidth={1} opacity={0.5} />
      {p > 0.92 && (
        <g>
          <text
            x={to[0] + (right ? 12 : -12)}
            y={to[1] + 5}
            fill={color}
            fontFamily={IDENTITY.fontMono}
            fontSize={size}
            fontWeight={500}
            letterSpacing="0.16em"
            textAnchor={right ? 'start' : 'end'}
          >
            {text}
          </text>
          {sub && (
            <text
              x={to[0] + (right ? 12 : -12)}
              y={to[1] + 27}
              fill="rgba(226, 214, 188, 0.5)"
              fontFamily={IDENTITY.fontMono}
              fontSize={size - 4}
              letterSpacing="0.1em"
              textAnchor={right ? 'start' : 'end'}
            >
              {sub}
            </text>
          )}
        </g>
      )}
    </g>
  );
};

// headline that wipes in from its baseline, letter-spacing tightening as it lands
export const InkReveal: React.FC<{
  x: number;
  y: number;
  text: string;
  size: number;
  color: string;
  family?: string;
  italic?: boolean;
  weight?: number;
  p: number;
  anchor?: 'start' | 'middle' | 'end';
  tracking?: number;
}> = ({ x, y, text, size, color, family, italic, weight = 500, p, anchor = 'start', tracking = -0.02 }) => {
  const k = easeOutCubic(clamp01(p));
  return (
    <text
      x={x}
      y={y}
      fill={color}
      fontFamily={family ?? IDENTITY.fontGrotesk}
      fontStyle={italic ? 'italic' : 'normal'}
      fontWeight={weight}
      fontSize={size}
      letterSpacing={`${tracking + (1 - k) * 0.03}em`}
      textAnchor={anchor}
      opacity={clamp01(k * 1.4)}
    >
      {text}
    </text>
  );
};

// ============================================================================
// 5. CLOCK
// ============================================================================

export const useChapterClock = (index: number) => {
  const frame = useCurrentFrame();
  const localSec = frame / 90;
  const ch = CHAPTERS[index];
  return {
    ch,
    art: CHAPTER_ART[index],
    localSec,
    globalSec: ch.start + localSec,
    dur: ch.end - ch.start,
  };
};

// a camera that drifts and pushes: the whole frame is never static
export const Camera: React.FC<{ children: React.ReactNode; localSec: number; dur: number; push?: number; drift?: number }> = ({
  children,
  localSec,
  dur,
  push = 0.05,
  drift = 8,
}) => {
  const p = smoothstep(clamp01(localSec / Math.max(0.1, dur)));
  const scale = 1.01 + push * p;
  const tx = Math.sin(p * Math.PI * 1.1) * drift;
  const ty = Math.cos(p * Math.PI * 0.9) * drift * 0.6;
  return <g transform={`translate(${720 + tx}, ${1280 + ty}) scale(${scale}) translate(-720, -1280)`}>{children}</g>;
};

export const ChapterEyebrow: React.FC<{ index: number; localSec: number; x?: number }> = ({ index, localSec, x = 92 }) => {
  const ch = CHAPTERS[index];
  const p = easeOutCubic(prog(localSec, 0.1, 1.2));
  return (
    <g opacity={p}>
      <Mono x={x} y={296} text={ch.eyebrow} size={18} color={CHAPTER_ART[index].soft} tracking={0.3} />
      <RuleLine x1={x} y1={318} x2={x + 300 * p} y2={318} color="rgba(214, 200, 172, 0.3)" />
    </g>
  );
};
