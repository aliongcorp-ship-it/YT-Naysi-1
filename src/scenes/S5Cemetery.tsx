import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, ramp, rand } from "../lib";
import { Backdrop, Flash, Frame, Grain, LightLeak, SonarRings, Vignette } from "../fx";
import { DepthTicks, DrawOn, wordFrame } from "../tech";
import { Capsule, Shard } from "../objects";

/**
 * 05 — CEMETERY
 * A re-entry corridor drawn as a chart: altitude ruler on the left, the
 * trajectory arcing down to the splash point, debris all the way, one
 * counter, and the year strip running 1971 → 2016.
 */
export const S5Cemetery: React.FC = () => {
  const f = useCurrentFrame();

  const count = Math.round(263 * easeOut(ramp(f, wordFrame("s5", "Lebih"), 66)));
  const strip = easeOut(ramp(f, wordFrame("s5", "kuburan"), 70));
  const traj = easeOut(ramp(f, 20, 56));
  const rig = easeOut(ramp(f, 10, 30));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/water.png" scale={1.2} drift={44} dim={0.3} />

      {/* splash glow on the sea surface */}
      <div
        style={{
          position: "absolute",
          left: 720 - 620,
          top: 1440,
          width: 1240,
          height: 320,
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(143,220,239,0.32) 0%, rgba(143,220,239,0.09) 44%, rgba(0,0,0,0) 72%)",
          opacity: 0.8,
        }}
      />

      {/* altitude ruler */}
      <svg width={1440} height={1800} style={{ position: "absolute", left: 0, top: 0, opacity: rig }}>
        <DepthTicks x={150} top={300} bottom={1480} maxDepth={400} steps={8} progress={rig} unit=" KM" />
      </svg>

      {/* re-entry trajectory */}
      <svg width={1440} height={1800} style={{ position: "absolute", left: 0, top: 0, opacity: rig }}>
        <DrawOn
          d="M1320 250 Q 1010 620 780 900 T 720 1460"
          progress={traj}
          stroke="rgba(255,176,58,0.55)"
          width={2}
          dash="8 12"
        />
      </svg>

      {/* falling debris field */}
      {Array.from({ length: 16 }, (_, i) => {
        const seed = i + 1;
        const speed = 5 + rand(seed, 3) * 9;
        const y = ((f * speed + rand(seed, 5) * 2200) % 2200) - 200;
        const x = 190 + rand(seed, 7) * 1160;
        const rot = f * (2 + rand(seed, 9) * 6);
        const s = 16 + rand(seed, 11) * 34;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `rotate(${rot}deg)`,
              opacity: 0.45 + rand(seed, 13) * 0.5,
            }}
          >
            <Shard i={seed} size={s} />
          </div>
        );
      })}

      {/* main capsule with plasma tail */}
      <div
        style={{
          position: "absolute",
          left: 880,
          top: 120,
          transform: `rotate(${10 + Math.sin(f / 20) * 3}deg)`,
          filter: "drop-shadow(0 0 70px rgba(255,150,40,0.5))",
        }}
      >
        <Capsule size={230} />
      </div>

      <div style={{ opacity: 0.85 }}>
        <SonarRings x={720} y={1580} count={3} maxR={520} speed={130} color="255,176,58" />
      </div>

      {/* counter */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 660,
          textAlign: "center",
          opacity: easeOut(ramp(f, wordFrame("s5", "Lebih") - 12, 22)),
        }}
      >
        <div
          style={{
            fontFamily: F.display,
            fontSize: 380,
            lineHeight: 0.86,
            color: C.cream,
            textShadow: "0 16px 90px rgba(0,0,0,0.95)",
          }}
        >
          {count}
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 29,
            letterSpacing: "0.44em",
            color: C.orange,
            marginTop: 10,
          }}
        >
          PESAWAT LUAR ANGKASA
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 21,
            letterSpacing: "0.3em",
            color: C.creamDim,
            marginTop: 14,
          }}
        >
          SENGAJA DIJATUHKAN KE SINI
        </div>
      </div>

      {/* year strip */}
      <div style={{ opacity: strip }}>
        <Frame progress={strip} label="KUBURAN PESAWAT LUAR ANGKASA" style={{ left: 170, top: 1220, width: 1100, height: 250 }}>
          <div
            style={{
              position: "absolute",
              left: 48,
              right: 48,
              top: 132,
              height: 2,
              background: "rgba(143,220,239,0.35)",
            }}
          />
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 48 + (i / 23) * 1004,
                top: 124,
                width: i % 6 === 0 ? 2 : 1,
                height: i % 6 === 0 ? 20 : 12,
                background: "rgba(233,240,244,0.6)",
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 48 + strip * 1004,
              top: 116,
              width: 3,
              height: 34,
              background: C.orange,
              boxShadow: "0 0 18px rgba(255,176,58,0.9)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 48,
              top: 184,
              fontFamily: F.mono,
              fontSize: 25,
              color: C.cream,
            }}
          >
            1971
          </div>
          <div
            style={{
              position: "absolute",
              right: 48,
              top: 184,
              fontFamily: F.mono,
              fontSize: 25,
              color: C.cream,
            }}
          >
            2016
          </div>
        </Frame>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1530,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 21,
          letterSpacing: "0.36em",
          color: C.cyan,
          opacity: strip * 0.8,
        }}
      >
        MIR · SALYUT · SKYLAB · 140 KAPAL PASOKAN
      </div>

      <Flash at={0} dur={16} peak={0.55} />
      <LightLeak start={50} dur={30} opacity={0.24} />
      <Grain opacity={0.055} />
      <Vignette strength={0.62} />
    </AbsoluteFill>
  );
};
