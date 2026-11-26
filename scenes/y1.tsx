import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeInOutQuart,
  easeOutCubic,
  easeOutQuint,
  prog,
  smoothstep,
} from './script';
import {
  DocumentaryHeader,
  FacetedGoldNugget,
  MatteCanvasGround,
  TrimPath,
  buildOrthographicGlobe,
  mulberry32,
  useProceduralSurface,
} from './emas';

// ============================================================================
// SCENE 05 — SKALA RATUSAN BULAN VS KUBUS 21 METER & RUMAH (51.827s – 66.330s)
// ============================================================================

interface GoldenMoonSpec {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly depthLayer: 0 | 1 | 2;
  readonly phase: number;
}

export const Scene05RatusanBulan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[4];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const lunarUrl = useProceduralSurface('lunar-litho');
  const voronoiGoldUrl = useProceduralSurface('voronoi-gold');
  const hammeredGoldUrl = useProceduralSurface('hammered-gold');

  // Act transition: Cosmic Moon Swarm (0..7.7s) -> Ground Architectural Cube (7.7..14.5s)
  const panPhase = easeInOutQuart(prog(globalSec, 59.3, 61.3));
  const isHumanStage = panPhase > 0.48;
  const panY = interpolate(panPhase, [0, 1], [0, -1040]);

  const goldenMoons = useMemo<readonly GoldenMoonSpec[]>(() => {
    const rand = mulberry32(5079);
    const items: GoldenMoonSpec[] = [];
    for (let i = 0; i < 145; i++) {
      const ang = rand() * Math.PI * 2;
      const rad = Math.pow(rand(), 0.62) * 395;
      const layer: 0 | 1 | 2 = i < 75 ? 0 : i < 122 ? 1 : 2;
      items.push({
        x: 930 + Math.cos(ang) * rad * 0.96,
        y: 855 + Math.sin(ang) * rad * 0.84,
        r: layer === 2 ? 24 + rand() * 17 : layer === 1 ? 13 + rand() * 10 : 7 + rand() * 7,
        depthLayer: layer,
        phase: rand() * Math.PI * 2,
      });
    }
    return items;
  }, []);

  // Axonometric 21m Gold Bullion Cube coordinates (true ~2.45x height of 8.5m 2-story house)
  const cubeCx = 945;
  const cubeGroundY = 2385;
  const cubeW = 268; // half-width projection
  const cubeDy = 122; // isometric vertical rise
  const cubeH = 440; // 21.0 m vertical wall height

  const pBot = `${cubeCx},${cubeGroundY}`;
  const pLeftBot = `${cubeCx - cubeW},${cubeGroundY - cubeDy}`;
  const pRightBot = `${cubeCx + cubeW},${cubeGroundY - cubeDy}`;
  const pFrontTop = `${cubeCx},${cubeGroundY - cubeH}`;
  const pLeftTop = `${cubeCx - cubeW},${cubeGroundY - cubeDy - cubeH}`;
  const pRightTop = `${cubeCx + cubeW},${cubeGroundY - cubeDy - cubeH}`;
  const pBackTop = `${cubeCx},${cubeGroundY - cubeDy * 2 - cubeH}`;

  const topFacePts = `${pBackTop} ${pRightTop} ${pFrontTop} ${pLeftTop}`;
  const leftFacePts = `${pLeftTop} ${pFrontTop} ${pBot} ${pLeftBot}`;
  const rightFacePts = `${pFrontTop} ${pRightTop} ${pRightBot} ${pBot}`;

  const cubeEnterSp = spring({
    frame: Math.max(0, frame - Math.round(7.6 * fps)),
    fps,
    config: { damping: 17, stiffness: 86, mass: 1.0 },
  });

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="suede-slate"
        surfaceOpacity={0.28}
        warmLampX={isHumanStage ? 64 : 58}
        warmLampY={42}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure={isHumanStage ? '21 METER' : '100–300×'}
        unit={isHumanStage ? 'SISI KUBUS' : 'MASSA BULAN'}
        subtitle={
          isHumanStage
            ? 'SELURUH EMAS YANG PERNAH DITAMBANG MANUSIA (± 213.000 TON)'
            : 'AWAN EMAS MURNI YANG DISEMBURKAN SATU LEDAKAN KILONOVA'
        }
        localSec={localSec}
        accentColor={IDENTITY.bullion24k}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s5-moon-clip">
            <circle cx={275} cy={835} r={148} />
          </clipPath>
          <clipPath id="s5-cube-top">
            <polygon points={topFacePts} />
          </clipPath>
          <clipPath id="s5-cube-left">
            <polygon points={leftFacePts} />
          </clipPath>
          <clipPath id="s5-cube-right">
            <polygon points={rightFacePts} />
          </clipPath>
          <radialGradient id="s5-au-ball-hi" cx="34%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FAF0C8" />
            <stop offset="45%" stopColor="#D8A33E" />
            <stop offset="85%" stopColor="#8E6015" />
            <stop offset="100%" stopColor="#4A2F06" />
          </radialGradient>
          <radialGradient id="s5-au-ball-mid" cx="35%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#E6C270" />
            <stop offset="55%" stopColor="#B47F23" />
            <stop offset="100%" stopColor="#523508" />
          </radialGradient>
        </defs>

        <g transform={`translate(0, ${panY})`}>
          {/* ================================================================ */}
          {/* ACT 1: LITHOGRAPHIC EARTH MOON VS 145 GOLD MOON-MASS SPHERES     */}
          {/* ================================================================ */}
          <g opacity={clamp01(1 - panPhase * 1.45)}>
            {/* Left Reference: Earth's Cratered Moon */}
            <circle cx={275} cy={835} r={148} fill="#6F6D66" />
            {lunarUrl && (
              <g clipPath="url(#s5-moon-clip)">
                <image href={lunarUrl} x={122} y={682} width={306} height={306} />
                {/* Natural Lunar Terminator Shadow */}
                <path
                  d="M 275,687 A 148,148 0 0,1 275,983 A 96,148 0 0,0 275,687 Z"
                  fill="rgba(10, 12, 14, 0.44)"
                />
              </g>
            )}
            <circle
              cx={275}
              cy={835}
              r={148}
              fill="none"
              stroke="rgba(237, 232, 221, 0.45)"
              strokeWidth={2}
            />

            {/* Vernier Caliper Bracket Under Moon */}
            <line x1={127} y1={1018} x2={423} y2={1018} stroke={IDENTITY.ivoryText} strokeWidth={1.8} />
            <line x1={127} y1={1006} x2={127} y2={1030} stroke={IDENTITY.ivoryText} strokeWidth={1.8} />
            <line x1={423} y1={1006} x2={423} y2={1030} stroke={IDENTITY.ivoryText} strokeWidth={1.8} />
            <text
              x={275}
              y={1056}
              textAnchor="middle"
              fill={IDENTITY.ivoryText}
              fontFamily={IDENTITY.fontMono}
              fontSize={18}
              fontWeight={600}
              letterSpacing="0.14em"
            >
              1× BULAN BUMI
            </text>
            <text
              x={275}
              y={1084}
              textAnchor="middle"
              fill={IDENTITY.stoneText}
              fontFamily={IDENTITY.fontMono}
              fontSize={15}
              letterSpacing="0.12em"
            >
              Ø 3.474 KM
            </text>

            {/* Right Swarm: Hundreds of Moon-Mass Pure Gold Spheres */}
            {goldenMoons.map((gm, idx) => {
              const enter = easeOutQuint(clamp01((localSec - (idx % 30) * 0.03) / 0.95));
              const dx = Math.sin(localSec * 0.9 + gm.phase) * (gm.depthLayer + 1) * 3.5;
              const dy = Math.cos(localSec * 0.75 + gm.phase) * (gm.depthLayer + 1) * 3.0;
              return (
                <g key={idx} opacity={enter * (gm.depthLayer === 0 ? 0.55 : gm.depthLayer === 1 ? 0.82 : 1)}>
                  <circle
                    cx={gm.x + dx + 4}
                    cy={gm.y + dy + 6}
                    r={gm.r}
                    fill="rgba(0, 0, 0, 0.38)"
                  />
                  <circle
                    cx={gm.x + dx}
                    cy={gm.y + dy}
                    r={gm.r}
                    fill={gm.depthLayer === 2 ? 'url(#s5-au-ball-hi)' : 'url(#s5-au-ball-mid)'}
                    stroke={gm.depthLayer === 2 ? '#FAF0CA' : 'rgba(247,233,184,0.35)'}
                    strokeWidth={gm.depthLayer === 2 ? 1.4 : 0.7}
                  />
                </g>
              );
            })}

            {/* Lower Scale Comparison Plaque for Act 1 */}
            <g transform="translate(116, 1465)">
              <line x1={0} y1={0} x2={1208} y2={0} stroke={IDENTITY.hairlineBrass} strokeWidth={1.6} />
              <line x1={0} y1={148} x2={1208} y2={148} stroke={IDENTITY.hairlineBrass} strokeWidth={1.6} />
              <text
                x={0}
                y={52}
                fill={IDENTITY.stoneText}
                fontFamily={IDENTITY.fontMono}
                fontSize={18}
                fontWeight={600}
                letterSpacing="0.16em"
              >
                HASIL 1 KILONOVA TUNGGAL
              </text>
              <text
                x={0}
                y={114}
                fill={IDENTITY.bullionLight}
                fontFamily={IDENTITY.fontEditorial}
                fontSize={48}
                fontWeight={700}
                letterSpacing="0.04em"
              >
                RATUSAN KALI BERAT BULAN DALAM DETIK
              </text>
            </g>
          </g>

          {/* ================================================================ */}
          {/* ACT 2: ARCHITECTURAL GROUND ELEVATION (2-STORY HOUSE VS 21M CUBE)*/}
          {/* ================================================================ */}
          <g opacity={clamp01((panPhase - 0.12) / 0.65)}>
            {/* Drafted Architectural Ground Horizon & Subtle Yard Trees */}
            <line
              x1={84}
              y1={cubeGroundY}
              x2={1356}
              y2={cubeGroundY}
              stroke="rgba(237, 232, 221, 0.42)"
              strokeWidth={2.2}
            />
            {/* Architectural Hatch Marks Under Ground Baseline */}
            {Array.from({ length: 36 }).map((_, i) => {
              const gx = 96 + i * 35;
              return (
                <line
                  key={i}
                  x1={gx}
                  y1={cubeGroundY}
                  x2={gx - 14}
                  y2={cubeGroundY + 18}
                  stroke="rgba(237, 232, 221, 0.18)"
                  strokeWidth={1.2}
                />
              );
            })}

            {/* Detailed 2-Story Brick & Timber House (True ~8.8m Height vs 21m Cube) */}
            <g transform={`translate(185, ${cubeGroundY})`}>
              {/* Background Cypress/Garden Trees */}
              <path
                d="M -32,0 L -18,-92 L -4,-0 Z M 338,0 L 356,-112 L 374,0 Z"
                fill="rgba(74, 84, 62, 0.55)"
              />

              {/* Brick Chimney */}
              <rect x={238} y={-206} width={28} height={62} fill="#4E3529" stroke="#7A5745" strokeWidth={1.2} />
              <rect x={234} y={-212} width={36} height={8} fill="#6B4A3A" />

              {/* Main 2-Story Masonry Walls (Width 290, Wall Height 136px) */}
              <rect
                x={16}
                y={-136}
                width={290}
                height={136}
                fill="#2D2A26"
                stroke="rgba(237, 232, 221, 0.36)"
                strokeWidth={1.6}
              />
              {/* Subtle Horizontal Brick/Cladding Courses */}
              {[-24, -48, -72, -96, -120].map((wy, idx) => (
                <line
                  key={idx}
                  x1={18}
                  y1={wy}
                  x2={304}
                  y2={wy}
                  stroke="rgba(237, 232, 221, 0.08)"
                  strokeWidth={1}
                />
              ))}
              {/* Mid-floor Belt Cornice */}
              <rect x={12} y={-72} width={298} height={6} fill="#4A453E" />

              {/* Pitched Terracotta Clay-Tile Roof (Peak at -204px) */}
              <polygon
                points="0,-136 161,-206 322,-136"
                fill="#6E3B2B"
                stroke="#B87B62"
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {/* Roof Tile Courses */}
              {[-148, -162, -176, -190].map((ry, idx) => {
                const frac = (ry + 136) / -70;
                const halfSpan = (1 - frac) * 156;
                return (
                  <line
                    key={idx}
                    x1={161 - halfSpan}
                    y1={ry}
                    x2={161 + halfSpan}
                    y2={ry}
                    stroke="rgba(237, 214, 196, 0.22)"
                    strokeWidth={1.1}
                  />
                );
              })}

              {/* 2nd Floor Casement Windows with Mullions & Warm Interior Lamplight */}
              {[42, 108, 174, 240].map((wx, idx) => (
                <g key={idx}>
                  <rect
                    x={wx}
                    y={-120}
                    width={38}
                    height={36}
                    fill="#E5B55C"
                    stroke="#EDE8DD"
                    strokeWidth={1.5}
                  />
                  <line x1={wx + 19} y1={-120} x2={wx + 19} y2={-84} stroke="#2D2A26" strokeWidth={1.6} />
                  <line x1={wx} y1={-102} x2={wx + 38} y2={-102} stroke="#2D2A26" strokeWidth={1.4} />
                </g>
              ))}

              {/* 1st Floor Windows + Covered Front Porch & Timber Door */}
              {[42, 240].map((wx, idx) => (
                <g key={idx}>
                  <rect
                    x={wx}
                    y={-54}
                    width={38}
                    height={36}
                    fill="#DFA94E"
                    stroke="#EDE8DD"
                    strokeWidth={1.5}
                  />
                  <line x1={wx + 19} y1={-54} x2={wx + 19} y2={-18} stroke="#2D2A26" strokeWidth={1.6} />
                  <line x1={wx} y1={-36} x2={wx + 38} y2={-36} stroke="#2D2A26" strokeWidth={1.4} />
                </g>
              ))}

              {/* Front Porch Canopy, Columns & Door */}
              <polygon points="108,-60 161,-76 214,-60" fill="#524B43" stroke="#EDE8DD" strokeWidth={1.2} />
              <line x1={116} y1={-60} x2={116} y2={0} stroke="#CFC8BC" strokeWidth={2.5} />
              <line x1={206} y1={-60} x2={206} y2={0} stroke="#CFC8BC" strokeWidth={2.5} />
              <rect x={142} y={-52} width={38} height={52} fill="#5C3D28" stroke="#D8C8B0" strokeWidth={1.4} />
              <circle cx={173} cy={-25} r={2.2} fill={IDENTITY.bullionLight} />

              {/* Human Scale Silhouette (1,7 m) Standing Right Next to House */}
              <g transform="translate(342, 0)">
                <circle cx={0} cy={-34} r={4.5} fill={IDENTITY.ivoryText} />
                <path
                  d="M -5,-28 H 5 L 6,-13 H 3 L 3,0 H -3 L -3,-13 H -6 Z"
                  fill={IDENTITY.ivoryText}
                />
              </g>

              {/* House & Human Scale Labels */}
              <text
                x={161}
                y={40}
                textAnchor="middle"
                fill={IDENTITY.ivoryText}
                fontFamily={IDENTITY.fontMono}
                fontSize={18}
                fontWeight={600}
                letterSpacing="0.14em"
              >
                RUMAH 2 LANTAI (± 8,5 M)
              </text>
              <text
                x={342}
                y={40}
                textAnchor="middle"
                fill={IDENTITY.stoneText}
                fontFamily={IDENTITY.fontMono}
                fontSize={15}
                letterSpacing="0.1em"
              >
                1,7 M
              </text>
            </g>

            {/* Stacked 21x21x21 Meter World Gold Bullion Cube */}
            <g
              transform={`translate(${cubeCx}, ${cubeGroundY}) scale(${interpolate(
                cubeEnterSp,
                [0, 1],
                [0.84, 1],
              )}) translate(${-cubeCx}, ${-cubeGroundY})`}
            >
              {/* Cast Architectural Ground Shadow */}
              <polygon
                points={`${cubeCx - cubeW},${cubeGroundY - cubeDy} ${cubeCx},${cubeGroundY} ${
                  cubeCx + 150
                },${cubeGroundY + 34} ${cubeCx - cubeW - 95},${cubeGroundY - cubeDy + 26}`}
                fill="rgba(0, 0, 0, 0.54)"
              />

              {/* TOP SUNLIT FACE */}
              <polygon points={topFacePts} fill="#F2DC9B" />
              {voronoiGoldUrl && (
                <g clipPath="url(#s5-cube-top)" opacity={0.42}>
                  <image
                    href={voronoiGoldUrl}
                    x={cubeCx - cubeW - 10}
                    y={cubeGroundY - cubeDy * 2 - cubeH - 10}
                    width={cubeW * 2 + 20}
                    height={cubeDy * 2 + 20}
                    preserveAspectRatio="none"
                  />
                </g>
              )}

              {/* LEFT WARM BULLION FACE WITH STACKED INGOT COURSES */}
              <polygon points={leftFacePts} fill="#D49E39" />
              {hammeredGoldUrl && (
                <g clipPath="url(#s5-cube-left)" opacity={0.46}>
                  <image
                    href={hammeredGoldUrl}
                    x={cubeCx - cubeW - 10}
                    y={cubeGroundY - cubeDy - cubeH - 10}
                    width={cubeW + 20}
                    height={cubeH + cubeDy + 20}
                    preserveAspectRatio="none"
                  />
                </g>
              )}
              {/* Visible Horizontal Stacked Bullion Courses on Left Face */}
              <g clipPath="url(#s5-cube-left)" opacity={0.34}>
                {Array.from({ length: 14 }).map((_, rIdx) => {
                  const yOff = (rIdx / 14) * cubeH;
                  return (
                    <line
                      key={rIdx}
                      x1={cubeCx - cubeW}
                      y1={cubeGroundY - cubeDy - cubeH + yOff}
                      x2={cubeCx}
                      y2={cubeGroundY - cubeH + yOff}
                      stroke="#593A08"
                      strokeWidth={1.2}
                    />
                  );
                })}
              </g>

              {/* RIGHT SHADED BULLION FACE WITH STACKED INGOT COURSES */}
              <polygon points={rightFacePts} fill="#966717" />
              {hammeredGoldUrl && (
                <g clipPath="url(#s5-cube-right)" opacity={0.38}>
                  <image
                    href={hammeredGoldUrl}
                    x={cubeCx - 10}
                    y={cubeGroundY - cubeDy - cubeH - 10}
                    width={cubeW + 20}
                    height={cubeH + cubeDy + 20}
                    preserveAspectRatio="none"
                  />
                </g>
              )}
              <g clipPath="url(#s5-cube-right)" opacity={0.36}>
                {Array.from({ length: 14 }).map((_, rIdx) => {
                  const yOff = (rIdx / 14) * cubeH;
                  return (
                    <line
                      key={rIdx}
                      x1={cubeCx}
                      y1={cubeGroundY - cubeH + yOff}
                      x2={cubeCx + cubeW}
                      y2={cubeGroundY - cubeDy - cubeH + yOff}
                      stroke="#3B2505"
                      strokeWidth={1.2}
                    />
                  );
                })}
              </g>

              {/* Crisp Chamfered Gold Edges */}
              <polygon points={topFacePts} fill="none" stroke="#FCF4D4" strokeWidth={2.4} strokeLinejoin="round" />
              <polyline points={`${pLeftTop} ${pLeftBot} ${pBot} ${pRightBot} ${pRightTop}`} fill="none" stroke="#E5C068" strokeWidth={2.0} />
              <line x1={cubeCx} y1={cubeGroundY - cubeH} x2={cubeCx} y2={cubeGroundY} stroke="#FAF0CA" strokeWidth={2.6} />

              {/* Vertical Engineering Dimension Caliper: 21,0 METER */}
              <g transform={`translate(${cubeCx + cubeW + 34}, 0)`}>
                <line
                  x1={0}
                  y1={cubeGroundY - cubeDy - cubeH}
                  x2={0}
                  y2={cubeGroundY - cubeDy}
                  stroke={IDENTITY.bullionLight}
                  strokeWidth={2}
                />
                <line x1={-12} y1={cubeGroundY - cubeDy - cubeH} x2={12} y2={cubeGroundY - cubeDy - cubeH} stroke={IDENTITY.bullionLight} strokeWidth={2} />
                <line x1={-12} y1={cubeGroundY - cubeDy} x2={12} y2={cubeGroundY - cubeDy} stroke={IDENTITY.bullionLight} strokeWidth={2} />
                <text
                  x={20}
                  y={cubeGroundY - cubeDy - cubeH / 2 + 8}
                  fill={IDENTITY.bullionLight}
                  fontFamily={IDENTITY.fontEditorial}
                  fontSize={34}
                  fontWeight={700}
                >
                  21 M
                </text>
              </g>

              <text
                x={cubeCx}
                y={cubeGroundY + 44}
                textAnchor="middle"
                fill={IDENTITY.bullionLight}
                fontFamily={IDENTITY.fontMono}
                fontSize={18}
                fontWeight={700}
                letterSpacing="0.14em"
              >
                KUBUS EMAS DUNIA · 21 × 21 × 21 M
              </text>
            </g>

            {/* Bottom Architectural Fact Strip */}
            <g transform={`translate(116, ${cubeGroundY + 108})`}>
              <rect
                x={0}
                y={0}
                width={1208}
                height={128}
                fill="rgba(22, 23, 20, 0.9)"
                stroke={IDENTITY.hairlineBrass}
                strokeWidth={1.6}
              />
              <text
                x={36}
                y={48}
                fill={IDENTITY.stoneText}
                fontFamily={IDENTITY.fontMono}
                fontSize={17}
                fontWeight={600}
                letterSpacing="0.16em"
              >
                TOTAL TAMBANG SEJARAH MANUSIA (± 6.000 TAHUN PERADABAN)
              </text>
              <text
                x={36}
                y={98}
                fill={IDENTITY.ivoryText}
                fontFamily={IDENTITY.fontEditorial}
                fontSize={38}
                fontWeight={700}
                letterSpacing="0.04em"
              >
                213.000 TON EMAS = HANYA 1 BANGUNAN KUBUS 21 METER
              </text>
            </g>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 06 — BUMI PURBA D3-GEO CUTAWAY & HUJAN METEORIT (66.330s – 82.456s)
