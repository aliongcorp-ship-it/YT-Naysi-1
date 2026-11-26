import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  continueRender,
  delayRender,
  registerRoot,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  Scene01JalanBaru,
  Scene02DuaJalur,
  Scene03EnamPuluhLima,
  SceneRenderProps,
} from './braess';
import {
  CHAPTERS,
  ChapterDef,
  IDENTITY,
  SentenceCue,
  VIDEO_SPEC,
  clamp01,
  easeInOutCubic,
  getSentenceAt,
  rangeProgress,
} from './script';
import {
  Scene04JalanPintas,
  Scene05JebakanNash,
  Scene06DelapanPuluh,
} from './y1';
import {Scene07Seoul2003, Scene08DitutupLancar} from './y2';

const SCENE_COMPONENTS: readonly React.FC<SceneRenderProps>[] = [
  Scene01JalanBaru,
  Scene02DuaJalur,
  Scene03EnamPuluhLima,
  Scene04JalanPintas,
  Scene05JebakanNash,
  Scene06DelapanPuluh,
  Scene07Seoul2003,
  Scene08DitutupLancar,
];

const GRAIN_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">` +
    Array.from({length: 85})
      .map((_, i) => {
        const x = (i * 53 + 17) % 160;
        const y = (i * 97 + 29) % 160;
        const r = i % 3 === 0 ? 1.1 : 0.75;
        const fill = i % 2 === 0 ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.48)';
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
      })
      .join('') +
    `</svg>`,
);

const useStudioFonts = (): boolean => {
  const [loaded, setLoaded] = useState(false);
  const [handle] = useState(() => delayRender('Load Naysi WOFF2 studio fonts'));

  useEffect(() => {
    let active = true;
    const specs: Array<{family: string; file: string; weight: string; style: string}> = [
      {
        family: 'Space Grotesk',
        file: 'fonts/space-grotesk.woff2',
        weight: '300 700',
        style: 'normal',
      },
      {
        family: 'Plus Jakarta Sans',
        file: 'fonts/plus-jakarta-sans.woff2',
        weight: '400 800',
        style: 'normal',
      },
      {
        family: 'JetBrains Mono',
        file: 'fonts/jetbrains-mono.woff2',
        weight: '400 800',
        style: 'normal',
      },
      {
        family: 'Instrument Serif',
        file: 'fonts/instrument-serif-regular.woff2',
        weight: '400',
        style: 'normal',
      },
      {
        family: 'Instrument Serif',
        file: 'fonts/instrument-serif-italic.woff2',
        weight: '400',
        style: 'italic',
      },
    ];

    Promise.all(
      specs.map(async (s) => {
        const face = new FontFace(s.family, `url(${staticFile(s.file)})`, {
          weight: s.weight,
          style: s.style,
        });
        const loadedFace = await face.load();
        document.fonts.add(loadedFace);
      }),
    )
      .then(() => {
        if (active) {
          setLoaded(true);
          continueRender(handle);
        }
      })
      .catch((err) => {
        console.error('Font load failed:', err);
        if (active) {
          setLoaded(true);
          continueRender(handle);
        }
      });

    return () => {
      active = false;
    };
  }, [handle]);

  return loaded;
};

