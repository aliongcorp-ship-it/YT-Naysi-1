import React, { useEffect, useMemo, useState } from 'react';
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { evolvePath } from '@remotion/paths';
import { createNoise2D } from 'simplex-noise';
import { Delaunay } from 'd3-delaunay';
import { contours } from 'd3-contour';
import { geoNaturalEarth1, geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import land50mRaw from 'world-atlas/land-50m.json';
import land110mRaw from 'world-atlas/land-110m.json';
import {
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  easeOutExpo,
  prog,
  smoothstep,
} from './script';

// ============================================================================
// 1. DETERMINISTIC PRNG & MULTI-OCTAVE SIMPLEX NOISE ENGINE
// ============================================================================

export function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createSeededRng(seed: string): () => number {
  let a = hashSeed(seed) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOISE_BANKS = new Map<string, ReturnType<typeof createNoise2D>>();

export function getNoise2D(seed: string): ReturnType<typeof createNoise2D> {
  let fn = NOISE_BANKS.get(seed);
  if (!fn) {
    fn = createNoise2D(createSeededRng(seed));
    NOISE_BANKS.set(seed, fn);
  }
  return fn;
}

export function fbm2D(
  seed: string,
  x: number,
  y: number,
  octaves = 4,
  lacunarity = 2.04,
  gain = 0.5,
): number {
  const n2d = getNoise2D(seed);
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * n2d(x * freq + i * 19.3, y * freq - i * 13.7);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return norm > 0 ? sum / norm : 0;
}

export function ridge2D(seed: string, x: number, y: number, octaves = 4): number {
  const n2d = getNoise2D(seed);
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    const v = 1 - Math.abs(n2d(x * freq + i * 29.1, y * freq + i * 11.9));
    sum += amp * v * v;
    norm += amp;
    amp *= 0.52;
    freq *= 2.08;
  }
  return norm > 0 ? sum / norm : 0;
}

// ============================================================================
// 2. REAL WORLD-ATLAS (TOPOJSON) + D3-GEO CARTOGRAPHIC MODULE
// ============================================================================

const land50mTopology = land50mRaw as unknown as Topology<{ land: GeometryCollection }>;
const land110mTopology = land110mRaw as unknown as Topology<{ land: GeometryCollection }>;

export const WORLD_LAND_50M = feature(land50mTopology, land50mTopology.objects.land);
export const WORLD_LAND_110M = feature(land110mTopology, land110mTopology.objects.land);
export const WORLD_GRATICULE = geoGraticule10();

export function buildOrthographicGlobe(
  cx: number,
  cy: number,
  radius: number,
  lonDeg: number,
  latDeg: number,
  useHighRes = false,
): { landPath: string; graticulePath: string; spherePath: string } {
  const projection = geoOrthographic()
    .translate([cx, cy])
    .scale(radius)
    .rotate([-lonDeg, -latDeg, 0])
    .clipAngle(90);
  const pathGen = geoPath(projection);
  const landFeature = useHighRes ? WORLD_LAND_50M : WORLD_LAND_110M;
  return {
    landPath: pathGen(landFeature) || '',
    graticulePath: pathGen(WORLD_GRATICULE) || '',
    spherePath: pathGen({ type: 'Sphere' }) || '',
  };
}

export function buildNaturalEarthMap(
  width: number,
  height: number,
): {
  landPath: string;
  graticulePath: string;
  outlinePath: string;
  project: (lon: number, lat: number) => [number, number] | null;
} {
  const projection = geoNaturalEarth1().fitExtent(
    [
      [18, 18],
      [width - 18, height - 18],
    ],
    { type: 'Sphere' },
  );
  const pathGen = geoPath(projection);
  return {
    landPath: pathGen(WORLD_LAND_110M) || '',
    graticulePath: pathGen(WORLD_GRATICULE) || '',
    outlinePath: pathGen({ type: 'Sphere' }) || '',
    project: (lon: number, lat: number) => projection([lon, lat]),
  };
}

// ============================================================================
// 3. TACTILE 2D PROCEDURAL <CANVAS> SURFACE SYNTHESIZER (NON-NEON)
// ============================================================================

export type SurfaceTextureKind =
  | 'monsoon-slate'
  | 'cracked-laterite'
  | 'herbarium-paper'
  | 'humus-micro'
  | 'spore-amber'
  | 'pool-ceramic'
  | 'desert-sand'
  | 'teak-wood';

const SURFACE_CACHE = new Map<SurfaceTextureKind, string>();

function renderSurfaceToDataUrl(kind: SurfaceTextureKind): string {
  const cached = SURFACE_CACHE.get(kind);
  if (cached) return cached;

  const isWide = kind === 'herbarium-paper' || kind === 'desert-sand' || kind === 'teak-wood';
  const w = isWide ? 560 : 440;
  const h = isWide ? 360 : 440;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const img = ctx.createImageData(w, h);
  const data = img.data;
  const rng = createSeededRng(`petrichor-tex-${kind}`);

  if (kind === 'monsoon-slate') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const base = fbm2D('slate-a', x * 0.015, y * 0.015, 4);
        const fine = fbm2D('slate-b', x * 0.14, y * 0.14, 2);
        const streak = fbm2D('slate-rain', x * 0.09, y * 0.008, 3);
        const v = clamp01(0.46 + base * 0.22 + fine * 0.14 + streak * 0.12);
        data[idx] = Math.round(14 + v * 20);
        data[idx + 1] = Math.round(21 + v * 26);
        data[idx + 2] = Math.round(20 + v * 25);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  } else if (kind === 'cracked-laterite') {
    // Desiccated Voronoi terracotta laterite clay polygons with mud-crack crevices
    const pts: [number, number][] = [];
    const tones: number[] = [];
    for (let i = 0; i < 96; i++) {
      pts.push([rng() * w, rng() * h]);
      tones.push(rng());
    }
    const delaunay = Delaunay.from(pts);
    const vor = delaunay.voronoi([0, 0, w, h]);

    ctx.fillStyle = '#331A10';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < pts.length; i++) {
      const poly = vor.cellPolygon(i);
      if (!poly) continue;
      const t = tones[i];
      const r = Math.round(126 + t * 54);
      const g = Math.round(68 + t * 34);
      const b = Math.round(44 + t * 24);
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let k = 1; k < poly.length; k++) ctx.lineTo(poly[k][0], poly[k][1]);
      ctx.closePath();
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fill();
      ctx.lineWidth = 3.2;
      ctx.strokeStyle = '#2B150C';
      ctx.stroke();
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(232, 178, 138, 0.28)';
      ctx.stroke();
    }

    const over = ctx.getImageData(0, 0, w, h);
    const od = over.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const grit = fbm2D('clay-grit', x * 0.12, y * 0.12, 3) * 18;
        od[idx] = Math.max(0, Math.min(255, od[idx] + grit));
        od[idx + 1] = Math.max(0, Math.min(255, od[idx + 1] + grit * 0.72));
        od[idx + 2] = Math.max(0, Math.min(255, od[idx + 2] + grit * 0.55));
      }
    }
    ctx.putImageData(over, 0, 0);
  } else if (kind === 'herbarium-paper') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const cloud = fbm2D('herb-c', x * 0.016, y * 0.016, 4);
        const fiber = fbm2D('herb-f', x * 0.24, y * 0.05, 2);
        const speck = rng() > 0.992 ? -22 : 0;
        data[idx] = Math.min(255, Math.max(0, Math.round(239 + cloud * 11 + fiber * 5 + speck)));
        data[idx + 1] = Math.min(255, Math.max(0, Math.round(231 + cloud * 10 + fiber * 5 + speck)));
        data[idx + 2] = Math.min(255, Math.max(0, Math.round(214 + cloud * 11 + fiber * 4 + speck)));
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  } else if (kind === 'humus-micro') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const loam = fbm2D('humus-a', x * 0.025, y * 0.025, 4);
        const crumb = ridge2D('humus-b', x * 0.07, y * 0.07, 3);
        const v = clamp01(0.32 + loam * 0.28 + crumb * 0.34);
        data[idx] = Math.round(24 + v * 52);
        data[idx + 1] = Math.round(19 + v * 39);
        data[idx + 2] = Math.round(14 + v * 28);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  } else if (kind === 'spore-amber') {
    const pts: [number, number][] = [];
    const lum: number[] = [];
    for (let i = 0; i < 120; i++) {
      pts.push([rng() * w, rng() * h]);
      lum.push(rng());
    }
    const vor = Delaunay.from(pts).voronoi([0, 0, w, h]);
    for (let i = 0; i < pts.length; i++) {
      const poly = vor.cellPolygon(i);
      if (!poly) continue;
      const t = lum[i];
      const r = Math.round(176 + t * 72);
      const g = Math.round(118 + t * 84);
      const b = Math.round(36 + t * 58);
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let k = 1; k < poly.length; k++) ctx.lineTo(poly[k][0], poly[k][1]);
      ctx.closePath();
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fill();
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = 'rgba(255, 240, 198, 0.32)';
      ctx.stroke();
    }
  } else if (kind === 'pool-ceramic') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const caus = ridge2D('pool-c', x * 0.032, y * 0.032, 3);
        const v = clamp01(0.28 + caus * 0.52);
        data[idx] = Math.round(32 + v * 54);
        data[idx + 1] = Math.round(68 + v * 72);
        data[idx + 2] = Math.round(78 + v * 78);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  } else if (kind === 'desert-sand') {
    const hMap = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dune = Math.sin(x * 0.035 + fbm2D('dune-w', x * 0.01, y * 0.01, 3) * 3.4) * 0.35;
        const rip = Math.sin(x * 0.22 + y * 0.06) * 0.08;
        hMap[y * w + x] = 0.5 + dune + rip + fbm2D('dune-g', x * 0.08, y * 0.08, 2) * 0.12;
      }
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const xm = Math.max(0, x - 1);
        const xp = Math.min(w - 1, x + 1);
        const ym = Math.max(0, y - 1);
        const yp = Math.min(h - 1, y + 1);
        const dx = (hMap[y * w + xp] - hMap[y * w + xm]) * 2.6;
        const dy = (hMap[yp * w + x] - hMap[ym * w + x]) * 2.6;
        const shade = clamp01((-dx * 0.68 - dy * 0.52 + 0.65) * 0.88);
        data[idx] = Math.round(48 + shade * 124);
        data[idx + 1] = Math.round(36 + shade * 92);
        data[idx + 2] = Math.round(24 + shade * 56);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  } else if (kind === 'teak-wood') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const warp = fbm2D('teak-w', x * 0.008, y * 0.024, 4) * 9.5;
        const ring = Math.sin((y * 0.095 + warp) * Math.PI);
        const grain = ring * 0.5 + 0.5;
        const pore = fbm2D('teak-p', x * 0.22, y * 0.04, 2) * 0.14;
        const v = clamp01(0.24 + grain * 0.44 + pore);
        data[idx] = Math.round(30 + v * 58);
        data[idx + 1] = Math.round(20 + v * 38);
        data[idx + 2] = Math.round(13 + v * 22);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  const url = canvas.toDataURL('image/png');
  SURFACE_CACHE.set(kind, url);
  return url;
}

