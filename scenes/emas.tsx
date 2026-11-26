import React, { useEffect, useMemo, useState } from 'react';
import {
  AbsoluteFill,
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
import {
  geoGraticule10,
  geoNaturalEarth1,
  geoOrthographic,
  geoPath,
  type GeoPermissibleObjects,
} from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import land50m from 'world-atlas/land-50m.json';
import land110m from 'world-atlas/land-110m.json';
import {
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeInOutQuart,
  easeOutCubic,
  easeOutExpo,
  easeOutQuint,
  prog,
  smoothstep,
} from './script';

// ============================================================================
// 1. DETERMINISTIC SEEDED PRNG & SIMPLEX NOISE ENGINE (ZERO CACHE THRASH)
// ============================================================================

export const mulberry32 = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const hashStr = (str: string): number => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const SHARED_NOISE_2D = createNoise2D(mulberry32(790024));

export const fbm2D = (
  seedTag: string,
  x: number,
  y: number,
  octaves = 4,
  lacunarity = 2.05,
  gain = 0.5,
): number => {
  const h = hashStr(seedTag);
  const ox = (h & 0xffff) * 0.137;
  const oy = ((h >>> 16) & 0xffff) * 0.173;
  let amp = 0.5;
  let freq = 1;
  let total = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    total += amp * SHARED_NOISE_2D(x * freq + ox + i * 31.7, y * freq + oy + i * 47.3);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return total / (norm || 1);
};

export const ridge2D = (
  seedTag: string,
  x: number,
  y: number,
  octaves = 4,
): number => {
  const h = hashStr(seedTag);
  const ox = (h & 0xffff) * 0.193;
  const oy = ((h >>> 16) & 0xffff) * 0.229;
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    const n = SHARED_NOISE_2D(x * freq + ox + i * 19.1, y * freq + oy + i * 29.9);
    const r = 1 - Math.abs(n);
    sum += amp * r * r;
    norm += amp;
    amp *= 0.52;
    freq *= 2.12;
  }
  return sum / (norm || 1);
};

// ============================================================================
// 2. NATURAL EARTH TOPOJSON + D3-GEO CARTOGRAPHY ENGINE (CACHED O(1))
// ============================================================================

let cachedLand50: GeoPermissibleObjects | null = null;
let cachedLand110: GeoPermissibleObjects | null = null;
let cachedGraticule: GeoPermissibleObjects | null = null;

export const getNaturalEarth50 = (): GeoPermissibleObjects => {
  if (!cachedLand50) {
    const topo = land50m as unknown as Topology;
    cachedLand50 = feature(topo, topo.objects.land) as unknown as GeoPermissibleObjects;
  }
  return cachedLand50;
};

export const getNaturalEarth110 = (): GeoPermissibleObjects => {
  if (!cachedLand110) {
    const topo = land110m as unknown as Topology;
    cachedLand110 = feature(topo, topo.objects.land) as unknown as GeoPermissibleObjects;
  }
  return cachedLand110;
};

export const getGraticule10 = (): GeoPermissibleObjects => {
  if (!cachedGraticule) {
    cachedGraticule = geoGraticule10();
  }
  return cachedGraticule;
};

export interface OrthographicGlobeData {
  readonly landPath: string;
  readonly graticulePath: string;
  readonly spherePath: string;
  readonly project: (lon: number, lat: number) => [number, number] | null;
}

export const buildOrthographicGlobe = (
  cx: number,
  cy: number,
  radius: number,
  rotLon: number,
  rotLat = -8,
  highRes = true,
): OrthographicGlobeData => {
  const proj = geoOrthographic()
    .translate([cx, cy])
    .scale(radius)
    .rotate([rotLon, rotLat, 0])
    .clipAngle(90);
  const pathGen = geoPath(proj);
  const land = highRes ? getNaturalEarth50() : getNaturalEarth110();
  return {
    landPath: pathGen(land) || '',
    graticulePath: pathGen(getGraticule10()) || '',
    spherePath: pathGen({ type: 'Sphere' }) || '',
    project: (lon: number, lat: number) => {
      const p = proj([lon, lat]);
      return p ? [p[0], p[1]] : null;
    },
  };
};

export interface WorldMapData {
  readonly landPath: string;
  readonly graticulePath: string;
  readonly outlinePath: string;
  readonly project: (lon: number, lat: number) => [number, number] | null;
}

export const buildNaturalEarthMap = (
  x: number,
  y: number,
  width: number,
  height: number,
): WorldMapData => {
  const proj = geoNaturalEarth1().fitExtent(
    [
      [x, y],
      [x + width, y + height],
    ],
    { type: 'Sphere' },
  );
  const pathGen = geoPath(proj);
  return {
    landPath: pathGen(getNaturalEarth110()) || '',
    graticulePath: pathGen(getGraticule10()) || '',
    outlinePath: pathGen({ type: 'Sphere' }) || '',
    project: (lon: number, lat: number) => {
      const p = proj([lon, lat]);
      return p ? [p[0], p[1]] : null;
    },
  };
};

// ============================================================================
// 3. PROCEDURAL MINERAL, BULLION, PAPER & HILLSHADE TEXTURE ENGINE (O(1) CACHE)
// ============================================================================

export type SurfaceTextureKind =
  | 'suede-slate'
  | 'cotton-paper'
  | 'voronoi-gold'
  | 'hammered-gold'
  | 'cast-iron'
  | 'lunar-litho'
  | 'stellar-convection'
  | 'volcano-hillshade'
  | 'walnut-grain';

const SURFACE_CACHE = new Map<SurfaceTextureKind, string>();

