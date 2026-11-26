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
  CaptionCard,
  FPS,
  HEIGHT,
  IDENTITY,
  TOTAL_FRAMES,
  VIDEO_SPEC,
  WIDTH,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
} from './script';
import {
  Scene01JebakanAroma,
  Scene02PelontarAerosol,
  Scene03PabrikStreptomyces,
  Scene04EmpatRatusKolam,
} from './hujan';
import { Scene05UmpanKutuPegas, Scene06KurirSpora } from './y1';
import { Scene07KompasGurun, Scene08ParadoksGeosmin } from './y2';

// ============================================================================
// 1. DETERMINISTIC LOCAL FONT LOADER (ZERO NETWORK CALLS)
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
  {
    family: 'Cormorant Garamond',
    file: 'fonts/cormorant-garamond-italic.woff2',
    weight: '400 700',
    style: 'italic',
  },
  { family: 'Plus Jakarta Sans', file: 'fonts/plus-jakarta-sans.woff2', weight: '400 800' },
  { family: 'IBM Plex Mono', file: 'fonts/ibm-plex-mono-400.woff2', weight: '400' },
  { family: 'IBM Plex Mono', file: 'fonts/ibm-plex-mono-600.woff2', weight: '600' },
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
// 2. CHAPTER CROSS-DISSOLVE & SUBTLE DOCUMENTARY CAMERA PUSH
// ============================================================================

const TRANSITION_FRAMES = 28;

const SCENE_COMPONENTS: readonly React.FC[] = [
  Scene01JebakanAroma,
  Scene02PelontarAerosol,
  Scene03PabrikStreptomyces,
  Scene04EmpatRatusKolam,
  Scene05UmpanKutuPegas,
  Scene06KurirSpora,
  Scene07KompasGurun,
  Scene08ParadoksGeosmin,
];

