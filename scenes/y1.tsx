import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { AlmanacFolioSheet, AlmanacPlaque } from './kalender';
import {
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  prog,
} from './script';

// ============================================================================
// LEMBAR 05 — PAUS GREGORIUS XIII & ALOYSIUS LILIUS: POTONG 10 TANGGAL
// Cards:
//  5A [53.90..56.19]: "Untuk meluruskannya kembali,"
//  5B [56.19..62.28]: "Paus Gregorius ketiga belas dan astronom Aloysius Lilius merombak kalender."
//  5C [62.28..65.45]: "Sepuluh tanggal di bulan Oktober langsung dipotong,"
//  5D [65.45..68.30]: "tanpa mengubah urutan hari Kamis ke Jumat."
// ============================================================================

export const Lembar05ReformasiGregorius: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[4];

  const decreeP = easeOutCubic(prog(sec, ch.start + 0.1, 58.6));
  const liliusP = easeOutCubic(prog(sec, 58.3, 60.8));
  const cutRibbonP = easeInOutCubic(prog(sec, 62.28, 65.1));
  const weekdayLockP = easeOutCubic(prog(sec, 65.45, 67.6));

  const remainingError = Math.abs(interpolate(cutRibbonP, [0, 1], [10.0, 0.0]))
    .toFixed(1)
    .replace('.', ',');

  const weekdays = ['SEN', 'SEL', 'RAB', 'KAMIS', 'JUMAT', 'SAB', 'MIN'];

  return (
    <AlmanacFolioSheet chapter={ch}>
      {/* Upper Section: Papal Bull Inter Gravissimas & Two Reform Architects */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 34,
          height: 392,
          background: 'rgba(248, 244, 234, 0.93)',
          border: `2px solid ${IDENTITY.ink}`,
          padding: '26px 34px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          opacity: decreeP,
          transform: `translateY(${(1 - decreeP) * 16}px)`,
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
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: IDENTITY.crimson,
            }}
          >
            KOMISI REFORMASI KALENDER · ROMA, 24 FEBRUARI 1582
          </span>
          <AlmanacPlaque tone="crimson" size="sm" label="INTER GRAVISSIMAS" />
        </div>

        {/* Two Architect Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 22,
            height: 256,
          }}
        >
          {/* Left: Pope Gregory XIII */}
          <div
            style={{
              background: '#EFE7D6',
              border: `2px solid ${IDENTITY.ink}`,
              padding: '22px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 18,
                  fontWeight: 700,
                  color: IDENTITY.crimson,
                  letterSpacing: '0.10em',
                }}
              >
                OTORITAS DEKRET RESMI
              </span>
              {/* Engraved Wax Seal */}
              <svg width={44} height={44} viewBox="0 0 44 44">
                <circle cx={22} cy={22} r={19} fill={IDENTITY.crimson} />
                <circle
                  cx={22}
                  cy={22}
                  r={14}
                  fill="none"
                  stroke="#FDE6DF"
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                />
                <text
                  x={22}
                  y={27}
                  textAnchor="middle"
                  fontFamily={IDENTITY.fontSerif}
                  fontWeight={900}
                  fontSize={14}
                  fill="#FFF8F2"
                >
                  XIII
                </text>
              </svg>
            </div>

            <div>
              <div
                style={{
                  fontFamily: IDENTITY.fontSerif,
                  fontWeight: 900,
                  fontSize: 38,
                  color: IDENTITY.ink,
                  lineHeight: 1.06,
                }}
              >
                Paus Gregorius XIII
              </div>
              <div
                style={{
                  fontFamily: IDENTITY.fontBody,
                  fontSize: 21,
                  fontWeight: 600,
                  color: IDENTITY.inkSoft,
                  marginTop: 6,
                }}
              >
                Menetapkan pemotongan 10 hari Oktober 1582
              </div>
            </div>
          </div>

          {/* Right: Aloysius Lilius & Clavius */}
          <div
            style={{
              background: '#EFE7D6',
              border: `2px solid ${liliusP > 0.15 ? IDENTITY.lapis : IDENTITY.ink}`,
              padding: '22px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: 0.35 + 0.65 * liliusP,
              transform: `translateY(${(1 - liliusP) * 12}px)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 18,
                  fontWeight: 700,
                  color: IDENTITY.lapis,
                  letterSpacing: '0.10em',
                }}
              >
                ARSITEK MATEMATIKA & ASTRONOMI
              </span>
              <svg width={44} height={44} viewBox="0 0 44 44">
                <circle
                  cx={22}
                  cy={22}
                  r={18}
                  fill="none"
                  stroke={IDENTITY.lapis}
                  strokeWidth={2.5}
                />
                <line x1={22} y1={6} x2={22} y2={38} stroke={IDENTITY.lapis} strokeWidth={1.8} />
                <line x1={6} y1={22} x2={38} y2={22} stroke={IDENTITY.lapis} strokeWidth={1.8} />
                <circle cx={22} cy={22} r={5} fill={IDENTITY.brass} />
              </svg>
            </div>

            <div>
              <div
                style={{
                  fontFamily: IDENTITY.fontSerif,
                  fontWeight: 900,
                  fontSize: 38,
                  color: IDENTITY.ink,
                  lineHeight: 1.06,
                }}
              >
                Aloysius Lilius
              </div>
              <div
                style={{
                  fontFamily: IDENTITY.fontBody,
                  fontSize: 21,
                  fontWeight: 600,
                  color: IDENTITY.inkSoft,
                  marginTop: 6,
                }}
              >
                Menyusun rumus siklus kabisat 400 tahun
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Section: Dual-Track Mechanical Calendar Splicer */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 454,
          height: 598,
          background: '#F8F4EA',
          border: `2px solid ${IDENTITY.ink}`,
          padding: '28px 34px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
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
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: IDENTITY.inkSoft,
            }}
          >
            MEKANISME PEMOTONGAN PITA TANGGAL · OKTOBER 1582
          </span>
          <span
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 19,
              fontWeight: 800,
              color: weekdayLockP > 0.2 ? IDENTITY.verdigris : IDENTITY.crimson,
            }}
          >
            {weekdayLockP > 0.2
              ? 'URUTAN HARI TETAP UTUH ✓'
              : 'MEMOTONG 5–14 OKTOBER'}
          </span>
        </div>

        {/* Track 1: Unbroken 7-Day Weekday Rail */}
        <div>
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 18,
              fontWeight: 700,
              color: IDENTITY.verdigris,
              letterSpacing: '0.10em',
              marginBottom: 8,
            }}
          >
            1. PITA HARI PEKAN (TIDAK DIPOTONG SAMA SEKALI)
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              height: 92,
              border: `2.5px solid ${IDENTITY.ink}`,
              background: IDENTITY.ink,
            }}
          >
            {weekdays.map((wd, idx) => {
              const highlightKJ = (idx === 3 || idx === 4) && weekdayLockP > 0.1;
              return (
                <div
                  key={wd}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight:
                      idx < 6 ? '1px solid rgba(244,239,227,0.18)' : 'none',
                    background: highlightKJ
                      ? `rgba(31, 106, 84, ${0.85 * weekdayLockP})`
                      : 'transparent',
                    fontFamily: IDENTITY.fontMono,
                    fontSize: idx === 3 || idx === 4 ? 25 : 22,
                    fontWeight: 800,
                    color: idx === 3 || idx === 4 ? '#F4BE44' : '#F4EFE3',
                    letterSpacing: '0.08em',
                  }}
                >
                  {wd}
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 2: Sliding Date Ribbon where [5..14] drops out and [15,16,17] slides into Fri,Sat,Sun */}
        <div style={{ position: 'relative', height: 266 }}>
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 18,
              fontWeight: 700,
              color: IDENTITY.crimson,
              letterSpacing: '0.10em',
              marginBottom: 8,
            }}
          >
            2. PITA TANGGAL KALENDER (5–14 OKT DIKELUARKAN, 15 OKT GESER KE JUMAT)
          </div>

          <div
            style={{
              position: 'relative',
              height: 118,
              border: `2px dashed rgba(25, 23, 20, 0.28)`,
              background: '#EAE1CE',
            }}
          >
            {/* Fixed Left 4 Cells: 1, 2, 3, 4 OKT (Mon..Thu) */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: `${(4 / 7) * 100}%`,
                height: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                background: '#F8F4EA',
                borderRight: `3px solid ${IDENTITY.ink}`,
                zIndex: 4,
              }}
            >
              {[1, 2, 3, 4].map((d, idx) => (
                <div
                  key={d}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: idx < 3 ? '1px solid rgba(25,23,20,0.18)' : 'none',
                    background:
                      d === 4 && weekdayLockP > 0.1
                        ? 'rgba(33, 78, 120, 0.14)'
                        : 'transparent',
                  }}
                >
                  <span
                    style={{
                      fontFamily: IDENTITY.fontSerif,
                      fontWeight: 900,
                      fontSize: 48,
                      color: IDENTITY.ink,
                      lineHeight: 1,
                    }}
                  >
                    {d}
                  </span>
                  <span
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 15,
                      fontWeight: 700,
                      color: IDENTITY.inkMuted,
                      marginTop: 4,
                    }}
                  >
                    OKT
                  </span>
                </div>
              ))}
            </div>

            {/* Dropping Cut Segment: [5 – 14 OKTOBER · 10 TANGGAL] */}
            <div
              style={{
                position: 'absolute',
                left: `${(4 / 7) * 100}%`,
                top: `${cutRibbonP * 124}px`,
                width: `${(3 / 7) * 100}%`,
                height: '100%',
                background: '#FDF3F1',
                border: `3px solid ${IDENTITY.crimson}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 1 - cutRibbonP * 0.25,
                transform: `rotate(${cutRibbonP * 3.2}deg)`,
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontFamily: IDENTITY.fontSerif,
                  fontWeight: 900,
                  fontSize: 42,
                  color: IDENTITY.crimson,
                  textDecoration: cutRibbonP > 0.2 ? 'line-through' : 'none',
                }}
              >
                5 – 14 Okt
              </span>
              <span
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 17,
                  fontWeight: 800,
                  color: IDENTITY.crimson,
                  letterSpacing: '0.08em',
                  marginTop: 4,
                }}
              >
                ✂ DIPOTONG (10 HARI)
              </span>
            </div>

            {/* Sliding Right Segment: [15, 16, 17 OKT] sliding in from right onto Fri, Sat, Sun! */}
            <div
              style={{
                position: 'absolute',
                left: `${interpolate(cutRibbonP, [0, 1], [102, (4 / 7) * 100])}%`,
                top: 0,
                width: `${(3 / 7) * 100}%`,
                height: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                background: '#EDF7F3',
                borderLeft: `3px solid ${IDENTITY.verdigris}`,
                zIndex: 5,
                boxShadow:
                  cutRibbonP > 0.1 ? '-10px 0 24px rgba(25,23,20,0.16)' : 'none',
              }}
            >
              {[15, 16, 17].map((d, idx) => (
                <div
                  key={d}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: idx < 2 ? '1px solid rgba(31,106,84,0.25)' : 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: IDENTITY.fontSerif,
                      fontWeight: 900,
                      fontSize: 48,
                      color: d === 15 ? IDENTITY.verdigris : IDENTITY.ink,
                      lineHeight: 1,
                    }}
                  >
                    {d}
                  </span>
                  <span
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 15,
                      fontWeight: 800,
                      color: IDENTITY.verdigris,
                      marginTop: 4,
                    }}
                  >
                    OKT
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Solar Alignment Readout Bar */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 1080,
          height: 212,
          background: IDENTITY.ink,
          padding: '24px 38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#F4BE44',
            }}
          >
            STATUS KESELARASAN MATAHARI & KALENDER
          </div>
          <div
            style={{
              fontFamily: IDENTITY.fontBody,
              fontSize: 25,
              fontWeight: 600,
              color: '#F4EFE3',
              marginTop: 8,
            }}
          >
            {cutRibbonP > 0.85
              ? 'Kamis 4 Oktober langsung disambung ke Jumat 15 Oktober'
              : 'Menggeser tanggal agar kembali tepat dengan orbit Bumi'}
          </div>
        </div>

        <div
          style={{
            padding: '16px 28px',
            background: cutRibbonP > 0.85 ? IDENTITY.verdigris : IDENTITY.crimson,
            border: '2px solid rgba(255,255,255,0.22)',
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 17,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.84)',
              letterSpacing: '0.10em',
            }}
          >
            SELISIH MUSIM
          </div>
          <div
            style={{
              fontFamily: IDENTITY.fontSerif,
              fontWeight: 900,
              fontSize: 54,
              lineHeight: 1.05,
              color: '#FFFFFF',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {remainingError} Hari
          </div>
        </div>
      </div>
    </AlmanacFolioSheet>
  );
};

