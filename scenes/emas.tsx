import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { noise2D } from '@remotion/noise';
import { getLength, getPointAtLength } from '@remotion/paths';
import {
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  easeOutQuint,
  prog,
  smoothstep,
} from './script';

// ============================================================================
// DETERMINISTIC PRNG & MULTI-OCTAVE FRACTAL NOISE (PURE 2D PROCEDURAL ENGINE)
// ============================================================================

export const hash01 = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

export const fbm2 = (
  seed: string,
  x: number,
  y: number,
  octaves = 4,
  lacunarity = 2.05,
  gain = 0.5,
): number => {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2D(`${seed}-${i}`, x * freq, y * freq);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return norm > 0 ? sum / norm : 0; // [-1, 1]
};

export const ridgeFbm2 = (
  seed: string,
  x: number,
  y: number,
  octaves = 4,
): number => {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(noise2D(`${seed}-r-${i}`, x * freq, y * freq));
    sum += amp * n * n;
    norm += amp;
    amp *= 0.52;
    freq *= 2.12;
  }
  return norm > 0 ? sum / norm : 0; // [0, 1]
};

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const mixRgb = (
  c1: readonly [number, number, number],
  c2: readonly [number, number, number],
  t: number,
): [number, number, number] => {
  const u = clamp01(t);
  return [
    Math.round(lerp(c1[0], c2[0], u)),
    Math.round(lerp(c1[1], c2[1], u)),
    Math.round(lerp(c1[2], c2[2], u)),
  ];
};

// ============================================================================
// IN-MEMORY PROCEDURAL 2D CANVAS TEXTURE CACHE (ZERO AI IMAGES, ZERO 3D)
// ============================================================================

const TEXTURE_CACHE = new Map<string, string>();

const buildCanvasDataUrl = (
  key: string,
  width: number,
  height: number,
  painter: (data: Uint8ClampedArray, w: number, h: number) => void,
): string => {
  const cached = TEXTURE_CACHE.get(key);
  if (cached) return cached;
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const img = ctx.createImageData(width, height);
  painter(img.data, width, height);
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL('image/png');
  TEXTURE_CACHE.set(key, url);
  return url;
};

/**
 * 1. Crumpled & Brushed 24K Gold Foil Texture (Kapton / Aurum Specular Map)
 * Computes a procedural crease + hammered micro-facet heightfield and shades it
 * with warm 24K diffuse + sharp Blinn-Phong metallic specular highlights.
 */
export const getGoldFoilTexture = (variant: 'crumpled' | 'brushed' = 'crumpled'): string =>
  buildCanvasDataUrl(`gold-foil-${variant}-v2`, 384, 384, (px, w, h) => {
    const hMap = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const v = y / h;
        if (variant === 'crumpled') {
          const r1 = ridgeFbm2('au-foil-a', u * 5.2, v * 5.2, 4);
          const r2 = ridgeFbm2('au-foil-b', u * 11.5 + 3.1, v * 11.5 - 1.7, 3);
          const fine = fbm2('au-foil-c', u * 26, v * 26, 2) * 0.12;
          hMap[y * w + x] = r1 * 0.62 + r2 * 0.32 + fine;
        } else {
          const streak = fbm2('au-brush-x', u * 3.2, v * 42, 3) * 0.35;
          const sheen = fbm2('au-brush-y', u * 2.1, v * 2.4, 3) * 0.65;
          hMap[y * w + x] = 0.5 + streak * 0.35 + sheen * 0.45;
        }
      }
    }

    const lx = -0.46;
    const ly = -0.58;
    const lz = 0.67;

    for (let y = 0; y < h; y++) {
      const ym = Math.max(0, y - 1);
      const yp = Math.min(h - 1, y + 1);
      for (let x = 0; x < w; x++) {
        const xm = Math.max(0, x - 1);
        const xp = Math.min(w - 1, x + 1);
        const dzdx = (hMap[y * w + xp] - hMap[y * w + xm]) * (variant === 'crumpled' ? 5.6 : 2.6);
        const dzdy = (hMap[yp * w + x] - hMap[ym * w + x]) * (variant === 'crumpled' ? 5.6 : 3.2);
        const invLen = 1 / Math.sqrt(dzdx * dzdx + dzdy * dzdy + 1);
        const nx = -dzdx * invLen;
        const ny = -dzdy * invLen;
        const nz = invLen;

        const ndotl = clamp01(nx * lx + ny * ly + nz * lz);
        const hx = lx * 0.5;
        const hy = ly * 0.5;
        const hz = lz + 1;
        const hInv = 1 / Math.sqrt(hx * hx + hy * hy + hz * hz);
        const ndoth = clamp01(nx * hx * hInv + ny * hy * hInv + nz * hz * hInv);
        const spec = Math.pow(ndoth, variant === 'crumpled' ? 22 : 34);

        const shadow: [number, number, number] = [92, 54, 8];
        const mid: [number, number, number] = [219, 158, 34];
        const bright: [number, number, number] = [255, 224, 122];
        const hot: [number, number, number] = [255, 250, 224];

        let rgb = ndotl < 0.52
          ? mixRgb(shadow, mid, ndotl / 0.52)
          : mixRgb(mid, bright, (ndotl - 0.52) / 0.48);
        rgb = mixRgb(rgb, hot, clamp01(spec * 0.92));

        const idx = (y * w + x) * 4;
        px[idx] = rgb[0];
        px[idx + 1] = rgb[1];
        px[idx + 2] = rgb[2];
        px[idx + 3] = 255;
      }
    }
  });

/**
 * 2. Brushed Gunmetal / Cold Stellar Iron Texture
 */
export const getBrushedMetalTexture = (tone: 'gunmetal' | 'iron' = 'gunmetal'): string =>
  buildCanvasDataUrl(`metal-${tone}-v2`, 360, 360, (px, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const v = y / h;
        const brush = fbm2(`m-${tone}-b`, u * 4.5, v * 58, 3) * 0.5 + 0.5;
        const mottling = fbm2(`m-${tone}-m`, u * 6.5, v * 6.5, 3) * 0.5 + 0.5;
        const diag = clamp01(1 - Math.abs(u * 0.85 + v * 0.65 - 0.72) * 1.45);
        const lum = clamp01(brush * 0.28 + mottling * 0.22 + diag * 0.52);

        const dark: [number, number, number] = tone === 'iron' ? [28, 35, 48] : [20, 24, 33];
        const mid: [number, number, number] = tone === 'iron' ? [88, 102, 124] : [52, 60, 76];
        const hi: [number, number, number] = tone === 'iron' ? [196, 212, 232] : [132, 146, 168];

        const rgb = lum < 0.55
          ? mixRgb(dark, mid, lum / 0.55)
          : mixRgb(mid, hi, (lum - 0.55) / 0.45);

        const idx = (y * w + x) * 4;
        px[idx] = rgb[0];
        px[idx + 1] = rgb[1];
        px[idx + 2] = rgb[2];
        px[idx + 3] = 255;
      }
    }
  });

/**
 * 3. Procedural 2D Illustrated Planetary Globe (Earth / Hadean Molten / Lunar)
 * Pure 2D circular disc pixel painter with organic FBM continents, clouds,
 * basaltic maria, molten magma veins, and soft directional terminator shading.
 */
