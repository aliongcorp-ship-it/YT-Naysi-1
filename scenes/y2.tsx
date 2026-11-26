import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { contours } from 'd3-contour';
import { geoPath } from 'd3-geo';
import {
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  easeOutExpo,
  prog,
  smoothstep,
} from './script';
import {
  DocumentaryHeader,
  GeosminBrassMedallion,
  MatteCanvasGround,
  TrimPath,
  buildOrthographicGlobe,
  fbm2D,
  useProceduralSurface,
} from './hujan';

// ============================================================================
// SCENE 07 — KOMPAS EVOLUSI GURUN: UNTA & MANUSIA PURBA (89.120s – 102.270s)
// ============================================================================

const DromedaryCamelSilhouette: React.FC<{
  x: number;
  y: number;
  scale?: number;
  stridePhase?: number;
}> = ({ x, y, scale = 1, stridePhase = 0 }) => {
  const s1 = Math.sin(stridePhase) * 8;
  const s2 = Math.sin(stridePhase + Math.PI) * 8;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Four Long Striding Desert Legs */}
      <line x1={-34} y1={-46} x2={-42 + s1} y2={0} stroke="#1B150E" strokeWidth={7} strokeLinecap="round" />
      <line x1={-22} y1={-46} x2={-16 + s2} y2={0} stroke="#2A2117" strokeWidth={6} strokeLinecap="round" />
      <line x1={26} y1={-48} x2={20 + s2} y2={0} stroke="#1B150E" strokeWidth={7} strokeLinecap="round" />
      <line x1={38} y1={-48} x2={44 + s1} y2={0} stroke="#2A2117" strokeWidth={6} strokeLinecap="round" />

      {/* Torso, Single Desert Hump, Curved Neck & Raised Sniffing Muzzle */}
      <path
        d="M -52,-54 C -46,-84 -24,-112 0,-112 C 22,-112 34,-86 48,-76 C 62,-68 72,-92 78,-118 C 82,-134 94,-138 112,-134 C 118,-132 118,-122 106,-118 C 94,-114 90,-98 84,-74 C 78,-50 62,-38 38,-40 L -36,-42 C -48,-42 -54,-46 -52,-54 Z"
        fill="#1B150E"
        stroke="rgba(236, 199, 126, 0.36)"
        strokeWidth={1.6}
      />
      {/* Tufted Tail */}
      <path d="M -50,-56 Q -64,-44 -60,-28" fill="none" stroke="#1B150E" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

