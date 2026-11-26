import React from 'react';
import {interpolate} from 'remotion';
import {
  AnodizedCard,
  CartographicBackdrop,
  DiamondNetworkStage,
  SceneRenderProps,
  SplitFlapDigits,
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
  formatIntID,
  rangeProgress,
} from './script';

const PrecisionBridgeDial: React.FC<{
  readonly title: string;
  readonly subtitle: string;
  readonly minutes: number;
  readonly cars: number;
}> = ({title, subtitle, minutes, cars}) => {
  const norm = clamp01(minutes / 50);
  const startDeg = -125;
  const endDeg = 125;
  const needleDeg = interpolate(norm, [0, 1], [startDeg, endDeg]);
  const isDanger = minutes >= 32;
  const ringColor = isDanger ? IDENTITY.vermilion : IDENTITY.emerald;

  const R = 132;
  const cx = 185;
  const cy = 182;

  const polar = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return {x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r};
  };

  const arcStart = polar(startDeg, R);
  const arcCur = polar(needleDeg, R);
  const largeArc = needleDeg - startDeg > 180 ? 1 : 0;

  return (
    <AnodizedCard
      accentColor={
        isDanger ? 'rgba(255, 86, 52, 0.5)' : 'rgba(44, 229, 155, 0.4)'
      }
      headerLeft={title}
      headerRight={subtitle}
      statusDot={ringColor}
    >
      <div
        style={{
          padding: '14px 20px 22px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <svg width={370} height={265} viewBox="0 0 370 265">
          {Array.from({length: 26}).map((_, i) => {
            const frac = i / 25;
            const deg = startDeg + frac * (endDeg - startDeg);
            const major = i % 5 === 0;
            const pOuter = polar(deg, R + 6);
            const pInner = polar(deg, R - (major ? 14 : 6));
            const tickHigh = frac >= 0.64;
            return (
              <line
                key={`dt-${i}`}
                x1={pInner.x}
                y1={pInner.y}
                x2={pOuter.x}
                y2={pOuter.y}
                stroke={
                  tickHigh
                    ? 'rgba(255, 86, 52, 0.72)'
                    : 'rgba(244, 239, 230, 0.34)'
                }
                strokeWidth={major ? 3 : 1.5}
                strokeLinecap="round"
              />
            );
          })}

          {norm > 0.02 && (
            <path
              d={`M ${arcStart.x} ${arcStart.y} A ${R} ${R} 0 ${largeArc} 1 ${arcCur.x} ${arcCur.y}`}
              fill="none"
              stroke={ringColor}
              strokeWidth={10}
              strokeLinecap="round"
            />
          )}

          <g transform={`translate(${cx}, ${cy}) rotate(${needleDeg})`}>
            <polygon
              points="-5,14 0,-114 5,14"
              fill={ringColor}
              stroke="#FFFFFF"
              strokeWidth={1}
            />
            <circle
              cx={0}
              cy={0}
              r={14}
              fill="#192320"
              stroke={ringColor}
              strokeWidth={3}
            />
          </g>

          <text
            x={cx}
            y={cy + 58}
            textAnchor="middle"
            fill={ringColor}
            fontFamily={IDENTITY.fontMono}
            fontSize={44}
            fontWeight={700}
          >
            {Math.round(minutes)} MNT
          </text>
        </svg>

        <div
          style={{
            padding: '8px 22px',
            borderRadius: 999,
            background: isDanger ? IDENTITY.vermilionSoft : IDENTITY.emeraldSoft,
            fontFamily: IDENTITY.fontMono,
            fontSize: 19,
            fontWeight: 700,
            color: ringColor,
          }}
        >
          {formatIntID(cars)} MOBIL ÷ 100 = {Math.round(minutes)} MNT
        </div>
      </div>
    </AnodizedCard>
  );
};

/* ==========================================================================
   CHAPTER 04 — JALAN PINTAS (31.36s -> 40.12s)
   ========================================================================== */
export const Scene04JalanPintas: React.FC<SceneRenderProps> = ({
  sec,
  localSec,
}) => {
  const ch = CHAPTERS[3];
  const sent2Start = ch.sentences[1].start;

  const buildP = easeOutQuart(rangeProgress(localSec, 0.25, 2.05));
  const pioneerRunP = easeInOutCubic(
    rangeProgress(sec, sent2Start - 0.1, sent2Start + 3.15),
  );
  const timerDropP = easeOutCubic(
    rangeProgress(sec, sent2Start + 0.55, sent2Start + 2.65),
  );
  const badgePop = easeOutBack(
    rangeProgress(sec, sent2Start + 1.55, sent2Start + 2.25),
  );

  const displayedMinutes = Math.round(interpolate(timerDropP, [0, 1], [65, 40]));

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <CartographicBackdrop
        sec={sec}
        mood="citrine"
        focusX={720}
        focusY={780}
      />

      <StageContainer>
        <div style={{textAlign: 'center', marginTop: 22}}>
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 21,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: IDENTITY.citrine,
            }}
          >
            PROYEK BARU · VIADUK TENGAH
          </div>
          <div
            style={{
              fontFamily: IDENTITY.fontDisplay,
              fontSize: 50,
              fontWeight: 700,
              color: IDENTITY.ivory,
              marginTop: 6,
            }}
          >
            JALAN PINTAS SUPERCEPAT · 0 MENIT
          </div>
        </div>

        <div style={{marginTop: 28}}>
          <DiamondNetworkStage
            sec={sec}
            height={850}
            config={{
              northBridgeCars: 2001,
              southBridgeCars: 2001,
              northWideCars: 2000,
              southWideCars: 2000,
              shortcutCars: pioneerRunP > 0.05 ? 350 : 0,
              shortcutState: buildP < 0.98 ? 'building' : 'open',
              shortcutBuildProgress: buildP,
              highlightPioneer: pioneerRunP,
              showLabels: true,
            }}
          />
        </div>

        <div style={{width: 1272, margin: '34px auto 0 auto'}}>
          <AnodizedCard
            accentColor="rgba(246, 200, 68, 0.55)"
            headerLeft="SIMULASI PENGEMUDI PERTAMA (A → U → S → B)"
            headerRight="20 + 0 + 20 = 40 MNT"
            statusDot={IDENTITY.citrine}
          >
            <div
              style={{
                padding: '28px 36px 32px 36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 19,
                    letterSpacing: '0.14em',
                    color: IDENTITY.slateMuted,
                  }}
                >
                  RUTE LAMA: <s style={{color: IDENTITY.ivorySoft}}>65 MENIT</s>
                </div>
                <div style={{marginTop: 12}}>
                  <SplitFlapDigits
                    value={String(displayedMinutes)}
                    unit="MENIT"
                    color={
                      timerDropP > 0.5 ? IDENTITY.citrine : IDENTITY.ivory
                    }
                    digitWidth={78}
                    digitHeight={106}
                    fontSize={66}
                  />
                </div>
              </div>

              <div
                style={{
                  opacity: Math.max(0.15, badgePop),
                  transform: `scale(${0.85 + badgePop * 0.15})`,
                  padding: '22px 34px',
                  borderRadius: 24,
                  background:
                    'linear-gradient(135deg, rgba(246,200,68,0.22) 0%, rgba(44,229,155,0.18) 100%)',
                  border: `2px solid ${IDENTITY.citrine}`,
                  textAlign: 'right',
                }}
              >
                <div
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 44,
                    fontWeight: 700,
                    color: IDENTITY.citrine,
                  }}
                >
                  −25 MENIT ⚡
                </div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontBody,
                    fontSize: 21,
                    fontWeight: 600,
                    color: IDENTITY.ivory,
                    marginTop: 4,
                  }}
                >
                  Hemat hampir 40% waktu!
                </div>
              </div>
            </div>
          </AnodizedCard>
        </div>
      </StageContainer>
    </div>
  );
};