export const getCelestialDiscTexture = (
  kind: 'lunar' | 'solar' | 'hadean-molten' | 'hadean-cooling' | 'golden-moon',
): string =>
  buildCanvasDataUrl(`celestial-${kind}-v2`, 440, 440, (px, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const rMax = w * 0.485;

    // Pre-seed deterministic craters for lunar/golden-moon
    const craters = Array.from({ length: 28 }).map((_, i) => ({
      x: (hash01(i * 13 + 3) - 0.5) * 1.55,
      y: (hash01(i * 29 + 7) - 0.5) * 1.55,
      r: 0.05 + hash01(i * 41 + 11) * 0.19,
    }));

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / rMax;
        const dy = (y - cy) / rMax;
        const rr = dx * dx + dy * dy;
        const idx = (y * w + x) * 4;

        if (rr > 1) {
          px[idx + 3] = 0;
          continue;
        }

        const nz = Math.sqrt(Math.max(0.0001, 1 - rr));
        // Soft 2D spherical UV warp for natural curved planetary appearance
        const lat = Math.asin(clamp01((dy + 1) * 0.5) * 2 - 1);
        const lon = Math.atan2(dx, nz);
        const su = lon * 0.95 + 2.5;
        const sv = lat * 1.35 + 2.5;

        const alphaEdge = clamp01((1 - Math.sqrt(rr)) * 75);
        let rgb: [number, number, number] = [120, 120, 120];

        if (kind === 'lunar' || kind === 'golden-moon') {
          const base = fbm2(`${kind}-reg`, su * 1.9, sv * 1.9, 5) * 0.5 + 0.5;
          const mare = smoothstep((fbm2(`${kind}-mare`, su * 0.95 + 4, sv * 0.95 - 2, 4) + 0.15) * 1.6);
          let craterDelta = 0;
          for (let c = 0; c < craters.length; c++) {
            const cdx = dx - craters[c].x;
            const cdy = dy - craters[c].y;
            const dist = Math.sqrt(cdx * cdx + cdy * cdy) / craters[c].r;
            if (dist < 1.25) {
              if (dist < 0.82) {
                craterDelta -= (1 - (dist / 0.82) * (dist / 0.82)) * 0.24;
              } else {
                const rim = 1 - Math.abs(dist - 1.0) / 0.25;
                craterDelta += clamp01(rim) * 0.18 * (cdx < 0 ? 1.25 : 0.55);
              }
            }
          }
          const light = clamp01(dx * -0.58 + dy * -0.34 + nz * 0.74);
          const terminator = smoothstep((light + 0.06) * 1.35);

          if (kind === 'lunar') {
            const highland: [number, number, number] = [214, 218, 226];
            const mareCol: [number, number, number] = [104, 112, 126];
            const nightCol: [number, number, number] = [18, 23, 35];
            let surf = mixRgb(highland, mareCol, mare * 0.72);
            const mod = clamp01(0.5 + (base - 0.5) * 0.45 + craterDelta);
            surf = mixRgb([68, 74, 88], [244, 246, 250], mod * 0.72 + (mare ? 0 : 0.16));
            rgb = mixRgb(nightCol, surf, 0.14 + terminator * 0.86);
          } else {
            const darkAu: [number, number, number] = [74, 42, 6];
            const midAu: [number, number, number] = [226, 164, 36];
            const hiAu: [number, number, number] = [255, 236, 152];
            const val = clamp01((0.35 + base * 0.45 + craterDelta) * (0.25 + terminator * 0.9));
            rgb = val < 0.55
              ? mixRgb(darkAu, midAu, val / 0.55)
              : mixRgb(midAu, hiAu, (val - 0.55) / 0.45);
          }
        } else if (kind === 'solar') {
          const cells = ridgeFbm2('sun-gran', su * 4.8, sv * 4.8, 4);
          const superGran = fbm2('sun-sup', su * 1.8, sv * 1.8, 4) * 0.5 + 0.5;
          const limb = Math.pow(nz, 0.52);
          const heat = clamp01((cells * 0.62 + superGran * 0.38) * (0.38 + limb * 0.78));

          const deepRed: [number, number, number] = [128, 24, 12];
          const orange: [number, number, number] = [238, 96, 24];
          const goldHot: [number, number, number] = [255, 198, 74];
          const whiteHot: [number, number, number] = [255, 248, 214];

          if (heat < 0.38) rgb = mixRgb(deepRed, orange, heat / 0.38);
          else if (heat < 0.74) rgb = mixRgb(orange, goldHot, (heat - 0.38) / 0.36);
          else rgb = mixRgb(goldHot, whiteHot, (heat - 0.74) / 0.26);
        } else if (kind === 'hadean-molten') {
          const crust = fbm2('had-crust', su * 2.1, sv * 2.1, 5) * 0.5 + 0.5;
          const cracks = Math.pow(ridgeFbm2('had-cracks', su * 3.4, sv * 3.4, 4), 3.4);
          const light = clamp01(dx * -0.45 + dy * -0.42 + nz * 0.78);
          const basalt: [number, number, number] = mixRgb(
            [18, 20, 28],
            [58, 46, 44],
            crust * (0.35 + light * 0.65),
          );
          const magma: [number, number, number] = cracks > 0.55
            ? mixRgb([245, 108, 26], [255, 232, 128], (cracks - 0.55) / 0.45)
            : [210, 62, 18];
          rgb = mixRgb(basalt, magma, clamp01((cracks - 0.28) * 1.85));
        } else {
          // hadean-cooling: oceanic blue-slate + volcanic islands + wispy white clouds
          const cont = fbm2('cool-cont', su * 1.65 + 1.2, sv * 1.65 - 0.8, 5);
          const warp = fbm2('cool-warp', su * 2.2, sv * 2.2, 3) * 0.35;
          const clouds = smoothstep(
            (fbm2('cool-cld', su * 2.6 + warp, sv * 3.1 - warp, 4) + 0.08) * 1.5,
          );
          const light = clamp01(dx * -0.52 + dy * -0.38 + nz * 0.76);
          const term = smoothstep((light + 0.08) * 1.35);

          const oceanDeep: [number, number, number] = [18, 48, 96];
          const oceanShallow: [number, number, number] = [38, 92, 152];
          const land: [number, number, number] = [68, 78, 64];
          const highland: [number, number, number] = [112, 98, 78];

          let surf = cont < 0.04
            ? mixRgb(oceanDeep, oceanShallow, clamp01((cont + 0.45) * 1.9))
            : mixRgb(land, highland, clamp01(cont * 2.2));
          surf = mixRgb(surf, [238, 244, 252], clouds * 0.66);
          const atmoRim = Math.pow(1 - nz, 2.6) * (0.35 + term * 0.65);
          surf = mixRgb(surf, [108, 178, 255], clamp01(atmoRim * 0.75));
          rgb = mixRgb([8, 13, 24], surf, 0.14 + term * 0.86);
        }

        px[idx] = rgb[0];
        px[idx + 1] = rgb[1];
        px[idx + 2] = rgb[2];
        px[idx + 3] = Math.round(alphaEdge * 255);
      }
    }
  });

/**
 * 4. Subterranean Geological Strata Texture (Basalt, Schist & Quartz Fractures)
 */
export const getGeologicalStrataTexture = (): string =>
  buildCanvasDataUrl('geo-strata-v2', 480, 640, (px, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const v = y / h;
        const fold = fbm2('geo-fold', u * 2.4, v * 1.8, 3) * 0.09;
        const band = Math.sin((v + fold) * 34) * 0.5 + 0.5;
        const grain = fbm2('geo-grain', u * 16, v * 16, 4) * 0.5 + 0.5;
        const crack = Math.pow(ridgeFbm2('geo-crk', u * 5.5, v * 5.5, 3), 5.0);

        const deepHeat = smoothstep((v - 0.58) / 0.42);
        const topSlate: [number, number, number] = [20, 22, 30];
        const midBasalt: [number, number, number] = [38, 33, 32];
        const warmMantle: [number, number, number] = [72, 32, 18];

        let rgb = mixRgb(topSlate, midBasalt, clamp01(band * 0.55 + grain * 0.45));
        rgb = mixRgb(rgb, warmMantle, deepHeat * 0.72);
        if (crack > 0.58) {
          rgb = mixRgb(rgb, [135, 118, 96], (crack - 0.58) * 0.85);
        }

        const idx = (y * w + x) * 4;
        px[idx] = rgb[0];
        px[idx + 1] = rgb[1];
        px[idx + 2] = rgb[2];
        px[idx + 3] = 255;
      }
    }
  });

// ============================================================================
// SHARED FULL-RATIO (1440x2560) CINEMA BACKDROPS, OPTICAL FX & HUD PRIMITIVES
// ============================================================================

export const TechnicalGridOverlay: React.FC<{
  opacity?: number;
  cell?: number;
  tint?: string;
}> = ({ opacity = 0.055, cell = 90, tint = '148, 182, 235' }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      opacity,
      backgroundImage: `
        linear-gradient(to right, rgba(${tint}, 0.55) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(${tint}, 0.55) 1px, transparent 1px)
      `,
      backgroundSize: `${cell}px ${cell}px`,
      maskImage:
        'radial-gradient(ellipse 85% 70% at 50% 42%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.2) 78%, transparent 100%)',
      WebkitMaskImage:
        'radial-gradient(ellipse 85% 70% at 50% 42%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.2) 78%, transparent 100%)',
    }}
  />
);

export const DeepCosmosBackdrop: React.FC<{
  seed: string;
  nebulaHue?: 'gold' | 'blue' | 'crimson' | 'violet';
  starCount?: number;
  drift?: number;
}> = ({ seed, nebulaHue = 'blue', starCount = 125, drift = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const stars = useMemo(() => {
    const colors = ['#FFFFFF', '#DCEBFF', '#FFF2D6', '#FFD599', '#B8D8FF'];
    return Array.from({ length: starCount }).map((_, i) => {
      const s = seed.charCodeAt(0) * 193 + i * 47;
      return {
        x: hash01(s + 1) * 1440,
        y: hash01(s + 2) * 2240,
        r: 0.9 + Math.pow(hash01(s + 3), 2.3) * 3.1,
        twinkle: 1.1 + hash01(s + 4) * 3.2,
        phase: hash01(s + 5) * Math.PI * 2,
        diffraction: hash01(s + 6) > 0.9,
        color: colors[i % colors.length],
      };
    });
  }, [seed, starCount]);

  const nebulaPalette = {
    blue: ['rgba(32, 68, 136, 0.34)', 'rgba(18, 42, 88, 0.24)', 'rgba(218, 158, 42, 0.08)'],
    gold: ['rgba(186, 124, 24, 0.24)', 'rgba(38, 64, 122, 0.22)', 'rgba(255, 206, 98, 0.12)'],
    crimson: ['rgba(164, 42, 28, 0.28)', 'rgba(92, 26, 48, 0.22)', 'rgba(235, 134, 38, 0.12)'],
    violet: ['rgba(112, 54, 188, 0.30)', 'rgba(196, 62, 132, 0.18)', 'rgba(245, 182, 56, 0.16)'],
  }[nebulaHue];

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #050811 0%, #091122 44%, #070B16 78%, #04060B 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Volumetric Nebula Layers */}
      <div
        style={{
          position: 'absolute',
          inset: -140,
          transform: `translate3d(${Math.sin(t * 0.18) * 18 * drift}px, ${Math.cos(t * 0.14) * 14 * drift}px, 0)`,
          background: `
            radial-gradient(ellipse 68% 42% at 32% 28%, ${nebulaPalette[0]} 0%, transparent 72%),
            radial-gradient(ellipse 62% 46% at 74% 48%, ${nebulaPalette[1]} 0%, transparent 74%),
            radial-gradient(ellipse 52% 34% at 50% 38%, ${nebulaPalette[2]} 0%, transparent 70%)
          `,
        }}
      />

      {/* Starfield + 4-Point Optical Diffraction Spikes */}
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        {stars.map((st, idx) => {
          const tw = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(t * st.twinkle + st.phase));
          const sx = st.x;
          const sy = (st.y - t * 3.2 * drift + 2240) % 2240;
          return (
            <g key={idx} opacity={tw}>
              <circle cx={sx} cy={sy} r={st.r} fill={st.color} />
              {st.diffraction && (
                <g opacity={0.78}>
                  <circle cx={sx} cy={sy} r={st.r * 3.6} fill={st.color} opacity={0.16} />
                  <line
                    x1={sx - st.r * 8.5}
                    y1={sy}
                    x2={sx + st.r * 8.5}
                    y2={sy}
                    stroke={st.color}
                    strokeWidth={1.15}
                    strokeLinecap="round"
                  />
                  <line
                    x1={sx}
                    y1={sy - st.r * 8.5}
                    x2={sx}
                    y2={sy + st.r * 8.5}
                    stroke={st.color}
                    strokeWidth={1.15}
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const BottomCaptionVignette: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 980,
      pointerEvents: 'none',
      background:
        'linear-gradient(180deg, rgba(4, 6, 11, 0) 0%, rgba(4, 6, 11, 0.58) 34%, rgba(4, 6, 11, 0.88) 68%, rgba(4, 6, 11, 0.97) 100%)',
    }}
  />
);

export const GoldenDustField: React.FC<{
  seed: string;
  count?: number;
  maxY?: number;
  color?: string;
}> = ({ seed, count = 34, maxY = 1860, color = '#FFE08A' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const motes = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const s = seed.charCodeAt(0) * 89 + i * 37;
      return {
        x: 90 + hash01(s + 1) * 1260,
        y: 120 + hash01(s + 2) * (maxY - 120),
        r: 1.4 + hash01(s + 3) * 3.4,
        vy: 14 + hash01(s + 4) * 26,
        sway: 12 + hash01(s + 5) * 24,
        phase: hash01(s + 6) * Math.PI * 2,
      };
    });
  }, [seed, count, maxY]);

  return (
    <svg
      width={1440}
      height={2560}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {motes.map((m, i) => {
        const span = maxY - 120;
        const y = 120 + (((m.y - 120 - t * m.vy) % span) + span) % span;
        const x = m.x + Math.sin(t * 1.3 + m.phase) * m.sway;
        const alpha = (0.22 + 0.58 * (0.5 + 0.5 * Math.sin(t * 2.4 + m.phase))) *
          clamp01((y - 120) / 140) *
          clamp01((maxY - y) / 160);
        return (
          <g key={i} opacity={alpha}>
            <circle cx={x} cy={y} r={m.r * 2.8} fill={color} opacity={0.18} />
            <circle cx={x} cy={y} r={m.r} fill="#FFF9E2" />
          </g>
        );
      })}
    </svg>
  );
};

export const PillBadge: React.FC<{
  label: string;
  tone?: 'gold' | 'ice' | 'neutral' | 'crimson' | 'emerald';
  style?: React.CSSProperties;
}> = ({ label, tone = 'gold', style }) => {
  const palette = {
    gold: {
      border: 'rgba(245, 184, 65, 0.42)',
      bg: 'rgba(28, 22, 12, 0.76)',
      text: '#F7C968',
      glow: '0 0 28px rgba(245, 184, 65, 0.16)',
    },
    ice: {
      border: 'rgba(124, 232, 255, 0.38)',
      bg: 'rgba(12, 24, 38, 0.78)',
      text: '#9BEBFF',
      glow: '0 0 28px rgba(124, 232, 255, 0.15)',
    },
    crimson: {
      border: 'rgba(255, 112, 82, 0.44)',
      bg: 'rgba(38, 15, 14, 0.80)',
      text: '#FF957A',
      glow: '0 0 28px rgba(255, 98, 66, 0.18)',
    },
    emerald: {
      border: 'rgba(92, 214, 156, 0.42)',
      bg: 'rgba(12, 30, 24, 0.78)',
      text: '#7CE8B4',
      glow: '0 0 24px rgba(92, 214, 156, 0.15)',
    },
    neutral: {
      border: 'rgba(255, 255, 255, 0.22)',
      bg: 'rgba(15, 20, 32, 0.76)',
      text: '#DCE3F0',
      glow: '0 10px 28px rgba(0, 0, 0, 0.45)',
    },
  }[tone];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 28px',
        borderRadius: 999,
        background: palette.bg,
        border: `1.5px solid ${palette.border}`,
        boxShadow: `${palette.glow}, inset 0 1px 0 rgba(255,255,255,0.12)`,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        fontFamily: IDENTITY.fontMono,
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: '0.18em',
        color: palette.text,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {label}
    </div>
  );
};

