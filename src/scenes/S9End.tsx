import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, lerp, ramp, rand } from "../lib";
import { Backdrop, Flare, Grain, LightLeak, Orbit, StarDrift, Vignette } from "../fx";
import { wordFrame } from "../tech";

/**
 * 09 — END CARD
 * A quiet close: the planet as a small object, the question, the wordmark.
 */
export const S9End: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = durationInFrames > 0 ? f / durationInFrames : 0;

  const qIn = easeOut(ramp(f, 20, 30));
  const q2In = easeOut(ramp(f, 70, 30));
  const ctaIn = easeOut(ramp(f, wordFrame("s9", "Tulis"), 26));
  const markIn = easeOut(ramp(f, wordFrame("s9", "komentar") + 26, 30));
  const ringIn = easeOut(ramp(f, 60, 40));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/nebula.png" scale={1.2} drift={20} />
      <StarDrift opacity={0.7} speed={16} />

      {/* slow concentric rings behind the type */}
      <div style={{ position: "absolute", left: 720, top: 1000, opacity: ringIn * 0.8 }}>
        <Orbit size={1200} opacity={0.4} tilt={-18} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 700,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 24,
          letterSpacing: "0.42em",
          color: C.cyan,
          opacity: qIn * 0.9,
        }}
      >
        SATU PERTANYAAN TERAKHIR
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 790,
          textAlign: "center",
          opacity: qIn,
          transform: `translateY(${(1 - qIn) * 34}px)`,
        }}
      >
        <div
          style={{
            fontFamily: F.display,
            fontSize: 130,
            lineHeight: 1,
            color: C.cream,
            textShadow: "0 12px 60px rgba(0,0,0,0.85)",
          }}
        >
          KAMU MAU KE MANA?
        </div>
      </div>

      {/* floating locator pins — the map without the map */}
      {Array.from({ length: 12 }, (_, i) => {
        const x = 120 + rand(i, 3) * 1200;
        const y = 1150 + rand(i, 7) * 700;
        const pulse = 0.5 + 0.5 * Math.abs(Math.sin(f / 18 + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 8 + rand(i, 11) * 10,
              height: 8 + rand(i, 11) * 10,
              borderRadius: "50%",
              border: `1px solid rgba(143,220,239,${0.18 + 0.3 * pulse})`,
              opacity: q2In * (0.4 + 0.4 * pulse),
            }}
          />
        );
      })}

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1250,
          textAlign: "center",
          opacity: ctaIn,
          transform: `translateY(${(1 - ctaIn) * 30}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "26px 54px",
            borderRadius: 999,
            border: `1px solid rgba(255,176,58,0.55)`,
            background: "linear-gradient(180deg, rgba(255,176,58,0.16), rgba(255,176,58,0.05))",
            boxShadow: "0 0 60px rgba(255,176,58,0.28), inset 0 1px 0 rgba(255,220,170,0.35)",
            fontFamily: F.mono,
            fontSize: 30,
            letterSpacing: "0.34em",
            color: C.orangeHot,
          }}
        >
          TULIS DI KOMENTAR
        </div>
      </div>

      {/* wordmark */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1740,
          textAlign: "center",
          opacity: markIn,
          transform: `translateY(${(1 - markIn) * 26}px)`,
        }}
      >
        <div
          style={{
            fontFamily: F.display,
            fontSize: 118,
            letterSpacing: "0.16em",
            color: C.cream,
          }}
        >
          NAYSI<span style={{ color: C.orange }}>·</span>ATLAS
        </div>
        <div
          style={{
            width: 240,
            height: 2,
            margin: "18px auto 0",
            background: `linear-gradient(90deg, rgba(255,176,58,0), ${C.orange}, rgba(255,176,58,0))`,
          }}
        />
        <div
          style={{
            marginTop: 34,
            fontFamily: F.mono,
            fontSize: 19,
            letterSpacing: "0.34em",
            color: C.creamDim,
            opacity: 0.7,
          }}
        >
          EPISODE 37 · TITIK NEMO
        </div>
      </div>

      <Flare x={720} y={1000} width={760} opacity={0.24} color="170,225,245" />
      <LightLeak start={230} dur={40} opacity={0.3} />
      <Grain opacity={0.05} />
      <Vignette strength={0.66} />
    </AbsoluteFill>
  );
};