// ============================================================================

interface ChondriteMeteorSpec {
  readonly startX: number;
  readonly startY: number;
  readonly hitAngleDeg: number;
  readonly delay: number;
  readonly size: number;
}

export const Scene06HujanMeteor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[5];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const voronoiGoldUrl = useProceduralSurface('voronoi-gold');
  const hammeredGoldUrl = useProceduralSurface('hammered-gold');

  // Beat A: Molten Earth & Sinking Gold (66.33..74.15s) | Beat B: Meteorite Bombardment (74.15..82.45s)
  const bombardPhase = easeInOutCubic(prog(globalSec, 74.1, 75.6));
  const isBombard = bombardPhase > 0.35;

  const cx = 720;
  const cy = 965;
  const R = 378;

  // Real Natural Earth 50m Orthographic Globe rotating smoothly over Indonesia & Indo-Pacific!
  const rotLon = -116 + localSec * 2.1;
  const globe = useMemo(
    () => buildOrthographicGlobe(cx, cy, R, rotLon, -6, false),
    [cx, cy, R, Math.round(rotLon * 4) / 4],
  );

  // 110-degree anatomical interior cutaway wedge on lower-left quadrant (135 deg to 245 deg)
  const wedgePath = useMemo(() => {
    const a1 = (125 * Math.PI) / 180;
    const a2 = (245 * Math.PI) / 180;
    const x1 = cx + Math.cos(a1) * (R + 4);
    const y1 = cy + Math.sin(a1) * (R + 4);
    const x2 = cx + Math.cos(a2) * (R + 4);
    const y2 = cy + Math.sin(a2) * (R + 4);
    return `M ${cx},${cy} L ${x1.toFixed(1)},${y1.toFixed(1)} A ${R + 4},${R + 4} 0 0,1 ${x2.toFixed(
      1,
    )},${y2.toFixed(1)} Z`;
  }, [cx, cy, R]);

  const meteors = useMemo<readonly ChondriteMeteorSpec[]>(() => {
    const rand = mulberry32(6079);
    return Array.from({ length: 12 }).map((_, i) => ({
      startX: 1080 + rand() * 420,
      startY: 220 + rand() * 380,
      hitAngleDeg: -62 + i * 11.5 + (rand() - 0.5) * 5,
      delay: i * 0.34,
      size: 16 + rand() * 11,
    }));
  }, []);

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="suede-slate"
        surfaceOpacity={0.26}
        warmLampX={52}
        warmLampY={40}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure={isBombard ? '20×10¹⁸' : '≈ 99%'}
        unit={isBombard ? 'TON METEORIT' : 'TENGGELAM KE INTI'}
        subtitle={
          isBombard
            ? 'HUJAN METEOR 3,9 MILIAR TAHUN LALU · PENABUR EMAS DI KERAK BUMI'
            : 'SAAT BUMI MUDA CAIR · EMAS AWAL TERKUBUR 3.000 KM DI BAWAH KITA'
        }
        localSec={localSec}
        accentColor={isBombard ? IDENTITY.bullion24k : IDENTITY.ochreMineral}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="s6-ocean-grad" cx="38%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#264356" />
            <stop offset="65%" stopColor="#162836" />
            <stop offset="100%" stopColor="#0C1720" />
          </radialGradient>
          <radialGradient id="s6-mantle-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D87D36" />
            <stop offset="52%" stopColor="#9E3F22" />
            <stop offset="85%" stopColor="#5C2316" />
            <stop offset="100%" stopColor="#2E1510" />
          </radialGradient>
          <clipPath id="s6-earth-disk">
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>
          <clipPath id="s6-cutaway-wedge">
            <path d={wedgePath} />
          </clipPath>
          <clipPath id="s6-gold-core">
            <circle cx={cx} cy={cy} r={108} />
          </clipPath>
        </defs>

        {/* Orbital Coordinate Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={R + 46}
          fill="none"
          stroke="rgba(237, 232, 221, 0.14)"
          strokeWidth={1.2}
          strokeDasharray="4 8"
        />

        {/* EXTERIOR REAL NATURAL EARTH ORTHOGRAPHIC GLOBE */}
        <g clipPath="url(#s6-earth-disk)">
          <circle cx={cx} cy={cy} r={R} fill="url(#s6-ocean-grad)" />
          {/* Early Hadean Magma Ocean Tint Fading into Cooled Archean Ocean */}
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill="#8E331B"
            opacity={(1 - bombardPhase) * 0.48}
          />
          <path d={globe.graticulePath} fill="none" stroke="rgba(237, 232, 221, 0.12)" strokeWidth={1} />
          <path
            d={globe.landPath}
            fill={isBombard ? '#4A563E' : '#3C2D24'}
            stroke="rgba(237, 232, 221, 0.34)"
            strokeWidth={1.2}
          />
          {/* Natural Spherical Limb Vignette */}
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke="rgba(6, 10, 14, 0.55)"
            strokeWidth={44}
          />
        </g>

        {/* GEOLOGICAL INTERIOR CUTAWAY WEDGE + SOLID GOLD-IRON CORE */}
        <g clipPath="url(#s6-cutaway-wedge)">
          <circle cx={cx} cy={cy} r={R} fill="#2B211B" />
          <circle cx={cx} cy={cy} r={352} fill="url(#s6-mantle-grad)" stroke="rgba(237,232,221,0.22)" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={268} fill="#7B2D19" stroke="rgba(237,232,221,0.18)" strokeWidth={1.3} />
          <circle cx={cx} cy={cy} r={192} fill="#B85C28" stroke="rgba(247,233,184,0.3)" strokeWidth={1.5} />
        </g>

        {/* Cutaway Wedge Framing Lines */}
        <path d={wedgePath} fill="none" stroke="rgba(237, 232, 221, 0.45)" strokeWidth={2.2} />

        {/* Central Sunken Gold-Iron Inner Core (Always Visible at Center of Cutaway) */}
        <circle cx={cx} cy={cy} r={108} fill={IDENTITY.bullion24k} />
        {hammeredGoldUrl && (
          <g clipPath="url(#s6-gold-core)" opacity={0.62}>
            <image href={hammeredGoldUrl} x={cx - 112} y={cy - 112} width={224} height={224} />
          </g>
        )}
        <circle cx={cx} cy={cy} r={108} fill="none" stroke="#FAF0CA" strokeWidth={2.5} />

        {/* Sinking Gold Droplets Drawn into Earth's Core During Beat A */}
        {!isBombard &&
          Array.from({ length: 12 }).map((_, i) => {
            const ang = ((135 + (i / 11) * 102) * Math.PI) / 180;
            const u = (localSec * 0.36 + i * 0.19) % 1;
            const rad = interpolate(u, [0, 1], [342, 118]);
            return (
              <circle
                key={i}
                cx={cx + Math.cos(ang) * rad}
                cy={cy + Math.sin(ang) * rad}
                r={7 * (1 - u * 0.35)}
                fill="#FAF0CA"
                stroke={IDENTITY.bullionDeep}
                strokeWidth={1.2}
                opacity={smoothstep(Math.min(u * 5, (1 - u) * 5))}
              />
            );
          })}

        {/* Crisp Core Pill Tag */}
        <rect
          x={cx - 108}
          y={cy - 20}
          width={216}
          height={40}
          rx={4}
          fill="rgba(18, 14, 8, 0.88)"
          stroke={IDENTITY.bullionLight}
          strokeWidth={1.5}
        />
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          fill={IDENTITY.bullionLight}
          fontFamily={IDENTITY.fontMono}
          fontSize={16}
          fontWeight={700}
          letterSpacing="0.14em"
        >
          INTI BESI & EMAS
        </text>

        {/* Outer Crust Rim */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(237, 232, 221, 0.42)" strokeWidth={2.4} />

        {/* BEAT B: Faceted Stony-Iron Chondrite Meteorite Shower & Crustal Gold Veins */}
        {bombardPhase > 0.02 &&
          meteors.map((m, idx) => {
            const elapsed = globalSec - 74.2 - m.delay;
            if (elapsed < 0) return null;
            const hitRad = (m.hitAngleDeg * Math.PI) / 180;
            const targetX = cx + Math.cos(hitRad) * (R - 6);
            const targetY = cy + Math.sin(hitRad) * (R - 6);
            const flight = clamp01(elapsed / 0.95);
            const landed = flight >= 1;

            const curX = interpolate(easeOutCubic(flight), [0, 1], [m.startX, targetX]);
            const curY = interpolate(easeOutCubic(flight), [0, 1], [m.startY, targetY]);
            const dx = targetX - m.startX;
            const dy = targetY - m.startY;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;

            return (
              <g key={idx}>
                {!landed && (
                  <g>
                    {/* Matte Terracotta-Ochre Friction Plume (Strictly Non-Neon) */}
                    <polygon
                      points={`${curX},${curY} ${curX - ux * 150 - uy * 12},${
                        curY - uy * 150 + ux * 12
                      } ${curX - ux * 150 + uy * 12},${curY - uy * 150 - ux * 12}`}
                      fill="rgba(212, 131, 59, 0.42)"
                    />
                    {/* Rocky Brecciated Chondrite Asteroid Body with Gold Inclusion */}
                    <g transform={`translate(${curX}, ${curY}) rotate(${elapsed * 140})`}>
                      <polygon
                        points={`0,${-m.size} ${m.size * 0.9},${-m.size * 0.3} ${m.size * 0.7},${
                          m.size * 0.8
                        } ${-m.size * 0.6},${m.size * 0.9} ${-m.size},${-m.size * 0.2}`}
                        fill="#4A433C"
                        stroke="#D8A444"
                        strokeWidth={2}
                      />
                      <circle cx={3} cy={-2} r={m.size * 0.34} fill="#F4DF9E" />
                    </g>
                  </g>
                )}

                {landed && (
                  <FacetedGoldNugget
                    cx={targetX}
                    cy={targetY}
                    size={16}
                    goldTexUrl={voronoiGoldUrl}
                    rotation={idx * 37}
                  />
                )}
              </g>
            );
          })}

        {/* Geological Epoch Comparison Bar Below Globe */}
        <g transform="translate(116, 1485)">
          <rect
            x={0}
            y={0}
            width={1208}
            height={156}
            fill="rgba(18, 22, 26, 0.9)"
            stroke={IDENTITY.hairlineIvory}
            strokeWidth={1.6}
          />
          <line x1={604} y1={20} x2={604} y2={136} stroke={IDENTITY.hairlineIvory} strokeWidth={1.5} />

          {/* Left Epoch: 4.54B Years */}
          <g opacity={isBombard ? 0.52 : 1}>
            <text x={36} y={48} fill={IDENTITY.ochreMineral} fontFamily={IDENTITY.fontMono} fontSize={17} fontWeight={700} letterSpacing="0.14em">
              FASE 1 · 4,5 MILIAR THN LALU
            </text>
            <text x={36} y={94} fill={IDENTITY.ivoryText} fontFamily={IDENTITY.fontEditorial} fontSize={32} fontWeight={700}>
              EMAS AWAL TENGGELAM KE INTI
            </text>
            <text x={36} y={126} fill={IDENTITY.stoneText} fontFamily={IDENTITY.fontMono} fontSize={15}>
              TERKUBUR DI KEDALAMAN 2.900+ KM
            </text>
          </g>

          {/* Right Epoch: 3.90B Years (Willbold & Elliott, Nature 2011) */}
          <g opacity={isBombard ? 1 : 0.42}>
            <text x={640} y={48} fill={IDENTITY.bullionLight} fontFamily={IDENTITY.fontMono} fontSize={17} fontWeight={700} letterSpacing="0.14em">
              FASE 2 · 3,9 MILIAR THN LALU
            </text>
            <text x={640} y={94} fill={IDENTITY.ivoryText} fontFamily={IDENTITY.fontEditorial} fontSize={32} fontWeight={700}>
              HUJAN METEORIT LAPISI KERAK
            </text>
            <text x={640} y={126} fill={IDENTITY.stoneText} fontFamily={IDENTITY.fontMono} fontSize={15}>
              SUMBER SELURUH TAMBANG EMAS MANUSIA
            </text>
          </g>
        </g>

        {/* Leader Line to Crustal Ore Deposits */}
        {isBombard && (
          <g opacity={easeOutCubic(clamp01((globalSec - 76.2) / 0.8))}>
            <TrimPath
              d={`M ${cx + R - 4},${cy - 48} L 1225,795`}
              progress={clamp01((globalSec - 76.2) / 0.7)}
              stroke={IDENTITY.bullionLight}
              strokeWidth={2}
            />
            <text x={1330} y={768} textAnchor="end" fill={IDENTITY.bullionLight} fontFamily={IDENTITY.fontMono} fontSize={17} fontWeight={700}>
              KERAK LUAR
            </text>
            <text x={1330} y={794} textAnchor="end" fill={IDENTITY.ivoryText} fontFamily={IDENTITY.fontMono} fontSize={15}>
              BISA DITAMBANG
            </text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
