import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, ramp } from "../lib";
import { Backdrop, Flare, GlassCard, Grain, LightLeak, SonarRings, Vignette } from "../fx";
import { Hydrophone } from "../objects";

/**
 * 06 — SIGNAL
 * A hydrophone in the water column, a waveform that answers it, and the
 * one word that stuck: The Bloop.
 */
export const S6Bloop: React.FC = () => {
  const f = useCurrentFrame();

  const rigIn = easeOut(ramp(f, 0, 34));
  const waveIn = easeOut(ramp(f, 56, 30));
  const titleIn = easeOut(ramp(f, 150, 30));
  const cardIn = easeOut(ramp(f, 240, 26));

  const pts = Array.from({ length: 90 }, (_, i) => {
    const x = (i / 89) * 1440;
    const env = Math.exp(-Math.pow((i - 44) / 16, 2));
    const y =
      Math.sin(i * 0.7 + f * 0.18) * 26 * env +
      Math.sin(i * 0.23 - f * 0.11) * 46 * env +
      Math.sin(i * 1.7 + f * 0.3) * 8;
    return `${x},${980 + y}`;
  }).join(" ");

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/water.png" scale={1.24} drift={34} dim={0.32} />

      {/* depth scale on the left edge */}
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 260,
          height: 700,
          width: 1,
          background:
            "linear-gradient(180deg, rgba(143,220,239,0.05), rgba(143,220,239,0.4), rgba(143,220,239,0.05))",
        }}
      />
      {Array.from({ length: 9 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 88,
            top: 300 + i * 82,
            width: i % 4 === 0 ? 26 : 14,
            height: 1,
            background: "rgba(143,220,239,0.4)",
          }}
        />
      ))}

      {/* hydrophone rig */}
      <div
        style={{
          position: "absolute",
          left: 720 - 120,
          top: 120,
          opacity: rigIn,
          transform: `translateY(${(1 - rigIn) * -50}px)`,
          filter: "drop-shadow(0 0 50px rgba(143,220,239,0.25))",
        }}
      >
        <Hydrophone height={760} />
      </div>

      {/* signal rings from the sensor */}
      <div style={{ opacity: rigIn }}>
        <SonarRings x={720} y={700} count={5} maxR={600} speed={100} color="143,220,239" thickness={2} />
      </div>

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
      </svg>

      <Flare x={720} y={980} width={1000} opacity={0.3} color="255,176,58" />

      {/* title */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1074,
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
            fontSize: 196,
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
            fontSize: 24,
            letterSpacing: "0.4em",
            color: C.creamDim,
            marginTop: 18,
          }}
        >
          SUARA YANG TIDAK BISA DIJELASKAN
        </div>
      </div>

      {/* data card */}
      <div style={{ opacity: cardIn, transform: `translateY(${(1 - cardIn) * 30}px)` }}>
        <GlassCard style={{ left: 260, top: 1440, width: 920, height: 200 }}>
          <div
            style={{
              position: "absolute",
              left: 46,
              top: 30,
              fontFamily: F.mono,
              fontSize: 19,
              letterSpacing: "0.3em",
              color: C.cyan,
            }}
          >
            HYDROPHONE ARRAY · AUTONOMOUS
          </div>
          <div
            style={{
              position: "absolute",
              left: 46,
              top: 74,
              fontFamily: F.display,
              fontSize: 92,
              lineHeight: 1,
              color: C.cream,
            }}
          >
            5.000 KM
          </div>
          <div
            style={{
              position: "absolute",
              left: 46,
              top: 156,
              fontFamily: F.mono,
              fontSize: 19,
              letterSpacing: "0.24em",
              color: C.creamDim,
            }}
          >
            TERDETEKSI DARI JARAK SEJAUH ITU
          </div>
        </GlassCard>
      </div>

      <LightLeak start={150} dur={30} opacity={0.3} />
      <Grain opacity={0.055} />
      <Vignette strength={0.66} />
    </AbsoluteFill>
  );
};
