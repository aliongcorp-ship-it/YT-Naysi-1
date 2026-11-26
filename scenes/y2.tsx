import React from 'react';
import {interpolate} from 'remotion';
import {
  AnodizedCard,
  CartographicBackdrop,
  DiamondNetworkStage,
  SceneRenderProps,
  StageContainer,
} from './braess';
import {
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  easeOutQuart,
  rangeProgress,
} from './script';

const DraftingWoodBackdrop: React.FC<{readonly sec: number}> = ({sec}) => {
  const dustShift = sec * 8;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 50% 38%, #473222 0%, ${IDENTITY.deskWoodWarm} 42%, ${IDENTITY.deskWoodDark} 88%, #0E0A07 100%)`,
      }}
    >
      <svg
        width={1440}
        height={2560}
        viewBox="0 0 1440 2560"
        style={{position: 'absolute', inset: 0}}
      >
        {/* Vertical Teak Wood Plank Seams & Subtle Grain */}
        {Array.from({length: 9}).map((_, idx) => {
          const x = 90 + idx * 165;
          return (
            <g key={`plank-${idx}`}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={2560}
                stroke="rgba(0, 0, 0, 0.34)"
                strokeWidth={2.5}
              />
              <line
                x1={x + 2}
                y1={0}
                x2={x + 2}
                y2={2560}
                stroke="rgba(255, 224, 185, 0.045)"
                strokeWidth={1.2}
              />
              <path
                d={`M ${x + 54} 0 Q ${x + 74} 820 ${x + 48} 1680 T ${x + 62} 2560`}
                fill="none"
                stroke="rgba(255, 214, 170, 0.03)"
                strokeWidth={2}
              />
            </g>
          );
        })}

        {/* Floating Warm Dust Motes */}
        {Array.from({length: 16}).map((_, i) => {
          const cx = (i * 193 + 80) % 1360;
          const cy = ((i * 271 + dustShift * (0.7 + (i % 3) * 0.3)) % 1850) + 120;
          return (
            <circle
              key={`mote-${i}`}
              cx={cx}
              cy={cy}
              r={1.8 + (i % 3) * 0.9}
              fill="rgba(255, 236, 200, 0.16)"
            />
          );
        })}
      </svg>
    </div>
  );
};

/* ==========================================================================
   CHAPTER 07 — SEOUL 2003 (61.07s -> 74.65s)
   ========================================================================== */
