import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./theme";
import { clamp01, easeOut, lerp, ramp, rand } from "./lib";

/* ------------------------------------------------------------------ */
/* Every object here is drawn from primitives — no bitmaps, no 3D.     */
/* They are built from the same rules: dark body, lit rim, hairline    */
/* seams, and one warm accent, so the whole film reads as one kit.     */
/* ------------------------------------------------------------------ */

/* Research vessel at anchor: hull, superstructure, crane, lit portholes */
export const Ship: React.FC<{
  width?: number;
  color?: string;
  light?: string;
  style?: React.CSSProperties;
}> = ({ width = 720, color = "#04080C", light = "#FFC46B", style }) => {
  const h = width * 0.42;
  return (
    <svg width={width} height={h} viewBox="0 0 720 300" style={style}>
      <defs>
        <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B141B" />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor="#010203" />
        </linearGradient>
        <linearGradient id="sup" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#16232C" />
          <stop offset="1" stopColor="#060C11" />
        </linearGradient>
      </defs>
      {/* hull */}
      <path
        d="M18 236 L60 214 L660 214 L706 236 L694 268 L44 268 Z"
        fill="url(#hull)"
        stroke="rgba(150,200,220,0.18)"
        strokeWidth="1.2"
      />
      {/* waterline */}
      <path d="M44 268 L694 268" stroke="rgba(143,220,239,0.28)" strokeWidth="1.4" />
      {/* bow highlight */}
      <path d="M60 214 L150 214 L120 236 L44 236 Z" fill="rgba(143,220,239,0.07)" />
      {/* superstructure */}
      <rect x="196" y="150" width="196" height="66" rx="3" fill="url(#sup)" stroke="rgba(150,200,220,0.16)" />
      <rect x="214" y="112" width="132" height="40" rx="3" fill="url(#sup)" stroke="rgba(150,200,220,0.14)" />
      {/* bridge glass */}
      <rect x="222" y="120" width="116" height="16" rx="2" fill="rgba(120,190,215,0.22)" />
      <rect x="222" y="120" width="116" height="5" fill="rgba(210,245,255,0.25)" />
      {/* windows */}
      {Array.from({ length: 7 }, (_, i) => (
        <rect
          key={i}
          x={214 + i * 26}
          y={172}
          width="14"
          height="10"
          rx="1"
          fill={light}
          opacity={0.55 + 0.45 * Math.abs(Math.sin(i * 2.3))}
        />
      ))}
      {/* mast */}
      <path d="M280 112 L280 46" stroke="#22323C" strokeWidth="4" />
      <path d="M280 58 L318 74 M280 74 L244 92" stroke="#1B2830" strokeWidth="3" />
      <circle cx="280" cy="44" r="5" fill={light} opacity="0.9" />
      {/* radar dome */}
      <path d="M330 112 A26 22 0 0 1 382 112 Z" fill="#152430" stroke="rgba(150,200,220,0.2)" />
      {/* crane */}
      <path d="M470 214 L540 96" stroke="#1A2A34" strokeWidth="7" />
      <path d="M540 96 L540 150" stroke="#1A2A34" strokeWidth="3" />
      <rect x="534" y="150" width="12" height="12" fill={light} opacity="0.8" />
      {/* deck containers */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={452 + i * 52}
          y={186}
          width="46"
          height="28"
          fill={i === 1 ? "#14303C" : "#0F2029"}
          stroke="rgba(150,200,220,0.14)"
        />
      ))}
      {/* stern light + reflection */}
      <circle cx="668" cy="212" r="4" fill={light} opacity="0.75" />
      <path d="M120 286 L600 286" stroke="rgba(143,220,239,0.16)" strokeWidth="2" />
      <path d="M170 300 L540 300" stroke="rgba(143,220,239,0.08)" strokeWidth="2" />
    </svg>
  );
};

