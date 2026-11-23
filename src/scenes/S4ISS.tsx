import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, ramp } from "../lib";
import {
  Backdrop,
  Flare,
  Frame,
  Grain,
  LightLeak,
  StarDrift,
  Vignette,
} from "../fx";
import { DrawOn, GrowLine } from "../tech";
import { ISS } from "../objects";

/**
 * 04 — ORBIT
 * The station is the explainer. A vertical dimension line runs from the
 * Earth's limb up to the station, then the two distances are compared as
 * two physical bars — 400 km against 2.688 km, to scale.
 */
export const S4ISS: React.FC = () => {
  const f = useCurrentFrame();

  const issIn = easeOut(ramp(f, 10, 34));
  const earthIn = easeOut(ramp(f, 0, 40));
  const dimP = easeOut(ramp(f, 90, 40));
  const barA = easeOut(ramp(f, 150, 40));
  const barB = easeOut(ramp(f, 210, 40));
  const badge = easeOut(ramp(f, 300, 26));
  const titleIn = easeOut(ramp(f, 60, 24));
  const cardIn = easeOut(ramp(f, 130, 26));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/nebula.png" scale={1.18} drift={34} />
      <StarDrift opacity={0.55} speed={40} />

      {/* Earth limb */}
      <div
        style={{
          position: "absolute",
          left: 720 - 2100,
          top: 1700,
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
          top: 1530,
          height: 220,
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
          top: 360,
          opacity: issIn,
          transform: `translateY(${(1 - issIn) * -60}px)`,
          filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.7))",
        }}
      >
        <ISS width={1240} />
      </div>

      <Flare x={720} y={400} width={980} opacity={0.26} color="170,225,245" />

      {/* altitude dimension: limb → station */}
      <svg width={1440} height={1400} style={{ position: "absolute", left: 0, top: 0, opacity: dimP }}>
        <GrowLine x1={1250} y1={1700} x2={1250} y2={470} progress={dimP} color="rgba(255,176,58,0.85)" dash="7 9" />
        <line x1={1250} y1={1700} x2={1216} y2={1700} stroke="rgba(255,176,58,0.9)" strokeWidth="2" />
        <line x1={1250} y1={470} x2={1216} y2={470} stroke="rgba(255,176,58,0.9)" strokeWidth="2" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 1272,
          top: 1030,
          opacity: dimP,
          transform: `translateY(${(1 - dimP) * 24}px)`,
        }}
      >
        <div style={{ fontFamily: F.display, fontSize: 84, lineHeight: 0.9, color: C.orange }}>
          400
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 19, letterSpacing: "0.24em", color: C.creamDim, marginTop: 6 }}>
          KM
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.18em", color: C.creamDim, marginTop: 10 }}>
          DI ATAS<br />KEPALA
        </div>
      </div>

      {/* title */}
      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          top: 990,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 34}px)`,
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 23, letterSpacing: "0.42em", color: C.cyan }}>
          STASIUN LUAR ANGKASA INTERNASIONAL
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 126,
            lineHeight: 0.98,
            color: C.cream,
            marginTop: 10,
            textShadow: "0 10px 60px rgba(0,0,0,0.85)",
          }}
        >
          ASTRONOT <span style={{ color: C.orange }}>LEBIH DEKAT</span>
        </div>
      </div>

      {/* comparison card */}
      <div style={{ opacity: cardIn, transform: `translateY(${(1 - cardIn) * 30}px)` }}>
        <Frame progress={cardIn} label="PERBANDINGAN JARAK" style={{ left: 150, top: 1380, width: 1140, height: 330 }}>
          {/* row 1 */}
          <div style={{ position: "absolute", left: 54, top: 78 }}>
            <div style={{ fontFamily: F.mono, fontSize: 19, letterSpacing: "0.3em", color: C.creamDim }}>
              DARATAN TERDEKAT
            </div>
            <div
              style={{
                marginTop: 14,
                width: 1032,
                height: 22,
                borderRadius: 11,
                background: "rgba(255,255,255,0.07)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${barA * 100}%`,
                  height: "100%",
                  borderRadius: 11,
                  background: "linear-gradient(90deg, rgba(233,240,244,0.55), rgba(233,240,244,0.95))",
                  boxShadow: "0 0 26px rgba(233,240,244,0.5)",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 38,
                fontFamily: F.mono,
                fontSize: 24,
                color: C.cream,
              }}
            >
              2.688 KM
            </div>
          </div>

          {/* row 2 */}
          <div style={{ position: "absolute", left: 54, top: 196 }}>
            <div style={{ fontFamily: F.mono, fontSize: 19, letterSpacing: "0.3em", color: C.orange }}>
              ISS DI ATAS KEPALA
            </div>
            <div
              style={{
                marginTop: 14,
                width: 1032,
                height: 22,
                borderRadius: 11,
                background: "rgba(255,255,255,0.07)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${barB * 14.9}%`,
                  height: "100%",
                  borderRadius: 11,
                  background: `linear-gradient(90deg, ${C.orangeDeep}, ${C.orange}, ${C.orangeHot})`,
                  boxShadow: "0 0 30px rgba(255,176,58,0.75)",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 86,
                fontFamily: F.mono,
                fontSize: 24,
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
              top: 240,
              fontFamily: F.display,
              fontSize: 86,
              lineHeight: 1,
              color: C.cream,
              opacity: badge,
              textShadow: "0 0 50px rgba(255,176,58,0.5)",
            }}
          >
            6,7× LEBIH DEKAT
          </div>
        </Frame>
      </div>

      <LightLeak start={150} dur={30} opacity={0.28} />
      <Grain opacity={0.05} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};
