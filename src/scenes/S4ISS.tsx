import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, lerp, ramp } from "../lib";
import {
  Backdrop,
  Flare,
  GlassCard,
  Grain,
  LightLeak,
  StarDrift,
  Vignette,
} from "../fx";
import { ISS } from "../objects";

/**
 * 04 — ORBIT
 * The station is the explainer: it hangs above an Earth limb while the two
 * distances are compared as two physical bars.
 */
export const S4ISS: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = durationInFrames > 0 ? f / durationInFrames : 0;

  const issIn = easeOut(ramp(f, 10, 34));
  const earthIn = easeOut(ramp(f, 0, 40));
  const barA = easeOut(ramp(f, 150, 40));
  const barB = easeOut(ramp(f, 210, 40));
  const badge = easeOut(ramp(f, 300, 26));
  const titleIn = easeOut(ramp(f, 60, 24));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/nebula.png" scale={1.18} drift={34} />
      <StarDrift opacity={0.55} speed={40} />

      {/* Earth limb */}
      <div
        style={{
          position: "absolute",
          left: 720 - 2100,
          top: 1760,
          width: 4200,
          height: 4200,
          borderRadius: "50%",
          opacity: earthIn,
          background:
            "radial-gradient(circle at 50% 12%, #12384C 0%, #0A1F2C 26%, #05121A 46%, #02080D 70%)",
          boxShadow:
            "0 -2px 0 rgba(190,240,255,0.85), 0 -14px 60px rgba(143,220,239,0.55), 0 -60px 180px rgba(90,180,220,0.28), inset 0 120px 200px rgba(143,220,239,0.18)",
        }}
      />
      {/* atmosphere haze above the limb */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1590,
          height: 240,
          background:
            "linear-gradient(180deg, rgba(143,220,239,0) 0%, rgba(143,220,239,0.16) 70%, rgba(180,235,255,0.34) 100%)",
          opacity: earthIn * 0.8,
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      />

      {/* orbit path */}
      <svg width={1440} height={1200} style={{ position: "absolute", left: 0, top: 0, opacity: issIn * 0.75 }}>
        <path
          d="M-100 520 Q 720 300 1540 520"
          fill="none"
          stroke="rgba(143,220,239,0.32)"
          strokeWidth="2"
          strokeDasharray="6 14"
          strokeDashoffset={-f * 2.2}
        />
      </svg>

      {/* ISS */}
      <div
        style={{
          position: "absolute",
          left: 720 - 620,
          top: 380,
          opacity: issIn,
          transform: `translateY(${(1 - issIn) * -60}px)`,
          filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.7))",
        }}
      >
        <ISS width={1240} />
      </div>

      <Flare x={720} y={420} width={980} opacity={0.26} color="170,225,245" />

      {/* title */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1000,
          textAlign: "center",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 34}px)`,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.42em",
            color: C.cyan,
          }}
        >
          STASIUN LUAR ANGKASA INTERNASIONAL
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 128,
            lineHeight: 0.98,
            color: C.cream,
            marginTop: 12,
            textShadow: "0 10px 60px rgba(0,0,0,0.85)",
          }}
        >
          ASTRONOT
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 128,
            lineHeight: 0.98,
            color: C.orange,
            textShadow: "0 0 60px rgba(255,176,58,0.45)",
          }}
        >
          LEBIH DEKAT
        </div>
      </div>

      {/* comparison bars */}
      <div style={{ opacity: easeOut(ramp(f, 140, 24)) }}>
        <GlassCard style={{ left: 150, top: 1450, width: 1140, height: 400 }}>
          {/* row 1 */}
          <div style={{ position: "absolute", left: 54, top: 54 }}>
            <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "0.3em", color: C.creamDim }}>
              DARATAN TERDEKAT
            </div>
            <div
              style={{
                marginTop: 16,
                width: 1032,
                height: 26,
                borderRadius: 13,
                background: "rgba(255,255,255,0.07)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${barA * 100}%`,
                  height: "100%",
                  borderRadius: 13,
                  background:
                    "linear-gradient(90deg, rgba(233,240,244,0.55), rgba(233,240,244,0.95))",
                  boxShadow: "0 0 26px rgba(233,240,244,0.5)",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 44,
                fontFamily: F.mono,
                fontSize: 26,
                color: C.cream,
              }}
            >
              2.688 KM
            </div>
          </div>

          {/* row 2 */}
          <div style={{ position: "absolute", left: 54, top: 200 }}>
            <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "0.3em", color: C.orange }}>
              ISS DI ATAS KEPALA
            </div>
            <div
              style={{
                marginTop: 16,
                width: 1032,
                height: 26,
                borderRadius: 13,
                background: "rgba(255,255,255,0.07)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${barB * 14.9}%`,
                  height: "100%",
                  borderRadius: 13,
                  background: `linear-gradient(90deg, ${C.orangeDeep}, ${C.orange}, ${C.orangeHot})`,
                  boxShadow: "0 0 30px rgba(255,176,58,0.75)",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 96,
                fontFamily: F.mono,
                fontSize: 26,
                color: C.orange,
              }}
            >
              400 KM
            </div>
          </div>

          {/* multiplier */}
          <div
            style={{
              position: "absolute",
              right: 54,
              top: 300,
              fontFamily: F.display,
              fontSize: 92,
              lineHeight: 1,
              color: C.cream,
              opacity: badge,
              textShadow: "0 0 50px rgba(255,176,58,0.5)",
            }}
          >
            6,7× LEBIH DEKAT
          </div>
        </GlassCard>
      </div>

      <LightLeak start={150} dur={30} opacity={0.28} />
      <Grain opacity={0.05} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};
