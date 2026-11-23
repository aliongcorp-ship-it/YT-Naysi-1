import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { easeInOut, easeOut, ramp } from "../lib";
import { Dust, Grain, Reveal, Vignette } from "../fx";

export const S1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;

  const dotIn = ramp(f, 0, 14);
  const rise = easeInOut(ramp(f, 300, 50));
  const dotY = 690 - 130 * rise;
  const dotScale = (1 - 0.35 * rise) * (1 + 0.14 * Math.sin(t * 4.2));
  const dotGlow = 1 + 1.8 * easeOut(ramp(f, 560, 40));

  const aOut = 1 - ramp(f, 298, 16);
  const bIn = ramp(f, 306, 16);
  const bOut = 1 - ramp(f, 548, 16);
  const cIn = ramp(f, 556, 16);

  const stars = Array.from({ length: 70 }, (_, i) => ({
    x: (Math.sin(i * 12.9898) * 43758.5453) % 1,
    y: (Math.sin(i * 78.233) * 12543.123) % 1,
    s: 0.8 + ((i * 37) % 10) / 6,
    d: (i % 9) * 3,
  }));

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 30%, #0D1520 0%, #070A0F 42%, #05070A 100%)",
      }}
    >
      <Dust count={44} opacity={0.22} speed={0.18} />
      <Grain opacity={0.05} />

      {/* faint vertical axis */}
      <div
        style={{
          position: "absolute",
          left: 719,
          top: 0,
          width: 1,
          height: 2560,
          background: `linear-gradient(to bottom, rgba(239,230,212,0) 0%, rgba(239,230,212,0.14) 30%, rgba(239,230,212,0.14) 62%, rgba(239,230,212,0) 100%)`,
          opacity: dotIn,
        }}
      />

      {/* rings */}
      {[0, 1, 2].map((i) => {
        const p = ((f + i * 26) % 78) / 78;
        const r = 26 + 110 * p;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 720 - r,
              top: dotY - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `1px solid rgba(255,90,31,${0.55 * (1 - p) * dotIn})`,
            }}
          />
        );
      })}

      {/* dot */}
      <div
        style={{
          position: "absolute",
          left: 720 - 9 * dotScale,
          top: dotY - 9 * dotScale,
          width: 18 * dotScale,
          height: 18 * dotScale,
          borderRadius: 99,
          background: C.orange,
          boxShadow: `0 0 ${28 * dotScale * dotGlow}px ${C.orange}, 0 0 ${90 * dotGlow}px rgba(255,90,31,0.45)`,
          opacity: dotIn,
        }}
      />

      {/* coordinates near the dot */}
      <div
        style={{
          position: "absolute",
          left: 760,
          top: dotY - 14,
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.18em",
          color: C.cream,
          opacity: 0.4 * ramp(f, 90, 20),
          whiteSpace: "nowrap",
        }}
      >
        48°52.6′S
      </div>
      <div
        style={{
          position: "absolute",
          left: 760,
          top: dotY + 12,
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.18em",
          color: C.cream,
          opacity: 0.4 * ramp(f, 100, 20),
          whiteSpace: "nowrap",
        }}
      >
        123°23.6′W
      </div>

      {/* PHASE A */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1010,
          textAlign: "center",
          opacity: aOut,
        }}
      >
        <div
          style={{
            fontFamily: F.display,
            fontSize: 92,
            letterSpacing: "0.3em",
            color: C.cream,
            opacity: 0.55 * bIn * 0 + 0.55 * ramp(f, 20, 20),
            transform: `translateY(${(1 - easeOut(ramp(f, 20, 24))) * 30}px)`,
          }}
        >
          ADA SATU TITIK
        </div>
        <Reveal delay={54} y={110} style={{ marginTop: 8 }}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 210,
              lineHeight: 0.92,
              color: C.cream,
              letterSpacing: "0.01em",
            }}
          >
            DI BUMI
          </div>
        </Reveal>
        <Reveal delay={110} y={110}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 148,
              lineHeight: 0.98,
              color: C.cream,
              marginTop: 34,
              letterSpacing: "0.02em",
            }}
          >
            YANG BEGITU <span style={{ color: C.orange }}>SEPI.</span>
          </div>
        </Reveal>
      </div>

      {/* PHASE B */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1000,
          textAlign: "center",
          opacity: bIn * bOut,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 30,
            letterSpacing: "0.34em",
            color: C.orange,
            transform: `translateY(${(1 - easeOut(ramp(f, 312, 18))) * 20}px)`,
          }}
        >
          MANUSIA TERDEKAT
        </div>
        <Reveal delay={330} y={120}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 126,
              lineHeight: 0.95,
              color: C.cream,
              marginTop: 30,
            }}
          >
            BUKAN DI
          </div>
        </Reveal>
        <Reveal delay={362} y={140}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 232,
              lineHeight: 0.92,
              color: C.cream,
              position: "relative",
              display: "inline-block",
            }}
          >
            DARAT.
            {/* strike-through */}
            <div
              style={{
                position: "absolute",
                left: "-4%",
                top: "52%",
                height: 14,
                width: `${easeOut(ramp(f, 440, 22)) * 108}%`,
                background: C.orange,
                transform: "rotate(-3deg)",
                boxShadow: `0 0 24px rgba(255,90,31,0.5)`,
              }}
            />
          </div>
        </Reveal>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.3em",
            color: C.cream,
            opacity: 0.4 * ramp(f, 470, 20),
            marginTop: 26,
          }}
        >
          2.688 KM DARI DARATAN
        </div>
      </div>

      {/* PHASE C */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 980,
          textAlign: "center",
          opacity: cIn,
        }}
      >
        <div
          style={{
            fontFamily: F.display,
            fontSize: 112,
            letterSpacing: "0.22em",
            color: C.cream,
            opacity: 0.6,
            transform: `translateY(${(1 - easeOut(ramp(f, 560, 18))) * 24}px)`,
          }}
        >
          TAPI DI
        </div>
        <Reveal delay={584} y={160}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 196,
              lineHeight: 0.95,
              color: C.orange,
              marginTop: 18,
              letterSpacing: "0.01em",
              textShadow: `0 0 60px rgba(255,90,31,0.35)`,
            }}
          >
            LUAR ANGKASA.
          </div>
        </Reveal>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.4em",
            color: C.cream,
            opacity: 0.4 * ramp(f, 640, 24),
            marginTop: 40,
          }}
        >
          400 KM DI ATAS KAMU
        </div>
      </div>

      {/* star burst */}
      {stars.map((s, i) => {
        const a = ramp(f, 560 + s.d, 24) * cIn;
        if (a <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: Math.abs(s.x) * 1440,
              top: Math.abs(s.y) * 2560,
              width: s.s,
              height: s.s,
              borderRadius: 99,
              background: i % 7 === 0 ? C.orange : C.cream,
              opacity: a * (0.25 + 0.6 * Math.abs(Math.sin(f * 0.04 + i))),
              boxShadow: i % 7 === 0 ? `0 0 14px ${C.orange}` : "none",
            }}
          />
        );
      })}

      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};
