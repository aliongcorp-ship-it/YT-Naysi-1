import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { noise2D } from '@remotion/noise';
import { evolvePath, getPointAtLength, getLength } from '@remotion/paths';
import { makeStar } from '@remotion/shapes';
import {
  CHAPTERS,
  ChapterSpec,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  prog,
} from './script';

// ============================================================================
// CELESTIAL LAPIDARY & NATURALIST FIELD PLATE — SHARED PHYSICAL SHEET ENGINE
// Exact structural concept of 1-HfPa9AVLJGtTqdDyVI8lObiSQQjMzIe:
//  - Physical folded vellum sheet with real quarter-fold paper creases (+),
//    procedural SVG feTurbulence cotton-rag fiber & aged corner vignette,
//    stacked paper deck edges below, Fraunces editorial headline, and
//    alternating Obsidian/Gold surveying frame around a FULL-BLEED 2D scene
//    (ZERO charts, ZERO graphs, ZERO diagrams — 100% rich visual objects!).
// ============================================================================

export interface CelestialPlateProps {
  readonly chapter: ChapterSpec;
  readonly plateHeight?: number;
  readonly footerSlot?: React.ReactNode;
  readonly children: React.ReactNode;
}

const BORDER_STEP = 34;

export const CelestialPlateSheet: React.FC<CelestialPlateProps> = ({
  chapter,
  plateHeight = 1326,
  footerSlot,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localSec = Math.max(0, frame / fps - chapter.start);

  const headIn = easeOutCubic(clamp01(localSec / 0.42));
  // Subtle slow cinema camera drift inside the illustrated viewport
  const camZoom = interpolate(
    clamp01(localSec / Math.max(4, chapter.end - chapter.start)),
    [0, 1],
    [1.0, 1.028],
  );

  const plateW = 1236;
  const horizCount = Math.ceil(plateW / BORDER_STEP);
  const vertCount = Math.ceil(plateHeight / BORDER_STEP);

  const filterId = `paper-grain-${chapter.num}`;

  return (
    <div
      style={{
        position: 'relative',
        width: 1368,
        height: 1738,
        userSelect: 'none',
      }}
    >
      {/* Underlying Physical Paper Deck Edges (3 stacked museum sheets below) */}
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: -14,
          top: 22,
          bottom: -20,
          background: '#BDB19A',
          borderRadius: 4,
          boxShadow: '0 34px 76px rgba(0, 0, 0, 0.72)',
          transform: 'rotate(0.55deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 12,
          right: -8,
          top: 12,
          bottom: -11,
          background: '#CFC4AE',
          borderRadius: 4,
          boxShadow: '0 18px 40px rgba(0, 0, 0, 0.46)',
          transform: 'rotate(-0.32deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 5,
          right: -3,
          top: 5,
          bottom: -5,
          background: '#DFD5C1',
          borderRadius: 4,
        }}
      />

      {/* Primary Unfolded Tactile Museum Plate Sheet */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 4,
          background: `linear-gradient(168deg, ${IDENTITY.vellumTop} 0%, ${IDENTITY.vellumMid} 54%, ${IDENTITY.vellumDeep} 100%)`,
          border: '1.5px solid rgba(26, 23, 20, 0.42)',
          boxShadow:
            'inset 0 0 110px rgba(92, 68, 32, 0.16), inset 0 2px 0 rgba(255, 255, 255, 0.65), 0 14px 36px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
        }}
      >
        {/* Procedural SVG Paper Fiber Grain (zero external raster assets) */}
        <svg
          width={1368}
          height={1738}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.22,
            mixBlendMode: 'multiply',
          }}
        >
          <defs>
            <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves={3}
                seed={79 + chapter.index * 13}
                result="noise"
              />
              <feColorMatrix
                type="matrix"
                values="0.35 0 0 0 0.42  0 0.32 0 0 0.38  0 0 0.28 0 0.31  0 0 0 0.35 0"
              />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter={`url(#${filterId})`} />
          {/* Subtle aged foxing spots near corners like authentic archival atlas sheets */}
          <circle cx={96} cy={74} r={22} fill="rgba(138, 102, 52, 0.09)" />
          <circle cx={1282} cy={118} r={30} fill="rgba(138, 102, 52, 0.08)" />
          <circle cx={1238} cy={1660} r={26} fill="rgba(138, 102, 52, 0.09)" />
          <circle cx={142} cy={1690} r={19} fill="rgba(138, 102, 52, 0.08)" />
        </svg>

        {/* Editorial Plate Header (matches 1-HfPa9AVLJGtTqdDyVI8lObiSQQjMzIe) */}
        <div
          style={{
            position: 'relative',
            padding: '44px 66px 0 66px',
            opacity: headIn,
            transform: `translateY(${(1 - headIn) * 10}px)`,
            zIndex: 5,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.16em',
                color: IDENTITY.kilonovaRed,
              }}
            >
              {chapter.eyebrow}
            </span>
            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: IDENTITY.inkMuted,
              }}
            >
              AURUM · LXXIX
            </span>
          </div>

          <div
            style={{
              fontFamily: IDENTITY.fontSerif,
              fontWeight: 900,
              fontSize: 70,
              lineHeight: 1.03,
              letterSpacing: '-0.025em',
              color: IDENTITY.ink,
            }}
          >
            {chapter.headLines.map((seg, idx) => (
              <div key={idx} style={{ whiteSpace: 'nowrap' }}>
                {seg[0]}
                {seg[1] ? (
                  <span style={{ color: IDENTITY.kilonovaRed }}>{seg[1]}</span>
                ) : null}
                {seg[2]}
              </div>
            ))}
          </div>

          <div
            style={{
              fontFamily: IDENTITY.fontSerif,
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: 23,
              color: IDENTITY.inkSoft,
              marginTop: 10,
              letterSpacing: '0.01em',
            }}
          >
            {chapter.latin}
          </div>

          {/* Crisp Double Archival Rule */}
          <div
            style={{
              marginTop: 20,
              height: 5,
              borderTop: `2px solid ${IDENTITY.ink}`,
              borderBottom: '1px solid rgba(26, 23, 20, 0.45)',
            }}
          />
        </div>

        {/* Full-Bleed Illustrated Plate Frame with Surveying Border */}
        <div
          style={{
            position: 'absolute',
            left: 66,
            top: 334,
            width: plateW,
            height: plateHeight,
            background: IDENTITY.cosmosDark,
            border: `2.5px solid ${IDENTITY.ink}`,
            boxShadow: 'inset 0 0 38px rgba(0,0,0,0.55)',
            overflow: 'hidden',
            zIndex: 4,
          }}
        >
          {/* Inner Full-Bleed Scene Canvas with subtle slow cinematic zoom */}
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: 14,
              right: 14,
              bottom: 14,
              overflow: 'hidden',
              border: '1.5px solid rgba(229, 169, 43, 0.42)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `scale(${camZoom})`,
                transformOrigin: '50% 50%',
              }}
            >
              {children}
            </div>
          </div>

          {/* Alternating Obsidian & Burnished-Brass Surveying Frame Border */}
          {/* Top bar */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 12,
              display: 'flex',
              pointerEvents: 'none',
              zIndex: 12,
              borderBottom: `1.5px solid ${IDENTITY.ink}`,
            }}
          >
            {Array.from({ length: horizCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: BORDER_STEP,
                  height: '100%',
                  flexShrink: 0,
                  background: i % 2 === 0 ? IDENTITY.ink : '#EFE6D2',
                }}
              />
            ))}
          </div>
          {/* Bottom bar */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 12,
              display: 'flex',
              pointerEvents: 'none',
              zIndex: 12,
              borderTop: `1.5px solid ${IDENTITY.ink}`,
            }}
          >
            {Array.from({ length: horizCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: BORDER_STEP,
                  height: '100%',
                  flexShrink: 0,
                  background: i % 2 === 1 ? IDENTITY.ink : '#EFE6D2',
                }}
              />
            ))}
          </div>
          {/* Left bar */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 12,
              bottom: 12,
              width: 12,
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'none',
              zIndex: 12,
              borderRight: `1.5px solid ${IDENTITY.ink}`,
            }}
          >
            {Array.from({ length: vertCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: BORDER_STEP,
                  width: '100%',
                  flexShrink: 0,
                  background: i % 2 === 1 ? IDENTITY.ink : '#EFE6D2',
                }}
              />
            ))}
          </div>
          {/* Right bar */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 12,
              bottom: 12,
              width: 12,
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'none',
              zIndex: 12,
              borderLeft: `1.5px solid ${IDENTITY.ink}`,
            }}
          >
            {Array.from({ length: vertCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: BORDER_STEP,
                  width: '100%',
                  flexShrink: 0,
                  background: i % 2 === 0 ? IDENTITY.ink : '#EFE6D2',
                }}
              />
            ))}
          </div>

          {/* Four Corner Brass Rosettes */}
          {[
            { left: 0, top: 0 },
            { right: 0, top: 0 },
            { left: 0, bottom: 0 },
            { right: 0, bottom: 0 },
          ].map((pos, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                ...pos,
                width: 14,
                height: 14,
                background: IDENTITY.kilonovaRed,
                border: `1.5px solid ${IDENTITY.ink}`,
                zIndex: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: IDENTITY.goldBright,
                }}
              />
            </div>
          ))}
        </div>

        {/* Optional Lower Interactive Reply Slot (used on Lembar 08) */}
        {footerSlot ? (
          <div
            style={{
              position: 'absolute',
              left: 66,
              right: 66,
              top: 334 + plateHeight + 22,
              bottom: 42,
              zIndex: 6,
            }}
          >
            {footerSlot}
          </div>
        ) : null}

        {/* Authentic Quarter-Fold Paper Crease Overlay (+ across entire sheet & artwork!) */}
        {/* Vertical center crease */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 18,
            transform: 'translateX(-50%)',
            background:
              'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(32,24,14,0.11) 44%, rgba(255,250,238,0.22) 56%, rgba(0,0,0,0) 100%)',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />
        {/* Horizontal center crease */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '51%',
            height: 18,
            transform: 'translateY(-50%)',
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(32,24,14,0.10) 44%, rgba(255,250,238,0.20) 56%, rgba(0,0,0,0) 100%)',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />
        {/* Aged Top & Edge Paper Shadow Vignette (exact tactile feel of ref_indo) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow:
              'inset 0 28px 46px rgba(28, 22, 14, 0.18), inset 0 -20px 36px rgba(28, 22, 14, 0.12)',
            pointerEvents: 'none',
            zIndex: 21,
          }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// DISCREET ARCHIVAL SPECIMEN CALLOUT PILL (Minimalist — never a text box!)
// ============================================================================

export const SpecimenBadge: React.FC<{
  readonly text: string;
  readonly sub?: string;
  readonly x?: number;
  readonly y?: number;
  readonly right?: number;
  readonly bottom?: number;
  readonly tone?: 'gold' | 'dark' | 'crimson' | 'vellum';
  readonly opacity?: number;
}> = ({ text, sub, x, y, right, bottom, tone = 'vellum', opacity = 1 }) => {
  const styles = {
    vellum: {
      bg: 'rgba(244, 238, 224, 0.94)',
      border: IDENTITY.ink,
      fg: IDENTITY.ink,
      subFg: IDENTITY.kilonovaRed,
    },
    gold: {
      bg: 'rgba(22, 18, 12, 0.86)',
      border: IDENTITY.goldPure,
      fg: IDENTITY.goldBright,
      subFg: '#E9DFC8',
    },
    dark: {
      bg: 'rgba(13, 17, 28, 0.86)',
      border: 'rgba(255, 217, 120, 0.55)',
      fg: '#F5F2EB',
      subFg: IDENTITY.goldBright,
    },
    crimson: {
      bg: 'rgba(184, 57, 38, 0.93)',
      border: '#FFD978',
      fg: '#FFF9F0',
      subFg: '#FFE39E',
    },
  }[tone];

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        right,
        bottom,
        padding: sub ? '10px 18px' : '8px 16px',
        background: styles.bg,
        border: `1.8px solid ${styles.border}`,
        boxShadow: '0 8px 22px rgba(0, 0, 0, 0.36)',
        opacity,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: IDENTITY.fontMono,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: '0.13em',
          color: styles.fg,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
      {sub ? (
        <div
          style={{
            fontFamily: IDENTITY.fontSerif,
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: 18,
            color: styles.subFg,
            marginTop: 2,
            whiteSpace: 'nowrap',
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

// ============================================================================
// REMOTION PROCEDURAL STARFIELD & FLOATING GOLDEN STARDUST MOTES (@remotion/noise)
// ============================================================================

export const CosmicStarfield: React.FC<{
  readonly seed: string;
  readonly count?: number;
  readonly width?: number;
  readonly height?: number;
  readonly driftX?: number;
  readonly driftY?: number;
}> = ({
  seed,
  count = 85,
  width = 1208,
  height = 1298,
  driftX = 12,
  driftY = -8,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 90;

  const fourPtStar = makeStar({
    points: 4,
    innerRadius: 2.2,
    outerRadius: 11,
  });

  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const nx = (noise2D(`${seed}-x`, i * 0.37, 0.11) + 1) * 0.5;
        const ny = (noise2D(`${seed}-y`, 0.23, i * 0.41) + 1) * 0.5;
        const depth = (i % 5) * 0.2 + 0.25;
        const cx =
          ((nx * width + t * driftX * depth) % width + width) % width;
        const cy =
          ((ny * height + t * driftY * depth) % height + height) % height;
        const twinkle =
          0.45 + 0.55 * ((noise2D(`${seed}-tw`, i * 0.7, t * 0.85) + 1) * 0.5);
        const r = i % 11 === 0 ? 2.8 : i % 4 === 0 ? 1.9 : 1.15;
        const tint =
          i % 7 === 0
            ? '#FFD978'
            : i % 5 === 0
              ? '#AEE8FF'
              : '#F6F4EE';

        if (i % 14 === 0) {
          return (
            <g
              key={i}
              transform={`translate(${cx - 11}, ${cy - 11}) scale(${0.65 + 0.45 * twinkle})`}
              opacity={0.55 + 0.45 * twinkle}
            >
              <path d={fourPtStar.path} fill={tint} />
            </g>
          );
        }

        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={tint}
            opacity={0.28 + 0.7 * twinkle}
          />
        );
      })}
    </svg>
  );
};

export const GoldenMotesOverlay: React.FC<{
  readonly seed: string;
  readonly count?: number;
  readonly width?: number;
  readonly height?: number;
  readonly riseSpeed?: number;
}> = ({
  seed,
  count = 42,
  width = 1208,
  height = 1298,
  riseSpeed = 22,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 90;

  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <defs>
        <radialGradient id={`mote-glow-${seed}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6D6" stopOpacity="1" />
          <stop offset="45%" stopColor="#F5BC38" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#E5A92B" stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: count }).map((_, i) => {
        const baseX = ((noise2D(`${seed}-mx`, i * 0.53, 1.7) + 1) * 0.5) * width;
        const baseY = ((noise2D(`${seed}-my`, 2.1, i * 0.61) + 1) * 0.5) * height;
        const swayX = noise2D(`${seed}-swx`, i * 0.4, t * 0.35) * 44;
        const curY =
          ((baseY - t * riseSpeed * (0.5 + (i % 5) * 0.22)) % height + height) %
          height;
        const curX = ((baseX + swayX) % width + width) % width;
        const pulse =
          0.3 + 0.7 * ((noise2D(`${seed}-mp`, i * 0.9, t * 0.9) + 1) * 0.5);
        const rad = 3.5 + (i % 4) * 3.2;

        return (
          <circle
            key={i}
            cx={curX}
            cy={curY}
            r={rad}
            fill={`url(#mote-glow-${seed})`}
            opacity={pulse * 0.85}
          />
        );
      })}
    </svg>
  );
};

// ============================================================================
// LEMBAR 01 — LOGAM ASING: GLEAMING 24K GOLD RING & RAW GOLD NUGGET ON BASALT
// Pure 2D museum object illustration:
//  - Draped dark obsidian-indigo velvet cloth + warm museum spotlight shaft
//  - Multi-layered beveled 24K gold wedding band with sweeping specular glint
//    and subtle starry cosmic reflection shimmering inside the metal
//  - Sculpted fractured dark basalt rock cradling a faceted raw gold nugget
//  - Sliding brass jeweler's loupe magnifying golden atomic lattice sparkles
// ============================================================================

export const Lembar01CincinAsing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[0];
  const localT = Math.max(0, sec - ch.start);

  const ringIntro = spring({
    frame: Math.max(0, Math.round(localT * fps - 4)),
    fps,
    config: { damping: 18, stiffness: 86, mass: 1.1 },
  });
  const nuggetIntro = spring({
    frame: Math.max(0, Math.round((localT - 0.35) * fps)),
    fps,
    config: { damping: 19, stiffness: 82, mass: 1.15 },
  });
  // Jeweler's loupe glides in during Card 1C-1D ("Sejak terbentuk 4,5 miliar tahun lalu, Bumi tak sanggup...")
  const loupeIn = easeInOutCubic(prog(sec, 4.35, 5.75));
  const cosmosInRing = easeInOutCubic(prog(sec, 2.25, 4.1));

  // Continuous specular sweep along the gold band
  const glintPhase = (localT * 0.42) % 1;
  const glintAngle = glintPhase * Math.PI * 2;
  const glintX = 430 + Math.cos(glintAngle) * 208;
  const glintY = 748 + Math.sin(glintAngle) * 82;

  // Subtle float/settle on ring highlight
  const spotlightSway = Math.sin(localT * 0.9) * 18;

  const fourStar = makeStar({ points: 4, innerRadius: 3.5, outerRadius: 24 });

  return (
    <CelestialPlateSheet chapter={ch}>
      <svg width={1208} height={1298} viewBox="0 0 1208 1298">
        <defs>
          {/* Deep velvet cosmos-obsidian background */}
          <linearGradient id="l1-bg" x1="0%" y1="0%" x2="15%" y2="100%">
            <stop offset="0%" stopColor="#090D1A" />
            <stop offset="48%" stopColor="#12192B" />
            <stop offset="100%" stopColor="#0B0908" />
          </linearGradient>

          {/* Warm diagonal museum sunbeam */}
          <linearGradient id="l1-beam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE6A3" stopOpacity="0.24" />
            <stop offset="55%" stopColor="#E5A92B" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#E5A92B" stopOpacity="0" />
          </linearGradient>

          {/* 24K Burnished Gold Outer Band Gradient */}
          <linearGradient id="l1-gold-outer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="18%" stopColor="#F5BD3D" />
            <stop offset="42%" stopColor="#B87914" />
            <stop offset="64%" stopColor="#6D4106" />
            <stop offset="84%" stopColor="#E3A327" />
            <stop offset="100%" stopColor="#FFF0AD" />
          </linearGradient>

          {/* 24K Concave Inner Wall Gold Gradient */}
          <linearGradient id="l1-gold-inner" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5C3605" />
            <stop offset="32%" stopColor="#9A6410" />
            <stop offset="58%" stopColor="#FFE89C" />
            <stop offset="82%" stopColor="#B57917" />
            <stop offset="100%" stopColor="#4A2A04" />
          </linearGradient>

          {/* Top Rim Specular Gold Gradient */}
          <linearGradient id="l1-gold-rim" x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#FFF9DC" />
            <stop offset="30%" stopColor="#F6C142" />
            <stop offset="55%" stopColor="#FFFDF0" />
            <stop offset="78%" stopColor="#C9881B" />
            <stop offset="100%" stopColor="#FFE99E" />
          </linearGradient>

          {/* Cosmic Kilonova Shimmer Reflected Inside the Gold Ring */}
          <radialGradient id="l1-cosmos-refl" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FF9468" stopOpacity="0.65" />
            <stop offset="45%" stopColor="#6C399C" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#0E1730" stopOpacity="0" />
          </radialGradient>

          {/* Basalt Stone Procedural Texture */}
          <filter id="l1-stone-tex" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045"
              numOctaves={4}
              seed={17}
              result="rock"
            />
            <feColorMatrix
              type="matrix"
              values="0.18 0 0 0 0.10  0 0.18 0 0 0.11  0 0 0.20 0 0.13  0 0 0 0.35 0"
            />
            <feComposite in2="SourceGraphic" operator="atop" />
          </filter>

          {/* Clip for Loupe Glass */}
          <clipPath id="l1-loupe-clip">
            <circle cx={0} cy={0} r={148} />
          </clipPath>
        </defs>

        {/* Background Studio & Faint Distant Stars Hinting Cosmic Origin */}
        <rect width={1208} height={1298} fill="url(#l1-bg)" />

        <g opacity={0.35 + 0.45 * cosmosInRing}>
          <CosmicStarfield seed="l1-stars" count={68} driftX={6} driftY={-4} />
          {/* Subtle Nebula Wisp in Upper Sky */}
          <ellipse
            cx={640}
            cy={250}
            rx={430}
            ry={145}
            fill="url(#l1-cosmos-refl)"
            transform="rotate(-11 640 250)"
            opacity={0.55 * cosmosInRing}
          />
        </g>

        {/* Draped Obsidian Velvet Display Surface & Sculpted Folds */}
        <path
          d="M 0 680 Q 320 635, 620 668 T 1208 640 L 1208 1298 L 0 1298 Z"
          fill="#12131A"
        />
        <path
          d="M 0 742 C 260 700, 490 785, 790 735 C 980 704, 1110 730, 1208 712 L 1208 1298 L 0 1298 Z"
          fill="#0C0D12"
        />
        <path
          d="M 0 855 C 310 818, 560 912, 920 852 C 1060 828, 1150 842, 1208 836"
          fill="none"
          stroke="rgba(255, 224, 150, 0.08)"
          strokeWidth={3}
        />
        <path
          d="M 0 980 C 280 940, 680 1035, 1208 955 L 1208 1298 L 0 1298 Z"
          fill="#08090D"
        />

        {/* Volumetric Museum Spotlight Shaft */}
        <polygon
          points={`${170 + spotlightSway},0 ${590 + spotlightSway},0 1050,1298 40,1298`}
          fill="url(#l1-beam)"
        />

        {/* ================================================================ */}
        {/* OBJECT 2 (RIGHT): SCULPTED BASALT ROCK & CRYSTALLINE GOLD NUGGET */}
        {/* ================================================================ */}
        <g
          transform={`translate(${858}, ${792 + (1 - nuggetIntro) * 70}) scale(${0.86 + 0.14 * nuggetIntro})`}
          opacity={clamp01(nuggetIntro * 1.3)}
        >
          {/* Cast Contact Shadow on Velvet */}
          <ellipse
            cx={0}
            cy={168}
            rx={265}
            ry={54}
            fill="rgba(0, 0, 0, 0.72)"
          />

          {/* Faceted Dark Basalt Matrix Rock */}
          <polygon
            points="-235,132 -192,-24 -78,-108 88,-116 218,-38 248,118 122,166 -108,164"
            fill="#1D2026"
            stroke="#0A0B0E"
            strokeWidth={3}
          />
          {/* Left lit rock facet */}
          <polygon
            points="-235,132 -192,-24 -78,-108 -18,18 -108,164"
            fill="#2B303B"
          />
          {/* Top-center ridge facet */}
          <polygon
            points="-78,-108 88,-116 112,-10 -18,18"
            fill="#343A47"
          />
          {/* Right shadow facet */}
          <polygon
            points="88,-116 218,-38 248,118 122,166 112,-10"
            fill="#15181E"
          />
          {/* Lower front dark facet */}
          <polygon
            points="-108,164 -18,18 112,-10 122,166"
            fill="#1F232B"
          />

          {/* White Hydrothermal Quartz Veins Cutting Across the Basalt */}
          <path
            d="M -178 48 L -96 14 L -44 36 L 24 -12 L 96 22 L 176 -18"
            fill="none"
            stroke="#D9D4C7"
            strokeWidth={5.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.62}
          />
          <path
            d="M -96 14 L -68 -52 L -22 -74"
            fill="none"
            stroke="#EAE5D9"
            strokeWidth={3.2}
            opacity={0.5}
          />

          {/* Embedded Raw Crystalline 24K Gold Nugget Cluster */}
          <g transform="translate(8, -36)">
            {/* Nugget drop shadow on rock */}
            <polygon
              points="-96,68 -82,-42 -12,-92 78,-68 106,18 68,84 -24,92"
              fill="rgba(0,0,0,0.52)"
              transform="translate(8, 12)"
            />
            {/* Nugget facets — handcrafted metallic planes */}
            <polygon
              points="-94,58 -84,-38 -16,-88 12,-16 -26,82"
              fill="#F5BE41"
              stroke="#5A3604"
              strokeWidth={2}
            />
            <polygon
              points="-16,-88 76,-66 48,4 12,-16"
              fill="#FFF2B0"
              stroke="#5A3604"
              strokeWidth={2}
            />
            <polygon
              points="76,-66 106,18 64,78 48,4"
              fill="#B97B14"
              stroke="#5A3604"
              strokeWidth={2}
            />
            <polygon
              points="-26,82 12,-16 48,4 64,78"
              fill="#DDA026"
              stroke="#5A3604"
              strokeWidth={2}
            />
            <polygon
              points="-54,-18 -14,-58 26,-32 4,14 -42,16"
              fill="#FFF8D2"
              opacity={0.85}
            />
            {/* Secondary crystalline gold bud */}
            <polygon
              points="-118,38 -92,-6 -58,12 -74,56"
              fill="#E8AB2B"
              stroke="#5A3604"
              strokeWidth={2}
            />
          </g>
        </g>

        {/* ================================================================ */}
        {/* OBJECT 1 (FOREGROUND HERO): SCULPTED 24K BEVELED GOLD RING       */}
        {/* ================================================================ */}
        <g
          transform={`translate(${432}, ${776 + (1 - ringIntro) * 85}) scale(${0.84 + 0.16 * ringIntro}) rotate(-8)`}
          opacity={clamp01(ringIntro * 1.35)}
        >
          {/* Soft Ambient Gold Bounce + Deep Velvet Contact Shadow */}
          <ellipse
            cx={8}
            cy={146}
            rx={286}
            ry={78}
            fill="rgba(0, 0, 0, 0.78)"
          />
          <ellipse
            cx={0}
            cy={138}
            rx={220}
            ry={46}
            fill="rgba(245, 188, 56, 0.16)"
          />

          {/* Back Inner Wall of the Gold Ring (visible through top opening) */}
          <path
            d="M -232 -12 A 232 96 0 0 1 232 -12 L 232 68 A 232 96 0 0 0 -232 68 Z"
            fill="url(#l1-gold-inner)"
            stroke="#3E2303"
            strokeWidth={2}
          />

          {/* Engraved Cosmic Latin/Atomic Inscription Inside the Ring Wall */}
          <path
            id="l1-inner-arc"
            d="M -175 42 A 205 78 0 0 1 175 42"
            fill="none"
          />
          <text
            fontFamily={IDENTITY.fontSerif}
            fontStyle="italic"
            fontWeight={600}
            fontSize={21}
            fill="rgba(255, 244, 198, 0.56)"
            letterSpacing="0.16em"
          >
            <textPath href="#l1-inner-arc" startOffset="50%" textAnchor="middle">
              Au · 79 · EX STELLIS
            </textPath>
          </text>

          {/* Front Outer Convex Wall of the Gold Ring */}
          <path
            d="M -268 -10 A 268 114 0 0 0 268 -10 L 268 92 A 268 114 0 0 1 -268 92 Z"
            fill="url(#l1-gold-outer)"
            stroke="#4B2B04"
            strokeWidth={2.5}
          />

          {/* Cosmic Nebula Shimmer Reflected Across the Polished Front Gold Band */}
          <g opacity={0.55 * cosmosInRing}>
            <path
              d="M -258 8 A 258 108 0 0 0 258 8 L 258 76 A 258 108 0 0 1 -258 76 Z"
              fill="url(#l1-cosmos-refl)"
            />
          </g>

          {/* Top Beveled Rim Thickness (Annulus between outer 268x114 and inner 232x96) */}
          <path
            fillRule="evenodd"
            d="M -268 -10 A 268 114 0 1 0 268 -10 A 268 114 0 1 0 -268 -10 Z
               M -232 -10 A 232 96 0 1 0 232 -10 A 232 96 0 1 0 -232 -10 Z"
            fill="url(#l1-gold-rim)"
            stroke="#5B3505"
            strokeWidth={2}
          />

          {/* Crisp Specular Rim Streak along Front Crest */}
          <path
            d="M -210 84 A 252 108 0 0 0 195 88"
            fill="none"
            stroke="#FFFDF2"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.78}
          />
        </g>

        {/* Animated Starburst Glint Riding Along the Gold Ring */}
        <g
          transform={`translate(${glintX - 24}, ${glintY - 24}) rotate(${localT * 38}) scale(${0.8 + 0.35 * Math.sin(localT * 4)})`}
          opacity={0.92}
        >
          <path d={fourStar.path} fill="#FFFDF4" />
        </g>

        {/* ================================================================ */}
        {/* OBJECT 3: JEWELER'S BRASS LOUPE REVEALING ATOMIC GOLD LATTICE    */}
        {/* ================================================================ */}
        {loupeIn > 0.01 && (
          <g
            transform={`translate(${interpolate(loupeIn, [0, 1], [-190, 318])}, ${interpolate(loupeIn, [0, 1], [310, 445])}) rotate(${interpolate(loupeIn, [0, 1], [-22, -8])})`}
            opacity={clamp01(loupeIn * 1.25)}
          >
            {/* Ebonized Wood & Brass Handle */}
            <rect
              x={-20}
              y={146}
              width={40}
              height={210}
              rx={14}
              fill="#231912"
              stroke="#B88224"
              strokeWidth={3}
              transform="rotate(34)"
            />
            <rect
              x={-23}
              y={144}
              width={46}
              height={34}
              rx={4}
              fill="#D99E2B"
              stroke="#4D3106"
              strokeWidth={2}
              transform="rotate(34)"
            />

            {/* Magnified Interior View Inside the Lens */}
            <g clipPath="url(#l1-loupe-clip)">
              <circle cx={0} cy={0} r={148} fill="#121829" />
              {/* Zoomed Gold Surface & Glowing 79-Proton Gold Atom Lattice */}
              <rect x={-160} y={-20} width={320} height={190} fill="#B87A14" opacity={0.36} />
              {[
                [-74, -46],
                [0, -72],
                [74, -46],
                [-74, 28],
                [0, 4],
                [74, 28],
                [0, 78],
              ].map(([ax, ay], idx) => {
                const p = 0.75 + 0.25 * Math.sin(localT * 3.4 + idx);
                return (
                  <g key={idx} transform={`translate(${ax}, ${ay})`}>
                    {/* Lattice bonds */}
                    <circle
                      cx={0}
                      cy={0}
                      r={28 * p}
                      fill="none"
                      stroke="rgba(255, 224, 130, 0.36)"
                      strokeWidth={1.6}
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx={0}
                      cy={0}
                      r={13}
                      fill="#FFD978"
                      stroke="#FFFDF2"
                      strokeWidth={2}
                    />
                    {idx === 4 && (
                      <text
                        x={0}
                        y={5}
                        textAnchor="middle"
                        fontFamily={IDENTITY.fontMono}
                        fontWeight={800}
                        fontSize={12}
                        fill="#3D2202"
                      >
                        79
                      </text>
                    )}
                  </g>
                );
              })}
              {/* Glass Specular Crescent */}
              <path
                d="M -108 -72 A 128 128 0 0 1 86 -96 A 140 140 0 0 0 -98 -42 Z"
                fill="rgba(255, 255, 255, 0.26)"
              />
            </g>

            {/* Heavy Machined Brass Lens Bezel */}
            <circle
              cx={0}
              cy={0}
              r={152}
              fill="none"
              stroke="#E5A92B"
              strokeWidth={14}
            />
            <circle
              cx={0}
              cy={0}
              r={159}
              fill="none"
              stroke="#4B2E05"
              strokeWidth={3}
            />
            <circle
              cx={0}
              cy={0}
              r={145}
              fill="none"
              stroke="#FFF2B8"
              strokeWidth={2}
            />
          </g>
        )}
      </svg>

      {/* Floating Golden Dust Motes */}
      <GoldenMotesOverlay seed="lembar01" count={44} riseSpeed={18} />

      {/* Minimal Archival Specimen Tag */}
      <SpecimenBadge
        text="AURUM · Au-79"
        sub="Lebih tua dari planet Bumi (4,5 miliar thn)"
        right={34}
        bottom={34}
        tone="gold"
      />
    </CelestialPlateSheet>
  );
};

