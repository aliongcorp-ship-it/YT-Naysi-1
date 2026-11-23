import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, lerp, ramp } from "../lib";
import {
  Backdrop,
  Flare,
  GlassCard,
  Grain,
  LightLeak,
  Orbit,
  StarDrift,
  Vignette,
  Words,
} from "../fx";

/**
 * 02 — NAME
 * The globe becomes a real object: atmosphere rim, orbital ring, a locator
 * reticle, and a mission-card readout for the coordinates.
 */
export const S2Name: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = durationInFrames > 0 ? f / durationInFrames : 0;

  const globeIn = easeOut(ramp(f, 0, 34));
  const titleIn = easeOut(ramp(f, 96, 26));
  const cardIn = easeOut(ramp(f, 150, 26));
  const scale = 1 + 0.05 * p;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/nebula.png" scale={1.16} drift={40} />
      <StarDrift opacity={0.5} speed={30} />

      {/* orbital plane behind the globe */}
      <div style={{ position: "absolute", left: 720, top: 720, opacity: easeOut(ramp(f, 40, 30)) }}>
        <Orbit size={1160} opacity={0.55} tilt={-14} />
      </div>

      {/* globe */}
      <div
        style={{
          position: "absolute",
          left: 720 - 440,
          top: 280,
          width: 880,
          height: 880,
          opacity: globeIn,
          transform: `scale(${scale}) translateY(${(1 - globeIn) * 60}px)`,
        }}
      >
        {/* atmosphere — a soft rim, not a band */}
        <div
          style={{
            position: "absolute",
            inset: -14,
            borderRadius: "50%",
            boxShadow:
              "0 0 26px 6px rgba(150,225,245,0.55), 0 0 110px 30px rgba(110,195,230,0.28), inset 0 0 70px rgba(0,0,0,0.8)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile("globe-s2.png")}
            style={{ width: 880, height: 880 }}
          />
          {/* day/night terminator sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background:
                "linear-gradient(112deg, rgba(0,0,0,0) 40%, rgba(2,10,16,0.34) 64%, rgba(2,8,12,0.66) 100%)",
            }}
          />
          {/* radar sweep */}
          <div
            style={{
              position: "absolute",
              left: -300,
              top: -300,
              width: 1640,
              height: 1640,
              borderRadius: "50%",
              background:
                "conic-gradient(from 0deg, rgba(143,220,239,0) 0deg, rgba(143,220,239,0.16) 34deg, rgba(143,220,239,0) 92deg)",
              transform: `rotate(${(f / 90) * 24}deg)`,
              mixBlendMode: "screen",
            }}
          />
        </div>

        {/* locator pings */}
        {[0, 1, 2].map((i) => {
          const q = ((f - i * 26) % 78 + 78) % 78 / 78;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 440 - 96 * q,
                top: 440 - 96 * q,
                width: 192 * q,
                height: 192 * q,
                borderRadius: "50%",
                border: `2px solid rgba(255,176,58,${0.6 * (1 - q)})`,
                boxShadow: `0 0 18px rgba(255,176,58,${0.3 * (1 - q)})`,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 432,
            top: 432,
            width: 16,
            height: 16,
            borderRadius: 8,
            background: C.orange,
            boxShadow: "0 0 26px rgba(255,176,58,0.95)",
          }}
        />
      </div>

      <Flare x={720} y={720} width={820} opacity={0.34} color="160,220,245" />

      {/* title */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1210,
          textAlign: "center",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 44}px)`,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 26,
            letterSpacing: "0.42em",
            color: C.cyan,
            opacity: 0.9,
          }}
        >
          SAMUDRA PASIFIK SELATAN
        </div>
        <Words
          text="POINT NEMO"
          at={104}
          stagger={9}
          y={70}
          style={{
            fontFamily: F.display,
            fontSize: 232,
            lineHeight: 0.92,
            color: C.cream,
            marginTop: 10,
            textShadow: "0 12px 70px rgba(0,0,0,0.9)",
            letterSpacing: "0.01em",
          }}
        />
        <div
          style={{
            width: 620,
            height: 3,
            margin: "26px auto 0",
            background: `linear-gradient(90deg, rgba(255,176,58,0), ${C.orange}, rgba(255,176,58,0))`,
            boxShadow: "0 0 24px rgba(255,176,58,0.6)",
          }}
        />
      </div>

      {/* coordinate card */}
      <div
        style={{
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 36}px)`,
        }}
      >
        <GlassCard style={{ left: 210, top: 1556, width: 1020, height: 200 }}>
          <div
            style={{
              position: "absolute",
              left: 46,
              top: 34,
              fontFamily: F.mono,
              fontSize: 20,
              letterSpacing: "0.34em",
              color: C.cyan,
              opacity: 0.85,
            }}
          >
            KUTUB KETIDAKTERSAMPAIAN SAMUDRA
          </div>
          <div
            style={{
              position: "absolute",
              left: 46,
              top: 84,
              fontFamily: F.mono,
              fontSize: 62,
              letterSpacing: "0.10em",
              color: C.cream,
              textShadow: "0 0 34px rgba(143,220,239,0.35)",
            }}
          >
            48°52.6′S — 123°23.6′W
          </div>
          <div
            style={{
              position: "absolute",
              left: 46,
              top: 158,
              fontFamily: F.mono,
              fontSize: 19,
              letterSpacing: "0.24em",
              color: C.creamDim,
            }}
          >
            2.688 KM DARI DARATAN MANA PUN
          </div>
        </GlassCard>
      </div>

      <LightLeak start={110} dur={34} opacity={0.35} />
      <Grain opacity={0.05} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};
