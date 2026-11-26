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
// LEMBAR 07 — EFEK DOMINO DUNIA: ITALIA 1582 (10) -> INGGRIS 1752 (11) -> RUSIA 1918 (13)
// Cards:
//  7A [85.40..88.89]: "Uniknya, tidak semua negara langsung mau ikut."
//  7B [88.89..92.63]: "Inggris baru pindah tahun seribu tujuh ratus lima puluh dua"
//  7C [92.63..95.28]: "dan harus memotong sebelas hari."
//  7D [95.28..99.83]: "Rusia bahkan baru pindah tahun seribu sembilan ratus delapan belas,"
//  7E [99.83..103.86]: "sehingga terpaksa melompati tiga belas hari sekaligus."
// ============================================================================

export const Lembar07EfekDomino: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[6];

  const row1P = easeOutCubic(prog(sec, ch.start + 0.15, 88.2));
  const row2P = easeInOutCubic(prog(sec, 88.9, 94.6));
  const row3P = easeInOutCubic(prog(sec, 95.3, 102.6));

  const nations = [
    {
      country: 'ITALIA, SPANYOL & PORTUGAL',
      year: '1582',
      jump: '4 OKT  →  15 OKT 1582',
      days: 10,
      widthPct: 68,
      cause: 'Gelombang pertama sesuai dekret asli',
      color: IDENTITY.lapis,
      reveal: row1P,
    },
    {
      country: 'INGGRIS & KOLONI AMERIKA',
      year: '1752',
      jump: '2 SEP  →  14 SEP 1752',
      days: 11,
      widthPct: 79,
      cause: '+1 hari ekstra karena melewati tahun 1700',
      color: '#C46824',
      reveal: row2P,
    },
    {
      country: 'RUSIA (PASCA-REVOLUSI)',
      year: '1918',
      jump: '31 JAN  →  14 FEB 1918',
      days: 13,
      widthPct: 96,
      cause: '+3 hari ekstra karena melewati 1700, 1800, 1900',
      color: IDENTITY.crimson,
      reveal: row3P,
    },
  ];

  return (
    <AlmanacFolioSheet chapter={ch}>
      {/* Top Plate Header */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 34,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: row1P,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: IDENTITY.inkSoft,
            }}
          >
            PERBANDINGAN JUMLAH HARI YANG HARUS DIPOTONG
          </div>
          <div
            style={{
              fontFamily: IDENTITY.fontSerif,
              fontWeight: 900,
              fontSize: 38,
              color: IDENTITY.ink,
              marginTop: 4,
            }}
          >
            336 Tahun Perbedaan Kalender Antarnegara
          </div>
        </div>

        <AlmanacPlaque tone="crimson" size="sm" label="1582 – 1918" />
      </div>

      {/* Three Monumental Comparative Cutover Cards */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 146,
          height: 944,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {nations.map((nat) => {
          const r = nat.reveal;
          const shownDays = Math.round(interpolate(r, [0, 1], [0, nat.days]));
          return (
            <div
              key={nat.year}
              style={{
                flex: 1,
                background: 'rgba(248, 244, 234, 0.94)',
                border: `2.5px solid ${r > 0.1 ? IDENTITY.ink : 'rgba(25,23,20,0.25)'}`,
                padding: '24px 32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: 0.22 + 0.78 * r,
                transform: `translateY(${(1 - r) * 22}px)`,
                boxShadow:
                  r > 0.2 ? '0 14px 30px rgba(25, 23, 20, 0.11)' : 'none',
              }}
            >
              {/* Country + Year + Date Jump */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                  <span
                    style={{
                      fontFamily: IDENTITY.fontSerif,
                      fontWeight: 900,
                      fontSize: 52,
                      color: nat.color,
                      lineHeight: 1,
                    }}
                  >
                    {nat.year}
                  </span>
                  <span
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 22,
                      fontWeight: 800,
                      color: IDENTITY.ink,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {nat.country}
                  </span>
                </div>

                <span
                  style={{
                    padding: '6px 14px',
                    background: '#EFE7D6',
                    border: `1.5px solid ${IDENTITY.ink}`,
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 18,
                    fontWeight: 700,
                    color: IDENTITY.ink,
                  }}
                >
                  {nat.jump}
                </span>
              </div>

              {/* Growing Horizontal Bar (inspired by ref_indo 5.100 KM vs 4.500 KM bar!) */}
              <div>
                <div
                  style={{
                    height: 58,
                    background: '#DFD5C0',
                    border: `2px solid ${IDENTITY.ink}`,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(4, nat.widthPct * r)}%`,
                      height: '100%',
                      background: nat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: 20,
                      overflow: 'hidden',
                    }}
                  >
                    {r > 0.35 && (
                      <span
                        style={{
                          fontFamily: IDENTITY.fontMono,
                          fontSize: 23,
                          fontWeight: 800,
                          color: '#FFFFFF',
                          letterSpacing: '0.08em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        −{shownDays} HARI DIPOTONG
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    fontFamily: IDENTITY.fontBody,
                    fontSize: 20,
                    fontWeight: 600,
                    color: IDENTITY.inkSoft,
                  }}
                >
                  <span>{nat.cause}</span>
                  <span
                    style={{
                      fontFamily: IDENTITY.fontSerif,
                      fontWeight: 900,
                      fontSize: 30,
                      color: nat.color,
                    }}
                  >
                    {shownDays} HARI
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Historical Insight Note */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 1120,
          height: 172,
          background: IDENTITY.ink,
          padding: '22px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: 0.4 + 0.6 * row3P,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 19,
              fontWeight: 700,
              color: '#F4BE44',
              letterSpacing: '0.12em',
            }}
          >
            FAKTA SEJARAH TAMBAHAN
          </div>
          <div
            style={{
              fontFamily: IDENTITY.fontBody,
              fontSize: 23,
              fontWeight: 600,
              color: '#F4EFE3',
              marginTop: 6,
            }}
          >
            Revolusi Oktober Rusia (25 Okt Julian) dirayakan pada 7 November Gregorian
          </div>
        </div>

        <div
          style={{
            padding: '12px 22px',
            border: '2px solid #F4BE44',
            fontFamily: IDENTITY.fontMono,
            fontSize: 22,
            fontWeight: 800,
            color: '#F4BE44',
          }}
        >
          SELISIH +13 HARI
        </div>
      </div>
    </AlmanacFolioSheet>
  );
};

// ============================================================================
// LEMBAR 08 — JEJAK DI KALENDER DIGITAL PONSELMU + KARTU BALASAN INTERAKTIF
// Exact Folio Finale Concept of ref_indo.mp4 (Upper Plate + Lower BALASAN Box)
// Cards:
//  8A [103.94..108.93]: "Sampai hari ini, jejaknya masih tersimpan di banyak kalender digital."
//  8B [108.93..113.03]: "Coba cek Oktober seribu lima ratus delapan puluh dua di ponselmu,"
//  8C [113.03..117.12]: "apakah sepuluh tanggal itu ikut hilang? Tulis di komentar."
// ============================================================================

export const Lembar08CekPonselmu: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[7];

  const card1P = easeOutCubic(prog(sec, ch.start + 0.1, 105.6));
  const zoomP = easeInOutCubic(prog(sec, 108.9, 111.5));
  const replyTypeP = clamp01(prog(sec, 112.9, 115.6));
  const btnPulse =
    sec >= 115.5
      ? 1 + 0.04 * Math.sin(((sec - 115.5) / 0.45) * Math.PI * 2)
      : 1;

  const promptQuestion =
    'Apakah tanggal 5–14 Oktober 1582 hilang di ponselmu?';
  const typedLen = Math.round(replyTypeP * promptQuestion.length);

  // Compact Gregorian October 1582 (21 days total: Mon 1..Thu 4, Fri 15..Sun 17, then 18..31!)
  const digitalRows: readonly (readonly (number | null)[])[] = [
    [1, 2, 3, 4, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31],
  ];
  const wdays = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];

  const footerBalasan = (
    <div
      style={{
        height: 392,
        background: '#F7F2E6',
        border: `2px solid ${IDENTITY.ink}`,
        padding: 8,
        boxShadow: '0 12px 30px rgba(25, 23, 20, 0.14)',
      }}
    >
      <div
        style={{
          height: '100%',
          border: '1px solid rgba(25, 23, 20, 0.36)',
          padding: '24px 34px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
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
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '0.16em',
              color: IDENTITY.crimson,
            }}
          >
            BALASAN
          </span>
          <span
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 18,
              fontWeight: 600,
              color: IDENTITY.inkMuted,
              letterSpacing: '0.10em',
            }}
          >
            EKSPERIMEN KALENDER · 1582
          </span>
        </div>

        {/* Typed Prompt Question */}
        <div
          style={{
            fontFamily: IDENTITY.fontSerif,
            fontSize: 40,
            fontWeight: 600,
            color: IDENTITY.ink,
            minHeight: 54,
          }}
        >
          {promptQuestion.slice(0, typedLen)}
          {replyTypeP > 0.01 && replyTypeP < 0.99 ? (
            <span style={{ color: IDENTITY.crimson }}>|</span>
          ) : null}
        </div>

        {/* Dotted Answer Line + TULIS DI KOMENTAR Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 28,
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: IDENTITY.inkSoft,
                whiteSpace: 'nowrap',
              }}
            >
              DI PONSELMU:
            </span>
            <div
              style={{
                flex: 1,
                borderBottom: '2.5px dotted rgba(25, 23, 20, 0.45)',
                height: 24,
              }}
            />
          </div>

          <div
            style={{
              padding: '15px 28px',
              background: IDENTITY.crimson,
              color: '#FFF8F2',
              fontFamily: IDENTITY.fontMono,
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: '0.12em',
              transform: `scale(${btnPulse})`,
              boxShadow: '0 8px 20px rgba(188, 52, 40, 0.32)',
            }}
          >
            TULIS DI KOMENTAR
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AlmanacFolioSheet chapter={ch} plateHeight={946} footerSlot={footerBalasan}>
      {/* Upper Digital System Calendar Plate (21-Day October 1582!) */}
      <div
        style={{
          position: 'absolute',
          left: 42,
          right: 42,
          top: 30,
          bottom: 30,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          opacity: card1P,
        }}
      >
        {/* Top Digital Device Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <AlmanacPlaque
            tone="ink"
            size="md"
            label="KALENDER DIGITAL · OKTOBER 1582"
          />
          <AlmanacPlaque
            tone="crimson"
            size="sm"
            label="TOTAL HANYA 21 HARI!"
          />
        </div>

        {/* Clean 3-Row Official October 1582 Calendar View (4 Jumps Directly to 15!) */}
        <div
          style={{
            position: 'relative',
            background: '#F9F6EE',
            border: `2.5px solid ${IDENTITY.ink}`,
            boxShadow: '0 16px 38px rgba(25, 23, 20, 0.14)',
          }}
        >
          {/* Weekday Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              height: 66,
              background: IDENTITY.ink,
            }}
          >
            {wdays.map((w, idx) => (
              <div
                key={w}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: idx === 3 || idx === 4 ? '#F4BE44' : '#F4EFE3',
                }}
              >
                {w}
              </div>
            ))}
          </div>

          {/* 3 Compact Rows of October 1582 */}
          {digitalRows.map((row, rIdx) => (
            <div
              key={rIdx}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                height: 172,
                borderTop: '1.5px solid rgba(25, 23, 20, 0.18)',
              }}
            >
              {row.map((d, cIdx) => {
                const isJumpPair = rIdx === 0 && (d === 4 || d === 15);
                return (
                  <div
                    key={cIdx}
                    style={{
                      position: 'relative',
                      borderRight:
                        cIdx < 6 ? '1.5px solid rgba(25, 23, 20, 0.16)' : 'none',
                      background: isJumpPair
                        ? d === 4
                          ? 'rgba(33, 78, 120, 0.13)'
                          : 'rgba(188, 52, 40, 0.16)'
                        : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: IDENTITY.fontSerif,
                        fontWeight: 900,
                        fontSize: isJumpPair ? 68 : 54,
                        lineHeight: 1,
                        color:
                          d === 15
                            ? IDENTITY.crimson
                            : d === 4
                              ? IDENTITY.lapis
                              : IDENTITY.ink,
                      }}
                    >
                      {d}
                    </span>

                    {d === 4 && (
                      <span
                        style={{
                          marginTop: 8,
                          fontFamily: IDENTITY.fontMono,
                          fontSize: 15,
                          fontWeight: 800,
                          color: IDENTITY.lapis,
                        }}
                      >
                        KAMIS
                      </span>
                    )}
                    {d === 15 && (
                      <span
                        style={{
                          marginTop: 8,
                          fontFamily: IDENTITY.fontMono,
                          fontSize: 15,
                          fontWeight: 800,
                          color: IDENTITY.crimson,
                        }}
                      >
                        LANGSUNG 15!
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Animated Magnifying Highlight Frame over KAM 4 | JUM 15 */}
          {zoomP > 0.05 && (
            <div
              style={{
                position: 'absolute',
                left: `${(3 / 7) * 100 - 1.2}%`,
                top: 56,
                width: `${(2 / 7) * 100 + 2.4}%`,
                height: 192,
                border: `5px solid ${IDENTITY.crimson}`,
                borderRadius: 14,
                boxShadow: '0 16px 36px rgba(188, 52, 40, 0.30)',
                pointerEvents: 'none',
                opacity: zoomP,
                transform: `scale(${1.06 - 0.06 * zoomP})`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: -24,
                  transform: 'translateX(-50%)',
                  padding: '6px 16px',
                  background: IDENTITY.crimson,
                  color: '#FFF8F2',
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                5 – 14 OKTOBER HILANG!
              </div>
            </div>
          )}
        </div>

        {/* Bottom Caption Bar inside Plate */}
        <div
          style={{
            height: 78,
            background: '#EFE7D6',
            border: `2px solid ${IDENTITY.ink}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            fontFamily: IDENTITY.fontMono,
            fontSize: 19,
            fontWeight: 700,
            color: IDENTITY.ink,
          }}
        >
          <span>iOS / macOS (NSCalendar): 4 → 15 OKT</span>
          <span style={{ color: IDENTITY.lapis }}>
            KALENDER PROLEPTIK: TETAP MUNCUL
          </span>
        </div>
      </div>
    </AlmanacFolioSheet>
  );
};
