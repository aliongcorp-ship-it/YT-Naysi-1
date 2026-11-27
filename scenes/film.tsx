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
  CHAPTER_ART,
  CaptionCard,
  HEIGHT,
  IDENTITY,
  TOTAL_FRAMES,
  VIDEO_SPEC,
  WIDTH,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
} from './script';
import { Scene01, Scene02, Scene03, Scene04, Scene05, Scene06, Scene07, Scene08, Scene09, Scene10, Scene11, Scene12 } from './matahari';

// ============================================================================
// 1. LOCAL FONTS — no network at render time
// ============================================================================

interface LocalFontDef {
  readonly family: string;
  readonly file: string;
  readonly weight: string;
  readonly style?: string;
}

const LOCAL_FONT_DEFS: readonly LocalFontDef[] = [
  { family: 'Bebas Neue', file: 'fonts/bebas-neue.woff2', weight: '400' },
  { family: 'Oswald', file: 'fonts/oswald-variable.woff2', weight: '400 700' },
  { family: 'Cormorant Garamond', file: 'fonts/cormorant-garamond.woff2', weight: '400 700' },
  { family: 'Cormorant Garamond', file: 'fonts/cormorant-garamond-italic.woff2', weight: '400 700', style: 'italic' },
  { family: 'Plus Jakarta Sans', file: 'fonts/plus-jakarta-sans.woff2', weight: '400 800' },
  { family: 'IBM Plex Mono', file: 'fonts/ibm-plex-mono-400.woff2', weight: '400' },
  { family: 'IBM Plex Mono', file: 'fonts/ibm-plex-mono-600.woff2', weight: '600' },
  { family: 'Space Grotesk', file: 'fonts/space-grotesk.woff2', weight: '300 700' },
  { family: 'Instrument Serif', file: 'fonts/instrument-serif-regular.woff2', weight: '400' },
  { family: 'Instrument Serif', file: 'fonts/instrument-serif-italic.woff2', weight: '400', style: 'italic' },
  { family: 'Fraunces', file: 'fonts/fraunces-black.ttf', weight: '900' },
  { family: 'Fraunces', file: 'fonts/fraunces-semibold.ttf', weight: '600' },
  { family: 'Fraunces', file: 'fonts/fraunces-italic.ttf', weight: '400', style: 'italic' },
];

let fontsLoadedOnce = false;

