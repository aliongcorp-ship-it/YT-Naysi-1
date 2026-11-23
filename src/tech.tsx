import React from "react";
import { evolvePath } from "@remotion/paths";
import { makeCallout } from "@remotion/shapes";
import { useCurrentFrame } from "remotion";
import { C } from "./theme";
import { clamp01, easeOut, ramp } from "./lib";

/* ------------------------------------------------------------------ */
/* Technical-annotation kit.                                            */
/* Dimension lines, leader callouts and scale bars — the drawing        */
/* conventions of a technical illustration, used sparingly so the film  */
/* still reads as objects rather than diagrams.                        */
/* ------------------------------------------------------------------ */

/** A path that draws itself on. */
export const DrawOn: React.FC<{
  d: string;
  progress: number;
  stroke?: string;
  width?: number;
  dash?: string;
  glow?: string;
  style?: React.CSSProperties;
}> = ({ d, progress, stroke = C.cyan, width = 2, dash, glow, style }) => {
  const ev = evolvePath(clamp01(progress), d);
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeDasharray={dash ?? ev.strokeDasharray}
      strokeDashoffset={dash ? undefined : ev.strokeDashoffset}
      strokeLinecap="round"
      style={glow ? { filter: `drop-shadow(0 0 8px ${glow})`, ...style } : style}
    />
  );
};

/** Horizontal dimension line with end ticks and a centred label. */
export const DimLine: React.FC<{
  x1: number;
  x2: number;
  y: number;
  label: string;
  progress?: number;
  color?: string;
  labelColor?: string;
  size?: number;
}> = ({
  x1,
  x2,
  y,
  label,
  progress = 1,
  color = "rgba(233,240,244,0.7)",
  labelColor = C.cream,
  size = 26,
}) => {
  const p = easeOut(progress);
  const mid = (x1 + x2) / 2;
  return (
    <g opacity={p}>
      <line x1={x1} y1={y} x2={x1 + (x2 - x1) * p} y2={y} stroke={color} strokeWidth={1.6} />
      <line x1={x1} y1={y - 16} x2={x1} y2={y + 16} stroke={color} strokeWidth={1.6} />
      <line x1={x2} y1={y - 16} x2={x2} y2={y + 16} stroke={color} strokeWidth={1.6} />
      <rect x={mid - 120} y={y - size} width={240} height={size * 1.7} fill="rgba(3,7,11,0.86)" rx={6} />
      <text
        x={mid}
        y={y + size * 0.28}
        textAnchor="middle"
        fill={labelColor}
        style={{ font: `600 ${size}px "Plus Jakarta Sans", sans-serif` }}
      >
        {label}
      </text>
    </g>
  );
};

