import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  continueRender,
  delayRender,
  interpolate,
  registerRoot,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  Lembar01CincinAsing,
  Lembar02GunungMagma,
  Lembar03BintangBesi,
  Lembar04TabrakanNeutron,
} from './emas';
import {
  CHAPTERS,
  IDENTITY,
  VIDEO_SPEC,
  clamp01,
  easeOutCubic,
  getActiveCard,
  getActiveChapterIndex,
} from './script';
import { Lembar05RatusanBulan, Lembar06HujanMeteorPurba } from './y1';
import { Lembar07Observatorium2017, Lembar08FosilBintang } from './y2';

// ============================================================================
// DETERMINISTIC LOCAL FONT LOADER (ZERO NETWORK CALLS DURING RENDER)
// ============================================================================

const FONT_ASSETS = [
  { family: 'Fraunces', file: 'fonts/fraunces-black.ttf', weight: '900', style: 'normal' },
  { family: 'Fraunces', file: 'fonts/fraunces-semibold.ttf', weight: '600', style: 'normal' },
  { family: 'Fraunces', file: 'fonts/fraunces-italic.ttf', weight: '400', style: 'italic' },
  {
    family: 'Plus Jakarta Sans',
    file: 'fonts/plus-jakarta-sans.woff2',
    weight: '400 800',
    style: 'normal',
  },
  {
    family: 'Space Grotesk',
    file: 'fonts/space-grotesk.woff2',
    weight: '500 700',
    style: 'normal',
  },
  {
    family: 'JetBrains Mono',
    file: 'fonts/jetbrains-mono.woff2',
    weight: '400 800',
    style: 'normal',
  },
] as const;

const useCelestialFonts = (): boolean => {
  const [handle] = useState(() => delayRender('Load Naysi Celestial Fonts'));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all(
      FONT_ASSETS.map(async (f) => {
        const face = new FontFace(f.family, `url('${staticFile(f.file)}')`, {
          weight: f.weight,
          style: f.style,
        });
        const loaded = await face.load();
        document.fonts.add(loaded);
      }),
    )
      .then(() => {
        if (mounted) {
          setReady(true);
          continueRender(handle);
        }
      })
      .catch((err) => {
        console.error('Font load error:', err);
        if (mounted) {
          setReady(true);
          continueRender(handle);
        }
      });

    return () => {
      mounted = false;
    };
  }, [handle]);

  return ready;
};

// ============================================================================
// CHAPTER COMPONENT REGISTRY (8 FULL-BLEED OBJECT SCENES)
// ============================================================================

const renderLembarByIndex = (idx: number): React.ReactNode => {
  switch (idx) {
    case 0:
      return <Lembar01CincinAsing />;
    case 1:
      return <Lembar02GunungMagma />;
    case 2:
      return <Lembar03BintangBesi />;
    case 3:
      return <Lembar04TabrakanNeutron />;
    case 4:
      return <Lembar05RatusanBulan />;
    case 5:
      return <Lembar06HujanMeteorPurba />;
    case 6:
      return <Lembar07Observatorium2017 />;
    case 7:
    default:
      return <Lembar08FosilBintang />;
  }
};

// ============================================================================
// PHYSICAL FOLIO STACK STAGE (ANGLED SPRING SHEET-SLIDE TRANSITION)
// Exact physical folio stack & angled slide-over transition of ref_indo!
// ============================================================================

const SheetPlacementBox: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 36,
      top: 98,
      width: 1368,
      height: 1738,
    }}
  >
    {children}
  </div>
);

