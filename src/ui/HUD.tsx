import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { TL } from "../data";
import { clamp01, easeInOut, ramp } from "../lib";

export const useActiveScene = () => {
  const f = useCurrentFrame();
  return (
    TL.scenes.find(
      (s) => f >= s.startFrame && f < s.startFrame + s.durationInFrames,
    ) ?? TL.scenes[TL.scenes.length - 1]
  );
};

export const Wordmark: React.FC<{ size?: number; color?: string }> = ({
  size = 52,
  color = C.cream,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <span
      style={{
        fontFamily: F.display,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "0.07em",
        color,
      }}
    >
      NAYSI
    </span>
    <span
      style={{
        width: size * 0.18,
        height: size * 0.18,
        borderRadius: 99,
        background: C.orange,
        boxShadow: `0 0 ${size * 0.4}px ${C.orange}`,
      }}
    />
    <span
      style={{
        fontFamily: F.mono,
        fontSize: size * 0.4,
        letterSpacing: "0.38em",
        color: C.orange,
        transform: "translateY(2px)",
      }}
    >
      ATLAS
    </span>
  </div>
);

export const HUD: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scene = useActiveScene();
  const p = durationInFrames > 0 ? f / durationInFrames : 0;
  const appear = ramp(f, 8, 26);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: appear, pointerEvents: "none" }}>
      {/* top-left wordmark */}
      <div style={{ position: "absolute", left: 64, top: 58 }}>
        <Wordmark size={54} />
      </div>

      {/* top-right episode */}
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 74,
          fontFamily: F.mono,
          fontSize: 21,
          letterSpacing: "0.22em",
          color: C.cream,
          opacity: 0.45,
          textAlign: "right",
        }}
      >
        EP. 002 — POINT NEMO
      </div>

      {/* bottom chapter counter */}
      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: 118,
          display: "flex",
          alignItems: "baseline",
          gap: 18,
          fontFamily: F.mono,
        }}
      >
        <span style={{ fontSize: 26, color: C.orange, letterSpacing: "0.1em" }}>
          {String(scene.index).padStart(2, "0")}
        </span>
        <span style={{ fontSize: 22, color: C.cream, opacity: 0.35 }}>/ 09</span>
        <span
          style={{
            fontSize: 20,
            color: C.cream,
            opacity: 0.55,
            letterSpacing: "0.26em",
          }}
        >
          {scene.chapter}
        </span>
      </div>

      {/* progress bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 74 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 3,
            background: "rgba(239,230,212,0.13)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: -2,
            height: 7,
            width: `${p * 100}%`,
            background: C.orange,
            boxShadow: `0 0 18px ${C.orange}`,
          }}
        />
        {TL.scenes.map((s) => (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: `${(s.startFrame / TL.frames) * 100}%`,
              top: -9,
              width: 2,
              height: 18,
              background: C.cream,
              opacity: 0.3,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            right: 64,
            bottom: 16,
            fontFamily: F.mono,
            fontSize: 17,
            letterSpacing: "0.2em",
            color: C.cream,
            opacity: 0.28,
          }}
        >
          {`${String(Math.floor((p * TL.duration) / 60)).padStart(2, "0")}:${String(
            Math.floor((p * TL.duration) % 60),
          ).padStart(2, "0")}`}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Karaoke subtitles                                                   */
/* ------------------------------------------------------------------ */
import subtitles from "../subtitles.json";

type Word = { w: string; hi: boolean; st: number; en: number };

const parseLine = (line: string): { w: string; hi: boolean }[] => {
  const out: { w: string; hi: boolean }[] = [];
  const re = /\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const parts: { t: string; hi: boolean }[] = [];
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push({ t: line.slice(last, m.index), hi: false });
    parts.push({ t: m[1], hi: true });
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push({ t: line.slice(last), hi: false });
  for (const p of parts) {
    for (const w of p.t.split(/\s+/)) {
      if (w.trim().length) out.push({ w, hi: p.hi });
    }
  }
  return out;
};

const buildWords = (scene: {
  id: string;
  voStart: number;
  voEnd: number;
  start: number;
  lineStarts: number[];
  lineEnds: number[];
}): Word[] => {
  const lines = (subtitles as Record<string, string[]>)[scene.id] ?? [];
  const voStart = scene.voStart - scene.start;
  const words: Word[] = [];
  lines.forEach((line, li) => {
    const l0 = voStart + (scene.lineStarts?.[li] ?? 0);
    const l1 = voStart + (scene.lineEnds?.[li] ?? scene.voEnd - scene.voStart);
    const parts = parseLine(line);
    const total = parts.reduce((a, p) => a + p.w.length + 1.8, 0);
    let acc = 0;
    for (const p of parts) {
      const st = l0 + (acc / total) * (l1 - l0);
      acc += p.w.length + 1.8;
      const en = l0 + (acc / total) * (l1 - l0);
      words.push({ ...p, st, en });
    }
    words.push({ w: "\n", hi: false, st: l1, en: l1 });
  });
  return words;
};

export const Subtitle: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = useActiveScene();
  const local = (f - scene.startFrame) / fps;
  const voStart = scene.voStart - scene.start;
  const words = React.useMemo(() => buildWords(scene), [scene]);
  const t = local - voStart;
  const show =
    ramp(local, voStart - 0.25, 0.25) *
    (1 - ramp(local, scene.end - scene.start - 0.35, 0.35));

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        bottom: 300,
        opacity: show,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          textAlign: "center",
          fontFamily: F.sans,
          fontWeight: 700,
          fontSize: 50,
          lineHeight: 1.34,
          color: C.cream,
          textShadow: "0 3px 30px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.9)",
        }}
      >
        {words.map((word, i) => {
          if (word.w === "\n") return <br key={`br-${i}`} />;
          const a = clamp01((t - word.st) / 0.09);
          const spoken = a > 0.5;
          const col = word.hi && spoken ? C.orange : C.cream;
          return (
            <span
              key={i}
              style={{
                color: col,
                opacity: spoken ? 1 : 0.3,
                transform: `translateY(${spoken ? 0 : 5}px)`,
                display: "inline-block",
                marginRight: 13,
                whiteSpace: "pre",
              }}
            >
              {word.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Legibility gradient behind subtitles                                */
/* ------------------------------------------------------------------ */
export const SubtitleShade: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 760,
      background:
        "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0) 100%)",
      pointerEvents: "none",
    }}
  />
);
