import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  registerRoot,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  CHAPTERS,
  IDENTITY,
  VIDEO_SPEC,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  getActiveCard,
  getActiveChapterIndex,
} from './script';
import {
  Scene01LogamAsing,
  Scene02KurirMagma,
  Scene03MentokDiBesi,
  Scene04TabrakanNeutron,
} from './emas';
import { Scene05RatusanBulan, Scene06HujanMeteor } from './y1';
import { Scene07Bukti2017, Scene08FosilBintang } from './y2';

// ============================================================================
// DETERMINISTIC LOCAL FONT LOADER (ZERO EXTERNAL NETWORK FETCHES)
// ============================================================================

const FONT_DEFINITIONS: ReadonlyArray<{
  family: string;
  file: string;
  weight: string;
  style: string;
}> = [
  { family: 'Fraunces', file: 'fonts/fraunces-black.ttf', weight: '900', style: 'normal' },
  { family: 'Fraunces', file: 'fonts/fraunces-semibold.ttf', weight: '600', style: 'normal' },
  { family: 'Fraunces', file: 'fonts/fraunces-italic.ttf', weight: '600', style: 'italic' },
  { family: 'Plus Jakarta Sans', file: 'fonts/plus-jakarta-sans.woff2', weight: '400 800', style: 'normal' },
  { family: 'Space Grotesk', file: 'fonts/space-grotesk.woff2', weight: '500 700', style: 'normal' },
  { family: 'JetBrains Mono', file: 'fonts/jetbrains-mono.woff2', weight: '400 700', style: 'normal' },
  { family: 'Instrument Serif', file: 'fonts/instrument-serif-regular.woff2', weight: '400', style: 'normal' },
  { family: 'Instrument Serif', file: 'fonts/instrument-serif-italic.woff2', weight: '400', style: 'italic' },
];

const useLocalFonts = (): boolean => {
  const [loaded, setLoaded] = useState(false);
  const [handle] = useState(() => delayRender('Loading local Naysi typography'));

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      FONT_DEFINITIONS.map(async (def) => {
        const face = new FontFace(def.family, `url('${staticFile(def.file)}')`, {
          weight: def.weight,
          style: def.style,
        });
        const loadedFace = await face.load();
        document.fonts.add(loadedFace);
      }),
    )
      .then(() => {
        if (!cancelled) {
          setLoaded(true);
          continueRender(handle);
        }
      })
      .catch((err) => {
        cancelRender(err);
      });

    return () => {
      cancelled = true;
    };
  }, [handle]);

  return loaded;
};

// ============================================================================
// FULL-BLEED 1440x2560 SCENE ROUTER WITH OPTICAL CROSS-DISSOLVE TRANSITIONS
// ============================================================================

const SCENE_COMPONENTS: readonly React.FC[] = [
  Scene01LogamAsing,
  Scene02KurirMagma,
  Scene03MentokDiBesi,
  Scene04TabrakanNeutron,
  Scene05RatusanBulan,
  Scene06HujanMeteor,
  Scene07Bukti2017,
  Scene08FosilBintang,
];

const TRANSITION_FRAMES = 28; // ~0.31s silky optical cross-dissolve @ 90fps

const FullBleedChapterStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: IDENTITY.obsidianVoid }}>
      {CHAPTERS.map((ch, idx) => {
        const startFrame = Math.round(ch.start * fps);
        const endFrame =
          idx === CHAPTERS.length - 1
            ? durationInFrames
            : Math.round(ch.end * fps);

        const seqFrom = startFrame;
        // Keep outgoing chapter alive during incoming chapter's dissolve window
        const seqEnd =
          idx < CHAPTERS.length - 1
            ? Math.min(durationInFrames, endFrame + TRANSITION_FRAMES)
            : durationInFrames;
        const seqDur = Math.max(1, seqEnd - seqFrom);

        if (frame < seqFrom - 2 || frame > seqEnd + 2) {
          return null;
        }

        const fadeProgress =
          idx === 0
            ? 1
            : easeInOutCubic(clamp01((frame - startFrame) / TRANSITION_FRAMES));

        const enterScale = idx === 0 ? 1 : 1.028 - 0.028 * fadeProgress;
        const SceneComp = SCENE_COMPONENTS[idx];

        return (
          <Sequence
            key={ch.slug}
            from={seqFrom}
            durationInFrames={seqDur}
            layout="none"
          >
            <AbsoluteFill
              style={{
                zIndex: 10 + idx,
                opacity: fadeProgress,
                transform: `scale(${enterScale})`,
                transformOrigin: '50% 45%',
              }}
            >
              <SceneComp />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================================================
// GIANT CRISP PROGRESSIVE WORD-BY-WORD CAPTION STAGE (EXACT GPS STYLE)
// ============================================================================

const CaptionStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const chIdx = getActiveChapterIndex(sec);
  const ch = CHAPTERS[chIdx];
  const active = getActiveCard(ch, sec);
  if (!active) return null;

  const { card } = active;
  const fadeIn = easeOutCubic(clamp01((sec - card.start) / 0.14));
  const fadeOut = easeOutCubic(clamp01((card.end - sec) / 0.11));
  const opacity = Math.min(fadeIn, fadeOut);
  const liftY = (1 - fadeIn) * 14;

  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        right: 96,
        top: 1835,
        height: 450,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 90,
        opacity,
        transform: `translate3d(0, ${liftY}px, 0)`,
      }}
    >
      <div
        style={{
          maxWidth: 1230,
          textAlign: 'center',
          fontFamily: IDENTITY.fontBody,
          fontSize: 66,
          fontWeight: 700,
          lineHeight: 1.28,
          letterSpacing: '-0.02em',
        }}
      >
        {card.words.map((w, idx) => {
          const [word, wStart, wEnd] = w;
          const nextStart =
            idx + 1 < card.words.length ? card.words[idx + 1][1] : wEnd + 0.18;

          const isCurrent = sec >= wStart - 0.02 && sec < nextStart;
          const isSpoken = sec >= nextStart;

          let color: string = IDENTITY.captionDim;
          let textShadow = '0 4px 18px rgba(0, 0, 0, 0.75)';

          if (isCurrent) {
            color = IDENTITY.captionGold;
            textShadow =
              '0 0 38px rgba(245, 184, 65, 0.58), 0 4px 18px rgba(0, 0, 0, 0.92)';
          } else if (isSpoken) {
            color = IDENTITY.captionWhite;
            textShadow = '0 4px 18px rgba(0, 0, 0, 0.90)';
          }

          return (
            <React.Fragment key={idx}>
              <span
                style={{
                  color,
                  textShadow,
                  display: 'inline-block',
                }}
              >
                {word}
              </span>
              {idx < card.words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MINIMAL FLOATING NAYSI SERIES HUD & CINEMA GRADE OVERLAY
// ============================================================================

const StudioHud: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const chIdx = getActiveChapterIndex(sec);
  const ch = CHAPTERS[chIdx];
  const progressPct = clamp01(frame / Math.max(1, durationInFrames - 1)) * 100;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 110 }}>
      {/* Soft Cinema Edge Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 180px rgba(0, 0, 0, 0.62)',
        }}
      />

      {/* Top Header Bar: ■ NAYSI  |  NAYSI · KOSMOS */}
      <div
        style={{
          position: 'absolute',
          top: 84,
          left: 104,
          right: 104,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <span
            style={{
              width: 15,
              height: 15,
              borderRadius: 3.5,
              backgroundColor: '#D89624',
              boxShadow: '0 0 14px rgba(216, 150, 36, 0.55)',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: IDENTITY.fontDisplay,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: IDENTITY.hudText,
            }}
          >
            {VIDEO_SPEC.seriesLeft}
          </span>
        </div>

        <div
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '0.22em',
            color: IDENTITY.hudMuted,
          }}
        >
          {VIDEO_SPEC.seriesRight}
        </div>
      </div>

      {/* Bottom Footer Bar: 01 — BUKAN DARI BUMI  |  8 Progress Dashes */}
      <div
        style={{
          position: 'absolute',
          bottom: 72,
          left: 104,
          right: 104,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '0.16em',
            color: IDENTITY.hudMuted,
          }}
        >
          {ch.num} — {ch.hud}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {CHAPTERS.map((item, i) => {
            const isActive = i === chIdx;
            const isPast = i < chIdx;
            return (
              <span
                key={item.num}
                style={{
                  width: isActive ? 22 : 16,
                  height: 3.5,
                  borderRadius: 2,
                  backgroundColor: isActive
                    ? '#E59D28'
                    : isPast
                    ? 'rgba(229, 157, 40, 0.36)'
                    : 'rgba(255, 255, 255, 0.16)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Glowing Progress Hairline */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #C87E16 0%, #F5B841 100%)',
            boxShadow: '0 0 18px rgba(245, 184, 65, 0.65)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// MASTER COMPOSITION & REMOTION ROOT
// ============================================================================

export const NaysiEpisode: React.FC = () => {
  const fontsReady = useLocalFonts();

  return (
    <AbsoluteFill style={{ backgroundColor: IDENTITY.obsidianVoid }}>
      <Audio src={staticFile('audio/master.mp3')} />
      {fontsReady && (
        <>
          <FullBleedChapterStage />
          <CaptionStage />
          <StudioHud />
        </>
      )}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={VIDEO_SPEC.id}
      component={NaysiEpisode}
      durationInFrames={VIDEO_SPEC.durationInFrames}
      fps={VIDEO_SPEC.fps}
      width={VIDEO_SPEC.width}
      height={VIDEO_SPEC.height}
    />
  );
};

registerRoot(RemotionRoot);