// ============================================================================
// LEMBAR 02 — DAPUR BUMI: VOLCANIC MOUNTAIN & SUBTERRANEAN MAGMA NUGGET STREAM
// Pure 2D naturalist landscape & geological cutaway illustration:
//  - Towering stratovolcano under amber-violet dusk sky + billowing ash clouds
//  - Layered subterranean rock strata with fractures & hydrothermal quartz veins
//  - Glowing magma river carrying solid golden nuggets UPWARD as passengers!
// ============================================================================

export const Lembar02GunungMagma: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[1];
  const localT = Math.max(0, sec - ch.start);

  const magmaFlowP = (localT * 0.22) % 1;
  const volcanoGlow = 0.72 + 0.28 * Math.sin(localT * 2.6);

  // Main subterranean magma conduit path (bottom mantle -> crater & side quartz veins)
  const mainConduit = 'M 596 1298 C 584 1120, 636 965, 606 790 C 582 652, 608 525, 604 388';
  const leftVein = 'M 602 885 C 510 835, 392 782, 268 724';
  const rightVein = 'M 608 755 C 724 705, 846 662, 964 606';

  const mainLen = getLength(mainConduit);
  const leftLen = getLength(leftVein);
  const rightLen = getLength(rightVein);

  return (
    <CelestialPlateSheet chapter={ch}>
      <svg width={1208} height={1298} viewBox="0 0 1208 1298">
        <defs>
          {/* Twilight Volcanic Sky */}
          <linearGradient id="l2-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#12172B" />
            <stop offset="52%" stopColor="#2D2236" />
            <stop offset="85%" stopColor="#6E352C" />
            <stop offset="100%" stopColor="#B8562E" />
          </linearGradient>

          {/* Incandescent Magma River Gradient */}
          <linearGradient id="l2-magma" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFF5B8" />
            <stop offset="28%" stopColor="#FF9E2C" />
            <stop offset="68%" stopColor="#E04319" />
            <stop offset="100%" stopColor="#9E1F14" />
          </linearGradient>

          {/* Crater Caldera Glow */}
          <radialGradient id="l2-crater-glow" cx="50%" cy="65%" r="55%">
            <stop offset="0%" stopColor="#FFE28A" stopOpacity="0.92" />
            <stop offset="40%" stopColor="#FF6724" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FF4518" stopOpacity="0" />
          </radialGradient>

          {/* Deep Mantle Chamber Glow */}
          <radialGradient id="l2-mantle" cx="50%" cy="100%" r="70%">
            <stop offset="0%" stopColor="#FFE694" />
            <stop offset="38%" stopColor="#F5761A" />
            <stop offset="75%" stopColor="#8F1E12" />
            <stop offset="100%" stopColor="#26110E" />
          </radialGradient>
        </defs>

        {/* 1. Atmospheric Dusk Sky & Stars */}
        <rect x={0} y={0} width={1208} height={580} fill="url(#l2-sky)" />
        <CosmicStarfield seed="l2-sky-stars" count={36} height={380} driftX={4} driftY={0} />

        {/* Distant Layered Mountain Ridges */}
        <polygon
          points="0,555 165,468 335,522 510,445 760,515 955,452 1120,504 1208,476 1208,590 0,590"
          fill="#241B2B"
        />
        <polygon
          points="0,575 230,502 420,548 830,536 1035,488 1208,542 1208,610 0,610"
          fill="#1A1420"
        />

        {/* Billowing Volcanic Ash Plume Rising from Crater (@remotion/noise) */}
        {Array.from({ length: 18 }).map((_, i) => {
          const progress = ((localT * 0.16 + i / 18) % 1);
          const py = 382 - progress * 340;
          const drift =
            progress * 155 + noise2D('l2-ash', i * 0.5, localT * 0.35) * 34;
          const px = 604 + drift;
          const r = 34 + progress * 92;
          const alpha =
            progress < 0.15
              ? progress / 0.15
              : Math.max(0, 1 - (progress - 0.15) / 0.85);
          return (
            <g key={i} opacity={alpha * 0.76}>
              <circle cx={px} cy={py} r={r} fill="#2B232C" />
              <circle
                cx={px - r * 0.22}
                cy={py + r * 0.25}
                r={r * 0.72}
                fill={progress < 0.38 ? 'rgba(224, 78, 36, 0.36)' : '#3B313D'}
              />
            </g>
          );
        })}

        {/* Radiant Caldera Fire Glow */}
        <ellipse
          cx={604}
          cy={388}
          rx={210 * volcanoGlow}
          ry={130 * volcanoGlow}
          fill="url(#l2-crater-glow)"
        />

        {/* 2. Towering Sculpted Stratovolcano Cone */}
        {/* Main dark basaltic cone */}
        <polygon
          points="68,596 534,382 674,382 1142,596"
          fill="#1D1920"
        />
        {/* Left sunlit/lava-lit ridge planes */}
        <polygon
          points="68,596 534,382 592,410 355,596"
          fill="#2D242B"
        />
        <polygon
          points="355,596 592,410 616,422 528,596"
          fill="#251D24"
        />
        {/* Right deep shadow ridge planes */}
        <polygon
          points="674,382 1142,596 842,596 636,412"
          fill="#141117"
        />
        {/* Glowing Molten Lava Rim at Crater Lip */}
        <ellipse cx={604} cy={384} rx={70} ry={14} fill="#FF6B24" />
        <ellipse cx={604} cy={385} rx={48} ry={8} fill="#FFE89C" />

        {/* Surface Lava Spill Trickling Down Upper Slope */}
        <path
          d="M 578 392 Q 554 438, 520 486 Q 504 510, 496 536"
          fill="none"
          stroke="#FF7828"
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.85 * volcanoGlow}
        />

        {/* 3. Sculpted Subterranean Earth Crust & Mantle Rock Strata (y = 586..1298) */}
        {/* Layer A: Upper Sedimentary & Basalt Crust */}
        <path
          d="M 0 586 Q 310 568, 604 584 T 1208 582 L 1208 748 Q 880 772, 604 744 T 0 758 Z"
          fill="#2C2623"
        />
        {/* Layer B: Metamorphic Schist & Fractured Granite */}
        <path
          d="M 0 754 Q 320 732, 604 744 T 1208 748 L 1208 932 Q 890 956, 604 926 T 0 942 Z"
          fill="#231D1B"
        />
        {/* Layer C: Deep Gabbro & Lower Crust */}
        <path
          d="M 0 938 Q 300 918, 604 926 T 1208 932 L 1208 1126 Q 880 1146, 604 1118 T 0 1134 Z"
          fill="#1B1514"
        />
        {/* Layer D: Upper Mantle Floor & Glowing Magma Reservoir */}
        <rect x={0} y={1116} width={1208} height={182} fill="#140E0E" />
        <ellipse cx={604} cy={1315} rx={540} ry={175} fill="url(#l2-mantle)" />

        {/* Tectonic Rock Fracture Lines & Mineral Speckles Across Strata */}
        {[
          'M 78 655 L 210 688 L 315 670',
          'M 865 660 L 1015 695 L 1130 676',
          'M 96 845 L 265 818 L 395 858',
          'M 812 838 L 968 874 L 1124 846',
          'M 118 1028 L 312 1054 L 448 1018',
          'M 772 1038 L 948 1008 L 1115 1048',
        ].map((dPath, idx) => (
          <path
            key={idx}
            d={dPath}
            fill="none"
            stroke="rgba(255, 236, 205, 0.11)"
            strokeWidth={2.5}
          />
        ))}

        {/* Hydrothermal White Quartz Veins Branching into Upper Crust */}
        <path
          d={leftVein}
          fill="none"
          stroke="#DFD8C8"
          strokeWidth={26}
          strokeLinecap="round"
          opacity={0.32}
        />
        <path
          d={rightVein}
          fill="none"
          stroke="#DFD8C8"
          strokeWidth={26}
          strokeLinecap="round"
          opacity={0.32}
        />

        {/* 4. Flowing Incandescent Magma Rivers (Outer Crimson Halo + Inner Molten Core) */}
        <path
          d={leftVein}
          fill="none"
          stroke="#B83218"
          strokeWidth={16}
          strokeLinecap="round"
        />
        <path
          d={leftVein}
          fill="none"
          stroke="#FFA73B"
          strokeWidth={7}
          strokeLinecap="round"
        />

        <path
          d={rightVein}
          fill="none"
          stroke="#B83218"
          strokeWidth={16}
          strokeLinecap="round"
        />
        <path
          d={rightVein}
          fill="none"
          stroke="#FFA73B"
          strokeWidth={7}
          strokeLinecap="round"
        />

        {/* Central Volcanic Conduit */}
        <path
          d={mainConduit}
          fill="none"
          stroke="rgba(224, 67, 25, 0.36)"
          strokeWidth={86}
          strokeLinecap="round"
        />
        <path
          d={mainConduit}
          fill="none"
          stroke="url(#l2-magma)"
          strokeWidth={54}
          strokeLinecap="round"
        />
        <path
          d={mainConduit}
          fill="none"
          stroke="#FFF3B0"
          strokeWidth={18}
          strokeLinecap="round"
          strokeDasharray="46 34"
          strokeDashoffset={-localT * 115}
          opacity={0.82}
        />

        {/* 5. SOLID GOLDEN NUGGETS RIDING UPWARD INSIDE THE MAGMA STREAM! */}
        {Array.from({ length: 11 }).map((_, idx) => {
          const u = (magmaFlowP + idx / 11) % 1;
          const pt = getPointAtLength(mainConduit, u * mainLen);
          if (!pt) return null;
          const wobble = Math.sin(localT * 3.5 + idx * 1.7) * 9;
          const rot = localT * 42 + idx * 33;
          return (
            <g
              key={idx}
              transform={`translate(${pt.x + wobble}, ${pt.y}) rotate(${rot})`}
            >
              <circle cx={0} cy={0} r={16} fill="rgba(255, 232, 130, 0.42)" />
              <polygon
                points="-10,-6 -2,-12 10,-5 8,8 -4,11 -11,4"
                fill="#FFD966"
                stroke="#6E4105"
                strokeWidth={2}
              />
              <polygon points="-6,-4 0,-9 6,-3 1,3" fill="#FFFBE0" />
            </g>
          );
        })}

        {/* Gold Nuggets Depositing into Left & Right Quartz Veins */}
        {[0.32, 0.62, 0.88].map((u, idx) => {
          const pL = getPointAtLength(leftVein, u * leftLen);
          const pR = getPointAtLength(rightVein, u * rightLen);
          if (!pL || !pR) return null;
          return (
            <React.Fragment key={idx}>
              <g transform={`translate(${pL.x}, ${pL.y})`}>
                <circle cx={0} cy={0} r={14} fill="rgba(255, 220, 100, 0.35)" />
                <polygon
                  points="-9,-4 0,-10 9,-3 6,8 -6,7"
                  fill="#F5BE3B"
                  stroke="#573304"
                  strokeWidth={1.8}
                />
              </g>
              <g transform={`translate(${pR.x}, ${pR.y})`}>
                <circle cx={0} cy={0} r={14} fill="rgba(255, 220, 100, 0.35)" />
                <polygon
                  points="-8,-5 2,-10 9,-2 5,8 -7,6"
                  fill="#F5BE3B"
                  stroke="#573304"
                  strokeWidth={1.8}
                />
              </g>
            </React.Fragment>
          );
        })}
      </svg>

      {/* Rising Volcanic Sparks */}
      <GoldenMotesOverlay seed="lembar02" count={32} riseSpeed={38} />

      <SpecimenBadge
        text="MAGMA · KURIR ALAM"
        sub="Hanya mengangkut emas yang sudah ada ke kerak"
        x={34}
        bottom={34}
        tone="gold"
      />
    </CelestialPlateSheet>
  );
};