const ProgressiveCaptionBar: React.FC<{
  readonly sec: number;
  readonly sentence: SentenceCue | null;
}> = ({sec, sentence}) => {
  if (!sentence) return null;

  const enterP = easeInOutCubic(
    rangeProgress(sec, sentence.start - 0.05, sentence.start + 0.16),
  );
  const exitP = easeInOutCubic(
    rangeProgress(sec, sentence.end - 0.08, sentence.end + 0.14),
  );
  const opacity = clamp01(enterP * (1 - exitP));

  let activeIdx = -1;
  for (let i = 0; i < sentence.words.length; i++) {
    const [, ws, we] = sentence.words[i];
    if (sec >= ws - 0.02 && sec <= we + 0.06) {
      activeIdx = i;
    }
  }
  if (activeIdx === -1) {
    for (let i = sentence.words.length - 1; i >= 0; i--) {
      if (sec >= sentence.words[i][1]) {
        activeIdx = i;
        break;
      }
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        right: 96,
        top: 1872,
        minHeight: 380,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity,
        transform: `translateY(${(1 - enterP) * 14 - exitP * 10}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1210,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'baseline',
          columnGap: 16,
          rowGap: 10,
          lineHeight: 1.26,
          fontFamily: IDENTITY.fontBody,
          fontSize: 55,
          fontWeight: 700,
          letterSpacing: '-0.012em',
          textShadow: '0 8px 28px rgba(0, 0, 0, 0.72)',
        }}
      >
        {sentence.words.map(([wordText, ws, we, emph], idx) => {
          const isCurrent = idx === activeIdx && sec <= we + 0.22;
          const isSpoken = sec >= ws - 0.015;

          const color = isCurrent
            ? IDENTITY.citrine
            : isSpoken
              ? IDENTITY.ivory
              : 'rgba(244, 239, 230, 0.28)';

          const wordPop = isCurrent
            ? 1 +
              0.045 *
                Math.sin(
                  clamp01((sec - ws) / Math.max(0.08, we - ws)) * Math.PI,
                )
            : 1;

          return (
            <span
              key={`${ws}-${idx}`}
              style={{
                display: 'inline-block',
                color,
                fontWeight: isCurrent || emph === 1 ? 800 : 700,
                transform: `scale(${wordPop})`,
                textShadow: isCurrent
                  ? '0 0 28px rgba(246, 200, 68, 0.42), 0 6px 20px rgba(0,0,0,0.85)'
                  : '0 6px 22px rgba(0,0,0,0.78)',
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

const StudioHudOverlay: React.FC<{
  readonly chapter: ChapterDef;
  readonly globalProgress: number;
}> = ({chapter, globalProgress}) => {
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {/* Top-Left Brand Lockup: ▪ NAYSI */}
      <div
        style={{
          position: 'absolute',
          left: 84,
          top: 68,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 3.5,
            background: IDENTITY.citrine,
            boxShadow: '0 0 12px rgba(246, 200, 68, 0.5)',
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontFamily: IDENTITY.fontDisplay,
            fontSize: 27,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: 'rgba(244, 239, 230, 0.78)',
          }}
        >
          {VIDEO_SPEC.brand}
        </span>
      </div>

      {/* Top-Right Niche Watermark: NAYSI · EKONOMI */}
      <div
        style={{
          position: 'absolute',
          right: 84,
          top: 72,
          fontFamily: IDENTITY.fontMono,
          fontSize: 21,
          fontWeight: 500,
          letterSpacing: '0.2em',
          color: 'rgba(244, 239, 230, 0.42)',
        }}
      >
        {VIDEO_SPEC.nicheTag}
      </div>

      {/* Bottom-Left Chapter Ticker: 01 — JALAN BARU */}
      <div
        style={{
          position: 'absolute',
          left: 84,
          bottom: 78,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontFamily: IDENTITY.fontMono,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.14em',
        }}
      >
        <span style={{color: IDENTITY.citrine}}>{chapter.num}</span>
        <span style={{color: 'rgba(244, 239, 230, 0.34)'}}>—</span>
        <span style={{color: 'rgba(244, 239, 230, 0.62)'}}>
          {chapter.title}
        </span>
      </div>

      {/* Bottom-Right 8-Chapter Segmented Dashes */}
      <div
        style={{
          position: 'absolute',
          right: 84,
          bottom: 86,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {CHAPTERS.map((ch) => {
          const active = ch.index === chapter.index;
          return (
            <div
              key={ch.num}
              style={{
                width: active ? 28 : 18,
                height: 4,
                borderRadius: 999,
                background: active
                  ? IDENTITY.citrine
                  : 'rgba(244, 239, 230, 0.2)',
                boxShadow: active
                  ? '0 0 10px rgba(246, 200, 68, 0.55)'
                  : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Bottom-Edge Continuous Glowing Progress Bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 7,
          background: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            width: `${clamp01(globalProgress) * 100}%`,
            height: '100%',
            background:
              'linear-gradient(90deg, #F6C844 0%, #FF6B42 65%, #2CE59B 100%)',
            boxShadow: '0 0 18px rgba(246, 200, 68, 0.65)',
          }}
        />
      </div>
    </div>
  );
};

export const NaysiMasterComposition: React.FC = () => {
  const ready = useStudioFonts();
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const sec = frame / fps;
  const globalProgress = frame / Math.max(1, durationInFrames - 1);
  const {chapter, sentence} = getSentenceAt(sec);

  const XFADE = 0.22;
  const activeScenes: Array<{
    idx: number;
    ch: ChapterDef;
    opacity: number;
    scale: number;
  }> = [];

  for (let i = 0; i < CHAPTERS.length; i++) {
    const ch = CHAPTERS[i];
    if (sec >= ch.start - XFADE && sec <= ch.end + XFADE) {
      let opacity = 1;
      if (i > 0 && sec < ch.start + XFADE) {
        opacity = easeInOutCubic(
          rangeProgress(sec, ch.start - XFADE, ch.start + XFADE),
        );
      } else if (i < CHAPTERS.length - 1 && sec > ch.end - XFADE) {
        opacity =
          1 -
          easeInOutCubic(rangeProgress(sec, ch.end - XFADE, ch.end + XFADE));
      }
      const localP = rangeProgress(sec, ch.start, ch.end);
      const scale = 1 + localP * 0.016;
      activeScenes.push({idx: i, ch, opacity: clamp01(opacity), scale});
    }
  }

  const grainStep = Math.floor(frame / 3);
  const grainOffsetX = (grainStep * 37) % 160;
  const grainOffsetY = (grainStep * 61) % 160;

  if (!ready) {
    return <AbsoluteFill style={{backgroundColor: IDENTITY.bgObsidian}} />;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: IDENTITY.bgObsidian,
        overflow: 'hidden',
      }}
    >
      <Audio src={staticFile('audio/master.mp3')} />

      {/* Active Chapter Visual Stage(s) with Smooth Cross-Dissolve */}
      {activeScenes.map(({idx, ch, opacity, scale}) => {
        const SceneComp = SCENE_COMPONENTS[idx];
        return (
          <AbsoluteFill
            key={ch.slug}
            style={{
              opacity,
              transform: `scale(${scale})`,
              transformOrigin: '50% 42%',
            }}
          >
            <SceneComp
              sec={sec}
              localSec={Math.max(0, sec - ch.start)}
              durationSec={ch.end - ch.start}
            />
          </AbsoluteFill>
        );
      })}

      {/* Bottom Caption Readability Gradient */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 820,
          background:
            'linear-gradient(180deg, rgba(8, 11, 10, 0) 0%, rgba(8, 11, 10, 0.76) 44%, rgba(6, 9, 8, 0.95) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 210px rgba(0, 0, 0, 0.58)',
          pointerEvents: 'none',
        }}
      />

      {/* Fast Tiled SVG Micro-Grain Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
          backgroundRepeat: 'repeat',
          backgroundPosition: `${grainOffsetX}px ${grainOffsetY}px`,
          opacity: 0.085,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />

      {/* Synchronized Word-by-Word Progressive Caption */}
      <ProgressiveCaptionBar sec={sec} sentence={sentence} />

      {/* Studio Brand & Chapter HUD */}
      <StudioHudOverlay chapter={chapter} globalProgress={globalProgress} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={VIDEO_SPEC.id}
      component={NaysiMasterComposition}
      durationInFrames={VIDEO_SPEC.durationInFrames}
      fps={VIDEO_SPEC.fps}
      width={VIDEO_SPEC.width}
      height={VIDEO_SPEC.height}
    />
  );
};

registerRoot(RemotionRoot);