export const Scene07Seoul2003: React.FC<SceneRenderProps> = ({
  sec,
  localSec,
}) => {
  const ch = CHAPTERS[6];
  const sent2Start = ch.sentences[1].start;

  const yearAppear = easeOutQuart(rangeProgress(localSec, 0.05, 0.85));
  const dossierSlide = easeOutBack(rangeProgress(localSec, 0.25, 1.1), 1.1);
  const polaroidDrop = easeOutBack(rangeProgress(localSec, 1.25, 2.15), 1.25);

  const row1P = clamp01(rangeProgress(localSec, 1.1, 1.8));
  const row2P = clamp01(rangeProgress(localSec, 2.2, 3.0));
  const row3P = clamp01(rangeProgress(localSec, 3.6, 4.6));
  const row4P = clamp01(rangeProgress(localSec, 5.2, 6.1));

  const chartPhase = easeInOutCubic(
    rangeProgress(sec, sent2Start - 0.2, sent2Start + 0.85),
  );
  const tracePred = easeOutCubic(
    rangeProgress(sec, sent2Start + 0.25, sent2Start + 2.1),
  );
  const traceReal = easeOutCubic(
    rangeProgress(sec, sent2Start + 1.1, sent2Start + 3.4),
  );
  const badgeStamp = easeOutBack(
    rangeProgress(sec, sent2Start + 2.4, sent2Start + 3.2),
  );

  const yearChars = Math.min(
    4,
    Math.max(1, Math.ceil(rangeProgress(localSec, 0.1, 1.15) * 4)),
  );
  const yearString = '2003'.slice(0, yearChars);

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <DraftingWoodBackdrop sec={sec} />

      <StageContainer>
        {/* Top Monumental Archival Year */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 34,
            opacity: yearAppear * (1 - chartPhase * 0.92),
            transform: `translateY(${-chartPhase * 45}px)`,
          }}
        >
          <div
            style={{
              fontFamily: IDENTITY.fontDisplay,
              fontSize: 168,
              fontWeight: 700,
              color: IDENTITY.vellumPaper,
              lineHeight: 0.96,
              letterSpacing: '0.02em',
              textShadow: '0 18px 40px rgba(0,0,0,0.52)',
            }}
          >
            {yearString}
          </div>
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.24em',
              color: 'rgba(239, 231, 214, 0.72)',
              marginTop: 14,
            }}
          >
            CHEONGGYECHEON FREEWAY · SEOUL
          </div>
        </div>

        {/* Beat 7A: Ruled Municipal Index Dossier + Tilted Polaroid */}
        {chartPhase < 0.98 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 390,
              height: 980,
              opacity: 1 - chartPhase,
              transform: `translateY(${-chartPhase * 60}px) scale(${1 - chartPhase * 0.04})`,
            }}
          >
            {/* Cream Ruled Index Card */}
            <div
              style={{
                position: 'absolute',
                left: 82,
                top: 95,
                width: 980,
                height: 675,
                borderRadius: 12,
                background: `linear-gradient(175deg, ${IDENTITY.vellumPaper} 0%, ${IDENTITY.vellumShadow} 100%)`,
                boxShadow:
                  '0 34px 72px rgba(0, 0, 0, 0.62), inset 0 1px 0 rgba(255,255,255,0.65)',
                transform: `rotate(-1.6deg) translateY(${(1 - dossierSlide) * 70}px)`,
                opacity: dossierSlide,
                padding: '44px 52px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  fontFamily: IDENTITY.fontDisplay,
                  fontSize: 34,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: IDENTITY.vellumInk,
                  paddingBottom: 16,
                  borderBottom: `3px solid ${IDENTITY.vellumRuleRed}`,
                }}
              >
                BERKAS KOTA · SEOUL 2003
              </div>

              {/* Ruled Rows */}
              <div style={{marginTop: 12}}>
                {[
                  {
                    k: 'DIBONGKAR',
                    v: '1 JULI 2003 (TOL 6 LAJUR)',
                    p: row1P,
                    hi: false,
                  },
                  {
                    k: 'PANJANG TOL',
                    v: '5,8 KM DI JANTUNG KOTA',
                    p: row2P,
                    hi: false,
                  },
                  {
                    k: 'BEBAN HARIAN',
                    v: '168.000 MOBIL / HARI',
                    p: row3P,
                    hi: true,
                  },
                  {
                    k: 'PREDIKSI AHLI',
                    v: 'KIAMAT MACET TOTAL ???',
                    p: row4P,
                    hi: true,
                  },
                ].map((row, rIdx) => (
                  <div
                    key={row.k}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '275px 1fr',
                      alignItems: 'center',
                      height: 82,
                      borderBottom: `1.5px solid ${IDENTITY.vellumRuleBlue}`,
                      opacity: Math.max(0.08, row.p),
                    }}
                  >
                    <span
                      style={{
                        fontFamily: IDENTITY.fontMono,
                        fontSize: 24,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        color: '#464E4A',
                      }}
                    >
                      {row.k}
                    </span>
                    <span
                      style={{
                        fontFamily: IDENTITY.fontMono,
                        fontSize: 27,
                        fontWeight: 700,
                        color:
                          rIdx === 3
                            ? '#B82E18'
                            : row.hi
                              ? '#111614'
                              : '#242B28',
                      }}
                    >
                      {row.v.slice(0, Math.ceil(row.v.length * row.p))}
                    </span>
                  </div>
                ))}
                {[0, 1, 2].map((extra) => (
                  <div
                    key={`empty-rule-${extra}`}
                    style={{
                      height: 68,
                      borderBottom: `1.5px solid ${IDENTITY.vellumRuleBlue}`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Overlapping Glossy Polaroid Photo of 6-Lane Elevated Highway */}
            <div
              style={{
                position: 'absolute',
                right: 68,
                top: 12,
                width: 446,
                height: 528,
                borderRadius: 6,
                background: '#F7F3EA',
                padding: '24px 24px 96px 24px',
                boxShadow: '0 32px 68px rgba(0, 0, 0, 0.68)',
                transform: `rotate(3.4deg) scale(${0.86 + polaroidDrop * 0.14})`,
                opacity: polaroidDrop,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#111615',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <svg width={398} height={408} viewBox="0 0 398 408">
                  <rect width={398} height={408} fill="#121918" />
                  {/* City Skyline */}
                  {[
                    [22, 85, 58],
                    [92, 52, 72],
                    [178, 96, 54],
                    [246, 64, 68],
                    [326, 78, 56],
                  ].map(([bx, by, bw], bi) => (
                    <rect
                      key={`bldg-${bi}`}
                      x={bx}
                      y={by}
                      width={bw}
                      height={190}
                      fill="#1D2725"
                      stroke="rgba(255,255,255,0.08)"
                    />
                  ))}
                  {/* Elevated Concrete Pillars */}
                  {[78, 199, 320].map((px) => (
                    <rect
                      key={`pil-${px}`}
                      x={px - 16}
                      y={246}
                      width={32}
                      height={130}
                      fill="#4B5652"
                    />
                  ))}
                  {/* 6-Lane Concrete Overpass Deck */}
                  <rect
                    x={0}
                    y={196}
                    width={398}
                    height={62}
                    fill="#323B38"
                    stroke="#8A9691"
                    strokeWidth={2}
                  />
                  <line
                    x1={0}
                    y1={227}
                    x2={398}
                    y2={227}
                    stroke={IDENTITY.citrine}
                    strokeWidth={2.5}
                  />
                  {/* Dense Cars on Highway */}
                  {Array.from({length: 10}).map((_, ci) => (
                    <g key={`pcar-${ci}`}>
                      <rect
                        x={16 + ci * 38}
                        y={206}
                        width={22}
                        height={11}
                        rx={3}
                        fill={IDENTITY.vermilion}
                      />
                      <rect
                        x={24 + ci * 38}
                        y={237}
                        width={22}
                        height={11}
                        rx={3}
                        fill="#F4EFE6"
                      />
                    </g>
                  ))}
                  {/* Demolition Red Cut Lines */}
                  <line
                    x1={56}
                    y1={170}
                    x2={342}
                    y2={286}
                    stroke={IDENTITY.vermilion}
                    strokeWidth={4}
                    strokeDasharray="12 8"
                  />
                </svg>
              </div>

              <div style={{marginTop: 18}}>
                <div
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 23,
                    fontWeight: 700,
                    color: '#191D1B',
                  }}
                >
                  TOL CHEONGGYE
                </div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 17,
                    letterSpacing: '0.1em',
                    color: '#5F6763',
                    marginTop: 3,
                  }}
                >
                  6 LAJUR · 168.000 MOBIL/HARI
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Beat 7B: Millimeter Engineering Chart + Restored Stream Proof */}
        {chartPhase > 0.02 && (
          <div
            style={{
              position: 'absolute',
              left: 74,
              right: 74,
              top: 90,
              opacity: chartPhase,
              transform: `translateY(${(1 - chartPhase) * 52}px)`,
            }}
          >
            {/* Vellum Engineering Graph Sheet */}
            <div
              style={{
                borderRadius: 16,
                background: `linear-gradient(180deg, ${IDENTITY.vellumPaper} 0%, #E3D8C3 100%)`,
                padding: '38px 44px 42px 44px',
                boxShadow: '0 38px 82px rgba(0,0,0,0.66)',
                border: '2px solid rgba(255,255,255,0.45)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: '#2A302E',
                  }}
                >
                  INDEKS WAKTU TEMPUH KORIDOR SEOUL
                </span>
                <span
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 20,
                    fontWeight: 600,
                    color: '#636B67',
                  }}
                >
                  2003 → 2005
                </span>
              </div>

              <svg width={1204} height={670} viewBox="0 0 1204 670">
                <defs>
                  <pattern
                    id="mm-paper-grid"
                    width={48}
                    height={48}
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 48 0 L 0 0 0 48"
                      fill="none"
                      stroke="rgba(68, 96, 84, 0.14)"
                      strokeWidth={1}
                    />
                  </pattern>
                </defs>
                <rect
                  x={76}
                  y={24}
                  width={1090}
                  height={560}
                  fill="url(#mm-paper-grid)"
                  stroke="rgba(40,50,46,0.32)"
                  strokeWidth={1.8}
                />

                {/* Baseline 100% */}
                <line
                  x1={76}
                  y1={360}
                  x2={1166}
                  y2={360}
                  stroke="rgba(30,36,33,0.45)"
                  strokeWidth={2}
                  strokeDasharray="8 8"
                />
                <text
                  x={62}
                  y={366}
                  textAnchor="end"
                  fill="#3B4340"
                  fontFamily={IDENTITY.fontMono}
                  fontSize={18}
                  fontWeight={700}
                >
                  AWAL
                </text>
                <text
                  x={62}
                  y={110}
                  textAnchor="end"
                  fill="#B82E18"
                  fontFamily={IDENTITY.fontMono}
                  fontSize={18}
                  fontWeight={700}
                >
                  MACET
                </text>
                <text
                  x={62}
                  y={525}
                  textAnchor="end"
                  fill="#0E7A4D"
                  fontFamily={IDENTITY.fontMono}
                  fontSize={18}
                  fontWeight={700}
                >
                  LANCAR
                </text>

                {/* X-Axis Labels */}
                {[
                  [130, '2003 (TOL ADA)'],
                  [455, 'DIBONGKAR'],
                  [790, '2004 (TRANSISI)'],
                  [1095, '2005 (TAMAN SUNGAI)'],
                ].map(([lx, lbl]) => (
                  <text
                    key={String(lbl)}
                    x={Number(lx)}
                    y={624}
                    textAnchor="middle"
                    fill="#3B4340"
                    fontFamily={IDENTITY.fontMono}
                    fontSize={19}
                    fontWeight={700}
                  >
                    {lbl}
                  </text>
                ))}

                {/* Legend Box */}
                <g transform="translate(116, 56)">
                  <rect
                    x={0}
                    y={0}
                    width={376}
                    height={92}
                    rx={12}
                    fill="rgba(255,255,255,0.74)"
                    stroke="rgba(0,0,0,0.14)"
                  />
                  <line
                    x1={22}
                    y1={30}
                    x2={78}
                    y2={30}
                    stroke="#C9331B"
                    strokeWidth={4}
                    strokeDasharray="10 7"
                  />
                  <text
                    x={94}
                    y={36}
                    fill="#9E2410"
                    fontFamily={IDENTITY.fontMono}
                    fontSize={19}
                    fontWeight={700}
                  >
                    PREDIKSI AHLI (LUMPUH)
                  </text>

                  <line
                    x1={22}
                    y1={66}
                    x2={78}
                    y2={66}
                    stroke="#0D7E4F"
                    strokeWidth={5}
                  />
                  <text
                    x={94}
                    y={72}
                    fill="#0D6942"
                    fontFamily={IDENTITY.fontMono}
                    fontSize={19}
                    fontWeight={700}
                  >
                    DATA TERUKUR (LANCAR)
                  </text>
                </g>

                {/* Expert Prediction Curve (Dashed Vermilion climbing to gridlock) */}
                <path
                  d="M 130 360 L 360 360 C 520 350, 680 140, 1095 88"
                  fill="none"
                  stroke="#C9331B"
                  strokeWidth={5}
                  strokeDasharray="14 10"
                  pathLength={1}
                  strokeDashoffset={1 - tracePred}
                  opacity={tracePred > 0.01 ? 1 : 0}
                />

                {/* Actual Measured Curve (Solid Emerald dropping smoother & faster!) */}
                <path
                  d="M 130 360 L 360 360 C 510 342, 690 455, 1095 492"
                  fill="none"
                  stroke="#0D7E4F"
                  strokeWidth={7}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDashoffset={1 - traceReal}
                  opacity={traceReal > 0.01 ? 1 : 0}
                />

                {traceReal > 0.92 && (
                  <g transform="translate(1095, 492)">
                    <circle cx={0} cy={0} r={12} fill="#0D7E4F" />
                    <circle
                      cx={0}
                      cy={0}
                      r={24}
                      fill="none"
                      stroke="#0D7E4F"
                      strokeWidth={2.5}
                    />
                  </g>
                )}
              </svg>
            </div>

            {/* Bottom Verification Readouts (Seoul + NYC 42nd St) */}
            <div
              style={{
                marginTop: 28,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
              }}
            >
              <AnodizedCard
                accentColor="rgba(44, 229, 155, 0.55)"
                headerLeft="HASIL PENGUKURAN SEOUL (2005)"
                statusDot={IDENTITY.emerald}
              >
                <div style={{padding: '22px 28px'}}>
                  <div
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 38,
                      fontWeight: 700,
                      color: IDENTITY.emerald,
                    }}
                  >
                    WAKTU TEMPUH TURUN ✓
                  </div>
                  <div
                    style={{
                      fontFamily: IDENTITY.fontBody,
                      fontSize: 20,
                      color: IDENTITY.ivorySoft,
                      marginTop: 6,
                    }}
                  >
                    5,8 km sungai taman kota + angkutan umum naik 15,1%
                  </div>
                </div>
              </AnodizedCard>

              <div
                style={{
                  opacity: Math.max(0.2, badgeStamp),
                  transform: `scale(${0.9 + badgeStamp * 0.1})`,
                }}
              >
                <AnodizedCard
                  accentColor="rgba(246, 200, 68, 0.5)"
                  headerLeft="BUKTI SERUPA · NEW YORK (1990)"
                  statusDot={IDENTITY.citrine}
                >
                  <div style={{padding: '22px 28px'}}>
                    <div
                      style={{
                        fontFamily: IDENTITY.fontMono,
                        fontSize: 38,
                        fontWeight: 700,
                        color: IDENTITY.citrine,
                      }}
                    >
                      42ND ST DITUTUP → LANCAR
                    </div>
                    <div
                      style={{
                        fontFamily: IDENTITY.fontBody,
                        fontSize: 20,
                        color: IDENTITY.ivorySoft,
                        marginTop: 6,
                      }}
                    >
                      Stuttgart (1969) & New York membuktikan rumus Braess
                    </div>
                  </div>
                </AnodizedCard>
              </div>
            </div>
          </div>
        )}
      </StageContainer>
    </div>
  );
};

