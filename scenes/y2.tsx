import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeOutCubic,
  easeOutExpo,
  prog,
} from './script';
import {
  DocumentaryHeader,
  FacetedGoldNugget,
  GuillocheRosette,
  Illustrated24KGoldRing,
  MatteCanvasGround,
  TrimPath,
  buildNaturalEarthMap,
  useProceduralSurface,
} from './emas';

// ============================================================================
// SCENE 07 — 17 AGUSTUS 2017: 70 OBSERVATORIUM & GW170817 (82.456s – 99.502s)
// ============================================================================

interface ObservatoryHub {
  readonly name: string;
  readonly lon: number;
  readonly lat: number;
  readonly delay: number;
}

const GLOBAL_OBSERVATORIES: readonly ObservatoryHub[] = [
  { name: 'LIGO HANFORD', lon: -119.4, lat: 46.45, delay: 0.0 },
  { name: 'LIGO LIVINGSTON', lon: -90.77, lat: 30.56, delay: 0.12 },
  { name: 'VIRGO ITALIA', lon: 10.5, lat: 43.63, delay: 0.24 },
  { name: 'PARANAL CHILI', lon: -70.4, lat: -24.63, delay: 0.38 },
  { name: 'MAUNA KEA', lon: -155.47, lat: 19.82, delay: 0.52 },
  { name: 'SAAO AFRIKA', lon: 20.81, lat: -32.38, delay: 0.66 },
  { name: 'SIDING SPRING', lon: 149.06, lat: -31.27, delay: 0.8 },
];

const SPECTRUM_LINES = [48, 92, 134, 198, 224, 286, 338, 392, 434, 488, 536] as const;