function thecrumb(v: number): number {
  return v * 0.34;
}

export function useProceduralSurface(kind: SurfaceTextureKind): string {
  const [url, setUrl] = useState<string>(() => SURFACE_CACHE.get(kind) ?? '');
  const [handle] = useState(() =>
    SURFACE_CACHE.has(kind) ? null : delayRender(`surface-${kind}`),
  );

  useEffect(() => {
    if (handle === null) return;
    try {
      const generated = renderSurfaceToDataUrl(kind);
      setUrl(generated);
      continueRender(handle);
    } catch (err) {
      cancelRender(err);
    }
  }, [handle, kind]);

  return url;
}

// ============================================================================
// 4. EDITORIAL MOTION GRAPHICS & PHYSICAL SPECIMEN PRIMITIVES
// ============================================================================

export const TrimPath: React.FC<{
  d: string;
  progress: number;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  strokeLinecap?: 'butt' | 'round' | 'square';
  opacity?: number;
  fill?: string;
}> = ({
  d,
  progress,
  stroke,
  strokeWidth,
  strokeDasharray,
  strokeLinecap = 'round',
  opacity = 1,
  fill = 'none',
}) => {
  const p = clamp01(progress);
  if (p <= 0.001 || !d) return null;
  const evolved = p >= 0.999 ? { strokeDasharray: undefined, strokeDashoffset: undefined } : evolvePath(p, d);
  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin="round"
      strokeDasharray={strokeDasharray ?? evolved.strokeDasharray}
      strokeDashoffset={strokeDasharray ? undefined : evolved.strokeDashoffset}
      opacity={opacity}
    />
  );
};

export const RollingNumber: React.FC<{
  value: string;
  progress: number;
  fontSize: number;
  color?: string;
  letterSpacing?: string;
}> = ({ value, progress, fontSize, color = IDENTITY.ivoryText, letterSpacing = '0.02em' }) => {
  const chars = value.split('');
  const lineH = Math.round(fontSize * 0.96);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontFamily: IDENTITY.fontDisplay,
        fontSize,
        lineHeight: `${lineH}px`,
        color,
        letterSpacing,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {chars.map((ch, idx) => {
        const digit = ch >= '0' && ch <= '9' ? Number(ch) : -1;
        if (digit < 0) {
          return (
            <span key={idx} style={{ display: 'inline-block', padding: '0 2px' }}>
              {ch}
            </span>
          );
        }
        const settle = easeOutExpo(clamp01((progress - idx * 0.055) / Math.max(0.28, 1 - idx * 0.055)));
        const spins = 10 + digit;
        const offset = interpolate(settle, [0, 1], [0, spins * lineH]);
        return (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              height: lineH,
              overflow: 'hidden',
              verticalAlign: 'bottom',
            }}
          >
            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                transform: `translateY(${-offset}px)`,
              }}
            >
              {Array.from({ length: 20 }).map((_, n) => (
                <span
                  key={n}
                  style={{
                    height: lineH,
                    lineHeight: `${lineH}px`,
                    display: 'block',
                    textAlign: 'center',
                  }}
                >
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

export const DocumentaryHeader: React.FC<{
  eyebrow: string;
  figure: string;
  unit: string;
  subtitle: string;
  localSec: number;
  accentColor?: string;
}> = ({
  eyebrow,
  figure,
  unit,
  subtitle,
  localSec,
  accentColor = IDENTITY.amberSpore,
}) => {
  const enter = easeOutCubic(clamp01(localSec / 0.52));
  const roll = clamp01(localSec / 0.92);

  return (
    <div
      style={{
        position: 'absolute',
        left: 88,
        right: 88,
        top: 164,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 20}px)`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            width: 34,
            height: 2,
            backgroundColor: accentColor,
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: IDENTITY.stoneText,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, flexWrap: 'nowrap' }}>
        <RollingNumber value={figure} progress={roll} fontSize={136} color={IDENTITY.ivoryText} />
        <span
          style={{
            fontFamily: IDENTITY.fontEditorial,
            fontSize: 54,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: accentColor,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {unit}
        </span>
      </div>

      <div
        style={{
          marginTop: 8,
          fontFamily: IDENTITY.fontMono,
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: accentColor,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};

export interface HerbariumRow {
  readonly label: string;
  readonly value: string;
  readonly highlight?: boolean;
}

export const HerbariumSpecimenCard: React.FC<{
  x: number;
  y: number;
  width: number;
  rotationDeg?: number;
  headerLeft: string;
  headerRight: string;
  rows: readonly HerbariumRow[];
  stampText?: string;
  stampColor?: string;
  stampProgress?: number;
  footerCode?: string;
  enterProgress: number;
}> = ({
  x,
  y,
  width,
  rotationDeg = -1.2,
  headerLeft,
  headerRight,
  rows,
  stampText,
  stampColor = IDENTITY.stampRust,
  stampProgress = 0,
  footerCode = 'SPECIMEN HERBARIUM · C12H22O',
  enterProgress,
}) => {
  const paperUrl = useProceduralSurface('herbarium-paper');
  const p = easeOutExpo(clamp01(enterProgress));
  const sp = clamp01(stampProgress);
  const stampScale = interpolate(easeOutExpo(sp), [0, 1], [1.72, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        padding: stampText ? '28px 34px 92px' : '28px 34px 30px',
        backgroundColor: IDENTITY.paperHerbarium,
        backgroundImage: paperUrl ? `url(${paperUrl})` : undefined,
        backgroundSize: 'cover',
        border: '1.5px solid rgba(46, 38, 26, 0.36)',
        boxShadow: '0 26px 48px rgba(0, 0, 0, 0.58), 0 4px 10px rgba(0, 0, 0, 0.36)',
        transform: `translateY(${(1 - p) * 52}px) rotate(${rotationDeg}deg)`,
        opacity: clamp01(enterProgress * 1.6),
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 9,
          border: '1px solid rgba(64, 52, 34, 0.22)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #262018',
          paddingBottom: 10,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: IDENTITY.fontEditorial,
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: IDENTITY.paperInk,
            textTransform: 'uppercase',
          }}
        >
          {headerLeft}
        </span>
        <span
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: IDENTITY.paperMuted,
          }}
        >
          {headerRight}
        </span>
      </div>

      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            padding: '8px 0',
            borderBottom: i < rows.length - 1 ? `1px dashed ${IDENTITY.paperRule}` : 'none',
            fontFamily: IDENTITY.fontMono,
          }}
        >
          <span
            style={{
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: r.highlight ? stampColor : IDENTITY.paperMuted,
            }}
          >
            {r.label}
          </span>
          <span
            style={{
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: r.highlight ? stampColor : IDENTITY.paperInk,
            }}
          >
            {r.value}
          </span>
        </div>
      ))}

      {stampText && (
        <div
          style={{
            position: 'absolute',
            left: 34,
            bottom: 28,
            fontFamily: IDENTITY.fontMono,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: IDENTITY.paperMuted,
          }}
        >
          {footerCode}
        </div>
      )}

      {stampText && sp > 0.02 && (
        <div
          style={{
            position: 'absolute',
            right: 34,
            bottom: 18,
            padding: '8px 20px',
            border: `4px solid ${stampColor}`,
            outline: `1.5px solid ${stampColor}`,
            outlineOffset: -7,
            color: stampColor,
            fontFamily: IDENTITY.fontEditorial,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            backgroundColor: 'rgba(239, 231, 214, 0.95)',
            transform: `rotate(-6deg) scale(${stampScale})`,
            opacity: clamp01(sp * 2.2) * 0.94,
          }}
        >
          {stampText}
        </div>
      )}
    </div>
  );
};

export const MatteCanvasGround: React.FC<{
  topColor: string;
  bottomColor: string;
  surfaceKind?: SurfaceTextureKind;
  surfaceOpacity?: number;
  warmLampX?: number;
  warmLampY?: number;
}> = ({
  topColor,
  bottomColor,
  surfaceKind = 'monsoon-slate',
  surfaceOpacity = 0.25,
  warmLampX = 50,
  warmLampY = 44,
}) => {
  const texUrl = useProceduralSurface(surfaceKind);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`,
        overflow: 'hidden',
      }}
    >
      {texUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${texUrl})`,
            backgroundSize: '640px 640px',
            backgroundRepeat: 'repeat',
            opacity: surfaceOpacity,
            mixBlendMode: 'overlay',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 68% 48% at ${warmLampX}% ${warmLampY}%, rgba(168, 196, 160, 0.07) 0%, rgba(0, 0, 0, 0) 68%), radial-gradient(ellipse 95% 85% at 50% 50%, rgba(0,0,0,0) 54%, rgba(0,0,0,0.62) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 5. BESPOKE 2D BOTANICAL & CHEMICAL OBJECT ILLUSTRATIONS
// ============================================================================

export const IllustratedWaterDroplet: React.FC<{
  cx: number;
  cy: number;
  radius: number;
  uid?: string;
  teardrop?: boolean;
}> = ({ cx, cy, radius, uid = 'drop', teardrop = true }) => {
  const r = radius;
  const pathD = teardrop
    ? `M ${cx},${cy - r * 1.48} C ${cx + r * 0.42},${cy - r * 0.72} ${cx + r},${cy - r * 0.12} ${cx + r},${cy + r * 0.28} A ${r},${r * 0.92} 0 1,1 ${cx - r},${cy + r * 0.28} C ${cx - r},${cy - r * 0.12} ${cx - r * 0.42},${cy - r * 0.72} ${cx},${cy - r * 1.48} Z`
    : `M ${cx - r},${cy + r * 0.15} A ${r},${r * 0.72} 0 0,1 ${cx + r},${cy + r * 0.15} Q ${cx},${cy + r * 0.32} ${cx - r},${cy + r * 0.15} Z`;

  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-grad`} cx="36%" cy="32%" r="72%">
          <stop offset="0%" stopColor="rgba(242, 248, 247, 0.92)" />
          <stop offset="34%" stopColor="rgba(176, 206, 208, 0.58)" />
          <stop offset="78%" stopColor="rgba(68, 104, 112, 0.48)" />
          <stop offset="100%" stopColor="rgba(26, 44, 48, 0.76)" />
        </radialGradient>
      </defs>
      <path
        d={pathD}
        fill={`url(#${uid}-grad)`}
        stroke="rgba(235, 245, 244, 0.72)"
        strokeWidth={Math.max(1.4, r * 0.045)}
      />
      {/* Upper-left internal refractive specular crescent */}
      <path
        d={
          teardrop
            ? `M ${cx - r * 0.56},${cy + r * 0.12} C ${cx - r * 0.58},${cy - r * 0.28} ${cx - r * 0.24},${cy - r * 0.72} ${cx - r * 0.06},${cy - r * 0.98}`
            : `M ${cx - r * 0.68},${cy - r * 0.08} A ${r * 0.72},${r * 0.46} 0 0,1 ${cx + r * 0.18},${cy - r * 0.42}`
        }
        fill="none"
        stroke="rgba(255, 255, 255, 0.78)"
        strokeWidth={Math.max(2, r * 0.09)}
        strokeLinecap="round"
      />
      {/* Bottom caustic bright focus */}
      <ellipse
        cx={cx + r * 0.22}
        cy={cy + (teardrop ? r * 0.68 : r * 0.02)}
        rx={r * 0.34}
        ry={r * 0.12}
        fill="rgba(236, 248, 246, 0.46)"
      />
    </g>
  );
};

export const GeosminBrassMedallion: React.FC<{
  cx: number;
  cy: number;
  radius: number;
  rotationDeg?: number;
}> = ({ cx, cy, radius, rotationDeg = 0 }) => {
  // Bicyclic trans-1,10-dimethyl-trans-9-decalol (Geosmin C12H22O) engraved brass token
  const s = radius * 0.34;
  const hexA = Array.from({ length: 6 })
    .map((_, i) => {
      const a = (i * Math.PI) / 3 + Math.PI / 6;
      return `${(-s * 0.866 + Math.cos(a) * s).toFixed(1)},${(Math.sin(a) * s).toFixed(1)}`;
    })
    .join(' ');
  const hexB = Array.from({ length: 6 })
    .map((_, i) => {
      const a = (i * Math.PI) / 3 + Math.PI / 6;
      return `${(s * 0.866 + Math.cos(a) * s).toFixed(1)},${(Math.sin(a) * s).toFixed(1)}`;
    })
    .join(' ');

  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotationDeg})`}>
      <circle
        cx={0}
        cy={0}
        r={radius}
        fill="#1F1C16"
        stroke={IDENTITY.amberSpore}
        strokeWidth={3}
      />
      <circle
        cx={0}
        cy={0}
        r={radius - 9}
        fill="none"
        stroke="rgba(236, 199, 126, 0.35)"
        strokeWidth={1.2}
        strokeDasharray="4 4"
      />
      {/* Fused Bicyclic Decalin Rings of Geosmin */}
      <g transform="translate(0, -8)">
        <polygon
          points={hexA}
          fill="rgba(216, 161, 72, 0.14)"
          stroke={IDENTITY.amberLight}
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
        <polygon
          points={hexB}
          fill="rgba(122, 158, 115, 0.16)"
          stroke={IDENTITY.amberLight}
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
        {/* Methyl & Hydroxyl substituent pins (-OH & 2x -CH3) */}
        <line x1={0} y1={-s * 0.5} x2={0} y2={-s * 1.28} stroke={IDENTITY.mossLight} strokeWidth={2.6} />
        <circle cx={0} cy={-s * 1.36} r={5.5} fill={IDENTITY.mossSage} stroke="#F2EFE8" strokeWidth={1.4} />
        <line x1={0} y1={s * 0.5} x2={-s * 0.45} y2={s * 1.22} stroke={IDENTITY.amberLight} strokeWidth={2.4} />
        <line x1={-s * 1.73} y1={-s * 0.5} x2={-s * 2.28} y2={-s * 0.92} stroke={IDENTITY.amberLight} strokeWidth={2.4} />
      </g>
      <text
        x={0}
        y={radius * 0.64}
        textAnchor="middle"
        fill={IDENTITY.ivoryText}
        fontFamily={IDENTITY.fontMono}
        fontSize={Math.max(13, Math.round(radius * 0.17))}
        fontWeight={700}
        letterSpacing="0.12em"
      >
        GEOSMIN · C₁₂H₂₂O
      </text>
    </g>
  );
};

export const AmberSporeCluster: React.FC<{
  cx: number;
  cy: number;
  size: number;
  sporeUrl: string;
  rotation?: number;
}> = ({ cx, cy, size, sporeUrl, rotation = 0 }) => {
  const uid = `sp-${Math.round(cx)}-${Math.round(cy)}-${Math.round(size)}-${Math.round(rotation)}`;
  const r = size;
  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
      <defs>
        <clipPath id={uid}>
          <circle cx={0} cy={0} r={r} />
        </clipPath>
      </defs>
      <circle cx={0} cy={0} r={r} fill={IDENTITY.amberSpore} />
      {sporeUrl && (
        <g clipPath={`url(#${uid})`}>
          <image href={sporeUrl} x={-r} y={-r} width={r * 2} height={r * 2} />
        </g>
      )}
      <circle
        cx={0}
        cy={0}
        r={r}
        fill="none"
        stroke="#FAF0CA"
        strokeWidth={Math.max(1.1, r * 0.09)}
      />
      <circle cx={-r * 0.32} cy={-r * 0.32} r={r * 0.24} fill="rgba(255, 250, 232, 0.52)" />
    </g>
  );
};

