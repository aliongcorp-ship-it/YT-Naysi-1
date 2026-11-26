import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
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
  Scene03BatasBesi,
  Scene04TabrakanNeutron,
} from './emas';
import { Scene05RatusanBulan, Scene06HujanMeteor } from './y1';
import { Scene07Bukti2017, Scene08FosilBintang } from './y2';

// ============================================================================
// 1. DETERMINISTIC LOCAL FONT LOADER (ALL 6 FAMILIES FROM public/fonts/)
// ============================================================================

let fontsLoadedMemory = false;

const useLocalFonts = (): boolean => {
  const [ready, setReady] = useState<boolean>(fontsLoadedMemory);

  useEffect(() => {
    if (fontsLoadedMemory || typeof FontFace === 'undefined') {
      setReady(true);
      return;
    }

    const handle = delayRender('load-naysi-atelier-fonts');
    const specs: readonly {
      family: string;
      file: string;
      weight: string;
      style: string;
    }[] = [
      { family: 'Bebas Neue', file: 'fonts/bebas-neue.woff2', weight: '400', style: 'normal' },
      { family: 'Oswald', file: 'fonts/oswald-variable.woff2', weight: '300 700', style: 'normal' },
      { family: 'Cormorant Garamond', file: 'fonts/cormorant-garamond.woff2', weight: '400 700', style: 'normal' },
      { family: 'Cormorant Garamond', file: 'fonts/cormorant-garamond-italic.woff2', weight: '400 700', style: 'italic' },
      { family: 'IBM Plex Mono', file: 'fonts/ibm-plex-mono-400.woff2', weight: '400', style: 'normal' },
      { family: 'IBM Plex Mono', file: 'fonts/ibm-plex-mono-600.woff2', weight: '600', style: 'normal' },
      { family: 'Plus Jakarta Sans', file: 'fonts/plus-jakarta-sans.woff2', weight: '400 800', style: 'normal' },
      { family: 'Space Grotesk', file: 'fonts/space-grotesk.woff2', weight: '400 700', style: 'normal' },
      { family: 'JetBrains Mono', file: 'fonts/jetbrains-mono.woff2', weight: '400 700', style: 'normal' },
    ];

    Promise.all(
      specs.map(async (s) => {
        const ff = new FontFace(s.family, `url(${staticFile(s.file)})`, {
          weight: s.weight,
          style: s.style,
        });
        const loaded = await ff.load();
        document.fonts.add(loaded);
      }),
    )
      .then(() => {
        fontsLoadedMemory = true;
        setReady(true);
        continueRender(handle);
      })
      .catch((err) => {
        console.error('Font load warning:', err);
        fontsLoadedMemory = true;
        setReady(true);
        continueRender(handle);
      });
  }, []);

  return ready;
};

// ============================================================================
// 2. CHAPTER SCENE DISPATCHER & CINEMATIC LENS STAGE (30-FRAME DISSOLVE)
// ============================================================================

const SCENE_COMPONENTS: readonly React.FC[] = [
  Scene01LogamAsing,
  Scene02KurirMagma,
  Scene03BatasBintangBridge,
  Scene04TabrakanNeutron,
  Scene05RatusanBulan,
  Scene06HujanMeteor,
  Scene07Bukti2017,
  Scene08FosilBintang,
];

function Scene03BatasBintangBridge() {
  return <Scene03BatasBesi />;
}

const TRANSITION_FRAMES = 28;

const FullBleedChapterStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#0E0F0C', overflow: 'hidden' }}>
      {CHAPTERS.map((ch, idx) => {
        const startFrame = Math.round(ch.start * fps);
        const endFrame = Math.round(ch.end * fps);
        const seqFrom = idx === 0 ? 0 : Math.max(0, startFrame - TRANSITION_FRAMES);
        const seqEnd = idx === CHAPTERS.length - 1 ? VIDEO_SPEC.durationInFrames : endFrame;
        const seqDur = Math.max(1, seqEnd - seqFrom);

        if (frame < seqFrom - 2 || frame > seqEnd + 2) {
          return null;
        }

        const localInSeq = frame - seqFrom;
        let opacity = 1;
        let scale = 1;

        if (idx > 0 && localInSeq < TRANSITION_FRAMES) {
          const u = easeInOutCubic(clamp01(localInSeq / TRANSITION_FRAMES));
          opacity = u;
          scale = interpolate(u, [0, 1], [1.024, 1.0]);
        }

        // Subtle documentary lens push over the chapter's duration
        const chapterProgress = clamp01(localInSeq / seqDur);
        const slowPush = interpolate(chapterProgress, [0, 1], [1.0, 1.022]);
        const SceneComp = SCENE_COMPONENTS[idx];

        return (
          <Sequence key={ch.slug} from={seqFrom} durationInFrames={seqDur} layout="none">
            <AbsoluteFill
              style={{
                opacity,
                transform: `scale(${(scale * slowPush).toFixed(4)})`,
                transformOrigin: '50% 44%',
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
// 3. LOWER VIGNETTE & PROGRESSIVE WORD-HIGHLIGHT CAPTION STAGE (ZERO NEON)
// ============================================================================

const CaptionStage: React.FC<{ sec: number; chapterIdx: number }> = ({ sec, chapterIdx }) => {
  const ch = CHAPTERS[chapterIdx];
  const active = getActiveCard(ch, sec);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 820,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(10, 11, 10, 0) 0%, rgba(10, 11, 10, 0.72) 38%, rgba(8, 9, 8, 0.96) 100%)',
        }}
      />

      {active && (
        <div
          style={{
            position: 'absolute',
            left: 108,
            right: 108,
            top: 1845,
            height: 440,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'baseline',
              columnGap: 18,
              rowGap: 12,
              maxWidth: 1180,
              textAlign: 'center',
              opacity: easeOutCubic(clamp01((sec - active.card.start) / 0.14)),
              transform: `translateY(${interpolate(
                easeOutCubic(clamp01((sec - active.card.start) / 0.16)),
                [0, 1],
                [14, 0],
              )}px)`,
            }}
          >
            {active.card.words.map(([word, wStart, wEnd], wIdx) => {
              const nextWordStart =
                wIdx + 1 < active.card.words.length
                  ? active.card.words[wIdx + 1][1]
                  : wEnd + 0.18;
              const isCurrent = sec >= wStart - 0.02 && sec < Math.max(wEnd, nextWordStart);
              const isSpoken = sec >= wStart - 0.02;

              const color = isCurrent
                ? IDENTITY.captionGold
                : isSpoken
                  ? IDENTITY.captionWhite
                  : IDENTITY.captionDim;

              return (
                <span
                  key={`${active.cardIndex}-${wIdx}`}
                  style={{
                    fontFamily: IDENTITY.fontBody,
                    fontSize: 66,
                    fontWeight: 800,
                    lineHeight: 1.24,
                    letterSpacing: '-0.02em',
                    color,
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.85)',
                    transform: isCurrent ? 'translateY(-2px)' : 'translateY(0px)',
                    display: 'inline-block',
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// 4. NAYSI DOCUMENTARY SERIES HUD (MATCHING SUARA TERKERAS & GPS BENCHMARKS)
// ============================================================================

const formatTimecode = (sec: number): string => {
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  const cs = Math.floor((sec % 1) * 100);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `T+${pad(mins)}:${pad(secs)}:${pad(cs)}`;
};

const StudioHud: React.FC<{ sec: number; chapterIdx: number }> = ({ sec, chapterIdx }) => {
  const ch = CHAPTERS[chapterIdx];
  const progressPct = clamp01(sec / VIDEO_SPEC.durationSec) * 100;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Top-Left Brand Mark */}
      <div
        style={{
          position: 'absolute',
          top: 82,
          left: 104,
          display: 'flex',
          alignItems: 'center',
          gap: 15,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 3,
            backgroundColor: IDENTITY.bullion24k,
          }}
        />
        <span
          style={{
            fontFamily: IDENTITY.fontBody,
            fontSize: 25,
            fontWeight: 800,
            letterSpacing: '0.24em',
            color: '#EAE5DA',
          }}
        >
          {VIDEO_SPEC.seriesLeft}
        </span>
      </div>

      {/* Top-Right Series Category & Live Documentary Timecode */}
      <div
        style={{
          position: 'absolute',
          top: 82,
          right: 104,
          textAlign: 'right',
        }}
      >
        <div
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: 21,
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: IDENTITY.hudMuted,
          }}
        >
          {VIDEO_SPEC.seriesRight}
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: IDENTITY.fontMono,
            fontSize: 16,
            fontWeight: 400,
            letterSpacing: '0.16em',
            color: 'rgba(183, 178, 166, 0.34)',
          }}
        >
          {formatTimecode(sec)} · {ch.code}
        </div>
      </div>

      {/* Bottom-Left Active Chapter Slug */}
      <div
        style={{
          position: 'absolute',
          bottom: 72,
          left: 104,
          fontFamily: IDENTITY.fontMono,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.16em',
          color: IDENTITY.hudMuted,
        }}
      >
        {ch.num} — {ch.hud}
      </div>

      {/* Bottom-Right 8 Chapter Dashes */}
      <div
        style={{
          position: 'absolute',
          bottom: 82,
          right: 104,
          display: 'flex',
          alignItems: 'center',
          gap: 11,
        }}
      >
        {CHAPTERS.map((item, idx) => {
          const isActive = idx === chapterIdx;
          const isPast = idx < chapterIdx;
          return (
            <div
              key={item.num}
              style={{
                width: isActive ? 28 : 17,
                height: 4,
                borderRadius: 2,
                backgroundColor: isActive
                  ? IDENTITY.bullion24k
                  : isPast
                    ? 'rgba(234, 229, 218, 0.44)'
                    : 'rgba(234, 229, 218, 0.16)',
              }}
            />
          );
        })}
      </div>

      {/* Bottom 6px Bullion Progress Strip */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            width: `${progressPct.toFixed(3)}%`,
            height: '100%',
            backgroundColor: IDENTITY.bullion24k,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// 5. ROOT NAYSI COMPOSITION (1440x2560 @ 90 FPS)
// ============================================================================

export const NaysiGoldShort: React.FC = () => {
  const fontsReady = useLocalFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sec = frame / fps;
  const chapterIdx = getActiveChapterIndex(sec);

  if (!fontsReady) {
    return <AbsoluteFill style={{ backgroundColor: '#0E0F0C' }} />;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#0E0F0C', overflow: 'hidden' }}>
      <Audio src={staticFile('audio/master.mp3')} />
      <FullBleedChapterStage />
      <CaptionStage sec={sec} chapterIdx={chapterIdx} />
      <StudioHud sec={sec} chapterIdx={chapterIdx} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={VIDEO_SPEC.id}
      component={NaysiGoldShort}
      durationInFrames={VIDEO_SPEC.durationInFrames}
      fps={VIDEO_SPEC.fps}
      width={VIDEO_SPEC.width}
      height={VIDEO_SPEC.height}
    />
  );
};

registerRoot(RemotionRoot);
export default RemotionRoot;