export const FrostedTelemetryCard: React.FC<{
  eyebrow: string;
  mainValue: React.ReactNode;
  subLabel?: string;
  accent?: 'gold' | 'ice' | 'crimson';
  width?: number;
  style?: React.CSSProperties;
}> = ({ eyebrow, mainValue, subLabel, accent = 'gold', width = 1040, style }) => {
  const borderCol =
    accent === 'gold'
      ? 'rgba(245, 184, 65, 0.30)'
      : accent === 'ice'
      ? 'rgba(130, 216, 255, 0.28)'
      : 'rgba(255, 114, 84, 0.32)';

  const glowCol =
    accent === 'gold'
      ? 'rgba(245, 184, 65, 0.12)'
      : accent === 'ice'
      ? 'rgba(110, 195, 255, 0.12)'
      : 'rgba(255, 96, 64, 0.14)';

  return (
    <div
      style={{
        width,
        padding: '30px 42px',
        borderRadius: 26,
        background:
          'linear-gradient(180deg, rgba(20, 27, 44, 0.82) 0%, rgba(10, 14, 24, 0.90) 100%)',
        border: `1.5px solid ${borderCol}`,
        boxShadow: `0 28px 68px rgba(0, 0, 0, 0.65), 0 0 48px ${glowCol}, inset 0 1px 0 rgba(255, 255, 255, 0.16)`,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: IDENTITY.fontMono,
          fontSize: 21,
          fontWeight: 500,
          letterSpacing: '0.22em',
          color: 'rgba(202, 212, 228, 0.72)',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontFamily: IDENTITY.fontDisplay,
          fontSize: 66,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.08,
          color: '#F4F7FC',
        }}
      >
        {mainValue}
      </div>
      {subLabel && (
        <div
          style={{
            marginTop: 12,
            fontFamily: IDENTITY.fontMono,
            fontSize: 21,
            fontWeight: 500,
            letterSpacing: '0.14em',
            color:
              accent === 'gold'
                ? '#F5B841'
                : accent === 'ice'
                ? '#8BE4FF'
                : '#FF9074',
            textTransform: 'uppercase',
          }}
        >
          {subLabel}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HYPER-DETAILED 2D VISUAL SPECIMENS (FOIL-TEXTURED 24K GOLD NUGGET & MOON)
// ============================================================================

export const FoilGoldNugget: React.FC<{
  x: number;
  y: number;
  size: number;
  rotation?: number;
  shimmerPhase?: number;
  idSuffix?: string;
}> = ({ x, y, size, rotation = 0, shimmerPhase = 0, idSuffix = '0' }) => {
  const foilUrl = useMemo(() => getGoldFoilTexture('crumpled'), []);
  const r = size * 0.5;
  const sheen = 0.45 + 0.55 * Math.sin(shimmerPhase);
  const clipId = `nugget-clip-${idSuffix}`;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <defs>
        <clipPath id={clipId}>
          <polygon
            points={`${-r * 0.86},${-r * 0.24} ${-r * 0.36},${-r * 0.92} ${r * 0.48},${-r * 0.82} ${r * 0.94},${-r * 0.12} ${r * 0.68},${r * 0.78} ${-r * 0.22},${r * 0.92} ${-r * 0.88},${r * 0.48}`}
          />
        </clipPath>
      </defs>

      {/* Warm subsurface Aurum halo */}
      <circle cx={0} cy={0} r={r * 1.48} fill="rgba(245, 184, 65, 0.20)" />

      {/* Foil-textured crystalline body */}
      <g clipPath={`url(#${clipId})`}>
        {foilUrl ? (
          <image
            href={foilUrl}
            x={-r}
            y={-r}
            width={size}
            height={size}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <rect x={-r} y={-r} width={size} height={size} fill="#E5A92B" />
        )}
        {/* Crystalline facet lighting planes */}
        <polygon
          points={`${-r * 0.36},${-r * 0.92} ${r * 0.48},${-r * 0.82} ${r * 0.14},${-r * 0.08} ${-r * 0.52},${-r * 0.16}`}
          fill={`rgba(255, 250, 220, ${0.28 + sheen * 0.34})`}
        />
        <polygon
          points={`${r * 0.14},${-r * 0.08} ${r * 0.94},${-r * 0.12} ${r * 0.68},${r * 0.78} ${-r * 0.22},${r * 0.92}`}
          fill="rgba(78, 42, 4, 0.38)"
        />
        <polygon
          points={`${-r * 0.86},${-r * 0.24} ${-r * 0.52},${-r * 0.16} ${-r * 0.22},${r * 0.92} ${-r * 0.88},${r * 0.48}`}
          fill="rgba(128, 76, 10, 0.26)"
        />
      </g>

      {/* Crisp metallic bevel & ridge lines */}
      <polygon
        points={`${-r * 0.86},${-r * 0.24} ${-r * 0.36},${-r * 0.92} ${r * 0.48},${-r * 0.82} ${r * 0.94},${-r * 0.12} ${r * 0.68},${r * 0.78} ${-r * 0.22},${r * 0.92} ${-r * 0.88},${r * 0.48}`}
        fill="none"
        stroke="#FFF4C2"
        strokeOpacity={0.7}
        strokeWidth={Math.max(1.4, size * 0.022)}
        strokeLinejoin="round"
      />
      <polyline
        points={`${-r * 0.36},${-r * 0.92} ${r * 0.14},${-r * 0.08} ${r * 0.94},${-r * 0.12}`}
        fill="none"
        stroke="#FFFDF0"
        strokeOpacity={0.62}
        strokeWidth={Math.max(1.1, size * 0.016)}
      />
      <line
        x1={r * 0.14}
        y1={-r * 0.08}
        x2={-r * 0.22}
        y2={r * 0.92}
        stroke="rgba(90, 50, 5, 0.55)"
        strokeWidth={Math.max(1.1, size * 0.016)}
      />

      {/* Specular star glint */}
      {size >= 44 && (
        <g transform={`translate(${-r * 0.16}, ${-r * 0.44}) scale(${0.7 + sheen * 0.45})`}>
          <line x1={-11} y1={0} x2={11} y2={0} stroke="#FFFFFF" strokeWidth={2} />
          <line x1={0} y1={-11} x2={0} y2={11} stroke="#FFFFFF" strokeWidth={2} />
          <circle cx={0} cy={0} r={2.8} fill="#FFFFFF" />
        </g>
      )}
    </g>
  );
};

export const TexturedCelestialSphere: React.FC<{
  cx: number;
  cy: number;
  r: number;
  kind: 'lunar' | 'solar' | 'hadean-molten' | 'hadean-cooling' | 'golden-moon';
  rimColor?: string;
  rotationDeg?: number;
}> = ({ cx, cy, r, kind, rimColor = 'rgba(180, 210, 255, 0.35)', rotationDeg = 0 }) => {
  const texUrl = useMemo(() => getCelestialDiscTexture(kind), [kind]);
  const size = r * 2.06;

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <circle cx={0} cy={0} r={r * 1.18} fill={rimColor} opacity={0.22} />
      <circle cx={0} cy={0} r={r * 1.05} fill={rimColor} opacity={0.34} />
      {texUrl ? (
        <g transform={`rotate(${rotationDeg})`}>
          <image
            href={texUrl}
            x={-size / 2}
            y={-size / 2}
            width={size}
            height={size}
          />
        </g>
      ) : (
        <circle cx={0} cy={0} r={r} fill="#8892A4" />
      )}
      <circle
        cx={0}
        cy={0}
        r={r}
        fill="none"
        stroke={rimColor}
        strokeWidth={2}
        opacity={0.62}
      />
    </g>
  );
};

// ============================================================================
// SCENE 01 — BUKAN DARI BUMI (FULL-RATIO 1440x2560 JEWELER'S ASSAY BENCH)
// ============================================================================

export const Scene01LogamAsing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[0];
  const sec = ch.start + frame / fps;
  const localT = frame / fps;

  const goldBrushedUrl = useMemo(() => getGoldFoilTexture('brushed'), []);
  const gunmetalUrl = useMemo(() => getBrushedMetalTexture('gunmetal'), []);

  const ringIntro = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 90, mass: 0.95 },
  });

  // Switch flips OFF ("BUMI TIDAK MAMPU") at "bukan buatan Bumi" (2.9s)
  const switchFlip = easeInOutCubic(prog(sec, 2.75, 3.35));

  // Optical jeweler's loupe glides over the ring at 3.8s
  const loupeEnter = spring({
    frame: Math.max(0, frame - Math.round(3.6 * fps)),
    fps,
    config: { damping: 17, stiffness: 82 },
  });

  // Precision telemetry card rises at 4.6s ("4,5 miliar tahun lalu / 0 gram")
  const cardEnter = spring({
    frame: Math.max(0, frame - Math.round(4.55 * fps)),
    fps,
    config: { damping: 18, stiffness: 95 },
  });

  const camScale = 1 + localT * 0.0028;
  const sheenAngle = (localT * 46) % 360;
  const floatY = Math.sin(localT * 1.65) * 6;

  const loupeX = interpolate(loupeEnter, [0, 1], [190, 445]) + Math.sin(localT * 1.2) * 14;
  const loupeY = interpolate(loupeEnter, [0, 1], [410, 625]) + Math.cos(localT * 1.4) * 9;

  return (
    <AbsoluteFill style={{ backgroundColor: '#06080E', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${camScale})`,
          transformOrigin: '50% 44%',
        }}
      >
        <DeepCosmosBackdrop seed="ch01-cosmos" nebulaHue="gold" starCount={95} drift={0.6} />
        <TechnicalGridOverlay opacity={0.075} cell={80} tint="165, 190, 232" />

        {/* Overhead Jeweler's Volumetric Tungsten Spotlight Cone */}
        <div
          style={{
            position: 'absolute',
            left: 160,
            top: -120,
            width: 1120,
            height: 1680,
            background:
              'linear-gradient(180deg, rgba(255, 214, 120, 0.20) 0%, rgba(245, 184, 65, 0.08) 54%, rgba(245, 184, 65, 0) 100%)',
            clipPath: 'polygon(36% 0%, 64% 0%, 96% 100%, 4% 100%)',
            filter: 'blur(18px)',
            pointerEvents: 'none',
          }}
        />

        {/* Dark Obsidian Jeweler's Examination Surface */}
        <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="ch1-pedestal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#121724" />
              <stop offset="32%" stopColor="#0A0E17" />
              <stop offset="100%" stopColor="#04060B" />
            </linearGradient>
            <radialGradient id="ch1-table-glow" cx="52%" cy="46%" r="48%">
              <stop offset="0%" stopColor="rgba(245, 184, 65, 0.24)" />
              <stop offset="55%" stopColor="rgba(245, 184, 65, 0.05)" />
              <stop offset="100%" stopColor="rgba(245, 184, 65, 0)" />
            </radialGradient>
            <linearGradient id="ch1-ring-outer" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8E5608" />
              <stop offset="22%" stopColor="#F5BD38" />
              <stop offset="46%" stopColor="#FFF7D4" />
              <stop offset="72%" stopColor="#D4921A" />
              <stop offset="100%" stopColor="#5E3604" />
            </linearGradient>
            <linearGradient id="ch1-ring-inner" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A2A03" />
              <stop offset="38%" stopColor="#B87812" />
              <stop offset="68%" stopColor="#FFE494" />
              <stop offset="100%" stopColor="#693C05" />
            </linearGradient>
            <clipPath id="ch1-band-front-clip">
              <path d="M 390,895 A 300,116 0 0,0 990,895 L 990,998 A 300,116 0 0,1 390,998 Z" />
            </clipPath>
          </defs>

          {/* Horizon Bench Plane */}
          <ellipse cx={720} cy={1210} rx={980} ry={340} fill="url(#ch1-pedestal)" />
          <ellipse cx={720} cy={1020} rx={620} ry={190} fill="url(#ch1-table-glow)" />
          <ellipse
            cx={720}
            cy={1020}
            rx={560}
            ry={168}
            fill="none"
            stroke="rgba(245, 184, 65, 0.16)"
            strokeDasharray="6 10"
            strokeWidth={1.5}
          />

          {/* ============================================================== */}
          {/* HERO 1: SCULPTED 24K GOLD RING WITH FOIL SHEEN & CAUSTIC GLOW  */}
          {/* ============================================================== */}
          <g
            transform={`translate(0, ${(1 - ringIntro) * 70 + floatY})`}
            opacity={clamp01(ringIntro * 1.25)}
          >
            {/* Floor shadow & golden caustic crescent reflection */}
            <ellipse cx={690} cy={1046} rx={322} ry={108} fill="rgba(0, 0, 0, 0.72)" />
            <path
              d="M 445,1036 A 260,82 0 0,0 935,1036 A 240,66 0 0,1 445,1036 Z"
              fill="rgba(255, 206, 96, 0.24)"
            />

            <g transform="rotate(-7 690 925)">
              {/* Back inner wall of the gold band */}
              <path
                d="M 390,895 A 300,116 0 0,1 990,895 L 990,988 A 300,116 0 0,0 390,988 Z"
                fill="url(#ch1-ring-inner)"
                stroke="#472803"
                strokeWidth={2}
              />
              {/* Engraved metallurgical hallmark inside the band */}
              <text
                x={690}
                y={858}
                textAnchor="middle"
                fill="rgba(255, 240, 188, 0.68)"
                fontFamily={IDENTITY.fontMono}
                fontSize={21}
                fontWeight={600}
                letterSpacing="0.22em"
              >
                Au 79 · 999,9 · EX STELLIS
              </text>

              {/* Top metallic rim annulus */}
              <path
                d="M 390,895 A 300,116 0 1,1 990,895 A 300,116 0 1,1 390,895 Z M 438,895 A 252,92 0 1,0 942,895 A 252,92 0 1,0 438,895 Z"
                fill="url(#ch1-ring-outer)"
                fillRule="evenodd"
                stroke="#FFF5CC"
                strokeWidth={1.8}
              />

              {/* Front outer wall with procedural brushed 24K gold texture */}
              <path
                d="M 390,895 A 300,116 0 0,0 990,895 L 990,998 A 300,116 0 0,1 390,998 Z"
                fill="url(#ch1-ring-outer)"
              />
              {goldBrushedUrl && (
                <g clipPath="url(#ch1-band-front-clip)" opacity={0.48}>
                  <image
                    href={goldBrushedUrl}
                    x={380}
                    y={880}
                    width={620}
                    height={250}
                    preserveAspectRatio="none"
                  />
                </g>
              )}
              <path
                d="M 390,895 A 300,116 0 0,0 990,895 L 990,998 A 300,116 0 0,1 390,998 Z"
                fill="none"
                stroke="rgba(255, 246, 204, 0.55)"
                strokeWidth={2}
              />

              {/* Sweeping specular highlight across front gold curve */}
              <ellipse
                cx={690 + Math.sin((sheenAngle * Math.PI) / 180) * 185}
                cy={968}
                rx={56}
                ry={34}
                fill="rgba(255, 253, 236, 0.46)"
              />
              <path
                d="M 432,938 A 285,108 0 0,0 948,938"
                fill="none"
                stroke="rgba(255, 252, 228, 0.65)"
                strokeWidth={3.2}
                strokeLinecap="round"
              />
            </g>

            {/* ============================================================ */}
            {/* HERO 2: DARK BASALT SPECIMEN + CRYSTALLINE 24K GOLD NUGGET   */}
            {/* ============================================================ */}
            <g transform="translate(1075, 975)">
              <ellipse cx={0} cy={78} rx={165} ry={42} fill="rgba(0,0,0,0.68)" />
              <polygon
                points="-142,58 -108,-36 -18,-68 96,-44 148,38 86,78 -72,82"
                fill="#181E2B"
                stroke="#364156"
                strokeWidth={2.2}
              />
              <polygon
                points="-108,-36 -18,-68 22,-4 -76,18"
                fill="#242D3F"
              />
              {/* White hydrothermal quartz veins */}
              <polyline
                points="-96,26 -32,-8 36,12 104,-18"
                fill="none"
                stroke="rgba(226, 234, 248, 0.52)"
                strokeWidth={3}
              />
              <FoilGoldNugget
                x={8}
                y={-28}
                size={134}
                rotation={-8}
                shimmerPhase={localT * 2.8}
                idSuffix="ch1-main"
              />
            </g>
          </g>

          {/* ============================================================== */}
          {/* HERO 3: OPTICAL JEWELER'S LOUPE REVEALING ATOMIC LATTICE Au-79 */}
          {/* ============================================================== */}
          {loupeEnter > 0.01 && (
            <g
              transform={`translate(${loupeX}, ${loupeY}) scale(${0.84 + 0.16 * loupeEnter})`}
              opacity={clamp01(loupeEnter * 1.3)}
            >
              {/* Brass & ebony handle */}
              <g transform="rotate(36)">
                <rect x={-11} y={128} width={22} height={36} rx={4} fill="#D89B28" />
                <rect
                  x={-14}
                  y={158}
                  width={28}
                  height={128}
                  rx={12}
                  fill="#171A24"
                  stroke="#CFA042"
                  strokeWidth={2.2}
                />
              </g>
              {/* Magnifier lens interior: atomic gold lattice */}
              <circle cx={0} cy={0} r={132} fill="rgba(12, 18, 32, 0.88)" />
              {[48, 84, 114].map((orbR, idx) => (
                <circle
                  key={idx}
                  cx={0}
                  cy={0}
                  r={orbR}
                  fill="none"
                  stroke="rgba(245, 192, 78, 0.28)"
                  strokeDasharray="4 7"
                  strokeWidth={1.4}
                />
              ))}
              {/* Heavy 79-proton gold nucleus */}
              <circle cx={0} cy={0} r={34} fill="rgba(245, 184, 65, 0.26)" />
              <circle cx={0} cy={0} r={22} fill="#F5B841" stroke="#FFF6D2" strokeWidth={2} />
              <text
                x={0}
                y={7}
                textAnchor="middle"
                fill="#1B1103"
                fontFamily={IDENTITY.fontMono}
                fontSize={19}
                fontWeight={800}
              >
                79
              </text>
              {/* Relativistic orbiting inner electrons */}
              {Array.from({ length: 6 }).map((_, k) => {
                const ang = localT * (2.6 + (k % 2) * 1.1) + (k * Math.PI) / 3;
                const rad = k % 2 === 0 ? 52 : 86;
                return (
                  <circle
                    key={k}
                    cx={Math.cos(ang) * rad}
                    cy={Math.sin(ang) * rad}
                    r={4.5}
                    fill="#9BEBFF"
                  />
                );
              })}
              {/* Glass reflection arc & brushed brass bezel */}
              <path
                d="M -92,-56 A 108,108 0 0,1 68,-86"
                fill="none"
                stroke="rgba(255, 255, 255, 0.34)"
                strokeWidth={8}
                strokeLinecap="round"
              />
              <circle
                cx={0}
                cy={0}
                r={134}
                fill="none"
                stroke="url(#ch1-ring-outer)"
                strokeWidth={13}
              />
              <circle
                cx={0}
                cy={0}
                r={127}
                fill="none"
                stroke="rgba(255, 248, 214, 0.55)"
                strokeWidth={1.5}
              />
            </g>
          )}

          {/* Crisp Callout Leader Line on Right */}
          <g opacity={clamp01(prog(sec, 0.8, 1.8))}>
            <line
              x1={888}
              y1={845 + floatY}
              x2={992}
              y2={690}
              stroke="rgba(245, 184, 65, 0.72)"
              strokeWidth={2}
            />
            <line
              x1={992}
              y1={690}
              x2={1295}
              y2={690}
              stroke="rgba(245, 184, 65, 0.72)"
              strokeWidth={2}
            />
            <circle cx={888} cy={845 + floatY} r={5} fill="#F5B841" />
            <text
              x={998}
              y={672}
              fill="rgba(206, 216, 232, 0.78)"
              fontFamily={IDENTITY.fontMono}
              fontSize={20}
              letterSpacing="0.18em"
            >
              UNSUR BERAT · NOMOR ATOM 79
            </text>
            <text
              x={998}
              y={736}
              fill="#F5F7FB"
              fontFamily={IDENTITY.fontDisplay}
              fontSize={42}
              fontWeight={700}
            >
              EMAS MURNI (Au)
            </text>
          </g>
        </svg>

        {/* ================================================================ */}
        {/* TACTILE BRUSHED-GUNMETAL SWITCH PLATE (GPS-STYLE PHYSICAL UI!)   */}
        {/* ================================================================ */}
        <div
          style={{
            position: 'absolute',
            left: 104,
            top: 228,
            width: 446,
            padding: '24px 28px 26px',
            borderRadius: 18,
            backgroundImage: gunmetalUrl ? `url(${gunmetalUrl})` : undefined,
            backgroundColor: '#252B38',
            backgroundSize: 'cover',
            border: '1.5px solid rgba(255, 255, 255, 0.22)',
            boxShadow:
              '0 24px 52px rgba(0, 0, 0, 0.68), inset 0 1px 0 rgba(255, 255, 255, 0.28)',
          }}
        >
          {/* 4 corner instrument screws */}
          {[
            { left: 12, top: 12 },
            { right: 12, top: 12 },
            { left: 12, bottom: 12 },
            { right: 12, bottom: 12 },
          ].map((pos, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                width: 11,
                height: 11,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #9AA4B8, #343B4A)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)',
                ...pos,
              }}
            />
          ))}

          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: '0.2em',
              color: 'rgba(226, 234, 248, 0.85)',
              textAlign: 'center',
              marginBottom: 18,
            }}
          >
            DAPUR PLANET BUMI
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 22px',
            }}
          >
            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 21,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: switchFlip > 0.5 ? '#FF6E59' : 'rgba(200,208,222,0.42)',
                textShadow: switchFlip > 0.5 ? '0 0 18px rgba(255, 92, 68, 0.7)' : 'none',
              }}
            >
              NIHIL
            </span>

            {/* Mechanical toggle socket & metallic lever */}
            <div
              style={{
                position: 'relative',
                width: 96,
                height: 52,
                borderRadius: 999,
                background: '#12161F',
                border: '1.5px solid rgba(255,255,255,0.14)',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.85)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 5,
                  left: interpolate(switchFlip, [0, 1], [48, 6]),
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 35% 30%, #F5F8FF 0%, #98A3B8 55%, #4B5366 100%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.75)',
                }}
              />
            </div>

            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 21,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: switchFlip <= 0.5 ? '#F5B841' : 'rgba(200,208,222,0.36)',
              }}
            >
              AKTIF
            </span>
          </div>

          {/* Glowing Red Status Indicator */}
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                backgroundColor: switchFlip > 0.5 ? '#FF5542' : '#F5B841',
                boxShadow:
                  switchFlip > 0.5
                    ? '0 0 18px 4px rgba(255, 85, 66, 0.75)'
                    : '0 0 14px rgba(245, 184, 65, 0.6)',
              }}
            />
            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 17,
                letterSpacing: '0.18em',
                color: switchFlip > 0.5 ? '#FF8F80' : '#E6ECF8',
              }}
            >
              {switchFlip > 0.5 ? 'BUKAN BUATAN BUMI' : 'MEMERIKSA ASAL LOGAM'}
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* FROSTED TELEMETRY CARD: 4,5 MILIAR TAHUN · 0,00 GRAM EMAS BUMI   */}
        {/* ================================================================ */}
        {cardEnter > 0.01 && (
          <div
            style={{
              position: 'absolute',
              left: 140,
              right: 140,
              top: 1320,
              display: 'flex',
              justifyContent: 'center',
              opacity: clamp01(cardEnter * 1.25),
              transform: `translateY(${(1 - cardEnter) * 42}px)`,
            }}
          >
            <FrostedTelemetryCard
              eyebrow="SEJAK BUMI TERBENTUK · 4,5 MILIAR TAHUN LALU"
              mainValue={
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
                  <span style={{ color: '#F5B841' }}>0,00</span>
                  <span style={{ fontSize: 42, color: '#DCE4F2', fontWeight: 600 }}>
                    GRAM EMAS DIBUAT BUMI
                  </span>
                </div>
              }
              subLabel="INTI & MANTEL BUMI TAK SANGGUP MERAKIT ATOM Au-79"
              accent="gold"
              width={1160}
            />
          </div>
        )}

        <GoldenDustField seed="ch01-motes" count={36} maxY={1760} />
      </div>

      <BottomCaptionVignette />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 02 — KURIR MAGMA (FULL-RATIO 1440x2560 VOLCANO & MAGMA CONDUIT)
// ============================================================================

export const Scene02KurirMagma: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[1];
  const sec = ch.start + frame / fps;
  const localT = frame / fps;

  const strataUrl = useMemo(() => getGeologicalStrataTexture(), []);

  const mainPipe = 'M 712,1880 C 690,1590 748,1320 726,1040 C 712,860 722,680 720,515';
  const veinLeft = 'M 718,1315 C 610,1245 480,1175 305,1095';
  const veinRight = 'M 730,1115 C 858,1048 1005,980 1168,905';
  const veinLowRight = 'M 708,1545 C 835,1485 955,1440 1095,1395';

  const mainLen = useMemo(() => getLength(mainPipe), []);
  const leftLen = useMemo(() => getLength(veinLeft), []);
  const rightLen = useMemo(() => getLength(veinRight), []);

  const camY = interpolate(localT, [0, 11.3], [-18, 22], { extrapolateRight: 'clamp' });
  const cardIn = spring({
    frame: Math.max(0, frame - Math.round(3.6 * fps)),
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#07080E', overflow: 'hidden' }}>
      {/* Starry Volcanic Twilight Sky */}
      <DeepCosmosBackdrop seed="ch02-volcano" nebulaHue="crimson" starCount={80} drift={0.45} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateY(${camY}px) scale(1.02)`,
          transformOrigin: '50% 50%',
        }}
      >
        {/* Warm volcanic horizon glow */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 210,
            height: 620,
            background:
              'radial-gradient(ellipse 68% 58% at 50% 62%, rgba(255, 96, 36, 0.38) 0%, rgba(180, 44, 22, 0.16) 52%, transparent 82%)',
          }}
        />

        <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="ch2-cone" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#26222B" />
              <stop offset="52%" stopColor="#17151E" />
              <stop offset="100%" stopColor="#0D0C12" />
            </linearGradient>
            <linearGradient id="ch2-magma-outer" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FF521B" />
              <stop offset="55%" stopColor="#FF8524" />
              <stop offset="100%" stopColor="#FFB838" />
            </linearGradient>
            <linearGradient id="ch2-magma-core" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FFD25A" />
              <stop offset="100%" stopColor="#FFF7D6" />
            </linearGradient>
            <clipPath id="ch2-strata-clip">
              <path d="M 0,760 Q 360,736 720,754 T 1440,748 L 1440,2560 L 0,2560 Z" />
            </clipPath>
          </defs>

          {/* Distant Mountain Range */}
          <polygon
            points="0,780 215,595 455,735 720,520 1015,720 1245,580 1440,730 1440,830 0,830"
            fill="#12131C"
          />

          {/* Rising Volcanic Ash Plume */}
          {Array.from({ length: 8 }).map((_, i) => {
            const cycle = (localT * 0.34 + i / 8) % 1;
            const py = 505 - cycle * 355;
            const px = 720 + Math.sin(cycle * 5 + i) * 44 + cycle * 48;
            const pr = 46 + cycle * 112;
            const op = (1 - cycle) * 0.34;
            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={pr}
                fill={i % 2 === 0 ? '#3A2A2D' : '#262028'}
                opacity={op}
              />
            );
          })}

          {/* Main Stratovolcano Cone */}
          <polygon
            points="120,785 636,508 720,522 804,508 1320,785"
            fill="url(#ch2-cone)"
            stroke="rgba(255, 132, 68, 0.22)"
            strokeWidth={2}
          />
          {/* Crater Rim Glow */}
          <ellipse cx={720} cy={514} rx={88} ry={22} fill="#FF6624" opacity={0.88} />
          <ellipse cx={720} cy={514} rx={58} ry={12} fill="#FFF2B8" />

          {/* Textured Subterranean Crust & Mantle Strata */}
          <g clipPath="url(#ch2-strata-clip)">
            {strataUrl ? (
              <image
                href={strataUrl}
                x={0}
                y={730}
                width={1440}
                height={1830}
                preserveAspectRatio="none"
              />
            ) : (
              <rect x={0} y={730} width={1440} height={1830} fill="#19161A" />
            )}
            {/* Deep Mantle Reservoir Glow at Bottom */}
            <ellipse
              cx={720}
              cy={1940}
              rx={680}
              ry={250}
              fill="rgba(255, 88, 24, 0.36)"
            />
          </g>

          {/* Tectonic Fault Hairlines */}
          <path
            d="M 0,760 Q 360,736 720,754 T 1440,748"
            fill="none"
            stroke="rgba(255, 198, 128, 0.28)"
            strokeWidth={2.5}
          />

          {/* Hydrothermal Quartz Host Veins */}
          {[veinLeft, veinRight, veinLowRight].map((d, idx) => (
            <g key={idx}>
              <path
                d={d}
                fill="none"
                stroke="rgba(235, 240, 252, 0.34)"
                strokeWidth={34}
                strokeLinecap="round"
              />
              <path
                d={d}
                fill="none"
                stroke="url(#ch2-magma-outer)"
                strokeWidth={20}
                strokeLinecap="round"
              />
              <path
                d={d}
                fill="none"
                stroke="#FFE89C"
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray="24 18"
                strokeDashoffset={-localT * 85}
              />
            </g>
          ))}

          {/* Main Pressurized Magma Conduit */}
          <path
            d={mainPipe}
            fill="none"
            stroke="rgba(255, 84, 22, 0.32)"
            strokeWidth={96}
            strokeLinecap="round"
          />
          <path
            d={mainPipe}
            fill="none"
            stroke="url(#ch2-magma-outer)"
            strokeWidth={64}
            strokeLinecap="round"
          />
          <path
            d={mainPipe}
            fill="none"
            stroke="url(#ch2-magma-core)"
            strokeWidth={28}
            strokeLinecap="round"
            strokeDasharray="58 36"
            strokeDashoffset={-localT * 145}
          />

          {/* SOLID 24K GOLD NUGGETS CARRIED UPWARD LIKE PASSENGERS! */}
          {Array.from({ length: 10 }).map((_, idx) => {
            const u = (localT * 0.105 + idx / 10) % 1;
            const pt = getPointAtLength(mainPipe, u * mainLen);
            if (!pt) return null;
            const sway = Math.sin(localT * 3.2 + idx * 1.9) * 11;
            return (
              <FoilGoldNugget
                key={idx}
                x={pt.x + sway}
                y={pt.y}
                size={46 + (idx % 3) * 8}
                rotation={localT * 38 + idx * 36}
                shimmerPhase={localT * 3 + idx}
                idSuffix={`ch2-pipe-${idx}`}
              />
            );
          })}

          {/* Gold Nuggets Deposited into Left & Right Quartz Veins */}
          {[0.34, 0.66, 0.9].map((u, idx) => {
            const pL = getPointAtLength(veinLeft, u * leftLen);
            const pR = getPointAtLength(veinRight, u * rightLen);
            if (!pL || !pR) return null;
            return (
              <React.Fragment key={idx}>
                <FoilGoldNugget
                  x={pL.x}
                  y={pL.y}
                  size={40}
                  rotation={idx * 42}
                  shimmerPhase={localT * 2.5 + idx}
                  idSuffix={`ch2-vl-${idx}`}
                />
                <FoilGoldNugget
                  x={pR.x}
                  y={pR.y}
                  size={40}
                  rotation={-idx * 38}
                  shimmerPhase={localT * 2.5 + idx + 1}
                  idSuffix={`ch2-vr-${idx}`}
                />
              </React.Fragment>
            );
          })}

          {/* Crisp Callout Leader Pointing to Rising Gold in Magma */}
          <g opacity={clamp01(prog(sec, 11.4, 12.5))}>
            <circle cx={752} cy={1235} r={6} fill="#FFF3B8" />
            <line
              x1={752}
              y1={1235}
              x2={865}
              y2={1165}
              stroke="rgba(245, 184, 65, 0.82)"
              strokeWidth={2}
            />
            <line
              x1={865}
              y1={1165}
              x2={1310}
              y2={1165}
              stroke="rgba(245, 184, 65, 0.82)"
              strokeWidth={2}
            />
            <text
              x={872}
              y={1146}
              fill="rgba(245, 198, 98, 0.88)"
              fontFamily={IDENTITY.fontMono}
              fontSize={20}
              letterSpacing="0.16em"
            >
              KURIR ALAM · BUKAN PABRIK
            </text>
            <text
              x={872}
              y={1210}
              fill="#F5F7FC"
              fontFamily={IDENTITY.fontDisplay}
              fontSize={36}
              fontWeight={700}
            >
              EMAS SUDAH ADA DI MANTEL
            </text>
          </g>
        </svg>

        {/* Top Scene Pill Badge */}
        <div
          style={{
            position: 'absolute',
            top: 204,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <PillBadge label="PENAMPANG KERAK & MANTEL BUMI" tone="crimson" />
        </div>

        {/* Frosted Thermal Telemetry Card */}
        {cardIn > 0.01 && (
          <div
            style={{
              position: 'absolute',
              left: 140,
              right: 140,
              top: 1475,
              display: 'flex',
              justifyContent: 'center',
              opacity: clamp01(cardIn * 1.25),
              transform: `translateY(${(1 - cardIn) * 38}px)`,
            }}
          >
            <FrostedTelemetryCard
              eyebrow="SUHU MAGMA GUNUNG BERAPI"
              mainValue={
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
                  <span style={{ color: '#FF9254' }}>± 1.200 °C</span>
                  <span style={{ fontSize: 36, color: '#CBD5E6', fontWeight: 500 }}>
                    HANYA MENGANGKUT KE KERAK
                  </span>
                </div>
              }
              subLabel="BUTUH MILIARAN DERAJAT & LEDAKAN KOSMIK UNTUK MERAKIT EMAS"
              accent="crimson"
              width={1160}
            />
          </div>
        )}

        <GoldenDustField seed="ch02-sparks" count={32} maxY={1750} color="#FFA654" />
      </div>

      <BottomCaptionVignette />
    </AbsoluteFill>
  );
};

