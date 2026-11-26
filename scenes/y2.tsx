import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
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
  GoldenMotesOverlay,
  SpecimenBadge,
} from './emas';

// ============================================================================
// LEMBAR 07 — AGUSTUS 2017: HIGH-ALTITUDE OBSERVATORY DOME & KILONOVA NGC 4993
// Pure 2D architectural & night-sky visual object scene (ZERO charts!):
//  - Starry Atacama/Paranal night sky with glowing elliptical galaxy NGC 4993
//  - Sudden blooming golden-amber Kilonova star (GW170817) casting starlight
//  - Foreground monumental 2D Observatory Dome with open shutter & rotating
//    giant telescope tube + distant ridge observatories locking onto the flash!
// ============================================================================

export const Lembar07Observatorium2017: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[6];
  const localT = Math.max(0, sec - ch.start);

  // Telescope slews smoothly from zenith (-72 deg) to lock onto NGC 4993 (-34 deg)
  const slewP = easeInOutCubic(prog(sec, 83.2, 88.4));
  const kilonovaBloom = easeOutCubic(prog(sec, 85.1, 88.2));
  const beamLockP = easeInOutCubic(prog(sec, 88.2, 92.4));

  const targetX = 886;
  const targetY = 256;

  // Main foreground telescope pivot inside open observatory dome
  const domeX = 376;
  const domeY = 936;
  const teleAngleDeg = interpolate(slewP, [0, 1], [-68, -33]);

  const kilonovaStar = makeStar({
    points: 4,
    innerRadius: 6,
    outerRadius: 74,
  });

  return (
    <CelestialPlateSheet chapter={ch}>
      <svg width={1208} height={1298} viewBox="0 0 1208 1298">
        <defs>
          <linearGradient id="l7-night-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#050814" />
            <stop offset="48%" stopColor="#0C1630" />
            <stop offset="82%" stopColor="#18294D" />
            <stop offset="100%" stopColor="#2A3552" />
          </linearGradient>

          {/* Milky Way Diagonal Band */}
          <linearGradient id="l7-milkyway" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A659E" stopOpacity="0" />
            <stop offset="50%" stopColor="#7C98CF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FFD978" stopOpacity="0.06" />
          </linearGradient>

          {/* Host Lenticular Galaxy NGC 4993 */}
          <radialGradient id="l7-galaxy" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF7DC" stopOpacity="0.95" />
            <stop offset="32%" stopColor="#F5D598" stopOpacity="0.52" />
            <stop offset="70%" stopColor="#8CA4D8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0C1630" stopOpacity="0" />
          </radialGradient>

          {/* Blooming Golden Kilonova Afterglow */}
          <radialGradient id="l7-kilonova" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="28%" stopColor="#FFE07D" stopOpacity="0.95" />
            <stop offset="62%" stopColor="#E57A2B" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#B83926" stopOpacity="0" />
          </radialGradient>

          {/* Incoming Golden Starlight Cone Collected by Telescope */}
          <linearGradient id="l7-starbeam" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE694" stopOpacity="0.46" />
            <stop offset="60%" stopColor="#F5BC38" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FFD978" stopOpacity="0.05" />
          </linearGradient>

          {/* Metallic Brushed Silver Observatory Dome */}
          <linearGradient id="l7-dome-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DCE4F2" />
            <stop offset="38%" stopColor="#94A3BD" />
            <stop offset="75%" stopColor="#4E5B73" />
            <stop offset="100%" stopColor="#262F40" />
          </linearGradient>
        </defs>

        {/* 1. Deep Chilean Night Sky & Milky Way Arch */}
        <rect width={1208} height={1298} fill="url(#l7-night-sky)" />
        <polygon
          points="-80,780 980,-60 1280,140 180,980"
          fill="url(#l7-milkyway)"
        />
        <CosmicStarfield seed="l7-stars" count={118} driftX={3} driftY={-2} />

        {/* 2. Host Galaxy NGC 4993 (130 Million Light-Years Away in Hydra) */}
        <g transform={`translate(${targetX - 54}, ${targetY + 26}) rotate(-24)`}>
          <ellipse cx={0} cy={0} rx={118} ry={58} fill="url(#l7-galaxy)" />
          <circle cx={0} cy={0} r={14} fill="#FFFDF2" opacity={0.9} />
        </g>

        {/* 3. Sudden Blooming Golden-Crimson Kilonova Star (GW170817)! */}
        {kilonovaBloom > 0.01 && (
          <g transform={`translate(${targetX}, ${targetY})`} opacity={kilonovaBloom}>
            {/* Expanding golden-platinum spectral wave rings */}
            {[0, 1, 2].map((rIdx) => {
              const rp = ((localT * 0.35 + rIdx / 3) % 1);
              return (
                <circle
                  key={rIdx}
                  cx={0}
                  cy={0}
                  r={24 + rp * 165}
                  fill="none"
                  stroke={rIdx % 2 === 0 ? '#FFD978' : '#CFE6FF'}
                  strokeWidth={2}
                  opacity={(1 - rp) * 0.52}
                />
              );
            })}

            <circle
              cx={0}
              cy={0}
              r={105 * (0.85 + 0.15 * Math.sin(localT * 3))}
              fill="url(#l7-kilonova)"
            />
            <g
              transform={`translate(-74, -74) scale(${0.75 + 0.25 * Math.sin(localT * 2.6)})`}
            >
              <path d={kilonovaStar.path} fill="#FFFDF6" />
            </g>
          </g>
        )}

        {/* 4. Incoming Starlight Beams from NGC 4993 to Foreground & Ridge Telescopes! */}
        {beamLockP > 0.02 && (
          <g opacity={beamLockP}>
            {/* Main golden light cone entering foreground observatory telescope */}
            <polygon
              points={`${targetX},${targetY} ${domeX + 42},${domeY - 118} ${domeX + 118},${domeY - 56}`}
              fill="url(#l7-starbeam)"
            />
            {/* Thin optical lock rays to distant mountain ridge domes (70 telescopes worldwide!) */}
            {[696, 862, 1038].map((rx, idx) => {
              const ry = idx === 0 ? 892 : idx === 1 ? 864 : 908;
              return (
                <line
                  key={idx}
                  x1={targetX}
                  y1={targetY}
                  x2={rx}
                  y2={ry}
                  stroke="rgba(255, 224, 138, 0.28)"
                  strokeWidth={2}
                  strokeDasharray="8 8"
                />
              );
            })}
          </g>
        )}

        {/* ================================================================ */}
        {/* 5. LAYERED ATACAMA MOUNTAIN RIDGES & DISTANT OBSERVATORY DOMES   */}
        {/* ================================================================ */}
        {/* Far Mountain Range */}
        <polygon
          points="0,925 190,848 395,896 685,826 880,866 1045,834 1208,882 1208,1298 0,1298"
          fill="#131B2E"
        />

        {/* Distant Partner Observatory Domes Along the Ridge */}
        {[
          [696, 896, 0.72],
          [862, 868, 0.88],
          [1038, 912, 0.68],
        ].map(([dx, dy, sc], idx) => (
          <g key={idx} transform={`translate(${dx}, ${dy}) scale(${sc})`}>
            <path
              d="M -38 0 A 38 38 0 0 1 38 0 Z"
              fill="#6D7C96"
              stroke="#1A2236"
              strokeWidth={2}
            />
            <rect x={-42} y={0} width={84} height={26} fill="#2A344A" />
            {/* Tiny warm control window */}
            <rect x={-8} y={8} width={16} height={10} fill="#FFD678" opacity={0.85} />
          </g>
        ))}

        {/* Mid-Foreground Mountain Ridge */}
        <polygon
          points="0,985 265,918 545,942 780,992 1020,956 1208,996 1208,1298 0,1298"
          fill="#0C111E"
        />

        {/* ================================================================ */}
        {/* 6. FOREGROUND MONUMENTAL OBSERVATORY DOME & SLEWING TELESCOPE    */}
        {/* ================================================================ */}
        <g transform={`translate(${domeX}, ${domeY})`}>
          {/* Observatory Summit Rock Pad */}
          <polygon
            points="-310,120 -235,44 245,44 330,120 360,362 -360,362"
            fill="#080B14"
          />

          {/* Cylindrical Concrete & Steel Observatory Base */}
          <rect
            x={-208}
            y={-52}
            width={416}
            height={104}
            rx={4}
            fill="#2B3447"
            stroke="#0E1320"
            strokeWidth={3}
          />
          <rect x={40} y={-52} width={168} height={104} fill="#1E2534" />

          {/* Warm Lit Control Room Windows Along Base */}
          {[-158, -106, -54].map((wx, idx) => (
            <rect
              key={idx}
              x={wx}
              y={-18}
              width={32}
              height={22}
              rx={2}
              fill="#FFE08A"
              stroke="#101522"
              strokeWidth={2}
            />
          ))}

          {/* Dome Hemisphere Shell */}
          <path
            d="M -204 -52 A 204 204 0 0 1 204 -52 Z"
            fill="url(#l7-dome-metal)"
            stroke="#101522"
            strokeWidth={3}
          />
          {/* Structural Dome Meridian Ribs */}
          <path
            d="M -118 -52 A 118 204 0 0 1 0 -256"
            fill="none"
            stroke="rgba(16, 21, 34, 0.35)"
            strokeWidth={2.5}
          />

          {/* Wide Open Dark Slit Cavity Revealing Warm Interior & Giant Telescope! */}
          <path
            d="M -22 -254 A 204 204 0 0 1 168 -166 L 132 -52 L -22 -52 Z"
            fill="#0A0E1A"
            stroke="#DCE4F2"
            strokeWidth={3}
          />

          {/* GIANT SEGMENTED-MIRROR TELESCOPE TUBE SLEWING TOWARD NGC 4993! */}
          <g transform={`translate(34, -84) rotate(${90 + teleAngleDeg})`}>
            {/* Heavy Altitude Fork Mount */}
            <circle
              cx={0}
              cy={0}
              r={26}
              fill="#5D6B85"
              stroke="#101522"
              strokeWidth={2.5}
            />
            {/* Primary Mirror Cell & Golden Starlight Reflection */}
            <rect
              x={-36}
              y={-18}
              width={72}
              height={28}
              rx={4}
              fill="#3B465C"
              stroke="#101522"
              strokeWidth={2}
            />
            <ellipse
              cx={0}
              cy={-18}
              rx={32}
              ry={7}
              fill={beamLockP > 0.2 ? '#FFE48A' : '#8BE8FF'}
            />
            {/* Open Serrurier Truss Optical Tube Extending Out the Dome Slit */}
            <rect
              x={-28}
              y={-188}
              width={56}
              height={170}
              fill="rgba(34, 43, 61, 0.72)"
              stroke="#B8C5DC"
              strokeWidth={2.5}
            />
            <line x1={-28} y1={-18} x2={28} y2={-110} stroke="#9AA8C2" strokeWidth={2} />
            <line x1={28} y1={-18} x2={-28} y2={-110} stroke="#9AA8C2" strokeWidth={2} />
            <line x1={-28} y1={-110} x2={28} y2={-188} stroke="#9AA8C2" strokeWidth={2} />
            <line x1={28} y1={-110} x2={-28} y2={-188} stroke="#9AA8C2" strokeWidth={2} />
            {/* Top Secondary Mirror Ring */}
            <rect
              x={-33}
              y={-198}
              width={66}
              height={14}
              rx={3}
              fill="#DCE4F2"
              stroke="#101522"
              strokeWidth={2}
            />
          </g>

          {/* Dome Base Ring Flange */}
          <rect
            x={-214}
            y={-58}
            width={428}
            height={14}
            rx={3}
            fill="#9BA8C2"
            stroke="#101522"
            strokeWidth={2.5}
          />
        </g>
      </svg>

      <GoldenMotesOverlay seed="lembar07" count={26} riseSpeed={10} />

      <SpecimenBadge
        text="17 AGUSTUS 2017 · GW170817"
        sub="70 observatorium menangkap kilatan emas & platina baru"
        right={34}
        bottom={34}
        tone="gold"
      />
    </CelestialPlateSheet>
  );
};

