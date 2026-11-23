import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, CAP, F } from "../theme";
import { TL } from "../data";
import { clamp01, ramp } from "../lib";
import captions from "../captions.json";
import subtitles from "../subtitles.json";

/* ------------------------------------------------------------------ */
/* Scene helper                                                        */
/* ------------------------------------------------------------------ */
export const useActiveScene = () => {
  const f = useCurrentFrame();
  return (
    TL.scenes.find(
      (s) => f >= s.startFrame && f < s.startFrame + s.durationInFrames,
    ) ?? TL.scenes[TL.scenes.length - 1]
  );
};

/* ------------------------------------------------------------------ */
/* Chrome — matches the reference: dot + wordmark top-left, the        */
/* category top-right, chapter counter bottom-left, a dashed scene     */
/* progress bottom-right and a full-bleed orange bar on the bottom     */
/* edge.                                                               */
/* ------------------------------------------------------------------ */
const CATEGORY = "GEOGRAFI";

export const HUD: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scene = useActiveScene();
  const p = durationInFrames > 0 ? f / durationInFrames : 0;
  const appear = ramp(f, 6, 22);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: appear, pointerEvents: "none" }}>
      {/* top-left wordmark */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 84,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <span
          style={{
            width: 17,
            height: 17,
            borderRadius: 3,
            background: C.orange,
            boxShadow: `0 0 18px ${C.orange}`,
          }}
        />
        <span
          style={{
            fontFamily: F.caption,
            fontWeight: 800,
            fontSize: 27,
            lineHeight: 1,
            letterSpacing: "0.34em",
            color: C.cream,
          }}
        >
          NAYSI
        </span>
      </div>

      {/* top-right category */}
      <div
        style={{
          position: "absolute",
          right: 104,
          top: 90,
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 20,
          lineHeight: 1,
          letterSpacing: "0.2em",
          color: C.cream,
          opacity: 0.55,
        }}
      >
        {`NAYSI · ${CATEGORY}`}
      </div>

      {/* bottom chapter counter */}
      <div
        style={{
          position: "absolute",
          left: 104,
          bottom: 88,
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          fontFamily: F.mono,
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 700, color: C.orange, letterSpacing: "0.1em" }}>
          {String(scene.index).padStart(2, "0")}
        </span>
        <span style={{ fontSize: 22, color: C.cream, opacity: 0.32 }}>—</span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: C.cream,
            opacity: 0.72,
            letterSpacing: "0.18em",
          }}
        >
          {scene.chapter}
        </span>
      </div>

      {/* dashed scene progress */}
      <div
        style={{
          position: "absolute",
          right: 104,
          bottom: 96,
          display: "flex",
          gap: 12,
        }}
      >
        {TL.scenes.map((s, i) => {
          const done = i < scene.index - 1;
          const live = i === scene.index - 1;
          return (
            <span
              key={s.id}
              style={{
                width: 22,
                height: 6,
                borderRadius: 3,
                background: live ? C.orange : done ? "rgba(233,240,244,0.55)" : "rgba(233,240,244,0.18)",
                boxShadow: live ? `0 0 14px ${C.orange}` : undefined,
              }}
            />
          );
        })}
      </div>

      {/* bottom progress bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 8 }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(239,230,212,0.10)" }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${p * 100}%`,
            background: C.orange,
            boxShadow: `0 0 22px ${C.orange}`,
          }}
        />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Caption                                                             */
/* Word timings come from src/captions.json, which is aligned to the   */
/* narrator's actual breaths (scripts/align-captions.mjs). One         */
/* subtitle sentence is on screen at a time, chunked to the caption    */
/* measure, with unspoken words held at 34% and the marked key phrase  */
/* burning amber.                                                      */
/* ------------------------------------------------------------------ */
type CWord = { w: string; hi: boolean; st: number; en: number };

const MEASURE = 29;

const countWords = (line: string) => line.replace(/\*/g, "").split(/\s+/).filter(Boolean).length;

/** index ranges of each authored sentence inside the flat word list */
const blockRanges = (id: string, total: number) => {
  const lines = (subtitles as Record<string, string[]>)[id] ?? [];
  const out: [number, number][] = [];
  let i = 0;
  for (const line of lines) {
    const n = countWords(line);
    if (i >= total) break;
    out.push([i, Math.min(total, i + n)]);
    i += n;
  }
  if (i < total) out.push([i, total]);
  return out;
};

const chunk = (words: CWord[], maxChars = MEASURE): CWord[][] => {
  const lines: CWord[][] = [];
  let cur: CWord[] = [];
  let len = 0;
  for (const w of words) {
    const add = w.w.length + (cur.length ? 1 : 0);
    if (cur.length && len + add > maxChars) {
      lines.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(w);
    len += w.w.length + 1;
  }
  if (cur.length) lines.push(cur);
  return lines;
};

export const Subtitle: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = useActiveScene();
  const local = (f - scene.startFrame) / fps;
  const t = local - (scene.voStart - scene.start);

  const words = (captions as Record<string, CWord[]>)[scene.id] ?? [];
  const ranges = React.useMemo(() => blockRanges(scene.id, words.length), [scene.id, words.length]);

  // which sentence is being spoken
  let bi = 0;
  for (let i = 0; i < ranges.length; i++) {
    const [a] = ranges[i];
    if (words[a] && t >= words[a].st - 0.05) bi = i;
  }
  const [a, b] = ranges[bi] ?? [0, words.length];
  const block = words.slice(a, b);
  const blockStart = block.length ? block[0].st : 0;
  const nextStart = ranges[bi + 1] ? words[ranges[bi + 1][0]]?.st ?? blockStart + 2 : Infinity;

  const show =
    ramp(t, blockStart - 0.22, 0.2) *
    (1 - ramp(t, Math.min(nextStart - 0.1, block[block.length - 1]?.en ?? blockStart) + 0.55, 0.25));

  const lines = React.useMemo(() => chunk(block), [block]);

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 424,
        opacity: clamp01(show),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1310,
          textAlign: "center",
          fontFamily: F.caption,
          fontWeight: 800,
          fontSize: 74,
          lineHeight: 1.32,
          letterSpacing: "-0.012em",
          color: CAP.spoken,
          textShadow: "0 6px 40px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7)",
        }}
      >
        {lines.map((line, li) => (
          <div key={li} style={{ display: "block", whiteSpace: "nowrap" }}>
            {line.map((word, wi) => {
              const spoken = t >= word.st;
              const hot = word.hi && spoken;
              return (
                <span
                  key={wi}
                  style={{
                    color: hot ? CAP.hot : CAP.spoken,
                    opacity: spoken ? 1 : 0.34,
                    display: "inline-block",
                    marginRight: "0.235em",
                    textShadow: hot
                      ? `0 0 36px ${CAP.hotGlow}, 0 0 12px ${CAP.hotGlow}, 0 6px 40px rgba(0,0,0,0.9)`
                      : undefined,
                  }}
                >
                  {word.w}
                </span>
              );
            })}
          </div>
        ))}
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
      height: 700,
      background:
        "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.42) 42%, rgba(0,0,0,0) 100%)",
      pointerEvents: "none",
    }}
  />
);
