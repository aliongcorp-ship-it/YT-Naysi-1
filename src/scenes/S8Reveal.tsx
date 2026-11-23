import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, lerp, ramp } from "../lib";
import {
  Backdrop,
  Flare,
  Grain,
  LightLeak,
  Orbit,
  StarDrift,
  Vignette,
  Words,
} from "../fx";

/**
 * 08 — REVEAL
 * Pull back to the whole planet: the loneliest point carries the busiest
 * story. Serif for the turn, mono for the coordinates.
 */
export const S8Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = durationInFrames > 0 ? f / durationInFrames : 0;

  const zoom = 1.18 - 0.22 * easeOut(ramp(f, 0, 70));
  const titleIn = easeOut(ramp(f, 40, 30));
  const serifIn = easeOut(ramp(f, 150, 34));
  const footIn = easeOut(ramp(f, 290, 26));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/nebula.png" scale={1.22} drift={30} />
      <StarDrift opacity={0.6} speed={34} />

      {/* planet, held back so the type can land on it */}
      <div
        style={{
          position: "absolute",
          left: 720 - 720,
          top: 380,
          width: 1440,
          height: 1440,
          borderRadius: "50%",
          overflow: "hidden",
          opacity: 0.55,
          transform: `scale(${zoom})`,
        }}
      >
        <Img src={staticFile("globe-s8.png")} style={{ width: 1440, height: 1440 }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(150deg, rgba(0,0,0,0.1) 20%, rgba(2,8,12,0.45) 68%, rgba(2,8,12,0.8) 100%)",
          }}
        />
      </div>

      <div style={{ position: "absolute", left: 720, top: 1100, opacity: easeOut(ramp(f, 20, 40)) }}>
        <Orbit size={1560} opacity={0.5} tilt={-12} />
      </div>

      <Flare x={720} y={1102} width={1100} opacity={0.28} color="160,220,245" />

      {/* coordinates */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 760,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 26,
          letterSpacing: "0.4em",
          color: C.orange,
          opacity: titleIn * 0.9,
        }}
      >
        48°52.6′S — 123°23.6′W
      </div>

      {/* statement */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 840,
          textAlign: "center",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 34}px)`,
        }}
      >
        <div
          style={{
            fontFamily: F.display,
            fontSize: 116,
            lineHeight: 0.98,
            letterSpacing: "0.02em",
            color: C.cream,
            textShadow: "0 12px 60px rgba(0,0,0,0.85)",
          }}
        >
          TITIK PALING SEPI
          <br />
          DI BUMI
        </div>
      </div>

      {/* the turn */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1180,
          textAlign: "center",
          opacity: serifIn,
          transform: `translateY(${(1 - serifIn) * 44}px)`,
        }}
      >
        <Words
          text="cerita paling"
          at={150}
          stagger={12}
          y={80}
          style={{
            fontFamily: F.serif,
            fontSize: 200,
            lineHeight: 1.02,
            fontStyle: "italic",
            color: C.orange,
            textShadow: "0 0 80px rgba(255,176,58,0.35)",
          }}
        />
        <Words
          text="ramai."
          at={186}
          stagger={12}
          y={80}
          style={{
            fontFamily: F.serif,
            fontSize: 200,
            lineHeight: 1.02,
            fontStyle: "italic",
            color: C.cream,
          }}
        />
      </div>

      {/* footnote */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1720,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 24,
          letterSpacing: "0.34em",
          color: C.creamDim,
          opacity: footIn * 0.9,
        }}
      >
        DAN HAMPIR TIDAK ADA YANG PERNAH KE SANA
      </div>

      <LightLeak start={140} dur={34} opacity={0.34} />
      <Grain opacity={0.05} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};