/**
 * 5. Procedural Volumetric Kilonova Nebula Cloud Texture (Violet-Magenta-Aurum)
 */
export const getKilonovaNebulaTexture = (): string =>
  buildCanvasDataUrl('kilonova-nebula-v2', 460, 460, (px, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const rMax = w * 0.49;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / rMax;
        const dy = (y - cy) / rMax;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * w + x) * 4;
        if (dist >= 1) {
          px[idx + 3] = 0;
          continue;
        }

        const wx = fbm2('kn-wx', dx * 2.2 + 1.5, dy * 2.2 - 0.7, 3) * 0.36;
        const wy = fbm2('kn-wy', dx * 2.2 - 2.1, dy * 2.2 + 1.9, 3) * 0.36;
        const billow = ridgeFbm2('kn-blw', (dx + wx) * 2.9, (dy + wy) * 2.9, 4);
        const wisps = fbm2('kn-wsp', (dx - wy) * 5.2, (dy + wx) * 5.2, 3) * 0.5 + 0.5;

        const falloff = Math.pow(1 - dist, 1.45);
        const density = clamp01((billow * 0.68 + wisps * 0.32) * falloff * 1.48);

        const outerViolet: [number, number, number] = [96, 44, 184];
        const midMagenta: [number, number, number] = [212, 68, 128];
        const innerGold: [number, number, number] = [252, 186, 56];
        const coreWhite: [number, number, number] = [255, 248, 222];

        let rgb: [number, number, number];
        if (dist > 0.62) {
          rgb = mixRgb(midMagenta, outerViolet, (dist - 0.62) / 0.38);
        } else if (dist > 0.28) {
          rgb = mixRgb(innerGold, midMagenta, (dist - 0.28) / 0.34);
        } else {
          rgb = mixRgb(coreWhite, innerGold, dist / 0.28);
        }

        px[idx] = rgb[0];
        px[idx + 1] = rgb[1];
        px[idx + 2] = rgb[2];
        px[idx + 3] = Math.round(clamp01(density * 1.15) * 255);
      }
    }
  });