// ============================================================================
// 6. SCENE 01 — TETES HUJAN MURNI VS JEBAKAN AROMA TANAH (0.000s – 11.220s)
// ============================================================================

export const Scene01JebakanAroma: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[0];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const lateriteUrl = useProceduralSurface('cracked-laterite');
  const sporeUrl = useProceduralSurface('spore-amber');

  const plinthEnter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 86, mass: 0.95 },
  });

  // First raindrop falls (0.2s -> 1.15s) onto sun-baked terracotta clay
  const dropFall = easeInOutCubic(prog(localSec, 0.18, 1.12));
  const impactProg = prog(localSec, 1.12, 2.8);
  const vaporProg = easeOutCubic(prog(localSec, 1.35, 4.4));
  const cardEnter = prog(globalSec, 3.2, 4.05);
  const stampProg = prog(globalSec, 4.55, 5.05);

  const stampElapsed = globalSec - 4.55;
  const shakeY =
    stampElapsed > 0 && stampElapsed < 0.34
      ? Math.sin(stampElapsed * 64) * Math.exp(-stampElapsed * 14) * 6.5
      : 0;

  // Deterministic gentle diagonal tropical drizzle streaks
  const rainStreaks = useMemo(() => {
    const rng = createSeededRng('s1-drizzle');
    return Array.from({ length: 34 }).map(() => ({
      x: 80 + rng() * 1280,
      yOffset: rng(),
      speed: 0.55 + rng() * 0.45,
      len: 42 + rng() * 54,
      alpha: 0.12 + rng() * 0.2,
    }));
  }, []);

  // Rising golden-sage Petrichor aroma ribbons from wetted clay
  const vaporPaths = [
    'M 805,845 C 770,775 835,705 792,625 C 760,565 812,510 788,458',
    'M 848,852 C 892,780 838,708 882,632 C 915,574 868,518 896,466',
    'M 758,856 C 708,792 752,722 706,648 C 676,595 718,538 698,486',
  ];

  return (
    <AbsoluteFill style={{ transform: `translateY(${shakeY}px)` }}>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="monsoon-slate"
        surfaceOpacity={0.28}
        warmLampX={54}
        warmLampY={42}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure="0,00"
        unit="AROMA AIR"
        subtitle="AIR HUJAN MURNI HAMPA BAU · WANGINYA JEBAKAN BAKTERI TANAH"
        localSec={localSec}
        accentColor={IDENTITY.amberSpore}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s1-clay-top">
            <polygon points="432,812 1246,784 1318,912 372,946" />
          </clipPath>
          <radialGradient id="s1-wet-spot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34, 16, 9, 0.88)" />
            <stop offset="68%" stopColor="rgba(54, 26, 15, 0.58)" />
            <stop offset="100%" stopColor="rgba(54, 26, 15, 0)" />
          </radialGradient>
          <linearGradient id="s1-clay-front" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4A2416" />
            <stop offset="50%" stopColor="#63311F" />
            <stop offset="100%" stopColor="#3B1C11" />
          </linearGradient>
          <linearGradient id="s1-glass-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(218, 234, 235, 0.28)" />
            <stop offset="28%" stopColor="rgba(218, 234, 235, 0.08)" />
            <stop offset="82%" stopColor="rgba(140, 174, 178, 0.12)" />
            <stop offset="100%" stopColor="rgba(225, 240, 240, 0.34)" />
          </linearGradient>
        </defs>

        {/* Soft Ambient Monsoon Drizzle Streaks */}
        {rainStreaks.map((rs, idx) => {
          const u = (rs.yOffset + localSec * rs.speed) % 1;
          const x1 = rs.x - u * 48;
          const y1 = 415 + u * 690;
          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x1 - rs.len * 0.14}
              y2={y1 + rs.len}
              stroke={IDENTITY.rainMist}
              strokeWidth={1.3}
              strokeLinecap="round"
              opacity={rs.alpha * smoothstep(Math.min(u * 5, (1 - u) * 5))}
            />
          );
        })}

        <g
          transform={`translate(0, ${(1 - plinthEnter) * 44})`}
          opacity={clamp01(plinthEnter * 1.3)}
        >
          {/* ============================================================== */}
          {/* LEFT ARTIFACT: BOROSILICATE PURE RAINWATER CONTROL FLASK       */}
          {/* ============================================================== */}
          <g transform="translate(128, 520)">
            <ellipse cx={106} cy={412} rx={96} ry={18} fill="rgba(0,0,0,0.48)" />
            {/* Glass Cylinder Body */}
            <path
              d="M 46,72 L 32,374 C 30,396 58,408 106,408 C 154,408 182,396 180,374 L 166,72 Z"
              fill="url(#s1-glass-body)"
              stroke="rgba(222, 236, 236, 0.62)"
              strokeWidth={2.2}
            />
            {/* Collected Pure Rainwater Inside Flask */}
            <path
              d="M 38,248 L 33,372 C 32,392 58,403 106,403 C 154,403 180,392 179,372 L 174,248 Z"
              fill="rgba(138, 182, 188, 0.28)"
            />
            <ellipse
              cx={106}
              cy={248}
              rx={68}
              ry={11}
              fill="rgba(214, 236, 238, 0.42)"
              stroke="rgba(236, 248, 248, 0.65)"
              strokeWidth={1.4}
            />
            {/* Flared Funnel Rim */}
            <ellipse
              cx={106}
              cy={72}
              rx={60}
              ry={11}
              fill="rgba(218, 236, 236, 0.16)"
              stroke="rgba(232, 244, 244, 0.72)"
              strokeWidth={2}
            />
            {/* Etched Graduation Marks */}
            {[140, 185, 230, 275, 320, 365].map((gy, gi) => (
              <line
                key={gi}
                x1={54}
                y1={gy}
                x2={gi % 2 === 0 ? 76 : 66}
                y2={gy}
                stroke="rgba(232, 244, 244, 0.46)"
                strokeWidth={1.4}
              />
            ))}
            {/* Pure Falling Droplet Entering Control Flask */}
            <IllustratedWaterDroplet
              cx={106}
              cy={20 + ((localSec * 0.85) % 1) * 195}
              radius={13}
              uid="s1-pure-drop"
              teardrop
            />
            <text
              x={106}
              y={446}
              textAnchor="middle"
              fill={IDENTITY.ivoryText}
              fontFamily={IDENTITY.fontMono}
              fontSize={16}
              fontWeight={700}
              letterSpacing="0.12em"
            >
              AIR MURNI (H₂O)
            </text>
            <text
              x={106}
              y={469}
              textAnchor="middle"
              fill={IDENTITY.stoneText}
              fontFamily={IDENTITY.fontMono}
              fontSize={14}
              letterSpacing="0.1em"
            >
              0,00% MOLEKUL BAU
            </text>
          </g>

          {/* ============================================================== */}
          {/* RIGHT STAGE: SUN-CRACKED VORONOI LATERITE SOIL SLAB            */}
          {/* ============================================================== */}
          <ellipse cx={845} cy={1012} rx={485} ry={46} fill="rgba(0,0,0,0.58)" />

          {/* Top Desiccated Voronoi Clay Face */}
          <polygon points="432,812 1246,784 1318,912 372,946" fill="#7C412A" />
          {lateriteUrl && (
            <g clipPath="url(#s1-clay-top)">
              <image
                href={lateriteUrl}
                x={365}
                y={775}
                width={965}
                height={185}
                preserveAspectRatio="none"
              />
            </g>
          )}
          <polygon
            points="432,812 1246,784 1318,912 372,946"
            fill="none"
            stroke="rgba(236, 195, 162, 0.34)"
            strokeWidth={1.8}
          />

          {/* Cut Soil Block Front Elevation Showing Subterranean Bacterial Layer */}
          <polygon
            points="372,946 1318,912 1304,992 386,1026"
            fill="url(#s1-clay-front)"
            stroke="rgba(24, 12, 7, 0.85)"
            strokeWidth={1.6}
          />
          {/* Embedded Golden Bacterial Micro-Colonies Waiting Beneath Dry Crust */}
          {[458, 542, 635, 738, 825, 918, 1024, 1126, 1215].map((bx, bi) => {
            const by = 978 - (bx - 380) * 0.034 + (bi % 2 === 0 ? -7 : 6);
            return (
              <AmberSporeCluster
                key={bi}
                cx={bx}
                cy={by}
                size={6.5 + (bi % 3) * 1.8}
                sporeUrl={sporeUrl}
                rotation={bi * 37}
              />
            );
          })}

          {/* Expanding Darkened Damp Soil Ring Upon Raindrop Impact */}
          {impactProg > 0.01 && (
            <g>
              <ellipse
                cx={815}
                cy={862}
                rx={interpolate(easeOutCubic(impactProg), [0, 1], [18, 168])}
                ry={interpolate(easeOutCubic(impactProg), [0, 1], [6, 42])}
                fill="url(#s1-wet-spot)"
              />
              {[0, 0.35].map((off, ri) => {
                const rp = clamp01((localSec - 1.12 - off) / 1.65);
                if (rp <= 0 || rp >= 1) return null;
                return (
                  <ellipse
                    key={ri}
                    cx={815}
                    cy={862}
                    rx={26 + rp * 145}
                    ry={8 + rp * 34}
                    fill="none"
                    stroke="rgba(222, 238, 236, 0.55)"
                    strokeWidth={2 * (1 - rp)}
                  />
                );
              })}
            </g>
          )}

          {/* Hero Falling / Impacting Raindrop */}
          {dropFall < 0.98 ? (
            <IllustratedWaterDroplet
              cx={815}
              cy={interpolate(dropFall, [0, 1], [448, 842])}
              radius={34}
              uid="s1-hero-drop"
              teardrop
            />
          ) : (
            <IllustratedWaterDroplet
              cx={815}
              cy={858}
              radius={52}
              uid="s1-hero-dome"
              teardrop={false}
            />
          )}

          {/* Rising Golden-Sage Petrichor / Geosmin Plumes From Wetted Clay */}
          {vaporPaths.map((vp, vi) => (
            <g key={vi}>
              <TrimPath
                d={vp}
                progress={clamp01((vaporProg - vi * 0.12) / 0.88)}
                stroke={vi === 1 ? IDENTITY.mossLight : IDENTITY.amberLight}
                strokeWidth={3.2 - vi * 0.4}
                opacity={0.78}
              />
            </g>
          ))}
          {vaporProg > 0.15 &&
            Array.from({ length: 12 }).map((_, si) => {
              const cyc = (localSec * 0.26 + si * 0.083) % 1;
              const sx = 720 + (si % 4) * 56 + Math.sin(cyc * Math.PI * 3 + si) * 22;
              const sy = 845 - cyc * 365;
              return (
                <g key={si} opacity={vaporProg * smoothstep(Math.min(cyc * 5, (1 - cyc) * 4))}>
                  <AmberSporeCluster
                    cx={sx}
                    cy={sy}
                    size={5.5 + (si % 3) * 2}
                    sporeUrl={sporeUrl}
                    rotation={localSec * 25 + si * 30}
                  />
                </g>
              );
            })}

          {/* Engraved Geosmin Bicyclic Medallion & Callout */}
          <g opacity={easeOutCubic(prog(localSec, 1.8, 2.7))}>
            <TrimPath
              d="M 885,688 L 972,608 L 1052,608"
              progress={prog(localSec, 1.8, 2.5)}
              stroke={IDENTITY.amberLight}
              strokeWidth={1.8}
            />
            <GeosminBrassMedallion
              cx={1156}
              cy={608}
              radius={92}
              rotationDeg={Math.sin(localSec * 0.8) * 3}
            />
          </g>
        </g>
      </svg>

      {/* Tactile Herbarium Chemical Specimen Card */}
      <HerbariumSpecimenCard
        x={126}
        y={1168}
        width={1188}
        rotationDeg={-1.2}
        headerLeft="ANALISIS AROMA · PETRIKOR"
        headerRight="BEAR & THOMAS · 1964"
        enterProgress={cardEnter}
        stampText="BUKAN AROMA AIR"
        stampColor={IDENTITY.stampRust}
        stampProgress={stampProg}
        footerCode="ARSIP KIMIA TANAH · C12H22O"
        rows={[
          { label: 'SAMPEL KONTROL', value: 'AIR HUJAN MURNI (H₂O · 0% BAU)' },
          { label: 'ISTILAH ILMIAH', value: 'PETRIKOR ("DARAH BATU")' },
          { label: 'SENYAWA UTAMA', value: 'GEOSMIN (ALKOHol BISIKLIK)' },
          { label: 'SUMBER ASLI', value: 'JEBAKAN KIMIA BAKTERI TANAH', highlight: true },
        ]}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 7. SCENE 02 — KAMERA MIT & PELONTAR GELEMBUNG AEROSOL (11.220s – 26.050s)