// ============================================================================
// LEMBAR 08 — WARISAN KOSMOS: OPEN HUMAN PALM, GLEAMING RING & BALASAN CARD
// Exact closing structure of 1-HfPa9AVLJGtTqdDyVI8lObiSQQjMzIe:
//  - Upper full-bleed 2D object illustration (height 940px): Sculpted warm
//    chiaroscuro human hand cradling a floating 24K gold ring whose circular
//    halo frames a miniature golden kilonova older than our Sun!
//  - Lower archival cream BALASAN reply card with typewriter question & CTA!
// ============================================================================

export const Lembar08FosilBintang: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[7];
  const localT = Math.max(0, sec - ch.start);

  const handIn = spring({
    frame: Math.max(0, Math.round(localT * fps - 4)),
    fps,
    config: { damping: 19, stiffness: 80, mass: 1.12 },
  });

  const floatY = Math.sin(localT * 1.9) * 10;
  const promptP = clamp01((sec - 107.45) / 2.25);
  const ctaSpring = spring({
    frame: Math.max(0, Math.round((sec - 109.9) * fps)),
    fps,
    config: { damping: 14, stiffness: 155, mass: 0.85 },
  });

  const promptQuestion = 'Ada benda emas yang sedang kamu pakai sekarang?';
  const typedCount = Math.round(promptQuestion.length * promptP);

  const glint4 = makeStar({ points: 4, innerRadius: 3.5, outerRadius: 26 });

  const replyCard = (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'rgba(247, 242, 231, 0.96)',
        border: `2px solid ${IDENTITY.ink}`,
        padding: '24px 36px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'inset 0 0 28px rgba(138, 102, 52, 0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '0.16em',
            color: IDENTITY.kilonovaRed,
          }}
        >
          BALASAN
        </span>
        <span
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: IDENTITY.inkMuted,
          }}
        >
          FOSIL BINTANG · Au-79
        </span>
      </div>

      <div
        style={{
          fontFamily: IDENTITY.fontSerif,
          fontWeight: 700,
          fontSize: 33,
          lineHeight: 1.24,
          color: IDENTITY.ink,
          minHeight: 44,
        }}
      >
        {promptQuestion.slice(0, typedCount)}
        {promptP > 0.02 && promptP < 0.99 ? (
          <span style={{ color: IDENTITY.kilonovaRed }}>|</span>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTop: '1.5px solid rgba(26, 23, 20, 0.16)',
        }}
      >
        <div
          style={{
            flex: 1,
            marginRight: 24,
            borderBottom: '2px dotted rgba(26, 23, 20, 0.36)',
            paddingBottom: 6,
            fontFamily: IDENTITY.fontMono,
            fontSize: 18,
            color: IDENTITY.inkMuted,
            letterSpacing: '0.08em',
          }}
        >
          JAWABANMU:
        </div>

        <div
          style={{
            padding: '12px 26px',
            background: IDENTITY.kilonovaRed,
            color: '#FFF9F0',
            fontFamily: IDENTITY.fontMono,
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: '0.12em',
            transform: `scale(${0.88 + 0.12 * ctaSpring})`,
            opacity: clamp01(ctaSpring * 1.4),
            boxShadow: '0 6px 18px rgba(184, 57, 38, 0.32)',
          }}
        >
          TULIS DI KOMENTAR
        </div>
      </div>
    </div>
  );

  return (
    <CelestialPlateSheet
      chapter={ch}
      plateHeight={946}
      footerSlot={replyCard}
    >
      <svg width={1208} height={918} viewBox="0 0 1208 918">
        <defs>
          <radialGradient id="l8-space" cx="50%" cy="42%" r="70%">
            <stop offset="0%" stopColor="#1B1F3B" />
            <stop offset="56%" stopColor="#0C1022" />
            <stop offset="100%" stopColor="#050710" />
          </radialGradient>

          {/* Cosmic Kilonova Halo Framed Inside the Floating Ring */}
          <radialGradient id="l8-ring-portal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF2" stopOpacity="0.96" />
            <stop offset="28%" stopColor="#FFD76E" stopOpacity="0.82" />
            <stop offset="62%" stopColor="#D4572A" stopOpacity="0.46" />
            <stop offset="100%" stopColor="#26143D" stopOpacity="0" />
          </radialGradient>

          {/* 24K Upright Gold Ring Band Gradient */}
          <linearGradient id="l8-gold-band" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF7C8" />
            <stop offset="22%" stopColor="#F5BD3B" />
            <stop offset="50%" stopColor="#9E650C" />
            <stop offset="78%" stopColor="#F2B838" />
            <stop offset="100%" stopColor="#FFF5BE" />
          </linearGradient>

          {/* Warm Chiaroscuro Rim-Lit Human Skin Shading */}
          <linearGradient id="l8-hand-lit" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#F0BA86" />
            <stop offset="38%" stopColor="#B8764B" />
            <stop offset="82%" stopColor="#5C3422" />
            <stop offset="100%" stopColor="#24130D" />
          </linearGradient>
        </defs>

        {/* 1. Starry Deep-Space Canvas */}
        <rect width={1208} height={918} fill="url(#l8-space)" />
        <CosmicStarfield
          seed="l8-stars"
          count={86}
          width={1208}
          height={918}
          driftX={5}
          driftY={-3}
        />

        {/* Subtle Distant Sun Reference on Far Left ("lebih tua dari Matahari") */}
        <g transform="translate(174, 212)" opacity={0.82}>
          <circle cx={0} cy={0} r={66} fill="rgba(255, 192, 72, 0.22)" />
          <circle
            cx={0}
            cy={0}
            r={38}
            fill="#FFBE42"
            stroke="#FFF4BD"
            strokeWidth={2}
          />
          <text
            x={0}
            y={66}
            textAnchor="middle"
            fontFamily={IDENTITY.fontMono}
            fontWeight={700}
            fontSize={14}
            fill="rgba(255, 236, 184, 0.78)"
            letterSpacing="0.12em"
          >
            MATAHARI (4,6 M THN)
          </text>
        </g>

        {/* ================================================================ */}
        {/* 2. FLOATING 24K GOLD RING FRAMING A MINIATURE GOLDEN KILONOVA!   */}
        {/* ================================================================ */}
        <g
          transform={`translate(604, ${362 + floatY}) scale(${0.85 + 0.15 * handIn})`}
          opacity={clamp01(handIn * 1.3)}
        >
          {/* Warm Golden Aura Radiating Down onto the Open Palm */}
          <circle cx={0} cy={0} r={255} fill="rgba(245, 188, 56, 0.15)" />

          {/* Miniature Swirling Twin-Star Kilonova Inside the Ring's Circle! */}
          <circle cx={0} cy={0} r={146} fill="url(#l8-ring-portal)" />
          {[0, 1].map((arm) => {
            const ang = localT * 1.1 + arm * Math.PI;
            const sx = Math.cos(ang) * 38;
            const sy = Math.sin(ang) * 24;
            return (
              <circle
                key={arm}
                cx={sx}
                cy={sy}
                r={12}
                fill="#FFFFFF"
                opacity={0.92}
              />
            );
          })}

          {/* Sculpted 24K Gold Ring Band (Annulus + Inner Bevel) */}
          <path
            fillRule="evenodd"
            d="M 0 -174 A 174 174 0 1 0 0 174 A 174 174 0 1 0 0 -174 Z
               M 0 -132 A 132 132 0 1 0 0 132 A 132 132 0 1 0 0 -132 Z"
            fill="url(#l8-gold-band)"
            stroke="#4F2E03"
            strokeWidth={3}
          />
          {/* Inner 3D Bevel Lip */}
          <circle
            cx={0}
            cy={0}
            r={136}
            fill="none"
            stroke="#FFF9DC"
            strokeWidth={3}
            opacity={0.8}
          />
          <circle
            cx={0}
            cy={0}
            r={170}
            fill="none"
            stroke="#FFE999"
            strokeWidth={2}
            opacity={0.65}
          />

          {/* Sparkling Glint on Upper-Left Bevel of the Ring */}
          <g
            transform={`translate(${-122 - 26}, ${-122 - 26}) rotate(${localT * 32} 26 26)`}
          >
            <path d={glint4.path} fill="#FFFDF6" />
          </g>
        </g>

        {/* ================================================================ */}
        {/* 3. SCULPTED CHIAROSCURO OPEN HUMAN PALM CRADLING THE GOLDEN AURA */}
        {/* ================================================================ */}
        <g
          transform={`translate(604, ${748 + (1 - handIn) * 95})`}
          opacity={clamp01(handIn * 1.25)}
        >
          {/* Warm Golden Upward Rim Reflection on Palm */}
          <ellipse
            cx={0}
            cy={-92}
            rx={280}
            ry={64}
            fill="rgba(255, 206, 88, 0.22)"
          />

          {/* Sculpted Cupped Hand & Forearm Silhouette with Golden Top Rim */}
          <path
            d="M -410 185
               C -330 92, -255 24, -188 -26
               C -142 -58, -96 -62, -48 -48
               C 14 -30, 78 -28, 146 -54
               C 198 -74, 248 -88, 286 -74
               C 308 -66, 298 -34, 256 -12
               C 298 -22, 332 -20, 342 4
               C 350 24, 314 48, 254 64
               C 178 86, 88 108, -18 118
               L -148 185 Z"
            fill="url(#l8-hand-lit)"
            stroke="#24130D"
            strokeWidth={3}
          />
          {/* Crisp Warm Golden Rim Highlight Along Upper Edge of Palm & Fingers */}
          <path
            d="M -242 18 C -186 -28, -132 -58, -62 -48 C 8 -34, 86 -30, 156 -56 C 206 -74, 252 -86, 286 -74"
            fill="none"
            stroke="#FFE69C"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.82}
          />
        </g>
      </svg>

      <GoldenMotesOverlay
        seed="lembar08"
        count={36}
        width={1208}
        height={918}
        riseSpeed={14}
      />

      <SpecimenBadge
        text="FOSIL BINTANG DI JARIMU"
        sub="Lebih tua dari Bumi & Matahari kita"
        right={28}
        y={26}
        tone="gold"
      />
    </CelestialPlateSheet>
  );
};