export const Scene07KompasGurun: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[6];
  const localSec = frame / fps;

  const sandUrl = useProceduralSurface('desert-sand');

  const windReach = easeOutCubic(prog(localSec, 0.4, 3.8));
  const caravanWalk = easeInOutCubic(prog(localSec, 0.2, 12.2));

  // Real world-atlas Orthographic Earth inset centered on Arabian/East-African Monsoon Belt
  const aridGlobe = useMemo(
    () => buildOrthographicGlobe(236, 584, 96, 44 + localSec * 1.4, 16, false),
    [Math.floor(localSec * 30)],
  );

  // Marching-squares topographic sand-dune isolines
  const duneContours = useMemo(() => {
    const gw = 52;
    const gh = 26;
    const vals = new Array<number>(gw * gh);
    for (let j = 0; j < gh; j++) {
      for (let i = 0; i < gw; i++) {
        const ridge = Math.sin(i * 0.22 + j * 0.14) * 0.32;
        const n = fbm2D('s7-dune-iso', i * 0.12, j * 0.12, 3) * 0.38;
        vals[j * gw + i] = 0.5 + ridge + n;
      }
    }
    const gen = contours().size([gw, gh]).thresholds([0.28, 0.42, 0.56, 0.7]);
    const pathGen = geoPath();
    return gen(vals).map((c) => pathGen(c) || '');
  }, []);

  const caravanBaseX = interpolate(caravanWalk, [0, 1], [235, 435]);

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="monsoon-slate"
        surfaceOpacity={0.24}
        warmLampX={72}
        warmLampY={44}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure="80 KM"
        unit="KOMPAS AROMA"
        subtitle="HEMBUSAN GEOSMIN MENUNTUN MANUSIA PURBA & UNTA KE MATA AIR"
        localSec={localSec}
        accentColor={IDENTITY.amberSpore}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s7-panorama">
            <rect x={112} y={452} width={1216} height={896} />
          </clipPath>
          <clipPath id="s7-dune-mask">
            <path d="M 112,1055 Q 385,975 685,1035 T 1328,995 L 1328,1348 L 112,1348 Z" />
          </clipPath>
          <linearGradient id="s7-sky-dusk" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1A1610" />
            <stop offset="58%" stopColor="#262017" />
            <stop offset="100%" stopColor="#1B2A28" />
          </linearGradient>
          <linearGradient id="s7-rain-shaft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(182, 210, 210, 0.42)" />
            <stop offset="100%" stopColor="rgba(122, 158, 115, 0.14)" />
          </linearGradient>
        </defs>

        <g clipPath="url(#s7-panorama)">
          <rect x={112} y={452} width={1216} height={896} fill="url(#s7-sky-dusk)" />

          {/* ============================================================== */}
          {/* FAR-RIGHT HORIZON: DISTANT MONSOON RAINSTORM & GREEN OASIS     */}
          {/* ============================================================== */}
          <g transform="translate(955, 515)">
            {/* Slanted Virga / Rain Curtain Shaft */}
            <polygon points="85,115 315,115 275,495 45,495" fill="url(#s7-rain-shaft)" />
            {Array.from({ length: 16 }).map((_, ri) => {
              const rx = 75 + ri * 15;
              const u = (localSec * 0.95 + ri * 0.13) % 1;
              return (
                <line
                  key={ri}
                  x1={rx}
                  y1={125 + u * 310}
                  x2={rx - 10}
                  y2={175 + u * 310}
                  stroke={IDENTITY.rainMist}
                  strokeWidth={1.3}
                  opacity={0.38 * (1 - u * 0.5)}
                />
              );
            })}
            {/* Layered Monsoon Cumulonimbus Cloud Anvil */}
            <path
              d="M 28,124 C 8,124 -4,104 12,88 C 18,62 48,48 78,56 C 102,26 156,22 184,52 C 218,38 264,52 274,84 C 306,86 322,124 288,124 Z"
              fill="#3A4C4F"
              stroke="rgba(222, 236, 236, 0.38)"
              strokeWidth={1.8}
            />
          </g>

          {/* Back Sand Dune Ridge */}
          <path
            d="M 112,1022 Q 445,932 775,998 T 1328,965 L 1328,1120 L 112,1120 Z"
            fill="#4B3823"
          />

          {/* Foreground Hillshaded Aeolian Sand Dunes + Topographic Isolines */}
          <g clipPath="url(#s7-dune-mask)">
            <rect x={112} y={965} width={1216} height={385} fill="#6B4F31" />
            {sandUrl && (
              <image
                href={sandUrl}
                x={112}
                y={965}
                width={1216}
                height={385}
                preserveAspectRatio="none"
                opacity={0.78}
              />
            )}
            <g transform="translate(112, 965) scale(23.4, 14.8)" opacity={0.22}>
              {duneContours.map((cd, idx) => (
                <path key={idx} d={cd} fill="none" stroke="#F0DFC2" strokeWidth={0.07} />
              ))}
            </g>
          </g>

          {/* Verdant Oasis Basin & Sprouting Desert Flora on Far Right */}
          <ellipse
            cx={1135}
            cy={1032}
            rx={148}
            ry={26}
            fill="#2E4C46"
            stroke={IDENTITY.mossLight}
            strokeWidth={1.8}
          />
          {[1025, 1075, 1195, 1242].map((px, pi) => (
            <g key={pi} transform={`translate(${px}, 1024)`}>
              <path d="M 0,0 Q -8,-28 -22,-42 M 0,0 Q 2,-34 0,-50 M 0,0 Q 10,-26 24,-38" fill="none" stroke={IDENTITY.mossLight} strokeWidth={2.8} strokeLinecap="round" />
            </g>
          ))}
          <text
            x={1135}
            y={1092}
            textAnchor="middle"
            fill={IDENTITY.mossLight}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            fontWeight={700}
            letterSpacing="0.14em"
          >
            MATA AIR & TANAH SUBUR
          </text>

          {/* ============================================================== */}
          {/* LONG-RANGE GEOSMIN WIND PLUMES TRAVELING FROM OASIS TO CARAVAN */}
          {/* ============================================================== */}
          {[
            `M 1085,935 C 885,845 695,935 ${caravanBaseX + 185},895`,
            `M 1095,885 C 875,785 685,882 ${caravanBaseX + 195},858`,
            `M 1075,975 C 895,905 705,982 ${caravanBaseX + 175},928`,
          ].map((wd, wi) => (
            <TrimPath
              key={wi}
              d={wd}
              progress={windReach}
              stroke={wi === 1 ? IDENTITY.mossLight : IDENTITY.amberLight}
              strokeWidth={3}
              strokeDasharray="14 10"
              opacity={0.82}
            />
          ))}

          {/* Desert Caravan: Ancestral Human Tracker + Two Dromedary Camels */}
          <g transform={`translate(${caravanBaseX}, 1036)`}>
            {/* Trailing Camel */}
            <DromedaryCamelSilhouette
              x={-95}
              y={10}
              scale={0.78}
              stridePhase={localSec * 4.2 + 1.4}
            />
            {/* Lead Camel Sniffing Upwind */}
            <DromedaryCamelSilhouette
              x={48}
              y={0}
              scale={0.96}
              stridePhase={localSec * 4.2}
            />
            {/* Ancestral Human Guide With Walking Staff */}
            <g transform="translate(178, 4)">
              <circle cx={0} cy={-74} r={8.5} fill="#1B150E" stroke="rgba(236,199,126,0.4)" strokeWidth={1.2} />
              <path
                d="M -9,-62 L 9,-62 L 13,-28 L 7,-28 L 10,0 L 2,0 L -1,-26 L -6,0 L -14,0 L -8,-28 L -13,-28 Z"
                fill="#1B150E"
              />
              <line x1={16} y1={-82} x2={22} y2={0} stroke={IDENTITY.amberLight} strokeWidth={2.4} />
            </g>
          </g>

          {/* ============================================================== */}
          {/* TOP-LEFT INSET: REAL WORLD-ATLAS MONSOON BELT GLOBE + COMPASS  */}
          {/* ============================================================== */}
          <g opacity={easeOutCubic(prog(localSec, 0.5, 1.4))}>
            <circle cx={236} cy={584} r={96} fill="#121D20" stroke="rgba(236,199,126,0.42)" strokeWidth={2} />
            <path d={aridGlobe.graticulePath} fill="none" stroke="rgba(207,220,217,0.12)" strokeWidth={0.8} />
            <path d={aridGlobe.landPath} fill="#465744" stroke="rgba(236,199,126,0.34)" strokeWidth={0.9} />
            {/* Engraved Compass Rose Cardinal Cross */}
            <g transform="translate(415, 584)">
              <circle cx={0} cy={0} r={48} fill="rgba(16, 20, 18, 0.85)" stroke={IDENTITY.amberSpore} strokeWidth={1.6} />
              <polygon points="0,-40 7,-7 0,0 -7,-7" fill={IDENTITY.amberLight} />
              <polygon points="0,40 6,7 0,0 -6,7" fill={IDENTITY.stoneText} />
              <polygon points="40,0 7,6 0,0 7,-6" fill={IDENTITY.mossLight} />
              <polygon points="-40,0 -7,6 0,0 -7,-6" fill={IDENTITY.stoneText} />
              <text x={0} y={70} textAnchor="middle" fill={IDENTITY.amberLight} fontFamily={IDENTITY.fontMono} fontSize={14} fontWeight={700} letterSpacing="0.14em">
                KOMPAS HIDUP
              </text>
            </g>
          </g>
        </g>

        <rect
          x={112}
          y={452}
          width={1216}
          height={896}
          fill="none"
          stroke="rgba(216, 161, 72, 0.34)"
          strokeWidth={2}
        />

        {/* Bottom Evolutionary Survival Plaque */}
        <g transform="translate(112, 1402)">
          <rect
            x={0}
            y={0}
            width={1216}
            height={196}
            fill="rgba(19, 18, 15, 0.94)"
            stroke="rgba(168, 196, 160, 0.36)"
            strokeWidth={1.8}
          />
          <text
            x={46}
            y={56}
            fill={IDENTITY.mossLight}
            fontFamily={IDENTITY.fontMono}
            fontSize={17}
            fontWeight={700}
            letterSpacing="0.16em"
          >
            WARISAN SELEKSI ALAM MAMALIA DARAT
          </text>
          <text
            x={46}
            y={114}
            fill={IDENTITY.ivoryText}
            fontFamily={IDENTITY.fontEditorial}
            fontSize={38}
            fontWeight={700}
            letterSpacing="0.04em"
          >
            BAU GEOSMIN = PETA MENUJU AIR & TANAMAN HIJAU
          </text>
          <text
            x={46}
            y={156}
            fill={IDENTITY.stoneText}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            letterSpacing="0.1em"
          >
            OTAK KITA MENGAITKAN AROMA BAKTERI TANAH DENGAN RASA AMAN & LEGA
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 08 — PARADOKS IKAN "BAU TANAH" & CTA KOMENTAR (102.270s – 116.556s)
// ============================================================================

