import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, ramp } from "../lib";
import { Dust, Grain, Reveal, Vignette } from "../fx";

export const S9End: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const pulse = 1 + 0.035 * Math.sin(t * 3.2);
  const appear = ramp(f, 20, 26);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 42%, #0C141D 0%, #060A0F 48%, #04060A 100%)",
      }}
    >
      <Dust count={40} opacity={0.25} speed={0.12} seed={21} />
      <Grain opacity={0.05} />

      {/* returning dot */}
      <div
        style={{
          position: "absolute",
          left: 720 - 10 * pulse,
          top: 330 - 10 * pulse,
          width: 20 * pulse,
          height: 20 * pulse,
          borderRadius: 99,
          background: C.orange,
          boxShadow: `0 0 40px ${C.orange}`,
          opacity: appear,
        }}
      />
      {[0, 1].map((i) => {
        const p = ((t * 0.5 + i / 2) % 1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 720 - 90 * p,
              top: 330 - 90 * p,
              width: 180 * p,
              height: 180 * p,
              borderRadius: "50%",
              border: `1px solid rgba(255,90,31,${0.4 * (1 - p)})`,
            }}
          />
        );
      })}

      <div style={{ position: "absolute", left: 0, right: 0, top: 620, textAlign: "center" }}>
        <Reveal delay={26} y={80}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 150,
              lineHeight: 0.96,
              color: C.cream,
              letterSpacing: "0.02em",
            }}
          >
            KAMU MAU
          </div>
        </Reveal>
        <Reveal delay={50} y={100}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 232,
              lineHeight: 0.92,
              color: C.orange,
              textShadow: "0 0 60px rgba(255,90,31,0.3)",
            }}
          >
            KE MANA?
          </div>
        </Reveal>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: "0.38em",
            color: C.cream,
            opacity: 0.42 * ramp(f, 80, 24),
            marginTop: 18,
          }}
        >
          SATU TITIK. SATU PERJALANAN.
        </div>
      </div>

      {/* CTA pill */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1250,
          display: "flex",
          justifyContent: "center",
          opacity: ramp(f, 100, 24),
          transform: `scale(${1 + 0.02 * Math.sin(t * 3.2)})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "30px 64px",
            border: `2px solid ${C.orange}`,
            borderRadius: 99,
            background: "rgba(255,90,31,0.08)",
            boxShadow: `0 0 60px rgba(255,90,31,0.18), inset 0 0 40px rgba(255,90,31,0.06)`,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 99,
              background: C.orange,
              boxShadow: `0 0 16px ${C.orange}`,
            }}
          />
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 30,
              letterSpacing: "0.26em",
              color: C.cream,
            }}
          >
            TULIS DI KOMENTAR
          </span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1490,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.32em",
          color: C.cream,
          opacity: 0.3 * ramp(f, 130, 24),
        }}
      >
        IKUTI NAYSI ATLAS UNTUK LEMBAR BERIKUTNYA
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1650,
          textAlign: "center",
          opacity: ramp(f, 150, 30),
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: F.display, fontSize: 78, letterSpacing: "0.08em", color: C.cream }}>
            NAYSI
          </span>
          <span style={{ width: 12, height: 12, borderRadius: 99, background: C.orange }} />
          <span style={{ fontFamily: F.mono, fontSize: 27, letterSpacing: "0.4em", color: C.orange }}>
            ATLAS
          </span>
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 18,
            letterSpacing: "0.32em",
            color: C.cream,
            opacity: 0.35,
            marginTop: 18,
          }}
        >
          EP. 002 — POINT NEMO
        </div>
      </div>

      <Vignette strength={0.62} />
    </AbsoluteFill>
  );
};
