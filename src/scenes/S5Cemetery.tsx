import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, lerp, rand, ramp } from "../lib";
import { Grain, Reveal, Vignette } from "../fx";

type Debris = {
  kind: "sat" | "capsule" | "station" | "panel";
  x: number;
  y: number;
  s: number;
  rot: number;
  spin: number;
  fall: number;
  o: number;
};

const DEBRIS: Debris[] = [
  { kind: "sat", x: 180, y: 300, s: 1.1, rot: -18, spin: 6, fall: 120, o: 0.9 },
  { kind: "panel", x: 1120, y: 180, s: 1.3, rot: 24, spin: -5, fall: 90, o: 0.75 },
  { kind: "capsule", x: 260, y: 1150, s: 1.2, rot: 12, spin: 4, fall: 150, o: 0.85 },
  { kind: "station", x: 1120, y: 1250, s: 1.35, rot: -10, spin: -3, fall: 110, o: 0.8 },
  { kind: "panel", x: 720, y: 700, s: 0.8, rot: 40, spin: 8, fall: 170, o: 0.5 },
  { kind: "sat", x: 980, y: 1700, s: 0.9, rot: 160, spin: -7, fall: 100, o: 0.7 },
  { kind: "capsule", x: 460, y: 1880, s: 0.75, rot: -32, spin: 5, fall: 80, o: 0.6 },
];

const Shape: React.FC<{ kind: Debris["kind"]; s: number }> = ({ kind, s }) => {
  if (kind === "sat") {
    return (
      <svg width={220 * s} height={160 * s} viewBox="0 0 220 160">
        <rect x="80" y="55" width="60" height="50" rx="6" fill="#0B2029" stroke="rgba(143,214,210,0.75)" strokeWidth="1.8" />
        <rect x="10" y="62" width="66" height="36" fill="#0A1A22" stroke="rgba(143,214,210,0.65)" strokeWidth="1.4" />
        <rect x="144" y="62" width="66" height="36" fill="#0A1A22" stroke="rgba(143,214,210,0.65)" strokeWidth="1.4" />
        <circle cx="110" cy="42" r="12" fill="none" stroke="rgba(255,90,31,0.5)" strokeWidth="1.5" />
        <line x1="110" y1="54" x2="110" y2="55" stroke="rgba(255,90,31,0.5)" strokeWidth="1.5" />
      </svg>
    );
  }
  if (kind === "panel") {
    return (
      <svg width={260 * s} height={150 * s} viewBox="0 0 260 150">
        <rect x="4" y="4" width="252" height="142" fill="#081820" stroke="rgba(143,214,210,0.3)" strokeWidth="1.5" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1={4 + i * 36} y1="4" x2={4 + i * 36} y2="146" stroke="rgba(143,214,210,0.22)" strokeWidth="1" />
        ))}
        {[1, 2, 3].map((i) => (
          <line key={i} x1="4" y1={4 + i * 35} x2="256" y2={4 + i * 35} stroke="rgba(143,214,210,0.22)" strokeWidth="1" />
        ))}
      </svg>
    );
  }
  if (kind === "capsule") {
    return (
      <svg width={150 * s} height={190 * s} viewBox="0 0 150 190">
        <path d="M75 8 C118 40 132 90 132 132 C132 168 106 182 75 182 C44 182 18 168 18 132 C18 90 32 40 75 8 Z" fill="#0B1D26" stroke="rgba(239,230,212,0.6)" strokeWidth="1.8" />
        <circle cx="75" cy="86" r="18" fill="#050C10" stroke="rgba(143,214,210,0.8)" strokeWidth="1.8" />
        <path d="M30 150 Q75 170 120 150" fill="none" stroke="rgba(255,90,31,0.6)" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg width={300 * s} height={170 * s} viewBox="0 0 300 170">
      <rect x="20" y="60" width="260" height="14" fill="#0A1A22" stroke="rgba(143,214,210,0.6)" strokeWidth="1.4" />
      <rect x="110" y="30" width="80" height="74" rx="14" fill="#0B2029" stroke="rgba(143,214,210,0.75)" strokeWidth="1.8" />
      <rect x="24" y="24" width="70" height="26" rx="6" fill="#081820" stroke="rgba(143,214,210,0.55)" strokeWidth="1.4" />
      <rect x="206" y="24" width="70" height="26" rx="6" fill="#081820" stroke="rgba(143,214,210,0.55)" strokeWidth="1.4" />
      <circle cx="150" cy="20" r="8" fill="none" stroke="rgba(255,90,31,0.65)" strokeWidth="1.8" />
    </svg>
  );
};