export const Scene08ParadoksGeosmin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[7];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const teakUrl = useProceduralSurface('teak-wood');

  const stageSp = spring({ frame, fps, config: { damping: 18, stiffness: 80, mass: 1.0 } });

  // Narrator asks final question at 110.16s ("Saat gerimis pertama turun, kamu tim langsung keluar...")
  const ctaProg = easeOutExpo(prog(globalSec, 110.05, 110.85));
  const sampleComment = 'Tim langsung keluar teras hirup bau gerimis!';
  const typedLen = Math.floor(clamp01((globalSec - 110.7) / 2.4) * sampleComment.length);
  const cursorOn = Math.floor(localSec * 2.5) % 2 === 0;

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="teak-wood"
        surfaceOpacity={0.34}
        warmLampX={50}
        warmLampY={42}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure="1 ZAT"
        unit="DUA NASIB"
        subtitle="DIBENCI LIDAH PADA IKAN AIR TAWAR · DIPUJA HIDUNG SAAT HUJAN"
        localSec={localSec}
        accentColor={IDENTITY.amberSpore}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s8-window-glass">
            <rect x={806} y={564} width={452} height={412} />
          </clipPath>
          <linearGradient id="s8-fish-glaze" x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0%" stopColor="#8A5732" />
            <stop offset="52%" stopColor="#5C371E" />
            <stop offset="100%" stopColor="#382010" />
          </linearGradient>
        </defs>

        <g
          transform={`translate(0, ${(1 - stageSp) * 45})`}
          opacity={clamp01(stageSp * 1.3)}
        >
          {/* ============================================================== */}
          {/* LEFT PANEL: FRESHWATER FISH ("BAU TANAH" ON LELE & GURAME)     */}
          {/* ============================================================== */}
          <g transform="translate(104, 468)">
            <rect
              x={0}
              y={0}
              width={588}
              height={768}
              fill="rgba(22, 18, 15, 0.92)"
              stroke="rgba(182, 99, 67, 0.48)"
              strokeWidth={2}
            />
            {teakUrl && (
              <image
                href={teakUrl}
                x={0}
                y={0}
                width={588}
                height={768}
                preserveAspectRatio="none"
                opacity={0.18}
              />
            )}

            <rect x={36} y={34} width={228} height={38} fill={IDENTITY.stampRust} />
            <text
              x={150}
              y={59}
              textAnchor="middle"
              fill={IDENTITY.ivoryText}
              fontFamily={IDENTITY.fontMono}
              fontSize={16}
              fontWeight={700}
              letterSpacing="0.14em"
            >
              DI LIDAH: DIBENCI
            </text>

            {/* Handcrafted Ceramic Platter */}
            <ellipse cx={294} cy={386} rx={232} ry={148} fill="rgba(0,0,0,0.45)" />
            <ellipse
              cx={294}
              cy={376}
              rx={226}
              ry={142}
              fill="#EAE2D2"
              stroke="#B8AE9B"
              strokeWidth={4}
            />
            <ellipse
              cx={294}
              cy={376}
              rx={186}
              ry={112}
              fill="#DFD5C2"
              stroke="rgba(90, 76, 56, 0.28)"
              strokeWidth={1.6}
            />

            {/* Garnish: Fresh Banana Leaf & Calamansi Lime Half */}
            <ellipse cx={275} cy={382} rx={152} ry={78} transform="rotate(-8, 275, 382)" fill="#4D6B43" />
            <circle cx={418} cy={432} r={24} fill="#8FA84E" stroke="#4D6326" strokeWidth={2} />
            <circle cx={418} cy={432} r={18} fill="#D8C85C" />

            {/* Illustrated Whole Freshwater Gurame / Lele With Characteristic Barbels */}
            <g transform="translate(286, 374) rotate(-9)">
              {/* Caudal Fan Tail */}
              <path
                d="M -138,4 L -192,-38 C -182,-8 -182,16 -188,42 Z"
                fill="#4D2E19"
                stroke="#29170B"
                strokeWidth={1.6}
              />
              {/* Dorsal & Ventral Fins */}
              <path d="M -68,-40 Q 0,-66 64,-34 Z" fill="#633C21" />
              <path d="M -52,38 Q 8,58 56,34 Z" fill="#52311A" />
              {/* Roasted Whole Fish Body */}
              <path
                d="M -146,4 C -96,-52 38,-56 138,-14 C 164,-2 164,14 138,24 C 38,56 -96,48 -146,4 Z"
                fill="url(#s8-fish-glaze)"
                stroke="#2B180B"
                strokeWidth={2}
              />
              {/* Diagonal Grill Score Marks */}
              {[-62, -22, 18, 58].map((gx, gi) => (
                <line
                  key={gi}
                  x1={gx}
                  y1={-28}
                  x2={gx - 18}
                  y2={28}
                  stroke="rgba(32, 16, 6, 0.65)"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              ))}
              <circle cx={116} cy={-4} r={5.5} fill="#EAE2D2" />
              <circle cx={117} cy={-4} r={2.8} fill="#1A120B" />
              {/* Characteristic Lele / Freshwater Whisker Barbels */}
              <path
                d="M 152,2 C 178,-12 198,-8 210,6 M 150,10 C 176,22 196,26 212,18"
                fill="none"
                stroke="#3B2212"
                strokeWidth={2.4}
                strokeLinecap="round"
              />
            </g>

            {/* Rising Muddy-Flavor Geosmin Vapor Wisps */}
            {[-55, 0, 55].map((vx, vi) => {
              const shift = Math.sin(localSec * 2 + vi) * 8;
              return (
                <path
                  key={vi}
                  d={`M ${294 + vx},258 C ${282 + vx + shift},215 ${308 + vx - shift},178 ${294 + vx},138`}
                  fill="none"
                  stroke="rgba(182, 132, 88, 0.55)"
                  strokeWidth={2.6}
                  strokeLinecap="round"
                />
              );
            })}

            <text
              x={294}
              y={628}
              textAnchor="middle"
              fill={IDENTITY.ivoryText}
              fontFamily={IDENTITY.fontEditorial}
              fontSize={36}
              fontWeight={700}
              letterSpacing="0.04em"
            >
              IKAN LELE & GURAME
            </text>
            <text
              x={294}
              y={668}
              textAnchor="middle"
              fill={IDENTITY.lateriteClay}
              fontFamily={IDENTITY.fontMono}
              fontSize={17}
              fontWeight={700}
              letterSpacing="0.12em"
            >
              SENSASI "BAU TANAH / LUMPUR"
            </text>
            <text
              x={294}
              y={704}
              textAnchor="middle"
              fill={IDENTITY.stoneText}
              fontFamily={IDENTITY.fontMono}
              fontSize={14}
              letterSpacing="0.08em"
            >
              RESEPTOR RASA MENOLAK GEOSMIN DI AIR
            </text>
          </g>

          {/* ============================================================== */}
          {/* RIGHT PANEL: OPEN WOODEN WINDOW & TROPICAL EVENING DRIZZLE     */}
          {/* ============================================================== */}
          <g transform="translate(748, 468)">
            <rect
              x={0}
              y={0}
              width={588}
              height={768}
              fill="rgba(16, 22, 20, 0.92)"
              stroke="rgba(122, 158, 115, 0.48)"
              strokeWidth={2}
            />
            <rect x={36} y={34} width={228} height={38} fill={IDENTITY.mossDeep} />
            <text
              x={150}
              y={59}
              textAnchor="middle"
              fill={IDENTITY.ivoryText}
              fontFamily={IDENTITY.fontMono}
              fontSize={16}
              fontWeight={700}
              letterSpacing="0.14em"
            >
              DI HIDUNG: DIPUJA
            </text>
          </g>

          {/* Tropical Rain View Through Open Teak Casement Window */}
          <g clipPath="url(#s8-window-glass)">
            <rect x={806} y={564} width={452} height={412} fill="#142324" />
            {/* Lush Wet Tropical Foliage Outside Window */}
            <path
              d="M 806,976 C 835,882 895,846 968,876 C 995,818 1075,808 1132,864 C 1178,832 1234,858 1258,912 L 1258,976 Z"
              fill="#2A4637"
            />
            <path
              d="M 835,976 Q 892,895 954,918 Q 1036,862 1118,915 Q 1185,884 1248,976 Z"
              fill="#3F664D"
            />
            {/* Falling Silver Evening Drizzle Outside */}
            {Array.from({ length: 22 }).map((_, ri) => {
              const u = (localSec * 0.88 + ri * 0.09) % 1;
              const rx = 825 + (ri * 47) % 420;
              const ry = 568 + u * 360;
              return (
                <line
                  key={ri}
                  x1={rx}
                  y1={ry}
                  x2={rx - 8}
                  y2={ry + 38}
                  stroke={IDENTITY.rainMist}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  opacity={0.46}
                />
              );
            })}
            {/* Fragrant Petrichor Breeze Entering Through Open Window */}
            {[
              'M 1185,845 C 1095,795 995,855 865,785',
              'M 1205,785 C 1105,735 1005,795 875,725',
            ].map((bd, bi) => (
              <TrimPath
                key={bi}
                d={bd}
                progress={clamp01(localSec / 2.2)}
                stroke={bi === 0 ? IDENTITY.amberLight : IDENTITY.mossLight}
                strokeWidth={2.8}
                strokeDasharray="10 8"
              />
            ))}
          </g>

          {/* Handcrafted Wooden Window Frame & Louvered Shutters */}
          <rect
            x={806}
            y={564}
            width={452}
            height={412}
            fill="none"
            stroke="#7B5434"
            strokeWidth={14}
          />
          <line x1={1032} y1={564} x2={1032} y2={976} stroke="#634227" strokeWidth={8} />
          <line x1={784} y1={982} x2={1280} y2={982} stroke="#966A45" strokeWidth={12} />

          <text
            x={1042}
            y={1096}
            textAnchor="middle"
            fill={IDENTITY.ivoryText}
            fontFamily={IDENTITY.fontEditorial}
            fontSize={36}
            fontWeight={700}
            letterSpacing="0.04em"
          >
            GERIMIS SORE HARI
          </text>
          <text
            x={1042}
            y={1136}
            textAnchor="middle"
            fill={IDENTITY.mossLight}
            fontFamily={IDENTITY.fontMono}
            fontSize={17}
            fontWeight={700}
            letterSpacing="0.12em"
          >
            AROMA SEGAR & MENENANGKAN
          </text>
          <text
            x={1042}
            y={1172}
            textAnchor="middle"
            fill={IDENTITY.stoneText}
            fontFamily={IDENTITY.fontMono}
            fontSize={14}
            letterSpacing="0.08em"
          >
            HIDUNG MEMUJA GEOSMIN DI UDARA
          </text>

          {/* ============================================================== */}
          {/* CENTER BRIDGING MEDALLION: IDENTICAL GEOSMIN C12H22O MOLECULE  */}
          {/* ============================================================== */}
          <GeosminBrassMedallion
            cx={720}
            cy={848}
            radius={92}
            rotationDeg={Math.sin(localSec * 0.9) * 4}
          />
        </g>
      </svg>

      {/* Interactive Naysi Closing Comment Pill Bar */}
      {ctaProg > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 132,
            right: 132,
            top: 1445,
            height: 118,
            borderRadius: 59,
            backgroundColor: 'rgba(18, 21, 19, 0.94)',
            border: '1.8px solid rgba(216, 161, 72, 0.44)',
            boxShadow: '0 22px 46px rgba(0, 0, 0, 0.6)',
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
              background: `linear-gradient(135deg, ${IDENTITY.mossSage} 0%, ${IDENTITY.mossDeep} 100%)`,
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
              fontSize: 28,
              fontWeight: 600,
              color: IDENTITY.ivoryText,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {sampleComment.slice(0, typedLen)}
            <span
              style={{
                display: 'inline-block',
                width: 3,
                height: 30,
                backgroundColor: IDENTITY.amberSpore,
                marginLeft: 4,
                verticalAlign: 'middle',
                opacity: cursorOn ? 1 : 0,
              }}
            />
          </div>

          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: '50%',
              backgroundColor: 'rgba(242, 239, 232, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width={28} height={28} viewBox="0 0 24 24">
              <path d="M 3,20 L 21,12 L 3,4 L 3,10 L 15,12 L 3,14 Z" fill={IDENTITY.ivoryText} />
            </svg>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
