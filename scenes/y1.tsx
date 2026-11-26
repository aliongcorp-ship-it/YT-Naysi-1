import React from 'react';
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
  easeOutExpo,
  prog,
  smoothstep,
} from './script';
import {
  AmberSporeCluster,
  DocumentaryHeader,
  HerbariumSpecimenCard,
  MatteCanvasGround,
  TrimPath,
  useProceduralSurface,
} from './hujan';

// ============================================================================
// ANATOMICAL 2D NATURALIST ILLUSTRATION: COLLEMBOLA (SPRINGTAIL / KUTU PEGAS)
// ============================================================================

const IllustratedSpringtail: React.FC<{
  cx: number;
  cy: number;
  scale?: number;
  facingLeft?: boolean;
  antennaSweepDeg?: number;
  legCycle?: number;
  furculaSnap?: number; // 0 = tucked under abdomen, 1 = snapped downward/backward
  showGutSpores?: number; // 0..1 X-ray gut & bristle spores
  sporeUrl: string;
}> = ({
  cx,
  cy,
  scale = 1,
  facingLeft = true,
  antennaSweepDeg = 0,
  legCycle = 0,
  furculaSnap = 0,
  showGutSpores = 0,
  sporeUrl,
}) => {
  const dir = facingLeft ? -1 : 1;
  const snapAngle = interpolate(clamp01(furculaSnap), [0, 1], [6, -128]);

  return (
    <g transform={`translate(${cx}, ${cy}) scale(${dir * scale}, ${scale})`}>
      <defs>
        <linearGradient id="collembola-chitin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EAE2CE" />
          <stop offset="55%" stopColor="#C8B998" />
          <stop offset="100%" stopColor="#857659" />
        </linearGradient>
      </defs>

      {/* Ventral Forked Furcula (Biomechanical Catapult Lever) */}
      <g transform={`translate(-78, 28) rotate(${snapAngle})`}>
        {/* Manubrium base + Dens + Mucro tip */}
        <path
          d="M 0,0 L 68,18 L 122,26"
          fill="none"
          stroke="#D8CBB0"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 68,18 L 116,38"
          fill="none"
          stroke="#BBAE92"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <circle cx={0} cy={0} r={7} fill={IDENTITY.amberSpore} />
      </g>

      {/* 3 Pairs of Articulated Walking Legs */}
      {[
        { x: 32, phase: 0 },
        { x: -2, phase: 2.1 },
        { x: -38, phase: 4.2 },
      ].map((lg, li) => {
        const swing = Math.sin(legCycle + lg.phase) * 9;
        return (
          <g key={li} transform={`translate(${lg.x}, 24)`}>
            <path
              d={`M 0,0 L ${8 + swing * 0.5},28 L ${2 + swing},58`}
              fill="none"
              stroke="#B8A98B"
              strokeWidth={5.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M -6,2 L ${-2 - swing * 0.4},26 L ${-10 - swing * 0.8},54`}
              fill="none"
              stroke="#8A7C61"
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* Multi-Segmented Chitin Abdomen & Thorax (6 Abdominal + 2 Thoracic Tergites) */}
      {[
        { x: -104, y: 6, rx: 22, ry: 18, rot: -10 },
        { x: -80, y: 0, rx: 28, ry: 25, rot: -6 },
        { x: -48, y: -4, rx: 34, ry: 31, rot: -2 },
        { x: -12, y: -5, rx: 32, ry: 30, rot: 2 },
        { x: 22, y: -2, rx: 28, ry: 27, rot: 5 },
        { x: 52, y: 2, rx: 24, ry: 23, rot: 8 },
      ].map((seg, si) => (
        <ellipse
          key={si}
          cx={seg.x}
          cy={seg.y}
          rx={seg.rx}
          ry={seg.ry}
          transform={`rotate(${seg.rot}, ${seg.x}, ${seg.y})`}
          fill="url(#collembola-chitin)"
          stroke="rgba(52, 42, 28, 0.65)"
          strokeWidth={1.8}
        />
      ))}

      {/* Fine Sensory Dorsal Setae (Bristles that Trap Spores) */}
      {[-92, -68, -42, -14, 14, 42].map((bx, bi) => (
        <line
          key={bi}
          x1={bx}
          y1={-28 + Math.abs(bx) * 0.08}
          x2={bx - 8}
          y2={-46 + Math.abs(bx) * 0.08}
          stroke="rgba(242, 236, 220, 0.62)"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      ))}

      {/* Head Capsule & Dark 8-Ocelli Eye Patch */}
      <g transform="translate(84, 8)">
        <ellipse
          cx={0}
          cy={0}
          rx={28}
          ry={23}
          transform="rotate(14)"
          fill="url(#collembola-chitin)"
          stroke="rgba(52, 42, 28, 0.7)"
          strokeWidth={1.8}
        />
        {/* 8-Ocelli Compound Eye Patch */}
        <ellipse cx={8} cy={-6} rx={7.5} ry={5.5} fill="#1E1A14" />
        <circle cx={6} cy={-8} r={1.6} fill="#F2EFE8" />
        <circle cx={10} cy={-5} r={1.4} fill="#F2EFE8" />

        {/* 4-Segment Olfactory Antennae Actively Sweeping for Geosmin */}
        <g transform={`translate(20, -10) rotate(${antennaSweepDeg})`}>
          <path
            d="M 0,0 L 24,-14 L 52,-22 L 82,-18 L 106,-8"
            fill="none"
            stroke="#E5D9BF"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sensory Receptor Tip Highlight */}
          <circle cx={106} cy={-8} r={5.5} fill={IDENTITY.amberSpore} stroke="#FAF0CA" strokeWidth={1.4} />
        </g>
        <g transform={`translate(18, -4) rotate(${-antennaSweepDeg * 0.75 + 12})`}>
          <path
            d="M 0,0 L 22,-6 L 48,-8 L 76,-2 L 98,8"
            fill="none"
            stroke="#BFB296"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={98} cy={8} r={4.5} fill={IDENTITY.amberLight} />
        </g>
      </g>

      {/* X-Ray Translucent Midgut Window & Clinging Dorsal Spores (Scene 06) */}
      {showGutSpores > 0.02 && (
        <g opacity={clamp01(showGutSpores)}>
          <path
            d="M -76,0 C -42,-12 8,-12 42,2 C 12,14 -42,14 -76,0 Z"
            fill="rgba(34, 24, 12, 0.76)"
            stroke={IDENTITY.amberLight}
            strokeWidth={1.8}
          />
          {[-56, -34, -12, 10, 28].map((gx, gi) => (
            <AmberSporeCluster
              key={gi}
              cx={gx}
              cy={gi % 2 === 0 ? -2 : 2}
              size={6.2}
              sporeUrl={sporeUrl}
              rotation={gi * 35}
            />
          ))}
          {/* Spores Stuck to Exterior Bristles & Legs */}
          {[
            [-88, -36],
            [-58, -42],
            [-24, -44],
            [8, -40],
            [36, -34],
            [-36, 52],
            [4, 56],
          ].map(([sx, sy], si) => (
            <AmberSporeCluster
              key={si}
              cx={sx}
              cy={sy}
              size={5.8}
              sporeUrl={sporeUrl}
              rotation={si * 48}
            />
          ))}
        </g>
      )}
    </g>
  );
};

// ============================================================================
// SCENE 05 — UMPAN 450 JUTA TAHUN: KUTU PEGAS TANAH (59.490s – 74.010s)
// ============================================================================

export const Scene05UmpanKutuPegas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[4];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const humusUrl = useProceduralSurface('humus-micro');
  const sporeUrl = useProceduralSurface('spore-amber');

  const walkApproach = easeInOutCubic(prog(localSec, 0.6, 6.2));
  const scentWave = easeOutCubic(prog(localSec, 0.25, 3.4));
  const cardEnter = prog(globalSec, 63.0, 63.9);
  const stampProg = prog(globalSec, 65.4, 65.95);

  const bugX = interpolate(walkApproach, [0, 1], [1035, 815]);
  const antennaSweep = Math.sin(localSec * 5.2) * 11;

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="monsoon-slate"
        surfaceOpacity={0.26}
        warmLampX={50}
        warmLampY={42}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure="2020"
        unit="TEMUAN RISET"
        subtitle="UMPAN RATUSAN JUTA TAHUN · MEMANCING KUTU PEGAS BERANTENA GEOSMIN"
        localSec={localSec}
        accentColor={IDENTITY.mossLight}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="s5-terrarium">
            <rect x={112} y={448} width={1216} height={638} />
          </clipPath>
          <linearGradient id="s5-needle-steel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0F3F2" />
            <stop offset="50%" stopColor="#9DA8AA" />
            <stop offset="100%" stopColor="#4F585A" />
          </linearGradient>
        </defs>

        {/* ================================================================ */}
        {/* ENTOMOLOGICAL TERRARIUM PLATE (112..1328, 448..1086)             */}
        {/* ================================================================ */}
        <g clipPath="url(#s5-terrarium)">
          <rect x={112} y={448} width={1216} height={638} fill="#101410" />

          {/* Scale Reference Top-Right: Sewing Needle Tip vs 1,5 mm Springtail */}
          <g transform="translate(748, 488)" opacity={easeOutCubic(prog(localSec, 1.2, 2.2))}>
            <polygon
              points="520,-10 195,6 520,22"
              fill="url(#s5-needle-steel)"
              stroke="rgba(242,246,246,0.45)"
              strokeWidth={1.2}
            />
            <ellipse cx={465} cy={6} rx={26} ry={5} fill="#101410" />
            {/* 1.5 mm Caliper Bracket Matching Needle Point */}
            <line x1={145} y1={36} x2={245} y2={36} stroke={IDENTITY.amberLight} strokeWidth={1.8} />
            <line x1={145} y1={28} x2={145} y2={44} stroke={IDENTITY.amberLight} strokeWidth={1.8} />
            <line x1={245} y1={28} x2={245} y2={44} stroke={IDENTITY.amberLight} strokeWidth={1.8} />
            <text
              x={548}
              y={60}
              textAnchor="end"
              fill={IDENTITY.stoneText}
              fontFamily={IDENTITY.fontMono}
              fontSize={15}
              fontWeight={600}
              letterSpacing="0.11em"
            >
              SKALA ASLI: PANJANG ± 1,5 MM (SEUKURAN UJUNG JARUM)
            </text>
          </g>

          {/* Forest Humus Soil Floor */}
          <path
            d="M 112,928 Q 410,898 720,926 T 1328,914 L 1328,1086 L 112,1086 Z"
            fill="#241B13"
          />
          {humusUrl && (
            <image
              href={humusUrl}
              x={112}
              y={898}
              width={1216}
              height={190}
              preserveAspectRatio="none"
              opacity={0.78}
            />
          )}

          {/* Left Fruiting Streptomyces Colony Releasing Geosmin Bait */}
          <g transform="translate(288, 916)">
            <ellipse cx={0} cy={6} rx={94} ry={22} fill="#3A2B1B" stroke={IDENTITY.amberSpore} strokeWidth={1.6} />
            {[-54, -26, 0, 28, 56].map((hx, hi) => (
              <g key={hi}>
                <path
                  d={`M ${hx},0 C ${hx - 8},-34 ${hx + 10},-68 ${hx},-96`}
                  fill="none"
                  stroke="#DCE3CA"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                />
                <AmberSporeCluster
                  cx={hx}
                  cy={-102}
                  size={9}
                  sporeUrl={sporeUrl}
                  rotation={hi * 32}
                />
                <AmberSporeCluster
                  cx={hx + 6}
                  cy={-84}
                  size={7.5}
                  sporeUrl={sporeUrl}
                  rotation={hi * 19}
                />
              </g>
            ))}
            <text
              x={0}
              y={56}
              textAnchor="middle"
              fill={IDENTITY.amberLight}
              fontFamily={IDENTITY.fontMono}
              fontSize={16}
              fontWeight={700}
              letterSpacing="0.12em"
            >
              KOLONI STREPTOMYCES
            </text>
          </g>

          {/* Drifting Geosmin Bait Plume Locking Onto Springtail Antennae */}
          {[
            `M 365,818 C 485,772 585,848 ${bugX - 185},818`,
            `M 365,846 C 495,812 595,884 ${bugX - 178},836`,
            `M 358,792 C 475,738 575,808 ${bugX - 190},802`,
          ].map((pd, pi) => (
            <TrimPath
              key={pi}
              d={pd}
              progress={scentWave}
              stroke={pi === 1 ? IDENTITY.mossLight : IDENTITY.amberLight}
              strokeWidth={2.8}
              strokeDasharray="10 8"
              opacity={0.78}
            />
          ))}

          {/* Concentric Antenna Detection Rings Around Antenna Tip */}
          {[0, 0.5].map((off, ri) => {
            const u = (localSec * 0.9 + off) % 1;
            return (
              <circle
                key={ri}
                cx={bugX - 196}
                cy={816}
                r={12 + u * 48}
                fill="none"
                stroke={IDENTITY.amberLight}
                strokeWidth={2 * (1 - u)}
                opacity={scentWave * (1 - u) * 0.8}
              />
            );
          })}

          {/* Approaching Anatomical Springtail (Collembola) */}
          <IllustratedSpringtail
            cx={bugX}
            cy={844}
            scale={1.08}
            facingLeft
            antennaSweepDeg={antennaSweep}
            legCycle={localSec * 9.5}
            furculaSnap={0}
            showGutSpores={0}
            sporeUrl={sporeUrl}
          />

          {/* Leader Callout Pointing to Geosmin-Sensing Antenna */}
          <g opacity={easeOutCubic(prog(globalSec, 68.5, 69.6))}>
            <line
              x1={bugX - 192}
              y1={794}
              x2={bugX - 245}
              y2={648}
              stroke={IDENTITY.mossLight}
              strokeWidth={1.8}
            />
            <rect
              x={bugX - 465}
              y={584}
              width={365}
              height={64}
              fill="rgba(16, 22, 17, 0.92)"
              stroke={IDENTITY.mossLight}
              strokeWidth={1.5}
            />
            <text
              x={bugX - 282}
              y={623}
              textAnchor="middle"
              fill={IDENTITY.ivoryText}
              fontFamily={IDENTITY.fontMono}
              fontSize={16}
              fontWeight={700}
              letterSpacing="0.12em"
            >
              ANTENA PELACAK GEOSMIN
            </text>
          </g>
        </g>

        <rect
          x={112}
          y={448}
          width={1216}
          height={638}
          fill="none"
          stroke="rgba(168, 196, 160, 0.32)"
          strokeWidth={2}
        />
      </svg>

      {/* Herbarium Research Dossier Card (Becher et al., Nature Microbiology 2020) */}
      <HerbariumSpecimenCard
        x={126}
        y={1148}
        width={1188}
        rotationDeg={1.1}
        headerLeft="EKOLOGI TANAH · NATURE MICROBIOLOGY"
        headerRight="BECHER ET AL. · 2020"
        enterProgress={cardEnter}
        stampText="UMPAN KUTU PEGAS"
        stampColor={IDENTITY.mossDeep}
        stampProgress={stampProg}
        footerCode="UNIV. LUND & JOHN INNES CENTRE"
        rows={[
          { label: 'TARGET AROMA', value: 'KUTU PEGAS (COLLEMBOLA · 1,5 MM)' },
          { label: 'USIA KEMITRAAN', value: '± 450 JUTA TAHUN EVOLUSI' },
          { label: 'SENSOR SERANGGA', value: 'RESEPTOR KHUSUS DI UJUNG ANTENA' },
          { label: 'TUJUAN BAKTERI', value: 'MEMANCING PEMAKAN SPORA', highlight: true },
        ]}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 06 — KUDA TROYA SPORA & LONTARAN EKOR PEGAS (74.010s – 89.120s)
// ============================================================================

export const Scene06KurirSpora: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = CHAPTERS[5];
  const localSec = frame / fps;
  const globalSec = ch.start + localSec;

  const humusUrl = useProceduralSurface('humus-micro');
  const lateriteUrl = useProceduralSurface('cracked-laterite');
  const sporeUrl = useProceduralSurface('spore-amber');

  // Narrator says "sehingga saat kutu pegas melenting jauh ke tanah lembap baru..." at 83.08s
  const actSwitch = easeInOutCubic(prog(globalSec, 82.25, 83.25));
  const gutReveal = easeOutCubic(prog(globalSec, 77.6, 79.4));

  // Biomechanical jump arc in Act 2 (83.2s -> 85.6s)
  const jumpProg = easeInOutCubic(prog(globalSec, 83.25, 85.45));
  const sproutProg = easeOutExpo(prog(globalSec, 85.35, 87.6));

  const isJumpAct = globalSec >= 82.8;

  // Parabolic jump coordinates in Act 2
  const jumpX = interpolate(jumpProg, [0, 1], [310, 1085]);
  const jumpY = 1095 - Math.sin(jumpProg * Math.PI) * 445;
  const jumpRot = interpolate(jumpProg, [0, 0.5, 1], [-18, 8, 12]);
  const furculaSnap = clamp01(prog(globalSec, 83.1, 83.55) * (1 - prog(globalSec, 85.1, 85.5)));

  return (
    <AbsoluteFill>
      <MatteCanvasGround
        topColor={ch.groundTop}
        bottomColor={ch.groundBottom}
        surfaceKind="monsoon-slate"
        surfaceOpacity={0.26}
        warmLampX={52}
        warmLampY={45}
      />

      <DocumentaryHeader
        eyebrow={ch.eyebrow}
        figure={isJumpAct ? 'KURIR' : '100%'}
        unit={isJumpAct ? 'EKOR PEGAS' : 'SPORA UTUH'}
        subtitle={
          isJumpAct
            ? 'MELENTING JAUH KE TANAH LEMBAP · MENANAM KOLONI BARU'
            : 'DILAHAP BULAT-BULAT · CANGKANG SPORA KEBAL DICERNA PERUT'
        }
        localSec={localSec}
        accentColor={IDENTITY.amberSpore}
      />

      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        {/* ================================================================ */}
        {/* ACT 1: TROJAN-HORSE X-RAY GUT & CUTICLE SPORE ARMOR              */}
        {/* ================================================================ */}
        {actSwitch < 0.99 && (
          <g opacity={1 - actSwitch}>
            <rect
              x={112}
              y={455}
              width={1216}
              height={880}
              fill="rgba(16, 18, 14, 0.9)"
              stroke="rgba(216, 161, 72, 0.32)"
              strokeWidth={2}
            />

            {/* Soil Floor Inside Closeup */}
            <rect x={112} y={1145} width={1216} height={190} fill="#261D14" />
            {humusUrl && (
              <image
                href={humusUrl}
                x={112}
                y={1145}
                width={1216}
                height={190}
                preserveAspectRatio="none"
                opacity={0.72}
              />
            )}

            {/* nibbled Streptomyces stalks on left */}
            <g transform="translate(335, 1145)">
              {[-36, 0, 36].map((sx, si) => (
                <g key={si}>
                  <path
                    d={`M ${sx},0 C ${sx - 6},-45 ${sx + 8},-85 ${sx},-125`}
                    fill="none"
                    stroke="#D8DFC6"
                    strokeWidth={6}
                    strokeLinecap="round"
                  />
                  <AmberSporeCluster cx={sx} cy={-132} size={12} sporeUrl={sporeUrl} />
                </g>
              ))}
            </g>

            {/* Magnified Grazing Springtail With X-Ray Digestive Chamber */}
            <IllustratedSpringtail
              cx={775}
              cy={1015}
              scale={2.05}
              facingLeft
              antennaSweepDeg={Math.sin(localSec * 6) * 8 - 14}
              legCycle={localSec * 4}
              furculaSnap={0}
              showGutSpores={gutReveal}
              sporeUrl={sporeUrl}
            />

            {/* Two Anatomical CalloutPlaques Inside Closeup */}
            <g opacity={gutReveal}>
              {/* Callout 1: Exterior Cuticle Bristles */}
              <line x1={740} y1={925} x2={655} y2={628} stroke={IDENTITY.amberLight} strokeWidth={2} />
              <rect x={215} y={548} width={455} height={92} fill="rgba(20, 23, 18, 0.94)" stroke={IDENTITY.amberLight} strokeWidth={1.6} />
              <text x={242} y={584} fill={IDENTITY.amberLight} fontFamily={IDENTITY.fontMono} fontSize={15} fontWeight={700} letterSpacing="0.12em">
                JALUR 1 · EKSTERIOR TUBUH
              </text>
              <text x={242} y={620} fill={IDENTITY.ivoryText} fontFamily={IDENTITY.fontEditorial} fontSize={27} fontWeight={700}>
                SPORA MENEMPEL DI BULU KUTIKULA
              </text>

              {/* Callout 2: Acid-Proof Spores Inside Gut */}
              <line x1={815} y1={1015} x2={925} y2={748} stroke={IDENTITY.mossLight} strokeWidth={2} />
              <rect x={785} y={668} width={495} height={92} fill="rgba(20, 23, 18, 0.94)" stroke={IDENTITY.mossLight} strokeWidth={1.6} />
              <text x={812} y={704} fill={IDENTITY.mossLight} fontFamily={IDENTITY.fontMono} fontSize={15} fontWeight={700} letterSpacing="0.12em">
                JALUR 2 · SALURAN PENCERNAAN
              </text>
              <text x={812} y={740} fill={IDENTITY.ivoryText} fontFamily={IDENTITY.fontEditorial} fontSize={27} fontWeight={700}>
                CANGKANG SPORA KEBAL ENZIM PERUT
              </text>
            </g>
          </g>
        )}

        {/* ================================================================ */}
        {/* ACT 2: FURCULA CATAPULT LEAP TO DAMP FERTILE SOIL                */}
        {/* ================================================================ */}
        {actSwitch > 0.01 && (
          <g opacity={actSwitch}>
            <rect
              x={112}
              y={455}
              width={1216}
              height={880}
              fill="rgba(14, 18, 16, 0.92)"
              stroke="rgba(168, 196, 160, 0.34)"
              strokeWidth={2}
            />

            {/* Left Dry Depleted Soil Mound */}
            <path d="M 112,1155 Q 295,1120 485,1185 L 485,1335 L 112,1335 Z" fill="#4E2D1E" />
            {lateriteUrl && (
              <image
                href={lateriteUrl}
                x={112}
                y={1135}
                width={373}
                height={200}
                preserveAspectRatio="none"
                opacity={0.55}
              />
            )}
            <text
              x={288}
              y={1285}
              textAnchor="middle"
              fill={IDENTITY.stoneText}
              fontFamily={IDENTITY.fontMono}
              fontSize={16}
              fontWeight={700}
              letterSpacing="0.12em"
            >
              TANAH LAMA (KERING)
            </text>

            {/* Right Damp Nutrient-Rich Soil Mound */}
            <path d="M 885,1185 Q 1095,1115 1328,1148 L 1328,1335 L 885,1335 Z" fill="#212B1E" />
            {humusUrl && (
              <image
                href={humusUrl}
                x={885}
                y={1125}
                width={443}
                height={210}
                preserveAspectRatio="none"
                opacity={0.78}
              />
            )}
            <text
              x={1112}
              y={1285}
              textAnchor="middle"
              fill={IDENTITY.mossLight}
              fontFamily={IDENTITY.fontMono}
              fontSize={16}
              fontWeight={700}
              letterSpacing="0.12em"
            >
              TANAH LEMBAP BARU
            </text>

            {/* Parabolic Catapult Trajectory Arc */}
            <TrimPath
              d="M 310,1115 Q 698,215 1085,1115"
              progress={jumpProg}
              stroke={IDENTITY.amberLight}
              strokeWidth={3.2}
              strokeDasharray="12 9"
            />

            {/* Dropped Golden Spores Along Flight Path */}
            {[0.2, 0.38, 0.55, 0.72, 0.88].map((u, idx) => {
              if (jumpProg < u) return null;
              const sx = interpolate(u, [0, 1], [310, 1085]);
              const sy = 1095 - Math.sin(u * Math.PI) * 445 + (jumpProg - u) * 180;
              return (
                <AmberSporeCluster
                  key={idx}
                  cx={sx}
                  cy={Math.min(1145, sy)}
                  size={7.5}
                  sporeUrl={sporeUrl}
                  rotation={idx * 45}
                />
              );
            })}

            {/* Catapulting Springtail Mid-Flight */}
            <g transform={`rotate(${jumpRot}, ${jumpX}, ${jumpY})`}>
              <IllustratedSpringtail
                cx={jumpX}
                cy={jumpY}
                scale={0.96}
                facingLeft={false}
                antennaSweepDeg={12}
                legCycle={localSec * 14}
                furculaSnap={furculaSnap}
                showGutSpores={0.9}
                sporeUrl={sporeUrl}
              />
            </g>

            {/* Fresh Sprouting Streptomyces Colony on New Damp Soil */}
            {sproutProg > 0.02 && (
              <g transform="translate(1165, 1138)" opacity={sproutProg}>
                {[-32, 0, 32].map((nx, ni) => (
                  <g key={ni}>
                    <TrimPath
                      d={`M ${nx},0 C ${nx - 5},-38 ${nx + 7},-72 ${nx},-108`}
                      progress={sproutProg}
                      stroke={IDENTITY.mossLight}
                      strokeWidth={4.5}
                    />
                    <AmberSporeCluster cx={nx} cy={-112 * sproutProg} size={8.5} sporeUrl={sporeUrl} />
                  </g>
                ))}
                <text
                  x={0}
                  y={-136}
                  textAnchor="middle"
                  fill={IDENTITY.amberLight}
                  fontFamily={IDENTITY.fontMono}
                  fontSize={16}
                  fontWeight={700}
                  letterSpacing="0.14em"
                >
                  KOLONI BARU TUMBUH!
                </text>
              </g>
            )}
          </g>
        )}

        {/* Bottom Symbiosis Summary Plaque */}
        <g transform="translate(112, 1392)">
          <rect
            x={0}
            y={0}
            width={1216}
            height={196}
            fill="rgba(18, 20, 16, 0.94)"
            stroke="rgba(216, 161, 72, 0.36)"
            strokeWidth={1.8}
          />
          <text
            x={46}
            y={56}
            fill={IDENTITY.amberLight}
            fontFamily={IDENTITY.fontMono}
            fontSize={17}
            fontWeight={700}
            letterSpacing="0.16em"
          >
            STRATEGI KUDA TROYA MIKROSKOPIS
          </text>
          <text
            x={46}
            y={114}
            fill={IDENTITY.ivoryText}
            fontFamily={IDENTITY.fontEditorial}
            fontSize={39}
            fontWeight={700}
            letterSpacing="0.04em"
          >
            KORBANKAN SEBAGIAN KOLONI → SEBARKAN SPORA JAUH
          </text>
          <text
            x={46}
            y={156}
            fill={IDENTITY.stoneText}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            letterSpacing="0.1em"
          >
            EKOR PEGAS (FURCULA) MELONTARKAN SERANGGA PULUHAN KALI TINGGI TUBUHNYA
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
