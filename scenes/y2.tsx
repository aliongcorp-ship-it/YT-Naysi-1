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
  getBrushedMetalTexture,
  getGoldFoilTexture,
  getKilonovaNebulaTexture,
} from './emas';

// ============================================================================
// SCENE 07 — 17 AGUSTUS 2017 · 70 TELESKOP & KILATAN GW170817 (1440x2560)
// ============================================================================

export const Scene07Bukti2017: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[6];
  const sec = ch.start + frame / fps;
  const localT = frame / fps;

  const steelTexUrl = useMemo(() => getBrushedMetalTexture('iron'), []);
  const nebulaUrl = useMemo(() => getKilonovaNebulaTexture(), []);

  // Telescope slews and locks onto NGC 4993 around 86.2s -> 89.2s
  const slewP = easeInOutCubic(prog(sec, 85.4, 88.8));
  // Golden kilonova flash blooms at "kilatan emas dan platina baru" (92.8s)
  const kilonovaBloom = easeOutCubic(prog(sec, 91.2, 93.8));

  const targetX = 995;
  const targetY = 475;
  const scopePivotX = 435;
  const scopePivotY = 1095;

  // Telescope angle aimed toward target
  const targetDeg = (Math.atan2(targetY - scopePivotY, targetX - scopePivotX) * 180) / Math.PI;
  const currentScopeDeg = interpolate(slewP, [0, 1], [-18, targetDeg]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#04070F', overflow: 'hidden' }}>
      <DeepCosmosBackdrop seed="ch07-atacama" nebulaHue="blue" starCount={145} drift={0.45} />
      <TechnicalGridOverlay opacity={0.045} cell={85} tint="140, 185, 250" />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="ch7-beam" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(135, 206, 255, 0.22)" />
            <stop offset="55%" stopColor="rgba(245, 194, 78, 0.14)" />
            <stop offset="100%" stopColor="rgba(255, 224, 128, 0.03)" />
          </linearGradient>
          <radialGradient id="ch7-ngc" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 240, 204, 0.92)" />
            <stop offset="38%" stopColor="rgba(196, 214, 255, 0.38)" />
            <stop offset="100%" stopColor="rgba(120, 155, 235, 0)" />
          </radialGradient>
          <clipPath id="ch7-dome-shell">
            <path d="M 225,1125 A 210,210 0 0,1 645,1125 Z" />
          </clipPath>
        </defs>

        {/* ================================================================ */}
        {/* HOST GALAXY NGC 4993 & GW170817 GOLDEN KILONOVA PINPOINT         */}
        {/* ================================================================ */}
        <g transform={`translate(${targetX}, ${targetY})`}>
          {/* Elliptical Host Galaxy NGC 4993 */}
          <g transform="rotate(-24)">
            <ellipse cx={-48} cy={22} rx={118} ry={66} fill="url(#ch7-ngc)" opacity={0.78} />
            <circle cx={-48} cy={22} r={16} fill="#FFF7DF" />
          </g>

          {/* Kilonova Golden Nebula & Optical Diffraction Spikes */}
          {nebulaUrl && (
            <g
              transform={`scale(${0.22 + kilonovaBloom * 0.48}) rotate(${localT * 9})`}
              opacity={0.35 + kilonovaBloom * 0.65}
            >
              <image href={nebulaUrl} x={-230} y={-230} width={460} height={460} />
            </g>
          )}

          <circle
            cx={0}
            cy={0}
            r={24 + kilonovaBloom * 68}
            fill="rgba(255, 204, 84, 0.28)"
          />
          <g opacity={0.45 + kilonovaBloom * 0.55}>
            <line
              x1={-(48 + kilonovaBloom * 84)}
              y1={0}
              x2={48 + kilonovaBloom * 84}
              y2={0}
              stroke="#FFF6D2"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <line
              x1={0}
              y1={-(48 + kilonovaBloom * 84)}
              x2={0}
              y2={48 + kilonovaBloom * 84}
              stroke="#FFF6D2"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle cx={0} cy={0} r={8 + kilonovaBloom * 8} fill="#FFFFFF" />
          </g>

          {/* Precision Astrometric Target Lock Reticle */}
          <g
            opacity={slewP}
            transform={`rotate(${(1 - slewP) * 45}) scale(${1.28 - 0.28 * slewP})`}
          >
            <circle
              cx={0}
              cy={0}
              r={118}
              fill="none"
              stroke="rgba(245, 184, 65, 0.68)"
              strokeWidth={1.8}
              strokeDasharray="18 12"
            />
            <circle
              cx={0}
              cy={0}
              r={148}
              fill="none"
              stroke="rgba(138, 224, 255, 0.34)"
              strokeWidth={1.4}
            />
            {/* Corner reticle brackets */}
            {[
              [-92, -92, 1, 1],
              [92, -92, -1, 1],
              [-92, 92, 1, -1],
              [92, 92, -1, -1],
            ].map(([bx, by, sx, sy], idx) => (
              <polyline
                key={idx}
                points={`${bx},${by + sy * 22} ${bx},${by} ${bx + sx * 22},${by}`}
                fill="none"
                stroke="#F5B841"
                strokeWidth={2.5}
              />
            ))}
          </g>
        </g>

        {/* Callout Label for NGC 4993 */}
        <g opacity={slewP}>
          <text
            x={targetX - 145}
            y={targetY - 172}
            fill="#F5B841"
            fontFamily={IDENTITY.fontMono}
            fontSize={20}
            fontWeight={600}
            letterSpacing="0.18em"
          >
            GW170817 · GALAKSI NGC 4993
          </text>
          <text
            x={targetX - 145}
            y={targetY - 140}
            fill="rgba(208, 220, 240, 0.78)"
            fontFamily={IDENTITY.fontMono}
            fontSize={18}
            letterSpacing="0.14em"
          >
            JARAK: 130 JUTA TAHUN CAHAYA
          </text>
        </g>

        {/* Observation Light Cone from Main & Distant Domes */}
        {slewP > 0.35 && (
          <g opacity={(slewP - 0.35) / 0.65}>
            <polygon
              points={`${scopePivotX + 55},${scopePivotY - 55} ${targetX - 68},${targetY - 42} ${targetX + 68},${targetY + 42} ${scopePivotX + 95},${scopePivotY - 18}`}
              fill="url(#ch7-beam)"
            />
            {[825, 1020, 1210].map((dx, idx) => (
              <line
                key={idx}
                x1={dx}
                y1={1155 + (idx % 2) * 28}
                x2={targetX}
                y2={targetY}
                stroke="rgba(148, 214, 255, 0.22)"
                strokeDasharray="6 10"
                strokeWidth={1.6}
              />
            ))}
          </g>
        )}

        {/* ================================================================ */}
        {/* HIGH-ALTITUDE ATACAMA MOUNTAIN RIDGE & OBSERVATORY ARRAY         */}
        {/* ================================================================ */}
        <polygon
          points="0,1265 210,1155 545,1185 830,1148 1065,1190 1265,1140 1440,1210 1440,1520 0,1520"
          fill="#0B1120"
        />

        {/* Distant Array of Companion Observatory Domes (Representing 70 Scopes) */}
        {[
          { x: 825, y: 1152, s: 0.95 },
          { x: 1020, y: 1182, s: 1.1 },
          { x: 1210, y: 1142, s: 0.9 },
        ].map((d, idx) => (
          <g key={idx} transform={`translate(${d.x}, ${d.y}) scale(${d.s})`}>
            <path d="M -38,0 A 38,38 0 0,1 38,0 Z" fill="#465670" stroke="#8BA2C4" strokeWidth={1.5} />
            <path d="M -6,-37 A 38,38 0 0,1 26,-26 L 8,0 L -6,0 Z" fill="#0B1120" />
            <rect x={-42} y={0} width={84} height={22} rx={2} fill="#1B2538" />
            <rect x={-16} y={7} width={10} height={7} fill="#FFD573" />
            <rect x={4} y={7} width={10} height={7} fill="#FFD573" />
          </g>
        ))}

        {/* Foreground Summit & Main Brushed-Steel Observatory Dome */}
        <polygon
          points="0,1360 155,1175 695,1175 885,1385 1440,1365 1440,2560 0,2560"
          fill="#060A13"
        />

        {/* Main Dome Hemisphere */}
        <g clipPath="url(#ch7-dome-shell)">
          {steelTexUrl ? (
            <image href={steelTexUrl} x={220} y={905} width={435} height={230} preserveAspectRatio="none" />
          ) : (
            <rect x={220} y={905} width={435} height={230} fill="#6F809B" />
          )}
          {/* Open Astronomical Shutter Slit */}
          <rect x={410} y={905} width={235} height={230} fill="#080D1A" />
        </g>
        <path
          d="M 225,1125 A 210,210 0 0,1 645,1125"
          fill="none"
          stroke="#BFD0EA"
          strokeWidth={2.5}
        />

        {/* Slewing 8-Meter Precision Truss Optical Telescope */}
        <g transform={`translate(${scopePivotX}, ${scopePivotY}) rotate(${currentScopeDeg})`}>
          <rect
            x={-22}
            y={-28}
            width={195}
            height={56}
            rx={6}
            fill="#1D273B"
            stroke="#98B0D4"
            strokeWidth={2.2}
          />
          {/* Serrurier truss struts */}
          <polyline
            points="18,-26 68,26 118,-26 162,26"
            fill="none"
            stroke="#DCE8FA"
            strokeWidth={2}
            opacity={0.75}
          />
          <polyline
            points="18,26 68,-26 118,26 162,-26"
            fill="none"
            stroke="#DCE8FA"
            strokeWidth={2}
            opacity={0.75}
          />
          {/* Primary mirror cell & glowing aperture */}
          <ellipse
            cx={173}
            cy={0}
            rx={8}
            ry={28}
            fill="#A8E8FF"
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        </g>

        {/* Cylindrical Observatory Base Building */}
        <rect
          x={208}
          y={1125}
          width={454}
          height={98}
          rx={6}
          fill="#151E30"
          stroke="#465878"
          strokeWidth={2}
        />
        <line x1={208} y1={1144} x2={662} y2={1144} stroke="#889EC0" strokeWidth={2} />
        {[262, 322, 382].map((wx, idx) => (
          <rect
            key={idx}
            x={wx}
            y={1166}
            width={34}
            height={22}
            rx={3}
            fill="#FFD97D"
          />
        ))}
      </svg>

      {/* Top Date Pill */}
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
        <PillBadge label="17 AGUSTUS 2017 · OBSERVATORIUM DUNIA" tone="gold" />
      </div>

      {/* Frosted Spectroscopic Detection Card */}
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
          eyebrow="DETEKSI LANGSUNG LIGO-VIRGO & TELESKOP OPTIK"
          mainValue={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
              <span style={{ color: '#F5B841' }}>70 TELESKOP</span>
              <span style={{ fontSize: 38, color: '#EAEFF8' }}>
                {kilonovaBloom > 0.4 ? 'KILATAN EMAS BARU' : 'ARAH 1 TITIK LANGIT'}
              </span>
            </div>
          }
          subLabel="SPEKTRUM CAHAYA MEMBUKTIKAN EMAS & PLATINA LAHIR DARI KILONOVA"
          accent="gold"
          width={1160}
        />
      </div>

      <GoldenDustField seed="ch07-stars" count={26} maxY={1750} />
      <BottomCaptionVignette />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 08 — FOSIL BINTANG MATI + SLEEK DARK COMMENT PILL BAR (1440x2560)
