import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CSSProperties } from "react";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0→1 progress of `f` across [start, start+dur] in frames. */
export const ramp = (f: number, start: number, dur: number) =>
  clamp01((f - start) / Math.max(1, dur));

export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const backOut = (x: number) => {
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** Deterministic pseudo random in [0,1). */
export const rand = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const useSpring = (
  delay = 0,
  cfg: { damping?: number; stiffness?: number; mass?: number } = {},
) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = spring({
    frame: f - delay,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 120, ...cfg },
  });
  return Math.max(0, v);
};

export const abs = (style: CSSProperties = {}): CSSProperties => ({
  position: "absolute",
  ...style,
});

export const centerText: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  textAlign: "center",
};