const generateSurfaceDataUrl = (kind: SurfaceTextureKind): string => {
  const cached = SURFACE_CACHE.get(kind);
  if (cached) return cached;
  if (typeof document === 'undefined') return '';

  const isWide = kind === 'volcano-hillshade' || kind === 'cotton-paper';
  const w = isWide ? 480 : 320;
  const h = kind === 'volcano-hillshade' ? 240 : isWide ? 320 : 320;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (kind === 'voronoi-gold' || kind === 'cast-iron') {
    const isGold = kind === 'voronoi-gold';
    const rand = mulberry32(isGold ? 7924 : 2656);
    const numCells = isGold ? 135 : 110;
    const pts: [number, number][] = [];
    for (let i = 0; i < numCells; i++) {
      pts.push([rand() * w, rand() * h]);
    }
    const delaunay = Delaunay.from(pts);
    const voronoi = delaunay.voronoi([0, 0, w, h]);

    ctx.fillStyle = isGold ? '#B88428' : '#586068';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < numCells; i++) {
      const poly = voronoi.cellPolygon(i);
      if (!poly) continue;
      const tone = rand();
      const angle = rand() * Math.PI;
      ctx.save();
      ctx.beginPath();
      for (let k = 0; k < poly.length; k++) {
        if (k === 0) ctx.moveTo(poly[k][0], poly[k][1]);
        else ctx.lineTo(poly[k][0], poly[k][1]);
      }
      ctx.closePath();

      const cxCell = pts[i][0];
      const cyCell = pts[i][1];
      const g = ctx.createLinearGradient(
        cxCell - Math.cos(angle) * 28,
        cyCell - Math.sin(angle) * 28,
        cxCell + Math.cos(angle) * 28,
        cyCell + Math.sin(angle) * 28,
      );
      if (isGold) {
        const hi = tone > 0.72 ? '#F6E6AE' : tone > 0.35 ? '#E3BB63' : '#C89232';
        const lo = tone > 0.72 ? '#CE9A38' : tone > 0.35 ? '#9F6D1C' : '#7D5210';
        g.addColorStop(0, hi);
        g.addColorStop(1, lo);
      } else {
        const hi = tone > 0.68 ? '#C2C9CF' : tone > 0.35 ? '#8B939B' : '#636B73';
        const lo = tone > 0.68 ? '#7D858D' : tone > 0.35 ? '#4E555C' : '#353B42';
        g.addColorStop(0, hi);
        g.addColorStop(1, lo);
      }
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = isGold ? 'rgba(255, 244, 198, 0.24)' : 'rgba(210, 220, 230, 0.22)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Fine anisotropic crystal striation lines inside each grain
      ctx.clip();
      ctx.strokeStyle = isGold ? 'rgba(255, 248, 218, 0.16)' : 'rgba(235, 240, 245, 0.13)';
      ctx.lineWidth = 0.65;
      const nx = -Math.sin(angle);
      const ny = Math.cos(angle);
      for (let s = -26; s <= 26; s += 4.5) {
        const bx = cxCell + nx * s;
        const by = cyCell + ny * s;
        ctx.beginPath();
        ctx.moveTo(bx - Math.cos(angle) * 34, by - Math.sin(angle) * 34);
        ctx.lineTo(bx + Math.cos(angle) * 34, by + Math.sin(angle) * 34);
        ctx.stroke();
      }
      ctx.restore();
    }

    const out = canvas.toDataURL('image/jpeg', 0.92);
    SURFACE_CACHE.set(kind, out);
    return out;
  }

  const img = ctx.createImageData(w, h);
  const data = img.data;

  if (kind === 'volcano-hillshade') {
    // Precompute elevation grid and apply real cartographic hillshading (azimuth 315 deg, alt 38 deg)
    const elev = new Float32Array(w * h);
    for (let py = 0; py < h; py++) {
      const ny = py / h;
      for (let px = 0; px < w; px++) {
        const nx = px / w;
        const dxCenter = (nx - 0.5) * 2.2;
        // Stratovolcano cone profile with central summit crater & flanking parasitic ridges
        const dist = Math.abs(dxCenter);
        const cone = Math.max(0, 1.0 - Math.pow(dist, 0.82) * 0.92);
        const craterDip = Math.exp(-dxCenter * dxCenter * 52) * 0.22;
        const ridge = ridge2D('volc-ridge', nx * 5.2, ny * 4.4, 4) * 0.26 * cone;
        const detail = fbm2D('volc-det', nx * 13.5, ny * 11.0, 3) * 0.08;
        elev[py * w + px] = cone - craterDip + ridge + detail - ny * 0.35;
      }
    }

    const lx = -0.62;
    const ly = -0.55;
    const lz = 0.56;
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const x0 = Math.max(0, px - 1);
        const x1 = Math.min(w - 1, px + 1);
        const y0 = Math.max(0, py - 1);
        const y1 = Math.min(h - 1, py + 1);
        const dzdx = (elev[py * w + x1] - elev[py * w + x0]) * 18.0;
        const dzdy = (elev[y1 * w + px] - elev[y0 * w + px]) * 18.0;
        const invLen = 1 / Math.sqrt(dzdx * dzdx + dzdy * dzdy + 1);
        const shade = clamp01((-dzdx * lx - dzdy * ly + lz) * invLen);
        const grain = fbm2D('volc-grain', px * 0.14, py * 0.14, 2) * 8;

        const idx = (py * w + px) * 4;
        data[idx] = clamp01((26 + shade * 68 + grain) / 255) * 255;
        data[idx + 1] = clamp01((22 + shade * 56 + grain * 0.9) / 255) * 255;
        data[idx + 2] = clamp01((19 + shade * 46 + grain * 0.8) / 255) * 255;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const out = canvas.toDataURL('image/jpeg', 0.9);
    SURFACE_CACHE.set(kind, out);
    return out;
  }

  for (let py = 0; py < h; py++) {
    const ny = py / h;
    for (let px = 0; px < w; px++) {
      const nx = px / w;
      const idx = (py * w + px) * 4;

      if (kind === 'suede-slate') {
        const weave = SHARED_NOISE_2D(px * 0.35, py * 0.08) * 5;
        const cloud = fbm2D('suede-c', nx * 3.8, ny * 3.8, 3) * 11;
        const speck = SHARED_NOISE_2D(px * 0.8, py * 0.8) * 4;
        const base = 22 + weave + cloud + speck;
        data[idx] = Math.max(8, Math.min(48, base + 1));
        data[idx + 1] = Math.max(8, Math.min(48, base + 1));
        data[idx + 2] = Math.max(7, Math.min(44, base - 2));
        data[idx + 3] = 255;
      } else if (kind === 'cotton-paper') {
        const fiberH = SHARED_NOISE_2D(px * 0.28, py * 0.06) * 4.5;
        const fiberV = SHARED_NOISE_2D(px * 0.06, py * 0.28) * 4.0;
        const mottle = fbm2D('paper-m', nx * 5.2, ny * 5.2, 3) * 9;
        const fleck = SHARED_NOISE_2D(px * 0.9, py * 0.9) > 0.82 ? -14 : 0;
        data[idx] = Math.min(250, Math.max(205, 239 + fiberH + fiberV + mottle + fleck));
        data[idx + 1] = Math.min(244, Math.max(195, 230 + fiberH + fiberV + mottle * 0.9 + fleck));
        data[idx + 2] = Math.min(228, Math.max(174, 211 + fiberH + fiberV + mottle * 0.75 + fleck));
        data[idx + 3] = 255;
      } else if (kind === 'hammered-gold') {
        const r1 = ridge2D('ham-au-1', nx * 7.5, ny * 7.5, 4);
        const brush = SHARED_NOISE_2D(px * 0.04, py * 0.55) * 0.12;
        const lum = clamp01(r1 * 0.82 + brush + 0.16);
        data[idx] = Math.min(255, 132 + lum * 116);
        data[idx + 1] = Math.min(242, 88 + lum * 124);
        data[idx + 2] = Math.min(182, 22 + lum * 96);
        data[idx + 3] = 255;
      } else if (kind === 'lunar-litho') {
        const mare = fbm2D('moon-m', nx * 3.2, ny * 3.2, 4);
        const craters = ridge2D('moon-c', nx * 9.5, ny * 9.5, 4);
        const micro = fbm2D('moon-f', nx * 24, ny * 24, 2) * 0.1;
        const v = clamp01(0.46 + mare * 0.28 + (craters - 0.5) * 0.42 + micro);
        data[idx] = Math.round(62 + v * 145);
        data[idx + 1] = Math.round(60 + v * 142);
        data[idx + 2] = Math.round(56 + v * 134);
        data[idx + 3] = 255;
      } else if (kind === 'stellar-convection') {
        // Warm mineral Bénard convection cells (saffron / raw sienna / burnt umber — ZERO NEON)
        const cells = ridge2D('sun-cell', nx * 8.4, ny * 8.4, 4);
        const swirl = fbm2D('sun-swirl', nx * 4.5, ny * 4.5, 3);
        const heat = clamp01(cells * 0.8 + swirl * 0.3 + 0.14);
        data[idx] = Math.min(244, Math.round(108 + heat * 134));
        data[idx + 1] = Math.min(198, Math.round(42 + Math.pow(heat, 1.35) * 148));
        data[idx + 2] = Math.min(118, Math.round(18 + Math.pow(heat, 2.2) * 92));
        data[idx + 3] = 255;
      } else if (kind === 'walnut-grain') {
        const warp = fbm2D('walnut-w', nx * 2.4, ny * 2.4, 3) * 0.18;
        const rings = Math.sin((nx * 14 + warp * 9) * Math.PI);
        const fiber = SHARED_NOISE_2D(px * 0.55, py * 0.05) * 0.14;
        const v = clamp01(0.45 + rings * 0.22 + fiber);
        data[idx] = Math.round(22 + v * 28);
        data[idx + 1] = Math.round(16 + v * 20);
        data[idx + 2] = Math.round(12 + v * 14);
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(img, 0, 0);
  const out = canvas.toDataURL('image/jpeg', 0.9);
  SURFACE_CACHE.set(kind, out);
  return out;
};

export const useProceduralSurface = (kind: SurfaceTextureKind): string => {
  const [url, setUrl] = useState<string>(() => SURFACE_CACHE.get(kind) ?? '');

  useEffect(() => {
    if (SURFACE_CACHE.has(kind)) {
      setUrl(SURFACE_CACHE.get(kind)!);
      return;
    }
    const handle = delayRender(`surface-${kind}`);
    try {
      const built = generateSurfaceDataUrl(kind);
      setUrl(built);
    } finally {
      continueRender(handle);
    }
  }, [kind]);

  return url;
};

// ============================================================================
// 4. STUDIO MOTION GRAPHICS & ARCHIVAL DESIGN PRIMITIVES
// ============================================================================

export const TrimPath: React.FC<{
  d: string;
  progress: number;
  stroke: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
}> = ({
  d,
  progress,
  stroke,
  strokeWidth = 1.8,
  strokeDasharray,
  opacity = 1,
  strokeLinecap = 'round',
}) => {
  const p = clamp01(progress);
  if (p <= 0.001 || !d) return null;
  if (strokeDasharray) {
    return (
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap={strokeLinecap}
        opacity={opacity * p}
      />
    );
  }
  const evolved = evolvePath(p, d);
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeDasharray={evolved.strokeDasharray}
      strokeDashoffset={evolved.strokeDashoffset}
      opacity={opacity}
    />
  );
};

export const GuillocheRosette: React.FC<{
  cx: number;
  cy: number;
  R: number;
  r: number;
  d: number;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  rotationDeg?: number;
  steps?: number;
}> = ({
  cx,
  cy,
  R,
  r,
  d,
  stroke = 'rgba(212, 160, 62, 0.24)',
  strokeWidth = 1.0,
  opacity = 1,
  rotationDeg = 0,
  steps = 360,
}) => {
  const pathData = useMemo(() => {
    const pts: string[] = [];
    const k = (R - r) / r;
    const maxT = Math.PI * 2 * 6;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxT;
      const x = (R - r) * Math.cos(t) + d * Math.cos(k * t);
      const y = (R - r) * Math.sin(t) - d * Math.sin(k * t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ') + ' Z';
  }, [R, r, d, steps]);

  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotationDeg})`} opacity={opacity}>
      <path d={pathData} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
    </g>
  );
};

export const RollingNumber: React.FC<{
  value: string;
  progress: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
}> = ({
  value,
  progress,
  fontSize = 132,
  color = IDENTITY.ivoryText,
  fontFamily = IDENTITY.fontCondensed,
}) => {
  const p = easeOutExpo(clamp01(progress));
  const lineH = fontSize * 0.96;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        height: lineH,
        overflow: 'hidden',
        fontFamily,
        fontSize,
        lineHeight: `${lineH}px`,
        color,
        letterSpacing: '0.02em',
      }}
    >
      {value.split('').map((ch, idx) => {
        const digit = ch >= '0' && ch <= '9' ? parseInt(ch, 10) : -1;
        if (digit === -1) {
          return (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - p) * 36}px)`,
                opacity: clamp01(p * 1.4),
              }}
            >
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          );
        }
        const spins = 10 + digit;
        const curPos = interpolate(p, [0, 1], [0, spins]);
        return (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              height: lineH,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                transform: `translateY(${-curPos * lineH}px)`,
              }}
            >
              {Array.from({ length: 20 }).map((_, n) => (
                <span key={n} style={{ height: lineH, display: 'block' }}>
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const DocumentaryHeader: React.FC<{
  eyebrow: string;
  figure: string;
  unit?: string;
  subtitle: string;
  localSec: number;
  accentColor?: string;
  strikeWord?: boolean;
}> = ({
  eyebrow,
  figure,
  unit,
  subtitle,
  localSec,
  accentColor = IDENTITY.bullion24k,
  strikeWord = false,
}) => {
  const enter = easeOutExpo(clamp01(localSec / 0.75));
  const ruleProg = easeOutCubic(clamp01((localSec - 0.18) / 0.65));
  const strikeProg = easeInOutQuart(clamp01((localSec - 0.65) / 0.55));

  return (
    <div
      style={{
        position: 'absolute',
        left: 104,
        top: 168,
        right: 104,
        pointerEvents: 'none',
        opacity: clamp01(localSec / 0.35),
        transform: `translateY(${(1 - enter) * 24}px)`,
      }}
    >
      <div
        style={{
          fontFamily: IDENTITY.fontMono,
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: '0.22em',
          color: IDENTITY.stoneText,
          textTransform: 'uppercase',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <span
          style={{
            width: 26 * ruleProg,
            height: 2,
            backgroundColor: accentColor,
            display: 'inline-block',
          }}
        />
        <span>{eyebrow}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, position: 'relative' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <RollingNumber value={figure} progress={clamp01(localSec / 0.95)} fontSize={138} />
          {strikeWord && strikeProg > 0.01 && (
            <div
              style={{
                position: 'absolute',
                left: -6,
                top: '51%',
                width: `${strikeProg * 104}%`,
                height: 8,
                backgroundColor: IDENTITY.terracottaStamp,
                transform: 'rotate(-3deg)',
              }}
            />
          )}
        </div>
        {unit && (
          <span
            style={{
              fontFamily: IDENTITY.fontEditorial,
              fontSize: 54,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: accentColor,
              textTransform: 'uppercase',
            }}
          >
            {unit}
          </span>
        )}
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

export const ArchivalPaperCard: React.FC<{
  x: number;
  y: number;
  width: number;
  rotationDeg?: number;
  headerLeft: string;
  headerRight: string;
  rows: readonly { readonly label: string; readonly value: string; readonly highlight?: boolean }[];
  enterProgress: number;
  stampText?: string;
  stampColor?: string;
  stampProgress?: number;
}> = ({
  x,
  y,
  width,
  rotationDeg = -1.6,
  headerLeft,
  headerRight,
  rows,
  enterProgress,
  stampText,
  stampColor = IDENTITY.terracottaStamp,
  stampProgress = 0,
}) => {
  const paperUrl = useProceduralSurface('cotton-paper');
  const p = easeOutExpo(clamp01(enterProgress));
  const sp = clamp01(stampProgress);
  const stampScale = interpolate(easeOutExpo(sp), [0, 1], [1.75, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        padding: stampText ? '28px 34px 92px' : '28px 34px 30px',
        backgroundColor: IDENTITY.paperCream,
        backgroundImage: paperUrl ? `url(${paperUrl})` : undefined,
        backgroundSize: 'cover',
        border: '1.5px solid rgba(52, 42, 28, 0.35)',
        boxShadow: '0 26px 48px rgba(0, 0, 0, 0.58), 0 4px 10px rgba(0, 0, 0, 0.38)',
        transform: `translateY(${(1 - p) * 55}px) rotate(${rotationDeg}deg)`,
        opacity: clamp01(enterProgress * 1.6),
        boxSizing: 'border-box',
      }}
    >
      {/* Inner double hairline archival border */}
      <div
        style={{
          position: 'absolute',
          inset: 9,
          border: '1px solid rgba(64, 50, 32, 0.22)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #2A231B',
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
          VERIFIKASI · ARSIP FISIKA NUKLIR
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
            backgroundColor: 'rgba(239, 231, 214, 0.94)',
            transform: `rotate(-6.5deg) scale(${stampScale})`,
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
  surfaceKind = 'suede-slate',
  surfaceOpacity = 0.24,
  warmLampX = 50,
  warmLampY = 34,
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
            backgroundSize: surfaceKind === 'walnut-grain' ? '720px 720px' : '480px 480px',
            backgroundRepeat: 'repeat',
            opacity: surfaceOpacity,
            mixBlendMode: 'overlay',
          }}
        />
      )}
      {/* Subtle museum tungsten directional falloff — strictly non-neon */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 68% 46% at ${warmLampX}% ${warmLampY}%, rgba(216, 168, 78, 0.10) 0%, rgba(0, 0, 0, 0) 72%)`,
        }}
      />
      {/* Drafted marginal engineering hairlines */}
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0, opacity: 0.28 }}>
        <line x1={68} y1={148} x2={68} y2={1760} stroke={IDENTITY.hairlineIvory} strokeWidth={1} />
        <line x1={1372} y1={148} x2={1372} y2={1760} stroke={IDENTITY.hairlineIvory} strokeWidth={1} />
        {Array.from({ length: 17 }).map((_, i) => {
          const y = 180 + i * 96;
          return (
            <line
              key={i}
              x1={68}
              y1={y}
              x2={i % 4 === 0 ? 84 : 76}
              y2={y}
              stroke={IDENTITY.hairlineIvory}
              strokeWidth={1}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// 5. SHARED 2D ARTIFACT ILLUSTRATION COMPONENTS (THREE-QUARTER GOLD RING & NUGGET)
// ============================================================================

export const Illustrated24KGoldRing: React.FC<{
  cx: number;
  cy: number;
  rx?: number;
  ry?: number;
  bandHeight?: number;
  goldTexUrl: string;
  shimmerPhase?: number;
  scale?: number;
}> = ({
  cx,
  cy,
  rx = 235,
  ry = 86,
  bandHeight = 76,
  goldTexUrl,
  shimmerPhase = 0,
  scale = 1,
}) => {
  const irx = rx * 0.74;
  const iry = ry * 0.68;
  const shimmerX = Math.sin(shimmerPhase) * rx * 0.52;

  const outerBodyPath = [
    `M ${-rx},0`,
    `L ${-rx},${bandHeight}`,
    `A ${rx},${ry} 0 0,0 ${rx},${bandHeight}`,
    `L ${rx},0`,
    `A ${rx},${ry} 0 0,1 ${-rx},0 Z`,
  ].join(' ');

  const topRimAnnulus = [
    `M ${-rx},0`,
    `A ${rx},${ry} 0 1,0 ${rx},0`,
    `A ${rx},${ry} 0 1,0 ${-rx},0 Z`,
    `M ${-irx},0`,
    `A ${irx},${iry} 0 1,1 ${irx},0`,
    `A ${irx},${iry} 0 1,1 ${-irx},0 Z`,
  ].join(' ');

  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      <defs>
        <linearGradient id="au-band-outer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#69430C" />
          <stop offset="18%" stopColor="#C89330" />
          <stop offset="40%" stopColor="#F5E2A4" />
          <stop offset="56%" stopColor="#D7A13B" />
          <stop offset="82%" stopColor="#9B6B19" />
          <stop offset="100%" stopColor="#523307" />
        </linearGradient>
        <linearGradient id="au-band-inner" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3B2406" />
          <stop offset="48%" stopColor="#8E5F15" />
          <stop offset="78%" stopColor="#CE9A38" />
          <stop offset="100%" stopColor="#462B07" />
        </linearGradient>
        <linearGradient id="au-rim-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FAF0CB" />
          <stop offset="45%" stopColor="#DFB04E" />
          <stop offset="100%" stopColor="#8C5E14" />
        </linearGradient>
        <clipPath id="au-outer-clip">
          <path d={outerBodyPath} />
        </clipPath>
        <clipPath id="au-inner-hole">
          <ellipse cx={0} cy={0} rx={irx} ry={iry} />
        </clipPath>
      </defs>

      {/* Matte contact shadow on surface */}
      <ellipse cx={8} cy={bandHeight + 24} rx={rx * 1.04} ry={ry * 0.92} fill="rgba(0, 0, 0, 0.56)" />

      {/* Back inner wall visible through top opening */}
      <g clipPath="url(#au-inner-hole)">
        <ellipse cx={0} cy={bandHeight * 0.42} rx={irx} ry={iry * 1.18} fill="url(#au-band-inner)" />
        <path
          d={`M ${-irx * 0.72},${-iry * 0.16} Q 0,${-iry * 0.58} ${irx * 0.72},${-iry * 0.16}`}
          fill="none"
          stroke="rgba(255, 238, 184, 0.36)"
          strokeWidth={1.3}
          strokeDasharray="3 5"
        />
        <text
          x={0}
          y={-iry * 0.18}
          textAnchor="middle"
          fill="rgba(252, 234, 178, 0.72)"
          fontFamily={IDENTITY.fontMono}
          fontSize={16}
          fontWeight={600}
          letterSpacing="0.24em"
        >
          AU 79 · 999,9 · EX STELLIS
        </text>
      </g>

      {/* Front cylindrical band with Voronoi crystalline gold grain */}
      <path d={outerBodyPath} fill="url(#au-band-outer)" />
      {goldTexUrl && (
        <g clipPath="url(#au-outer-clip)" opacity={0.34}>
          <image
            href={goldTexUrl}
            x={-rx - 10}
            y={-20}
            width={rx * 2 + 20}
            height={bandHeight + ry + 40}
            preserveAspectRatio="none"
          />
        </g>
      )}
      {/* Moving specular reflection bar */}
      <g clipPath="url(#au-outer-clip)">
        <rect
          x={shimmerX - 34}
          y={-ry}
          width={68}
          height={bandHeight + ry * 2}
          fill="rgba(255, 249, 224, 0.24)"
          transform="skewX(-16)"
        />
      </g>

      {/* Top chamfered annulus rim */}
      <path d={topRimAnnulus} fill="url(#au-rim-top)" fillRule="evenodd" />
      <ellipse
        cx={0}
        cy={0}
        rx={rx}
        ry={ry}
        fill="none"
        stroke="#FCF3D1"
        strokeWidth={2.0}
      />
      <ellipse
        cx={0}
        cy={0}
        rx={irx}
        ry={iry}
        fill="none"
        stroke="#6B440B"
        strokeWidth={2.2}
      />
    </g>
  );
};

export const FacetedGoldNugget: React.FC<{
  cx: number;
  cy: number;
  size: number;
  goldTexUrl?: string;
  rotation?: number;
}> = ({ cx, cy, size, goldTexUrl, rotation = 0 }) => {
  const r = size;
  const uid = `nug-${Math.round(cx)}-${Math.round(cy)}-${Math.round(size)}`;
  const hull = [
    `0,${-r}`,
    `${r * 0.86},${-r * 0.44}`,
    `${r * 0.94},${r * 0.36}`,
    `${r * 0.24},${r * 0.95}`,
    `${-r * 0.76},${r * 0.62}`,
    `${-r * 0.92},${-r * 0.28}`,
  ].join(' ');

  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
      {goldTexUrl && (
        <defs>
          <clipPath id={uid}>
            <polygon points={hull} />
          </clipPath>
        </defs>
      )}
      <polygon points={`0,${-r} ${r * 0.86},${-r * 0.44} ${r * 0.1},${-r * 0.08}`} fill="#F4E0A1" />
      <polygon points={`${r * 0.86},${-r * 0.44} ${r * 0.94},${r * 0.36} ${r * 0.1},${-r * 0.08}`} fill="#D49E39" />
      <polygon points={`${r * 0.94},${r * 0.36} ${r * 0.24},${r * 0.95} ${r * 0.1},${-r * 0.08}`} fill="#9C6B18" />
      <polygon points={`${r * 0.24},${r * 0.95} ${-r * 0.76},${r * 0.62} ${r * 0.1},${-r * 0.08}`} fill="#7B510E" />
      <polygon points={`${-r * 0.76},${r * 0.62} ${-r * 0.92},${-r * 0.28} ${r * 0.1},${-r * 0.08}`} fill="#BA8527" />
      <polygon points={`${-r * 0.92},${-r * 0.28} 0,${-r} ${r * 0.1},${-r * 0.08}`} fill="#E8C670" />
      {goldTexUrl && (
        <g clipPath={`url(#${uid})`} opacity={0.35}>
          <image href={goldTexUrl} x={-r} y={-r} width={r * 2} height={r * 2} />
        </g>
      )}
      <polygon
        points={hull}
        fill="none"
        stroke="#FAF0CA"
        strokeWidth={Math.max(1, r * 0.04)}
        strokeLinejoin="round"
      />
    </g>
  );
};

// ============================================================================
// 6. SCENE 01 — MEJA UJI LOGAM MULIA & SERTIFIKAT ASSAY (0.000s – 10.764s)
// ============================================================================

export const Scene01LogamAsing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[0];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const voronoiGoldUrl = useProceduralSurface('voronoi-gold');
  const hammeredGoldUrl = useProceduralSurface('hammered-gold');

  // Spring physics for artifact arrival, loupe swing, and ink stamp slam
  const stageSp = spring({ frame, fps, config: { damping: 18, stiffness: 90, mass: 0.9 } });
  const loupeSp = spring({
    frame: Math.max(0, frame - Math.round(1.55 * fps)),
    fps,
    config: { damping: 15, stiffness: 82, mass: 1.0 },
  });
  const cardEnter = prog(globalSec, 2.1, 2.85);
  const stampProg = prog(globalSec, 2.95, 3.45);
  const streakProg = easeInOutCubic(prog(globalSec, 0.7, 2.2));

  // Subtle impact micro-shake when vermilion stamp slams down
  const stampElapsed = globalSec - 2.95;
  const shakeY =
    stampElapsed > 0 && stampElapsed < 0.35
      ? Math.sin(stampElapsed * 68) * Math.exp(-stampElapsed * 14) * 7
      : 0;

  return (
    <AbsoluteFill style={{ transform: `translateY(${shakeY}px)` }}>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="suede-slate"
        surfaceOpacity={0.3}
        warmLampX={46}
        warmLampY={36}
      />

      {/* Documentary Top-Left Odometer Header */}
      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure="0,00"
        unit="GRAM"
        subtitle="EMAS YANG SANGGUP DIRAKIT OLEH PLANET BUMI"
        localSec={localSec}
        strikeWord={globalSec >= 3.0}
      />

      {/* Assay Workbench Physical Diorama */}
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="s1-touchstone-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2C2E2A" />
            <stop offset="55%" stopColor="#1C1E1B" />
            <stop offset="100%" stopColor="#121311" />
          </linearGradient>
          <linearGradient id="s1-brass-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F1DC99" />
            <stop offset="50%" stopColor="#B8862D" />
            <stop offset="100%" stopColor="#5E3E0B" />
          </linearGradient>
          <clipPath id="s1-ingot-clip">
            <polygon points="885,845 1095,815 1142,902 918,936" />
          </clipPath>
        </defs>

        {/* Subtle Engraved Banknote Guilloché Watermark Behind Assay Stone */}
        <GuillocheRosette
          cx={720}
          cy={830}
          R={360}
          r={84}
          d={125}
          stroke="rgba(212, 160, 62, 0.11)"
          rotationDeg={localSec * 2.2}
        />

        <g
          transform={`translate(0, ${(1 - stageSp) * 52})`}
          opacity={clamp01(stageSp * 1.25)}
        >
          {/* Beveled Black Lydite Touchstone Slab (Batu Uji Emas) */}
          <ellipse cx={720} cy={1025} rx={535} ry={110} fill="rgba(0,0,0,0.62)" />
          <polygon
            points="210,835 1175,790 1245,955 165,1005"
            fill="url(#s1-touchstone-top)"
            stroke="rgba(237, 232, 221, 0.22)"
            strokeWidth={1.6}
          />
          <polygon
            points="165,1005 1245,955 1232,1002 182,1052"
            fill="#0D0E0C"
            stroke="rgba(237, 232, 221, 0.14)"
            strokeWidth={1.2}
          />

          {/* Gold Assay Streak Marks Rubbed onto Black Basalt Touchstone */}
          <TrimPath
            d="M 275,938 C 355,926 425,924 505,916"
            progress={streakProg}
            stroke="#DFAD47"
            strokeWidth={11}
          />
          <TrimPath
            d="M 290,962 C 365,952 435,948 490,944"
            progress={clamp01((streakProg - 0.2) / 0.8)}
            stroke="#C9922C"
            strokeWidth={7}
          />
          <text
            x={280}
            y={990}
            fill="rgba(237, 232, 221, 0.46)"
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            letterSpacing="0.16em"
          >
            GOlD STREAK · 24K MURNI
          </text>

          {/* Stamped 1-Oz Assay Bullion Ingot + Native Quartz Gold Specimen on Right */}
          <g>
            <polygon points="885,845 1095,815 1142,902 918,936" fill="#C99431" />
            {hammeredGoldUrl && (
              <g clipPath="url(#s1-ingot-clip)" opacity={0.42}>
                <image href={hammeredGoldUrl} x={875} y={805} width={280} height={145} />
              </g>
            )}
            <polygon
              points="885,845 1095,815 1142,902 918,936"
              fill="none"
              stroke="#F7E7B2"
              strokeWidth={1.8}
            />
            <polygon points="918,936 1142,902 1134,932 912,966" fill="#6F490D" />
            <polygon points="1095,815 1142,902 1134,932 1088,842" fill="#8C5E14" />
            <text
              x={1010}
              y={868}
              textAnchor="middle"
              fill="#4B2F06"
              fontFamily={IDENTITY.fontMono}
              fontSize={15}
              fontWeight={700}
              letterSpacing="0.14em"
              transform="rotate(-8, 1010, 868)"
            >
              999,9 AU
            </text>
            <text
              x={1016}
              y={892}
              textAnchor="middle"
              fill="#4B2F06"
              fontFamily={IDENTITY.fontEditorial}
              fontSize={19}
              fontWeight={700}
              letterSpacing="0.12em"
              transform="rotate(-8, 1016, 892)"
            >
              1 TROY OZ
            </text>
          </g>

          <FacetedGoldNugget
            cx={1128}
            cy={932}
            size={42}
            goldTexUrl={voronoiGoldUrl}
            rotation={14}
          />

          {/* Hero 24K Gold Wedding Band */}
          <Illustrated24KGoldRing
            cx={605}
            cy={805}
            rx={218}
            ry={78}
            bandHeight={72}
            goldTexUrl={voronoiGoldUrl}
            shimmerPhase={localSec * 1.45}
          />

          {/* Precision Engineer Caliper & Leader Callout */}
          <TrimPath
            d="M 822,782 L 908,712 L 1258,712"
            progress={prog(globalSec, 0.9, 1.7)}
            stroke={IDENTITY.bullionLight}
            strokeWidth={1.8}
          />
          <g opacity={prog(globalSec, 1.2, 1.8)}>
            <text
              x={922}
              y={696}
              fill={IDENTITY.stoneText}
              fontFamily={IDENTITY.fontMono}
              fontSize={17}
              fontWeight={600}
              letterSpacing="0.16em"
            >
              NOMOR ATOM 79 · LOGAM MULIA
            </text>
            <text
              x={922}
              y={752}
              fill={IDENTITY.ivoryText}
              fontFamily={IDENTITY.fontEditorial}
              fontSize={36}
              fontWeight={700}
              letterSpacing="0.05em"
            >
              AURUM MURNI (Au)
            </text>
          </g>
        </g>

        {/* Swinging Brass Jeweler's Triplet Loupe (10x Magnification of Atomic Nucleus) */}
        <g
          transform={`translate(${interpolate(loupeSp, [0, 1], [-220, 0])}, ${interpolate(
            loupeSp,
            [0, 1],
            [-120, 0],
          )}) rotate(${interpolate(loupeSp, [0, 1], [-24, 0])}, 355, 645)`}
          opacity={clamp01(loupeSp * 1.3)}
        >
          {/* Knurled Folding Leather/Brass Loupe Case */}
          <path
            d="M 248,742 L 154,845 C 140,860 162,882 178,866 L 274,764 Z"
            fill="#28231E"
            stroke="#C89638"
            strokeWidth={2.5}
          />
          <circle cx={262} cy={752} r={10} fill="#D8A444" />

          {/* Machined Brass Bezel */}
          <circle
            cx={362}
            cy={635}
            r={126}
            fill="#161714"
            stroke="url(#s1-brass-rim)"
            strokeWidth={13}
          />
          <circle
            cx={362}
            cy={635}
            r={114}
            fill="none"
            stroke="rgba(255,244,204,0.35)"
            strokeWidth={1.4}
          />

          {/* Magnified Atomic Shell Lattice Inside Triplet Lens (Non-neon warm gold/ivory) */}
          {[94, 70, 46].map((orbR, idx) => (
            <circle
              key={idx}
              cx={362}
              cy={635}
              r={orbR}
              fill="none"
              stroke="rgba(232, 199, 119, 0.28)"
              strokeWidth={1.3}
              strokeDasharray={idx === 1 ? '4 5' : undefined}
            />
          ))}
          {Array.from({ length: 8 }).map((_, idx) => {
            const ang = localSec * (1.1 + (idx % 2) * 0.45) + (idx * Math.PI) / 4;
            const r = idx % 2 === 0 ? 94 : 70;
            return (
              <circle
                key={idx}
                cx={362 + Math.cos(ang) * r}
                cy={635 + Math.sin(ang) * r}
                r={4.2}
                fill={IDENTITY.platinumIvory}
              />
            );
          })}
          <circle cx={362} cy={635} r={28} fill={IDENTITY.bullion24k} stroke="#FAF0CA" strokeWidth={2} />
          <text
            x={362}
            y={643}
            textAnchor="middle"
            fill="#231604"
            fontFamily={IDENTITY.fontMono}
            fontSize={22}
            fontWeight={700}
          >
            79
          </text>
          {/* Optical Glass Specular Crescent */}
          <path
            d="M 278,588 A 98,98 0 0,1 418,554"
            fill="none"
            stroke="rgba(255, 252, 240, 0.34)"
            strokeWidth={6}
            strokeLinecap="round"
          />
          <text
            x={362}
            y={484}
            textAnchor="middle"
            fill={IDENTITY.stoneText}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            fontWeight={600}
            letterSpacing="0.18em"
          >
            LUP 10× · 79 PROTON
          </text>
        </g>
      </svg>

      {/* Tactile Archival Assay Certificate Card & Distressed Vermilion Rubber Stamp */}
      <ArchivalPaperCard
        x={126}
        y={1195}
        width={1188}
        rotationDeg={-1.4}
        headerLeft="BERKAS UJI · UNSUR 79 Au"
        headerRight="LAB. MINERALOGI"
        enterProgress={cardEnter}
        stampText="BUKAN BUATAN BUMI"
        stampColor={IDENTITY.terracottaStamp}
        stampProgress={stampProg}
        rows={[
          { label: 'SPESIMEN UJI', value: 'EMAS MURNI 24K (AURUM · Z=79)' },
          { label: 'USIA PLANET BUMI', value: '± 4,54 MILIAR TAHUN' },
          { label: 'SUHU INTI BUMI', value: '± 5.400 °C (TERLALU RENDAH)' },
          { label: 'PRODUKSI ASLI BUMI', value: '0,00 GRAM (NIHIL)', highlight: true },
        ]}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 7. SCENE 02 — SURVEI STRATIGRAFI & PIPA HIDROTERMAL MAGMA (10.764s – 22.089s)
// ============================================================================

interface StrataBand {
  readonly name: string;
  readonly depth: string;
  readonly yTop: number;
  readonly yBot: number;
  readonly fill: string;
  readonly patternId?: string;
}

const STRATA_BANDS: readonly StrataBand[] = [
  { name: 'REGOLIT & ABU VULKANIK', depth: '0 KM', yTop: 695, yBot: 825, fill: '#2B241E', patternId: 'pat-stipple' },
  { name: 'BATUPASIR SEDIMEN', depth: '5 KM', yTop: 825, yBot: 985, fill: '#3A2E23', patternId: 'pat-stipple' },
  { name: 'BATUGAMPING BERLAPIS', depth: '12 KM', yTop: 985, yBot: 1155, fill: '#332C27', patternId: 'pat-limestone' },
  { name: 'GRANIT BENUA RETAK', depth: '24 KM', yTop: 1155, yBot: 1365, fill: '#282421', patternId: 'pat-granite' },
  { name: 'KERAK BASALT DALAM', depth: '35 KM', yTop: 1365, yBot: 1545, fill: '#1F1B19', patternId: 'pat-basalt' },
  { name: 'MANTEL ATAS PERIDOTIT', depth: '45+ KM', yTop: 1545, yBot: 1735, fill: '#3B2117' },
];

export const Scene02KurirMagma: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[1];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const volcanoReliefUrl = useProceduralSurface('volcano-hillshade');
  const voronoiGoldUrl = useProceduralSurface('voronoi-gold');

  // Precompute realistic undulating stratigraphic bed boundaries & d3-contour isotherms
  const strataPaths = useMemo(() => {
    const buildHorizon = (baseY: number, seed: number) => {
      const pts: string[] = [];
      for (let x = 110; x <= 1350; x += 40) {
        const dy = fbm2D(`strata-${seed}`, x * 0.0035, seed * 1.7, 3) * 26;
        pts.push(`${x},${(baseY + dy).toFixed(1)}`);
      }
      return pts;
    };

    return STRATA_BANDS.map((band, idx) => {
      const topPts = idx === 0
        ? ['110,705', '350,692', '565,505', '665,482', '720,498', '775,482', '875,505', '1090,692', '1350,705']
        : buildHorizon(band.yTop, idx);
      const botPts = idx === STRATA_BANDS.length - 1
        ? ['110,1730', '1350,1730']
        : buildHorizon(band.yBot, idx + 1);
      const d = `M ${topPts[0]} ` +
        topPts.slice(1).map((p) => `L ${p}`).join(' ') +
        ' ' +
        [...botPts].reverse().map((p) => `L ${p}`).join(' ') +
        ' Z';
      return { ...band, d };
    });
  }, []);

  // Marching-squares contour isolines inside the volcanic cone (USGS topographic look)
  const coneContours = useMemo(() => {
    const gw = 48;
    const gh = 24;
    const values = new Array<number>(gw * gh);
    for (let j = 0; j < gh; j++) {
      for (let i = 0; i < gw; i++) {
        const nx = (i / (gw - 1) - 0.5) * 2.2;
        const ny = j / (gh - 1);
        const cone = Math.max(0, 1 - Math.abs(nx) * 0.95 - ny * 0.45);
        const n = fbm2D('iso-volc', i * 0.16, j * 0.16, 3) * 0.18;
        values[j * gw + i] = cone + n;
      }
    }
    const gen = contours().size([gw, gh]).thresholds([0.22, 0.36, 0.5, 0.64, 0.78]);
    const pathGen = geoPath();
    return gen(values).map((c) => pathGen(c) || '');
  }, []);

  const pipeProgress = easeOutCubic(prog(globalSec, 10.9, 13.3));
  const tagProgress = prog(globalSec, 14.0, 14.9);

  const mainConduit = 'M 716,1725 C 696,1510 744,1295 724,1045 C 712,860 720,665 720,492';
  const sillLeft = 'M 726,1255 C 605,1195 470,1135 325,1075';
  const sillRight = 'M 722,1065 C 832,1012 936,962 1032,918';
  const sillDeep = 'M 714,1465 C 835,1425 955,1395 1065,1372';

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="suede-slate"
        surfaceOpacity={0.26}
        warmLampX={50}
        warmLampY={48}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure="1.200"
        unit="°C"
        subtitle="SUHU MAGMA · KURIR PENGANGKUT EMAS DARI MANTEL"
        localSec={localSec}
        accentColor={IDENTITY.ochreMineral}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {/* Geological Lithology Hatching & Stipple Patterns */}
          <pattern id="pat-stipple" width={24} height={24} patternUnits="userSpaceOnUse">
            <circle cx={5} cy={6} r={1.2} fill="rgba(237, 224, 198, 0.16)" />
            <circle cx={17} cy={14} r={1.0} fill="rgba(237, 224, 198, 0.13)" />
            <circle cx={11} cy={20} r={1.3} fill="rgba(237, 224, 198, 0.14)" />
          </pattern>
          <pattern id="pat-limestone" width={48} height={24} patternUnits="userSpaceOnUse">
            <line x1={0} y1={12} x2={48} y2={12} stroke="rgba(237,232,221,0.10)" strokeWidth={1} />
            <line x1={24} y1={0} x2={24} y2={12} stroke="rgba(237,232,221,0.10)" strokeWidth={1} />
            <line x1={8} y1={12} x2={8} y2={24} stroke="rgba(237,232,221,0.10)" strokeWidth={1} />
          </pattern>
          <pattern id="pat-granite" width={32} height={32} patternUnits="userSpaceOnUse">
            <path d="M 4,8 L 12,8 M 8,4 L 8,12 M 20,22 L 28,22 M 24,18 L 24,26" stroke="rgba(237,232,221,0.11)" strokeWidth={1.1} />
          </pattern>
          <pattern id="pat-basalt" width={18} height={36} patternUnits="userSpaceOnUse">
            <line x1={9} y1={0} x2={9} y2={36} stroke="rgba(237,232,221,0.09)" strokeWidth={1} />
          </pattern>

          <clipPath id="s2-section-box">
            <path d="M 118,440 L 1344,440 L 1344,1725 L 118,1725 Z" />
          </clipPath>
          <clipPath id="s2-volcano-cone">
            <path d="M 118,708 L 355,692 L 568,504 L 665,482 L 720,498 L 775,482 L 872,504 L 1085,692 L 1344,708 L 1344,740 L 118,740 Z" />
          </clipPath>
        </defs>

        {/* Rising Muted Volcanic Ash Plume from Caldera */}
        {Array.from({ length: 6 }).map((_, idx) => {
          const cyc = (localSec * 0.28 + idx * 0.17) % 1;
          const py = 485 - cyc * 145;
          const px = 720 + Math.sin(localSec * 1.1 + idx * 1.9) * (16 + cyc * 48);
          return (
            <circle
              key={idx}
              cx={px}
              cy={py}
              r={22 + cyc * 46}
              fill="rgba(168, 152, 138, 0.10)"
              opacity={(1 - cyc) * 0.85}
            />
          );
        })}

        <g clipPath="url(#s2-section-box)">
          {/* 6 Geological Rock Strata Beds */}
          {strataPaths.map((st, idx) => (
            <g key={idx}>
              <path d={st.d} fill={st.fill} />
              {st.patternId && <path d={st.d} fill={`url(#${st.patternId})`} />}
              <path d={st.d} fill="none" stroke="rgba(237, 232, 221, 0.16)" strokeWidth={1.3} />
            </g>
          ))}

          {/* Hillshaded Volcanic Cone Relief + Topographic Isolines */}
          {volcanoReliefUrl && (
            <g clipPath="url(#s2-volcano-cone)">
              <image
                href={volcanoReliefUrl}
                x={118}
                y={465}
                width={1226}
                height={275}
                preserveAspectRatio="none"
              />
              <g transform="translate(118, 465) scale(25.5, 11.4)" opacity={0.28}>
                {coneContours.map((cd, idx) => (
                  <path
                    key={idx}
                    d={cd}
                    fill="none"
                    stroke="#E5D8C0"
                    strokeWidth={0.07}
                  />
                ))}
              </g>
            </g>
          )}

          {/* Hydrothermal Quartz-Vein Walls + Matte Terracotta Magma Conduit (Zero Neon) */}
          <TrimPath d={mainConduit} progress={pipeProgress} stroke="#DED3BE" strokeWidth={50} />
          <TrimPath d={mainConduit} progress={pipeProgress} stroke="#9E3822" strokeWidth={38} />
          <TrimPath d={mainConduit} progress={pipeProgress} stroke="#D97B38" strokeWidth={20} />

          <TrimPath d={sillLeft} progress={clamp01((pipeProgress - 0.3) / 0.7)} stroke="#DED3BE" strokeWidth={24} />
          <TrimPath d={sillLeft} progress={clamp01((pipeProgress - 0.3) / 0.7)} stroke="#C85A32" strokeWidth={14} />

          <TrimPath d={sillRight} progress={clamp01((pipeProgress - 0.42) / 0.58)} stroke="#DED3BE" strokeWidth={24} />
          <TrimPath d={sillRight} progress={clamp01((pipeProgress - 0.42) / 0.58)} stroke="#C85A32" strokeWidth={14} />

          <TrimPath d={sillDeep} progress={clamp01((pipeProgress - 0.18) / 0.75)} stroke="#B84B2B" strokeWidth={16} />

          {/* Pre-existing Faceted Gold Grains Carried Upward Like Freight */}
          {Array.from({ length: 11 }).map((_, idx) => {
            const u = (localSec * 0.14 + idx / 11) % 1;
            const y = interpolate(u, [0, 1], [1700, 515]);
            const x = 720 + Math.sin(u * Math.PI * 3.5 + idx) * 9;
            return (
              <g key={idx} opacity={pipeProgress * smoothstep(Math.min(u * 6, (1 - u) * 6))}>
                <FacetedGoldNugget
                  cx={x}
                  cy={y}
                  size={15 + (idx % 3) * 4}
                  goldTexUrl={voronoiGoldUrl}
                  rotation={localSec * 32 + idx * 40}
                />
              </g>
            );
          })}

          {/* Deposited Quartz-Gold Vein Pockets in Upper Crust */}
          {[
            { x: 355, y: 1086 },
            { x: 485, y: 1142 },
            { x: 938, y: 960 },
            { x: 1022, y: 922 },
          ].map((pt, idx) => (
            <g key={idx} opacity={clamp01((pipeProgress - 0.55) * 2.4)}>
              <FacetedGoldNugget cx={pt.x} cy={pt.y} size={17} goldTexUrl={voronoiGoldUrl} rotation={idx * 52} />
            </g>
          ))}

          {/* Strata Lithology Labels on Right */}
          {STRATA_BANDS.map((st, idx) => (
            <text
              key={idx}
              x={1324}
              y={(st.yTop + st.yBot) * 0.5 + 6}
              textAnchor="end"
              fill="rgba(237, 232, 221, 0.42)"
              fontFamily={IDENTITY.fontMono}
              fontSize={16}
              letterSpacing="0.14em"
            >
              {st.name}
            </text>
          ))}
        </g>

        {/* Left Stratigraphic Depth Scale Frame */}
        <rect
          x={118}
          y={705}
          width={1226}
          height={1020}
          fill="none"
          stroke="rgba(237, 232, 221, 0.28)"
          strokeWidth={1.8}
        />
        {STRATA_BANDS.map((st, idx) => (
          <g key={idx}>
            <line x1={104} y1={st.yTop} x2={126} y2={st.yTop} stroke={IDENTITY.bullionLight} strokeWidth={2} />
            <text
              x={136}
              y={st.yTop + 26}
              fill={IDENTITY.bullionLight}
              fontFamily={IDENTITY.fontMono}
              fontSize={17}
              fontWeight={600}
              letterSpacing="0.12em"
            >
              {st.depth}
            </text>
          </g>
        ))}

        {/* Pinned Field-Survey Callout Plaque */}
        <g opacity={easeOutCubic(tagProgress)}>
          <line x1={744} y1={1168} x2={794} y2={1168} stroke={IDENTITY.bullionLight} strokeWidth={2} />
          <circle cx={744} cy={1168} r={5} fill={IDENTITY.bullionLight} />
          <rect
            x={794}
            y={1114}
            width={524}
            height={112}
            fill={IDENTITY.paperCream}
            stroke="#2B231B"
            strokeWidth={1.8}
          />
          <text
            x={818}
            y={1150}
            fill={IDENTITY.terracottaStamp}
            fontFamily={IDENTITY.fontMono}
            fontSize={17}
            fontWeight={700}
            letterSpacing="0.14em"
          >
            KURIR ALAM · BUKAN PABRIK ATOM
          </text>
          <text
            x={818}
            y={1186}
            fill={IDENTITY.paperInk}
            fontFamily={IDENTITY.fontEditorial}
            fontSize={27}
            fontWeight={700}
            letterSpacing="0.04em"
          >
            MENGANGKUT EMAS LAMA KE KERAK
          </text>
          <text
            x={818}
            y={1212}
            fill={IDENTITY.paperMuted}
            fontFamily={IDENTITY.fontMono}
            fontSize={15}
            letterSpacing="0.08em"
          >
            PANAS BUMI TAK MAMPU MERAKIT INTI AU-79
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// 8. SCENE 03 — BINTANG MAHARAKSASA & TEMBOK BESI FE-26 (22.089s – 35.546s)
// ============================================================================

const FUSION_SHELLS = [
  { r: 345, sym: 'H', name: 'HIDROGEN', fill: '#B8542E' },
  { r: 296, sym: 'He', name: 'HELIUM', fill: '#9E4324' },
  { r: 250, sym: 'C', name: 'KARBON', fill: '#7E351F' },
  { r: 208, sym: 'Ne · O', name: 'OKSIGEN', fill: '#5E291B' },
  { r: 168, sym: 'Si', name: 'SILIKON', fill: '#432018' },
] as const;

export const Scene03BatasBesi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[2];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const stellarUrl = useProceduralSurface('stellar-convection');
  const castIronUrl = useProceduralSurface('cast-iron');

  // Cutaway opens as VO explains core turning to iron; star contracts when furnace shuts off
  const cutawayOpen = easeInOutQuart(prog(globalSec, 25.4, 27.6));
  const quenchPhase = easeInOutCubic(prog(globalSec, 29.5, 31.8));
  const collapsePhase = easeInOutQuart(prog(globalSec, 32.4, 34.8));

  const cx = 720;
  const cy = 945;
  const outerScale = 1 - collapsePhase * 0.14;

  // Dynamic pie cutaway wedge from -125 deg to +125 deg
  const wedgeHalfDeg = cutawayOpen * 126;
  const buildCutawayClipPath = () => {
    if (wedgeHalfDeg <= 0.5) {
      return `M ${cx - 500},${cy - 500} H ${cx + 500} V ${cy + 500} H ${cx - 500} Z`;
    }
    const a1 = ((-90 - wedgeHalfDeg) * Math.PI) / 180;
    const a2 = ((-90 + wedgeHalfDeg) * Math.PI) / 180;
    const R = 520;
    const x1 = cx + Math.cos(a1) * R;
    const y1 = cy + Math.sin(a1) * R;
    const x2 = cx + Math.cos(a2) * R;
    const y2 = cy + Math.sin(a2) * R;
    const largeArc = 360 - wedgeHalfDeg * 2 > 180 ? 1 : 0;
    return `M ${cx},${cy} L ${x2.toFixed(1)},${y2.toFixed(1)} A ${R},${R} 0 ${largeArc},1 ${x1.toFixed(
      1,
    )},${y1.toFixed(1)} Z`;
  };

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="suede-slate"
        surfaceOpacity={0.25}
        warmLampX={50}
        warmLampY={38}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure={quenchPhase > 0.35 ? '26 Fe' : '100 JT'}
        unit={quenchPhase > 0.35 ? 'INTI BESI' : 'DERAJAT °C'}
        subtitle={
          quenchPhase > 0.35
            ? 'FUSI BESI MENYERAP ENERGI · TUNGKU BINTANG LANGSUNG PADAM'
            : 'TUNGKU BINTANG MAHARAKSASA · PERAKIT UNSUR RINGAN'
        }
        localSec={localSec}
        accentColor={quenchPhase > 0.35 ? IDENTITY.castIronLight : IDENTITY.ochreMineral}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s3-star-sphere">
            <circle cx={cx} cy={cy} r={388} />
          </clipPath>
          <clipPath id="s3-photosphere-wedge">
            <path d={buildCutawayClipPath()} />
          </clipPath>
          <clipPath id="s3-iron-core">
            <circle cx={cx} cy={cy} r={126} />
          </clipPath>
        </defs>

        {/* Engraved Astrometric Degree Dial */}
        <circle
          cx={cx}
          cy={cy}
          r={455}
          fill="none"
          stroke="rgba(237, 232, 221, 0.14)"
          strokeWidth={1.2}
          strokeDasharray="3 9"
        />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 10 * Math.PI) / 180;
          const r1 = i % 3 === 0 ? 442 : 448;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * r1}
              y1={cy + Math.sin(a) * r1}
              x2={cx + Math.cos(a) * 458}
              y2={cy + Math.sin(a) * 458}
              stroke="rgba(237, 232, 221, 0.24)"
              strokeWidth={i % 3 === 0 ? 1.8 : 1}
            />
          );
        })}

        <g transform={`translate(${cx}, ${cy}) scale(${outerScale}) translate(${-cx}, ${-cy})`}>
          {/* Interior Onion-Shell Nucleosynthesis Cross-Section */}
          <circle cx={cx} cy={cy} r={388} fill="#2A1712" />
          {FUSION_SHELLS.map((sh, idx) => (
            <g key={idx} opacity={1 - quenchPhase * 0.42}>
              <circle
                cx={cx}
                cy={cy}
                r={sh.r}
                fill={sh.fill}
                stroke="rgba(237, 232, 221, 0.22)"
                strokeWidth={1.5}
              />
              {cutawayOpen > 0.55 && (
                <text
                  x={cx}
                  y={cy - sh.r + 27}
                  textAnchor="middle"
                  fill="rgba(244, 236, 220, 0.85)"
                  fontFamily={IDENTITY.fontMono}
                  fontSize={17}
                  fontWeight={600}
                  letterSpacing="0.12em"
                >
                  {sh.sym}
                </text>
              )}
            </g>
          ))}

          {/* Central Forged Cast-Iron Fe-26 Sphere with Voronoi Metallic Grains */}
          <g opacity={0.25 + cutawayOpen * 0.75}>
            <circle cx={cx} cy={cy} r={126} fill={IDENTITY.castIronDark} />
            {castIronUrl && (
              <g clipPath="url(#s3-iron-core)" opacity={0.86}>
                <image href={castIronUrl} x={cx - 130} y={cy - 130} width={260} height={260} />
              </g>
            )}
            <circle
              cx={cx}
              cy={cy}
              r={126}
              fill="none"
              stroke={IDENTITY.castIronLight}
              strokeWidth={3}
            />
            <circle
              cx={cx}
              cy={cy}
              r={112}
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={1.2}
            />
            <text
              x={cx}
              y={cy - 34}
              textAnchor="middle"
              fill={IDENTITY.ivoryText}
              fontFamily={IDENTITY.fontMono}
              fontSize={16}
              fontWeight={600}
              letterSpacing="0.16em"
            >
              NOMOR ATOM 26
            </text>
            <text
              x={cx}
              y={cy + 24}
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily={IDENTITY.fontSerif}
              fontSize={74}
              fontWeight={700}
            >
              Fe
            </text>
            <text
              x={cx}
              y={cy + 56}
              textAnchor="middle"
              fill={IDENTITY.castIronLight}
              fontFamily={IDENTITY.fontMono}
              fontSize={16}
              fontWeight={600}
              letterSpacing="0.16em"
            >
              INTI BESI
            </text>
          </g>

          {/* Outer Granulated Stellar Photosphere Sliced by Anatomical Cutaway */}
          <g clipPath="url(#s3-photosphere-wedge)" opacity={1 - quenchPhase * 0.55}>
            <g clipPath="url(#s3-star-sphere)">
              <circle cx={cx} cy={cy} r={388} fill="#C6672E" />
              {stellarUrl && (
                <image
                  href={stellarUrl}
                  x={cx - 405 + Math.sin(localSec * 0.35) * 14}
                  y={cy - 405 + Math.cos(localSec * 0.28) * 14}
                  width={810}
                  height={810}
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={388}
                fill="none"
                stroke="rgba(38, 14, 6, 0.52)"
                strokeWidth={36}
              />
            </g>
          </g>

          <circle
            cx={cx}
            cy={cy}
            r={388}
            fill="none"
            stroke="rgba(232, 199, 119, 0.36)"
            strokeWidth={2}
          />
        </g>

        {/* Radial Inward Gravitational Collapse Caliper Vectors */}
        {collapsePhase > 0.02 &&
          Array.from({ length: 8 }).map((_, i) => {
            const ang = (i * Math.PI) / 4 + Math.PI / 8;
            const rStart = 468 - collapsePhase * 38;
            const rEnd = 368 - collapsePhase * 52;
            const x1 = cx + Math.cos(ang) * rStart;
            const y1 = cy + Math.sin(ang) * rStart;
            const x2 = cx + Math.cos(ang) * rEnd;
            const y2 = cy + Math.sin(ang) * rEnd;
            const perp = ang + Math.PI / 2;
            return (
              <g key={i} opacity={collapsePhase}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={IDENTITY.terracottaWarm}
                  strokeWidth={3.2}
                />
                <polygon
                  points={`${x2},${y2} ${x2 + Math.cos(ang) * 16 + Math.cos(perp) * 8},${
                    y2 + Math.sin(ang) * 16 + Math.sin(perp) * 8
                  } ${x2 + Math.cos(ang) * 16 - Math.cos(perp) * 8},${
                    y2 + Math.sin(ang) * 16 - Math.sin(perp) * 8
                  }`}
                  fill={IDENTITY.terracottaWarm}
                />
              </g>
            );
          })}

        {/* Physical Periodic Element Barrier Scale (1 H -> 26 Fe [WALL] ... 79 Au) */}
        <g transform="translate(104, 1485)">
          <line x1={0} y1={92} x2={1232} y2={92} stroke="rgba(237,232,221,0.28)" strokeWidth={2} />
          {[
            { x: 46, z: '1', sym: 'H', label: 'AKTIF', blocked: false },
            { x: 196, z: '2', sym: 'He', label: 'AKTIF', blocked: false },
            { x: 346, z: '6', sym: 'C', label: 'AKTIF', blocked: false },
            { x: 496, z: '14', sym: 'Si', label: 'AKTIF', blocked: false },
            { x: 666, z: '26', sym: 'Fe', label: 'BATAS MATI', blocked: false, wall: true },
            { x: 1168, z: '79', sym: 'Au', label: 'MUSTAHIL DI SINI', blocked: true },
          ].map((el, idx) => (
            <g key={idx} transform={`translate(${el.x}, 0)`}>
              <rect
                x={-44}
                y={8}
                width={88}
                height={84}
                fill={
                  el.wall
                    ? IDENTITY.terracottaStamp
                    : el.blocked
                      ? 'rgba(28, 26, 24, 0.6)'
                      : '#26211D'
                }
                stroke={
                  el.wall
                    ? '#F2EFE9'
                    : el.blocked
                      ? 'rgba(237,232,221,0.18)'
                      : IDENTITY.bullion24k
                }
                strokeWidth={el.wall ? 2.5 : 1.5}
                strokeDasharray={el.blocked ? '5 4' : undefined}
              />
              <text
                x={0}
                y={30}
                textAnchor="middle"
                fill={el.blocked ? 'rgba(237,232,221,0.34)' : IDENTITY.stoneText}
                fontFamily={IDENTITY.fontMono}
                fontSize={15}
                fontWeight={600}
              >
                {el.z}
              </text>
              <text
                x={0}
                y={68}
                textAnchor="middle"
                fill={el.blocked ? 'rgba(237,232,221,0.34)' : IDENTITY.ivoryText}
                fontFamily={IDENTITY.fontSerif}
                fontSize={38}
                fontWeight={700}
              >
                {el.sym}
              </text>
              <text
                x={0}
                y={124}
                textAnchor="middle"
                fill={
                  el.wall
                    ? IDENTITY.terracottaWarm
                    : el.blocked
                      ? 'rgba(237,232,221,0.38)'
                      : IDENTITY.stoneText
                }
                fontFamily={IDENTITY.fontMono}
                fontSize={15}
                fontWeight={600}
                letterSpacing="0.1em"
              >
                {el.label}
              </text>
            </g>
          ))}

          {/* Heavy Iron Wall Barrier Bar Between 26 Fe and 79 Au */}
          <line
            x1={776}
            y1={-6}
            x2={776}
            y2={132}
            stroke={IDENTITY.terracottaStamp}
            strokeWidth={5}
          />
          <line
            x1={789}
            y1={-6}
            x2={789}
            y2={132}
            stroke={IDENTITY.terracottaStamp}
            strokeWidth={2}
            strokeDasharray="6 5"
          />
          <text
            x={956}
            y={58}
            textAnchor="middle"
            fill={IDENTITY.stoneText}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            fontWeight={600}
            letterSpacing="0.1em"
          >
            KURANG 53 PROTON →
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// 9. SCENE 04 — BINTANG NEUTRON & KILONOVA R-PROCESS (35.546s – 51.827s)
// ============================================================================

export const Scene04TabrakanNeutron: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[3];
  const localSec = frame / fps;

  const lunarUrl = useProceduralSurface('lunar-litho');
  const voronoiGoldUrl = useProceduralSurface('voronoi-gold');

  // Merger instant at localSec = 7.45s ("saling menghantam. Ledakan dahsyat bernama kilonova...")
  const tCollide = 7.45;
  const isPostMerger = localSec >= tCollide;
  const preProg = clamp01(localSec / tCollide);
  const postSec = Math.max(0, localSec - tCollide);
  const postProg = clamp01(postSec / 8.5);

  const cx = 720;
  const cy = 935;

  // Relativistic Keplerian shrinking inspiral radius: r(t) = r0 * (1 - t/tc)^0.32
  const orbitR = isPostMerger ? 0 : 255 * Math.pow(Math.max(0.004, 1 - preProg), 0.34);
  const theta = localSec * (2.2 + preProg * preProg * 9.5);
  const s1x = cx + Math.cos(theta) * orbitR;
  const s1y = cy + Math.sin(theta) * orbitR * 0.84;
  const s2x = cx - Math.cos(theta) * orbitR;
  const s2y = cy - Math.sin(theta) * orbitR * 0.84;

  // Precomputed faceted gold ejecta fragments post-collision
  const ejectaCrystals = useMemo(() => {
    const rand = mulberry32(4079);
    return Array.from({ length: 28 }).map(() => ({
      ang: rand() * Math.PI * 2,
      dist: 130 + rand() * 315,
      size: 16 + rand() * 22,
      rot: rand() * 360,
      delay: rand() * 0.16,
    }));
  }, []);

  const flashAlpha =
    localSec >= tCollide - 0.08 && localSec <= tCollide + 0.65
      ? Math.exp(-Math.abs(localSec - tCollide) * 6.5) * 0.62
      : 0;

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="suede-slate"
        surfaceOpacity={0.26}
        warmLampX={50}
        warmLampY={40}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure={isPostMerger ? '79 Au' : '355×'}
        unit={isPostMerger ? 'KILONOVA' : 'PUTARAN / DETIK'}
        subtitle={
          isPostMerger
            ? 'ATOM MENELAN RIBUAN NEUTRON · BERUBAH JADI EMAS MURNI'
            : 'DUA BINTANG NEUTRON SEUKURAN KOTA SALING MENGHANTAM'
        }
        localSec={localSec}
        accentColor={isPostMerger ? IDENTITY.bullion24k : IDENTITY.platinumIvory}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="s4-ns-sphere" cx="35%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FAF6EC" />
            <stop offset="52%" stopColor="#C9C2B2" />
            <stop offset="100%" stopColor="#5A5852" />
          </radialGradient>
          <radialGradient id="s4-kilonova-cloud" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(247, 233, 184, 0.78)" />
            <stop offset="38%" stopColor="rgba(212, 160, 62, 0.44)" />
            <stop offset="72%" stopColor="rgba(148, 82, 34, 0.22)" />
            <stop offset="100%" stopColor="rgba(18, 22, 26, 0)" />
          </radialGradient>
          <clipPath id="s4-ns1">
            <circle cx={s1x} cy={s1y} r={58} />
          </clipPath>
          <clipPath id="s4-ns2">
            <circle cx={s2x} cy={s2y} r={58} />
          </clipPath>
        </defs>

        {/* Engraved Copperplate Guilloché Spacetime Curvature Rings (STRICTLY NON-NEON) */}
        <GuillocheRosette
          cx={cx}
          cy={cy}
          R={isPostMerger ? 395 : 370 - preProg * 95}
          r={62}
          d={88}
          stroke="rgba(237, 230, 214, 0.16)"
          rotationDeg={localSec * 9}
        />
        {[145, 225, 310, 405].map((baseR, idx) => {
          const waveR = isPostMerger
            ? baseR + ((postSec * 145 + idx * 70) % 240)
            : baseR - ((localSec * 48 + idx * 55) % 90) * 0.35;
          return (
            <ellipse
              key={idx}
              cx={cx}
              cy={cy}
              rx={waveR}
              ry={waveR * 0.86}
              fill="none"
              stroke={isPostMerger ? 'rgba(212, 160, 62, 0.24)' : 'rgba(237, 230, 214, 0.18)'}
              strokeWidth={1.3}
              strokeDasharray={idx % 2 === 0 ? '8 8' : undefined}
            />
          );
        })}

        {/* BEAT A: City-Scale Inset + Binary Neutron Star Inspiral */}
        {!isPostMerger && (
          <g>
            {/* Upper-Right Architectural City Scale Comparison (20 KM) */}
            <g transform="translate(970, 445)" opacity={easeOutCubic(clamp01(localSec / 0.8))}>
              <line x1={0} y1={72} x2={320} y2={72} stroke={IDENTITY.hairlineIvory} strokeWidth={1.6} />
              {/* Crisp 2D City Skyline Silhouette */}
              <path
                d="M 18,72 V 46 H 38 V 28 H 58 V 52 H 74 V 14 H 98 V 42 H 116 V 22 H 142 V 48 H 164 V 8 H 188 V 38 H 212 V 26 H 236 V 50 H 262 V 32 H 286 V 72 Z"
                fill="rgba(237, 230, 214, 0.28)"
              />
              <line x1={18} y1={88} x2={286} y2={88} stroke={IDENTITY.bullionLight} strokeWidth={1.5} />
              <line x1={18} y1={82} x2={18} y2={94} stroke={IDENTITY.bullionLight} strokeWidth={1.5} />
              <line x1={286} y1={82} x2={286} y2={94} stroke={IDENTITY.bullionLight} strokeWidth={1.5} />
              <text
                x={152}
                y={112}
                textAnchor="middle"
                fill={IDENTITY.bullionLight}
                fontFamily={IDENTITY.fontMono}
                fontSize={16}
                fontWeight={600}
                letterSpacing="0.14em"
              >
                DIAMETER ± 20 KM (SEUKURAN KOTA)
              </text>
            </g>

            {/* Relativistic Wake Arcs */}
            {[0, 1].map((arm) => {
              const baseAng = theta + arm * Math.PI;
              const pts: string[] = [];
              for (let s = 0; s <= 24; s++) {
                const frac = s / 24;
                const a = baseAng - frac * 2.3;
                const rr = orbitR + frac * 48;
                pts.push(
                  `${s === 0 ? 'M' : 'L'} ${(cx + Math.cos(a) * rr).toFixed(1)},${(
                    cy +
                    Math.sin(a) * rr * 0.84
                  ).toFixed(1)}`,
                );
              }
              return (
                <path
                  key={arm}
                  d={pts.join(' ')}
                  fill="none"
                  stroke="rgba(237, 230, 214, 0.42)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Two Crusted Ivory-Platinum Neutron Stars with Hairline Magnetic Loops */}
            {[
              { x: s1x, y: s1y, clip: 's4-ns1' },
              { x: s2x, y: s2y, clip: 's4-ns2' },
            ].map((ns, idx) => (
              <g key={idx}>
                <ellipse
                  cx={ns.x}
                  cy={ns.y}
                  rx={92}
                  ry={44}
                  fill="none"
                  stroke="rgba(237, 230, 214, 0.24)"
                  strokeWidth={1.2}
                  transform={`rotate(${(theta * 180) / Math.PI + 35}, ${ns.x}, ${ns.y})`}
                />
                <circle cx={ns.x} cy={ns.y} r={58} fill="url(#s4-ns-sphere)" />
                {lunarUrl && (
                  <g clipPath={`url(#${ns.clip})`} opacity={0.34}>
                    <image href={lunarUrl} x={ns.x - 60} y={ns.y - 60} width={120} height={120} />
                  </g>
                )}
                <circle
                  cx={ns.x}
                  cy={ns.y}
                  r={58}
                  fill="none"
                  stroke="#FAF6EC"
                  strokeWidth={2}
                />
              </g>
            ))}
          </g>
        )}

        {/* BEAT B: Kilonova Expansion & Voronoi 24K Gold Synthesis */}
        {isPostMerger && (
          <g>
            {/* Expanding Gouache/Mineral Kilonova Ejecta Shell */}
            <circle
              cx={cx}
              cy={cy}
              r={120 + easeOutQuint(postProg) * 375}
              fill="url(#s4-kilonova-cloud)"
            />
            {/* Bipolar Relativistic Collimated Cones (Warm Ivory/Brass — Zero Neon) */}
            <polygon
              points={`${cx - 16},${cy} ${cx - 115},${cy - 470} ${cx + 115},${cy - 470} ${cx + 16},${cy}`}
              fill="rgba(247, 233, 184, 0.14)"
            />
            <polygon
              points={`${cx - 16},${cy} ${cx - 115},${cy + 470} ${cx + 115},${cy + 470} ${cx + 16},${cy}`}
              fill="rgba(247, 233, 184, 0.14)"
            />

            {/* Shockwave Caliper Ring */}
            <circle
              cx={cx}
              cy={cy}
              r={95 + easeOutCubic(clamp01(postSec / 3.2)) * 375}
              fill="none"
              stroke={IDENTITY.bullionLight}
              strokeWidth={2.2}
              opacity={1 - clamp01(postSec / 5.5) * 0.55}
            />

            {/* Forged Faceted 24K Gold Crystals Flung Outward */}
            {ejectaCrystals.map((cr, idx) => {
              const ep = easeOutQuint(clamp01((postSec - cr.delay * 2) / 3.4));
              if (ep <= 0.01) return null;
              const px = cx + Math.cos(cr.ang + postSec * 0.08) * cr.dist * ep;
              const py = cy + Math.sin(cr.ang + postSec * 0.08) * cr.dist * ep;
              return (
                <FacetedGoldNugget
                  key={idx}
                  cx={px}
                  cy={py}
                  size={cr.size * (0.45 + 0.55 * ep)}
                  goldTexUrl={voronoiGoldUrl}
                  rotation={cr.rot + postSec * 18}
                />
              );
            })}

            {/* Remnant Incandescent Core */}
            <circle cx={cx} cy={cy} r={34} fill="#FAF3DD" stroke={IDENTITY.bullion24k} strokeWidth={4} />
          </g>
        )}

        {/* Bottom Physical Nuclear Transmutation Plaque (r-Process Assembly) */}
        <g transform="translate(116, 1475)">
          <rect
            x={0}
            y={0}
            width={1208}
            height={176}
            fill="rgba(20, 23, 27, 0.88)"
            stroke="rgba(212, 160, 62, 0.36)"
            strokeWidth={1.6}
          />
          {/* Corner Brass Ticks */}
          <path d="M 0,18 V 0 H 18 M 1190,0 H 1208 V 18 M 0,158 V 176 H 18 M 1190,176 H 1208 V 158" fill="none" stroke={IDENTITY.bullionLight} strokeWidth={2.5} />

          {/* Left: Seed Nucleus 26 Fe */}
          <circle cx={125} cy={88} r={48} fill={IDENTITY.castIronDark} stroke={IDENTITY.castIronLight} strokeWidth={2.2} />
          <text x={125} y={98} textAnchor="middle" fill="#FFF" fontFamily={IDENTITY.fontSerif} fontSize={34} fontWeight={700}>
            26 Fe
          </text>

          {/* Center: Stream of Rapid Neutrons (+ n0) */}
          <line x1={205} y1={88} x2={835} y2={88} stroke="rgba(237,232,221,0.24)" strokeWidth={2} strokeDasharray="6 6" />
          {Array.from({ length: 9 }).map((_, nIdx) => {
            const u = ((localSec * (isPostMerger ? 1.35 : 0.45) + nIdx / 9) % 1);
            const nx = 215 + u * 600;
            const ny = 88 + Math.sin(u * Math.PI * 4 + nIdx) * 14;
            return (
              <circle
                key={nIdx}
                cx={nx}
                cy={ny}
                r={7.5}
                fill={IDENTITY.platinumIvory}
                opacity={isPostMerger ? 0.95 : 0.35}
              />
            );
          })}
          <text
            x={520}
            y={46}
            textAnchor="middle"
            fill={IDENTITY.stoneText}
            fontFamily={IDENTITY.fontMono}
            fontSize={17}
            fontWeight={600}
            letterSpacing="0.16em"
          >
            {isPostMerger
              ? '+ RIBUAN NEUTRON BEBAS DALAM HITUNGAN DETIK (R-PROCESS)'
              : 'MENUNGGU TUMBUKAN EKSTREM BINTANG NEUTRON'}
          </text>
          <text
            x={520}
            y={144}
            textAnchor="middle"
            fill={isPostMerger ? IDENTITY.bullionLight : IDENTITY.stoneText}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            letterSpacing="0.14em"
          >
            26 PROTON  ───►  79 PROTON + 118 NEUTRON
          </text>

          {/* Right: Newly Forged 79 Au Pure Gold Bullion Disk */}
          <g opacity={isPostMerger ? 1 : 0.32}>
            <circle
              cx={1045}
              cy={88}
              r={56}
              fill={IDENTITY.bullion24k}
              stroke="#FAF0CA"
              strokeWidth={2.6}
            />
            <text x={1045} y={96} textAnchor="middle" fill="#261703" fontFamily={IDENTITY.fontSerif} fontSize={36} fontWeight={700}>
              79 Au
            </text>
            <text x={1045} y={120} textAnchor="middle" fill="#3D2605" fontFamily={IDENTITY.fontMono} fontSize={13} fontWeight={700}>
              EMAS
            </text>
          </g>
        </g>

        {/* Subtle Non-Neon Warm Ivory Shutter Flash at Moment of Merger */}
        {flashAlpha > 0.01 && (
          <rect x={0} y={0} width={1440} height={2560} fill="#FAF3E0" opacity={flashAlpha} />
        )}
      </svg>
    </AbsoluteFill>
  );
};