// ============================================================================

export const Scene02PelontarAerosol: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[1];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const lateriteUrl = useProceduralSurface('cracked-laterite');
  const sporeUrl = useProceduralSurface('spore-amber');

  // Phase timings synchronized to VO ("Saat gerimis pelan menimpa tanah berpori..." at 15.66s)
  const hitPhase = prog(globalSec, 12.1, 13.6);
  const bubblePhase = prog(globalSec, 13.5, 16.4);
  const burstPhase = prog(globalSec, 16.1, 18.8);
  const compareEnter = easeOutCubic(prog(globalSec, 18.4, 19.6));

  // Packed porous soil mineral grains & air capillary channels
  const soilGrains = useMemo(() => {
    const rng = createSeededRng('s2-porous-soil');
    const items: {
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      rot: number;
      fill: string;
    }[] = [];
    const palette = ['#6B3E29', '#7E4B33', '#56301F', '#8A563C', '#4B291A'];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 15; col++) {
        const cx = 158 + col * 80 + (row % 2) * 36 + (rng() - 0.5) * 18;
        const cy = 1098 + row * 56 + (rng() - 0.5) * 14;
        items.push({
          cx,
          cy,
          rx: 28 + rng() * 14,
          ry: 20 + rng() * 10,
          rot: (rng() - 0.5) * 38,
          fill: palette[Math.floor(rng() * palette.length)],
        });
      }
    }
    return items;
  }, []);

  // Deterministic aerosol micro-droplet burst trajectories carried downwind
  const aerosols = useMemo(() => {
    const rng = createSeededRng('s2-aerosol-cloud');
    return Array.from({ length: 58 }).map((_, i) => ({
      seedOffset: i / 58,
      launchX: 545 + (rng() - 0.5) * 250,
      archH: 185 + rng() * 295,
      driftX: 220 + rng() * 485,
      r: 3.2 + rng() * 5.8,
      hasSpore: i % 3 === 0,
    }));
  }, []);

  const isBurstHeader = globalSec >= 16.3;

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="monsoon-slate"
        surfaceOpacity={0.25}
        warmLampX={46}
        warmLampY={45}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure={isBurstHeader ? '100+' : '200.000'}
        unit={isBurstHeader ? 'KABUT AEROSOL' : 'FPS REKAMAN'}
        subtitle={
          isBurstHeader
            ? 'MELETUP SEPERTI SODA · DIBAWA ANGIN MENDAHULUI AWAN HUJAN'
            : 'GERIMIS PELAN MENJEBAK GELEMBUNG UDARA DI PORI TANAH'
        }
        localSec={localSec}
        accentColor={IDENTITY.rainMist}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s2-macro-frame">
            <rect x={112} y={448} width={1216} height={918} />
          </clipPath>
          <linearGradient id="s2-water-dome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(226, 242, 242, 0.72)" />
            <stop offset="45%" stopColor="rgba(130, 178, 186, 0.42)" />
            <stop offset="100%" stopColor="rgba(46, 84, 92, 0.62)" />
          </linearGradient>
        </defs>

        {/* ================================================================ */}
        {/* MAIN MIT HIGH-SPEED MACRO VIEWPORT (112..1328, 448..1366)        */}
        {/* ================================================================ */}
        <g clipPath="url(#s2-macro-frame)">
          <rect x={112} y={448} width={1216} height={918} fill="rgba(10, 16, 18, 0.78)" />

          {/* Subtle High-Speed Optical Reticle Grid */}
          {[620, 800, 980].map((gy, idx) => (
            <line
              key={idx}
              x1={112}
              y1={gy}
              x2={1328}
              y2={gy}
              stroke="rgba(207, 220, 217, 0.07)"
              strokeWidth={1}
              strokeDasharray="6 8"
            />
          ))}

          {/* Subsurface Soil Bed Base */}
          <rect x={112} y={1055} width={1216} height={312} fill="#2A170F" />
          {lateriteUrl && (
            <image
              href={lateriteUrl}
              x={112}
              y={1055}
              width={1216}
              height={312}
              preserveAspectRatio="none"
              opacity={0.34}
            />
          )}

          {/* Capillary Air-Pore Channels Vertical Throats */}
          {[442, 505, 568, 632, 696].map((px, idx) => (
            <path
              key={idx}
              d={`M ${px},1055 C ${px - 8},1135 ${px + 10},1215 ${px - 4},1345`}
              fill="none"
              stroke="rgba(207, 220, 217, 0.24)"
              strokeWidth={12}
              strokeLinecap="round"
            />
          ))}

          {/* Packed Porous Mineral Soil Grains */}
          {soilGrains.map((g, idx) => (
            <g key={idx} transform={`translate(${g.cx}, ${g.cy}) rotate(${g.rot})`}>
              <ellipse
                cx={0}
                cy={0}
                rx={g.rx}
                ry={g.ry}
                fill={g.fill}
                stroke="rgba(238, 198, 164, 0.22)"
                strokeWidth={1.3}
              />
            </g>
          ))}

          {/* Embedded Geosmin Spores Resting on Dry Soil Surface */}
          {[435, 488, 548, 608, 668, 725].map((sx, idx) => (
            <AmberSporeCluster
              key={idx}
              cx={sx}
              cy={1052}
              size={6.5}
              sporeUrl={sporeUrl}
              rotation={idx * 28}
            />
          ))}

          {/* Falling / Flattening Raindrop Meniscus */}
          {hitPhase < 0.35 ? (
            <IllustratedWaterDroplet
              cx={572}
              cy={interpolate(hitPhase / 0.35, [0, 1], [520, 965])}
              radius={68}
              uid="s2-falling"
              teardrop
            />
          ) : (
            <g>
              {(() => {
                const spread = easeOutExpo(clamp01((hitPhase - 0.35) / 0.65));
                const rx = interpolate(spread, [0, 1], [95, 258]);
                const ry = interpolate(spread, [0, 1], [118, 128 - burstPhase * 22]);
                const d = `M ${572 - rx},1055 C ${572 - rx},${1055 - ry * 1.25} ${572 + rx},${
                  1055 - ry * 1.25
                } ${572 + rx},1055 Z`;
                return (
                  <>
                    <path
                      d={d}
                      fill="url(#s2-water-dome)"
                      stroke="rgba(236, 248, 248, 0.82)"
                      strokeWidth={3}
                    />
                    <path
                      d={`M ${572 - rx * 0.72},1022 C ${572 - rx * 0.48},${1055 - ry * 0.95} ${
                        572 + rx * 0.15
                      },${1055 - ry * 1.02} ${572 + rx * 0.44},${1055 - ry * 0.76}`}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.62)"
                      strokeWidth={4.5}
                      strokeLinecap="round"
                    />
                  </>
                );
              })()}
            </g>
          )}

          {/* Trapped Silver Micro-Bubbles Rising Through the Flattened Droplet ("seperti soda") */}
          {bubblePhase > 0.02 &&
            [452, 498, 544, 586, 632, 678, 520, 610].map((bx, bi) => {
              const cyc = (localSec * 0.85 + bi * 0.14) % 1;
              const by = interpolate(cyc, [0, 1], [1048, 944]);
              const br = 6 + (bi % 3) * 3.5 + cyc * 4;
              return (
                <g key={bi} opacity={clamp01(bubblePhase * 1.6) * (1 - cyc * 0.25)}>
                  <circle
                    cx={bx + Math.sin(cyc * 7 + bi) * 6}
                    cy={by}
                    r={br}
                    fill="rgba(235, 248, 248, 0.22)"
                    stroke="#F4FAFA"
                    strokeWidth={1.8}
                  />
                  <circle
                    cx={bx + Math.sin(cyc * 7 + bi) * 6 - br * 0.32}
                    cy={by - br * 0.32}
                    r={br * 0.24}
                    fill="#FFFFFF"
                  />
                  {bi % 2 === 0 && (
                    <circle
                      cx={bx + Math.sin(cyc * 7 + bi) * 6}
                      cy={by + br * 0.2}
                      r={2.8}
                      fill={IDENTITY.amberLight}
                    />
                  )}
                </g>
              );
            })}

          {/* Erupting Fizzing Aerosol Mist & Downwind Transport Streamlines */}
          {burstPhase > 0.02 && (
            <g opacity={easeOutCubic(burstPhase)}>
              {[
                'M 545,895 C 720,765 955,705 1295,668',
                'M 585,918 C 765,818 995,775 1295,748',
                'M 515,872 C 695,705 935,625 1295,585',
              ].map((wd, wi) => (
                <TrimPath
                  key={wi}
                  d={wd}
                  progress={clamp01((burstPhase - wi * 0.1) / 0.9)}
                  stroke="rgba(207, 220, 217, 0.28)"
                  strokeWidth={1.8}
                  strokeDasharray="8 8"
                />
              ))}

              {aerosols.map((ae, ai) => {
                const u = (localSec * 0.42 + ae.seedOffset) % 1;
                const x = ae.launchX + Math.pow(u, 1.15) * ae.driftX;
                const y = 942 - Math.sin(u * Math.PI * 0.72) * ae.archH - u * 115;
                const op = burstPhase * smoothstep(Math.min(u * 6, (1 - u) * 3.5));
                return (
                  <g key={ai} opacity={op}>
                    <circle
                      cx={x}
                      cy={y}
                      r={ae.r}
                      fill="rgba(222, 238, 238, 0.72)"
                      stroke="#FFFFFF"
                      strokeWidth={0.9}
                    />
                    {ae.hasSpore && (
                      <circle cx={x} cy={y} r={ae.r * 0.52} fill={IDENTITY.amberSpore} />
                    )}
                  </g>
                );
              })}

              {/* Wind Direction Callout Inside Upper-Right Viewport */}
              <text
                x={1296}
                y={554}
                textAnchor="end"
                fill={IDENTITY.amberLight}
                fontFamily={IDENTITY.fontMono}
                fontSize={17}
                fontWeight={700}
                letterSpacing="0.14em"
              >
                KABUT AROMA DIBAWA ANGIN →
              </text>
              <text
                x={1296}
                y={578}
                textAnchor="end"
                fill={IDENTITY.stoneText}
                fontFamily={IDENTITY.fontMono}
                fontSize={15}
                letterSpacing="0.1em"
              >
                TERCIUM SEBELUM AWAN HUJAN TIBA
              </text>
            </g>
          )}

          {/* MIT High-Speed Camera Stamp Bar Top-Left */}
          <rect x={136} y={472} width={458} height={44} fill="rgba(14, 20, 22, 0.86)" stroke="rgba(207,220,217,0.28)" strokeWidth={1.2} />
          <circle cx={162} cy={494} r={5.5} fill={IDENTITY.amberSpore} />
          <text
            x={180}
            y={500}
            fill={IDENTITY.ivoryText}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            fontWeight={600}
            letterSpacing="0.14em"
          >
            JOUNG & BUIE · MIT (NATURE COMM. 2015)
          </text>
        </g>

        {/* Viewport Outer Brass/Steel Frame */}
        <rect
          x={112}
          y={448}
          width={1216}
          height={918}
          fill="none"
          stroke="rgba(207, 220, 217, 0.34)"
          strokeWidth={2}
        />

        {/* ================================================================ */}
        {/* BOTTOM PHYSICAL COMPARISON: GERIMIS PELAN VS HUJAN DERAS         */}
        {/* ================================================================ */}
        <g
          transform={`translate(112, ${1418 + (1 - compareEnter) * 28})`}
          opacity={compareEnter}
        >
          {/* Left Chamber: Light Drizzle (Optimal Aerosol) */}
          <rect
            x={0}
            y={0}
            width={592}
            height={212}
            fill="rgba(20, 29, 27, 0.9)"
            stroke={IDENTITY.amberSpore}
            strokeWidth={2}
          />
          <IllustratedWaterDroplet cx={88} cy={92} radius={26} uid="s2-cmp-light" teardrop />
          {[62, 88, 114].map((bx, i) => (
            <circle key={i} cx={bx} cy={148 - i * 8} r={4.5} fill={IDENTITY.amberLight} />
          ))}
          <line x1={38} y1={164} x2={138} y2={164} stroke="#8A563C" strokeWidth={5} />
          <text
            x={172}
            y={64}
            fill={IDENTITY.amberLight}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            fontWeight={700}
            letterSpacing="0.14em"
          >
            GERIMIS PELAN & SEDANG
          </text>
          <text
            x={172}
            y={108}
            fill={IDENTITY.ivoryText}
            fontFamily={IDENTITY.fontEditorial}
            fontSize={31}
            fontWeight={700}
            letterSpacing="0.04em"
          >
            GELEMBUNG SEMPAT MELETUP
          </text>
          <text
            x={172}
            y={144}
            fill={IDENTITY.mossLight}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            fontWeight={600}
            letterSpacing="0.08em"
          >
            WANGI TANAH PALING KUAT
          </text>

          {/* Right Chamber: Heavy Downpour (Suppressed Bubbles) */}
          <rect
            x={624}
            y={0}
            width={592}
            height={212}
            fill="rgba(16, 21, 23, 0.86)"
            stroke="rgba(207, 220, 217, 0.24)"
            strokeWidth={1.5}
          />
          <IllustratedWaterDroplet cx={712} cy={98} radius={38} uid="s2-cmp-heavy" teardrop />
          <line x1={662} y1={164} x2={762} y2={164} stroke="#5B3A29" strokeWidth={5} />
          <text
            x={796}
            y={64}
            fill={IDENTITY.stoneText}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            fontWeight={600}
            letterSpacing="0.14em"
          >
            HUJAN DERAS / BADAI
          </text>
          <text
            x={796}
            y={108}
            fill="rgba(242, 239, 232, 0.76)"
            fontFamily={IDENTITY.fontEditorial}
            fontSize={31}
            fontWeight={700}
            letterSpacing="0.04em"
          >
            HANTAMAN TERLALU CEPAT
          </text>
          <text
            x={796}
            y={144}
            fill={IDENTITY.mutedText}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            letterSpacing="0.08em"
          >
            GELEMBUNG GAGAL TERBENTUK
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// 8. SCENE 03 — MIKROSKOP STREPTOMYCES & SPORA GEOSMIN (26.050s – 42.780s)
// ============================================================================

