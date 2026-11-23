import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeInOut, easeOut, ramp } from "../lib";
import { Grain, Paper, Reveal, Vignette } from "../fx";

export const S7Resolve: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;

  const panelY = 260 + (1 - easeOut(ramp(f, 0, 26))) * 900;
  const crack = useMemo(() => {
    let d = "M -80 1010";
    let x = -80;
    let y = 1010;
    const seed = [14, -22, 30, -10, 38, -26, 12, 20, -34, 16, -18, 26];
    let i = 0;
    while (x < 1540) {
      x += 104 + (i % 3) * 34;
      y += seed[i % seed.length];
      d += ` L ${x} ${y}`;
      i++;
    }
    return d;
  }, []);
  const crackP = easeInOut(ramp(f, 120, 60));
  const shardP = easeOut(ramp(f, 168, 50));

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #0A0F15 0%, #04060A 70%)" }}>
      {/* cream card */}
      <div
        style={{
          position: "absolute",
          left: 34,
          top: panelY,
          width: 1372,
          height: 1712,
          background: "#EFE6D4",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 40px 120px rgba(0,0,0,0.75)",
        }}
      >
        <Paper opacity={0.16} />
        {/* thin frame */}
        <div
          style={{
            position: "absolute",
            inset: 34,
            border: "1px solid rgba(20,18,14,0.16)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 76,
            top: 82,
            fontFamily: F.mono,
            fontSize: 20,
            letterSpacing: "0.4em",
            color: "#14110D",
            opacity: 0.55 * ramp(f, 20, 20),
          }}
        >
          JAWABAN — 03
        </div>
        <div
          style={{
            position: "absolute",
            right: 76,
            top: 82,
            fontFamily: F.mono,
            fontSize: 20,
            letterSpacing: "0.3em",
            color: C.orangeDeep,
            opacity: ramp(f, 24, 20),
          }}
        >
          ANTARTIKA
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, top: 168 }}>
          <Reveal delay={26} y={80}>
            <div
              style={{
                textAlign: "center",
                fontFamily: F.display,
                fontSize: 196,
                lineHeight: 0.92,
                color: "#14110D",
                letterSpacing: "0.01em",
              }}
            >
              BUKAN
            </div>
          </Reveal>
          <Reveal delay={52} y={110}>
            <div
              style={{
                textAlign: "center",
                fontFamily: F.display,
                fontSize: 286,
                lineHeight: 0.9,
                color: "#14110D",
                letterSpacing: "0.005em",
              }}
            >
              MONSTER.
            </div>
          </Reveal>
        </div>

        {/* ice crack */}
        <svg width={1372} height={1712} style={{ position: "absolute", inset: 0 }}>
          <path
            d={crack}
            fill="none"
            stroke="#14110D"
            strokeWidth={5}
            strokeLinejoin="round"
            strokeDasharray={2200}
            strokeDashoffset={2200 * (1 - crackP)}
            opacity={0.85}
          />
          {/* shards */}
          {[0, 1, 2, 3].map((i) => {
            const x = 240 + i * 300;
            const dy = shardP * (18 + i * 8);
            return (
              <path
                key={i}
                d={`M ${x} ${1010 + 26} L ${x + 90} ${1010 + 4} L ${x + 150} ${1010 + 34} L ${x + 60} ${1010 + 60} Z`}
                fill="#DCE9EA"
                stroke="#14110D"
                strokeWidth={1.5}
                opacity={0.55 * shardP}
                transform={`translate(0, ${dy}) rotate(${(i - 1.5) * 4} ${x} ${1010})`}
              />
            );
          })}
        </svg>

        <div style={{ position: "absolute", left: 0, right: 0, top: 1090 }}>
          <Reveal delay={150} y={80}>
            <div
              style={{
                textAlign: "center",
                fontFamily: F.display,
                fontSize: 132,
                lineHeight: 0.95,
                color: "#14110D",
              }}
            >
              HANYA ES RAKSASA
            </div>
          </Reveal>
          <Reveal delay={176} y={90}>
            <div
              style={{
                textAlign: "center",
                fontFamily: F.display,
                fontSize: 168,
                lineHeight: 0.95,
                color: C.orangeDeep,
              }}
            >
              YANG PATAH.
            </div>
          </Reveal>

        </div>

        {/* bottom glacier strip */}
        <svg width={1372} height={300} style={{ position: "absolute", bottom: 0 }}>
          <path d="M0 300 L0 200 L120 160 L210 220 L330 140 L460 230 L560 170 L690 240 L820 150 L930 220 L1050 160 L1180 230 L1290 170 L1372 220 L1372 300 Z" fill="#D7E4E6" opacity={0.75} />
          <path d="M0 300 L0 240 L140 210 L260 260 L400 200 L540 270 L660 220 L800 280 L940 210 L1080 270 L1210 220 L1372 270 L1372 300 Z" fill="#BFD6DA" opacity={0.8} />
        </svg>
      </div>

      <Grain opacity={0.06} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};
