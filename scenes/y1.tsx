import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { noise2D } from '@remotion/noise';
import { makeStar } from '@remotion/shapes';
import {
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  prog,
} from './script';
import {
  CelestialPlateSheet,
  CosmicStarfield,
  CrateredMoonObject,
  GoldenMotesOverlay,
  HandcraftedGoldNugget,
  SpecimenBadge,
} from './emas';

// ============================================================================
// LEMBAR 05 — SKALA KOSMIK: SEA OF GOLDEN MOONS IN SPACE vs HOUSE-SIZED CUBE
// Pure 2D tangible visual object scene (ZERO bar charts, ZERO graphs!):
//  - Upper sky: Earth's cratered silver Moon floating beside a colossal
//    glittering swarm of golden moon-spheres & kilonova gold clouds
//  - Lower earthly hilltop (reveals at 59.5s): A warm-lit 2-story house
//    standing beside the single 21-meter Solid 24K Gold Cube containing all
//    gold ever mined by humankind!
// ============================================================================

export const Lembar05RatusanBulan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[4];
  const localT = Math.max(0, sec - ch.start);

  const swarmReveal = easeOutCubic(prog(sec, ch.start + 0.15, 58.6));
  const houseCubeIn = spring({
    frame: Math.max(0, Math.round((sec - 59.45) * fps)),
    fps,
    config: { damping: 18, stiffness: 84, mass: 1.08 },
  });

  const glintStar = makeStar({ points: 4, innerRadius: 3, outerRadius: 22 });

  return (
    <CelestialPlateSheet chapter={ch}>
      <svg width={1208} height={1298} viewBox="0 0 1208 1298">
        <defs>
          <linearGradient id="l5-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#070B18" />
            <stop offset="62%" stopColor="#101A33" />
            <stop offset="100%" stopColor="#1C2438" />
          </linearGradient>

          <radialGradient id="l5-gold-nebula" cx="55%" cy="42%" r="54%">
            <stop offset="0%" stopColor="#FFE48F" stopOpacity="0.46" />
            <stop offset="44%" stopColor="#E59A24" stopOpacity="0.24" />
            <stop offset="78%" stopColor="#7C341E" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#090E1F" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="l5-gold-sphere" cx="34%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#FFF8D2" />
            <stop offset="32%" stopColor="#FFD257" />
            <stop offset="72%" stopColor="#C88414" />
            <stop offset="100%" stopColor="#5C3604" />
          </radialGradient>

          {/* 24K Isometric Gold Cube Facets */}
          <linearGradient id="l5-cube-top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF8D6" />
            <stop offset="100%" stopColor="#F5BD3B" />
          </linearGradient>
          <linearGradient id="l5-cube-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0B12E" />
            <stop offset="100%" stopColor="#A66B0E" />
          </linearGradient>
          <linearGradient id="l5-cube-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9C630B" />
            <stop offset="100%" stopColor="#543103" />
          </linearGradient>
        </defs>

        {/* 1. Deep Night Cosmos & Golden Kilonova Nebula */}
        <rect width={1208} height={1298} fill="url(#l5-sky)" />
        <CosmicStarfield seed="l5-stars" count={92} driftX={6} driftY={-3} />

        <ellipse
          cx={720}
          cy={420}
          rx={560}
          ry={360}
          fill="url(#l5-gold-nebula)"
          transform="rotate(-14 720 420)"
          opacity={swarmReveal}
        />

        {/* 2. VAST SWARM OF HUNDREDS OF GOLDEN MOON-SPHERES IN DEEP SPACE */}
        {Array.from({ length: 64 }).map((_, i) => {
          const appear = clamp01(swarmReveal * 1.5 - (i / 64) * 0.65);
          if (appear <= 0.01) return null;

          // Distribute across a sweeping diagonal celestial band (x: 340..1160, y: 80..760)
          const u = (i * 0.61803398875) % 1;
          const v = ((i + 0.5) / 64);
          const wobbleX = noise2D('l5-gx', i * 0.4, localT * 0.25) * 14;
          const wobbleY = noise2D('l5-gy', 0.8, i * 0.4 + localT * 0.25) * 14;
          const gx = 370 + u * 780 + wobbleX;
          const gy = 88 + v * 660 + Math.sin(u * Math.PI * 2) * 48 + wobbleY;
          const r = (i % 9 === 0 ? 44 : i % 4 === 0 ? 28 : 16) * appear;

          return (
            <g key={i} opacity={0.48 + (i % 5) * 0.12}>
              <circle
                cx={gx}
                cy={gy}
                r={r * 1.45}
                fill="rgba(255, 214, 96, 0.16)"
              />
              <circle
                cx={gx}
                cy={gy}
                r={r}
                fill="url(#l5-gold-sphere)"
                stroke="#5A3604"
                strokeWidth={1.2}
              />
              {/* Subtle crater detail on larger golden moon spheres */}
              {r > 26 && (
                <>
                  <circle
                    cx={gx - r * 0.24}
                    cy={gy - r * 0.18}
                    r={r * 0.18}
                    fill="rgba(255, 252, 224, 0.35)"
                  />
                  <circle
                    cx={gx + r * 0.22}
                    cy={gy + r * 0.2}
                    r={r * 0.15}
                    fill="rgba(92, 54, 4, 0.32)"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Foreground Hero Reference: Earth's Real Silver-Gray Cratered Moon! */}
        <g
          transform={`translate(0, ${(1 - clamp01(localT * 1.6)) * 30})`}
          opacity={clamp01(localT * 2.2)}
        >
          <CrateredMoonObject cx={238} cy={356} radius={136} phaseShadowOffset={0.42} />
          {/* Subtle callout tag right under the Moon */}
          <g transform="translate(238, 526)">
            <rect
              x={-88}
              y={-18}
              width={176}
              height={36}
              rx={3}
              fill="rgba(12, 16, 28, 0.84)"
              stroke="rgba(245, 241, 230, 0.45)"
              strokeWidth={1.5}
            />
            <text
              x={0}
              y={6}
              textAnchor="middle"
              fontFamily={IDENTITY.fontMono}
              fontWeight={700}
              fontSize={16}
              fill="#F5F1E6"
              letterSpacing="0.12em"
            >
              1 BULAN BUMI
            </text>
          </g>
        </g>

        {/* ================================================================ */}
        {/* 3. LOWER EARTHLY HILLTOP: 2-STORY HOUSE BESIDE THE 21M GOLD CUBE */}
        {/* ================================================================ */}
        {/* Distant Evening Hills */}
        <path
          d="M 0 1035 Q 290 968, 620 1012 T 1208 982 L 1208 1298 L 0 1298 Z"
          fill="#101726"
        />
        <path
          d="M 0 1088 Q 360 1036, 740 1072 T 1208 1054 L 1208 1298 L 0 1298 Z"
          fill="#0B101B"
        />

        {houseCubeIn > 0.01 && (
          <g
            transform={`translate(0, ${(1 - houseCubeIn) * 120})`}
            opacity={clamp01(houseCubeIn * 1.25)}
          >
            {/* Warm Golden Bounce Glow on Hilltop Ground */}
            <ellipse
              cx={690}
              cy={1136}
              rx={265}
              ry={44}
              fill="rgba(245, 188, 56, 0.24)"
            />

            {/* Cypress & Pine Trees Silhouette */}
            {[
              [238, 1076, 0.9],
              [282, 1082, 0.72],
              [948, 1068, 0.95],
              [998, 1076, 0.76],
            ].map(([tx, ty, sc], idx) => (
              <g key={idx} transform={`translate(${tx}, ${ty}) scale(${sc})`}>
                <rect x={-4} y={-14} width={8} height={24} fill="#090D16" />
                <polygon points="0,-96 -26,-34 26,-34" fill="#131E2E" />
                <polygon points="0,-72 -32,-10 32,-10" fill="#0F1826" />
              </g>
            ))}

            {/* Illustrated 2-Story Human House (Left of the Gold Cube, ~14m tall) */}
            <g transform="translate(432, 1088)">
              {/* Ground shadow */}
              <ellipse cx={0} cy={18} rx={115} ry={16} fill="rgba(0,0,0,0.65)" />
              {/* Main 2-story walls */}
              <rect
                x={-84}
                y={-106}
                width={168}
                height={118}
                fill="#252C3D"
                stroke="#0B0E17"
                strokeWidth={2.5}
              />
              {/* Side gable wall */}
              <rect x={24} y={-106} width={60} height={118} fill="#1B2130" />
              {/* Chimney */}
              <rect x={44} y={-162} width={22} height={44} fill="#2E2426" />
              {/* Pitched Roof */}
              <polygon
                points="-98,-104 0,-168 98,-104"
                fill="#3D292A"
                stroke="#0B0E17"
                strokeWidth={2.5}
              />
              {/* Warm Golden Lit Windows (2 floors!) */}
              {[
                [-56, -84],
                [-14, -84],
                [42, -84],
                [-56, -38],
                [42, -38],
              ].map(([wx, wy], wIdx) => (
                <g key={wIdx}>
                  <rect
                    x={wx}
                    y={wy}
                    width={24}
                    height={28}
                    rx={2}
                    fill="#FFE28A"
                    stroke="#141824"
                    strokeWidth={2}
                  />
                  <line
                    x1={wx + 12}
                    y1={wy}
                    x2={wx + 12}
                    y2={wy + 28}
                    stroke="#141824"
                    strokeWidth={1.6}
                  />
                  <line
                    x1={wx}
                    y1={wy + 14}
                    x2={wx + 24}
                    y2={wy + 14}
                    stroke="#141824"
                    strokeWidth={1.6}
                  />
                </g>
              ))}
              {/* Front Door */}
              <rect
                x={-14}
                y={-34}
                width={24}
                height={46}
                fill="#4D3326"
                stroke="#141824"
                strokeWidth={2}
              />
            </g>

            {/* THE SINGLE 21-METER SOLID 24K GOLD CUBE (All Gold Ever Mined on Earth!) */}
            <g transform="translate(736, 1098)">
              {/* Ground Contact Shadow */}
              <polygon
                points="-135,14 0,68 158,18 22,-32"
                fill="rgba(0, 0, 0, 0.72)"
              />
              {/* Top Diamond Face */}
              <polygon
                points="0,-242 126,-184 0,-126 -126,-184"
                fill="url(#l5-cube-top)"
                stroke="#593604"
                strokeWidth={2.5}
              />
              {/* Left Sunlit Gold Face */}
              <polygon
                points="-126,-184 0,-126 0,34 -126,-24"
                fill="url(#l5-cube-left)"
                stroke="#593604"
                strokeWidth={2.5}
              />
              {/* Right Shaded Gold Face */}
              <polygon
                points="0,-126 126,-184 126,-24 0,34"
                fill="url(#l5-cube-right)"
                stroke="#593604"
                strokeWidth={2.5}
              />
              {/* Subtle Gold Ingot Brick Seam Lines on Cube Faces */}
              {[-130, -90, -50].map((ly, idx) => (
                <React.Fragment key={idx}>
                  <line
                    x1={-124}
                    y1={ly - 30}
                    x2={-2}
                    y2={ly + 28}
                    stroke="rgba(255, 250, 215, 0.25)"
                    strokeWidth={1.5}
                  />
                  <line
                    x1={2}
                    y1={ly + 28}
                    x2={124}
                    y2={ly - 30}
                    stroke="rgba(54, 30, 3, 0.35)"
                    strokeWidth={1.5}
                  />
                </React.Fragment>
              ))}
              {/* Crisp Specular Vertical Highlight Along Front Corner Edge */}
              <line
                x1={0}
                y1={-124}
                x2={0}
                y2={32}
                stroke="#FFFDF2"
                strokeWidth={4}
                strokeLinecap="round"
              />
              {/* Starburst Sparkle on Top Front Vertex */}
              <g
                transform={`translate(-22, -148) rotate(${localT * 30} 22 22)`}
              >
                <path d={glintStar.path} fill="#FFFDF6" />
              </g>
            </g>
          </g>
        )}
      </svg>

      <GoldenMotesOverlay seed="lembar05" count={48} riseSpeed={16} />

      <SpecimenBadge
        text={
          sec >= 59.5
            ? 'SELURUH EMAS MANUSIA = 1 KUBUS 21 M'
            : '1 KILONOVA = EMAS SEBERAT RATUSAN BULAN'
        }
        sub={
          sec >= 59.5
            ? 'Semua emas tambang sepanjang sejarah muat setinggi rumah'
            : 'Disemburkan ke ruang angkasa hanya dalam hitungan detik'
        }
        x={34}
        bottom={34}
        tone="gold"
      />
    </CelestialPlateSheet>
  );
};

// ============================================================================
// LEMBAR 06 — BUMI PURBA: MOLTEN GOLDEN CORE & CATACLYSMIC METEORITE SHOWER
// Pure 2D planetary & celestial scene (ZERO charts, ZERO graphs!):
//  - Act I [66.33..74.15]: Young molten magma Earth with cutaway showing early
//    gold droplets sinking deep into Earth's glowing 24K golden-iron core
//  - Act II [74.15..82.46]: Spectacular storm of blazing golden-veined meteors
//    streaking across space & embedding mineable gold into the cooled crust!
// ============================================================================

export const Lembar06HujanMeteorPurba: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[5];
  const localT = Math.max(0, sec - ch.start);

  // Act I: Gold sinking into Earth's core [66.33 .. 74.15]
  // Act II: Meteorite storm dusting cooled crust [74.15 .. 82.46]
  const sinkP = easeInOutCubic(prog(sec, 67.2, 73.6));
  const crustCoolP = easeInOutCubic(prog(sec, 73.6, 75.8));
  const meteorPhase = prog(sec, 74.15, 82.2);

  const ecx = 456;
  const ecy = 838;
  const eRad = 415;

  return (
    <CelestialPlateSheet chapter={ch}>
      <svg width={1208} height={1298} viewBox="0 0 1208 1298">
        <defs>
          <radialGradient id="l6-space" cx="65%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#161E38" />
            <stop offset="58%" stopColor="#090D1B" />
            <stop offset="100%" stopColor="#04060D" />
          </radialGradient>

          {/* Young Earth Surface: Transitions from Molten Magma Ocean to Dark Cooled Basalt Crust */}
          <radialGradient id="l6-earth-crust" cx="38%" cy="34%" r="68%">
            <stop
              offset="0%"
              stopColor={crustCoolP > 0.5 ? '#3B4659' : '#FF962E'}
            />
            <stop
              offset="48%"
              stopColor={crustCoolP > 0.5 ? '#232A38' : '#B8321A'}
            />
            <stop
              offset="85%"
              stopColor={crustCoolP > 0.5 ? '#121620' : '#4F120E'}
            />
            <stop offset="100%" stopColor="#090B11" />
          </radialGradient>

          {/* Deep Silicate Mantle Interior */}
          <radialGradient id="l6-mantle-cut" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFDF78" />
            <stop offset="36%" stopColor="#E0631E" />
            <stop offset="78%" stopColor="#7A1E14" />
            <stop offset="100%" stopColor="#2B0E0C" />
          </radialGradient>

          {/* Sunken Golden-Iron Inner Core */}
          <radialGradient id="l6-gold-core" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFDF0" />
            <stop offset="35%" stopColor="#FFE074" />
            <stop offset="75%" stopColor="#DDA024" />
            <stop offset="100%" stopColor="#7A4C08" />
          </radialGradient>

          {/* Blazing Meteor Plasma Tail */}
          <linearGradient id="l6-meteor-tail" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFBE0" stopOpacity="0.95" />
            <stop offset="28%" stopColor="#FFB838" stopOpacity="0.78" />
            <stop offset="68%" stopColor="#E04824" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#E04824" stopOpacity="0" />
          </linearGradient>

          <clipPath id="l6-earth-clip">
            <circle cx={ecx} cy={ecy} r={eRad} />
          </clipPath>
        </defs>

        {/* 1. Deep Hadean Space & Distant Cratered Young Moon */}
        <rect width={1208} height={1298} fill="url(#l6-space)" />
        <CosmicStarfield seed="l6-stars" count={96} driftX={5} driftY={-4} />

        {/* Distant Young Moon in Upper-Left Sky (also scarred by the same bombardment!) */}
        <g opacity={0.78}>
          <CrateredMoonObject cx={196} cy={218} radius={74} phaseShadowOffset={0.38} />
        </g>

        {/* Atmospheric Rim Glow Around Young Earth */}
        <circle
          cx={ecx}
          cy={ecy}
          r={eRad + 28}
          fill={
            crustCoolP > 0.5
              ? 'rgba(110, 168, 235, 0.16)'
              : 'rgba(255, 108, 38, 0.22)'
          }
        />

        {/* ================================================================ */}
        {/* 2. YOUNG PRIMORDIAL EARTH SPHERE & GOLDEN CORE CUTAWAY           */}
        {/* ================================================================ */}
        <g clipPath="url(#l6-earth-clip)">
          <circle cx={ecx} cy={ecy} r={eRad} fill="url(#l6-earth-crust)" />

          {/* Glowing Magma Ocean Cracks Across Young Earth (fades as crust cools) */}
          <g opacity={1 - crustCoolP * 0.72}>
            {[
              'M 120 710 Q 290 660, 440 725 T 790 695',
              'M 95 855 Q 280 810, 460 880 T 830 835',
              'M 180 995 Q 370 945, 560 1015 T 820 970',
              'M 290 545 Q 430 620, 520 530 T 740 595',
            ].map((pStr, idx) => (
              <path
                key={idx}
                d={pStr}
                fill="none"
                stroke="#FFB13B"
                strokeWidth={5.5}
                strokeLinecap="round"
                opacity={0.72}
              />
            ))}
          </g>

          {/* Interior Planetary Cutaway Showing Mantle & Sunken Golden Core */}
          <circle
            cx={ecx}
            cy={ecy}
            r={eRad * 0.76}
            fill="url(#l6-mantle-cut)"
            stroke="#24110E"
            strokeWidth={8}
          />

          {/* Gold Droplets Sinking Inward Through Molten Mantle Toward the Core! */}
          {Array.from({ length: 16 }).map((_, dIdx) => {
            const ang = (dIdx / 16) * Math.PI * 2 + 0.2;
            const startR = eRad * 0.70;
            const endR = 112;
            const localDrop = clamp01(sinkP * 1.35 - (dIdx % 5) * 0.08);
            const curR = interpolate(localDrop, [0, 1], [startR, endR]);
            if (localDrop >= 0.99) return null;
            const dx = ecx + Math.cos(ang) * curR;
            const dy = ecy + Math.sin(ang) * curR;
            return (
              <circle
                key={dIdx}
                cx={dx}
                cy={dy}
                r={9}
                fill="#FFE484"
                stroke="#6E4206"
                strokeWidth={1.5}
              />
            );
          })}

          {/* EARTH'S SUNKEN 24K GOLDEN-IRON INNER CORE (grows bright as gold sinks!) */}
          <circle
            cx={ecx}
            cy={ecy}
            r={interpolate(sinkP, [0, 1], [96, 138])}
            fill="url(#l6-gold-core)"
            stroke="#FFF7CC"
            strokeWidth={3}
          />

          {/* Newly Deposited Surface Gold Veins Along Upper Crust Rim During Meteor Storm! */}
          {meteorPhase > 0.12 &&
            Array.from({ length: 9 }).map((_, vIdx) => {
              const ang = -1.18 + vIdx * 0.21;
              const vx = ecx + Math.cos(ang) * (eRad - 22);
              const vy = ecy + Math.sin(ang) * (eRad - 22);
              const vOp = clamp01((meteorPhase - 0.12 - vIdx * 0.06) * 3.2);
              if (vOp <= 0.01) return null;
              return (
                <g key={vIdx} opacity={vOp}>
                  <HandcraftedGoldNugget
                    x={vx}
                    y={vy}
                    scale={0.44}
                    rotate={vIdx * 37}
                  />
                </g>
              );
            })}
        </g>

        {/* Crisp Planetary Limb Ring */}
        <circle
          cx={ecx}
          cy={ecy}
          r={eRad}
          fill="none"
          stroke={crustCoolP > 0.5 ? '#7BA7DE' : '#FF9A3D'}
          strokeWidth={3}
          opacity={0.7}
        />

        {/* ================================================================ */}
        {/* 3. ACT II: BLAZING GOLDEN METEORITE BOMBARDMENT FROM SPACE!      */}
        {/* ================================================================ */}
        {sec >= 74.0 &&
          Array.from({ length: 12 }).map((_, mIdx) => {
            const cycle = ((localT * 0.48 + mIdx * 0.23) % 1.25);
            if (cycle > 1.0) return null;

            // Diagonal trajectory from upper-right space (x: 820..1280, y: -60..320) onto Earth's upper-right limb!
            const laneOffset = (mIdx - 5.5) * 46;
            const startX = 1140 + laneOffset * 0.55;
            const startY = 40 + (mIdx % 4) * 65;
            const hitAng = -0.98 + (mIdx / 12) * 0.92;
            const endX = ecx + Math.cos(hitAng) * (eRad - 10);
            const endY = ecy + Math.sin(hitAng) * (eRad - 10);

            const mx = interpolate(cycle, [0, 1], [startX, endX]);
            const my = interpolate(cycle, [0, 1], [startY, endY]);
            const dx = startX - endX;
            const dy = startY - endY;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const tailLen = 195 + (mIdx % 3) * 48;

            const impactFlash = cycle > 0.88 ? (cycle - 0.88) / 0.12 : 0;

            return (
              <g key={mIdx}>
                {/* Blazing Plasma Tail */}
                <polygon
                  points={`${mx - uy * 13},${my + ux * 13} ${mx + ux * tailLen},${my + uy * tailLen} ${mx + uy * 13},${my - ux * 13}`}
                  fill="url(#l6-meteor-tail)"
                />
                {/* Atmospheric Bow-Shock Crescent */}
                <circle
                  cx={mx}
                  cy={my}
                  r={24}
                  fill="rgba(255, 224, 128, 0.42)"
                />
                {/* Golden-Veined Asteroid Head */}
                <g transform={`translate(${mx}, ${my}) rotate(${mIdx * 45 + localT * 90})`}>
                  <polygon
                    points="-16,-8 -4,-18 14,-10 16,8 0,16 -14,10"
                    fill="#3C322E"
                    stroke="#FFE282"
                    strokeWidth={2.2}
                  />
                  <polygon points="-6,-8 6,-10 8,2 -4,6" fill="#FFD24D" />
                </g>

                {/* Crust Impact Burst */}
                {impactFlash > 0 && (
                  <circle
                    cx={endX}
                    cy={endY}
                    r={18 + impactFlash * 56}
                    fill="rgba(255, 230, 132, 0.68)"
                    opacity={1 - impactFlash}
                  />
                )}
              </g>
            );
          })}
      </svg>

      <GoldenMotesOverlay seed="lembar06" count={36} riseSpeed={15} />

      <SpecimenBadge
        text={
          sec >= 74.1
            ? 'HUJAN METEOR · 3,9 MILIAR THN LALU'
            : 'EMAS AWAL TENGGELAM KE INTI BUMI'
        }
        sub={
          sec >= 74.1
            ? '20 miliar miliar ton meteor menabur emas ke kerak luar'
            : 'Saat Bumi masih cair, logam berat tertarik ke pusat planet'
        }
        right={34}
        bottom={34}
        tone="gold"
      />
    </CelestialPlateSheet>
  );
};
