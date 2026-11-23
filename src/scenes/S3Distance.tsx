import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, lerp, ramp } from "../lib";
import {
  Backdrop,
  GlassCard,
  Grain,
  LightLeak,
  Ruler,
  SonarRings,
  StarDrift,
  Vignette,
} from "../fx";
import { DepthPin, Island } from "../objects";

/**
 * 03 — DISTANCE
 * The number is shown as a physical measurement: a ruler spanning the frame
 * between three real islands, with the distance counting up.
 */
export const S3Distance: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const rulerP = easeOut(ramp(f, 40, 46));
  const count = Math.round(2688 * easeOut(ramp(f, 60, 60)));
  const leftIn = easeOut(ramp(f, 10, 22));
  const rightIn = easeOut(ramp(f, 70, 22));
  const labelIn = easeOut(ramp(f, 130, 24));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/water.png" scale={1.14} drift={30} dim={0.25} />
      <StarDrift opacity={0.14} speed={12} />

      {/* the three equidistant islands, labelled */}
      <div style={{ opacity: leftIn }}>
        <div style={{ position: "absolute", left: 120, top: 700 }}>
          <Island width={300} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 150,
            top: 636,
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: "0.28em",
            color: C.creamDim,
          }}
        >
          PULAU DUCIE
        </div>
      </div>

      <div style={{ opacity: rightIn }}>
        <div style={{ position: "absolute", left: 1020, top: 700 }}>
          <Island width={300} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 1050,
            top: 636,
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: "0.28em",
            color: C.creamDim,
          }}
        >
          MOTU NUI
        </div>
      </div>

      {/* Point Nemo pin in the middle of the water */}
      <div style={{ position: "absolute", left: 720 - 24, top: 812, opacity: leftIn }}>
        <DepthPin size={48} color={C.orange} />
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 4,
            fontFamily: F.mono,
            fontSize: 20,
            letterSpacing: "0.26em",
            color: C.orange,
            whiteSpace: "nowrap",
          }}
        >
          POINT NEMO
        </div>
      </div>

      {/* dashed geodesic between the islands */}
      <svg width={1440} height={900} style={{ position: "absolute", left: 0, top: 520 }}>
        <path
          d="M210 760 Q 720 560 1230 760"
          fill="none"
          stroke="rgba(143,220,239,0.45)"
          strokeWidth="2"
          strokeDasharray="10 12"
          strokeDashoffset={-f * 1.6}
        />
      </svg>

      <div style={{ opacity: leftIn * 0.9 }}>
        <SonarRings x={720} y={860} count={3} maxR={360} speed={110} color="255,176,58" />
      </div>

      {/* the measurement */}
      <div style={{ position: "absolute", left: 160, top: 1120 }}>
        <Ruler width={1120} ticks={54} height={44} progress={rulerP} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 52,
            fontFamily: F.mono,
            fontSize: 18,
            letterSpacing: "0.2em",
            color: C.creamDim,
            whiteSpace: "nowrap",
          }}
        >
          0
        </div>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 52,
            fontFamily: F.mono,
            fontSize: 18,
            letterSpacing: "0.2em",
            color: C.creamDim,
            whiteSpace: "nowrap",
          }}
        >
          2.688 KM
        </div>
      </div>

      {/* counter */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1290,
          textAlign: "center",
          opacity: easeOut(ramp(f, 55, 20)),
        }}
      >
        <div
          style={{
            fontFamily: F.display,
            fontSize: 340,
            lineHeight: 0.9,
            color: C.cream,
            letterSpacing: "0.01em",
            textShadow: "0 14px 80px rgba(0,0,0,0.9)",
          }}
        >
          {count.toLocaleString("id-ID")}
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 30,
            letterSpacing: "0.5em",
            color: C.orange,
            marginTop: 6,
          }}
        >
          KILOMETER
        </div>
      </div>

      {/* glass stat card */}
      <div
        style={{
          opacity: labelIn,
          transform: `translateY(${(1 - labelIn) * 30}px)`,
        }}
      >
        <GlassCard style={{ left: 250, top: 1810, width: 940, height: 168 }}>
          <div
            style={{
              position: "absolute",
              left: 44,
              top: 30,
              fontFamily: F.mono,
              fontSize: 19,
              letterSpacing: "0.32em",
              color: C.cyan,
              opacity: 0.85,
            }}
          >
            DARATAN TERDEKAT
          </div>
          <div
            style={{
              position: "absolute",
              left: 44,
              top: 70,
              fontFamily: F.sans,
              fontSize: 46,
              fontWeight: 600,
              color: C.cream,
              letterSpacing: "-0.01em",
            }}
          >
            Tiga pulau kecil. Tanpa penghuni.
          </div>
        </GlassCard>
      </div>

      <LightLeak start={40} dur={30} opacity={0.22} />
      <Grain opacity={0.05} />
      <Vignette strength={0.58} />
    </AbsoluteFill>
  );
};