// ============================================================================
// REUSABLE HANDCRAFTED 2D CELESTIAL & METALLURGICAL VISUAL OBJECTS
// Used across Lembar 03..08 — zero charts, 100% rich multi-layered 2D objects!
// ============================================================================

export const HandcraftedGoldNugget: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly rotate?: number;
  readonly glow?: boolean;
}> = ({ x, y, scale = 1, rotate = 0, glow = true }) => {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`}>
      {glow && (
        <circle
          cx={0}
          cy={0}
          r={46}
          fill="rgba(255, 214, 102, 0.24)"
        />
      )}
      {/* Multi-plane metallic gold crystal facets */}
      <polygon
        points="-34,18 -30,-16 -6,-34 26,-24 38,8 22,32 -12,34"
        fill="#DDA024"
        stroke="#4F2E03"
        strokeWidth={2}
      />
      <polygon
        points="-30,-16 -6,-34 12,-6 -10,12"
        fill="#FFF3B2"
      />
      <polygon
        points="-6,-34 26,-24 18,4 12,-6"
        fill="#F6C244"
      />
      <polygon
        points="26,-24 38,8 22,32 18,4"
        fill="#9E650C"
      />
      <polygon
        points="-34,18 -10,12 18,4 22,32 -12,34"
        fill="#C38519"
      />
      <polygon
        points="-14,-12 -2,-24 10,-12 2,2"
        fill="#FFFDF0"
        opacity={0.85}
      />
    </g>
  );
};

export const CrateredMoonObject: React.FC<{
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  readonly phaseShadowOffset?: number;
}> = ({ cx, cy, radius, phaseShadowOffset = 0.36 }) => {
  const clipId = `moon-clip-${Math.round(cx)}-${Math.round(cy)}`;
  const gradId = `moon-grad-${Math.round(cx)}-${Math.round(cy)}`;
  const glowId = `moon-glow-${Math.round(cx)}-${Math.round(cy)}`;

  const craters: ReadonlyArray<readonly [number, number, number]> = [
    [-0.32, -0.26, 0.16],
    [0.18, -0.38, 0.12],
    [-0.12, 0.18, 0.21],
    [0.34, 0.14, 0.15],
    [-0.44, 0.28, 0.11],
    [0.08, 0.48, 0.13],
    [-0.08, -0.54, 0.09],
    [0.46, -0.16, 0.08],
    [-0.56, -0.04, 0.09],
  ];

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <defs>
        <clipPath id={clipId}>
          <circle cx={0} cy={0} r={radius} />
        </clipPath>
        <radialGradient id={gradId} cx="35%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#F5F1E6" />
          <stop offset="48%" stopColor="#CFC8B8" />
          <stop offset="82%" stopColor="#8F8879" />
          <stop offset="100%" stopColor="#4B473F" />
        </radialGradient>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="65%" stopColor="#F5F1E6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#F5F1E6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft Lunar Atmosphere / Albedo Halo */}
      <circle cx={0} cy={0} r={radius * 1.28} fill={`url(#${glowId})`} />

      <g clipPath={`url(#${clipId})`}>
        {/* Regolith Sphere Base */}
        <circle cx={0} cy={0} r={radius} fill={`url(#${gradId})`} />

        {/* Lunar Maria (Dark Basaltic Seas: Mare Imbrium, Serenitatis, Tranquillitatis) */}
        <ellipse
          cx={-radius * 0.22}
          cy={-radius * 0.18}
          rx={radius * 0.34}
          ry={radius * 0.26}
          fill="rgba(76, 72, 66, 0.34)"
          transform="rotate(-18)"
        />
        <ellipse
          cx={radius * 0.18}
          cy={-radius * 0.06}
          rx={radius * 0.26}
          ry={radius * 0.22}
          fill="rgba(72, 68, 62, 0.30)"
          transform="rotate(14)"
        />
        <ellipse
          cx={radius * 0.26}
          cy={radius * 0.22}
          rx={radius * 0.22}
          ry={radius * 0.16}
          fill="rgba(72, 68, 62, 0.26)"
        />
        <ellipse
          cx={-radius * 0.36}
          cy={radius * 0.16}
          rx={radius * 0.24}
          ry={radius * 0.20}
          fill="rgba(78, 74, 68, 0.25)"
        />

        {/* Tycho Ejecta Rays */}
        {Array.from({ length: 10 }).map((_, rIdx) => {
          const ang = (rIdx * 36 * Math.PI) / 180;
          const tx = -radius * 0.12;
          const ty = radius * 0.44;
          return (
            <line
              key={rIdx}
              x1={tx}
              y1={ty}
              x2={tx + Math.cos(ang) * radius * 0.85}
              y2={ty + Math.sin(ang) * radius * 0.85}
              stroke="rgba(255, 252, 244, 0.16)"
              strokeWidth={2.2}
            />
          );
        })}

        {/* Sculpted Impact Craters with Rim Highlight & Interior Shadow */}
        {craters.map(([ux, uy, ur], idx) => {
          const x = ux * radius;
          const y = uy * radius;
          const r = ur * radius;
          return (
            <g key={idx} transform={`translate(${x}, ${y})`}>
              <circle
                cx={-r * 0.08}
                cy={-r * 0.08}
                r={r}
                fill="rgba(68, 64, 58, 0.34)"
                stroke="rgba(255, 252, 242, 0.45)"
                strokeWidth={1.8}
              />
              <circle
                cx={r * 0.12}
                cy={r * 0.12}
                r={r * 0.82}
                fill="rgba(198, 191, 176, 0.45)"
              />
            </g>
          );
        })}

        {/* Lunar Terminator Crescent Shadow */}
        <circle
          cx={radius * phaseShadowOffset}
          cy={radius * 0.12}
          r={radius * 1.04}
          fill="rgba(8, 11, 20, 0.46)"
        />
      </g>

      {/* Crisp Rim Outline */}
      <circle
        cx={0}
        cy={0}
        r={radius}
        fill="none"
        stroke="rgba(255, 249, 232, 0.55)"
        strokeWidth={2}
      />
    </g>
  );
};

