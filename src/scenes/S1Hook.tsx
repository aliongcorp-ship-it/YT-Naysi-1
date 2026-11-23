import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { clamp01, easeOut, lerp, ramp } from "../lib";
import { Backdrop, Flare, SonarRings, StarDrift, Vignette, Grain } from "../fx";
import { DrawOn, GrowLine } from "../tech";
import { Ship } from "../objects";

/**
 * 01 — HOOK
 * A research vessel alone at night. The frame is measured like a chart:
 * horizon hairline with distance ticks, a leader to the ship, and the
 * coordinate readout that the rest of the film keeps coming back to.
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
  const chartIn = easeOut(ramp(f, 44, 30));
  const coordIn = easeOut(ramp(f, 26, 24));

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
          height: 1240,
          background:
            "linear-gradient(180deg, rgba(200,235,250,0.20) 0%, rgba(180,225,245,0.07) 46%, rgba(180,225,245,0) 100%)",
          clipPath: "polygon(46% 0, 54% 0, 100% 100%, 0 100%)",
          opacity: beamIn * 0.9,
          mixBlendMode: "screen",
        }}
      />

      {/* ---- chart furniture: horizon + distance ticks ----------------- */}
      <svg width={1440} height={1100} style={{ position: "absolute", left: 0, top: 0, opacity: chartIn }}>
        <line x1={120} y1={1010} x2={1320} y2={1010} stroke="rgba(233,240,244,0.28)" strokeWidth="1" />
        {Array.from({ length: 25 }, (_, i) => {
          const x = 120 + (i / 24) * 1200;
          const major = i % 4 === 0;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={1010}
                x2={x}
                y2={1010 - (major ? 16 : 8)}
                stroke="rgba(233,240,244,0.4)"
                strokeWidth={major ? 1.6 : 1}
              />
              {major ? (
                <text
                  x={x}
                  y={1042}
                  textAnchor="middle"
                  fill="rgba(159,178,190,0.8)"
                  style={{ font: '500 16px "JetBrains Mono", monospace', letterSpacing: "0.12em" }}
                >
                  {i * 6} KM
                </text>
              ) : null}
            </g>
          );
        })}
        <line x1={120} y1={1010} x2={120} y2={1010 - 44} stroke="rgba(255,176,58,0.85)" strokeWidth="2" />
      </svg>

      {/* ship */}
      <div
        style={{
          position: "absolute",
          left: 720 - 310,
          top: 826 + bob,
          opacity: shipIn,
          transform: `translateY(${(1 - shipIn) * 40}px)`,
          filter: "drop-shadow(0 26px 40px rgba(0,0,0,0.8))",
        }}
      >
        <Ship width={620} />
      </div>

      {/* locator ping on the water */}
      <div style={{ opacity: easeOut(ramp(f, 40, 20)) }}>
        <SonarRings x={720} y={1010} count={4} maxR={520} speed={96} color="143,220,239" />
      </div>
      <Flare x={720} y={1008} width={560} opacity={0.28} color="170,225,245" />

      {/* leader to the vessel */}
      <svg width={1440} height={1200} style={{ position: "absolute", left: 0, top: 0, opacity: chartIn }}>
        <GrowLine x1={1000} y1={812} x2={1180} y2={700} progress={easeOut(ramp(f, 60, 26))} color="rgba(255,176,58,0.8)" />
        <circle cx={1000} cy={812} r={4} fill={C.orange} opacity={0.9} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 1180,
          top: 664,
          opacity: chartIn,
          transform: `translateX(${(1 - chartIn) * 20}px)`,
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.26em", color: C.orange }}>
          KAPAL RISET
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.2em", color: C.creamDim, marginTop: 6 }}>
          0 MANUSIA LAIN
        </div>
      </div>

      {/* coordinate readout */}
      <div
        style={{
          position: "absolute",
          right: 96,
          top: 250,
          textAlign: "right",
          opacity: coordIn,
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.3em", color: C.creamDim }}>
          POSISI KAPAL
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 34,
            letterSpacing: "0.08em",
            color: C.cream,
            marginTop: 10,
            textShadow: "0 0 30px rgba(143,220,239,0.4)",
          }}
        >
          48°52.6′S
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 34, letterSpacing: "0.08em", color: C.cream, marginTop: 2 }}>
          123°23.6′W
        </div>
      </div>

      {/* title block */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1240,
          textAlign: "center",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 40}px)`,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 25,
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
            fontSize: 158,
            lineHeight: 0.94,
            letterSpacing: "0.01em",
            color: C.cream,
            marginTop: 16,
            textShadow: "0 10px 60px rgba(0,0,0,0.85)",
          }}
        >
          BUKAN DI
        </div>

        <div style={{ position: "relative", display: "inline-block", marginTop: 2 }}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 232,
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
              height: 15,
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
