import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, ramp } from "../lib";
import { Grain, Grid, Vignette } from "../fx";
import { PacificMap } from "../geo/PacificMap";

const fmt = (n: number) => {
  const s = String(Math.round(n));
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const S3Distance: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;

  const count = 2688 * easeOut(ramp(f, 70, 130));
  const ringP = easeOut(ramp(f, 20, 90));
  const sweep = (t * 34) % 360;
  const cx = 720;
  const cy = 1000;
  const PX_PER_KM = 0.1572;

  const rings = [500, 1000, 1500, 2000, 2500];

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 34%, #0A1520 0%, #060A0F 55%, #04060A 100%)",
      }}
    >
      {/* map panel */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 130,
          width: 1440,
          height: 1640,
          overflow: "hidden",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 7%, black 78%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 7%, black 78%, transparent 100%)",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          <PacificMap scale={760} width={1440} height={1640} landOpacity={0.11} lineOpacity={0.34} />
        </div>
        <Grid opacity={0.05} size={72} />
      </div>

      <Grain opacity={0.05} />

      {/* radar sweep */}
      <div
        style={{
          position: "absolute",
          left: cx - 430,
          top: cy - 430,
          width: 860,
          height: 860,
          borderRadius: "50%",
          background: `conic-gradient(from ${sweep}deg, rgba(255,90,31,0) 0deg, rgba(255,90,31,0.20) 34deg, rgba(255,90,31,0) 88deg)`,
          opacity: 0.85 * ramp(f, 40, 40),
          filter: "blur(2px)",
        }}
      />

      {/* distance rings */}
      {rings.map((km, i) => {
        const r = km * PX_PER_KM * ringP;
        const a = 0.16 + i * 0.045;
        return (
          <React.Fragment key={km}>
            <div
              style={{
                position: "absolute",
                left: cx - r,
                top: cy - r,
                width: r * 2,
                height: r * 2,
                borderRadius: "50%",
                border: `1px solid rgba(239,230,212,${a * ringP})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: cx + 8,
                top: cy - r - 12,
                fontFamily: F.mono,
                fontSize: 18,
                letterSpacing: "0.18em",
                color: C.cream,
                opacity: 0.34 * ringP,
              }}
            >
              {km === 2500 ? "2.500 KM" : km}
            </div>
          </React.Fragment>
        );
      })}

      {/* outer 2.688 ring */}
      <div
        style={{
          position: "absolute",
          left: cx - 422,
          top: cy - 422,
          width: 844,
          height: 844,
          borderRadius: "50%",
          border: `2px solid rgba(255,90,31,${0.55 * ringP})`,
          boxShadow: `0 0 40px rgba(255,90,31,0.12), inset 0 0 60px rgba(255,90,31,0.05)`,
        }}
      />

      {/* marker */}
      <div
        style={{
          position: "absolute",
          left: cx - 10,
          top: cy - 10,
          width: 20,
          height: 20,
          borderRadius: 99,
          background: C.orange,
          boxShadow: `0 0 30px ${C.orange}`,
          opacity: ramp(f, 30, 16),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: cx - 34,
          top: cy - 34,
          width: 68,
          height: 68,
          borderRadius: "50%",
          border: `1px solid rgba(255,90,31,${0.5 * (1 - ((t * 0.9) % 1))})`,
          transform: `scale(${0.6 + ((t * 0.9) % 1) * 0.9})`,
        }}
      />

      {/* dashed line to nearest land */}
      <svg width={1440} height={2560} style={{ position: "absolute", inset: 0 }}>
        <line
          x1={cx}
          y1={cy}
          x2={cx + 300}
          y2={cy - 300}
          stroke={C.orange}
          strokeWidth={1.5}
          strokeDasharray="6 10"
          opacity={0.6 * ramp(f, 150, 30)}
        />
        <circle cx={cx + 300} cy={cy - 300} r={4} fill={C.orange} opacity={ramp(f, 150, 30)} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: cx + 312,
          top: cy - 322,
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.18em",
          color: C.cream,
          opacity: 0.6 * ramp(f, 150, 30),
        }}
      >
        PULAU DUCIE
        <div style={{ fontSize: 16, opacity: 0.7, marginTop: 4 }}>2.688 KM</div>
      </div>

      {/* counter */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1660,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.42em",
            color: C.orange,
            opacity: ramp(f, 40, 24),
          }}
        >
          JARAK KE DARATAN TERDEKAT
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 300,
            lineHeight: 0.9,
            color: C.cream,
            letterSpacing: "0.01em",
            marginTop: 8,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fmt(count)}
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 28,
            letterSpacing: "0.5em",
            color: C.cream,
            opacity: 0.5,
            marginTop: 2,
          }}
        >
          KILOMETER
        </div>
      </div>

      {/* side scale note */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 210,
          fontFamily: F.mono,
          fontSize: 19,
          lineHeight: 1.7,
          letterSpacing: "0.14em",
          color: C.cream,
          opacity: 0.34 * ramp(f, 200, 30),
        }}
      >
        SKALA 1 : 26.000.000
        <br />
        PROYEKSI EQUIRECTANGULAR
      </div>

      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};