export const Scene07Bukti2017: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[6];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const paperUrl = useProceduralSurface('cotton-paper');
  const castIronUrl = useProceduralSurface('cast-iron');

  // Real Natural Earth World Map inside upper archival frame (x: 104..1336, y: 455..965)
  const worldMap = useMemo(() => buildNaturalEarthMap(116, 470, 1208, 485), []);

  const slewProg = easeOutCubic(prog(globalSec, 86.7, 89.4));
  const specProg = easeOutExpo(prog(globalSec, 90.8, 92.4));
  const stampProg = easeOutExpo(prog(globalSec, 93.4, 94.2));

  // Target astrometric reticle coordinates for NGC 4993
  const targetX = 1095;
  const targetY = 548;

  // Telescope tube elevation angle slewing from zenith (82 deg) to target (44 deg)
  const tubeDeg = interpolate(slewProg, [0, 1], [-82, -44]);

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="suede-slate"
        surfaceOpacity={0.26}
        warmLampX={54}
        warmLampY={36}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure={globalSec >= 95.1 ? '130 JT' : '70'}
        unit={globalSec >= 95.1 ? 'TAHUN CAHAYA' : 'TELESKOP DUNIA'}
        subtitle="17 AGUSTUS 2017 · KILATAN KILONOVA GW170817 DI GALAKSI NGC 4993"
        localSec={localSec}
        accentColor={IDENTITY.bullion24k}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s7-map-frame">
            <rect x={104} y={455} width={1232} height={515} />
          </clipPath>
          <clipPath id="s7-dome-shell">
            <path d="M 152,1355 A 168,168 0 0,1 488,1355 Z" />
          </clipPath>
          <linearGradient id="s7-spectrum-band" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4A586E" />
            <stop offset="28%" stopColor="#6B7E78" />
            <stop offset="56%" stopColor="#C89B48" />
            <stop offset="82%" stopColor="#B85C38" />
            <stop offset="100%" stopColor="#6E2E22" />
          </linearGradient>
        </defs>

        {/* ================================================================ */}
        {/* UPPER ARCHIVAL NATURAL EARTH WORLD OBSERVATORY NETWORK MAP        */}
        {/* ================================================================ */}
        <g clipPath="url(#s7-map-frame)">
          <rect x={104} y={455} width={1232} height={515} fill="#0F151C" />
          <path d={worldMap.graticulePath} fill="none" stroke="rgba(237, 232, 221, 0.08)" strokeWidth={1} />
          <path
            d={worldMap.landPath}
            fill="#27313A"
            stroke="rgba(212, 160, 62, 0.36)"
            strokeWidth={1.1}
          />

          {/* Synchronized Sightlines from Global Observatories Locking onto NGC 4993 */}
          {GLOBAL_OBSERVATORIES.map((obs, idx) => {
            const pt = worldMap.project(obs.lon, obs.lat);
            if (!pt) return null;
            const lineP = clamp01((globalSec - 86.8 - obs.delay) / 1.15);
            const arcD = `M ${pt[0].toFixed(1)},${pt[1].toFixed(1)} Q ${(
              (pt[0] + targetX) * 0.5
            ).toFixed(1)},${(Math.min(pt[1], targetY) - 65).toFixed(1)} ${targetX},${targetY}`;
            return (
              <g key={idx}>
                <TrimPath
                  d={arcD}
                  progress={lineP}
                  stroke={IDENTITY.bullionLight}
                  strokeWidth={1.6}
                  opacity={0.72}
                />
                <circle cx={pt[0]} cy={pt[1]} r={5.5} fill={IDENTITY.bullion24k} stroke="#FAF0CA" strokeWidth={1.5} />
                <circle
                  cx={pt[0]}
                  cy={pt[1]}
                  r={12 + Math.sin(localSec * 3 + idx) * 3}
                  fill="none"
                  stroke="rgba(232, 199, 119, 0.42)"
                  strokeWidth={1.1}
                />
                <text
                  x={pt[0]}
                  y={pt[1] + 22}
                  textAnchor="middle"
                  fill="rgba(237, 232, 221, 0.72)"
                  fontFamily={IDENTITY.fontMono}
                  fontSize={12}
                  fontWeight={600}
                >
                  {obs.name}
                </text>
              </g>
            );
          })}

          {/* Astrometric Target Reticle Plate: Galaxy NGC 4993 Kilonova */}
          <g transform={`translate(${targetX}, ${targetY})`}>
            <circle cx={0} cy={0} r={58} fill="rgba(16, 20, 26, 0.88)" stroke={IDENTITY.bullionLight} strokeWidth={1.8} />
            <circle cx={0} cy={0} r={34} fill="rgba(212, 160, 62, 0.28)" />
            <circle cx={0} cy={0} r={11} fill="#FAF2D6" />
            <line x1={-68} y1={0} x2={-22} y2={0} stroke={IDENTITY.bullionLight} strokeWidth={1.5} />
            <line x1={22} y1={0} x2={68} y2={0} stroke={IDENTITY.bullionLight} strokeWidth={1.5} />
            <line x1={0} y1={-68} x2={0} y2={-22} stroke={IDENTITY.bullionLight} strokeWidth={1.5} />
            <line x1={0} y1={22} x2={0} y2={68} stroke={IDENTITY.bullionLight} strokeWidth={1.5} />
            <text
              x={-76}
              y={-36}
              textAnchor="end"
              fill={IDENTITY.bullionLight}
              fontFamily={IDENTITY.fontMono}
              fontSize={16}
              fontWeight={700}
              letterSpacing="0.12em"
            >
              NGC 4993
            </text>
            <text
              x={-76}
              y={-14}
              textAnchor="end"
              fill={IDENTITY.ivoryText}
              fontFamily={IDENTITY.fontMono}
              fontSize={14}
            >
              RA 13h 09m · DEC -23°
            </text>
          </g>
        </g>

        {/* Map Frame Border & Caption */}
        <rect
          x={104}
          y={455}
          width={1232}
          height={515}
          fill="none"
          stroke="rgba(237, 232, 221, 0.28)"
          strokeWidth={1.8}
        />
        <text
          x={126}
          y={488}
          fill={IDENTITY.stoneText}
          fontFamily={IDENTITY.fontMono}
          fontSize={16}
          fontWeight={600}
          letterSpacing="0.16em"
        >
          JARINGAN LIGO · VIRGO · 70 OBSERVATORIUM OPTIK & INFRAMERAH
        </text>

        {/* ================================================================ */}
        {/* LOWER-LEFT: ARCHITECTURAL RESEARCH OBSERVATORY CUTAWAY           */}
        {/* ================================================================ */}
        <g>
          {/* Rocky Andean Mountain Summit Silhouette */}
          <polygon
            points="104,1645 148,1485 235,1468 415,1468 502,1492 536,1645"
            fill="#1D2228"
            stroke="rgba(237,232,221,0.22)"
            strokeWidth={1.5}
          />

          {/* Cylindrical Concrete Observatory Pier */}
          <rect
            x={152}
            y={1355}
            width={336}
            height={115}
            fill="#262C34"
            stroke="rgba(237,232,221,0.34)"
            strokeWidth={1.8}
          />
          {/* Control Room Warm Slit Windows */}
          {[188, 252, 376, 430].map((wx, i) => (
            <rect key={i} x={wx} y={1395} width={28} height={18} fill="#D9A84E" opacity={0.85} />
          ))}

          {/* Brushed Steel Geodesic Dome Left Half + Cutaway Interior Right Half */}
          <path d="M 152,1355 A 168,168 0 0,1 488,1355 Z" fill="#13181E" stroke="rgba(237,232,221,0.4)" strokeWidth={2} />
          {castIronUrl && (
            <g clipPath="url(#s7-dome-shell)" opacity={0.45}>
              <image href={castIronUrl} x={148} y={1180} width={172} height={180} preserveAspectRatio="none" />
            </g>
          )}
          {/* Dome Structural Arch Ribs */}
          <path d="M 192,1355 A 128,168 0 0,1 320,1187" fill="none" stroke="rgba(237,232,221,0.28)" strokeWidth={1.5} />
          <line x1={320} y1={1187} x2={320} y2={1355} stroke="rgba(237,232,221,0.35)" strokeWidth={2} />

          {/* Internal Azimuth Fork Pier & Slewing Serrurier Truss Optical Telescope */}
          <rect x={302} y={1312} width={36} height={43} fill="#464E56" />
          <g transform={`translate(320, 1312) rotate(${tubeDeg + 90})`}>
            {/* Primary Mirror Cell */}
            <rect x={-34} y={-12} width={68} height={24} fill="#5C6670" stroke="#EDE8DD" strokeWidth={1.5} />
            {/* Serrurier Steel Truss Tube */}
            <rect x={-26} y={-142} width={52} height={130} fill="rgba(30, 36, 44, 0.72)" stroke="#C2C9CF" strokeWidth={1.8} />
            <polyline
              points="-26,-12 26,-56 -26,-98 26,-142"
              fill="none"
              stroke="rgba(237,232,221,0.45)"
              strokeWidth={1.4}
            />
            <polyline
              points="26,-12 -26,-56 26,-98 -26,-142"
              fill="none"
              stroke="rgba(237,232,221,0.45)"
              strokeWidth={1.4}
            />
            {/* Secondary Mirror Baffle & Optical Beam Cone */}
            <line x1={-30} y1={-142} x2={30} y2={-142} stroke={IDENTITY.bullionLight} strokeWidth={3} />
            <polygon
              points="-24,-142 -68,-380 68,-380 24,-142"
              fill="rgba(232, 199, 119, 0.11)"
            />
          </g>
          <circle cx={320} cy={1312} r={9} fill={IDENTITY.bullion24k} stroke="#FAF0CA" strokeWidth={1.8} />
        </g>
      </svg>

      {/* ================================================================ */}
      {/* LOWER-RIGHT: TILTED ARCHIVAL SPECTROGRAPH LOG CARD               */}
      {/* ================================================================ */}
      <div
        style={{
          position: 'absolute',
          left: 558,
          top: 1038,
          width: 776,
          padding: '26px 32px 30px',
          backgroundColor: IDENTITY.paperCream,
          backgroundImage: paperUrl ? `url(${paperUrl})` : undefined,
          backgroundSize: 'cover',
          border: '1.5px solid rgba(46, 36, 24, 0.38)',
          boxShadow: '0 24px 46px rgba(0, 0, 0, 0.56)',
          transform: `translateY(${(1 - specProg) * 44}px) rotate(1.3deg)`,
          opacity: clamp01(specProg * 1.5),
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '2px solid #251F18',
            paddingBottom: 8,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: IDENTITY.fontEditorial,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: IDENTITY.paperInk,
            }}
          >
            SPEKTROSKOPI · GW170817
          </span>
          <span
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 17,
              fontWeight: 600,
              color: IDENTITY.paperMuted,
            }}
          >
            VLT / X-SHOOTER
          </span>
        </div>

        <div
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: IDENTITY.paperMuted,
            marginBottom: 8,
          }}
        >
          GARIS SERAPAN UNSUR BERAT (700 – 1.800 nm)
        </div>

        {/* Muted Non-Neon Optical Absorption Spectrum Strip */}
        <svg width={696} height={82} style={{ display: 'block', marginBottom: 14 }}>
          <rect
            x={0}
            y={0}
            width={696}
            height={62}
            fill="url(#s7-spectrum-band)"
            stroke="#251F18"
            strokeWidth={1.5}
          />
          {SPECTRUM_LINES.map((lx, i) => (
            <line
              key={i}
              x1={lx * 1.18}
              y1={0}
              x2={lx * 1.18}
              y2={62}
              stroke="#191510"
              strokeWidth={i % 3 === 0 ? 4 : 2}
              opacity={0.85}
            />
          ))}
          <text x={4} y={79} fill={IDENTITY.paperMuted} fontFamily={IDENTITY.fontMono} fontSize={13}>
            700 nm
          </text>
          <text x={348} y={79} textAnchor="middle" fill={IDENTITY.paperInk} fontFamily={IDENTITY.fontMono} fontSize={13} fontWeight={700}>
            JEJAK EMAS (79 Au) & PLATINA (78 Pt)
          </text>
          <text x={692} y={79} textAnchor="end" fill={IDENTITY.paperMuted} fontFamily={IDENTITY.fontMono} fontSize={13}>
            1.800 nm
          </text>
        </svg>

        {[
          { k: 'SUMBER SINYAL', v: 'TABRAKAN 2 BINTANG NEUTRON' },
          { k: 'JARAK GALAKSI', v: '130 JUTA TAHUN CAHAYA' },
          { k: 'UNSUR BARU', v: 'EMAS (Au) & PLATINA (Pt)' },
        ].map((row, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '7px 0',
              borderBottom: idx < 2 ? `1px dashed ${IDENTITY.paperRule}` : 'none',
              fontFamily: IDENTITY.fontMono,
              fontSize: 18,
            }}
          >
            <span style={{ color: IDENTITY.paperMuted, fontWeight: 600 }}>{row.k}</span>
            <span style={{ color: IDENTITY.paperInk, fontWeight: 700 }}>{row.v}</span>
          </div>
        ))}

        {stampProg > 0.02 && (
          <div
            style={{
              position: 'absolute',
              right: 24,
              bottom: 16,
              padding: '6px 16px',
              border: `3.5px solid ${IDENTITY.sagePatina}`,
              color: IDENTITY.sagePatina,
              backgroundColor: 'rgba(239, 231, 214, 0.9)',
              fontFamily: IDENTITY.fontEditorial,
              fontSize: 25,
              fontWeight: 700,
              letterSpacing: '0.16em',
              transform: `rotate(-7deg) scale(${interpolate(stampProg, [0, 1], [1.6, 1])})`,
            }}
          >
            BUKTI LANGSUNG 2017
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 08 — FOSIL BINTANG MATI & CTA KOMENTAR NAYSI (99.502s – 112.267s)
// ============================================================================

export const Scene08FosilBintang: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[7];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const voronoiGoldUrl = useProceduralSurface('voronoi-gold');
  const stellarUrl = useProceduralSurface('stellar-convection');

  const handSp = spring({ frame, fps, config: { damping: 18, stiffness: 78, mass: 1.0 } });
  const floatY = Math.sin(localSec * 1.45) * 10;

  // Interactive Naysi comment bar entrance during final sentence (107.4s .. 112.27s)
  const ctaProg = easeOutExpo(prog(globalSec, 107.35, 108.15));
  const sampleComment = 'Cincin emas di jari manis';
  const typedLen = Math.floor(clamp01((globalSec - 108.05) / 1.95) * sampleComment.length);
  const cursorVisible = Math.floor(localSec * 2.5) % 2 === 0;

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="walnut-grain"
        surfaceOpacity={0.34}
        warmLampX={50}
        warmLampY={42}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure="> 4,6 M"
        unit="TAHUN"
        subtitle="FOSIL BINTANG MATI · LEBIH TUA DARI MATAHARI & BUMI"
        localSec={localSec}
        accentColor={IDENTITY.bullion24k}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s8-sun-medallion">
            <circle cx={255} cy={625} r={68} />
          </clipPath>
          <linearGradient id="s8-skin-palm" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor="#DDA57E" />
            <stop offset="52%" stopColor="#B97B55" />
            <stop offset="100%" stopColor="#7C4B30" />
          </linearGradient>
          <linearGradient id="s8-skin-finger" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E6B28D" />
            <stop offset="100%" stopColor="#9C6240" />
          </linearGradient>
        </defs>

        {/* Comparative Timeline Medallions: Sun (4.6B yrs) vs Gold Atom (>4.6B yrs) */}
        <g opacity={easeOutCubic(clamp01(localSec / 0.85))}>
          <circle cx={255} cy={625} r={68} fill="#B85A28" />
          {stellarUrl && (
            <g clipPath="url(#s8-sun-medallion)">
              <image href={stellarUrl} x={182} y={552} width={146} height={146} />
            </g>
          )}
          <circle cx={255} cy={625} r={68} fill="none" stroke="rgba(237,232,221,0.4)" strokeWidth={2} />
          <text x={255} y={722} textAnchor="middle" fill={IDENTITY.ivoryText} fontFamily={IDENTITY.fontMono} fontSize={16} fontWeight={600} letterSpacing="0.12em">
            MATAHARI
          </text>
          <text x={255} y={744} textAnchor="middle" fill={IDENTITY.stoneText} fontFamily={IDENTITY.fontMono} fontSize={14}>
            4,6 MILIAR THN
          </text>

          <FacetedGoldNugget
            cx={1185}
            cy={625}
            size={54}
            goldTexUrl={voronoiGoldUrl}
            rotation={localSec * 9}
          />
          <text x={1185} y={722} textAnchor="middle" fill={IDENTITY.bullionLight} fontFamily={IDENTITY.fontMono} fontSize={16} fontWeight={700} letterSpacing="0.12em">
            INTI EMASMU
          </text>
          <text x={1185} y={744} textAnchor="middle" fill={IDENTITY.stoneText} fontFamily={IDENTITY.fontMono} fontSize={14}>
            LAHIR SEBELUMNYA
          </text>
        </g>

        {/* Rotating Engraved Brass Astrolabe & Guilloché Halo */}
        <GuillocheRosette
          cx={720}
          cy={835 + floatY}
          R={315}
          r={68}
          d={98}
          stroke="rgba(212, 160, 62, 0.22)"
          rotationDeg={localSec * 5.5}
        />
        <circle
          cx={720}
          cy={835 + floatY}
          r={335}
          fill="none"
          stroke="rgba(237, 232, 221, 0.16)"
          strokeWidth={1.3}
          strokeDasharray="3 9"
        />

        {/* Floating Three-Quarter 24K Gold Heirloom Band */}
        <g transform={`translate(0, ${floatY})`}>
          <Illustrated24KGoldRing
            cx={720}
            cy={815}
            rx={232}
            ry={82}
            bandHeight={78}
            goldTexUrl={voronoiGoldUrl}
            shimmerPhase={localSec * 1.5}
          />
        </g>

        {/* Refined 2D Editorial Illustrated Open Human Hand & Tailored Cuff */}
        <g
          transform={`translate(0, ${(1 - handSp) * 65})`}
          opacity={clamp01(handSp * 1.25)}
        >
          {/* Soft Shadow Cast by Floating Gold Ring onto Upturned Palm */}
          <ellipse cx={730} cy={1145} rx={155} ry={22} fill="rgba(0, 0, 0, 0.36)" />

          {/* Back Articulated Fingers (Ring & Little Finger) for True 2D Depth */}
          <path
            d="M 790,1222 C 885,1208 978,1194 1046,1188 C 1072,1186 1084,1208 1062,1222 C 998,1246 896,1264 795,1272 Z"
            fill="#8D5638"
          />
          <path
            d="M 775,1194 C 892,1174 1004,1158 1084,1150 C 1112,1148 1122,1174 1096,1189 C 1022,1216 908,1236 785,1246 Z"
            fill="#A16745"
          />

          {/* Middle & Index Fingers */}
          <path
            d="M 745,1168 C 874,1144 998,1126 1092,1118 C 1120,1116 1130,1144 1102,1160 C 1018,1188 892,1208 758,1220 Z"
            fill="url(#s8-skin-finger)"
          />

          {/* Main Anatomical Palm, Thenar Thumb Mound & Forearm */}
          <path
            d="M 332,1345 L 448,1236 C 504,1184 568,1148 648,1134 C 742,1118 878,1104 996,1094 C 1024,1092 1034,1120 1006,1134 C 920,1162 818,1178 742,1190 C 818,1194 934,1198 1018,1206 C 1044,1210 1042,1238 1012,1246 C 908,1274 786,1298 664,1312 C 566,1324 476,1342 396,1372 Z"
            fill="url(#s8-skin-palm)"
            stroke="rgba(255, 228, 202, 0.28)"
            strokeWidth={1.6}
          />

          {/* Articulated Opposable Thumb Resting Above Palm */}
          <path
            d="M 488,1222 C 542,1164 616,1122 698,1108 C 726,1104 736,1132 710,1146 C 650,1176 594,1212 548,1254 Z"
            fill="#DFAA84"
            stroke="rgba(104, 58, 34, 0.35)"
            strokeWidth={1.4}
          />

          {/* Subtle Engraved Woodcut Palmar Crease Lines */}
          <path
            d="M 556,1236 Q 668,1212 778,1218 M 595,1268 Q 710,1252 835,1254"
            fill="none"
            stroke="rgba(92, 48, 26, 0.36)"
            strokeWidth={1.8}
            strokeLinecap="round"
          />

          {/* Crisp Cream Shirt Cuff & Tailored Charcoal Jacket Sleeve */}
          <polygon
            points="318,1315 352,1292 426,1374 390,1398"
            fill={IDENTITY.paperCream}
            stroke="#2B241C"
            strokeWidth={1.5}
          />
          <polygon
            points="212,1388 324,1308 402,1396 278,1448"
            fill="#1E201D"
            stroke="rgba(237, 232, 221, 0.26)"
            strokeWidth={1.8}
          />
          <circle cx={326} cy={1366} r={5.5} fill={IDENTITY.bullion24k} />
        </g>
      </svg>

      {/* Interactive Naysi Closing Comment Pill Bar */}
      {ctaProg > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 148,
            right: 148,
            top: 1505,
            height: 118,
            borderRadius: 59,
            backgroundColor: 'rgba(20, 19, 17, 0.92)',
            border: '1.6px solid rgba(212, 160, 62, 0.38)',
            boxShadow: '0 22px 46px rgba(0, 0, 0, 0.58)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 22px',
            transform: `translateY(${(1 - ctaProg) * 34}px)`,
            opacity: ctaProg,
          }}
        >
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${IDENTITY.terracottaWarm} 0%, ${IDENTITY.terracottaStamp} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: IDENTITY.fontBody,
              fontSize: 34,
              fontWeight: 800,
              color: '#FFFFFF',
              marginRight: 24,
              flexShrink: 0,
            }}
          >
            N
          </div>

          <div
            style={{
              flex: 1,
              fontFamily: IDENTITY.fontBody,
              fontSize: 33,
              fontWeight: 600,
              color: IDENTITY.ivoryText,
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span>{sampleComment.slice(0, typedLen)}</span>
            <span
              style={{
                display: 'inline-block',
                width: 3.5,
                height: 36,
                marginLeft: 4,
                backgroundColor: IDENTITY.bullion24k,
                opacity: cursorVisible ? 1 : 0,
              }}
            />
          </div>

          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              backgroundColor: 'rgba(237, 232, 221, 0.08)',
              border: '1px solid rgba(237, 232, 221, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width={30} height={30} viewBox="0 0 24 24" fill="none">
              <path d="M3 20L21 12L3 4V10L15 12L3 14V20Z" fill={IDENTITY.ivoryText} />
            </svg>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