export const Scene03PabrikStreptomyces: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[2];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const humusUrl = useProceduralSurface('humus-micro');
  const lateriteUrl = useProceduralSurface('cracked-laterite');
  const sporeUrl = useProceduralSurface('spore-amber');

  // At 33.89s narrator shifts from "2/3 antibiotik medis dunia" -> "Ketika tanah mengering saat kemarau..."
  const droughtPhase = easeInOutCubic(prog(globalSec, 33.6, 36.4));
  const sporulationProg = easeOutCubic(prog(globalSec, 35.2, 39.8));
  const hyphaeGrow = easeOutCubic(prog(localSec, 0.4, 3.6));

  const cx = 720;
  const cy = 925;
  const lensR = 374;

  // Branching filamentous Streptomyces aerial hyphae & curled spiral spore tips
  const filaments = useMemo(
    () => [
      {
        stem: 'M 548,1135 C 538,1045 505,965 524,865 C 536,804 512,748 532,695',
        branch: 'M 524,895 C 478,852 448,815 436,762',
        spores: [
          [532, 688],
          [542, 668],
          [534, 648],
          [516, 638],
          [436, 756],
          [428, 736],
        ],
      },
      {
        stem: 'M 652,1148 C 646,1032 678,925 654,805 C 642,742 668,678 652,618',
        branch: 'M 658,842 C 608,792 586,742 594,686',
        spores: [
          [652, 610],
          [664, 590],
          [654, 570],
          [636, 560],
          [622, 574],
          [594, 678],
          [602, 658],
        ],
      },
      {
        stem: 'M 758,1152 C 774,1038 738,918 766,796 C 782,728 756,664 774,604',
        branch: 'M 762,832 C 816,784 842,732 832,672',
        spores: [
          [774, 596],
          [786, 576],
          [776, 556],
          [758, 548],
          [832, 664],
          [842, 644],
          [830, 626],
        ],
      },
      {
        stem: 'M 878,1132 C 892,1035 928,954 906,858 C 892,796 918,742 898,688',
        branch: 'M 908,888 C 958,848 986,808 996,754',
        spores: [
          [898, 680],
          [910, 660],
          [900, 642],
          [996, 746],
          [1004, 726],
        ],
      },
    ],
    [],
  );

  const isDroughtHeader = globalSec >= 33.85;

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="monsoon-slate"
        surfaceOpacity={0.26}
        warmLampX={50}
        warmLampY={44}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure={isDroughtHeader ? 'C12H22O' : '2 / 3'}
        unit={isDroughtHeader ? 'GEOSMIN' : 'ANTIBIOTIK DUNIA'}
        subtitle={
          isDroughtHeader
            ? 'SAAT TANAH KEMARAU KERING · MERACIK SPORA & PARFUM BUMI'
            : 'BAKTERI BENANG STREPTOMYCES · PENGHASIL OBAT MEDIS MODERN'
        }
        localSec={localSec}
        accentColor={isDroughtHeader ? IDENTITY.amberSpore : IDENTITY.mossLight}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s3-lens-clip">
            <circle cx={cx} cy={cy} r={lensR} />
          </clipPath>
          <linearGradient id="s3-brass-bezel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E6C275" />
            <stop offset="48%" stopColor="#9E7329" />
            <stop offset="100%" stopColor="#4F370E" />
          </linearGradient>
        </defs>

        {/* ================================================================ */}
        {/* CENTERPIECE: BRASS BOTANICAL MICROSCOPE FIELD VIEWPORT           */}
        {/* ================================================================ */}
        {/* Precision Degree Ring Around Microscope Stage */}
        {Array.from({ length: 72 }).map((_, i) => {
          const a = (i * 5 * Math.PI) / 180;
          const r1 = lensR + 18;
          const r2 = lensR + (i % 6 === 0 ? 34 : 25);
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * r1}
              y1={cy + Math.sin(a) * r1}
              x2={cx + Math.cos(a) * r2}
              y2={cy + Math.sin(a) * r2}
              stroke={i % 6 === 0 ? 'rgba(236, 199, 126, 0.48)' : 'rgba(242, 239, 232, 0.16)'}
              strokeWidth={i % 6 === 0 ? 1.8 : 1}
            />
          );
        })}

        <g clipPath="url(#s3-lens-clip)">
          <circle cx={cx} cy={cy} r={lensR} fill="#121410" />

          {/* Expanding Concentric Geosmin Aroma Halos During Sporulation */}
          {sporulationProg > 0.02 &&
            [0, 0.33, 0.66].map((off, hi) => {
              const u = (localSec * 0.28 + off) % 1;
              return (
                <circle
                  key={hi}
                  cx={cx}
                  cy={710}
                  r={65 + u * 310}
                  fill="none"
                  stroke={IDENTITY.amberLight}
                  strokeWidth={2.2 * (1 - u)}
                  opacity={sporulationProg * (1 - u) * 0.55}
                />
              );
            })}

          {/* Subterranean Soil Bed Transitioning From Rich Humus to Dry Cracked Clay */}
          <path
            d="M 330,1115 Q 535,1085 720,1118 T 1110,1108 L 1110,1320 L 330,1320 Z"
            fill="#281E15"
          />
          {humusUrl && (
            <image
              href={humusUrl}
              x={330}
              y={1085}
              width={780}
              height={240}
              preserveAspectRatio="none"
              opacity={0.75 * (1 - droughtPhase * 0.55)}
            />
          )}
          {lateriteUrl && droughtPhase > 0.01 && (
            <image
              href={lateriteUrl}
              x={330}
              y={1085}
              width={780}
              height={240}
              preserveAspectRatio="none"
              opacity={droughtPhase * 0.72}
            />
          )}

          {/* Root-like Substrate Mycelium Web Beneath Soil Line */}
          {[
            'M 548,1135 C 512,1185 468,1222 422,1254',
            'M 652,1148 C 632,1205 668,1248 642,1285',
            'M 758,1152 C 792,1204 762,1252 804,1288',
            'M 878,1132 C 918,1182 954,1218 992,1258',
          ].map((rd, ri) => (
            <TrimPath
              key={ri}
              d={rd}
              progress={hyphaeGrow}
              stroke="rgba(214, 204, 178, 0.42)"
              strokeWidth={2.4}
            />
          ))}

          {/* Aerial Branching Streptomyces Filaments & Golden Spore Chains */}
          {filaments.map((fl, fi) => {
            const sway = Math.sin(localSec * 1.2 + fi * 1.3) * 4;
            return (
              <g key={fi} transform={`translate(${sway}, 0)`}>
                <TrimPath
                  d={fl.stem}
                  progress={hyphaeGrow}
                  stroke="#D9DFC8"
                  strokeWidth={6.5}
                />
                <TrimPath
                  d={fl.stem}
                  progress={hyphaeGrow}
                  stroke={IDENTITY.mossSage}
                  strokeWidth={3}
                />
                <TrimPath
                  d={fl.branch}
                  progress={clamp01((hyphaeGrow - 0.35) / 0.65)}
                  stroke="#D9DFC8"
                  strokeWidth={4.6}
                />
                {fl.spores.map(([sx, sy], si) => {
                  const spAppear = clamp01(
                    (hyphaeGrow * 0.45 + sporulationProg * 0.85) - si * 0.05,
                  );
                  if (spAppear <= 0.02) return null;
                  return (
                    <g key={si} opacity={spAppear}>
                      <AmberSporeCluster
                        cx={sx}
                        cy={sy}
                        size={9.5 + sporulationProg * 3}
                        sporeUrl={sporeUrl}
                        rotation={fi * 40 + si * 25}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Optical Microscope Crosshair & Magnification Scale */}
          <line x1={cx - 28} y1={cy} x2={cx + 28} y2={cy} stroke="rgba(242,239,232,0.22)" strokeWidth={1.2} />
          <line x1={cx} y1={cy - 28} x2={cx} y2={cy + 28} stroke="rgba(242,239,232,0.22)" strokeWidth={1.2} />
          <line x1={620} y1={1252} x2={820} y2={1252} stroke={IDENTITY.ivoryText} strokeWidth={2} />
          <line x1={620} y1={1244} x2={620} y2={1260} stroke={IDENTITY.ivoryText} strokeWidth={2} />
          <line x1={820} y1={1244} x2={820} y2={1260} stroke={IDENTITY.ivoryText} strokeWidth={2} />
          <text
            x={720}
            y={1278}
            textAnchor="middle"
            fill={IDENTITY.ivoryText}
            fontFamily={IDENTITY.fontMono}
            fontSize={15}
            fontWeight={600}
            letterSpacing="0.16em"
          >
            PERBESARAN 1.200× · 10 MIKROMETER
          </text>
        </g>

        {/* Machined Brass Microscope Bezel Rim */}
        <circle
          cx={cx}
          cy={cy}
          r={lensR}
          fill="none"
          stroke="url(#s3-brass-bezel)"
          strokeWidth={15}
        />
        <circle
          cx={cx}
          cy={cy}
          r={lensR - 9}
          fill="none"
          stroke="rgba(255, 246, 214, 0.35)"
          strokeWidth={1.4}
        />

        {/* ================================================================ */}
        {/* UPPER-LEFT ARTIFACT: AMBER GLASS ANTIBIOTIC APOTHECARY VIAL      */}
        {/* ================================================================ */}
        <g
          transform="translate(114, 468)"
          opacity={easeOutCubic(prog(localSec, 0.6, 1.5))}
        >
          <ellipse cx={86} cy={236} rx={68} ry={12} fill="rgba(0,0,0,0.45)" />
          {/* Aluminum Crimp Cap & Rubber Stopper */}
          <rect x={56} y={14} width={60} height={24} rx={3} fill="#C6C9C4" stroke="#575B56" strokeWidth={1.5} />
          <rect x={64} y={38} width={44} height={16} fill="#5C3622" />
          {/* Amber Glass Medicine Bottle */}
          <path
            d="M 64,54 L 38,84 L 38,218 C 38,228 48,234 86,234 C 124,234 134,228 134,218 L 134,84 L 108,54 Z"
            fill="#6E3E19"
            stroke="#D8A148"
            strokeWidth={2}
          />
          <path d="M 48,92 L 48,214" stroke="rgba(255, 236, 194, 0.42)" strokeWidth={4} strokeLinecap="round" />
          {/* Cream Paper Apothecary Label */}
          <rect x={44} y={108} width={84} height={82} fill={IDENTITY.paperHerbarium} stroke="#2A2218" strokeWidth={1.2} />
          <text x={86} y={132} textAnchor="middle" fill={IDENTITY.stampRust} fontFamily={IDENTITY.fontMono} fontSize={11} fontWeight={700}>
            STREPTOMYCIN
          </text>
          <line x1={52} y1={140} x2={120} y2={140} stroke="#2A2218" strokeWidth={1} />
          <text x={86} y={162} textAnchor="middle" fill={IDENTITY.paperInk} fontFamily={IDENTITY.fontEditorial} fontSize={20} fontWeight={700}>
            2/3 OBAT
          </text>
          <text x={86} y={180} textAnchor="middle" fill={IDENTITY.paperMuted} fontFamily={IDENTITY.fontMono} fontSize={10} fontWeight={600}>
            ANTIBIOTIK
          </text>
        </g>

        {/* UPPER-RIGHT ARTIFACT: GEOSMIN MOLECULE TOKEN */}
        <g opacity={sporulationProg}>
          <GeosminBrassMedallion
            cx={1208}
            cy={585}
            radius={94}
            rotationDeg={localSec * 4}
          />
        </g>

        {/* ================================================================ */}
        {/* BOTTOM BIOLOGICAL TRIGGER SEQUENCE BAR                           */}
        {/* ================================================================ */}
        <g transform="translate(108, 1438)">
          <rect
            x={0}
            y={0}
            width={1224}
            height={176}
            fill="rgba(18, 20, 17, 0.9)"
            stroke="rgba(216, 161, 72, 0.34)"
            strokeWidth={1.8}
          />
          {[
            {
              x: 42,
              step: 'TAHAP 1 · KEMARAU',
              title: 'TANAH KERING',
              desc: 'KOLONI TERANCAM MATI',
              active: true,
            },
            {
              x: 452,
              step: 'TAHAP 2 · DARURAT',
              title: 'BENTUK SPORA',
              desc: 'CANGKANG TAHAN BANTING',
              active: droughtPhase > 0.3,
            },
            {
              x: 862,
              step: 'TAHAP 3 · SINYAL KIMIA',
              title: 'LEPAS GEOSMIN',
              desc: 'PARFUM BUMI C12H22O',
              active: sporulationProg > 0.3,
            },
          ].map((st, idx) => (
            <g key={idx} transform={`translate(${st.x}, 32)`}>
              <text
                x={0}
                y={18}
                fill={st.active ? IDENTITY.amberLight : IDENTITY.mutedText}
                fontFamily={IDENTITY.fontMono}
                fontSize={15}
                fontWeight={700}
                letterSpacing="0.12em"
              >
                {st.step}
              </text>
              <text
                x={0}
                y={66}
                fill={st.active ? IDENTITY.ivoryText : IDENTITY.stoneText}
                fontFamily={IDENTITY.fontEditorial}
                fontSize={34}
                fontWeight={700}
                letterSpacing="0.04em"
              >
                {st.title}
              </text>
              <text
                x={0}
                y={98}
                fill={IDENTITY.stoneText}
                fontFamily={IDENTITY.fontMono}
                fontSize={15}
                letterSpacing="0.08em"
              >
                {st.desc}
              </text>
              {idx < 2 && (
                <text
                  x={354}
                  y={64}
                  fill={IDENTITY.amberSpore}
                  fontFamily={IDENTITY.fontMono}
                  fontSize={28}
                  fontWeight={700}
                >
                  →
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// 9. SCENE 04 — 400 KOLAM OLIMPIADE VS PENCIUMAN HIU (42.780s – 59.490s)
// ============================================================================

export const Scene04EmpatRatusKolam: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[3];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const poolTexUrl = useProceduralSurface('pool-ceramic');
  const sporeUrl = useProceduralSurface('spore-amber');

  // Narrator says "Kepekaan kita terhadap bau hujan 200.000 kali lebih tajam daripada hiu..." at 53.48s
  const panToShark = easeInOutCubic(prog(globalSec, 52.85, 54.05));
  const panY = interpolate(panToShark, [0, 1], [0, -1240]);

  const dropTip = easeInOutCubic(prog(localSec, 0.35, 1.55));
  const poolWave = easeOutCubic(prog(localSec, 1.45, 5.2));

  const isSharkAct = globalSec >= 53.35;

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="monsoon-slate"
        surfaceOpacity={0.25}
        warmLampX={50}
        warmLampY={46}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure={isSharkAct ? '200.000×' : '5 PPT'}
        unit={isSharkAct ? 'LEBIH TAJAM' : 'BAGIAN / TRILIUN'}
        subtitle={
          isSharkAct
            ? 'KEPEKAAN HIDUNG MANUSIA PADA HUJAN VS HIU MENCIUM DARAH'
            : 'SETARA 1 SENDOK TEH GEOSMIN DI 400 KOLAM RENANG OLIMPIADE'
        }
        localSec={localSec}
        accentColor={isSharkAct ? IDENTITY.amberSpore : IDENTITY.rainMist}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s4-stage-window">
            <rect x={0} y={415} width={1440} height={1360} />
          </clipPath>
          <linearGradient id="s4-silver-spoon" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#F4F6F5" />
            <stop offset="48%" stopColor="#AEB8BA" />
            <stop offset="100%" stopColor="#647073" />
          </linearGradient>
          <linearGradient id="s4-shark-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#566870" />
            <stop offset="58%" stopColor="#3B4A52" />
            <stop offset="62%" stopColor="#CBD3D4" />
            <stop offset="100%" stopColor="#9AA6A8" />
          </linearGradient>
        </defs>

        <g clipPath="url(#s4-stage-window)">
          <g transform={`translate(0, ${panY})`}>
            {/* ============================================================ */}
            {/* ACT 1: 1 TEASPOON OVER 400 OLYMPIC SWIMMING POOLS (20 x 20)  */}
            {/* ============================================================ */}
            <g opacity={1 - smoothstep(prog(panToShark, 0.55, 0.96))}>
              {/* Illustrated Gleaming Silver Teaspoon (5 mL) */}
              <g
                transform={`translate(720, 512) rotate(${interpolate(
                  dropTip,
                  [0, 1],
                  [-4, 14],
                )})`}
              >
                {/* Handle */}
                <path
                  d="M -290,-18 L -48,-8 L -48,6 L -290,4 C -306,2 -306,-16 -290,-18 Z"
                  fill="url(#s4-silver-spoon)"
                  stroke="#E8EEEE"
                  strokeWidth={1.4}
                />
                {/* Spoon Bowl Holding Amber Geosmin */}
                <path
                  d="M -52,-10 C -18,-14 48,-14 82,-2 C 92,14 52,32 -4,30 C -42,28 -58,10 -52,-10 Z"
                  fill="url(#s4-silver-spoon)"
                  stroke="#F2F6F6"
                  strokeWidth={1.8}
                />
                <ellipse cx={22} cy={6} rx={42} ry={10} fill={IDENTITY.amberSpore} />
                <text
                  x={-165}
                  y={-30}
                  textAnchor="middle"
                  fill={IDENTITY.amberLight}
                  fontFamily={IDENTITY.fontMono}
                  fontSize={16}
                  fontWeight={700}
                  letterSpacing="0.14em"
                >
                  1 SENDOK TEH (5 mL GEOSMIN)
                </text>
              </g>

              {/* Single Falling Amber Drop */}
              {dropTip > 0.25 && (
                <AmberSporeCluster
                  cx={798}
                  cy={interpolate(clamp01((dropTip - 0.25) / 0.75), [0, 1], [542, 658])}
                  size={10}
                  sporeUrl={sporeUrl}
                />
              )}

              {/* 20 Columns x 20 Rows = 400 Olympic Swimming Pools Architectural Array */}
              <g transform="translate(140, 646)">
                <rect
                  x={-14}
                  y={-14}
                  width={1188}
                  height={772}
                  fill="rgba(14, 24, 27, 0.9)"
                  stroke="rgba(207, 220, 217, 0.28)"
                  strokeWidth={1.8}
                />
                {poolTexUrl && (
                  <image
                    href={poolTexUrl}
                    x={0}
                    y={0}
                    width={1160}
                    height={744}
                    preserveAspectRatio="none"
                    opacity={0.24}
                  />
                )}

                {Array.from({ length: 400 }).map((_, idx) => {
                  const col = idx % 20;
                  const row = Math.floor(idx / 20);
                  const px = col * 58 + 4;
                  const py = row * 37.2 + 4;
                  const dist = Math.hypot((col - 10.5) / 14, (row - 9.5) / 14);
                  const lit = clamp01((poolWave * 1.45 - dist) * 3.2);
                  return (
                    <g key={idx}>
                      <rect
                        x={px}
                        y={py}
                        width={50}
                        height={29}
                        fill={lit > 0.1 ? '#4E8289' : '#264750'}
                        stroke="rgba(232, 240, 240, 0.36)"
                        strokeWidth={0.9}
                      />
                      {/* Pool Racing Lane Line */}
                      <line
                        x1={px + 5}
                        y1={py + 14.5}
                        x2={px + 45}
                        y2={py + 14.5}
                        stroke={
                          lit > 0.25
                            ? 'rgba(236, 199, 126, 0.68)'
                            : 'rgba(207, 220, 217, 0.22)'
                        }
                        strokeWidth={0.9}
                      />
                    </g>
                  );
                })}

                {/* Expanding Golden Detection Wave Ring */}
                {poolWave > 0.05 && (
                  <circle
                    cx={618}
                    cy={360}
                    r={poolWave * 640}
                    fill="none"
                    stroke={IDENTITY.amberLight}
                    strokeWidth={3 * (1 - poolWave * 0.65)}
                    opacity={0.75 * (1 - poolWave * 0.5)}
                  />
                )}
              </g>

              {/* Scale Caption Plaque Under 400 Pools */}
              <g transform="translate(126, 1448)">
                <rect
                  x={0}
                  y={0}
                  width={1188}
                  height={146}
                  fill="rgba(18, 24, 25, 0.92)"
                  stroke="rgba(216, 161, 72, 0.36)"
                  strokeWidth={1.8}
                />
                <text
                  x={594}
                  y={52}
                  textAnchor="middle"
                  fill={IDENTITY.amberLight}
                  fontFamily={IDENTITY.fontMono}
                  fontSize={17}
                  fontWeight={700}
                  letterSpacing="0.16em"
                >
                  20 × 20 = 400 KOLAM RENANG OLIMPIADE (1 MILIAR LITER AIR)
                </text>
                <text
                  x={594}
                  y={106}
                  textAnchor="middle"
                  fill={IDENTITY.ivoryText}
                  fontFamily={IDENTITY.fontEditorial}
                  fontSize={38}
                  fontWeight={700}
                  letterSpacing="0.04em"
                >
                  1 SENDOK TEH MASIH TERCIUM JELAS OLEH HIDUNGMU
                </text>
              </g>
            </g>

            {/* ============================================================ */}
            {/* ACT 2: GREAT WHITE SHARK (1 PPM) VS HUMAN NOSE (5 PPT)       */}
            {/* ============================================================ */}
            <g transform="translate(0, 1240)">
              {/* Upper Specimen Box: Great White Shark Blood Threshold */}
              <g transform="translate(116, 468)">
                <rect
                  x={0}
                  y={0}
                  width={1208}
                  height={495}
                  fill="rgba(14, 24, 28, 0.92)"
                  stroke="rgba(207, 220, 217, 0.26)"
                  strokeWidth={1.8}
                />
                <text
                  x={44}
                  y={52}
                  fill={IDENTITY.stoneText}
                  fontFamily={IDENTITY.fontMono}
                  fontSize={17}
                  fontWeight={700}
                  letterSpacing="0.16em"
                >
                  PEMBANDING PREDATOR LAUT · HIU PUTIH BESAR
                </text>

                {/* Detailed 2D Naturalist Side-Elevation of Great White Shark */}
                <g
                  transform={`translate(${620 + Math.sin(localSec * 1.4) * 14}, 238)`}
                >
                  {/* Caudal Crescent Tail Fin */}
                  <path
                    d="M -312,0 L -408,-96 C -382,-36 -376,-8 -364,0 C -376,12 -382,38 -402,86 Z"
                    fill="#465760"
                    stroke="rgba(220,232,234,0.34)"
                    strokeWidth={1.5}
                  />
                  {/* Iconic Dorsal Fin */}
                  <path
                    d="M -38,-48 L 16,-152 C 32,-112 46,-76 68,-46 Z"
                    fill="#465760"
                    stroke="rgba(220,232,234,0.38)"
                    strokeWidth={1.6}
                  />
                  {/* Pectoral Fin */}
                  <path
                    d="M 62,32 L -12,126 C 34,104 82,72 118,38 Z"
                    fill="#394850"
                    stroke="rgba(220,232,234,0.32)"
                    strokeWidth={1.5}
                  />
                  {/* Torpedo Fuselage Body with Countershading */}
                  <path
                    d="M -330,0 C -225,-56 -55,-68 118,-52 C 228,-42 318,-18 378,6 C 324,38 232,54 118,56 C -55,58 -220,36 -330,0 Z"
                    fill="url(#s4-shark-body)"
                    stroke="rgba(232, 240, 242, 0.42)"
                    strokeWidth={1.8}
                  />
                  {/* 5 Gill Slits & Eye */}
                  {[162, 174, 186, 198, 210].map((gx, gi) => (
                    <line
                      key={gi}
                      x1={gx}
                      y1={-12}
                      x2={gx - 4}
                      y2={20}
                      stroke="#1D262B"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                    />
                  ))}
                  <circle cx={296} cy={-6} r={6} fill="#101619" stroke="#DCE4E6" strokeWidth={1.2} />
                  {/* Tiny Crimson Blood Scent Droplet Target */}
                  <circle cx={432} cy={4} r={8} fill="#A63429" stroke="#F2D4CE" strokeWidth={1.5} />
                  <circle
                    cx={432}
                    cy={4}
                    r={22 + ((localSec * 1.1) % 1) * 34}
                    fill="none"
                    stroke="rgba(186, 62, 48, 0.55)"
                    strokeWidth={1.8}
                  />
                </g>

                <text
                  x={44}
                  y={424}
                  fill={IDENTITY.ivoryText}
                  fontFamily={IDENTITY.fontEditorial}
                  fontSize={36}
                  fontWeight={700}
                  letterSpacing="0.04em"
                >
                  HIU MENCIUM DARAH: 1 BAGIAN PER JUTA (1 PPM)
                </text>
                <text
                  x={44}
                  y={458}
                  fill={IDENTITY.stoneText}
                  fontFamily={IDENTITY.fontMono}
                  fontSize={16}
                  letterSpacing="0.1em"
                >
                  BUTUH KONSENTRASI 200.000 KALI LEBIH PEKAT DARI GEOSMIN
                </text>
              </g>

              {/* Lower Specimen Box: Human Olfactory Super-Sensitivity */}
              <g transform="translate(116, 1006)">
                <rect
                  x={0}
                  y={0}
                  width={1208}
                  height={578}
                  fill="rgba(22, 26, 20, 0.95)"
                  stroke={IDENTITY.amberSpore}
                  strokeWidth={2.4}
                />
                <text
                  x={44}
                  y={54}
                  fill={IDENTITY.amberLight}
                  fontFamily={IDENTITY.fontMono}
                  fontSize={17}
                  fontWeight={700}
                  letterSpacing="0.16em"
                >
                  REKOR PENCIUMAN MANUSIA · RESEPTOR OR4D2 / GEOSMIN
                </text>

                {/* Sculpted Classical Editorial Profile of Human Nose & Inhaled Rain Plume */}
                <g transform="translate(215, 118)">
                  <path
                    d="M 96,12 C 98,58 118,108 156,168 C 174,196 168,224 138,232 C 114,238 94,232 76,226 C 84,256 96,280 80,304"
                    fill="none"
                    stroke={IDENTITY.ivoryText}
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Nostril curve */}
                  <path
                    d="M 102,216 C 118,208 134,212 142,222"
                    fill="none"
                    stroke={IDENTITY.amberLight}
                    strokeWidth={3.5}
                    strokeLinecap="round"
                  />
                  {/* Golden Geosmin Scent Ribbons Drawn Into Nostril */}
                  {[
                    'M 425,185 C 335,165 235,235 132,222',
                    'M 455,238 C 352,218 248,262 136,228',
                    'M 398,136 C 312,126 225,204 128,216',
                  ].map((sd, si) => (
                    <TrimPath
                      key={si}
                      d={sd}
                      progress={clamp01((panToShark - 0.25) / 0.75)}
                      stroke={si === 1 ? IDENTITY.mossLight : IDENTITY.amberLight}
                      strokeWidth={3}
                    />
                  ))}
                  <GeosminBrassMedallion cx={535} cy={192} radius={86} rotationDeg={localSec * 5} />
                </g>

                <text
                  x={44}
                  y={488}
                  fill={IDENTITY.amberLight}
                  fontFamily={IDENTITY.fontEditorial}
                  fontSize={42}
                  fontWeight={700}
                  letterSpacing="0.04em"
                >
                  MANUSIA MENCIUM HUJAN: 5 BAGIAN PER TRILIUN (5 PPT)
                </text>
                <text
                  x={44}
                  y={528}
                  fill={IDENTITY.ivoryText}
                  fontFamily={IDENTITY.fontMono}
                  fontSize={18}
                  fontWeight={700}
                  letterSpacing="0.12em"
                >
                  200.000 KALI LEBIH TAJAM DARIPADA HIU MENCIUM DARAH
                </text>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