/* ==========================================================================
   CHAPTER 05 — JEBAKAN NASH (40.12s -> 52.09s)
   ========================================================================== */
export const Scene05JebakanNash: React.FC<SceneRenderProps> = ({
  sec,
  localSec,
}) => {
  const ch = CHAPTERS[4];
  const sent2Start = ch.sentences[1].start;

  const migrateP = easeInOutCubic(rangeProgress(localSec, 0.6, 7.8));
  const payoffAppear = easeOutQuart(
    rangeProgress(sec, sent2Start - 0.3, sent2Start + 0.8),
  );

  const migratedCars = Math.round(interpolate(migrateP, [0, 1], [1, 4000]));
  const bridgeLoad = Math.round(interpolate(migrateP, [0, 1], [2000, 4000]));
  const wideLoad = Math.round(interpolate(migrateP, [0, 1], [2000, 0]));
  const migratePct = Math.round((migratedCars / 4000) * 100);

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <CartographicBackdrop
        sec={sec}
        mood={migrateP > 0.55 ? 'vermilion' : 'citrine'}
        focusX={720}
        focusY={760}
      />

      <StageContainer>
        <div style={{textAlign: 'center', marginTop: 18}}>
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 21,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: IDENTITY.vermilion,
            }}
          >
            KESEIMBANGAN NASH · EFEK DOMINO
          </div>
          <div
            style={{
              fontFamily: IDENTITY.fontDisplay,
              fontSize: 48,
              fontWeight: 700,
              color: IDENTITY.ivory,
              marginTop: 4,
            }}
          >
            SEMUA BEREBUT JALAN PINTAS
          </div>
        </div>

        <div style={{marginTop: 22}}>
          <DiamondNetworkStage
            sec={sec}
            height={780}
            config={{
              northBridgeCars: bridgeLoad,
              southBridgeCars: bridgeLoad,
              northWideCars: wideLoad,
              southWideCars: wideLoad,
              shortcutCars: migratedCars,
              shortcutState: 'open',
              showLabels: true,
            }}
          />
        </div>

        {/* Migration Bar + Dual Payoff Comparison */}
        <div
          style={{
            width: 1272,
            margin: '28px auto 0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <AnodizedCard
            accentColor="rgba(255, 86, 52, 0.52)"
            headerLeft="GELOMBANG MIGRASI PENGEMUDI KE JALAN PINTAS"
            headerRight={`${migratePct}% PINDAH`}
            statusDot={IDENTITY.vermilion}
          >
            <div style={{padding: '22px 30px 26px 30px'}}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 48,
                    fontWeight: 700,
                    color:
                      migrateP > 0.6 ? IDENTITY.vermilion : IDENTITY.citrine,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatIntID(migratedCars)} / 4.000 MOBIL
                </span>
                <span
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 22,
                    color: IDENTITY.ivorySoft,
                  }}
                >
                  BEBAN JEMBATAN: {Math.round(bridgeLoad / 100)} MNT
                </span>
              </div>

              <div
                style={{
                  marginTop: 14,
                  height: 18,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.max(2, migratePct)}%`,
                    height: '100%',
                    borderRadius: 999,
                    background:
                      'linear-gradient(90deg, #F6C844 0%, #FF5634 100%)',
                  }}
                />
              </div>
            </div>
          </AnodizedCard>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 22,
              opacity: Math.max(0.3, payoffAppear),
              transform: `translateY(${(1 - payoffAppear) * 18}px)`,
            }}
          >
            <div
              style={{
                padding: '20px 26px',
                borderRadius: 24,
                background: 'rgba(28, 19, 17, 0.94)',
                border: `1.5px solid ${IDENTITY.vermilion}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 17,
                    color: IDENTITY.vermilion,
                  }}
                >
                  LEWAT PINTAS (SEMUA IKUT)
                </div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontBody,
                    fontSize: 20,
                    color: IDENTITY.ivorySoft,
                    marginTop: 4,
                  }}
                >
                  40 + 0 + 40 menit
                </div>
              </div>
              <div
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 42,
                  fontWeight: 700,
                  color: IDENTITY.vermilion,
                }}
              >
                80 MNT
              </div>
            </div>

            <div
              style={{
                padding: '20px 26px',
                borderRadius: 24,
                background: 'rgba(16, 22, 20, 0.94)',
                border: '1.5px solid rgba(244,239,230,0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 17,
                    color: IDENTITY.slateMuted,
                  }}
                >
                  BALIK SENDIRIAN KE JALUR LAMA
                </div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontBody,
                    fontSize: 20,
                    color: IDENTITY.slateMuted,
                    marginTop: 4,
                  }}
                >
                  40 + 45 menit (makin rugi!)
                </div>
              </div>
              <div
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 42,
                  fontWeight: 700,
                  color: IDENTITY.slateMuted,
                }}
              >
                85 MNT
              </div>
            </div>
          </div>
        </div>
      </StageContainer>
    </div>
  );
};