// ============================================================================
// LEMBAR 06 — RAHASIA RUMUS KABISAT: 1700, 1800, 1900 BUKAN KABISAT vs 2000
// Cards:
//  6A [68.38..72.86]: "Supaya tidak meleset lagi, aturan tahun kabisat ikut diubah."
//  6B [72.86..76.48]: "Tahun abad bulat seperti seribu tujuh ratus,"
//  6C [76.48..80.74]: "seribu delapan ratus, dan seribu sembilan ratus bukan kabisat,"
//  6D [80.74..85.32]: "kecuali yang habis dibagi empat ratus seperti tahun dua ribu."
// ============================================================================

export const Lembar06RumusKabisat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[5];

  const ruleIntroP = easeOutCubic(prog(sec, ch.start + 0.1, 71.8));
  const c1700P = easeOutCubic(prog(sec, 74.6, 76.2));
  const c1800P = easeOutCubic(prog(sec, 76.5, 78.1));
  const c1900P = easeOutCubic(prog(sec, 78.4, 80.4));
  const c2000P = easeOutCubic(prog(sec, 81.2, 84.4));

  const centuries = [
    {
      year: '1600',
      div400: true,
      note: '1600 ÷ 400 = 4',
      feb: '29 HARI',
      reveal: clamp01(c2000P * 1.15),
    },
    {
      year: '1700',
      div400: false,
      note: 'TIDAK HABIS ÷ 400',
      feb: '28 HARI',
      reveal: c1700P,
    },
    {
      year: '1800',
      div400: false,
      note: 'TIDAK HABIS ÷ 400',
      feb: '28 HARI',
      reveal: c1800P,
    },
    {
      year: '1900',
      div400: false,
      note: 'TIDAK HABIS ÷ 400',
      feb: '28 HARI',
      reveal: c1900P,
    },
    {
      year: '2000',
      div400: true,
      note: '2000 ÷ 400 = 5',
      feb: '29 HARI',
      reveal: c2000P,
    },
  ];

  return (
    <AlmanacFolioSheet chapter={ch}>
      {/* Top Rule Summary Banner */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 34,
          height: 172,
          background: '#F8F4EA',
          border: `2px solid ${IDENTITY.ink}`,
          padding: '22px 34px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: ruleIntroP,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: IDENTITY.crimson,
            }}
          >
            SARINGAN GANDA TAHUN KABISAT GREGORIAN
          </div>
          <div
            style={{
              fontFamily: IDENTITY.fontSerif,
              fontWeight: 900,
              fontSize: 38,
              color: IDENTITY.ink,
              marginTop: 6,
            }}
          >
            Membuang 3 hari kabisat setiap 400 tahun
          </div>
        </div>

        <div
          style={{
            padding: '14px 24px',
            background: IDENTITY.ink,
            color: '#F4BE44',
            fontFamily: IDENTITY.fontMono,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '0.08em',
          }}
        >
          97 KABISAT / 400 THN
        </div>
      </div>

      {/* Center 5-Century Sieve Matrix (1600 .. 2000) */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 232,
          height: 734,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {centuries.map((item) => {
          const r = item.reveal;
          const active = r > 0.05;
          const bg = !active
            ? 'rgba(248, 244, 234, 0.88)'
            : item.div400
              ? '#EDF7F3'
              : '#FDF3F1';
          const borderCol = !active
            ? 'rgba(25, 23, 20, 0.32)'
            : item.div400
              ? IDENTITY.verdigris
              : IDENTITY.crimson;

          return (
            <div
              key={item.year}
              style={{
                flex: 1,
                background: bg,
                border: `2.5px solid ${borderCol}`,
                padding: '0 32px',
                display: 'grid',
                gridTemplateColumns: '230px 1fr 290px',
                alignItems: 'center',
                boxShadow: active
                  ? '0 10px 24px rgba(25, 23, 20, 0.11)'
                  : 'none',
                transform: `scale(${0.985 + 0.015 * r})`,
              }}
            >
              {/* Century Year */}
              <div
                style={{
                  fontFamily: IDENTITY.fontSerif,
                  fontWeight: 900,
                  fontSize: 66,
                  lineHeight: 1,
                  color: !active
                    ? IDENTITY.ink
                    : item.div400
                      ? IDENTITY.verdigris
                      : IDENTITY.crimson,
                }}
              >
                {item.year}
              </div>

              {/* Mathematical Division Proof */}
              <div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 21,
                    fontWeight: 700,
                    color: IDENTITY.ink,
                    letterSpacing: '0.06em',
                  }}
                >
                  {active ? item.note : 'TAHUN ABAD BULAT (÷ 100)'}
                </div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontBody,
                    fontSize: 20,
                    fontWeight: 600,
                    color: IDENTITY.inkSoft,
                    marginTop: 4,
                  }}
                >
                  {active
                    ? `Bulan Februari: ${item.feb}`
                    : 'Menunggu uji pembagian 400'}
                </div>
              </div>

              {/* Verdict Stamp */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div
                  style={{
                    padding: '12px 22px',
                    background: !active
                      ? 'rgba(25, 23, 20, 0.08)'
                      : item.div400
                        ? IDENTITY.verdigris
                        : IDENTITY.crimson,
                    color: !active ? IDENTITY.inkMuted : '#FFFFFF',
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 21,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    opacity: active ? 0.3 + 0.7 * r : 0.65,
                  }}
                >
                  {!active
                    ? 'UJI ABAD'
                    : item.div400
                      ? '✓ TAHUN KABISAT'
                      : '✕ BUKAN KABISAT'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Head-to-Head Accuracy Plaque: 128 Tahun vs 3.236 Tahun */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 994,
          height: 298,
          background: IDENTITY.ink,
          padding: '26px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: IDENTITY.fontMono,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#F4BE44',
          }}
        >
          <span>LONJAKAN AKURASI KALENDER KITA HARI INI</span>
          <span>RATA-RATA: 365,2425 HARI</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
          }}
        >
          <div
            style={{
              padding: '18px 24px',
              background: 'rgba(255, 255, 255, 0.06)',
              borderLeft: `5px solid ${IDENTITY.crimson}`,
            }}
          >
            <div
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 18,
                fontWeight: 700,
                color: '#FF8B7B',
              }}
            >
              JULIAN LAMA (365,2500)
            </div>
            <div
              style={{
                fontFamily: IDENTITY.fontSerif,
                fontWeight: 900,
                fontSize: 42,
                color: '#F4EFE3',
                marginTop: 6,
              }}
            >
              Meleset 1 hari / 128 thn
            </div>
          </div>

          <div
            style={{
              padding: '18px 24px',
              background: 'rgba(31, 106, 84, 0.28)',
              borderLeft: '5px solid #4AD2A5',
            }}
          >
            <div
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 18,
                fontWeight: 700,
                color: '#6EF0C4',
              }}
            >
              GREGORIAN BARU (365,2425)
            </div>
            <div
              style={{
                fontFamily: IDENTITY.fontSerif,
                fontWeight: 900,
                fontSize: 42,
                color: '#FFFFFF',
                marginTop: 6,
              }}
            >
              1 hari / 3.236 thn
            </div>
          </div>
        </div>
      </div>
    </AlmanacFolioSheet>
  );
};