// ============================================================================
// LEMBAR 03 — BATAS BINTANG: ROARING RED SUPERGIANT & COLD SOLID IRON BALL
// Pure 2D astronomical object scene:
//  - Colossal blazing Red Supergiant Star with animated solar prominences,
//    convective granulation cells, and fiery corona in deep starry space
//  - Dramatic wedge cutaway opening into the star's heart to reveal a heavy,
//    dark, crystalline forged-metal IRON SPHERE (BESI-56)
//  - As the iron core forms, the star's outer flames dim and collapse inward!
// ============================================================================

export const Lembar03BintangBesi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[2];
  const localT = Math.max(0, sec - ch.start);

  // Beat 1 [22.09..26.08]: Blazing red supergiant star at full roar
  // Beat 2 [26.08..29.31]: Cutaway opens revealing heavy dark metallic Iron Core ("intinya berubah menjadi besi")
  // Beat 3 [29.31..35.54]: Furnace extinguishes & outer star collapses inward onto the iron core!
  const ironReveal = easeInOutCubic(prog(sec, 25.85, 28.8));
  const quenchP = easeInOutCubic(prog(sec, 29.35, 32.65));
  const collapseP = easeInOutCubic(prog(sec, 32.55, 35.15));

  const starRadius = interpolate(collapseP, [0, 1], [418, 286]);
  const fireVitality = 1 - quenchP * 0.68;
  const cx = 604;
  const cy = 648;

  return (
    <CelestialPlateSheet chapter={ch}>
      <svg width={1208} height={1298} viewBox="0 0 1208 1298">
        <defs>
          {/* Deep Space Canvas */}
          <radialGradient id="l3-space" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="#1B1021" />
            <stop offset="55%" stopColor="#0D0F1E" />
            <stop offset="100%" stopColor="#06070F" />
          </radialGradient>

          {/* Outer Stellar Corona Glow */}
          <radialGradient id="l3-corona" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor={quenchP > 0.5 ? '#C83B2B' : '#FFAE38'}
              stopOpacity={0.62 * fireVitality + 0.18}
            />
            <stop
              offset="52%"
              stopColor="#B8291E"
              stopOpacity={0.28 * fireVitality + 0.08}
            />
            <stop offset="100%" stopColor="#5C1018" stopOpacity="0" />
          </radialGradient>

          {/* Supergiant Photosphere Surface */}
          <radialGradient id="l3-star-body" cx="38%" cy="35%" r="68%">
            <stop
              offset="0%"
              stopColor={quenchP > 0.6 ? '#B8432E' : '#FFF3B0'}
            />
            <stop
              offset="34%"
              stopColor={quenchP > 0.6 ? '#8A241B' : '#FF9429'}
            />
            <stop
              offset="74%"
              stopColor={quenchP > 0.6 ? '#4E1212' : '#D4381C'}
            />
            <stop offset="100%" stopColor="#2E090C" />
          </radialGradient>

          {/* Cutaway Interior Glowing Onion Shells */}
          <radialGradient id="l3-interior" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2A2F3B" />
            <stop offset="36%" stopColor="#6E2219" />
            <stop offset="64%" stopColor="#C94E1E" />
            <stop offset="88%" stopColor="#F59B2B" />
            <stop offset="100%" stopColor="#FFE48F" />
          </radialGradient>

          {/* Heavy Cold Forged Iron Core Sphere Gradient */}
          <radialGradient id="l3-iron-core" cx="34%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#DCE4F0" />
            <stop offset="26%" stopColor="#8A96A8" />
            <stop offset="58%" stopColor="#464E5C" />
            <stop offset="85%" stopColor="#222730" />
            <stop offset="100%" stopColor="#101318" />
          </radialGradient>

          <clipPath id="l3-star-clip">
            <circle cx={cx} cy={cy} r={starRadius} />
          </clipPath>
        </defs>

        {/* 1. Starry Deep Space Background */}
        <rect width={1208} height={1298} fill="url(#l3-space)" />
        <CosmicStarfield seed="l3-stars" count={95} driftX={5} driftY={-3} />

        {/* 2. Expansive Solar Corona Halo */}
        <circle
          cx={cx}
          cy={cy}
          r={starRadius * 1.48}
          fill="url(#l3-corona)"
        />

        {/* 3. Animated Solar Prominence Loops Around Star Limb (@remotion/noise) */}
        {Array.from({ length: 16 }).map((_, idx) => {
          const baseAng = (idx / 16) * Math.PI * 2 + localT * 0.08;
          const nVal = noise2D('l3-prom', idx * 0.8, localT * 0.75);
          const loopH = (42 + (nVal + 1) * 44) * fireVitality;
          const span = 0.16;
          const x1 = cx + Math.cos(baseAng - span) * (starRadius - 4);
          const y1 = cy + Math.sin(baseAng - span) * (starRadius - 4);
          const x2 = cx + Math.cos(baseAng + span) * (starRadius - 4);
          const y2 = cy + Math.sin(baseAng + span) * (starRadius - 4);
          const ctrlX = cx + Math.cos(baseAng) * (starRadius + loopH);
          const ctrlY = cy + Math.sin(baseAng) * (starRadius + loopH);

          return (
            <path
              key={idx}
              d={`M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`}
              fill="none"
              stroke={idx % 2 === 0 ? '#FF8B28' : '#E03B1E'}
              strokeWidth={6 + (idx % 3) * 2.5}
              strokeLinecap="round"
              opacity={(0.35 + 0.45 * ((nVal + 1) * 0.5)) * fireVitality}
            />
          );
        })}

        {/* 4. Main Red Supergiant Sphere & Convective Granulation Cells */}
        <g clipPath="url(#l3-star-clip)">
          <circle cx={cx} cy={cy} r={starRadius} fill="url(#l3-star-body)" />

          {/* Organic Convective Plasma Cells on Photosphere */}
          {Array.from({ length: 28 }).map((_, i) => {
            const a = i * 2.39996 + localT * 0.05;
            const dist = Math.sqrt((i + 0.5) / 28) * (starRadius * 0.88);
            const gx = cx + Math.cos(a) * dist;
            const gy = cy + Math.sin(a) * dist;
            const pulse = 0.75 + 0.25 * noise2D('l3-cell', i * 0.6, localT * 0.9);
            return (
              <circle
                key={i}
                cx={gx}
                cy={gy}
                r={46 * pulse * (starRadius / 418)}
                fill={
                  quenchP > 0.55
                    ? 'rgba(40, 8, 10, 0.34)'
                    : 'rgba(255, 236, 156, 0.16)'
                }
              />
            );
          })}
        </g>

        {/* 5. Cutaway Window Opening Into the Star's Heart -> Heavy Iron Ball */}
        {ironReveal > 0.01 && (
          <g opacity={clamp01(ironReveal * 1.15)}>
            {/* Cutaway Circular Cavity Showing Dying Concentric Shells */}
            <circle
              cx={cx}
              cy={cy}
              r={starRadius * 0.68 * ironReveal}
              fill="#130E16"
              stroke={quenchP > 0.5 ? '#7A2A22' : '#FFB946'}
              strokeWidth={4}
            />
            <circle
              cx={cx}
              cy={cy}
              r={starRadius * 0.58 * ironReveal}
              fill="none"
              stroke="rgba(229, 98, 36, 0.42)"
              strokeWidth={18}
              opacity={fireVitality}
            />
            <circle
              cx={cx}
              cy={cy}
              r={starRadius * 0.45 * ironReveal}
              fill="none"
              stroke="rgba(255, 184, 68, 0.35)"
              strokeWidth={12}
              opacity={fireVitality}
            />

            {/* Inward Gravitational Collapse Streaks When Star Quenches! */}
            {collapseP > 0.02 &&
              Array.from({ length: 20 }).map((_, sIdx) => {
                const ang = (sIdx / 20) * Math.PI * 2;
                const outerR = interpolate(
                  (collapseP + (sIdx % 4) * 0.12) % 1,
                  [0, 1],
                  [starRadius * 0.95, 138],
                );
                const innerR = Math.max(126, outerR - 58);
                return (
                  <line
                    key={sIdx}
                    x1={cx + Math.cos(ang) * outerR}
                    y1={cy + Math.sin(ang) * outerR}
                    x2={cx + Math.cos(ang) * innerR}
                    y2={cy + Math.sin(ang) * innerR}
                    stroke="#FF9E54"
                    strokeWidth={3.2}
                    strokeLinecap="round"
                    opacity={0.72 * Math.sin(collapseP * Math.PI)}
                  />
                );
              })}

            {/* THE INERT, UNYIELDING SOLID METALLIC IRON SPHERE (Fe-56) */}
            <g
              transform={`translate(${cx}, ${cy}) scale(${0.45 + 0.55 * ironReveal})`}
            >
              {/* Cold Metallic Rim Shadow */}
              <circle
                cx={0}
                cy={0}
                r={132}
                fill="rgba(0, 0, 0, 0.68)"
              />
              {/* Forged Gunmetal Iron Sphere */}
              <circle
                cx={0}
                cy={0}
                r={122}
                fill="url(#l3-iron-core)"
                stroke="#B8C4D4"
                strokeWidth={3}
              />
              {/* Crystalline Iron Polyhedral Seam Lines */}
              <polygon
                points="0,-96 84,-44 84,48 0,96 -84,48 -84,-44"
                fill="none"
                stroke="rgba(220, 232, 248, 0.24)"
                strokeWidth={2}
              />
              <line
                x1={-84}
                y1={-44}
                x2={84}
                y2={48}
                stroke="rgba(220, 232, 248, 0.18)"
                strokeWidth={1.8}
              />
              <line
                x1={84}
                y1={-44}
                x2={-84}
                y2={48}
                stroke="rgba(220, 232, 248, 0.18)"
                strokeWidth={1.8}
              />
              <line
                x1={0}
                y1={-96}
                x2={0}
                y2={96}
                stroke="rgba(220, 232, 248, 0.18)"
                strokeWidth={1.8}
              />
              {/* Cold Specular Glint on the Iron Ball */}
              <ellipse
                cx={-42}
                cy={-46}
                rx={34}
                ry={18}
                fill="rgba(255, 255, 255, 0.36)"
                transform="rotate(-32 -42 -46)"
              />
              {/* Engraved Element Symbol Directly on the Iron Core Object */}
              <text
                x={0}
                y={8}
                textAnchor="middle"
                fontFamily={IDENTITY.fontSerif}
                fontWeight={900}
                fontSize={48}
                fill="#F0F5FC"
                style={{ letterSpacing: '-0.02em' }}
              >
                Fe
              </text>
              <text
                x={0}
                y={38}
                textAnchor="middle"
                fontFamily={IDENTITY.fontMono}
                fontWeight={700}
                fontSize={16}
                fill="#B8C4D4"
                letterSpacing="0.16em"
              >
                INTI BESI · 26
              </text>
            </g>
          </g>
        )}

        {/* Outer Star Rim Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={starRadius}
          fill="none"
          stroke={quenchP > 0.55 ? '#8C2D23' : '#FFD470'}
          strokeWidth={3}
          opacity={0.75}
        />
      </svg>

      <SpecimenBadge
        text={collapseP > 0.25 ? 'TUNGKU BINTANG PADAM' : 'BATAS FUSI · BESI (Fe-26)'}
        sub={
          collapseP > 0.25
            ? 'Inti besi menyerap energi & meruntuhkan bintang'
            : 'Bintang raksasa tak sanggup merakit emas (Au-79)'
        }
        right={34}
        bottom={34}
        tone={collapseP > 0.25 ? 'crimson' : 'dark'}
      />
    </CelestialPlateSheet>
  );
};

// ============================================================================
// LEMBAR 04 — DUA BINTANG MATI: BINARY NEUTRON STAR INSPIRAL & KILONOVA GOLD!
// Pure 2D cosmic collision spectacle:
//  - Act I [35.55..42.45]: Two ultra-dense cyan-white Neutron Stars wrapped in
//    magnetic arcs spiraling faster & closer while rippling spacetime waves
//    and luminous tidal tails stream outward
//  - Act II [42.45..51.83]: Blinding Kilonova explosion ("menghantam" ->
//    "kilonova") hurling relativistic jets & hundreds of molten 24K gold drops!
// ============================================================================

export const Lembar04TabrakanNeutron: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[3];

  const cx = 604;
  const cy = 648;

  // Inspiral progresses from t=35.55s right up to impact at t=42.45s ("saling menghantam")
  const inspiralP = clamp01((sec - ch.start) / (42.45 - ch.start));
  const merged = sec >= 42.45;
  const kilonovaP = easeOutCubic(prog(sec, 42.42, 46.8));
  const goldForgeP = easeOutCubic(prog(sec, 45.2, 51.2));

  // Accelerating orbital angle: chirp phase ~ (1 - (1 - p)^2.4)
  const orbitalTurns = Math.pow(inspiralP, 2.15) * 5.2;
  const theta = orbitalTurns * Math.PI * 2;
  const sepRadius = merged
    ? 0
    : interpolate(Math.pow(inspiralP, 1.55), [0, 1], [275, 26]);

  const s1x = cx + Math.cos(theta) * sepRadius;
  const s1y = cy + Math.sin(theta) * sepRadius * 0.76;
  const s2x = cx - Math.cos(theta) * sepRadius;
  const s2y = cy - Math.sin(theta) * sepRadius * 0.76;

  // Impact flash right at t=42.45s
  const flashIntensity = merged
    ? Math.max(0, 1 - (sec - 42.45) / 1.15)
    : Math.pow( clamp01((inspiralP - 0.88) / 0.12), 2 ) * 0.45;

  const starBurst = makeStar({ points: 8, innerRadius: 18, outerRadius: 165 });

  return (
    <CelestialPlateSheet chapter={ch}>
      <svg width={1208} height={1298} viewBox="0 0 1208 1298">
        <defs>
          <radialGradient id="l4-space" cx="50%" cy="50%" r="72%">
            <stop offset="0%" stopColor="#121B36" />
            <stop offset="56%" stopColor="#090D1C" />
            <stop offset="100%" stopColor="#04060C" />
          </radialGradient>

          <radialGradient id="l4-nstar" cx="40%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="38%" stopColor="#BDF2FF" />
            <stop offset="75%" stopColor="#3BB4F2" />
            <stop offset="100%" stopColor="#124E8C" />
          </radialGradient>

          <radialGradient id="l4-nstar-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#B8F2FF" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#38A5E8" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#124E8C" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="l4-kilonova-cloud" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBE0" stopOpacity="0.96" />
            <stop offset="26%" stopColor="#FFD25A" stopOpacity="0.88" />
            <stop offset="56%" stopColor="#D94B2B" stopOpacity="0.58" />
            <stop offset="82%" stopColor="#6D2B8C" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#261142" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="l4-jet" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8BE8FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFDF5" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#FFD978" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Deep Space Starfield */}
        <rect width={1208} height={1298} fill="url(#l4-space)" />
        <CosmicStarfield seed="l4-stars" count={105} driftX={8} driftY={-5} />

        {/* 2. Expanding Concentric Spacetime Ripples During Inspiral */}
        {Array.from({ length: 7 }).map((_, rIdx) => {
          const waveP = ((sec * 0.55 + rIdx / 7) % 1);
          const rad = 70 + waveP * 560;
          const alpha = (1 - waveP) * (merged ? 0.16 : 0.36);
          return (
            <ellipse
              key={rIdx}
              cx={cx}
              cy={cy}
              rx={rad}
              ry={rad * 0.76}
              fill="none"
              stroke={merged ? '#FFD978' : '#74D8FF'}
              strokeWidth={2.2}
              opacity={alpha}
            />
          );
        })}

        {/* ================================================================ */}
        {/* ACT I: TWO SPIRALING ULTRA-DENSE NEUTRON STARS & TIDAL TAILS     */}
        {/* ================================================================ */}
        {!merged && (
          <g>
            {/* Luminous Spiral Wake Trails Behind Each Neutron Star */}
            {[0, 1].map((arm) => {
              const pts: string[] = [];
              const steps = 28;
              for (let s = 0; s <= steps; s++) {
                const back = s / steps;
                const ang = theta - back * (1.8 + inspiralP * 2.2) + arm * Math.PI;
                const rr = sepRadius + back * 115;
                const px = cx + Math.cos(ang) * rr;
                const py = cy + Math.sin(ang) * rr * 0.76;
                pts.push(`${s === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
              }
              return (
                <path
                  key={arm}
                  d={pts.join(' ')}
                  fill="none"
                  stroke={arm === 0 ? '#8BE8FF' : '#B5E8FF'}
                  strokeWidth={14 * (0.45 + 0.55 * inspiralP)}
                  strokeLinecap="round"
                  opacity={0.42}
                />
              );
            })}

            {/* Tidal Plasma Bridge Stretching Between the Two Stars Near Impact */}
            {inspiralP > 0.45 && (
              <path
                d={`M ${s1x} ${s1y} Q ${cx + Math.sin(theta) * 36} ${cy - Math.cos(theta) * 28} ${s2x} ${s2y}`}
                fill="none"
                stroke="#FFF6D6"
                strokeWidth={interpolate(inspiralP, [0.45, 1], [3, 22])}
                opacity={interpolate(inspiralP, [0.45, 1], [0.2, 0.9])}
              />
            )}

            {/* Render Both Neutron Stars with Dipolar Magnetic Field Loops */}
            {[
              [s1x, s1y, theta],
              [s2x, s2y, theta + Math.PI],
            ].map(([nx, ny, rot], idx) => (
              <g
                key={idx}
                transform={`translate(${nx}, ${ny}) rotate(${(rot * 180) / Math.PI})`}
              >
                {/* Magnetic Field Dipole Loops */}
                <ellipse
                  cx={-46}
                  cy={0}
                  rx={46}
                  ry={28}
                  fill="none"
                  stroke="rgba(139, 232, 255, 0.45)"
                  strokeWidth={2}
                />
                <ellipse
                  cx={46}
                  cy={0}
                  rx={46}
                  ry={28}
                  fill="none"
                  stroke="rgba(139, 232, 255, 0.45)"
                  strokeWidth={2}
                />
                {/* Intense X-ray Halo */}
                <circle cx={0} cy={0} r={96} fill="url(#l4-nstar-halo)" />
                {/* Compact 20-km Neutron Star Sphere */}
                <circle
                  cx={0}
                  cy={0}
                  r={38}
                  fill="url(#l4-nstar)"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                />
              </g>
            ))}
          </g>
        )}

        {/* ================================================================ */}
        {/* ACT II: KILONOVA EXPLOSION & FORGING OF PURE GOLDEN CLOUDS!      */}
        {/* ================================================================ */}
        {merged && (
          <g>
            {/* Twin Relativistic Polar Gamma-Ray Jets */}
            <polygon
              points={`${cx - 24},${cy} ${cx - 135},${cy - 620 * kilonovaP} ${cx + 135},${cy - 620 * kilonovaP} ${cx + 24},${cy}`}
              fill="url(#l4-jet)"
              opacity={0.75 * (1 - goldForgeP * 0.35)}
            />
            <polygon
              points={`${cx - 24},${cy} ${cx - 135},${cy + 620 * kilonovaP} ${cx + 135},${cy + 620 * kilonovaP} ${cx + 24},${cy}`}
              fill="url(#l4-jet)"
              opacity={0.75 * (1 - goldForgeP * 0.35)}
            />

            {/* Multi-Layered Billowing Kilonova Fireball & Golden Nebula */}
            <circle
              cx={cx}
              cy={cy}
              r={120 + kilonovaP * 440}
              fill="url(#l4-kilonova-cloud)"
            />

            {/* Organic Swirling Golden-Crimson Ejecta Lobes */}
            {Array.from({ length: 18 }).map((_, i) => {
              const ang = (i / 18) * Math.PI * 2 + kilonovaP * 0.45;
              const nOff = noise2D('l4-lobe', i * 0.7, sec * 0.4);
              const dist = (85 + (i % 3) * 78 + nOff * 34) * kilonovaP;
              const lx = cx + Math.cos(ang) * dist;
              const ly = cy + Math.sin(ang) * dist * 0.86;
              const lr = (58 + (i % 4) * 24) * kilonovaP;
              return (
                <circle
                  key={i}
                  cx={lx}
                  cy={ly}
                  r={lr}
                  fill={
                    i % 3 === 0
                      ? 'rgba(255, 214, 92, 0.30)'
                      : i % 3 === 1
                        ? 'rgba(229, 122, 43, 0.24)'
                        : 'rgba(148, 62, 168, 0.20)'
                  }
                />
              );
            })}

            {/* Expanding Shockwave Rings */}
            <circle
              cx={cx}
              cy={cy}
              r={90 + kilonovaP * 475}
              fill="none"
              stroke="#FFE699"
              strokeWidth={4.5 * (1 - kilonovaP * 0.6)}
              opacity={0.85 * (1 - kilonovaP * 0.4)}
            />
            <circle
              cx={cx}
              cy={cy}
              r={55 + goldForgeP * 365}
              fill="none"
              stroke="#FFD978"
              strokeWidth={2.5}
              strokeDasharray="16 12"
              opacity={0.72}
            />

            {/* Newly Forged 24K Gold Nuggets & Molten Droplets Condensing Outward! */}
            {goldForgeP > 0.02 &&
              Array.from({ length: 22 }).map((_, gIdx) => {
                const ang = gIdx * 2.39996 + 0.4;
                const maxR = 115 + (gIdx % 5) * 72;
                const curR = maxR * easeOutCubic(clamp01(goldForgeP * 1.2 - (gIdx % 5) * 0.08));
                const gx = cx + Math.cos(ang) * curR;
                const gy = cy + Math.sin(ang) * curR * 0.88;
                const sc = 0.42 + (gIdx % 4) * 0.16;
                return (
                  <HandcraftedGoldNugget
                    key={gIdx}
                    x={gx}
                    y={gy}
                    scale={sc * clamp01(goldForgeP * 1.6)}
                    rotate={gIdx * 29 + sec * 24}
                  />
                );
              })}

            {/* Blinding Central Remnant Core Starburst */}
            <g
              transform={`translate(${cx - 165}, ${cy - 165}) rotate(${sec * 18} 165 165) scale(${0.65 + 0.35 * (1 - goldForgeP * 0.4)})`}
            >
              <path d={starBurst.path} fill="#FFFDF5" opacity={0.92} />
            </g>
          </g>
        )}

        {/* White-Gold Collision Flash Veil right at moment of impact */}
        {flashIntensity > 0.01 && (
          <rect
            width={1208}
            height={1298}
            fill="#FFF9E6"
            opacity={flashIntensity * 0.85}
          />
        )}
      </svg>

      <GoldenMotesOverlay seed="lembar04" count={merged ? 58 : 22} riseSpeed={26} />

      <SpecimenBadge
        text={merged ? 'LEDAKAN KILONOVA · EMAS LAHIR' : 'DUA BINTANG NEUTRON PADAT'}
        sub={
          merged
            ? 'Atom menelan ribuan neutron & berubah jadi emas murni'
            : 'Massa lebih berat dari Matahari dalam bola seukuran kota'
        }
        x={34}
        bottom={34}
        tone={merged ? 'gold' : 'dark'}
      />
    </CelestialPlateSheet>
  );
};