/** Callout bubble with a leader line down to a point. */
export const Leader: React.FC<{
  x: number;
  y: number;
  toX: number;
  toY: number;
  label: string;
  sub?: string;
  progress?: number;
  width?: number;
  color?: string;
}> = ({
  x,
  y,
  toX,
  toY,
  label,
  sub,
  progress = 1,
  width = 420,
  color = C.cyan,
}) => {
  const p = easeOut(progress);
  const h = sub ? 132 : 104;
  const shape = makeCallout({
    width,
    height: h,
    pointerLength: 26,
    pointerBaseWidth: 34,
    pointerPosition: 0.5,
    pointerDirection: "down",
    cornerRadius: 14,
  });
  const left = x - width / 2;
  const top = y - h - 26;
  const lineX = x;
  const lineY = y;
  return (
    <g opacity={p}>
      <line
        x1={lineX}
        y1={lineY}
        x2={toX}
        y2={toY}
        stroke={color}
        strokeWidth={1.6}
        opacity={0.7}
        strokeDasharray="7 7"
      />
      <circle cx={toX} cy={toY} r={5} fill="none" stroke={color} strokeWidth={1.6} opacity={0.9} />
      <circle cx={toX} cy={toY} r={2} fill={color} opacity={0.9} />
      <g transform={`translate(${left} ${top})`}>
        <path
          d={shape.path}
          fill="rgba(6,16,24,0.9)"
          stroke="rgba(143,220,239,0.45)"
          strokeWidth={1.4}
        />
      </g>
      <text
        x={x}
        y={y - h - 26 + 46}
        textAnchor="middle"
        fill={C.cream}
        style={{ font: `700 ${30}px "Plus Jakarta Sans", sans-serif` }}
      >
        {label}
      </text>
      {sub ? (
        <text
          x={x}
          y={y - h - 26 + 88}
          textAnchor="middle"
          fill={C.creamDim}
          style={{ font: `500 21px "JetBrains Mono", monospace`, letterSpacing: "0.16em" }}
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
};

/** Map scale bar — alternating segments with distance labels. */
export const ScaleBar: React.FC<{
  x: number;
  y: number;
  segments?: number;
  segWidth?: number;
  perSegment: string;
  progress?: number;
}> = ({ x, y, segments = 4, segWidth = 150, perSegment, progress = 1 }) => {
  const p = easeOut(progress);
  return (
    <g opacity={p}>
      {Array.from({ length: segments }, (_, i) => (
        <rect
          key={i}
          x={x + i * segWidth}
          y={y}
          width={segWidth}
          height={12}
          fill={i % 2 === 0 ? "rgba(233,240,244,0.85)" : "rgba(233,240,244,0.18)"}
          stroke="rgba(233,240,244,0.5)"
          strokeWidth={1}
        />
      ))}
      <text
        x={x}
        y={y - 18}
        fill={C.creamDim}
        style={{ font: `500 22px "JetBrains Mono", monospace`, letterSpacing: "0.14em" }}
      >
        0
      </text>
      <text
        x={x + segments * segWidth}
        y={y - 18}
        textAnchor="end"
        fill={C.creamDim}
        style={{ font: `500 22px "JetBrains Mono", monospace`, letterSpacing: "0.14em" }}
      >
        {perSegment}
      </text>
    </g>
  );
};

/** Vertical depth ruler for a water-column cross-section. */
export const DepthTicks: React.FC<{
  x: number;
  top: number;
  bottom: number;
  maxDepth: number;
  steps?: number;
  progress?: number;
  unit?: string;
}> = ({ x, top, bottom, maxDepth, steps = 8, progress = 1, unit = "M" }) => {
  const p = easeOut(progress);
  return (
    <g opacity={p}>
      <line
        x1={x}
        y1={top}
        x2={x}
        y2={top + (bottom - top) * p}
        stroke="rgba(143,220,239,0.35)"
        strokeWidth={1.4}
      />
      {Array.from({ length: steps + 1 }, (_, i) => {
        const t = i / steps;
        const y = top + (bottom - top) * t;
        const major = i % 2 === 0;
        return (
          <g key={i} opacity={t <= p ? 1 : 0}>
            <line
              x1={x - (major ? 20 : 11)}
              y1={y}
              x2={x}
              y2={y}
              stroke="rgba(233,240,244,0.6)"
              strokeWidth={major ? 2 : 1}
            />
            {major ? (
              <text
                x={x - 30}
                y={y + 8}
                textAnchor="end"
                fill={C.creamDim}
                style={{ font: `500 21px "JetBrains Mono", monospace` }}
              >
                {`${Math.round((t * maxDepth) / 100) * 100}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                {unit}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

/** Animated leader line that grows from a point towards a label. */
export const GrowLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  color?: string;
  dash?: string;
}> = ({ x1, y1, x2, y2, progress, color = "rgba(143,220,239,0.8)", dash = "6 8" }) => {
  const p = easeOut(progress);
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x1 + (x2 - x1) * p}
      y2={y1 + (y2 - y1) * p}
      stroke={color}
      strokeWidth={1.6}
      strokeDasharray={dash}
    />
  );
};

/** Hook sugar: progress across the current scene. */
export const useSceneT = (start: number, dur: number) => {
  const f = useCurrentFrame();
  return ramp(f, start, dur);
};

/* ------------------------------------------------------------------ */
/* Beat sync — resolve the frame at which a spoken word starts, so     */
/* numbers, bars and reveals land on the narrator's voice instead of   */
/* on an arbitrary offset.                                             */
/* ------------------------------------------------------------------ */
import captions from "./captions.json";
import { TL } from "./data";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export const wordFrame = (sceneId: string, word: string, offset = 0): number => {
  const sc = TL.scenes.find((s) => s.id === sceneId);
  const pre = sc ? sc.voStart - sc.start : 0.22;
  const list = (captions as Record<string, { w: string; st: number }[]>)[sceneId] ?? [];
  const target = norm(word);
  const hit = list.find((x) => norm(x.w).startsWith(target));
  const t = (hit ? hit.st : 0) + pre;
  return Math.max(0, Math.round(t * TL.fps) + offset);
};
