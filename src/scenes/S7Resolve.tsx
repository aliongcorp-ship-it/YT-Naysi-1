import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, ramp } from "../lib";
import {
  Backdrop,
  Flash,
  Frame,
  Grain,
  LightLeak,
  Paper,
  Vignette,
} from "../fx";
import { DepthTicks, GrowLine } from "../tech";
import { Iceberg } from "../objects";

/**
 * 07 — RESOLVE
 * A shape surfaces behind the shelf, gets two points of light for eyes, and
 * is then answered by a crack. It never gets a face.
 */
export const S7Resolve: React.FC = () => {
  const f = useCurrentFrame();

  const monster = easeOut(ramp(f, 10, 46));
  const dissolve = ramp(f, 112, 56);
  const crack = easeOut(ramp(f, 100, 44));
  const titleIn = easeOut(ramp(f, 190, 26));
  const cardIn = easeOut(ramp(f, 280, 26));
  const rulerIn = easeOut(ramp(f, 24, 34));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/ice.png" scale={1.16} drift={26} dim={0.45} />

      {/* the shape we are afraid of — a hump, two eyes, no face */}
      <div
        style={{
          position: "absolute",
          left: 720 - 450,
          top: 396,
          width: 900,
          height: 650,
          opacity: monster * (1 - dissolve) * 0.9,
          transform: `translateY(${(1 - monster) * 90 - dissolve * 60}px) scale(${1 + dissolve * 0.12})`,
        }}
      >
        <svg width={900} height={650} viewBox="0 0 900 650">
          <defs>
            <radialGradient id="hump" cx="50%" cy="30%" r="72%">
              <stop offset="0" stopColor="#16405A" />
              <stop offset="0.55" stopColor="#0A2434" />
              <stop offset="1" stopColor="#03090E" />
            </radialGradient>
            <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.55" stopColor="#000" />
              <stop offset="1" stopColor="#000" stopOpacity="0" />
            </linearGradient>
            <mask id="soften">
              <rect width="900" height="650" fill="url(#fade)" />
            </mask>
          </defs>
          <g mask="url(#soften)">
            <path
              d="M120 560 Q 96 300 300 214 Q 430 158 560 206 Q 760 288 742 560 Z"
              fill="url(#hump)"
            />
            <path
              d="M300 214 Q 430 158 560 206 Q 500 250 430 252 Q 360 250 300 214 Z"
              fill="rgba(143,220,239,0.06)"
            />
          </g>
          <circle cx="386" cy="332" r="7" fill="#8FDCEF" opacity={0.3 + 0.7 * Math.abs(Math.sin(f / 13))} />
          <circle cx="512" cy="332" r="7" fill="#8FDCEF" opacity={0.3 + 0.7 * Math.abs(Math.cos(f / 13))} />
        </svg>
      </div>

      {/* the shelf itself */}
      <div style={{ position: "absolute", left: 720 - 380, top: 690, opacity: easeOut(ramp(f, 0, 30)) }}>
        <Iceberg width={760} />
      </div>

      {/* a single fracture running out from the shelf into open water */}
      <svg width={1440} height={1000} style={{ position: "absolute", left: 0, top: 580, opacity: crack }}>
        <path
          d="M120 311 L 300 318 L 470 306 L 640 320 L 820 308 L 1000 318 L 1320 306"
          fill="none"
          stroke="rgba(215,245,255,0.75)"
          strokeWidth={2}
          strokeDasharray="760"
          strokeDashoffset={760 * (1 - crack)}
          style={{ filter: "drop-shadow(0 0 14px rgba(143,220,239,0.95))" }}
        />
      </svg>

      {/* depth ruler + leader to the shelf */}
      <svg width={1440} height={1600} style={{ position: "absolute", left: 0, top: 0, opacity: rulerIn }}>
        <DepthTicks x={140} top={360} bottom={1400} maxDepth={600} steps={6} progress={rulerIn} unit=" M" />
        <GrowLine x1={900} y1={980} x2={1120} y2={880} progress={rulerIn} color="rgba(143,220,239,0.8)" />
      </svg>
      <div style={{ position: "absolute", left: 1126, top: 846, opacity: rulerIn }}>
        <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.24em", color: C.cyan }}>
          TEBING ES
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.18em", color: C.creamDim, marginTop: 6 }}>
          TEBAL 300 M
        </div>
      </div>

      {/* title */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1170,
          textAlign: "center",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 40}px)`,
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 23, letterSpacing: "0.42em", color: C.cyan }}>
          JAWABANNYA
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 168,
            lineHeight: 0.94,
            color: C.cream,
            marginTop: 10,
            textShadow: "0 12px 70px rgba(0,0,0,0.9)",
          }}
        >
          BUKAN
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 168,
            lineHeight: 0.94,
            color: C.cream,
            opacity: 0.55,
          }}
        >
          MONSTER.
        </div>
      </div>

      {/* answer card */}
      <div style={{ opacity: cardIn, transform: `translateY(${(1 - cardIn) * 30}px)` }}>
        <Frame progress={cardIn} label="ANTARTIKA · ES RAKSASA YANG PATAH" style={{ left: 200, top: 1560, width: 1040, height: 200 }}>
          <div
            style={{
              position: "absolute",
              left: 48,
              right: 48,
              top: 78,
              fontFamily: F.sans,
              fontSize: 54,
              fontWeight: 600,
              lineHeight: 1.12,
              color: C.cream,
            }}
          >
            Hanya es seluas pulau
            <br />
            yang <span style={{ color: C.orange }}>patah</span> di dasar laut.
          </div>
        </Frame>
      </div>

      <Flash at={112} dur={22} peak={0.5} />
      <LightLeak start={186} dur={32} opacity={0.26} />
      <Paper opacity={0.06} />
      <Grain opacity={0.055} />
      <Vignette strength={0.62} />
    </AbsoluteFill>
  );
};