// ============================================================================
// SCENE 03 — MENTOK DI BESI (FULL-RATIO 1440x2560 RED SUPERGIANT & IRON CORE)
// ============================================================================

export const Scene03MentokDiBesi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[2];
  const sec = ch.start + frame / fps;
  const localT = frame / fps;

  const ironTexUrl = useMemo(() => getBrushedMetalTexture('iron'), []);

  // At 29.0s ("Begitu menyentuh besi, tungku bintang langsung padam"), reveal iron core
  const ironCutaway = easeInOutCubic(prog(sec, 28.85, 30.35));
  const collapsePulse = easeOutCubic(prog(sec, 32.3, 34.8));

  const starEnter = spring({
    frame,
    fps,
    config: { damping: 19, stiffness: 86 },
  });

  const cx = 720;
  const cy = 825;
  const starR =
    (315 + Math.sin(localT * 2.1) * 6 * (1 - ironCutaway)) *
    (1 - collapsePulse * 0.08) *
    (0.86 + 0.14 * starEnter);

  const prominences = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        angle: (i * 360) / 12 + 12,
        height: 36 + (i % 3) * 20,
        span: 18 + (i % 2) * 9,
        speed: 1.5 + (i % 4) * 0.42,
      })),
    [],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#05070D', overflow: 'hidden' }}>
      <DeepCosmosBackdrop seed="ch03-star" nebulaHue="crimson" starCount={115} drift={0.7} />
      <TechnicalGridOverlay opacity={0.05} cell={90} tint="235, 150, 120" />

      {/* Dynamic Stellar Corona Atmospheric Bloom */}
      <div
        style={{
          position: 'absolute',
          left: cx - 560,
          top: cy - 560,
          width: 1120,
          height: 1120,
          borderRadius: '50%',
          background:
            ironCutaway < 0.55
              ? 'radial-gradient(circle, rgba(255, 132, 42, 0.42) 0%, rgba(214, 52, 24, 0.18) 46%, transparent 72%)'
              : 'radial-gradient(circle, rgba(132, 162, 210, 0.24) 0%, rgba(168, 44, 34, 0.14) 48%, transparent 74%)',
          transform: `scale(${1 + Math.sin(localT * 1.9) * 0.03})`,
          pointerEvents: 'none',
        }}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="ch3-iron-clip">
            <circle cx={cx} cy={cy} r={118} />
          </clipPath>
          <radialGradient id="ch3-iron-shade" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.42)" />
            <stop offset="48%" stopColor="rgba(120, 138, 165, 0.08)" />
            <stop offset="100%" stopColor="rgba(8, 12, 20, 0.82)" />
          </radialGradient>
        </defs>

        {/* Precision Astrometric Reference Rings */}
        {[435, 540].map((rr, idx) => (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={rr}
            fill="none"
            stroke="rgba(255, 255, 255, 0.11)"
            strokeDasharray={idx === 0 ? '6 10' : '2 14'}
            strokeWidth={1.5}
          />
        ))}

        {/* Magnetic Solar Prominence Loops Around Star Limb */}
        <g opacity={1 - ironCutaway * 0.68}>
          {prominences.map((pr, idx) => {
            const breathe = 0.72 + 0.36 * Math.sin(localT * pr.speed + idx);
            const h = pr.height * breathe;
            const a1 = ((pr.angle - pr.span * 0.5) * Math.PI) / 180;
            const a2 = ((pr.angle + pr.span * 0.5) * Math.PI) / 180;
            const am = (pr.angle * Math.PI) / 180;
            const x1 = cx + Math.cos(a1) * (starR - 4);
            const y1 = cy + Math.sin(a1) * (starR - 4);
            const x2 = cx + Math.cos(a2) * (starR - 4);
            const y2 = cy + Math.sin(a2) * (starR - 4);
            const mx = cx + Math.cos(am) * (starR + h);
            const my = cy + Math.sin(am) * (starR + h);
            return (
              <g key={idx}>
                <path
                  d={`M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`}
                  fill="none"
                  stroke="#FF5E24"
                  strokeWidth={9}
                  strokeLinecap="round"
                  opacity={0.48}
                />
                <path
                  d={`M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`}
                  fill="none"
                  stroke="#FFE29A"
                  strokeWidth={3.2}
                  strokeLinecap="round"
                  opacity={0.82}
                />
              </g>
            );
          })}
        </g>

        {/* Boiling Procedural Red Supergiant Photosphere */}
        <g opacity={1 - ironCutaway * 0.36}>
          <TexturedCelestialSphere
            cx={cx}
            cy={cy}
            r={starR}
            kind="solar"
            rimColor="rgba(255, 166, 68, 0.65)"
            rotationDeg={localT * 3.8}
          />
        </g>

        {/* ================================================================ */}
        {/* ACT II CUTAWAY: ONION-SKIN SHELLS + COLD BRUSHED IRON-26 SPHERE  */}
        {/* ================================================================ */}
        {ironCutaway > 0.01 && (
          <g opacity={ironCutaway}>
            {/* Dark extinguished stellar interior cavity */}
            <circle
              cx={cx}
              cy={cy}
              r={starR * 0.80}
              fill="#0B0E17"
              stroke="rgba(255, 114, 68, 0.45)"
              strokeWidth={3.5}
            />

            {/* Concentric exhausted fusion shells (He / C / O / Si) */}
            {[
              { r: starR * 0.70, col: 'rgba(196, 68, 36, 0.35)', lbl: 'C · O' },
              { r: starR * 0.56, col: 'rgba(218, 128, 44, 0.32)', lbl: 'Ne · Mg' },
              { r: starR * 0.44, col: 'rgba(142, 164, 198, 0.28)', lbl: 'Si' },
            ].map((sh, idx) => (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={sh.r}
                  fill="none"
                  stroke={sh.col}
                  strokeWidth={14}
                />
                <text
                  x={cx}
                  y={cy - sh.r + 5}
                  textAnchor="middle"
                  fill="rgba(214, 224, 240, 0.58)"
                  fontFamily={IDENTITY.fontMono}
                  fontSize={16}
                  letterSpacing="0.14em"
                >
                  {sh.lbl}
                </text>
              </g>
            ))}

            {/* Cold Brushed Metallic Iron-56 Core Sphere */}
            <g clipPath="url(#ch3-iron-clip)">
              {ironTexUrl ? (
                <image
                  href={ironTexUrl}
                  x={cx - 122}
                  y={cy - 122}
                  width={244}
                  height={244}
                />
              ) : (
                <circle cx={cx} cy={cy} r={118} fill="#6E7C94" />
              )}
              <circle cx={cx} cy={cy} r={118} fill="url(#ch3-iron-shade)" />
            </g>
            <circle
              cx={cx}
              cy={cy}
              r={118}
              fill="none"
              stroke="#DCE8FA"
              strokeWidth={2.8}
              opacity={0.85}
            />

            {/* Engraved Atomic Iron Stamp */}
            <text
              x={cx}
              y={cy - 34}
              textAnchor="middle"
              fill="rgba(226, 236, 252, 0.8)"
              fontFamily={IDENTITY.fontMono}
              fontSize={20}
              fontWeight={600}
              letterSpacing="0.2em"
            >
              NOMOR ATOM 26
            </text>
            <text
              x={cx}
              y={cy + 22}
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily={IDENTITY.fontDisplay}
              fontSize={64}
              fontWeight={700}
            >
              Fe
            </text>
            <text
              x={cx}
              y={cy + 56}
              textAnchor="middle"
              fill="#A8BAD4"
              fontFamily={IDENTITY.fontMono}
              fontSize={19}
              fontWeight={600}
              letterSpacing="0.22em"
            >
              INTI BESI PADAT
            </text>

            {/* Radial Inward Gravity Collapse Force Arrows (GPS-style precision!) */}
            {Array.from({ length: 12 }).map((_, k) => {
              const ang = (k * Math.PI * 2) / 12;
              const travel = ((localT * 1.45 + (k % 3) * 0.22) % 1) * 62;
              const outerDist = 420 - travel;
              const innerDist = 338 - travel;
              const x1 = cx + Math.cos(ang) * outerDist;
              const y1 = cy + Math.sin(ang) * outerDist;
              const x2 = cx + Math.cos(ang) * innerDist;
              const y2 = cy + Math.sin(ang) * innerDist;
              const leftWingX = x2 + Math.cos(ang - 2.6) * 16;
              const leftWingY = y2 + Math.sin(ang - 2.6) * 16;
              const rightWingX = x2 + Math.cos(ang + 2.6) * 16;
              const rightWingY = y2 + Math.sin(ang + 2.6) * 16;
              return (
                <g key={k} opacity={0.45 + collapsePulse * 0.5}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#FFA057"
                    strokeWidth={3.2}
                    strokeLinecap="round"
                  />
                  <polyline
                    points={`${leftWingX},${leftWingY} ${x2},${y2} ${rightWingX},${rightWingY}`}
                    fill="none"
                    stroke="#FFA057"
                    strokeWidth={3.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* Top Pill Indicator */}
      <div
        style={{
          position: 'absolute',
          top: 204,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <PillBadge
          label={
            ironCutaway < 0.5
              ? 'TUNGKU BINTANG MAHARAKSASA'
              : 'BATAS AKHIR REAKSI FUSI BINTANG'
          }
          tone={ironCutaway < 0.5 ? 'gold' : 'ice'}
        />
      </div>

      {/* Frosted Stellar Physics Readout Card */}
      <div
        style={{
          position: 'absolute',
          left: 140,
          right: 140,
          top: 1385,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <FrostedTelemetryCard
          eyebrow={
            ironCutaway < 0.5
              ? 'SUHU INTI BINTANG RAKSASA'
              : 'SAAT MENYENTUH UNSUR BESI (Fe-26)'
          }
          mainValue={
            ironCutaway < 0.5 ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                <span style={{ color: '#FFB84D' }}>100.000.000</span>
                <span style={{ fontSize: 40, color: '#DCE4F2' }}>°C</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
                <span style={{ color: '#9BE4FF' }}>26 Fe</span>
                <span style={{ fontSize: 40, color: '#FF8A70' }}>≠ 79 Au (EMAS)</span>
              </div>
            )
          }
          subLabel={
            ironCutaway < 0.5
              ? 'MASIH BELUM CUKUP UNTUK MERAKIT INTI ATOM EMAS'
              : 'FUSI BESI MENYERAP ENERGI · BINTANG PADAM & RUNTUH'
          }
          accent={ironCutaway < 0.5 ? 'gold' : 'ice'}
          width={1160}
        />
      </div>

      <GoldenDustField
        seed="ch03-embers"
        count={28}
        maxY={1740}
        color={ironCutaway < 0.5 ? '#FF9D4D' : '#9CC4FF'}
      />
      <BottomCaptionVignette />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 04 — TABRAKAN NEUTRON (FULL-RATIO 1440x2560 INSPIRAL & KILONOVA FORGE)
// ============================================================================

export const Scene04TabrakanNeutron: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[3];
  const sec = ch.start + frame / fps;
  const localT = frame / fps;

  const kilonovaTexUrl = useMemo(() => getKilonovaNebulaTexture(), []);

  // Merger instant synced with VO "saling menghantam" (42.38s)
  const mergerSec = 42.38;
  const preP = clamp01((sec - ch.start) / (mergerSec - ch.start));
  const postSec = Math.max(0, sec - mergerSec);
  const postP = clamp01(postSec / (ch.end - mergerSec));
  const merged = sec >= mergerSec;

  const cx = 720;
  const cy = 815;

  // Accelerating relativistic orbital mechanics
  const sepRadius = merged ? 0 : 255 * Math.pow(1 - preP, 0.72) + 22;
  const spinAngle = preP * preP * 44 + localT * 3.8;
  const s1x = cx + Math.cos(spinAngle) * sepRadius;
  const s1y = cy + Math.sin(spinAngle) * sepRadius * 0.76;
  const s2x = cx - Math.cos(spinAngle) * sepRadius;
  const s2y = cy - Math.sin(spinAngle) * sepRadius * 0.76;

  // Spin frequency counter (Hz)
  const orbitalHz = Math.round(85 + Math.pow(preP, 2.2) * 765);

  // Kilonova expansion & flash curves
  const flash = merged ? Math.exp(-postSec * 3.4) : Math.pow(preP, 12) * 0.55;
  const cloudScale = merged ? easeOutQuint(clamp01(postSec / 3.8)) : 0;

  const forgedNuggets = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => {
        const s = 610 + i * 37;
        return {
          angle: (i / 24) * Math.PI * 2 + hash01(s) * 0.25,
          dist: 120 + hash01(s + 1) * 355,
          size: 38 + hash01(s + 2) * 42,
          rotSpeed: (hash01(s + 3) - 0.5) * 72,
          delay: hash01(s + 4) * 0.22,
        };
      }),
    [],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#04060C', overflow: 'hidden' }}>
      <DeepCosmosBackdrop seed="ch04-kilonova" nebulaHue="violet" starCount={135} drift={0.9} />
      <TechnicalGridOverlay opacity={0.055} cell={80} tint="140, 195, 255" />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="ch4-ns-core" cx="42%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="38%" stopColor="#B8F4FF" />
            <stop offset="76%" stopColor="#2FB8FF" />
            <stop offset="100%" stopColor="rgba(22, 108, 224, 0)" />
          </radialGradient>
          <linearGradient id="ch4-polar-jet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(160, 228, 255, 0)" />
            <stop offset="35%" stopColor="rgba(195, 238, 255, 0.42)" />
            <stop offset="50%" stopColor="rgba(255, 248, 220, 0.88)" />
            <stop offset="65%" stopColor="rgba(195, 238, 255, 0.42)" />
            <stop offset="100%" stopColor="rgba(160, 228, 255, 0)" />
          </linearGradient>
        </defs>

        {/* Spacetime Gravitational-Wave Ripples */}
        {Array.from({ length: 7 }).map((_, i) => {
          const wave = ((localT * (merged ? 0.55 : 0.95) + i / 7) % 1);
          const wr = 75 + wave * 560;
          const op = (1 - wave) * (merged ? 0.24 : 0.34);
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={wr}
              ry={wr * (merged ? 0.94 : 0.76)}
              fill="none"
              stroke={merged ? '#F5B841' : '#74DCFF'}
              strokeWidth={2}
              opacity={op}
            />
          );
        })}

        {/* ================================================================ */}
        {/* ACT I: BINARY NEUTRON STAR INSPIRAL WITH MAGNETIC FIELD LOOPS    */}
        {/* ================================================================ */}
        {!merged && (
          <g>
            {/* Spiral Relativistic Plasma Wakes */}
            {[0, 1].map((arm) => {
              const pts = Array.from({ length: 28 })
                .map((_, k) => {
                  const back = k * 0.11;
                  const a = spinAngle - back + arm * Math.PI;
                  const rr = sepRadius + k * 5.2;
                  return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr * 0.76}`;
                })
                .join(' ');
              return (
                <polyline
                  key={arm}
                  points={pts}
                  fill="none"
                  stroke="rgba(124, 232, 255, 0.44)"
                  strokeWidth={10}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Tidal Plasma Bridge Right Before Impact */}
            {preP > 0.62 && (
              <line
                x1={s1x}
                y1={s1y}
                x2={s2x}
                y2={s2y}
                stroke="#FFF5D6"
                strokeWidth={8 + (preP - 0.62) * 32}
                opacity={(preP - 0.62) * 2.2}
                strokeLinecap="round"
              />
            )}

            {/* Two City-Sized Hyper-Dense Neutron Stars */}
            {[
              { x: s1x, y: s1y, tilt: spinAngle * 28 },
              { x: s2x, y: s2y, tilt: -spinAngle * 28 + 40 },
            ].map((ns, idx) => (
              <g key={idx} transform={`translate(${ns.x}, ${ns.y})`}>
                {/* Magnetic Dipole Loops */}
                <g transform={`rotate(${ns.tilt})`} opacity={0.55}>
                  <ellipse
                    cx={-38}
                    cy={0}
                    rx={38}
                    ry={24}
                    fill="none"
                    stroke="#8BE8FF"
                    strokeWidth={1.8}
                  />
                  <ellipse
                    cx={38}
                    cy={0}
                    rx={38}
                    ry={24}
                    fill="none"
                    stroke="#8BE8FF"
                    strokeWidth={1.8}
                  />
                  {/* Pulsar radiation beam */}
                  <line
                    x1={0}
                    y1={-125}
                    x2={0}
                    y2={125}
                    stroke="rgba(186, 244, 255, 0.55)"
                    strokeWidth={4}
                  />
                </g>
                <circle cx={0} cy={0} r={74} fill="url(#ch4-ns-core)" />
                <circle
                  cx={0}
                  cy={0}
                  r={30}
                  fill="#FFFFFF"
                  stroke="#9BEBFF"
                  strokeWidth={2.5}
                />
              </g>
            ))}
          </g>
        )}

        {/* ================================================================ */}
        {/* ACT II: KILONOVA DETONATION, POLAR JETS & 24K GOLD CRYSTALS      */}
        {/* ================================================================ */}
        {merged && (
          <g>
            {/* Relativistic Polar Gamma-Ray Jets */}
            <polygon
              points={`${cx - 24},${cy} ${cx - 148},40 ${cx + 148},40 ${cx + 24},${cy}`}
              fill="url(#ch4-polar-jet)"
              opacity={clamp01((1 - postP * 0.55) * 0.85)}
            />
            <polygon
              points={`${cx - 24},${cy} ${cx - 148},1640 ${cx + 148},1640 ${cx + 24},${cy}`}
              fill="url(#ch4-polar-jet)"
              opacity={clamp01((1 - postP * 0.55) * 0.85)}
            />

            {/* Procedural Volumetric Kilonova Cloud */}
            {kilonovaTexUrl && (
              <g
                transform={`translate(${cx}, ${cy}) scale(${0.35 + cloudScale * 2.35}) rotate(${postSec * 8})`}
                opacity={clamp01(0.95 - postP * 0.12)}
              >
                <image
                  href={kilonovaTexUrl}
                  x={-230}
                  y={-230}
                  width={460}
                  height={460}
                />
              </g>
            )}

            {/* Expanding Relativistic Shockwave Rings */}
            <circle
              cx={cx}
              cy={cy}
              r={80 + cloudScale * 490}
              fill="none"
              stroke="rgba(255, 224, 132, 0.72)"
              strokeWidth={3.5 * (1 - postP * 0.55)}
            />
            <circle
              cx={cx}
              cy={cy}
              r={55 + cloudScale * 355}
              fill="none"
              stroke="rgba(218, 124, 255, 0.52)"
              strokeDasharray="12 10"
              strokeWidth={2.2}
            />

            {/* 24 Foil-Textured 24K Gold Nuggets Forged in the Ejecta! */}
            {forgedNuggets.map((ng, idx) => {
              const np = easeOutCubic(clamp01((postP - ng.delay) / (1 - ng.delay)));
              if (np <= 0.01) return null;
              const gx = cx + Math.cos(ng.angle + postSec * 0.14) * ng.dist * np;
              const gy = cy + Math.sin(ng.angle + postSec * 0.14) * ng.dist * np * 0.92;
              return (
                <g key={idx} opacity={clamp01(np * 1.5)}>
                  <FoilGoldNugget
                    x={gx}
                    y={gy}
                    size={ng.size * (0.45 + 0.55 * np)}
                    rotation={postSec * ng.rotSpeed + idx * 25}
                    shimmerPhase={localT * 3.8 + idx}
                    idSuffix={`ch4-au-${idx}`}
                  />
                </g>
              );
            })}

            {/* Remnant Kilonova Starburst Core */}
            <g transform={`translate(${cx}, ${cy}) rotate(${postSec * 16})`}>
              {Array.from({ length: 8 }).map((_, rIdx) => {
                const ra = (rIdx * Math.PI) / 4;
                const len = rIdx % 2 === 0 ? 155 : 92;
                return (
                  <line
                    key={rIdx}
                    x1={-Math.cos(ra) * len}
                    y1={-Math.sin(ra) * len}
                    x2={Math.cos(ra) * len}
                    y2={Math.sin(ra) * len}
                    stroke="#FFF8DC"
                    strokeWidth={rIdx % 2 === 0 ? 4 : 2.2}
                    strokeLinecap="round"
                  />
                );
              })}
              <circle cx={0} cy={0} r={32} fill="#FFFFFF" />
            </g>
          </g>
        )}

        {/* Blinding Optical Impact Flash */}
        {flash > 0.01 && (
          <rect
            x={0}
            y={0}
            width={1440}
            height={2560}
            fill="#FFF7DE"
            opacity={clamp01(flash * 0.85)}
          />
        )}
      </svg>

      {/* Top Pill Badge */}
      <div
        style={{
          position: 'absolute',
          top: 204,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <PillBadge
          label={
            !merged
              ? 'DUA BINTANG NEUTRON · BOLA SEUKURAN KOTA'
              : 'LEDAKAN KILONOVA · PABRIK EMAS ALAM SEMESTA'
          }
          tone={!merged ? 'ice' : 'gold'}
        />
      </div>

      {/* Bottom Telemetry Card */}
      <div
        style={{
          position: 'absolute',
          left: 140,
          right: 140,
          top: 1385,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <FrostedTelemetryCard
          eyebrow={
            !merged
              ? 'KECEPATAN PILINAN SEBELUM BENTURAN'
              : 'TANGKAPAN NEUTRON CEPAT (R-PROCESS)'
          }
          mainValue={
            !merged ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                <span style={{ color: '#8BE8FF' }}>{orbitalHz}</span>
                <span style={{ fontSize: 38, color: '#DCE4F2' }}>PUTARAN / DETIK</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
                <span style={{ color: '#F5B841' }}>79 Au</span>
                <span style={{ fontSize: 40, color: '#F4F7FC' }}>EMAS MURNI TERCIPTA</span>
              </div>
            )
          }
          subLabel={
            !merged
              ? 'MASSA LEBIH BERAT DARI MATAHARI DIPADATKAN ± 20 KM'
              : 'ATOM MENELAN RIBUAN NEUTRON DALAM HITUNGAN DETIK'
          }
          accent={!merged ? 'ice' : 'gold'}
          width={1160}
        />
      </div>

      <GoldenDustField
        seed="ch04-dust"
        count={38}
        maxY={1750}
        color={!merged ? '#8EE8FF' : '#FFE082'}
      />
      <BottomCaptionVignette />
    </AbsoluteFill>
  );
};