// ============================================================================

export const Scene08FosilBintang: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[7];
  const sec = ch.start + frame / fps;
  const localT = frame / fps;

  const goldBrushedUrl = useMemo(() => getGoldFoilTexture('brushed'), []);
  const nebulaUrl = useMemo(() => getKilonovaNebulaTexture(), []);

  const sceneEnter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 86 },
  });

  // Dark frosted comment bar springs in at 107.1s ("Ada benda emas yang sedang kamu pakai sekarang?")
  const commentBarEnter = spring({
    frame: Math.max(0, frame - Math.round((107.0 - ch.start) * fps)),
    fps,
    config: { damping: 17, stiffness: 98 },
  });

  const sampleReply = 'Cincin emas di jari manis...';
  const typedCount = Math.floor(
    clamp01(prog(sec, 107.65, 111.15)) * sampleReply.length,
  );
  const cursorVisible = Math.floor(localT * 2.4) % 2 === 0;

  const ringFloatY = Math.sin(localT * 1.6) * 10;
  const cx = 720;
  const cy = 735 + ringFloatY;

  return (
    <AbsoluteFill style={{ backgroundColor: '#04060C', overflow: 'hidden' }}>
      <DeepCosmosBackdrop seed="ch08-finale" nebulaHue="gold" starCount={140} drift={0.5} />
      <TechnicalGridOverlay opacity={0.045} cell={85} tint="235, 195, 120" />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="ch8-ring-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8C5407" />
            <stop offset="24%" stopColor="#F5BD38" />
            <stop offset="50%" stopColor="#FFF8D8" />
            <stop offset="76%" stopColor="#D6941B" />
            <stop offset="100%" stopColor="#593303" />
          </linearGradient>
          <linearGradient id="ch8-skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EAC096" />
            <stop offset="46%" stopColor="#AD7449" />
            <stop offset="100%" stopColor="#2E1A10" />
          </linearGradient>
          <mask id="ch8-ring-mask">
            <rect x={0} y={0} width={1440} height={2560} fill="black" />
            <circle cx={cx} cy={cy} r={225} fill="white" />
            <circle cx={cx} cy={cy} r={166} fill="black" />
          </mask>
        </defs>

        {/* Distant Younger Sun Reference in Upper-Left */}
        <g opacity={0.9}>
          <TexturedCelestialSphere
            cx={255}
            cy={385}
            r={62}
            kind="solar"
            rimColor="rgba(255, 196, 88, 0.55)"
          />
          <text
            x={255}
            y={482}
            textAnchor="middle"
            fill="rgba(220, 228, 242, 0.76)"
            fontFamily={IDENTITY.fontMono}
            fontSize={18}
            letterSpacing="0.15em"
          >
            MATAHARI (4,6 M THN)
          </text>
        </g>

        {/* ================================================================ */}
        {/* LEVITATING 24K GOLD RING FRAMING MINIATURE KILONOVA MEMORY       */}
        {/* ================================================================ */}
        <g
          transform={`translate(0, ${(1 - sceneEnter) * 48})`}
          opacity={clamp01(sceneEnter * 1.3)}
        >
          {/* Warm volumetric Aurum halo behind ring */}
          <circle cx={cx} cy={cy} r={320} fill="rgba(245, 184, 65, 0.14)" />
          <circle
            cx={cx}
            cy={cy}
            r={272}
            fill="none"
            stroke="rgba(245, 184, 65, 0.24)"
            strokeDasharray="6 12"
            strokeWidth={1.6}
          />

          {/* Twin-Star Kilonova Memory Glowing Inside the Ring */}
          {nebulaUrl && (
            <g transform={`translate(${cx}, ${cy}) scale(0.76) rotate(${localT * 10})`} opacity={0.86}>
              <image href={nebulaUrl} x={-230} y={-230} width={460} height={460} />
            </g>
          )}
          <g transform={`translate(${cx}, ${cy}) rotate(${localT * 48})`}>
            <circle cx={-34} cy={0} r={14} fill="#FFFFFF" />
            <circle cx={34} cy={0} r={14} fill="#B8F2FF" />
            <circle cx={0} cy={0} r={42} fill="rgba(255, 232, 152, 0.34)" />
          </g>

          {/* Sculpted 24K Gold Ring Band with Procedural Brushed Gold Foil */}
          <g mask="url(#ch8-ring-mask)">
            <circle cx={cx} cy={cy} r={228} fill="url(#ch8-ring-gold)" />
            {goldBrushedUrl && (
              <image
                href={goldBrushedUrl}
                x={cx - 235}
                y={cy - 235}
                width={470}
                height={470}
                opacity={0.5}
              />
            )}
          </g>
          <circle
            cx={cx}
            cy={cy}
            r={225}
            fill="none"
            stroke="#FFF7D6"
            strokeWidth={2.8}
          />
          <circle
            cx={cx}
            cy={cy}
            r={166}
            fill="none"
            stroke="#FFF4C2"
            strokeWidth={2.4}
          />
          <circle
            cx={cx}
            cy={cy}
            r={196}
            fill="none"
            stroke="rgba(255, 253, 236, 0.52)"
            strokeWidth={2}
          />

          {/* Orbiting Specular Diamond Glint on Gold Rim */}
          {(() => {
            const ga = localT * 0.9 - 2.2;
            const gx = cx + Math.cos(ga) * 196;
            const gy = cy + Math.sin(ga) * 196;
            return (
              <g transform={`translate(${gx}, ${gy})`}>
                <line x1={-22} y1={0} x2={22} y2={0} stroke="#FFFFFF" strokeWidth={2.6} />
                <line x1={0} y1={-22} x2={0} y2={22} stroke="#FFFFFF" strokeWidth={2.6} />
                <circle cx={0} cy={0} r={5} fill="#FFFFFF" />
              </g>
            );
          })()}

          {/* Small Companion Gold Nugget Specimen */}
          <FoilGoldNugget
            x={1115}
            y={925}
            size={84}
            rotation={localT * 14}
            shimmerPhase={localT * 2.8}
            idSuffix="ch8-nugget"
          />

          {/* Rim-Lit Open Human Hand Cradling the Golden Glow Below */}
          <g transform="translate(0, 62)">
            <ellipse cx={720} cy={1042} rx={275} ry={48} fill="rgba(245, 184, 65, 0.22)" />
            <path
              d="M 335,1235 C 405,1135 492,1072 604,1058 L 892,1034 C 948,1028 982,1050 976,1078 C 970,1104 926,1116 868,1122 L 998,1108 C 1044,1104 1068,1128 1054,1152 C 1040,1178 982,1192 894,1202 L 972,1196 C 1006,1196 1020,1218 998,1238 C 966,1264 852,1282 708,1288 L 315,1295 Z"
              fill="url(#ch8-skin)"
            />
            {/* Warm golden rim light along upper palm & fingers */}
            <path
              d="M 425,1136 C 495,1078 575,1060 645,1054 L 915,1034 C 954,1032 976,1046 975,1065"
              fill="none"
              stroke="#FFE8A6"
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.85}
            />
          </g>
        </g>
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
        <PillBadge label="WARISAN BINTANG MATI · Au-79" tone="gold" />
      </div>

      {/* Crisp Status Pill Under Hand (GPS Finale Rhythm!) */}
      <div
        style={{
          position: 'absolute',
          top: 1368,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <PillBadge
          label="LEBIH TUA DARI MATAHARI & BUMI"
          tone="emerald"
          style={{ fontSize: 21, padding: '11px 30px' }}
        />
      </div>

      {/* ================================================================== */}
      {/* SLEEK DARK FROSTED COMMENT INPUT BAR (EXACT GPS EPISODE STYLE!)    */}
      {/* ================================================================== */}
      {commentBarEnter > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 160,
            right: 160,
            top: 1495,
            height: 124,
            borderRadius: 32,
            background:
              'linear-gradient(180deg, rgba(30, 34, 46, 0.90) 0%, rgba(18, 21, 30, 0.94) 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.13)',
            boxShadow:
              '0 28px 64px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 26px',
            gap: 24,
            opacity: clamp01(commentBarEnter * 1.3),
            transform: `translateY(${(1 - commentBarEnter) * 34}px) scale(${0.96 + 0.04 * commentBarEnter})`,
          }}
        >
          {/* Coral-Red Naysi Commenter Avatar */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #E05A44 0%, #B83826 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: IDENTITY.fontBody,
              fontSize: 34,
              fontWeight: 800,
              color: '#FFFFFF',
              flexShrink: 0,
              boxShadow: '0 6px 18px rgba(224, 90, 68, 0.35)',
            }}
          >
            N
          </div>

          {/* Live Typing Comment Input Text + Blinking Blue Caret */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              fontFamily: IDENTITY.fontBody,
              fontSize: 34,
              fontWeight: 500,
              color: typedCount > 0 ? '#EAEFF8' : 'rgba(196, 206, 224, 0.45)',
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <span>
              {typedCount > 0
                ? sampleReply.slice(0, typedCount)
                : 'Tulis benda emasmu di komentar...'}
            </span>
            <span
              style={{
                display: 'inline-block',
                width: 3.5,
                height: 38,
                marginLeft: 4,
                borderRadius: 2,
                backgroundColor: '#4BA3FF',
                opacity: cursorVisible ? 1 : 0,
              }}
            />
          </div>

          {/* Circular Send Paper-Plane Button */}
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.09)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width={30} height={30} viewBox="0 0 24 24" fill="none">
              <path
                d="M3.4 20.4L20.85 12.92C21.66 12.57 21.66 11.43 20.85 11.08L3.4 3.6C2.74 3.31 2.01 3.8 2.01 4.51L2 9.12C2 9.62 2.37 10.05 2.87 10.11L17 12L2.87 13.88C2.37 13.95 2 14.38 2 14.88L2.01 19.49C2.01 20.2 2.74 20.69 3.4 20.4Z"
                fill="#DCE4F2"
              />
            </svg>
          </div>
        </div>
      )}

      <GoldenDustField seed="ch08-aurum" count={36} maxY={1740} />
      <BottomCaptionVignette />
    </AbsoluteFill>
  );
};
