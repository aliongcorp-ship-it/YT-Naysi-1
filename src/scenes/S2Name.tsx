import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeInOut, easeOut, lerp, ramp } from "../lib";
import { Contours, Grain, Grid, Reveal, Vignette } from "../fx";

export const S2Name: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = easeInOut(ramp(f, 0, durationInFrames * 0.42));
  const drift = Math.sin((f / fps) * 0.5) * 2.2;
  const rot: [number, number] = [lerp(214, 123.4, p) + drift, lerp(-16, -48.9, p)];

  const markerPulse = ramp(f, 120, 30);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 38%, #0B141D 0%, #060A0F 48%, #04060A 100%)",
      }}
    >
      <Contours opacity={0.05} step={110} />
      <Grid opacity={0.035} size={80} />
      <Grain opacity={0.05} />

      {/* big soft glow behind the globe */}
      <div
        style={{
          position: "absolute",
          left: 720 - 760,
          top: 900 - 760,
          width: 1520,
          height: 1520,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(143,214,210,0.10) 0%, rgba(255,90,31,0.05) 42%, rgba(0,0,0,0) 66%)",
        }}
      />

      <div style={{ position: "absolute", left: 220, top: 400, width: 1000, height: 1000 }}>
        {/* atmosphere */}
        <div
          style={{
            position: "absolute",
            inset: -80,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(143,214,210,0.13) 0%, rgba(255,90,31,0.07) 44%, rgba(0,0,0,0) 68%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            boxShadow: "0 0 140px rgba(143,214,210,0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            overflow: "hidden",
            transform: `scale(${1 + 0.035 * (f / Math.max(1, durationInFrames))})`,
          }}
        >
          <Img
            src={staticFile("globe-s2.png")}
            style={{ width: 1000, height: 1000 }}
          />
          {/* rotating radar sweep (gradient static, rotated via transform) */}
          <div
            style={{
              position: "absolute",
              left: -200,
              top: -200,
              width: 1400,
              height: 1400,
              borderRadius: "50%",
              background:
                "conic-gradient(from 0deg, rgba(255,90,31,0) 0deg, rgba(255,90,31,0.20) 38deg, rgba(255,90,31,0) 95deg)",
              transform: `rotate(${(f / fps) * 26}deg)`,
            }}
          />
          {/* animated ping on Point Nemo */}
          {[0, 1, 2].map((i) => {
            const p = ((f - i * 24) % 72 + 72) % 72 / 72;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 500 - 80 * p,
                  top: 500 - 80 * p,
                  width: 160 * p,
                  height: 160 * p,
                  borderRadius: "50%",
                  border: `2px solid rgba(255,90,31,${0.55 * (1 - p)})`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* corner brackets around the globe */}
      {[
        { left: 190, top: 370, r: 0 },
        { left: 1250, top: 370, r: 90 },
        { left: 190, top: 1430, r: 270 },
        { left: 1250, top: 1430, r: 180 },
      ].map((b, i) => {
        const s = 54 * easeOut(ramp(f, 60 + i * 6, 20));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.left,
              top: b.top,
              width: s,
              height: s,
              transform: `rotate(${b.r}deg)`,
              borderTop: `2px solid rgba(255,90,31,${0.7 * ramp(f, 60, 20)})`,
              borderLeft: `2px solid rgba(255,90,31,${0.7 * ramp(f, 60, 20)})`,
            }}
          />
        );
      })}

      {/* labels */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1500,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 26,
          letterSpacing: "0.42em",
          color: C.orange,
          opacity: ramp(f, 90, 24),
        }}
      >
        SAMUDRA PASIFIK SELATAN
      </div>

      <Reveal delay={120} y={150} style={{ position: "absolute", left: 0, right: 0, top: 1552 }}>
        <div
          style={{
            textAlign: "center",
            fontFamily: F.display,
            fontSize: 236,
            lineHeight: 0.92,
            letterSpacing: "0.005em",
            color: C.cream,
            textShadow: "0 8px 60px rgba(0,0,0,0.8)",
          }}
        >
          POINT NEMO
        </div>
      </Reveal>

      {/* underline */}
      <div
        style={{
          position: "absolute",
          left: 720 - 300 * easeOut(ramp(f, 200, 26)),
          top: 1832,
          width: 600 * easeOut(ramp(f, 200, 26)),
          height: 3,
          background: C.orange,
          boxShadow: `0 0 20px rgba(255,90,31,0.6)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1876,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 32,
          letterSpacing: "0.24em",
          color: C.cream,
          opacity: 0.62 * ramp(f, 220, 26),
        }}
      >
        48°52.6′S — 123°23.6′W
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1950,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.3em",
          color: C.cream,
          opacity: 0.32 * ramp(f, 250, 26),
        }}
      >
        KUTUB KETIDAKTERSAMPAIAN SAMUDRA
      </div>

      {/* vertical caption */}
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 900,
          transform: "rotate(-90deg)",
          transformOrigin: "center",
          fontFamily: F.mono,
          fontSize: 19,
          letterSpacing: "0.4em",
          color: C.cream,
          opacity: 0.3 * ramp(f, 150, 24),
          whiteSpace: "nowrap",
        }}
      >
        2.688 KM DARI DARATAN MANA PUN
      </div>

      <Vignette strength={0.66} />
    </AbsoluteFill>
  );
};
