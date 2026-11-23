import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { clamp01, easeOut, lerp, ramp } from "../lib";
import { Backdrop, Flare, SonarRings, StarDrift, Vignette, Grain } from "../fx";
import { Ship } from "../objects";

/**
 * 01 — HOOK
 * A research vessel alone at night, one locator ping, and the line that
 * breaks the expectation: the nearest human is not on land.
 */
export const S1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = durationInFrames > 0 ? f / durationInFrames : 0;

  const shipIn = easeOut(ramp(f, 0, 40));
  const bob = Math.sin(f / 22) * 7;
  const beamIn = easeOut(ramp(f, 18, 30));
  const titleIn = easeOut(ramp(f, 70, 26));
  const strike = easeOut(ramp(f, 128, 24));
  const subIn = easeOut(ramp(f, 170, 24));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/water.png" scale={1.12} drift={26} />
      <StarDrift opacity={0.18} speed={14} />

      {/* searchlight from above */}
      <div
        style={{
          position: "absolute",
          left: 720 - 210,
          top: -60,
          width: 420,
          height: 1320,
          background:
            "linear-gradient(180deg, rgba(200,235,250,0.20) 0%, rgba(180,225,245,0.07) 46%, rgba(180,225,245,0) 100%)",
          clipPath: "polygon(46% 0, 54% 0, 100% 100%, 0 100%)",
          opacity: beamIn * 0.9,
          mixBlendMode: "screen",
        }}
      />

      {/* ship */}
      <div
        style={{
          position: "absolute",
          left: 720 - 340,
          top: 1040 + bob,
          opacity: shipIn,
          transform: `translateY(${(1 - shipIn) * 40}px)`,
          filter: "drop-shadow(0 26px 40px rgba(0,0,0,0.8))",
        }}
      >
        <Ship width={680} />
      </div>

      {/* locator ping on the water */}
      <div style={{ opacity: easeOut(ramp(f, 40, 20)) }}>
        <SonarRings x={720} y={1180} count={4} maxR={520} speed={96} color="143,220,239" />
      </div>
      <Flare x={720} y={1178} width={560} opacity={0.28} color="170,225,245" />

      {/* title block */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1420,
          textAlign: "center",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 40}px)`,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 26,
            letterSpacing: "0.44em",
            color: C.orange,
            textShadow: "0 0 24px rgba(255,176,58,0.5)",
          }}
        >
          MANUSIA TERDEKAT
        </div>

        <div
          style={{
            fontFamily: F.display,
            fontSize: 168,
            lineHeight: 0.94,
            letterSpacing: "0.01em",
            color: C.cream,
            marginTop: 18,
            textShadow: "0 10px 60px rgba(0,0,0,0.85)",
          }}
        >
          BUKAN DI
        </div>

        <div style={{ position: "relative", display: "inline-block", marginTop: 4 }}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 250,
              lineHeight: 0.9,
              letterSpacing: "0.01em",
              color: C.cream,
              textShadow: "0 12px 70px rgba(0,0,0,0.9)",
            }}
          >
            DARAT.
          </div>
          {/* amber strike-through, drawn on */}
          <div
            style={{
              position: "absolute",
              left: -18,
              top: "54%",
              height: 16,
              width: `${strike * 108}%`,
              background: `linear-gradient(90deg, ${C.orangeDeep}, ${C.orange}, ${C.orangeHot})`,
              boxShadow: "0 0 34px rgba(255,176,58,0.75)",
              transform: "rotate(-2.4deg)",
            }}
          />
        </div>
      </div>

      <Grain opacity={0.05} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};