/* ==========================================================================
   CHAPTER 08 — DITUTUP LANCAR + INTERACTIVE CTA (74.65s -> 85.78s)
   ========================================================================== */
export const Scene08DitutupLancar: React.FC<SceneRenderProps> = ({
  sec,
  localSec,
}) => {
  const ch = CHAPTERS[7];
  const sent2Start = ch.sentences[1].start;

  const healP = easeInOutCubic(rangeProgress(localSec, 0.35, 2.85));
  const commentAppear = easeOutBack(
    rangeProgress(sec, sent2Start - 0.1, sent2Start + 0.65),
    1.18,
  );

  const commentText =
    'Pernah! Flyover baru dekat rumahku malah ngunci tiap pagi';
  const typeProgress = clamp01(
    rangeProgress(sec, sent2Start + 0.55, sent2Start + 3.55),
  );
  const visibleComment = commentText.slice(
    0,
    Math.floor(commentText.length * typeProgress),
  );
  const sendActive = sec >= sent2Start + 3.45;
  const sendPulse = rangeProgress(sec, sent2Start + 3.55, sent2Start + 4.35);

  const curBridgeCars = Math.round(interpolate(healP, [0, 1], [4000, 2000]));
  const curWideCars = Math.round(interpolate(healP, [0, 1], [0, 2000]));
  const curMinutes = Math.round(interpolate(healP, [0, 1], [80, 65]));

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <CartographicBackdrop
        sec={sec}
        mood="emerald"
        focusX={720}
        focusY={720}
      />

      <StageContainer>
        {/* Restored Diamond Network with Closed Center Shortcut */}
        <div style={{marginTop: 18}}>
          <DiamondNetworkStage
            sec={sec}
            height={820}
            config={{
              northBridgeCars: curBridgeCars,
              southBridgeCars: curBridgeCars,
              northWideCars: curWideCars,
              southWideCars: curWideCars,
              shortcutCars: Math.round((1 - healP) * 2000),
              shortcutState: healP > 0.35 ? 'closed' : 'open',
              showLabels: true,
            }}
          />
        </div>

        {/* Restored Equilibrium Status Pill */}
        <div
          style={{
            marginTop: 34,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              padding: '16px 42px',
              borderRadius: 999,
              background: IDENTITY.emeraldSoft,
              border: `2px solid ${IDENTITY.emerald}`,
              boxShadow: '0 0 38px rgba(44, 229, 155, 0.22)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 34,
                fontWeight: 700,
                color: IDENTITY.emerald,
              }}
            >
              {curMinutes} MENIT
            </span>
            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: IDENTITY.ivory,
              }}
            >
              PINTAS DITUTUP · ARUS KEMBALI LANCAR ✓
            </span>
          </div>
        </div>

        {/* Interactive YouTube Comment Bar (matching ref_gps.mp4 ending!) */}
        {commentAppear > 0.01 && (
          <div
            style={{
              width: 1180,
              margin: '62px auto 0 auto',
              opacity: commentAppear,
              transform: `translateY(${(1 - commentAppear) * 32}px) scale(${0.95 + commentAppear * 0.05})`,
            }}
          >
            <div
              style={{
                position: 'relative',
                height: 138,
                borderRadius: 34,
                background:
                  'linear-gradient(180deg, rgba(31, 35, 38, 0.96) 0%, rgba(21, 24, 26, 0.98) 100%)',
                border: '1.8px solid rgba(255, 255, 255, 0.14)',
                boxShadow: '0 30px 70px rgba(0, 0, 0, 0.65)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 28px 0 30px',
                gap: 24,
              }}
            >
              {/* N Avatar Circle */}
              <div
                style={{
                  width: 82,
                  height: 82,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(145deg, #FF6A3D 0%, #D93B18 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: IDENTITY.fontDisplay,
                  fontSize: 44,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  flexShrink: 0,
                  boxShadow: '0 8px 22px rgba(255, 86, 52, 0.36)',
                }}
              >
                N
              </div>

              {/* Live Typing Comment Input */}
              <div
                style={{
                  flex: 1,
                  fontFamily: IDENTITY.fontBody,
                  fontSize: 33,
                  fontWeight: 500,
                  color: IDENTITY.ivory,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {visibleComment || (
                  <span style={{color: IDENTITY.slateMuted}}>
                    Tulis komentar...
                  </span>
                )}
                {typeProgress < 1 && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 3,
                      height: 36,
                      background: IDENTITY.citrine,
                      marginLeft: 4,
                      verticalAlign: 'middle',
                      opacity: Math.sin(sec * 14) > 0 ? 1 : 0.15,
                    }}
                  />
                )}
              </div>

              {/* Send Paper-Plane Button */}
              <div
                style={{
                  position: 'relative',
                  width: 78,
                  height: 78,
                  borderRadius: '50%',
                  background: sendActive ? '#4F8BFF' : 'rgba(255,255,255,0.09)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transform: `scale(${sendPulse > 0 && sendPulse < 0.4 ? 0.9 : 1})`,
                  boxShadow: sendActive
                    ? '0 0 28px rgba(79, 139, 255, 0.55)'
                    : undefined,
                }}
              >
                {sendPulse > 0 && sendPulse < 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: -sendPulse * 28,
                      borderRadius: '50%',
                      border: `2px solid rgba(79, 139, 255, ${1 - sendPulse})`,
                    }}
                  />
                )}
                <svg width={34} height={34} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 20L21 12L3 4V10L15 12L3 14V20Z"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </StageContainer>
    </div>
  );
};
