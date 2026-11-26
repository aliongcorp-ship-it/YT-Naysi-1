import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  continueRender,
  delayRender,
  interpolate,
  registerRoot,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  Lembar01Oktober1582,
  Lembar02KalenderJulian,
  Lembar03SelisihSebelasMenit,
  Lembar04AkumulasiSepuluhHari,
} from './kalender';
import {
  CHAPTERS,
  IDENTITY,
  VIDEO_SPEC,
  clamp01,
  easeOutCubic,
  getActiveCard,
  getActiveChapterIndex,
} from './script';
import { Lembar05ReformasiGregorius, Lembar06RumusKabisat } from './y1';
import { Lembar07EfekDomino, Lembar08CekPonselmu } from './y2';

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

const useAlmanacFonts = (): boolean => {
  const [handle] = useState(() => delayRender('Load Naysi Almanac Fonts'));
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
// CHAPTER COMPONENT REGISTRY (8 LEMBAR)
// ============================================================================

const renderLembarByIndex = (idx: number): React.ReactNode => {
  switch (idx) {
    case 0:
      return <Lembar01Oktober1582 />;
    case 1:
      return <Lembar02KalenderJulian />;
    case 2:
      return <Lembar03SelisihSebelasMenit />;
    case 3:
      return <Lembar04AkumulasiSepuluhHari />;
    case 4:
      return <Lembar05ReformasiGregorius />;
    case 5:
      return <Lembar06RumusKabisat />;
    case 6:
      return <Lembar07EfekDomino />;
    case 7:
    default:
      return <Lembar08CekPonselmu />;
  }
};

// ============================================================================
// PHYSICAL FOLIO STACK STAGE (SLIDE & SETTLE PAGE TRANSITION)
// ============================================================================

const FolioStackStage: React.FC<{ readonly sec: number }> = ({ sec }) => {
  const activeIdx = getActiveChapterIndex(sec);
  const currentChapter = CHAPTERS[activeIdx];
  const localSec = sec - currentChapter.start;
  const slideWindow = 0.44;
  const isSlidingIn = activeIdx > 0 && localSec < slideWindow;
  const slideP = isSlidingIn ? easeOutCubic(localSec / slideWindow) : 1;

  // Opening gentle lift for Lembar 01
  const firstSheetOpen =
    activeIdx === 0 ? easeOutCubic(clamp01(sec / 0.36)) : 1;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Keep Previous Lembar Resting Underneath While New Lembar Slides Over It */}
      {isSlidingIn ? (
        <AbsoluteFill
          style={{
            filter: `brightness(${1 - 0.24 * slideP})`,
            transform: `scale(${1 - 0.012 * slideP})`,
          }}
        >
          {renderLembarByIndex(activeIdx - 1)}
        </AbsoluteFill>
      ) : null}

      {/* Active Lembar Sliding Onto the Physical Folio Stack */}
      <AbsoluteFill
        style={{
          opacity: activeIdx === 0 ? firstSheetOpen : 1,
          transform:
            activeIdx === 0
              ? `translateY(${(1 - firstSheetOpen) * 26}px)`
              : `translateX(${(1 - slideP) * 1420}px) rotate(${(1 - slideP) * 2.1}deg)`,
          transformOrigin: '50% 85%',
          filter: isSlidingIn
            ? 'drop-shadow(-34px 18px 46px rgba(0, 0, 0, 0.72))'
            : undefined,
        }}
      >
        {renderLembarByIndex(activeIdx)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// WHISPER-SYNCED PROGRESSIVE GOLD-HIGHLIGHT CAPTION STAGE
// ============================================================================

const CaptionStage: React.FC<{ readonly sec: number }> = ({ sec }) => {
  const activeIdx = getActiveChapterIndex(sec);
  const ch = CHAPTERS[activeIdx];
  const activeCardObj = getActiveCard(ch, sec);

  if (!activeCardObj) return null;
  const { card } = activeCardObj;

  // Smooth card enter & exit envelope
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
          maxWidth: 1216,
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
              0.042 *
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
                  ? '0 0 30px rgba(244, 190, 68, 0.42), 0 6px 22px rgba(0, 0, 0, 0.88)'
                  : '0 6px 22px rgba(0, 0, 0, 0.82)',
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
            boxShadow: '0 0 14px rgba(244, 190, 68, 0.45)',
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
        >
          {VIDEO_SPEC.seriesLeft}
        </span>
      </div>

      {/* Top-Right Series Category: NAYSI · SEJARAH */}
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

      {/* Bottom-Left Active Chapter Indicator */}
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
                  ? '0 0 12px rgba(244, 190, 68, 0.6)'
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
            background: `linear-gradient(90deg, #D95B38 0%, ${IDENTITY.captionGold} 100%)`,
            boxShadow: '0 0 16px rgba(244, 190, 68, 0.5)',
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
  useAlmanacFonts();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;

  // Clean fade-to-black in final 0.35s
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
        backgroundImage: `radial-gradient(90% 55% at 50% 35%, #171A21 0%, ${IDENTITY.bgStudio} 62%, ${IDENTITY.bgStudioDeep} 100%)`,
      }}
    >
      {/* Master Indonesian Male VO + Horological Underscore (MP3, Zero WAV) */}
      <Audio src={staticFile('audio/master.mp3')} volume={1} />

      <AbsoluteFill style={{ opacity: endFade }}>
        {/* Physical Folio Stack Stage (Upper ~72% of 2K Vertical Frame) */}
        <FolioStackStage sec={sec} />

        {/* Dedicated Dark Theater Caption Stage (Lower ~24% of Frame) */}
        <CaptionStage sec={sec} />

        {/* Precision Studio HUD */}
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