export const S5Cemetery: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;

  const count = Math.round(263 * easeOut(ramp(f, 90, 120)));

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #0B2A33 0%, #06171E 38%, #03090C 72%, #020507 100%)",
      }}
    >
      {/* god rays */}
      {Array.from({ length: 6 }, (_, i) => {
        const x = 160 + i * 230;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(t * 0.3 + i) * 40,
              top: -200,
              width: 150 + i * 18,
              height: 1500,
              background:
                "linear-gradient(to bottom, rgba(143,214,210,0.13) 0%, rgba(143,214,210,0.05) 45%, rgba(143,214,210,0.0) 100%)",
              transform: `rotate(${14 + i * 2}deg)`,
              transformOrigin: "top center",
              opacity: 0.55,
            }}
          />
        );
      })}

      {/* marine snow */}
      {Array.from({ length: 80 }, (_, i) => {
        const x = rand(i, 3) * 1440;
        const y0 = rand(i, 5) * 2560;
        const sp = 10 + rand(i, 7) * 26;
        const y = ((y0 - t * sp) % 2560 + 2560) % 2560;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(t * 0.4 + i) * 8,
              top: y,
              width: 1.5 + rand(i, 9) * 2,
              height: 1.5 + rand(i, 9) * 2,
              borderRadius: 99,
              background: C.cyan,
              opacity: 0.1 + rand(i, 11) * 0.3,
            }}
          />
        );
      })}

      {/* sonar rings */}
      {[0, 1, 2].map((i) => {
        const p = ((t * 0.22 + i / 3) % 1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 720 - 500 * p,
              top: 1900 - 500 * p,
              width: 1000 * p,
              height: 1000 * p,
              borderRadius: "50%",
              border: `1px solid rgba(143,214,210,${0.18 * (1 - p)})`,
            }}
          />
        );
      })}

      {/* debris */}
      {DEBRIS.map((d, i) => {
        const y = ((d.y + t * d.fall) % 2400 + 2400) % 2400 - 200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.x - 130 * d.s,
              top: y,
              opacity: d.o,
              transform: `rotate(${d.rot + t * d.spin}deg)`,
            }}
          >
            <Shape kind={d.kind} s={d.s} />
          </div>
        );
      })}

      {/* backlight behind the counter */}
      <div
        style={{
          position: "absolute",
          left: 720 - 620,
          top: 760,
          width: 1240,
          height: 1240,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(143,214,210,0.13) 0%, rgba(143,214,210,0.04) 42%, rgba(0,0,0,0) 68%)",
        }}
      />

      {/* counter */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 900,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.42em",
            color: C.cyan,
            opacity: ramp(f, 30, 24),
          }}
        >
          SEJAK 1971
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 330,
            lineHeight: 0.9,
            color: C.cream,
            letterSpacing: "0.01em",
            marginTop: 6,
            textShadow: "0 10px 80px rgba(0,0,0,0.7)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count}
          <span style={{ color: C.orange, fontSize: 200, verticalAlign: "top" }}>+</span>
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 26,
            letterSpacing: "0.3em",
            color: C.cream,
            opacity: 0.55,
            marginTop: 10,
          }}
        >
          PESAWAT LUAR ANGKASA
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 20,
            letterSpacing: "0.3em",
            color: C.cream,
            opacity: 0.35,
            marginTop: 10,
          }}
        >
          DIJATUHKAN DI TITIK INI
        </div>
      </div>

      {/* depth gauge */}
      <div
        style={{
          position: "absolute",
          right: 76,
          top: 760,
          height: 900,
          width: 1,
          background: "rgba(143,214,210,0.25)",
        }}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            right: 66,
            top: 760 + i * 225,
            fontFamily: F.mono,
            fontSize: 17,
            color: C.cyan,
            opacity: 0.4,
            letterSpacing: "0.14em",
          }}
        >
          {(i * 1000).toLocaleString("id-ID")} M
        </div>
      ))}

      <Grain opacity={0.06} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};