/* ==========================================================================
   CHAPTER 06 — 80 MENIT (52.09s -> 61.07s)
   ========================================================================== */
export const Scene06DelapanPuluh: React.FC<SceneRenderProps> = ({
  sec,
  localSec,
}) => {
  const ch = CHAPTERS[5];
  const sent2Start = ch.sentences[1].start;

  const dialSweep = easeOutCubic(rangeProgress(localSec, 0.15, 2.35));
  const chartReveal = easeOutQuart(
    rangeProgress(sec, sent2Start - 0.15, sent2Start + 1.25),
  );
  const rightBarGrow = easeOutBack(
    rangeProgress(sec, sent2Start + 0.45, sent2Start + 2.0),
    1.15,
  );
  const deltaBadge = easeOutBack(
    rangeProgress(sec, sent2Start + 1.65, sent2Start + 2.35),
  );

  const bridgeMin = interpolate(dialSweep, [0, 1], [20, 40]);
  const bridgeCars = Math.round(interpolate(dialSweep, [0, 1], [2000, 4000]));
  const totalAfter = Math.round(interpolate(rightBarGrow, [0, 1], [65, 80]));

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <CartographicBackdrop
        sec={sec}
        mood="vermilion"
        focusX={720}
        focusY={880}
      />

      <StageContainer>
        <div
          style={{
            width: 1272,
            margin: '16px auto 0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 26,
          }}
        >
          {/* Twin Precision Bridge Load Dials */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 26,
              transform: `scale(${1 - chartReveal * 0.03})`,
            }}
          >
            <PrecisionBridgeDial
              title="JEMBATAN UTARA (A → U)"
              subtitle="BENGKAK 2× LIPAT"
              minutes={bridgeMin}
              cars={bridgeCars}
            />
            <PrecisionBridgeDial
              title="JEMBATAN SELATAN (S → B)"
              subtitle="BENGKAK 2× LIPAT"
              minutes={bridgeMin}
              cars={bridgeCars}
            />
          </div>

          {/* Monumental Comparative Column Chart (65 MNT vs 80 MNT) */}
          <AnodizedCard
            accentColor="rgba(255, 86, 52, 0.56)"
            headerLeft="PERBANDINGAN WAKTU TEMPUH SEMUA PENGEMUDI"
            headerRight="DIETRICH BRAESS · 1968"
            statusDot={IDENTITY.vermilion}
          >
            <div style={{padding: '30px 44px 36px 44px'}}>
              <div
                style={{
                  position: 'relative',
                  height: 620,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-around',
                  paddingBottom: 68,
                  borderBottom: '2px solid rgba(244,239,230,0.18)',
                }}
              >
                {/* Horizontal Reference Lines */}
                {[20, 40, 65, 80].map((val) => {
                  const bottomPx = 68 + (val / 92) * 490;
                  const isBase65 = val === 65;
                  return (
                    <div
                      key={`grid-${val}`}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: bottomPx,
                        borderTop: isBase65
                          ? `2px dashed ${IDENTITY.emerald}`
                          : '1px solid rgba(244,239,230,0.08)',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: -26,
                          fontFamily: IDENTITY.fontMono,
                          fontSize: 18,
                          fontWeight: 600,
                          color: isBase65
                            ? IDENTITY.emerald
                            : IDENTITY.slateMuted,
                        }}
                      >
                        {val} mnt
                      </span>
                    </div>
                  );
                })}

                {/* Column 1: Tanpa Jalan Pintas = 65 MNT */}
                <div
                  style={{
                    width: 310,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 52,
                      fontWeight: 700,
                      color: IDENTITY.emerald,
                      marginBottom: 14,
                    }}
                  >
                    65 MNT
                  </div>
                  <div
                    style={{
                      width: 220,
                      height: (65 / 92) * 490,
                      borderRadius: '22px 22px 6px 6px',
                      background:
                        'linear-gradient(180deg, #35F0A4 0%, #157D53 100%)',
                      border: '2px solid #78F9C4',
                      boxShadow: '0 0 36px rgba(44, 229, 155, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#061A11',
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    <span>20 + 45</span>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 14,
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 21,
                      fontWeight: 700,
                      color: IDENTITY.ivorySoft,
                    }}
                  >
                    SEBELUM (2 JALUR)
                  </div>
                </div>

                {/* Column 2: Dengan Jalan Pintas = 80 MNT */}
                <div
                  style={{
                    width: 340,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 2,
                    opacity: Math.max(0.25, chartReveal),
                  }}
                >
                  <div
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 58,
                      fontWeight: 700,
                      color: IDENTITY.vermilion,
                      marginBottom: 14,
                    }}
                  >
                    {totalAfter} MNT
                  </div>
                  <div
                    style={{
                      width: 230,
                      height: (totalAfter / 92) * 490,
                      borderRadius: '22px 22px 6px 6px',
                      background:
                        'linear-gradient(180deg, #FF6E4E 0%, #B0240C 100%)',
                      border: '2px solid #FFA38F',
                      boxShadow: '0 0 50px rgba(255, 86, 52, 0.42)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-evenly',
                      alignItems: 'center',
                      color: '#FFFFFF',
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    <span>UTARA: 40</span>
                    <span
                      style={{
                        width: '78%',
                        height: 2,
                        background: 'rgba(255,255,255,0.38)',
                      }}
                    />
                    <span>SELATAN: 40</span>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 14,
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 21,
                      fontWeight: 700,
                      color: IDENTITY.vermilion,
                    }}
                  >
                    + JALAN PINTAS BARU
                  </div>
                </div>
              </div>

              {/* Bottom Delta Callout */}
              <div
                style={{
                  marginTop: 28,
                  display: 'flex',
                  justifyContent: 'center',
                  opacity: deltaBadge,
                  transform: `scale(${0.88 + deltaBadge * 0.12})`,
                }}
              >
                <div
                  style={{
                    padding: '16px 40px',
                    borderRadius: 999,
                    background:
                      'linear-gradient(90deg, rgba(255,86,52,0.24) 0%, rgba(246,200,68,0.2) 100%)',
                    border: `2px solid ${IDENTITY.vermilion}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 18,
                  }}
                >
                  <span
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 40,
                      fontWeight: 700,
                      color: IDENTITY.vermilion,
                    }}
                  >
                    +15 MENIT
                  </span>
                  <span
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: IDENTITY.ivory,
                    }}
                  >
                    SEMUA ORANG PULANG LEBIH LAMA
                  </span>
                </div>
              </div>
            </div>
          </AnodizedCard>
        </div>
      </StageContainer>
    </div>
  );
};
