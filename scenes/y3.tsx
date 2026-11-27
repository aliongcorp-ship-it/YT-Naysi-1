import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
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
import { Scene01RuangTakar, Scene02StripCepat, Scene03CawanAgar, Scene04SpreadEditorial } from './hujan';
import { Scene05Loupe, Scene06AtlasLontaran } from './y1';
import { Scene07KompasGurun, Scene08StillLife } from './y2';

// ============================================================================
// 1. LOCAL FONT LOADER (ZERO NETWORK DEPENDENCE)
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
// 2. CHAPTER STAGE WITH A DIFFERENT TRANSITION PER CHAPTER FAMILY
// ============================================================================

const TRANSITION_FRAMES = 26;

const SCENE_COMPONENTS: readonly React.FC[] = [
  Scene01RuangTakar,
  Scene02StripCepat,
  Scene03CawanAgar,
  Scene04SpreadEditorial,
  Scene05Loupe,
  Scene06AtlasLontaran,
  Scene07KompasGurun,
  Scene08StillLife,
];

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

  // each chapter pushes the camera differently instead of one global template push
  const pushPattern = [0.02, 0.045, 0.018, 0.03, 0.04, 0.026, 0.05, 0.03];
  const drift = interpolate(frame, [0, durationFrames], [1, 1 + pushPattern[index]], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const panX = Math.sin(frame / durationFrames * Math.PI) * (index % 2 === 0 ? -8 : 8);

  return (
    <AbsoluteFill
      style={{
        opacity: clamp01(fadeIn * fadeOut),
        transform: `translateX(${panX}px) scale(${drift})`,
        transformOrigin: '50% 46%',
      }}
    >
      <Component />
    </AbsoluteFill>
  );
};

// ============================================================================
// 3. CAPTIONS — PER-CHAPTER ALIGNMENT, MASK-RISE WORDS, NO UNIFIED CARD
// ============================================================================

const ALL_CARDS: readonly CaptionCard[] = CHAPTERS.flatMap((c) => c.cards);

const captionAlign: readonly ('center' | 'left')[] = ['center', 'left', 'center', 'left', 'center', 'left', 'left', 'center'];

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
  const enterP = easeOutCubic(clamp01((currentSec - (activeCard.start - 0.05)) / 0.18));
  const exitP = clamp01((activeCard.end + 0.26 - currentSec) / 0.14);
  const cardAlpha = enterP * exitP;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 232,
        minHeight: 330,
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        padding: align === 'center' ? '0 84px' : '0 96px 0 96px',
        pointerEvents: 'none',
        background:
          'linear-gradient(180deg, rgba(6,8,7,0) 0%, rgba(6,8,7,0.66) 34%, rgba(6,8,7,0.88) 100%)',
      }}
    >
      <div
        style={{
          maxWidth: 1250,
          textAlign: align === 'center' ? 'center' : 'left',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: align === 'center' ? 'center' : 'flex-start',
          columnGap: 16,
          rowGap: 6,
          opacity: cardAlpha,
        }}
      >
        {activeCard.words.map(([word, wStart, wEnd, emph], idx) => {
          const started = currentSec >= wStart - 0.02;
          const speaking = currentSec >= wStart - 0.02 && currentSec <= wEnd + 0.08;
          const local = clamp01((currentSec - wStart + 0.06) / 0.16);
          const rise = (1 - easeOutCubic(local)) * 18;
          const color = !started ? 'rgba(244, 241, 234, 0.26)' : emph === 1 ? art.accent : IDENTITY.ivoryText;
          return (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                fontFamily: IDENTITY.fontBody,
                fontSize: 57,
                fontWeight: emph === 1 ? 800 : 650,
                lineHeight: 1.26,
                letterSpacing: '-0.014em',
                color,
                transform: `translateY(${rise}px) scale(${speaking ? 1.02 : 1})`,
                textShadow: '0 5px 20px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.95)',
                transition: 'none',
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
// 4. WATERMARK — CHANNEL NAME + TOPIC ONLY
// ============================================================================

const TopWatermark: React.FC<{ currentSec: number }> = ({ currentSec }) => {
  const chIndex = (() => {
    for (let i = CHAPTERS.length - 1; i >= 0; i--) if (currentSec >= CHAPTERS[i].start) return i;
    return 0;
  })();
  const art = CHAPTER_ART[chIndex];
  return (
    <div
      style={{
        position: 'absolute',
        left: 86,
        right: 86,
        top: 82,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <span
          style={{
            width: 14,
            height: 14,
            backgroundColor: art.accent,
            display: 'inline-block',
            transform: 'rotate(45deg)',
            boxShadow: '0 0 0 3px rgba(0,0,0,0.28)',
          }}
        />
        <span
          style={{
            fontFamily: IDENTITY.fontGrotesk,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.22em',
            color: IDENTITY.ivoryText,
          }}
        >
          NAYSI
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 34, height: 1, backgroundColor: 'rgba(226, 214, 190, 0.4)' }} />
        <span
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: 20,
            fontWeight: 400,
            letterSpacing: '0.22em',
            color: 'rgba(226, 214, 190, 0.72)',
            textTransform: 'uppercase',
          }}
        >
          {VIDEO_SPEC.topicWatermark}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// 5. MASTER COMPOSITION
// ============================================================================

export const NaysiPetrichorShort: React.FC = () => {
  const fontsReady = useLocalFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  if (!fontsReady) {
    return <AbsoluteFill style={{ backgroundColor: '#080C0B' }} />;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#080C0B', overflow: 'hidden' }}>
      <Audio src={staticFile('audio/master.mp3')} />

      {CHAPTERS.map((ch, idx) => {
        const rawStart = Math.round(ch.start * fps);
        const rawEnd = Math.round(ch.end * fps);
        const fromFrame = idx === 0 ? 0 : Math.max(0, rawStart - TRANSITION_FRAMES);
        const endFrame = idx === CHAPTERS.length - 1 ? TOTAL_FRAMES : Math.min(TOTAL_FRAMES, rawEnd + TRANSITION_FRAMES);
        const durFrames = Math.max(1, endFrame - fromFrame);
        const SceneComp = SCENE_COMPONENTS[idx];
        return (
          <Sequence key={ch.slug} from={fromFrame} durationInFrames={durFrames} name={ch.slug}>
            <ChapterStage index={idx} durationFrames={durFrames} Component={SceneComp} />
          </Sequence>
        );
      })}

      <CaptionStage currentSec={currentSec} />
      <TopWatermark currentSec={currentSec} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id={VIDEO_SPEC.id}
    component={NaysiPetrichorShort}
    durationInFrames={VIDEO_SPEC.durationInFrames}
    fps={VIDEO_SPEC.fps}
    width={WIDTH}
    height={HEIGHT}
  />
);

registerRoot(RemotionRoot);
