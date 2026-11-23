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
import { abs, clamp01, easeOut, lerp, rand, ramp } from "./lib";

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
