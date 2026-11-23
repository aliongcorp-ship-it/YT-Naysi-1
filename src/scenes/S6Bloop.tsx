import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, lerp, ramp } from "../lib";
import { Grain, Reveal, Vignette } from "../fx";

export const S6Bloop: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const dur = durationInFrames / fps;

  // the spike lands at ~66% of the scene, right on "The Bloop"
  const spikeAt = dur * 0.66;
  const spike = Math.exp(-Math.pow((t - spikeAt) / 0.42, 2));
  const base = 26 + 34 * ramp(t, 0, 2.4);
  const amp = base + 230 * spike;

  const pts: string[] = [];
  const N = 240;
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * 1440;
    const env = Math.sin((i / N) * Math.PI) ** 0.7;
    const y =
      1180 +
      env *
        (Math.sin(x * 0.028 + t * 3.2) * amp * 0.45 +
          Math.sin(x * 0.011 - t * 2.1) * amp * 0.3 +
          Math.sin(x * 0.061 + t * 5.3) * amp * 0.12);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const path = pts.join(" ");

  const spikeX = 720;
  const alert = spike;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 44%, #1A0A0C 0%, #0B0507 42%, #040305 100%)",
      }}
    >
      {/* oscilloscope grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(to right, rgba(255,90,31,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,90,31,0.10) 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 46%, black 20%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 46%, black 20%, transparent 78%)",
        }}
      />

      {/* hydrophone rings */}
      {[0, 1, 2, 3].map((i) => {
        const p = ((t * 0.5 + i / 4) % 1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: spikeX - 320 * p,
              top: 1180 - 320 * p,
              width: 640 * p,
              height: 640 * p,
              borderRadius: "50%",
              border: `1px solid rgba(255,46,63,${0.32 * (1 - p)})`,
            }}
          />
        );
      })}

      <svg width={1440} height={2560} style={{ position: "absolute", inset: 0 }}>
        <path d={path} fill="none" stroke={C.orange} strokeWidth={2.4} opacity={0.95} />
        <path
          d={path}
          fill="none"
          stroke={C.orange}
          strokeWidth={16}
          opacity={0.08}
        />
        {/* centre line */}
        <line x1={0} y1={1180} x2={1440} y2={1180} stroke="rgba(239,230,212,0.15)" strokeWidth={1} />
        {/* alert marker */}
        <line
          x1={spikeX}
          y1={1180 - 300}
          x2={spikeX}
          y2={1180 + 300}
          stroke={C.red}
          strokeWidth={2}
          strokeDasharray="4 8"
          opacity={alert * 0.8}
        />
      </svg>

      {/* readouts */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 250,
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.24em",
          color: C.cream,
          opacity: 0.45 * ramp(f, 20, 24),
          lineHeight: 2,
        }}
      >
        <div>HYDROPHONE ARRAY</div>
        <div style={{ color: C.red, opacity: 0.9 }}>AUTONOMOUS · 1997</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 90,
          top: 250,
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.24em",
          color: C.cream,
          opacity: 0.45 * ramp(f, 30, 24),
          textAlign: "right",
          lineHeight: 2,
        }}
      >
        <div>50°S — 100°W</div>
        <div>PASIFIK SELATAN</div>
      </div>

      {/* amplitude readout */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 1120,
          fontFamily: F.mono,
          fontSize: 26,
          letterSpacing: "0.2em",
          color: C.red,
          opacity: ramp(f, 40, 30),
        }}
      >
        {Math.round(amp).toString().padStart(3, "0")} dB
      </div>

      {/* title */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center" }}>
        <Reveal delay={50} y={90}>
          <div
            style={{
              fontFamily: F.serif,
              fontStyle: "italic",
              fontSize: 214,
              lineHeight: 0.95,
              color: C.cream,
              letterSpacing: "-0.01em",
              textShadow: "0 12px 80px rgba(0,0,0,0.8)",
            }}
          >
            The Bloop
          </div>
        </Reveal>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.46em",
            color: C.red,
            marginTop: 26,
            opacity: ramp(f, 110, 26),
          }}
        >
          SUARA YANG TIDAK BISA DIJELASKAN
        </div>
      </div>

      {/* brackets */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 760,
          width: 60,
          height: 60,
          borderLeft: `2px solid rgba(255,46,63,${0.5 * ramp(f, 20, 20)})`,
          borderTop: `2px solid rgba(255,46,63,${0.5 * ramp(f, 20, 20)})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 760,
          width: 60,
          height: 60,
          borderRight: `2px solid rgba(255,46,63,${0.5 * ramp(f, 20, 20)})`,
          borderTop: `2px solid rgba(255,46,63,${0.5 * ramp(f, 20, 20)})`,
        }}
      />

      <Grain opacity={0.07} />
      <Vignette strength={0.68} color="20,0,0" />
    </AbsoluteFill>
  );
};