function useLocalFonts(): boolean {
  const [ready, setReady] = useState<boolean>(fontsLoadedOnce);
  const [handle] = useState(() => (fontsLoadedOnce ? null : delayRender('load-local-fonts')));

  useEffect(() => {
    if (handle === null) return;
    let cancelled = false;
    Promise.all(
      LOCAL_FONT_DEFS.map(async (f) => {
        const face = new FontFace(f.family, `url(${staticFile(f.file)})`, {
          weight: f.weight,
          style: f.style ?? 'normal',
        });
        const loaded = await face.load();
        document.fonts.add(loaded);
      }),
    )
      .then(() => {
        if (cancelled) return;
        fontsLoadedOnce = true;
        setReady(true);
        continueRender(handle);
      })
      .catch((err) => {
        if (!cancelled) cancelRender(err);
      });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return ready;
}

// ============================================================================
// 2. CHAPTER STAGE — dissolve plus a per-chapter camera push
// ============================================================================

const TRANSITION_FRAMES = 24;

const SCENE_COMPONENTS: readonly React.FC[] = [
  Scene01,
  Scene02,
  Scene03,
  Scene04,
  Scene05,
  Scene06,
  Scene07,
  Scene08,
  Scene09,
  Scene10,
  Scene11,
  Scene12,
];

const PUSH = [0.05, 0.03, 0.04, 0.05, 0.045, 0.04, 0.045, 0.05, 0.055, 0.045, 0.05, 0.05];

const ChapterStage: React.FC<{ index: number; durationFrames: number; Component: React.FC }> = ({
  index,
  durationFrames,
  Component,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = index === 0 ? 1 : easeInOutCubic(clamp01(frame / TRANSITION_FRAMES));
  const fadeOut =
    index === CHAPTERS.length - 1
      ? 1
      : 1 - easeInOutCubic(clamp01((frame - (durationFrames - TRANSITION_FRAMES)) / TRANSITION_FRAMES));
  const drift = 1 + PUSH[index] * clamp01(frame / Math.max(1, durationFrames));

  return (
    <AbsoluteFill
      style={{
        opacity: clamp01(fadeIn * fadeOut),
        transform: `scale(${drift})`,
        transformOrigin: '50% 44%',
      }}
    >
      <Component />
    </AbsoluteFill>
  );
};

// ============================================================================
// 3. CAPTIONS — per-word timing, one amber word per card
// ============================================================================

const ALL_CARDS: readonly CaptionCard[] = CHAPTERS.flatMap((c) => c.cards);
const captionAlign: readonly ('center' | 'left')[] = ['left', 'left', 'left', 'center', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left'];

const CaptionStage: React.FC<{ currentSec: number }> = ({ currentSec }) => {
  let activeCard: CaptionCard | null = null;
  let cardChapter = 0;
  for (let i = 0; i < ALL_CARDS.length; i++) {
    const c = ALL_CARDS[i];
    const nextStart = i < ALL_CARDS.length - 1 ? ALL_CARDS[i + 1].start : c.end + 0.32;
    const holdEnd = Math.min(nextStart - 0.02, c.end + 0.26);
    if (currentSec >= c.start - 0.05 && currentSec <= holdEnd) {
      activeCard = c;
      for (let k = CHAPTERS.length - 1; k >= 0; k--) {
        if (currentSec >= CHAPTERS[k].start) {
          cardChapter = k;
          break;
        }
      }
      break;
    }
  }
  if (!activeCard) return null;

  const art = CHAPTER_ART[cardChapter];
  const align = captionAlign[cardChapter];
  const enterP = easeOutCubic(clamp01((currentSec - (activeCard.start - 0.05)) / 0.16));
  const exitP = clamp01((activeCard.end + 0.26 - currentSec) / 0.14);
  const cardAlpha = enterP * exitP;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 214,
        minHeight: 340,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        padding: align === 'center' ? '0 96px' : '0 100px 0 100px',
        pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(6,6,8,0) 0%, rgba(6,6,8,0.72) 38%, rgba(6,6,8,0.94) 100%)',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          textAlign: align === 'center' ? 'center' : 'left',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: align === 'center' ? 'center' : 'flex-start',
          columnGap: 17,
          rowGap: 4,
          opacity: cardAlpha,
        }}
      >
        {activeCard.words.map(([word, wStart, wEnd, emph], idx) => {
          const started = currentSec >= wStart - 0.02;
          const speaking = currentSec >= wStart - 0.02 && currentSec <= wEnd + 0.08;
          const local = clamp01((currentSec - wStart + 0.06) / 0.15);
          const rise = (1 - easeOutCubic(local)) * 16;
          const color = !started ? 'rgba(244, 239, 228, 0.24)' : emph === 1 ? art.accent : art.ink;
          return (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                fontFamily: IDENTITY.fontBody,
                fontSize: 58,
                fontWeight: emph === 1 ? 800 : 600,
                lineHeight: 1.28,
                letterSpacing: '-0.015em',
                color,
                transform: `translateY(${rise}px) scale(${speaking ? 1.015 : 1})`,
                textShadow: '0 6px 24px rgba(0, 0, 0, 0.92), 0 1px 2px rgba(0, 0, 0, 0.95)',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 4. MASTHEAD — channel, plate number, hairline progress
// ============================================================================

const Masthead: React.FC<{ currentSec: number }> = ({ currentSec }) => {
  let chIndex = 0;
  for (let i = CHAPTERS.length - 1; i >= 0; i--) {
    if (currentSec >= CHAPTERS[i].start) {
      chIndex = i;
      break;
    }
  }
  const art = CHAPTER_ART[chIndex];
  const progress = clamp01(currentSec / VIDEO_SPEC.durationSec);

  return (
    <div style={{ position: 'absolute', left: 84, right: 84, top: 76, pointerEvents: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span
            style={{
              width: 13,
              height: 13,
              backgroundColor: art.accent,
              display: 'inline-block',
              transform: 'rotate(45deg)',
            }}
          />
          <span
            style={{
              fontFamily: IDENTITY.fontGrotesk,
              fontSize: 27,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: 'rgba(246, 240, 228, 0.92)',
            }}
          >
            NAYSI
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 30, height: 1, backgroundColor: 'rgba(226, 214, 190, 0.36)' }} />
          <span
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 19,
              letterSpacing: '0.24em',
              color: 'rgba(226, 214, 190, 0.66)',
              textTransform: 'uppercase',
            }}
          >
            {VIDEO_SPEC.topicWatermark}
          </span>
          <span
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 19,
              letterSpacing: '0.16em',
              color: art.accent,
            }}
          >
            {String(chIndex + 1).padStart(2, '0')}/12
          </span>
        </div>
      </div>
      <div style={{ marginTop: 16, height: 2, backgroundColor: 'rgba(226, 214, 190, 0.14)' }}>
        <div style={{ height: 2, width: `${progress * 100}%`, backgroundColor: art.accent, opacity: 0.8 }} />
      </div>
    </div>
  );
};

// ============================================================================
// 5. COMPOSITION
// ============================================================================

export const NaysiSunShort: React.FC = () => {
  const fontsReady = useLocalFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  if (!fontsReady) {
    return <AbsoluteFill style={{ backgroundColor: '#08090B' }} />;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#08090B', overflow: 'hidden' }}>
      <Audio src={staticFile('audio/master.mp3')} />

      {CHAPTERS.map((ch, idx) => {
        const rawStart = Math.round(ch.start * fps);
        const rawEnd = Math.round(ch.end * fps);
        const fromFrame = idx === 0 ? 0 : Math.max(0, rawStart - TRANSITION_FRAMES);
        const endFrame =
          idx === CHAPTERS.length - 1 ? TOTAL_FRAMES : Math.min(TOTAL_FRAMES, rawEnd + TRANSITION_FRAMES);
        const durFrames = Math.max(1, endFrame - fromFrame);
        const Comp = SCENE_COMPONENTS[idx];
        return (
          <Sequence key={ch.slug} from={fromFrame} durationInFrames={durFrames} name={ch.slug}>
            <ChapterStage index={idx} durationFrames={durFrames} Component={Comp} />
          </Sequence>
        );
      })}

      <CaptionStage currentSec={currentSec} />
      <Masthead currentSec={currentSec} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id={VIDEO_SPEC.id}
    component={NaysiSunShort}
    durationInFrames={VIDEO_SPEC.durationInFrames}
    fps={VIDEO_SPEC.fps}
    width={WIDTH}
    height={HEIGHT}
  />
);

registerRoot(RemotionRoot);
