import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeOut, ramp, rand } from "../lib";
import { Backdrop, Flash, GlassCard, Grain, LightLeak, SonarRings, Vignette } from "../fx";
import { Capsule, Shard } from "../objects";

/**
 * 05 — CEMETERY
 * Objects falling out of the sky, one counter, and a year strip that runs
 * from 1971 to 2016 — the graveyard shown, not told.
 */
export const S5Cemetery: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const count = Math.round(263 * easeOut(ramp(f, 70, 70)));
  const strip = easeOut(ramp(f, 30, 70));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop tex="tex/water.png" scale={1.2} drift={44} dim={0.3} />

      {/* splash glow on the sea surface */}
      <div
        style={{
          position: "absolute",
          left: 720 - 620,
          top: 1480,
          width: 1240,
          height: 320,
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(143,220,239,0.32) 0%, rgba(143,220,239,0.09) 44%, rgba(0,0,0,0) 72%)",
          opacity: 0.8,
        }}
      />

      {/* falling debris field */}
      {Array.from({ length: 16 }, (_, i) => {
        const seed = i + 1;
        const speed = 5 + rand(seed, 3) * 9;
        const y = ((f * speed + rand(seed, 5) * 2200) % 2200) - 200;
        const x = 90 + rand(seed, 7) * 1260;
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
          left: 720 - 150,
          top: 96,
          transform: `rotate(${10 + Math.sin(f / 20) * 3}deg)`,
          filter: "drop-shadow(0 0 70px rgba(255,150,40,0.5))",
        }}
      >
        <Capsule size={300} />
      </div>

      <div style={{ opacity: 0.85 }}>
        <SonarRings x={720} y={1620} count={3} maxR={520} speed={130} color="255,176,58" />
      </div>

      {/* counter */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 700,
          textAlign: "center",
          opacity: easeOut(ramp(f, 50, 24)),
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
            fontSize: 30,
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
            fontSize: 22,
            letterSpacing: "0.3em",
            color: C.creamDim,
            marginTop: 16,
          }}
        >
          SENGAJA DIJATUHKAN KE SINI
        </div>
      </div>

      {/* year strip */}
      <div style={{ opacity: strip }}>
        <GlassCard style={{ left: 170, top: 1330, width: 1100, height: 260 }}>
          <div
            style={{
              position: "absolute",
              left: 48,
              top: 40,
              fontFamily: F.mono,
              fontSize: 19,
              letterSpacing: "0.32em",
              color: C.cyan,
            }}
          >
            KUBURAN PESAWAT LUAR ANGKASA
          </div>

          <div
            style={{
              position: "absolute",
              left: 48,
              right: 48,
              top: 126,
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
                top: 118,
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
              top: 110,
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
              top: 178,
              fontFamily: F.mono,
              fontSize: 26,
              color: C.cream,
            }}
          >
            1971
          </div>
          <div
            style={{
              position: "absolute",
              right: 48,
              top: 178,
              fontFamily: F.mono,
              fontSize: 26,
              color: C.cream,
            }}
          >
            2016
          </div>
        </GlassCard>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1660,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 22,
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