const FolioStackStage: React.FC<{ readonly sec: number }> = ({ sec }) => {
  const { fps } = useVideoConfig();
  const activeIdx = getActiveChapterIndex(sec);
  const currentChapter = CHAPTERS[activeIdx];
  const localSec = Math.max(0, sec - currentChapter.start);
  const slideWindow = 0.48;
  const isSlidingIn = activeIdx > 0 && localSec < slideWindow;

  const slideSpring =
    activeIdx > 0
      ? spring({
          frame: Math.max(0, Math.round(localSec * fps)),
          fps,
          config: { damping: 21, stiffness: 135, mass: 0.92 },
        })
      : 1;

  const firstSheetOpen =
    activeIdx === 0 ? easeOutCubic(clamp01(sec / 0.36)) : 1;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Previous Lembar Resting Underneath While Next Sheet Slides Over It */}
      {isSlidingIn ? (
        <AbsoluteFill
          style={{
            filter: `brightness(${1 - 0.28 * slideSpring})`,
            transform: `scale(${1 - 0.014 * slideSpring})`,
          }}
        >
          <SheetPlacementBox>{renderLembarByIndex(activeIdx - 1)}</SheetPlacementBox>
        </AbsoluteFill>
      ) : null}

      {/* Active Physical Plate Sliding & Settling onto the Stack */}
      <AbsoluteFill
        style={{
          opacity: activeIdx === 0 ? firstSheetOpen : 1,
          transform:
            activeIdx === 0
              ? `translateY(${(1 - firstSheetOpen) * 26}px)`
              : `translateX(${(1 - slideSpring) * 1440}px) rotate(${(1 - slideSpring) * 2.3}deg)`,
          transformOrigin: '50% 85%',
          filter: isSlidingIn
            ? 'drop-shadow(-38px 20px 48px rgba(0, 0, 0, 0.78))'
            : undefined,
        }}
      >
        <SheetPlacementBox>{renderLembarByIndex(activeIdx)}</SheetPlacementBox>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// WHISPER-SYNCED PROGRESSIVE GOLD-HIGHLIGHT CAPTION STAGE
// Exact concept of 1-HfPa9AVLJGtTqdDyVI8lObiSQQjMzIe:
//  - Short 5-10 word conversational clauses
//  - Spoken = warm white, active word = 24K gold, upcoming = muted gray
// ============================================================================

