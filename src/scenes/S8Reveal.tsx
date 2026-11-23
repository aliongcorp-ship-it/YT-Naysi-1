import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeInOut, lerp, ramp } from "../lib";
import { Contours, Grain, Reveal, Vignette } from "../fx";

export const S8Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = easeInOut(ramp(f, 0, durationInFrames));
  const rot: [number, number] = [lerp(150, 123.4, p), lerp(-30, -48.9, p)];

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #0B141D 0%, #060A0F 50%, #04060A 100%)",
      }}
    >
      <Contours opacity={0.045} step={130} />
      <Grain opacity={0.05} />

      {/* ghost globe */}
      <div style={{ position: "absolute", left: 0, top: 400, width: 1440, height: 1440, opacity: 0.3 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            overflow: "hidden",
            transform: `scale(${1 + 0.05 * (f / Math.max(1, durationInFrames))})`,
          }}
        >
          <Img
            src={staticFile("globe-s8.png")}
            style={{ width: 1440, height: 1440 }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 620,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.44em",
            color: C.orange,
            opacity: ramp(f, 10, 20),
          }}
        >
          48°52.6′S — 123°23.6′W
        </div>
        <Reveal delay={30} y={80}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 122,
              lineHeight: 0.98,
              color: C.cream,
              opacity: 0.82,
              marginTop: 26,
              letterSpacing: "0.03em",
            }}
          >
            TITIK PALING SEPI
          </div>
        </Reveal>
        <Reveal delay={52} y={80}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 122,
              lineHeight: 0.98,
              color: C.cream,
              opacity: 0.82,
              letterSpacing: "0.03em",
            }}
          >
            DI BUMI
          </div>
        </Reveal>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center" }}>
        <Reveal delay={80} y={110}>
          <div
            style={{
              fontFamily: F.serif,
              fontStyle: "italic",
              fontSize: 168,
              lineHeight: 0.98,
              color: C.orange,
              textShadow: "0 0 60px rgba(255,90,31,0.25)",
            }}
          >
            cerita paling
          </div>
        </Reveal>
        <Reveal delay={104} y={110}>
          <div
            style={{
              fontFamily: F.serif,
              fontStyle: "italic",
              fontSize: 168,
              lineHeight: 0.98,
              color: C.cream,
            }}
          >
            ramai.
          </div>
        </Reveal>
      </div>

      <div
        style={{
          position: "absolute",
          left: 720 - 260 * easeInOut(ramp(f, 150, 30)),
          top: 1480,
          width: 520 * easeInOut(ramp(f, 150, 30)),
          height: 1,
          background: "rgba(239,230,212,0.3)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1524,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 21,
          letterSpacing: "0.36em",
          color: C.cream,
          opacity: 0.4 * ramp(f, 160, 24),
        }}
      >
        POINT NEMO — SAMUDRA PASIFIK SELATAN
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1860,
          textAlign: "center",
          opacity: ramp(f, 180, 30),
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontFamily: F.display,
              fontSize: 72,
              letterSpacing: "0.08em",
              color: C.cream,
            }}
          >
            NAYSI
          </span>
          <span style={{ width: 12, height: 12, borderRadius: 99, background: C.orange }} />
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 26,
              letterSpacing: "0.4em",
              color: C.orange,
            }}
          >
            ATLAS
          </span>
        </div>
      </div>

      <Vignette strength={0.66} />
    </AbsoluteFill>
  );
};
