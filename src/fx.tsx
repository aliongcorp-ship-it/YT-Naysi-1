import React, { useMemo } from "react";
import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CSSProperties, ReactNode } from "react";
import { C, F } from "./theme";
import { TL } from "./data";
import { abs, clamp01, easeInOut, easeOut, lerp, rand, ramp } from "./lib";

/* ------------------------------------------------------------------ */
/* Film grain                                                          */
/* ------------------------------------------------------------------ */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.045 }) => {
  const f = useCurrentFrame();
  const x = Math.floor(rand(f, 3) * 512);
  const y = Math.floor(rand(f, 7) * 512);
  return (
    <div
      style={{
        position: "absolute",
        left: -512,
        top: -512,
        width: 1440 + 1024,
        height: 2560 + 1024,
        backgroundImage: `url(${staticFile("tex/grain.png")})`,
        backgroundSize: "512px 512px",
        transform: `translate3d(${-x}px, ${-y}px, 0)`,
        opacity,
        pointerEvents: "none",
        willChange: "transform",
      }}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Vignette                                                            */
/* ------------------------------------------------------------------ */
export const Vignette: React.FC<{ strength?: number; color?: string }> = ({
  strength = 0.62,
  color = "0,0,0",
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse 75% 62% at 50% 44%, rgba(${color},0) 38%, rgba(${color},${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Floating dust                                                       */
/* ------------------------------------------------------------------ */
export const Dust: React.FC<{
  count?: number;
  color?: string;
  opacity?: number;
  speed?: number;
  seed?: number;
  size?: number;
}> = ({ count = 46, color = C.cream, opacity = 0.5, speed = 0.35, seed = 1, size = 1 }) => {
  const f = useCurrentFrame();
  const { height } = useVideoConfig();
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {Array.from({ length: count }, (_, i) => {
        const bx = rand(i + seed, 11) * 1440;
        const by = rand(i + seed, 23) * height;
        const s = (0.8 + rand(i + seed, 31) * 2.2) * size;
        const sp = speed * (0.4 + rand(i + seed, 41));
        const ph = rand(i + seed, 51) * Math.PI * 2;
        const y = ((by - f * sp) % (height + 80) + height + 80) % (height + 80);
        const x = bx + Math.sin(f * 0.012 + ph) * 34;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(f * 0.03 + ph));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: s,
              background: color,
              opacity: opacity * tw,
              boxShadow: i % 6 === 0 ? `0 0 ${s * 5}px ${color}` : "none",
            }}
          />
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Topographic contour backdrop                                        */
/* ------------------------------------------------------------------ */
export const Contours: React.FC<{ opacity?: number; color?: string; step?: number }> = ({
  opacity = 0.07,
  color = C.cream,
  step = 120,
}) => {
  const paths = useMemo(() => {
    const out: string[] = [];
    for (let k = 0; k < 18; k++) {
      const base = k * step - 200;
      let d = `M -100 ${base}`;
      for (let x = -100; x <= 1540; x += 64) {
        const y =
          base +
          Math.sin(x * 0.0042 + k * 1.7) * (36 + (k % 4) * 9) +
          Math.sin(x * 0.0131 + k * 0.6) * 13;
        d += ` L ${x} ${y.toFixed(1)}`;
      }
      out.push(d);
    }
    return out;
  }, [step]);
  return (
    <svg
      width={1440}
      height={2560}
      viewBox="0 0 1440 2560"
      style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={1} />
      ))}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Blueprint grid                                                      */
/* ------------------------------------------------------------------ */
export const Grid: React.FC<{ opacity?: number; size?: number; color?: string }> = ({
  opacity = 0.05,
  size = 72,
  color = C.cream,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity,
      backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
      maskImage:
        "radial-gradient(ellipse 70% 60% at 50% 45%, black 30%, transparent 80%)",
      WebkitMaskImage:
        "radial-gradient(ellipse 70% 60% at 50% 45%, black 30%, transparent 80%)",
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Text reveal                                                         */
/* ------------------------------------------------------------------ */
export const Reveal: React.FC<{
  delay: number;
  dur?: number;
  y?: number;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ delay, dur = 16, y = 60, style, children }) => {
  const f = useCurrentFrame();
  const t = easeOut(ramp(f, delay, dur));
  return (
    <div style={{ overflow: "hidden", ...style }}>
      <div style={{ transform: `translateY(${(1 - t) * y}px)`, opacity: t }}>
        {children}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Subtle camera push                                                  */
/* ------------------------------------------------------------------ */
export const Camera: React.FC<{
  children: ReactNode;
  zoom?: number;
  drift?: number;
  style?: CSSProperties;
}> = ({ children, zoom = 0.06, drift = 0, style }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = durationInFrames > 0 ? f / durationInFrames : 0;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${1 + zoom * p}) translateY(${drift * p}px)`,
        transformOrigin: "50% 50%",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Cut flash — hides the hard cut between scenes                       */
/* ------------------------------------------------------------------ */
export const CutFX: React.FC = () => {
  const f = useCurrentFrame();
  const boundaries = TL.scenes.slice(1).map((s) => s.startFrame);
  let best: number | null = null;
  for (const b of boundaries) {
    if (f >= b - 1 && f <= b + 10) best = b;
  }
  if (best === null) return null;
  const t = clamp01((f - best) / 10);
  const sweep = lerp(-700, 1600, easeOut(t));
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: sweep,
          width: 420,
          background:
            "linear-gradient(90deg, rgba(255,90,31,0) 0%, rgba(255,90,31,0.16) 45%, rgba(239,230,212,0.5) 50%, rgba(255,90,31,0.16) 55%, rgba(255,90,31,0) 100%)",
          transform: "skewX(-16deg)",
          opacity: 1 - t,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: C.cream,
          opacity: 0.16 * (1 - t) * (1 - t),
        }}
      />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Small corner bracket                                                */
/* ------------------------------------------------------------------ */
export const Bracket: React.FC<{
  size?: number;
  color?: string;
  thickness?: number;
  style?: CSSProperties;
}> = ({ size = 34, color = C.orange, thickness = 3, style }) => (
  <div style={{ position: "absolute", width: size, height: size, ...style }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: size, height: thickness, background: color }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: thickness, height: size, background: color }} />
  </div>
);

/* ------------------------------------------------------------------ */
/* Crosshair reticle                                                   */
/* ------------------------------------------------------------------ */
export const Reticle: React.FC<{
  x: number;
  y: number;
  size?: number;
  color?: string;
  progress?: number;
  thickness?: number;
}> = ({ x, y, size = 60, color = C.orange, progress = 1, thickness = 2 }) => {
  const s = size * progress;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", left: -s, top: -thickness / 2, width: s * 2, height: thickness, background: color, opacity: 0.75 }} />
      <div style={{ position: "absolute", left: -thickness / 2, top: -s, width: thickness, height: s * 2, background: color, opacity: 0.75 }} />
      <div style={{ position: "absolute", left: -3, top: -3, width: 6, height: 6, borderRadius: 6, background: color }} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Static paper texture                                                */
/* ------------------------------------------------------------------ */
export const Paper: React.FC<{ opacity?: number }> = ({ opacity = 0.5 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `url(${staticFile("tex/paper.png")})`,
      backgroundSize: "420px 420px",
      opacity,
      mixBlendMode: "multiply",
      pointerEvents: "none",
    }}
  />
);

/* ================================================================== */
/* 2.0 — editorial toolkit                                            */
/* ================================================================== */

/* Baked atmospheric plate with a slow push. Static image + transform, so
   the compositor never has to re-rasterise the expensive part. */
export const Backdrop: React.FC<{
  tex: string;
  scale?: number;
  drift?: number;
  dim?: number;
  rotate?: number;
}> = ({ tex, scale = 1.06, drift = 18, dim = 0, rotate = 0 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = durationInFrames > 0 ? f / durationInFrames : 0;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Img
        src={staticFile(tex)}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1440 * (scale + p * 0.04),
          height: 2560 * (scale + p * 0.04),
          transform: `translate(-50%, -50%) translateY(${-drift * p}px) rotate(${rotate}deg)`,
          opacity: 1 - dim,
        }}
      />
    </div>
  );
};

/* Drifting star layer — a separate plate at a different speed sells depth. */
export const StarDrift: React.FC<{ opacity?: number; speed?: number }> = ({
  opacity = 0.7,
  speed = 26,
}) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = durationInFrames > 0 ? f / durationInFrames : 0;
  return (
    <Img
      src={staticFile("tex/stars.png")}
      style={{
        position: "absolute",
        inset: -120,
        width: 1680,
        height: 2800,
        transform: `translateY(${-speed * p}px)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

/* Glass panel — the "UI object" look: frosted fill, hairline border,
   inner top highlight, four hex screws. */
export const GlassCard: React.FC<{
  style?: CSSProperties;
  children?: ReactNode;
  glow?: string;
}> = ({ style, children, glow = "rgba(143,220,239,0.10)" }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: 22,
      background:
        "linear-gradient(158deg, rgba(20,44,58,0.82) 0%, rgba(8,20,28,0.86) 58%, rgba(6,14,20,0.9) 100%)",
      border: "1px solid rgba(160,215,235,0.20)",
      boxShadow: `0 1px 0 rgba(210,245,255,0.14) inset, 0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4), 0 0 90px ${glow}`,
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 22,
        background:
          "linear-gradient(180deg, rgba(190,235,255,0.10) 0%, rgba(190,235,255,0) 26%)",
        pointerEvents: "none",
      }}
    />
    <Screw x={16} y={16} />
    <Screw x={"calc(100% - 26px)" as unknown as number} y={16} />
    <Screw x={16} y={"calc(100% - 26px)" as unknown as number} />
    <Screw x={"calc(100% - 26px)" as unknown as number} y={"calc(100% - 26px)" as unknown as number} />
    {children}
  </div>
);

export const Screw: React.FC<{ x: number | string; y: number | string }> = ({ x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 10,
      height: 10,
      borderRadius: 5,
      background:
        "radial-gradient(circle at 34% 30%, #DCEEF6 0%, #7C93A0 42%, #2A3A45 100%)",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.6)",
      opacity: 0.75,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 2,
        top: 4.5,
        width: 6,
        height: 1,
        background: "rgba(0,0,0,0.55)",
        transform: "rotate(38deg)",
      }}
    />
  </div>
);

/* Anamorphic horizontal flare — the "cinematic lens" tell. */
export const Flare: React.FC<{
  x: number;
  y: number;
  width?: number;
  color?: string;
  opacity?: number;
}> = ({ x, y, width = 700, color = "190,230,255", opacity = 0.5 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
    <div
      style={{
        position: "absolute",
        left: -width / 2,
        top: -1.5,
        width,
        height: 3,
        background: `linear-gradient(90deg, rgba(${color},0) 0%, rgba(${color},0.85) 48%, rgba(255,255,255,0.95) 50%, rgba(${color},0.85) 52%, rgba(${color},0) 100%)`,
        opacity,
        filter: "blur(1px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -width / 2,
        top: -26,
        width,
        height: 52,
        background: `radial-gradient(ellipse at center, rgba(${color},0.55) 0%, rgba(${color},0) 70%)`,
        opacity: opacity * 0.7,
      }}
    />
  </div>
);

/* Warm light sweep across the frame — sells a cut or a reveal. */
export const LightLeak: React.FC<{
  start: number;
  dur?: number;
  dir?: 1 | -1;
  color?: string;
  opacity?: number;
}> = ({ start, dur = 26, dir = 1, color = "255,176,58", opacity = 0.5 }) => {
  const f = useCurrentFrame();
  const t = ramp(f, start, dur);
  if (t <= 0 || t >= 1) return null;
  const e = easeInOut(t);
  const x = dir > 0 ? lerp(-900, 2100, e) : lerp(2100, -900, e);
  return (
    <div
      style={{
        position: "absolute",
        top: -200,
        bottom: -200,
        left: x,
        width: 520,
        background: `linear-gradient(90deg, rgba(${color},0) 0%, rgba(${color},0.42) 46%, rgba(255,255,255,0.65) 50%, rgba(${color},0.42) 54%, rgba(${color},0) 100%)`,
        transform: "skewX(-14deg)",
        mixBlendMode: "screen",
        opacity: opacity * Math.sin(t * Math.PI),
        pointerEvents: "none",
      }}
    />
  );
};

/* Short white-hot impact flash. */
export const Flash: React.FC<{ at: number; dur?: number; peak?: number }> = ({
  at,
  dur = 12,
  peak = 0.85,
}) => {
  const f = useCurrentFrame();
  const t = ramp(f, at, dur);
  if (t <= 0 || t >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at 50% 46%, rgba(255,246,230,0.95) 0%, rgba(255,200,140,0.35) 38%, rgba(255,176,58,0) 72%)",
        opacity: peak * Math.pow(1 - t, 2.2),
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

/* Faint scanline structure over the whole frame. */
export const Scanlines: React.FC<{ opacity?: number; gap?: number }> = ({
  opacity = 0.05,
  gap = 4,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `repeating-linear-gradient(180deg, rgba(0,0,0,${opacity}) 0px, rgba(0,0,0,${opacity}) 1px, transparent 1px, transparent ${gap}px)`,
      pointerEvents: "none",
      mixBlendMode: "multiply",
    }}
  />
);

/* Radial sonar rings — the recurring "listening" motif. */
export const SonarRings: React.FC<{
  x: number;
  y: number;
  count?: number;
  maxR?: number;
  color?: string;
  speed?: number;
  thickness?: number;
}> = ({ x, y, count = 4, maxR = 420, color = "143,220,239", speed = 78, thickness = 2 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      {Array.from({ length: count }, (_, i) => {
        const p = ((f - i * (speed / count)) % speed + speed) % speed / speed;
        const r = 24 + maxR * easeOut(p);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -r,
              top: -r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `${thickness}px solid rgba(${color},${0.5 * (1 - p)})`,
              boxShadow: `0 0 18px rgba(${color},${0.25 * (1 - p)})`,
            }}
          />
        );
      })}
    </div>
  );
};

/* Chunky tick ruler used to state a distance as a physical object. */
export const Ruler: React.FC<{
  width: number;
  ticks?: number;
  height?: number;
  color?: string;
  progress?: number;
  style?: CSSProperties;
}> = ({
  width,
  ticks = 40,
  height = 34,
  color = C.cream,
  progress = 1,
  style,
}) => {
  const w = width * progress;
  return (
    <div style={{ position: "absolute", width, height, ...style }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: w,
          height: 2,
          background: color,
          boxShadow: `0 0 16px rgba(233,240,244,0.5)`,
        }}
      />
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const px = (i / ticks) * width;
        if (px > w) return null;
        const major = i % 5 === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: 0,
              width: major ? 2 : 1,
              height: major ? height : height * 0.5,
              background: color,
              opacity: major ? 0.95 : 0.45,
            }}
          />
        );
      })}
    </div>
  );
};

