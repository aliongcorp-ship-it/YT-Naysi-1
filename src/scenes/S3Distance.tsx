import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, ramp } from "../lib";
import {
  Backdrop,
  Chip,
  Flare,
  Frame,
  Grain,
  LightLeak,
  SonarRings,
  StarDrift,
  Vignette,
} from "../fx";
import { DimLine, DrawOn, GrowLine } from "../tech";
import { DepthPin, Island } from "../objects";

/**
 * 03 — DISTANCE
 * A measured distance, not a stated one: two real islands, a dimension line
 * drawn between them with end ticks, and the number counting up on the line.
 */
export const S3Distance: React.FC = () => {
  const f = useCurrentFrame();

  const lineP = easeOut(ramp(f, 46, 48));
  const count = Math.round(2688 * easeOut(ramp(f, 60, 60)));
  const leftIn = easeOut(ramp(f, 10, 22));
  const rightIn = easeOut(ramp(f, 70, 22));
  const cardIn = easeOut(ramp(f, 150, 26));
  const pinIn = easeOut(ramp(f, 118, 24));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/water.png" scale={1.14} drift={30} dim={0.25} />
      <StarDrift opacity={0.14} speed={12} />

      {/* the three equidistant islands, labelled */}
      <div style={{ opacity: leftIn }}>
        <div style={{ position: "absolute", left: 110, top: 600 }}>
          <Island width={300} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 140,
            top: 576,
            fontFamily: F.mono,
            fontSize: 21,
            letterSpacing: "0.28em",
            color: C.creamDim,
          }}
        >
          PULAU DUCIE
        </div>
      </div>

      <div style={{ opacity: rightIn }}>
        <div style={{ position: "absolute", left: 1030, top: 600 }}>
          <Island width={300} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 1060,
            top: 576,
            fontFamily: F.mono,
            fontSize: 21,
            letterSpacing: "0.28em",
            color: C.creamDim,
          }}
        >
          MOTU NUI
        </div>
      </div>

      {/* dashed geodesic, drawn on between the two shores */}
      <svg width={1440} height={1000} style={{ position: "absolute", left: 0, top: 440 }}>
        <DrawOn
          d="M210 660 Q 720 430 1230 660"
          progress={lineP}
          stroke="rgba(143,220,239,0.5)"
          width={2}
          dash="9 13"
        />
      </svg>

      {/* Point Nemo pin at the midpoint */}
      <div style={{ position: "absolute", left: 720 - 24, top: 696, opacity: pinIn }}>
        <DepthPin size={48} color={C.orange} />
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 2,
            fontFamily: F.mono,
            fontSize: 19,
            letterSpacing: "0.26em",
            color: C.orange,
            whiteSpace: "nowrap",
          }}
        >
          POINT NEMO
        </div>
      </div>

      <div style={{ opacity: leftIn * 0.9 }}>
        <SonarRings x={720} y={750} count={3} maxR={340} speed={110} color="255,176,58" />
      </div>

      {/* the measurement */}
      <svg width={1440} height={700} style={{ position: "absolute", left: 0, top: 760 }}>
        <DimLine x1={260} x2={1180} y={250} label="2.688 KM" progress={lineP} size={30} />
      </svg>

      {/* counter */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1120,
          textAlign: "center",
          opacity: easeOut(ramp(f, 55, 20)),
        }}
      >
        <div
          style={{
            fontFamily: F.display,
            fontSize: 330,
            lineHeight: 0.9,
            color: C.cream,
            letterSpacing: "0.01em",
            textShadow: "0 14px 80px rgba(0,0,0,0.9)",
          }}
        >
          {count.toLocaleString("id-ID")}
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 29,
            letterSpacing: "0.5em",
            color: C.orange,
            marginTop: 4,
          }}
        >
          KILOMETER
        </div>
      </div>

      {/* glass stat card */}
      <div
        style={{
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 30}px)`,
        }}
      >
        <Frame
          progress={cardIn}
          label="DARATAN TERDEKAT"
          style={{ left: 220, top: 1524, width: 1000, height: 190 }}
        >
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 76,
              fontFamily: F.sans,
              fontSize: 44,
              fontWeight: 600,
              color: C.cream,
              letterSpacing: "-0.01em",
            }}
          >
            Tiga pulau kecil. <span style={{ color: C.creamDim }}>Tanpa penghuni.</span>
          </div>
          <div
            style={{
              position: "absolute",
              right: 40,
              top: 84,
              fontFamily: F.mono,
              fontSize: 22,
              letterSpacing: "0.2em",
              color: C.orange,
            }}
          >
            0 PENGHUNI
          </div>
        </Frame>
      </div>

      <Flare x={720} y={750} width={700} opacity={0.18} color="255,176,58" />
      <LightLeak start={40} dur={30} opacity={0.22} />
      <Grain opacity={0.05} />
      <Vignette strength={0.58} />
    </AbsoluteFill>
  );
};
