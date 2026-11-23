import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, lerp, ramp } from "../lib";
import { Dust, Grain, Reveal, Vignette } from "../fx";

const ISS: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
    {/* truss */}
    <div
      style={{
        position: "absolute",
        left: -130 * s,
        top: -5 * s,
        width: 260 * s,
        height: 10 * s,
        background: "#C9BEAA",
        opacity: 0.9,
        transform: "rotate(-6deg)",
      }}
    />
    {/* solar panels */}
    {[-1, 1].map((side) => (
      <div
        key={side}
        style={{
          position: "absolute",
          left: side === -1 ? -235 * s : 95 * s,
          top: -42 * s,
          width: 150 * s,
          height: 84 * s,
          background:
            "repeating-linear-gradient(90deg, rgba(30,58,95,0.95) 0px, rgba(30,58,95,0.95) 14px, rgba(143,214,210,0.55) 14px, rgba(143,214,210,0.55) 16px)",
          border: `1.5px solid rgba(143,214,210,0.6)`,
          transform: "rotate(-6deg)",
          boxShadow: "0 0 30px rgba(143,214,210,0.18)",
        }}
      />
    ))}
    {/* modules */}
    <div
      style={{
        position: "absolute",
        left: -46 * s,
        top: -30 * s,
        width: 92 * s,
        height: 60 * s,
        borderRadius: 10 * s,
        background: "linear-gradient(180deg, #EFE6D4 0%, #A79C88 100%)",
        boxShadow: "0 0 24px rgba(239,230,212,0.25)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -14 * s,
        top: -12 * s,
        width: 28 * s,
        height: 24 * s,
        borderRadius: 6 * s,
        background: "#0B1A24",
        border: `1px solid rgba(143,214,210,0.6)`,
      }}
    />
  </div>
);

export const S4ISS: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;

  const issX = 720 + Math.sin(t * 0.5) * 190;
  const issY = 520 + Math.sin(t * 0.9) * 16;

  const barP = easeOut(ramp(f, 150, 90));
  const maxW = 1080;
  const landW = maxW * barP;
  const issW = (400 / 2688) * maxW * barP;

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to bottom, #04070C 0%, #071018 46%, #08131C 62%, #05121A 100%)",
      }}
    >
      {/* stars */}
      {Array.from({ length: 90 }, (_, i) => {
        const x = ((i * 137.508) % 1440);
        const y = ((i * 89.71) % 1400);
        const a = 0.15 + 0.65 * Math.abs(Math.sin(f * 0.02 + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: i % 11 === 0 ? 3 : 1.6,
              height: i % 11 === 0 ? 3 : 1.6,
              borderRadius: 99,
              background: i % 13 === 0 ? C.orange : C.cream,
              opacity: a,
            }}
          />
        );
      })}

      {/* orbit arc */}
      <svg width={1440} height={2560} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M 40 760 Q 720 330 1400 760"
          fill="none"
          stroke={C.cyan}
          strokeWidth={1.5}
          strokeDasharray="3 12"
          opacity={0.4 * ramp(f, 30, 30)}
        />
        <path
          d="M 40 760 Q 720 330 1400 760"
          fill="none"
          stroke={C.orange}
          strokeWidth={2}
          strokeDasharray="60 1400"
          strokeDashoffset={-lerp(0, 1500, (t * 0.22) % 1)}
          opacity={0.8 * ramp(f, 60, 30)}
        />
      </svg>

      <ISS x={issX} y={issY} s={1} />

      <div
        style={{
          position: "absolute",
          left: issX - 60,
          top: issY - 120,
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.24em",
          color: C.cyan,
          opacity: 0.7 * ramp(f, 90, 24),
        }}
      >
        ISS
      </div>

      {/* headline */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 880,
          textAlign: "center",
        }}
      >
        <Reveal delay={70} y={80}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 126,
              lineHeight: 0.95,
              color: C.cream,
              letterSpacing: "0.02em",
            }}
          >
            ASTRONOT
          </div>
        </Reveal>
        <Reveal delay={96} y={100}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 186,
              lineHeight: 0.92,
              color: C.orange,
              textShadow: "0 0 50px rgba(255,90,31,0.3)",
            }}
          >
            LEBIH DEKAT
          </div>
        </Reveal>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: "0.34em",
            color: C.cream,
            opacity: 0.45 * ramp(f, 140, 24),
            marginTop: 14,
          }}
        >
          DARIPADA MANUSIA MANA PUN DI BUMI
        </div>
      </div>

      {/* comparison bars */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 1450 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: "0.18em",
            color: C.cream,
            opacity: 0.65,
          }}
        >
          <span>DARATAN TERDEKAT</span>
          <span>2.688 KM</span>
        </div>
        <div
          style={{
            marginTop: 14,
            height: 44,
            width: maxW,
            background: "rgba(239,230,212,0.09)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: landW,
              background: "linear-gradient(90deg, rgba(239,230,212,0.85), rgba(239,230,212,0.45))",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 46,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: "0.18em",
            color: C.orange,
          }}
        >
          <span>ISS DI ATAS KEPALA</span>
          <span>400 KM</span>
        </div>
        <div
          style={{
            marginTop: 14,
            height: 44,
            width: maxW,
            background: "rgba(239,230,212,0.06)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: issW,
              background: C.orange,
              boxShadow: `0 0 26px rgba(255,90,31,0.55)`,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 26,
            fontFamily: F.mono,
            fontSize: 26,
            letterSpacing: "0.24em",
            color: C.orange,
            opacity: ramp(f, 260, 30),
          }}
        >
          6,7× LEBIH DEKAT
        </div>
      </div>

      {/* ocean */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 360,
          background:
            "linear-gradient(to bottom, rgba(10,42,51,0) 0%, #06222C 22%, #04161D 100%)",
        }}
      />
      <svg width={1440} height={400} style={{ position: "absolute", bottom: 0 }}>
        {[0, 1, 2].map((k) => (
          <path
            key={k}
            d={`M 0 ${150 + k * 40} Q 180 ${130 + k * 40} 360 ${150 + k * 40} T 720 ${150 + k * 40} T 1080 ${150 + k * 40} T 1440 ${150 + k * 40}`}
            fill="none"
            stroke={C.cyan}
            strokeWidth={1.4}
            opacity={0.18 - k * 0.04}
            transform={`translate(${Math.sin(t * 0.6 + k) * 26}, 0)`}
          />
        ))}
      </svg>

      <Dust count={26} opacity={0.18} speed={0.1} seed={9} />
      <Grain opacity={0.05} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};