/* Thin circular "orbit" path with a travelling highlight. */
export const Orbit: React.FC<{
  size: number;
  color?: string;
  opacity?: number;
  tilt?: number;
  progress?: number;
}> = ({ size, color = "143,220,239", opacity = 0.5, tilt = -16, progress = 1 }) => {
  const f = useCurrentFrame();
  const a = (f / 90) * 40;
  return (
    <div
      style={{
        position: "absolute",
        left: -size / 2,
        top: -size / 2,
        width: size,
        height: size * 0.36,
        borderRadius: "50%",
        border: `1px solid rgba(${color},${opacity * 0.5})`,
        transform: `rotate(${tilftFix(tilt)}deg)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: size * progress,
          height: size * 0.36 * progress,
          marginLeft: (-size * progress) / 2,
          marginTop: (-size * 0.36 * progress) / 2,
          borderRadius: "50%",
          border: `2px solid rgba(${color},${opacity})`,
          borderTopColor: "transparent",
          borderLeftColor: "transparent",
          transform: `rotate(${a}deg)`,
        }}
      />
    </div>
  );
};
const tilftFix = (n: number) => n;

/* Word-by-word entrance — the "editor" tell on a hero line. */
export const Words: React.FC<{
  text: string;
  at?: number;
  stagger?: number;
  dur?: number;
  y?: number;
  style?: CSSProperties;
}> = ({ text, at = 0, stagger = 7, dur = 18, y = 46, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", ...style }}>
      {text.split(" ").map((w, i) => {
        const t = easeOut(ramp(f, at + i * stagger, dur));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${(1 - t) * y}px)`,
              opacity: t,
              marginRight: "0.26em",
              filter: `blur(${(1 - t) * 6}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Technical frame — the drafting-table container used by the          */
/* reference: hairline box, corner ticks, optional mono label.         */
/* ------------------------------------------------------------------ */
export const Frame: React.FC<{
  style?: CSSProperties;
  children?: ReactNode;
  label?: string;
  progress?: number;
  color?: string;
  radius?: number;
}> = ({ style, children, label, progress = 1, color = "rgba(160,215,235,0.30)", radius = 18 }) => {
  const p = clamp01(progress);
  const tick = 26;
  return (
    <div
      style={{
        position: "absolute",
        borderRadius: radius,
        border: `1px solid ${color}`,
        background:
          "linear-gradient(160deg, rgba(18,42,56,0.42) 0%, rgba(8,20,28,0.5) 60%, rgba(5,12,18,0.55) 100%)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(200,240,255,0.10)",
        opacity: p,
        ...style,
      }}
    >
      {([
        { pos: { left: -1, top: -1 }, rot: 0 },
        { pos: { right: -1, top: -1 }, rot: 90 },
        { pos: { right: -1, bottom: -1 }, rot: 180 },
        { pos: { left: -1, bottom: -1 }, rot: 270 },
      ] as { pos: CSSProperties; rot: number }[]).map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: tick,
            height: tick,
            ...c.pos,
            transform: `rotate(${c.rot}deg)`,
            transformOrigin: "center",
          }}
        >
          <div style={{ position: "absolute", left: 0, top: 0, width: tick, height: 2, background: C.orange }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: 2, height: tick, background: C.orange }} />
        </div>
      ))}
      {label ? (
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 24,
            fontFamily: F.mono,
            fontSize: 19,
            letterSpacing: "0.3em",
            color: C.cyan,
            opacity: 0.9,
          }}
        >
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Stat chip — value, unit, micro label                                */
/* ------------------------------------------------------------------ */
export const Chip: React.FC<{
  value: string;
  unit?: string;
  label?: string;
  color?: string;
  size?: number;
  align?: "left" | "center";
  style?: CSSProperties;
}> = ({ value, unit, label, color = C.cream, size = 96, align = "left", style }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
      <span
        style={{
          fontFamily: F.display,
          fontSize: size,
          lineHeight: 0.9,
          color,
          letterSpacing: "0.01em",
          textShadow: "0 10px 50px rgba(0,0,0,0.8)",
        }}
      >
        {value}
      </span>
      {unit ? (
        <span
          style={{
            fontFamily: F.mono,
            fontSize: size * 0.28,
            letterSpacing: "0.16em",
            color: C.creamDim,
          }}
        >
          {unit}
        </span>
      ) : null}
    </div>
    {label ? (
      <div
        style={{
          marginTop: 14,
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.26em",
          color: C.creamDim,
        }}
      >
        {label}
      </div>
    ) : null}
  </div>
);

/* ------------------------------------------------------------------ */
/* Scan line — a single bright row that sweeps down the frame          */
/* ------------------------------------------------------------------ */
export const Scan: React.FC<{
  y: number;
  height?: number;
  color?: string;
  opacity?: number;
}> = ({ y, height = 260, color = "143,220,239", opacity = 0.22 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y - height / 2,
      height,
      background: `linear-gradient(180deg, rgba(${color},0) 0%, rgba(${color},${opacity * 0.5}) 46%, rgba(${color},${opacity}) 50%, rgba(${color},${opacity * 0.5}) 54%, rgba(${color},0) 100%)`,
      mixBlendMode: "screen",
      pointerEvents: "none",
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Crosshair — degree ring + tick marks, centred on a point            */
/* ------------------------------------------------------------------ */
export const Crosshair: React.FC<{
  x: number;
  y: number;
  r?: number;
  progress?: number;
  color?: string;
  ticks?: number;
}> = ({ x, y, r = 220, progress = 1, color = "rgba(143,220,239,0.5)", ticks = 36 }) => {
  const p = clamp01(progress);
  return (
    <svg width={1440} height={2560} style={{ position: "absolute", left: 0, top: 0, opacity: p }}>
      <circle cx={x} cy={y} r={r * p} fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 7" />
      <circle cx={x} cy={y} r={r * 0.62 * p} fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
      {Array.from({ length: ticks }, (_, i) => {
        const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
        const long = i % 9 === 0;
        const r1 = r * (long ? 0.94 : 0.97) * p;
        const r2 = r * p;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * r1}
            y1={y + Math.sin(a) * r1}
            x2={x + Math.cos(a) * r2}
            y2={y + Math.sin(a) * r2}
            stroke={color}
            strokeWidth={long ? 2 : 1}
          />
        );
      })}
    </svg>
  );
};