const CaptionStage: React.FC<{ readonly sec: number }> = ({ sec }) => {
  const activeIdx = getActiveChapterIndex(sec);
  const ch = CHAPTERS[activeIdx];
  const activeCardObj = getActiveCard(ch, sec);

  if (!activeCardObj) return null;
  const { card } = activeCardObj;

  const enterP = clamp01((sec - card.start) / 0.11);
  const exitP = clamp01((card.end - sec) / 0.11);
  const cardAlpha = Math.min(enterP, exitP);
  const liftY = (1 - easeOutCubic(enterP)) * 12;

  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        right: 72,
        top: 1862,
        height: 556,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: cardAlpha,
        transform: `translateY(${liftY}px)`,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1224,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'baseline',
          columnGap: 17,
          rowGap: 10,
          lineHeight: 1.25,
          fontFamily: IDENTITY.fontBody,
          fontSize: 58,
          fontWeight: 700,
          letterSpacing: '-0.014em',
        }}
      >
        {card.words.map(([wordText, ws, we, emph], idx) => {
          const nextWord = idx + 1 < card.words.length ? card.words[idx + 1] : null;
          const handoffEnd = nextWord ? nextWord[1] - 0.01 : we + 0.18;
          const isCurrent = sec >= ws - 0.015 && sec < handoffEnd;
          const isSpoken = sec >= ws - 0.015;

          const color = isCurrent
            ? IDENTITY.captionGold
            : isSpoken
              ? IDENTITY.captionWhite
              : IDENTITY.captionDim;

          const pop = isCurrent
            ? 1 +
              0.044 *
                Math.sin(
                  clamp01((sec - ws) / Math.max(0.08, we - ws)) * Math.PI,
                )
            : 1;

          return (
            <span
              key={`${card.start}-${idx}`}
              style={{
                display: 'inline-block',
                color,
                fontWeight: isCurrent || emph === 1 ? 800 : 700,
                transform: `scale(${pop})`,
                textShadow: isCurrent
                  ? '0 0 32px rgba(245, 188, 56, 0.46), 0 6px 22px rgba(0, 0, 0, 0.90)'
                  : '0 6px 22px rgba(0, 0, 0, 0.84)',
              }}
            >
              {wordText}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// NAYSI STUDIO HUD CHROME (TOP BRANDING, CHAPTER FOOTER, PROGRESS BAR)
// ============================================================================

const StudioHud: React.FC<{ readonly sec: number }> = ({ sec }) => {
  const activeIdx = getActiveChapterIndex(sec);
  const ch = CHAPTERS[activeIdx];
  const progressPct = clamp01(sec / VIDEO_SPEC.durationSec) * 100;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 50 }}>
      {/* Top-Left Brand Lockup: ▪ NAYSI */}
      <div
        style={{
          position: 'absolute',
          left: 46,
          top: 34,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 15,
            height: 15,
            borderRadius: 3,
            background: IDENTITY.captionGold,
            boxShadow: '0 0 14px rgba(245, 188, 56, 0.48)',
          }}
        />
        <span
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: '0.20em',
            color: 'rgba(245, 242, 235, 0.88)',
          }}
        />
        <span
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: '0.20em',
            color: 'rgba(245, 242, 235, 0.88)',
            marginLeft: -14,
          }}
        >
          {VIDEO_SPEC.seriesLeft}
        </span>
      </div>

      {/* Top-Right Series Category: NAYSI · KOSMOS */}
      <div
        style={{
          position: 'absolute',
          right: 46,
          top: 36,
          fontFamily: IDENTITY.fontMono,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.20em',
          color: 'rgba(245, 242, 235, 0.48)',
        }}
      >
        {VIDEO_SPEC.seriesRight}
      </div>

      {/* Bottom-Left Active Chapter Slug */}
      <div
        style={{
          position: 'absolute',
          left: 46,
          bottom: 48,
          fontFamily: IDENTITY.fontMono,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.18em',
          color: 'rgba(245, 242, 235, 0.62)',
        }}
      >
        {ch.num} — {ch.hud}
      </div>

      {/* Bottom-Right 8 Chapter Dashes */}
      <div
        style={{
          position: 'absolute',
          right: 46,
          bottom: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {CHAPTERS.map((item, idx) => {
          const isCurrent = idx === activeIdx;
          const isDone = idx < activeIdx;
          return (
            <div
              key={item.num}
              style={{
                width: isCurrent ? 30 : 18,
                height: 4,
                borderRadius: 2,
                background: isCurrent
                  ? IDENTITY.captionGold
                  : isDone
                    ? 'rgba(245, 242, 235, 0.46)'
                    : 'rgba(245, 242, 235, 0.16)',
                boxShadow: isCurrent
                  ? '0 0 12px rgba(245, 188, 56, 0.65)'
                  : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Bottom-Edge Continuous Progress Bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 8,
          background: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${IDENTITY.kilonovaRed} 0%, ${IDENTITY.captionGold} 100%)`,
            boxShadow: '0 0 16px rgba(245, 188, 56, 0.5)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// MASTER COMPOSITION: NAYSI (1440×2560 @ 90 FPS)
// ============================================================================

export const NaysiEpisode: React.FC = () => {
  useCelestialFonts();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;

  const endFade = interpolate(
    frame,
    [durationInFrames - Math.round(0.35 * fps), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: IDENTITY.bgStudio,
        backgroundImage: `radial-gradient(90% 55% at 50% 35%, #161822 0%, ${IDENTITY.bgStudio} 62%, ${IDENTITY.bgStudioDeep} 100%)`,
      }}
    >
      <Audio src={staticFile('audio/master.mp3')} volume={1} />

      <AbsoluteFill style={{ opacity: endFade }}>
        <FolioStackStage sec={sec} />
        <CaptionStage sec={sec} />
        <StudioHud sec={sec} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={VIDEO_SPEC.id}
        component={NaysiEpisode}
        durationInFrames={VIDEO_SPEC.durationInFrames}
        fps={VIDEO_SPEC.fps}
        width={VIDEO_SPEC.width}
        height={VIDEO_SPEC.height}
      />
    </>
  );
};

registerRoot(RemotionRoot);
export default RemotionRoot;
