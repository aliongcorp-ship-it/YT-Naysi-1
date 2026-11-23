import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, ramp } from "../lib";
import { Backdrop, Flare, Frame, Grain, LightLeak, SonarRings, Vignette } from "../fx";
import { DepthTicks, DrawOn, GrowLine } from "../tech";
import { Hydrophone } from "../objects";

/**
 * 06 — SIGNAL
 * A hydrophone in the water column with a depth ruler beside it, the
 * waveform answering from five thousand kilometres away, and the name
 * that stuck: The Bloop.
 */
export const S6Bloop: React.FC = () => {
  const f = useCurrentFrame();

  const rigIn = easeOut(ramp(f, 0, 34));
  const waveIn = easeOut(ramp(f, 56, 30));
  const titleIn = easeOut(ramp(f, 150, 30));
  const cardIn = easeOut(ramp(f, 240, 26));
  const rulerIn = easeOut(ramp(f, 24, 30));

  const pts = Array.from({ length: 90 }, (_, i) => {
    const x = (i / 89) * 1440;
    const env = Math.exp(-Math.pow((i - 44) / 16, 2));
    const y =
      Math.sin(i * 0.7 + f * 0.18) * 44 * env +
      Math.sin(i * 0.23 - f * 0.11) * 78 * env +
      Math.sin(i * 1.7 + f * 0.3) * 12;
    return `${x},${980 + y}`;
  }).join(" ");

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/water.png" scale={1.24} drift={34} dim={0.32} />

      {/* depth scale on the left edge */}
      <svg width={1440} height={1600} style={{ position: "absolute", left: 0, top: 0, opacity: rulerIn }}>
        <DepthTicks x={132} top={330} bottom={1240} maxDepth={4000} steps={8} progress={rulerIn} unit=" M" />
      </svg>

      {/* hydrophone rig */}
      <div
        style={{
          position: "absolute",
          left: 720 - 120,
          top: 130,
          opacity: rigIn,
          transform: `translateY(${(1 - rigIn) * -50}px)`,
          filter: "drop-shadow(0 0 50px rgba(143,220,239,0.25))",
        }}
      >
        <Hydrophone height={760} />
      </div>

      {/* leader to the sensor */}
      <svg width={1440} height={1400} style={{ position: "absolute", left: 0, top: 0, opacity: rulerIn }}>
        <GrowLine x1={846} y1={700} x2={1080} y2={620} progress={rulerIn} color="rgba(255,176,58,0.8)" />
      </svg>
      <div style={{ position: "absolute", left: 1086, top: 580, opacity: rulerIn }}>
        <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.24em", color: C.orange }}>
          HYDROFON
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.18em", color: C.creamDim, marginTop: 6 }}>
          KEDALAMAN 1.000 M
        </div>
      </div>

      {/* signal rings from the sensor */}
      <div style={{ opacity: rigIn }}>
        <SonarRings x={720} y={700} count={5} maxR={600} speed={100} color="143,220,239" thickness={2} />
      </div>

      {/* range arcs — how far the sound travelled */}
      <svg width={1440} height={1500} style={{ position: "absolute", left: 0, top: 0, opacity: waveIn * 0.8 }}>
        {[300, 470, 640].map((r, i) => (
          <circle
            key={i}
            cx={720}
            cy={980}
            r={r}
            fill="none"
            stroke="rgba(255,176,58,0.22)"
            strokeWidth="1"
            strokeDasharray="3 9"
          />
        ))}
      </svg>

      {/* spectrogram bars behind the trace */}
      <svg width={1440} height={1500} style={{ position: "absolute", left: 0, top: 0, opacity: waveIn * 0.5 }}>
        {Array.from({ length: 72 }, (_, i) => {
          const x = 120 + (i / 71) * 1200;
          const env = Math.exp(-Math.pow((i - 35) / 13, 2));
          const h = 30 + 240 * env * (0.45 + 0.55 * Math.abs(Math.sin(i * 0.9 + f * 0.12)));
          return (
            <rect key={i} x={x} y={980 - h / 2} width={9} height={h} rx={4}
              fill={`rgba(255,176,58,${0.05 + 0.16 * env})`} />
          );
        })}
      </svg>

      {/* waveform */}
      <svg width={1440} height={1400} style={{ position: "absolute", left: 0, top: 0, opacity: waveIn }}>
        <polyline
          points={pts}
          fill="none"
          stroke={C.orange}
          strokeWidth="3.5"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 14px rgba(255,176,58,0.8))" }}
        />
        <polyline points={pts} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <DrawOn
          d="M120 1010 H 1320"
          progress={waveIn}
          stroke="rgba(143,220,239,0.28)"
          width={1}
          dash="2 8"
        />
      </svg>

      <Flare x={720} y={980} width={1000} opacity={0.3} color="255,176,58" />

      {/* title */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1060,
          textAlign: "center",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 40}px)`,
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 23, letterSpacing: "0.44em", color: C.cyan }}>
          PASIFIK SELATAN · 1997
        </div>
        <div
          style={{
            fontFamily: F.serif,
            fontSize: 190,
            lineHeight: 1,
            color: C.cream,
            marginTop: 8,
            fontStyle: "italic",
            textShadow: "0 14px 80px rgba(0,0,0,0.9)",
          }}
        >
          The Bloop
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 23,
            letterSpacing: "0.4em",
            color: C.creamDim,
            marginTop: 14,
          }}
        >
          SUARA YANG TIDAK BISA DIJELASKAN
        </div>
      </div>

      {/* data card */}
      <div style={{ opacity: cardIn, transform: `translateY(${(1 - cardIn) * 30}px)` }}>
        <Frame progress={cardIn} label="HYDROPHONE ARRAY · AUTONOMOUS" style={{ left: 220, top: 1400, width: 1000, height: 210 }}>
          <div
            style={{
              position: "absolute",
              left: 44,
              top: 74,
              fontFamily: F.display,
              fontSize: 96,
              lineHeight: 1,
              color: C.cream,
            }}
          >
            5.000 KM
          </div>
          <div
            style={{
              position: "absolute",
              left: 44,
              top: 172,
              fontFamily: F.mono,
              fontSize: 18,
              letterSpacing: "0.24em",
              color: C.creamDim,
            }}
          >
            TERDETEKSI DARI JARAK SEJAUH ITU
          </div>
          <div
            style={{
              position: "absolute",
              right: 44,
              top: 78,
              fontFamily: F.mono,
              fontSize: 19,
              letterSpacing: "0.22em",
              color: C.orange,
              textAlign: "right",
            }}
          >
            52°S — 115°W
            <div style={{ color: C.creamDim, marginTop: 8 }}>1997</div>
          </div>
        </Frame>
      </div>

      <LightLeak start={150} dur={30} opacity={0.3} />
      <Grain opacity={0.055} />
      <Vignette strength={0.66} />
    </AbsoluteFill>
  );
};