const FullBleedChapterStage: React.FC<{
  index: number;
  durationFrames: number;
  Component: React.FC;
}> = ({ index, durationFrames, Component }) => {
  const frame = useCurrentFrame();

  const fadeIn =
    index === 0 ? 1 : easeInOutCubic(clamp01(frame / TRANSITION_FRAMES));
  const fadeOut =
    index === CHAPTERS.length - 1
      ? 1
      : 1 -
        easeInOutCubic(
          clamp01((frame - (durationFrames - TRANSITION_FRAMES)) / TRANSITION_FRAMES),
        );
  const opacity = clamp01(fadeIn * fadeOut);

  const camScale = interpolate(frame, [0, durationFrames], [1.0, 1.022], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${camScale})`,
        transformOrigin: '50% 48%',
      }}
    >
      <Component />
    </AbsoluteFill>
  );
};

// ============================================================================
// 3. PROGRESSIVE NON-NEON EDITORIAL CAPTIONS
// ============================================================================

const ALL_CARDS: readonly CaptionCard[] = CHAPTERS.flatMap((c) => c.cards);

const CaptionStage: React.FC<{ currentSec: number }> = ({ currentSec }) => {
  let activeCard: CaptionCard | null = null;
  for (let i = 0; i < ALL_CARDS.length; i++) {
    const c = ALL_CARDS[i];
    const nextStart = i < ALL_CARDS.length - 1 ? ALL_CARDS[i + 1].start : c.end + 0.32;
    const holdEnd = Math.min(nextStart - 0.02, c.end + 0.26);
    if (currentSec >= c.start - 0.05 && currentSec <= holdEnd) {
      activeCard = c;
      break;
    }
  }

  if (!activeCard) return null;

  const enterP = easeOutCubic(clamp01((currentSec - (activeCard.start - 0.05)) / 0.14));
  const exitP = clamp01((activeCard.end + 0.26 - currentSec) / 0.12);
  const cardAlpha = enterP * exitP;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 245,
        minHeight: 340,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 92px',
        pointerEvents: 'none',
        background:
          'linear-gradient(180deg, rgba(8,11,10,0) 0%, rgba(8,11,10,0.76) 36%, rgba(8,11,10,0.90) 100%)',
      }}
    >
      <div
        style={{
          maxWidth: 1248,
          textAlign: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 17,
          rowGap: 8,
          opacity: cardAlpha,
          transform: `translateY(${(1 - enterP) * 14}px)`,
        }}
      >
        {activeCard.words.map(([word, wStart, wEnd, emph], idx) => {
          const started = currentSec >= wStart - 0.02;
          const speaking = currentSec >= wStart - 0.02 && currentSec <= wEnd + 0.08;
          const wordPop = speaking
            ? 1 +
              0.045 *
                Math.sin(
                  clamp01((currentSec - wStart) / Math.max(0.09, wEnd - wStart)) * Math.PI,
                )
            : 1;

          const color = !started
            ? 'rgba(242, 239, 232, 0.34)'
            : emph === 1
              ? IDENTITY.amberLight
              : IDENTITY.ivoryText;

          return (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                fontFamily: IDENTITY.fontBody,
                fontSize: 58,
                fontWeight: emph === 1 ? 800 : 700,
                lineHeight: 1.24,
                letterSpacing: '-0.015em',
                color,
                transform: `scale(${wordPop})`,
                textShadow: '0 4px 18px rgba(0, 0, 0, 0.88), 0 1px 3px rgba(0, 0, 0, 0.94)',
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
// 4. MINIMAL WATERMARK: YOUTUBE CHANNEL NAME & TOPIC ONLY (ZERO PAGE CLUTTER)
// ============================================================================

const TopWatermark: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        left: 88,
        right: 88,
        top: 84,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {/* YouTube Channel Watermark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: 3,
            backgroundColor: IDENTITY.amberSpore,
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontFamily: IDENTITY.fontBody,
            fontSize: 27,
            fontWeight: 800,
            letterSpacing: '0.18em',
            color: IDENTITY.ivoryText,
          }}
        >
          NAYSI
        </span>
      </div>

      {/* Topic Watermark Only */}
      <span
        style={{
          fontFamily: IDENTITY.fontMono,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.2em',
          color: IDENTITY.stoneText,
          textTransform: 'uppercase',
        }}
      >
        {VIDEO_SPEC.topicWatermark}
      </span>
    </div>
  );
};

// ============================================================================
// 5. MASTER 1440x2560 @ 90FPS COMPOSITION ROOT
// ============================================================================

export const NaysiPetrichorShort: React.FC = () => {
  const fontsReady = useLocalFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  if (!fontsReady) {
    return <AbsoluteFill style={{ backgroundColor: '#090D0C' }} />;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#090D0C', overflow: 'hidden' }}>
      <Audio src={staticFile('audio/master.mp3')} />

      {CHAPTERS.map((ch, idx) => {
        const rawStart = Math.round(ch.start * fps);
        const rawEnd = Math.round(ch.end * fps);
        const fromFrame = idx === 0 ? 0 : Math.max(0, rawStart - TRANSITION_FRAMES);
        const endFrame =
          idx === CHAPTERS.length - 1
            ? TOTAL_FRAMES
            : Math.min(TOTAL_FRAMES, rawEnd + TRANSITION_FRAMES);
        const durFrames = Math.max(1, endFrame - fromFrame);
        const SceneComp = SCENE_COMPONENTS[idx];

        return (
          <Sequence
            key={ch.slug}
            from={fromFrame}
            durationInFrames={durFrames}
            name={ch.slug}
          >
            <FullBleedChapterStage
              index={idx}
              durationFrames={durFrames}
              Component={SceneComp}
            />
          </Sequence>
        );
      })}

      <CaptionStage currentSec={currentSec} />
      <TopWatermark />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={VIDEO_SPEC.id}
      component={NaysiPetrichorShort}
      durationInFrames={VIDEO_SPEC.durationInFrames}
      fps={VIDEO_SPEC.fps}
      width={VIDEO_SPEC.width}
      height={VIDEO_SPEC.height}
    />
  );
};

registerRoot(RemotionRoot);