/* ISS: integrated truss, eight arrays, radiators, modules */
export const ISS: React.FC<{
  width?: number;
  style?: React.CSSProperties;
}> = ({ width = 1120, style }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 26) * 5;
  const cells = (x: number, y: number, w: number, h: number, id: string) => (
    <g key={id}>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#123A56" stroke="rgba(150,220,245,0.55)" strokeWidth="1.6" />
      {Array.from({ length: Math.floor(h / 22) }, (_, r) =>
        Array.from({ length: Math.floor(w / 22) }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={x + 3 + c * 22}
            y={y + 3 + r * 22}
            width="18"
            height="18"
            fill={`rgba(72,150,215,${0.55 + 0.22 * ((r + c) % 3)})`}
            stroke="rgba(150,220,245,0.16)"
          />
        )),
      )}
      <rect x={x} y={y} width={w} height={h * 0.3} fill="rgba(210,240,255,0.22)" />
      <rect x={x} y={y} width={w * 0.22} height={h} fill="rgba(255,255,255,0.10)" />
    </g>
  );
  return (
    <svg width={width} height={width * 0.44} viewBox="0 0 1120 494" style={{ transform: `translateY(${bob}px)`, ...style }}>
      <defs>
        <linearGradient id="truss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D8E6EE" />
          <stop offset="0.5" stopColor="#93A8B4" />
          <stop offset="1" stopColor="#3A4A55" />
        </linearGradient>
        <linearGradient id="mod" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2F7FA" />
          <stop offset="0.55" stopColor="#B9CBD6" />
          <stop offset="1" stopColor="#5C6E7A" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E8B45C" />
          <stop offset="0.5" stopColor="#B87A22" />
          <stop offset="1" stopColor="#6B4210" />
        </linearGradient>
      </defs>

      {/* solar wings */}
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s < 0 ? 0 : 1120} 0) scale(${s < 0 ? 1 : -1},1)`}>
          {cells(60, 30, 210, 96, `a${s}`)}
          {cells(60, 368, 210, 96, `b${s}`)}
          {cells(300, 30, 210, 96, `c${s}`)}
          {cells(300, 368, 210, 96, `d${s}`)}
          <path d="M20 247 L60 247 M270 78 L300 78 M270 416 L300 416" stroke="#8FA6B2" strokeWidth="5" />
        </g>
      ))}

      {/* main truss */}
      <rect x="0" y="236" width="1120" height="22" fill="url(#truss)" opacity="0.9" />
      {Array.from({ length: 28 }, (_, i) => (
        <path key={i} d={`M${i * 40} 236 L${i * 40 + 20} 258`} stroke="rgba(20,30,38,0.35)" strokeWidth="2" />
      ))}

      {/* pressurised modules */}
      <g>
        <rect x="470" y="262" width="180" height="60" rx="30" fill="url(#mod)" />
        <rect x="452" y="272" width="34" height="40" rx="16" fill="url(#mod)" />
        <rect x="634" y="272" width="34" height="40" rx="16" fill="url(#mod)" />
        <rect x="486" y="322" width="60" height="52" rx="26" fill="url(#mod)" />
        <rect x="576" y="322" width="56" height="46" rx="22" fill="url(#mod)" />
        <rect x="500" y="176" width="52" height="60" rx="24" fill="url(#gold)" />
        <rect x="500" y="176" width="52" height="22" fill="rgba(255,220,160,0.25)" />
        {/* docking ports */}
        <circle cx="560" cy="292" r="9" fill="#2B3A44" stroke="rgba(200,230,245,0.4)" />
        <circle cx="620" cy="292" r="9" fill="#2B3A44" stroke="rgba(200,230,245,0.4)" />
        {/* radiators */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={700 + i * 34} y="196" width="14" height="76" fill="#DCE8EF" opacity="0.8" />
        ))}
      </g>

      {/* Canadarm */}
      <path d="M700 300 L760 250 L826 268" stroke="#C8D8E2" strokeWidth="6" fill="none" />
      <circle cx="760" cy="250" r="7" fill="#8FA6B2" />
      <path d="M826 268 L846 256" stroke="#C8D8E2" strokeWidth="4" />

      {/* beacons */}
      <circle cx="470" cy="262" r="4" fill="#FF5A5A" opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 14))} />
      <circle cx="650" cy="262" r="3" fill="#7CE0FF" opacity={0.4 + 0.6 * Math.abs(Math.cos(f / 11))} />
    </svg>
  );
};

/* GPS-style satellite with gold foil body */
export const Satellite: React.FC<{ width?: number; style?: React.CSSProperties }> = ({
  width = 900,
  style,
}) => {
  const f = useCurrentFrame();
  return (
    <svg width={width} height={width * 0.42} viewBox="0 0 900 378" style={style}>
      <defs>
        <linearGradient id="span" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B1D2C" />
          <stop offset="1" stopColor="#071019" />
        </linearGradient>
        <linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5CE85" />
          <stop offset="0.42" stopColor="#C98A2A" />
          <stop offset="1" stopColor="#7A4A0F" />
        </linearGradient>
      </defs>
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s < 0 ? 0 : 900} 0) scale(${s},1)`}>
          {[0, 1].map((i) => (
            <g key={i}>
              <rect x={40 + i * 190} y="120" width="170" height="130" rx="4" fill="url(#span)" stroke="rgba(143,220,239,0.4)" />
              {Array.from({ length: 5 }, (_, r) =>
                Array.from({ length: 6 }, (_, c) => (
                  <rect key={`${r}${c}`} x={46 + i * 190 + c * 27} y={126 + r * 24} width="23" height="20" fill="rgba(52,124,186,0.35)" />
                )),
              )}
            </g>
          ))}
          <path d="M20 185 L40 185" stroke="#9BB2BE" strokeWidth="5" />
        </g>
      ))}
      {/* body */}
      <rect x="360" y="96" width="180" height="180" rx="8" fill="url(#foil)" stroke="rgba(255,220,160,0.45)" />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M${372 + i * 28} 96 L${366 + i * 28} 276`} stroke="rgba(90,52,8,0.45)" strokeWidth="2" />
      ))}
      <rect x="360" y="96" width="180" height="26" fill="rgba(255,235,190,0.35)" />
      {/* antenna dish */}
      <ellipse cx="450" cy="70" rx="58" ry="20" fill="#DCE8EF" stroke="rgba(200,230,245,0.6)" />
      <path d="M450 70 L450 96" stroke="#A9BEC9" strokeWidth="5" />
      <circle cx="450" cy="62" r="6" fill="#FFD08A" />
      {/* thruster cluster */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={372 + i * 26} y="286" width="12" height="26" rx="4" fill="#C8D8E2" opacity="0.9" />
      ))}
      <circle cx="450" cy="320" r="10" fill="rgba(143,220,239,0.18)" />
      <circle cx="450" cy="320" r="4" fill="#8FDCEF" opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 12))} />
    </svg>
  );
};

/* Sonobuoy / hydrophone hanging in the water column */
export const Hydrophone: React.FC<{ height?: number; style?: React.CSSProperties }> = ({
  height = 760,
  style,
}) => {
  const f = useCurrentFrame();
  const sway = Math.sin(f / 34) * 8;
  return (
    <svg width={240} height={height} viewBox={`0 0 240 ${height}`} style={style}>
      <defs>
        <linearGradient id="cab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22323C" />
          <stop offset="1" stopColor="#0A1218" />
        </linearGradient>
        <linearGradient id="body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E4EEF4" />
          <stop offset="0.45" stopColor="#9FB4C0" />
          <stop offset="1" stopColor="#3E4E59" />
        </linearGradient>
      </defs>
      <path
        d={`M120 0 C ${120 + sway} ${height * 0.28}, ${120 - sway} ${height * 0.5}, 120 ${height * 0.62}`}
        stroke="url(#cab)"
        strokeWidth="3"
        fill="none"
      />
      <g transform={`translate(0 ${height * 0.62})`}>
        <rect x="86" y="0" width="68" height="150" rx="26" fill="url(#body)" />
        <rect x="86" y="0" width="68" height="34" rx="17" fill="#FFB03A" opacity="0.85" />
        <rect x="86" y="34" width="68" height="10" fill="rgba(10,20,28,0.55)" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx="120" cy={66 + i * 24} r="4" fill="#0B1B26" opacity="0.55" />
        ))}
        <rect x="104" y="150" width="32" height="26" rx="8" fill="#5C707C" />
        <circle cx="120" cy="186" r="14" fill="#16232C" stroke="rgba(143,220,239,0.35)" />
        <circle cx="120" cy="186" r="5" fill="#8FDCEF" opacity={0.35 + 0.65 * Math.abs(Math.sin(f / 10))} />
      </g>
    </svg>
  );
};

/* Iceberg with the submerged mass made explicit */
export const Iceberg: React.FC<{ width?: number; style?: React.CSSProperties }> = ({
  width = 900,
  style,
}) => (
  <svg width={width} height={width * 0.62} viewBox="0 0 900 558" style={style}>
    <defs>
      <linearGradient id="iceTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#EAF7FC" />
        <stop offset="0.6" stopColor="#A8D6E6" />
        <stop offset="1" stopColor="#5C97AE" />
      </linearGradient>
      <linearGradient id="iceSub" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4E86A0" />
        <stop offset="0.55" stopColor="#1E4A60" />
        <stop offset="1" stopColor="#08202C" />
      </linearGradient>
    </defs>
    {/* waterline */}
    <path d="M0 238 L900 238" stroke="rgba(143,220,239,0.42)" strokeWidth="2" />
    <path d="M0 238 L900 238" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" strokeDasharray="14 22" />
    {/* above water */}
    <path
      d="M120 238 L200 128 L318 96 L420 150 L520 60 L646 128 L756 238 Z"
      fill="url(#iceTop)"
      stroke="rgba(255,255,255,0.35)"
    />
    <path d="M200 128 L318 96 L300 238 L120 238 Z" fill="rgba(255,255,255,0.22)" />
    <path d="M520 60 L646 128 L620 238 L520 238 Z" fill="rgba(20,60,80,0.18)" />
    <path d="M420 150 L520 60 L540 238 L420 238 Z" fill="rgba(255,255,255,0.10)" />
    {/* below water — the 90% you do not see */}
    <path
      d="M120 238 L300 238 L340 330 L470 430 L620 330 L756 238 L756 300 L640 470 L470 552 L300 470 L180 320 Z"
      fill="url(#iceSub)"
      opacity="0.95"
    />
    <path d="M300 238 L470 430 L620 330 L756 238" stroke="rgba(143,220,239,0.22)" fill="none" />
    {/* cracks */}
    <path d="M360 238 L390 320 L360 400" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" />
    <path d="M540 238 L520 300 L560 372" stroke="rgba(255,255,255,0.28)" strokeWidth="2" fill="none" />
  </svg>
);

/* Re-entering capsule with a plasma tail */
export const Capsule: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 220,
  style,
}) => {
  const f = useCurrentFrame();
  const flick = 0.7 + 0.3 * Math.abs(Math.sin(f / 5));
  return (
    <svg width={size} height={size * 2.4} viewBox="0 0 220 528" style={style}>
      <defs>
        <linearGradient id="plasma" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,176,58,0)" />
          <stop offset="0.45" stopColor="rgba(255,150,40,0.55)" />
          <stop offset="1" stopColor="rgba(255,235,200,0.95)" />
        </linearGradient>
        <linearGradient id="cap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C9D6DE" />
          <stop offset="0.5" stopColor="#6F818D" />
          <stop offset="1" stopColor="#2A3742" />
        </linearGradient>
      </defs>
      <path d="M110 40 L54 300 L110 336 L166 300 Z" fill="url(#plasma)" opacity={flick} />
      <path d="M110 120 L74 306 L110 330 L146 306 Z" fill="url(#plasma)" opacity={0.55 * flick} />
      {/* capsule */}
      <path d="M110 330 L40 404 L110 470 L180 404 Z" fill="url(#cap)" stroke="rgba(220,240,250,0.4)" />
      <path d="M110 330 L40 404 L110 404 Z" fill="rgba(255,255,255,0.22)" />
      <rect x="88" y="470" width="44" height="18" rx="6" fill="#3B4A55" />
      <circle cx="110" cy="398" r="12" fill="#0C1B24" stroke="rgba(143,220,239,0.5)" />
    </svg>
  );
};

/* Small uninhabited island silhouette */
export const Island: React.FC<{ width?: number; style?: React.CSSProperties }> = ({
  width = 300,
  style,
}) => (
  <svg width={width} height={width * 0.36} viewBox="0 0 300 108" style={style}>
    <path d="M6 84 L52 60 L96 70 L140 40 L196 66 L244 52 L294 84 Z" fill="#08161E" stroke="rgba(143,220,239,0.25)" />
    <path d="M140 40 L196 66 L150 84 Z" fill="rgba(143,220,239,0.08)" />
    <path d="M0 88 L300 88" stroke="rgba(143,220,239,0.35)" strokeWidth="2" />
    <path d="M40 100 L260 100" stroke="rgba(143,220,239,0.12)" strokeWidth="2" />
  </svg>
);

/* Anchor-shaped depth marker */
export const DepthPin: React.FC<{ size?: number; color?: string }> = ({
  size = 40,
  color = C.orange,
}) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 40 56">
    <circle cx="20" cy="18" r="12" fill="none" stroke={color} strokeWidth="2.4" />
    <circle cx="20" cy="18" r="4" fill={color} />
    <path d="M20 30 L20 50" stroke={color} strokeWidth="2.4" />
  </svg>
);

/* Falling debris shard */
export const Shard: React.FC<{
  i: number;
  size?: number;
  color?: string;
}> = ({ i, size = 26, color = "#9FB2BE" }) => {
  const r = (n: number) => rand(i, n);
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <path
        d={`M${8 + r(1) * 10} ${6 + r(2) * 8} L${30 - r(3) * 8} ${10 + r(4) * 10} L${26 - r(5) * 6} ${32 - r(6) * 6} L${10 + r(7) * 6} ${28 - r(8) * 6} Z`}
        fill={color}
        opacity={0.55 + r(9) * 0.4}
        stroke="rgba(220,240,250,0.3)"
      />
    </svg>
  );
};

/* Rotating dashed bearing ring */
export const BearingRing: React.FC<{ size: number; opacity?: number }> = ({
  size,
  opacity = 0.5,
}) => {
  const f = useCurrentFrame();
  const a = (f / 140) * 360;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ opacity, transform: `rotate(${a}deg)` }}>
      <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(143,220,239,0.45)" strokeWidth="1" strokeDasharray="2 10" />
      {Array.from({ length: 24 }, (_, i) => (
        <line
          key={i}
          x1="100"
          y1="4"
          x2="100"
          y2={i % 6 === 0 ? "16" : "10"}
          stroke="rgba(233,240,244,0.55)"
          strokeWidth={i % 6 === 0 ? 2 : 1}
          transform={`rotate(${(i / 24) * 360} 100 100)`}
        />
      ))}
    </svg>
  );
};

/* Utility: eased 0→1 over the scene, used by several scenes */
export const sceneProgress = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return durationInFrames > 0 ? clamp01(f / durationInFrames) : 0;
};

export const popIn = (f: number, at: number, dur = 18) => easeOut(ramp(f, at, dur));
export const slideY = (f: number, at: number, dist: number, dur = 20) =>
  lerp(dist, 0, easeOut(ramp(f, at, dur)));
