import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  prog,
} from './script';
import {
  BottomCaptionVignette,
  DeepCosmosBackdrop,
  FoilGoldNugget,
  FrostedTelemetryCard,
  GoldenDustField,
  PillBadge,
  TechnicalGridOverlay,
  TexturedCelestialSphere,
  getGoldFoilTexture,
  getKilonovaNebulaTexture,
  hash01,
} from './emas';

// ============================================================================
// SCENE 05 — RATUSAN BULAN VS 1 KUBUS EMAS MANUSIA (FULL-RATIO 1440x2560)
// ============================================================================

export const Scene05RatusanBulan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[4];
  const sec = ch.start + frame / fps;
  const localT = frame / fps;

  const goldFoilBrushed = useMemo(() => getGoldFoilTexture('brushed'), []);
  const goldFoilCrumpled = useMemo(() => getGoldFoilTexture('crumpled'), []);
  const nebulaUrl = useMemo(() => getKilonovaNebulaTexture(), []);

  // Camera tilts smoothly from Cosmic Scale (top) down to Human Cube Scale at 59.35s
  const humanPhase = easeInOutCubic(prog(sec, 59.2, 60.85));
  const cubeSpring = spring({
    frame: Math.max(0, frame - Math.round((59.45 - ch.start) * fps)),
    fps,
    config: { damping: 16, stiffness: 92 },
  });

  const goldenMoons = useMemo(
    () =>
      Array.from({ length: 68 }).map((_, i) => {
        const s = 920 + i * 31;
        const ring = Math.pow(hash01(s), 0.65);
        const angle = hash01(s + 1) * Math.PI * 2;
        return {
          x: 945 + Math.cos(angle) * ring * 380,
          y: 675 + Math.sin(angle) * ring * 340,
          r: 12 + Math.pow(hash01(s + 2), 1.7) * 34,
          drift: 0.55 + hash01(s + 3) * 1.35,
          phase: hash01(s + 4) * Math.PI * 2,
          hero: i < 9,
        };
      }),
    [],
  );

  const worldOffsetY = interpolate(humanPhase, [0, 1], [0, -560]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#04060C', overflow: 'hidden' }}>
      <DeepCosmosBackdrop seed="ch05-scale" nebulaHue="gold" starCount={130} drift={0.65} />
      <TechnicalGridOverlay opacity={0.05} cell={85} tint="235, 195, 115" />

      {/* Two-Stage Vertical Parallax Camera World (2560 + 560 = 3120px tall) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1440,
          height: 3120,
          transform: `translate3d(0, ${worldOffsetY}px, 0)`,
        }}
      >
        <svg width={1440} height={3120} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="ch5-au-sphere" cx="34%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#FFF9DF" />
              <stop offset="34%" stopColor="#FFD86B" />
              <stop offset="72%" stopColor="#C88414" />
              <stop offset="100%" stopColor="#4F2E03" />
            </radialGradient>
            <linearGradient id="ch5-hill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#121B2E" />
              <stop offset="45%" stopColor="#0A101D" />
              <stop offset="100%" stopColor="#04060B" />
            </linearGradient>
            <clipPath id="ch5-cube-top">
              <polygon points="945,1465 1175,1575 945,1685 715,1575" />
            </clipPath>
            <clipPath id="ch5-cube-left">
              <polygon points="715,1575 945,1685 945,1945 715,1835" />
            </clipPath>
            <clipPath id="ch5-cube-right">
              <polygon points="945,1685 1175,1575 1175,1835 945,1945" />
            </clipPath>
          </defs>

          {/* ============================================================== */}
          {/* UPPER STAGE: 1 EARTH MOON VS HUNDREDS OF GOLDEN MOON MASSES    */}
          {/* ============================================================== */}
          <g opacity={clamp01(1 - (humanPhase - 0.18) / 0.62)}>
          {nebulaUrl && (
            <image
              href={nebulaUrl}
              x={520}
              y={260}
              width={850}
              height={850}
              opacity={0.52}
            />
          )}

          {/* Earth's Cratered Moon Reference on Left */}
          <TexturedCelestialSphere
            cx={285}
            cy={675}
            r={148}
            kind="lunar"
            rimColor="rgba(205, 222, 248, 0.45)"
          />
          {/* Caliper Bracket Under Earth's Moon */}
          <g opacity={0.9}>
            <line x1={137} y1={858} x2={433} y2={858} stroke="rgba(216,226,242,0.55)" strokeWidth={2} />
            <line x1={137} y1={846} x2={137} y2={870} stroke="rgba(216,226,242,0.55)" strokeWidth={2} />
            <line x1={433} y1={846} x2={433} y2={870} stroke="rgba(216,226,242,0.55)" strokeWidth={2} />
            <rect
              x={160}
              y={880}
              width={250}
              height={42}
              rx={21}
              fill="rgba(14, 20, 34, 0.82)"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={1.4}
            />
            <text
              x={285}
              y={908}
              textAnchor="middle"
              fill="#E6EDF8"
              fontFamily={IDENTITY.fontMono}
              fontSize={19}
              fontWeight={600}
              letterSpacing="0.16em"
            >
              1× MASSA BULAN
            </text>
          </g>

          {/* Swarm of Hundreds of Golden Moon-Mass Spheres */}
          {goldenMoons.map((gm, idx) => {
            const enter = easeOutCubic(clamp01((localT - idx * 0.018) / 0.85));
            const dx = Math.sin(localT * gm.drift + gm.phase) * 9;
            const dy = Math.cos(localT * gm.drift * 0.85 + gm.phase) * 8;
            return (
              <g key={idx} opacity={enter}>
                {gm.hero ? (
                  <TexturedCelestialSphere
                    cx={gm.x + dx}
                    cy={gm.y + dy}
                    r={gm.r}
                    kind="golden-moon"
                    rimColor="rgba(255, 214, 102, 0.48)"
                  />
                ) : (
                  <g transform={`translate(${gm.x + dx}, ${gm.y + dy})`}>
                    <circle cx={0} cy={0} r={gm.r * 1.45} fill="rgba(245, 184, 65, 0.16)" />
                    <circle cx={0} cy={0} r={gm.r} fill="url(#ch5-au-sphere)" />
                  </g>
                )}
              </g>
            );
          })}
          </g>

          {/* ============================================================== */}
          {/* LOWER STAGE: NOCTURNAL EARTH HILLTOP — 2-STORY HOUSE VS 21M Au */}
          {/* ============================================================== */}
          <path
            d="M 0,1920 Q 380,1835 760,1885 T 1440,1855 L 1440,3120 L 0,3120 Z"
            fill="url(#ch5-hill)"
          />
          <path
            d="M 0,1920 Q 380,1835 760,1885 T 1440,1855"
            fill="none"
            stroke="rgba(138, 178, 238, 0.22)"
            strokeWidth={2}
          />

          {/* Subtle Pine Silhouettes for Architectural Ground Scale */}
          {[145, 188, 1265, 1315].map((tx, idx) => (
            <g key={idx} transform={`translate(${tx}, 1875)`} opacity={0.55}>
              <polygon points="0,-68 -24,0 24,0" fill="#0B1322" />
              <polygon points="0,-46 -28,16 28,16" fill="#09101D" />
            </g>
          ))}

          {/* Detailed 2-Story Human House (Reference Scale: ~8–10m) */}
          <g
            transform={`translate(430, 1885) scale(${0.86 + 0.14 * cubeSpring})`}
            opacity={clamp01(cubeSpring * 1.4)}
          >
            <ellipse cx={0} cy={14} rx={155} ry={24} fill="rgba(0,0,0,0.65)" />
            {/* Main 2-story facade */}
            <rect
              x={-105}
              y={-132}
              width={210}
              height={142}
              rx={4}
              fill="#1B2436"
              stroke="#3B4B6B"
              strokeWidth={2}
            />
            {/* Chimney */}
            <rect x={52} y={-192} width={26} height={48} fill="#161E2E" />
            {/* Pitched tiled roof */}
            <polygon
              points="-124,-130 0,-206 124,-130"
              fill="#2B2330"
              stroke="#56455E"
              strokeWidth={2.2}
            />
            {/* Glowing warm windows (2 floors) */}
            {[-72, -14, 44].map((wx, wi) => (
              <React.Fragment key={wi}>
                <rect
                  x={wx}
                  y={-108}
                  width={32}
                  height={36}
                  rx={3}
                  fill="#FFD97D"
                />
                <line x1={wx + 16} y1={-108} x2={wx + 16} y2={-72} stroke="#2B2330" strokeWidth={2} />
                <line x1={wx} y1={-90} x2={wx + 32} y2={-90} stroke="#2B2330" strokeWidth={2} />
                {wi !== 1 && (
                  <>
                    <rect
                      x={wx}
                      y={-54}
                      width={32}
                      height={36}
                      rx={3}
                      fill="#FFC95C"
                    />
                    <line x1={wx + 16} y1={-54} x2={wx + 16} y2={-18} stroke="#2B2330" strokeWidth={2} />
                  </>
                )}
              </React.Fragment>
            ))}
            {/* Front door */}
            <rect x={-15} y={-50} width={30} height={60} rx={3} fill="#4A3425" stroke="#7A583E" strokeWidth={1.5} />
            <text
              x={0}
              y={54}
              textAnchor="middle"
              fill="rgba(204, 216, 236, 0.78)"
              fontFamily={IDENTITY.fontMono}
              fontSize={19}
              letterSpacing="0.16em"
            >
              RUMAH 2 LANTAI
            </text>
          </g>

          {/* ============================================================== */}
          {/* MONUMENTAL FOIL-TEXTURED 21-METER SOLID 24K GOLD CUBE          */}
          {/* ============================================================== */}
          {cubeSpring > 0.01 && (
            <g
              transform={`translate(0, ${(1 - cubeSpring) * -95})`}
              opacity={clamp01(cubeSpring * 1.35)}
            >
              {/* Golden ground reflection pool */}
              <ellipse cx={945} cy={1952} rx={285} ry={58} fill="rgba(245, 184, 65, 0.24)" />
              <ellipse cx={945} cy={1952} rx={215} ry={38} fill="rgba(0, 0, 0, 0.68)" />

              {/* Top Diamond Face */}
              <g clipPath="url(#ch5-cube-top)">
                {goldFoilBrushed ? (
                  <image href={goldFoilBrushed} x={700} y={1450} width={500} height={250} preserveAspectRatio="none" />
                ) : (
                  <rect x={700} y={1450} width={500} height={250} fill="#FFE28A" />
                )}
                <rect x={700} y={1450} width={500} height={250} fill="rgba(255, 250, 220, 0.36)" />
              </g>

              {/* Left Sunlit Brushed Gold Face */}
              <g clipPath="url(#ch5-cube-left)">
                {goldFoilCrumpled ? (
                  <image href={goldFoilCrumpled} x={705} y={1565} width={255} height={390} preserveAspectRatio="none" />
                ) : (
                  <rect x={705} y={1565} width={255} height={390} fill="#E5A92B" />
                )}
              </g>

              {/* Right Shaded Burnished Gold Face */}
              <g clipPath="url(#ch5-cube-right)">
                {goldFoilCrumpled ? (
                  <image href={goldFoilCrumpled} x={940} y={1565} width={255} height={390} preserveAspectRatio="none" />
                ) : (
                  <rect x={940} y={1565} width={255} height={390} fill="#9E6814" />
                )}
                <rect x={940} y={1565} width={255} height={390} fill="rgba(28, 14, 2, 0.44)" />
              </g>

              {/* Precision Bullion Layer Seams & Specular Bevel Edges */}
              {[0.25, 0.5, 0.75].map((f, idx) => {
                const yL = 1575 + f * 260;
                const yM = 1685 + f * 260;
                return (
                  <g key={idx} opacity={0.34}>
                    <line x1={715} y1={yL} x2={945} y2={yM} stroke="#5E3604" strokeWidth={1.6} />
                    <line x1={945} y1={yM} x2={1175} y2={yL} stroke="#3B2002" strokeWidth={1.6} />
                  </g>
                );
              })}

              <polygon
                points="945,1465 1175,1575 1175,1835 945,1945 715,1835 715,1575"
                fill="none"
                stroke="#FFF5CC"
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
              <polyline
                points="715,1575 945,1685 1175,1575"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={3}
              />
              <line x1={945} y1={1685} x2={945} y2={1945} stroke="#FFF8DC" strokeWidth={3.2} />

              {/* Architectural Dimension Bracket: 21 METER */}
              <g opacity={0.92}>
                <line x1={1212} y1={1575} x2={1212} y2={1835} stroke="#F5B841" strokeWidth={2} />
                <line x1={1198} y1={1575} x2={1226} y2={1575} stroke="#F5B841" strokeWidth={2} />
                <line x1={1198} y1={1835} x2={1226} y2={1835} stroke="#F5B841" strokeWidth={2} />
                <text
                  x={1238}
                  y={1712}
                  fill="#F7C968"
                  fontFamily={IDENTITY.fontMono}
                  fontSize={23}
                  fontWeight={700}
                  letterSpacing="0.12em"
                >
                  21 m
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Top Floating Pill */}
      <div
        style={{
          position: 'absolute',
          top: 204,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <PillBadge
          label={
            humanPhase < 0.5
              ? 'PERBANDINGAN SKALA KOSMIK'
              : 'SELURUH EMAS SEPANJANG SEJARAH MANUSIA'
          }
          tone="gold"
        />
      </div>

      {/* Frosted Telemetry Card Synced to Act I / Act II */}
      <div
        style={{
          position: 'absolute',
          left: 140,
          right: 140,
          top: 1465,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <FrostedTelemetryCard
          eyebrow={
            humanPhase < 0.5
              ? 'HASIL SATU LEDAKAN KILONOVA'
              : 'TOTAL EMAS YANG PERNAH DITAMBANG MANUSIA'
          }
          mainValue={
            humanPhase < 0.5 ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                <span style={{ color: '#F5B841' }}>100–300×</span>
                <span style={{ fontSize: 40, color: '#EAEFF8' }}>MASSA BULAN</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                <span style={{ color: '#F5B841' }}>1 KUBUS</span>
                <span style={{ fontSize: 40, color: '#EAEFF8' }}>SISI 21 METER</span>
              </div>
            )
          }
          subLabel={
            humanPhase < 0.5
              ? 'DISEMBURKAN KE RUANG ANGKASA HANYA DALAM HITUNGAN DETIK'
              : 'HANYA SEUKURAN BANGUNAN DI SAMPING RUMAH DUA LANTAI'
          }
          accent="gold"
          width={1160}
        />
      </div>

      <GoldenDustField seed="ch05-motes" count={34} maxY={1750} />
      <BottomCaptionVignette />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 06 — INTI BUMI PURBA & HUJAN METEOR RAKSASA (FULL-RATIO 1440x2560)
// ============================================================================

export const Scene06HujanMeteor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[5];
  const sec = ch.start + frame / fps;
  const localT = frame / fps;

  const goldFoilUrl = useMemo(() => getGoldFoilTexture('crumpled'), []);

  // Gold sinking into Earth's core: 68.5s -> 75.8s
  const sinkP = easeInOutCubic(prog(sec, 68.5, 75.8));
  // Late Heavy Meteorite Bombardment: 76.7s -> 82.45s
  const meteorPhase = clamp01(prog(sec, 76.6, 78.2));
  const meteorClock = Math.max(0, sec - 76.6);

  const cx = 685;
  const cy = 820;
  const earthR = 325;

  const meteorites = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const s = 1310 + i * 43;
        return {
          startX: 1020 + hash01(s) * 460,
          startY: 80 + hash01(s + 1) * 480,
          targetAngle: -0.92 + (i / 11) * 1.48,
          speed: 0.62 + hash01(s + 2) * 0.42,
          offset: (i * 0.19) % 1,
          size: 32 + hash01(s + 3) * 20,
        };
      }),
    [],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#04070E', overflow: 'hidden' }}>
      <DeepCosmosBackdrop seed="ch06-hadean" nebulaHue="blue" starCount={120} drift={0.75} />
      <TechnicalGridOverlay opacity={0.05} cell={85} tint="145, 190, 248" />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="ch6-core-cutaway">
            <circle cx={cx} cy={cy} r={earthR * 0.72} />
          </clipPath>
          <clipPath id="ch6-gold-core">
            <circle cx={cx} cy={cy} r={116} />
          </clipPath>
          <radialGradient id="ch6-mantle-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF0A8" />
            <stop offset="48%" stopColor="#F26A21" />
            <stop offset="85%" stopColor="#7C2212" />
            <stop offset="100%" stopColor="#260D0B" />
          </radialGradient>
          <linearGradient id="ch6-meteor-tail" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFBE0" />
            <stop offset="28%" stopColor="#FFB638" />
            <stop offset="68%" stopColor="rgba(255, 92, 32, 0.35)" />
            <stop offset="100%" stopColor="rgba(255, 62, 22, 0)" />
          </linearGradient>
        </defs>

        {/* Young Moon in Distant Hadean Orbit */}
        <TexturedCelestialSphere
          cx={235}
          cy={375}
          r={68}
          kind="lunar"
          rimColor="rgba(195, 216, 248, 0.36)"
        />

        {/* ================================================================ */}
        {/* PROCEDURAL HADEAN MOLTEN -> COOLING OCEANIC EARTH                */}
        {/* ================================================================ */}
        <g opacity={1 - meteorPhase * 0.88}>
          <TexturedCelestialSphere
            cx={cx}
            cy={cy}
            r={earthR}
            kind="hadean-molten"
            rimColor="rgba(255, 118, 48, 0.55)"
            rotationDeg={localT * 4.2}
          />
        </g>
        {meteorPhase > 0.01 && (
          <g opacity={meteorPhase}>
            <TexturedCelestialSphere
              cx={cx}
              cy={cy}
              r={earthR}
              kind="hadean-cooling"
              rimColor="rgba(104, 178, 255, 0.62)"
              rotationDeg={localT * 4.2}
            />
          </g>
        )}

        {/* Equatorial-to-Core Cutaway Revealing Sunken Molten 24K Gold Core */}
        <g clipPath="url(#ch6-core-cutaway)">
          <circle cx={cx} cy={cy} r={earthR * 0.72} fill="url(#ch6-mantle-grad)" />
          <circle
            cx={cx}
            cy={cy}
            r={earthR * 0.72}
            fill="none"
            stroke="rgba(255, 194, 112, 0.55)"
            strokeWidth={4}
          />
        </g>

        {/* Sinking Gold Droplets + Radial Gravity Vectors Into Core (Act I) */}
        {meteorPhase < 0.85 &&
          Array.from({ length: 16 }).map((_, idx) => {
            const ang = (idx / 16) * Math.PI * 2 + 0.2;
            const cycle = (sinkP * 1.6 + idx * 0.11) % 1;
            const rad = interpolate(cycle, [0, 1], [earthR * 0.68, 118]);
            const gx = cx + Math.cos(ang) * rad;
            const gy = cy + Math.sin(ang) * rad;
            return (
              <g key={idx} opacity={(1 - meteorPhase) * 0.9}>
                <line
                  x1={cx + Math.cos(ang) * (rad + 26)}
                  y1={cy + Math.sin(ang) * (rad + 26)}
                  x2={gx}
                  y2={gy}
                  stroke="#FFE28A"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                <circle cx={gx} cy={gy} r={6.5} fill="#FFF6CC" stroke="#D99416" strokeWidth={1.8} />
              </g>
            );
          })}

        {/* Sunken Foil-Textured Molten 24K Gold Inner Core */}
        <g clipPath="url(#ch6-gold-core)">
          {goldFoilUrl ? (
            <image
              href={goldFoilUrl}
              x={cx - 122}
              y={cy - 122}
              width={244}
              height={244}
            />
          ) : (
            <circle cx={cx} cy={cy} r={116} fill="#F5B841" />
          )}
          <circle
            cx={cx - 28}
            cy={cy - 32}
            r={62}
            fill="rgba(255, 253, 232, 0.42)"
          />
        </g>
        <circle
          cx={cx}
          cy={cy}
          r={116}
          fill="none"
          stroke="#FFF7D6"
          strokeWidth={3}
        />
        <rect
          x={cx - 104}
          y={cy - 19}
          width={208}
          height={38}
          rx={19}
          fill="rgba(18, 12, 5, 0.82)"
          stroke="rgba(255, 244, 198, 0.65)"
          strokeWidth={1.5}
        />
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          fill="#FFE89C"
          fontFamily={IDENTITY.fontMono}
          fontSize={16}
          fontWeight={700}
          letterSpacing="0.14em"
        >
          INTI EMAS & BESI
        </text>

        {/* ================================================================ */}
        {/* ACT II: LATE HEAVY METEORITE BOMBARDMENT SEEDING OUTER CRUST     */}
        {/* ================================================================ */}
        {meteorPhase > 0.02 && (
          <g opacity={meteorPhase}>
            {meteorites.map((m, idx) => {
              const u = (meteorClock * m.speed + m.offset) % 1;
              const impactX = cx + Math.cos(m.targetAngle) * (earthR - 6);
              const impactY = cy + Math.sin(m.targetAngle) * (earthR - 6);
              const mx = interpolate(u, [0, 0.84], [m.startX, impactX], {
                extrapolateRight: 'clamp',
              });
              const my = interpolate(u, [0, 0.84], [m.startY, impactY], {
                extrapolateRight: 'clamp',
              });
              const vx = impactX - m.startX;
              const vy = impactY - m.startY;
              const vLen = Math.hypot(vx, vy) || 1;
              const tx = mx - (vx / vLen) * 215;
              const ty = my - (vy / vLen) * 215;

              if (u >= 0.84) {
                const blast = (u - 0.84) / 0.16;
                return (
                  <g key={idx}>
                    <circle
                      cx={impactX}
                      cy={impactY}
                      r={16 + blast * 58}
                      fill="none"
                      stroke="#FFE28A"
                      strokeWidth={3 * (1 - blast)}
                    />
                    <FoilGoldNugget
                      x={impactX}
                      y={impactY}
                      size={32}
                      rotation={idx * 35}
                      shimmerPhase={localT * 4 + idx}
                      idSuffix={`ch6-imp-${idx}`}
                    />
                  </g>
                );
              }

              return (
                <g key={idx}>
                  {/* Fiery atmospheric plasma wake */}
                  <polygon
                    points={`${mx - 9},${my - 9} ${tx},${ty} ${mx + 9},${my + 9}`}
                    fill="url(#ch6-meteor-tail)"
                  />
                  {/* Incandescent bow shock */}
                  <circle cx={mx} cy={my} r={m.size * 0.72} fill="rgba(255, 224, 130, 0.35)" />
                  {/* Chondrite meteorite body carrying 24K gold heart */}
                  <polygon
                    points={`${mx - 16},${my - 6} ${mx - 4},${my - 17} ${mx + 15},${my - 9} ${mx + 14},${my + 11} ${mx - 8},${my + 15}`}
                    fill="#262936"
                    stroke="#FFB946"
                    strokeWidth={2}
                  />
                  <circle cx={mx + 1} cy={my} r={6.5} fill="#FFE694" />
                </g>
              );
            })}

            {/* Newly Seeded Crust Gold Deposits Along Upper Limb */}
            {Array.from({ length: 9 }).map((_, k) => {
              const ang = -0.88 + (k / 8) * 1.42;
              const gx = cx + Math.cos(ang) * (earthR - 14);
              const gy = cy + Math.sin(ang) * (earthR - 14);
              return (
                <FoilGoldNugget
                  key={k}
                  x={gx}
                  y={gy}
                  size={28}
                  rotation={k * 40}
                  shimmerPhase={localT * 3 + k}
                  idSuffix={`ch6-crust-${k}`}
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Top Pill Badge */}
      <div
        style={{
          position: 'absolute',
          top: 204,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <PillBadge
          label={
            meteorPhase < 0.5
              ? 'BUMI MUDA CAIR · 4,5 MILIAR TAHUN LALU'
              : 'HUJAN METEOR RAKSASA · 3,9 MILIAR TAHUN LALU'
          }
          tone={meteorPhase < 0.5 ? 'gold' : 'ice'}
        />
      </div>

      {/* Frosted Telemetry Card */}
      <div
        style={{
          position: 'absolute',
          left: 140,
          right: 140,
          top: 1385,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <FrostedTelemetryCard
          eyebrow={
            meteorPhase < 0.5
              ? 'NASIB EMAS AWAL SAAT BUMI MASIH CAIR'
              : 'PENGIRIMAN ULANG DARI LUAR ANGKASA'
          }
          mainValue={
            meteorPhase < 0.5 ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                <span style={{ color: '#F5B841' }}>≈ 99%</span>
                <span style={{ fontSize: 40, color: '#EAEFF8' }}>TERKUBUR DI INTI</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                <span style={{ color: '#8BE8FF' }}>20×10¹⁸</span>
                <span style={{ fontSize: 38, color: '#EAEFF8' }}>TON METEORIT EMAS</span>
              </div>
            )
          }
          subLabel={
            meteorPhase < 0.5
              ? 'TERTARIK BERSAMA BESI CAIR KE PUSAT BUMI (3.000 KM DI BAWAH KITA)'
              : 'MENABURKAN EMAS BARU DI KERAK LUAR YANG BISA DITAMBANG MANUSIA'
          }
          accent={meteorPhase < 0.5 ? 'gold' : 'ice'}
          width={1160}
        />
      </div>

      <GoldenDustField seed="ch06-sparks" count={32} maxY={1750} />
      <BottomCaptionVignette />
    </AbsoluteFill>
  );
};
