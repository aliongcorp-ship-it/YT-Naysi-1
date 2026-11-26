import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  CHAPTERS,
  ChapterSpec,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  prog,
} from './script';

// ============================================================================
// FOLIO GEOMETRY & SHARED RENAISSANCE ASTRONOMICAL ALMANAC INSTRUMENTS
// ============================================================================

export const FOLIO_LAYOUT = {
  left: 42,
  top: 96,
  width: 1356,
  height: 1738,
  plateMarginX: 46,
  plateTop: 316,
  plateWidth: 1264,
  plateHeight: 1368,
} as const;

export interface AlmanacFolioSheetProps {
  readonly chapter: ChapterSpec;
  readonly plateHeight?: number;
  readonly footerSlot?: React.ReactNode;
  readonly children: React.ReactNode;
}

/**
 * Physical Cotton-Rag Vellum Folio Sheet ("LEMBAR 01..08")
 * Modeled on the Naysi Folio architecture with bespoke Horological & Ecliptic
 * 365-degree vernier border, quadrant fold creases, and iron-gall typography.
 */
export const AlmanacFolioSheet: React.FC<AlmanacFolioSheetProps> = ({
  chapter,
  plateHeight = FOLIO_LAYOUT.plateHeight,
  footerSlot,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const localSec = Math.max(0, sec - chapter.start);

  const headReveal = spring({
    frame: Math.max(0, Math.round(localSec * fps) - 3),
    fps,
    config: { damping: 24, stiffness: 170, mass: 0.8 },
  });

  const [line1, line2] = chapter.headLines;

  // Generate perimeter alternating vernier blocks around the inner plate frame
  const borderBand = 15;
  const innerW = FOLIO_LAYOUT.plateWidth;
  const innerH = plateHeight;
  const segLen = 36;
  const topCount = Math.floor(innerW / segLen);
  const sideCount = Math.floor(innerH / segLen);

  return (
    <div
      style={{
        position: 'absolute',
        left: FOLIO_LAYOUT.left,
        top: FOLIO_LAYOUT.top,
        width: FOLIO_LAYOUT.width,
        height: FOLIO_LAYOUT.height,
      }}
    >
      {/* Underlying Stacked Archival Folio Edges (Physical Stack Depth) */}
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: 16,
          width: FOLIO_LAYOUT.width,
          height: FOLIO_LAYOUT.height,
          borderRadius: 6,
          background: '#BDB29C',
          boxShadow: '0 46px 110px rgba(0, 0, 0, 0.82)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 7,
          top: 8,
          width: FOLIO_LAYOUT.width,
          height: FOLIO_LAYOUT.height,
          borderRadius: 6,
          background: '#CFC4AE',
          border: '1px solid rgba(25, 23, 20, 0.28)',
        }}
      />

      {/* Primary Cotton-Rag Vellum Folio Card */}
      <div
        style={{
          position: 'relative',
          width: FOLIO_LAYOUT.width,
          height: FOLIO_LAYOUT.height,
          borderRadius: 6,
          overflow: 'hidden',
          background: `linear-gradient(168deg, ${IDENTITY.vellumTop} 0%, ${IDENTITY.vellumMid} 54%, ${IDENTITY.vellumDeep} 100%)`,
          border: '1.5px solid rgba(25, 23, 20, 0.42)',
          boxShadow:
            'inset 0 0 90px rgba(138, 114, 76, 0.18), 0 18px 44px rgba(0, 0, 0, 0.48)',
        }}
      >
        {/* Subtle Paper Aging Vignette & Warm Edge Toning */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(120% 95% at 50% 48%, rgba(255,255,255,0) 58%, rgba(122, 98, 62, 0.16) 100%)',
          }}
        />

        {/* Authentic Archival Quadrant Fold Creases (Vertical + Horizontal) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 2,
            background:
              'linear-gradient(90deg, rgba(25,23,20,0.09) 0%, rgba(255,255,255,0.45) 100%)',
            pointerEvents: 'none',
            zIndex: 30,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '53.5%',
            height: 2,
            background:
              'linear-gradient(180deg, rgba(25,23,20,0.08) 0%, rgba(255,255,255,0.42) 100%)',
            pointerEvents: 'none',
            zIndex: 30,
          }}
        />

        {/* Micro Paper Fiber Specks (Deterministic SVG Vector Texture) */}
        <svg
          width={FOLIO_LAYOUT.width}
          height={FOLIO_LAYOUT.height}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.26, zIndex: 2 }}
        >
          {Array.from({ length: 44 }).map((_, idx) => {
            const px = ((idx * 317 + 89) % (FOLIO_LAYOUT.width - 60)) + 30;
            const py = ((idx * 523 + 143) % (FOLIO_LAYOUT.height - 60)) + 30;
            const r = idx % 3 === 0 ? 1.8 : 1.1;
            return (
              <circle
                key={idx}
                cx={px}
                cy={py}
                r={r}
                fill={idx % 2 === 0 ? '#6E5D44' : '#9A876A'}
                opacity={0.45}
              />
            );
          })}
        </svg>

        {/* ================================================================ */}
        {/* TOP EDITORIAL ALMANAC HEADER                                     */}
        {/* ================================================================ */}
        <div
          style={{
            position: 'relative',
            padding: '38px 50px 0 50px',
            zIndex: 10,
            opacity: interpolate(headReveal, [0, 1], [0.25, 1]),
            transform: `translateY(${interpolate(headReveal, [0, 1], [10, 0])}px)`,
          }}
        >
          {/* Eyebrow Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '0.16em',
                color: IDENTITY.crimson,
                textTransform: 'uppercase',
              }}
            >
              {chapter.eyebrow}
            </div>
            <div
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: IDENTITY.inkMuted,
              }}
            >
              FOLIO · MDLXXXII
            </div>
          </div>

          {/* 2-Line Monumental Fraunces Headline */}
          <div
            style={{
              fontFamily: IDENTITY.fontSerif,
              fontSize: 74,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: '-0.026em',
              color: IDENTITY.ink,
            }}
          >
            <div>
              {line1[0]}
              {line1[1] ? (
                <span style={{ color: IDENTITY.crimson }}>{line1[1]}</span>
              ) : null}
              {line1[2]}
            </div>
            <div>
              {line2[0]}
              {line2[1] ? (
                <span style={{ color: IDENTITY.crimson }}>{line2[1]}</span>
              ) : null}
              {line2[2]}
            </div>
          </div>

          {/* Latin Astronomical Subtitle */}
          <div
            style={{
              marginTop: 10,
              fontFamily: IDENTITY.fontSerif,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 25,
              color: IDENTITY.inkSoft,
              letterSpacing: '0.01em',
            }}
          >
            {chapter.latin}
          </div>

          {/* Double Engraving Rule */}
          <div style={{ marginTop: 16 }}>
            <div style={{ height: 2.5, background: IDENTITY.ink, opacity: 0.84 }} />
            <div style={{ height: 4 }} />
            <div style={{ height: 1, background: IDENTITY.ink, opacity: 0.42 }} />
          </div>
        </div>

        {/* ================================================================ */}
        {/* FRAMED ECLIPTIC VERNIER PLATE WINDOW                             */}
        {/* ================================================================ */}
        <div
          style={{
            position: 'absolute',
            left: FOLIO_LAYOUT.plateMarginX,
            top: FOLIO_LAYOUT.plateTop,
            width: innerW,
            height: innerH,
            zIndex: 10,
          }}
        >
          {/* Outer Ecliptic Vernier Scale Border */}
          <svg
            width={innerW}
            height={innerH}
            style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}
          >
            {/* Outer & Inner crisp stroke */}
            <rect
              x={0.75}
              y={0.75}
              width={innerW - 1.5}
              height={innerH - 1.5}
              fill="none"
              stroke={IDENTITY.ink}
              strokeWidth={2}
            />
            <rect
              x={borderBand}
              y={borderBand}
              width={innerW - borderBand * 2}
              height={innerH - borderBand * 2}
              fill="none"
              stroke={IDENTITY.ink}
              strokeWidth={1.6}
            />

            {/* Top & Bottom Alternating Degree Segments */}
            {Array.from({ length: topCount }).map((_, i) => {
              const x = borderBand + i * segLen;
              const w = Math.min(segLen, innerW - borderBand - x);
              if (w <= 0) return null;
              const dark = i % 2 === 0;
              return (
                <React.Fragment key={`tb-${i}`}>
                  <rect
                    x={x}
                    y={1.5}
                    width={w}
                    height={borderBand - 2}
                    fill={dark ? IDENTITY.ink : IDENTITY.vellumTop}
                  />
                  <rect
                    x={x}
                    y={innerH - borderBand + 0.5}
                    width={w}
                    height={borderBand - 2}
                    fill={dark ? IDENTITY.ink : IDENTITY.vellumTop}
                  />
                </React.Fragment>
              );
            })}

            {/* Left & Right Alternating Degree Segments */}
            {Array.from({ length: sideCount }).map((_, i) => {
              const y = borderBand + i * segLen;
              const h = Math.min(segLen, innerH - borderBand - y);
              if (h <= 0) return null;
              const dark = i % 2 === 1;
              return (
                <React.Fragment key={`lr-${i}`}>
                  <rect
                    x={1.5}
                    y={y}
                    width={borderBand - 2}
                    height={h}
                    fill={dark ? IDENTITY.ink : IDENTITY.vellumTop}
                  />
                  <rect
                    x={innerW - borderBand + 0.5}
                    y={y}
                    width={borderBand - 2}
                    height={h}
                    fill={dark ? IDENTITY.ink : IDENTITY.vellumTop}
                  />
                </React.Fragment>
              );
            })}

            {/* Four Corner Astrolabe Brass Squares */}
            {[
              [0.75, 0.75],
              [innerW - borderBand, 0.75],
              [0.75, innerH - borderBand],
              [innerW - borderBand, innerH - borderBand],
            ].map(([cx, cy], idx) => (
              <g key={`corner-${idx}`}>
                <rect
                  x={cx}
                  y={cy}
                  width={borderBand - 0.75}
                  height={borderBand - 0.75}
                  fill={IDENTITY.crimson}
                />
                <circle
                  cx={cx + borderBand * 0.48}
                  cy={cy + borderBand * 0.48}
                  r={2.6}
                  fill={IDENTITY.vellumTop}
                />
              </g>
            ))}
          </svg>

          {/* Inner Plate Viewport */}
          <div
            style={{
              position: 'absolute',
              left: borderBand,
              top: borderBand,
              width: innerW - borderBand * 2,
              height: innerH - borderBand * 2,
              overflow: 'hidden',
              background: `linear-gradient(180deg, ${IDENTITY.plateBg} 0%, ${IDENTITY.plateTint} 100%)`,
            }}
          >
            {/* Subtle Engraved Celestial Coordinate Grid */}
            <svg
              width={innerW - borderBand * 2}
              height={innerH - borderBand * 2}
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {Array.from({ length: 11 }).map((_, idx) => {
                const gx = ((idx + 1) * (innerW - borderBand * 2)) / 12;
                return (
                  <line
                    key={`vx-${idx}`}
                    x1={gx}
                    y1={0}
                    x2={gx}
                    y2={innerH - borderBand * 2}
                    stroke="rgba(33, 78, 120, 0.085)"
                    strokeWidth={1}
                  />
                );
              })}
              {Array.from({ length: 11 }).map((_, idx) => {
                const gy = ((idx + 1) * (innerH - borderBand * 2)) / 12;
                return (
                  <line
                    key={`hy-${idx}`}
                    x1={0}
                    y1={gy}
                    x2={innerW - borderBand * 2}
                    y2={gy}
                    stroke="rgba(33, 78, 120, 0.085)"
                    strokeWidth={1}
                  />
                );
              })}
              {/* Subtle Celestial Meridian Arc */}
              <circle
                cx={(innerW - borderBand * 2) * 0.5}
                cy={(innerH - borderBand * 2) * 0.5}
                r={520}
                fill="none"
                stroke="rgba(25, 23, 20, 0.055)"
                strokeWidth={1.2}
                strokeDasharray="6 8"
              />
            </svg>

            {/* Scene Plate Children */}
            {children}
          </div>
        </div>

        {/* Optional Lower Folio Slot (used in Lembar 08 for BALASAN Reply Box) */}
        {footerSlot ? (
          <div
            style={{
              position: 'absolute',
              left: FOLIO_LAYOUT.plateMarginX,
              top: FOLIO_LAYOUT.plateTop + plateHeight + 22,
              width: FOLIO_LAYOUT.plateWidth,
              zIndex: 12,
            }}
          >
            {footerSlot}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ============================================================================
// REUSABLE ARCHIVAL CALLOUT BADGES & HOROLOGICAL INSTRUMENTS
// ============================================================================

export interface AlmanacPlaqueProps {
  readonly label: string;
  readonly tone?: 'ink' | 'crimson' | 'lapis' | 'verdigris' | 'vellum';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly style?: React.CSSProperties;
}

export const AlmanacPlaque: React.FC<AlmanacPlaqueProps> = ({
  label,
  tone = 'vellum',
  size = 'md',
  style,
}) => {
  const palette = {
    vellum: {
      bg: '#F6F1E6',
      border: IDENTITY.ink,
      text: IDENTITY.ink,
    },
    crimson: {
      bg: '#FDF3F1',
      border: IDENTITY.crimson,
      text: IDENTITY.crimson,
    },
    lapis: {
      bg: '#EEF4FA',
      border: IDENTITY.lapis,
      text: IDENTITY.lapis,
    },
    verdigris: {
      bg: '#EDF7F3',
      border: IDENTITY.verdigris,
      text: IDENTITY.verdigris,
    },
    ink: {
      bg: IDENTITY.ink,
      border: IDENTITY.ink,
      text: '#F6F1E6',
    },
  }[tone];

  const pad =
    size === 'sm' ? '7px 14px' : size === 'lg' ? '13px 24px' : '9px 18px';
  const fs = size === 'sm' ? 19 : size === 'lg' ? 26 : 22;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: pad,
        background: palette.bg,
        border: `2px solid ${palette.border}`,
        boxShadow: '0 6px 16px rgba(25, 23, 20, 0.14)',
        fontFamily: IDENTITY.fontMono,
        fontSize: fs,
        fontWeight: 700,
        letterSpacing: '0.10em',
        color: palette.text,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {label}
    </div>
  );
};

export const EngravedCompassRose: React.FC<{
  readonly size?: number;
  readonly rotationDeg?: number;
}> = ({ size = 128, rotationDeg = 0 }) => {
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: `rotate(${rotationDeg}deg)` }}
    >
      <circle
        cx={r}
        cy={r}
        r={r - 3}
        fill="rgba(244, 239, 227, 0.88)"
        stroke={IDENTITY.ink}
        strokeWidth={1.8}
      />
      <circle
        cx={r}
        cy={r}
        r={r - 11}
        fill="none"
        stroke={IDENTITY.ink}
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const major = deg % 90 === 0;
        const len = major ? r - 14 : r - 24;
        return (
          <g key={deg} transform={`translate(${r}, ${r}) rotate(${deg})`}>
            <polygon
              points={`0,${-len} 6,0 0,-6`}
              fill={deg === 0 ? IDENTITY.crimson : IDENTITY.ink}
            />
            <polygon
              points={`0,${-len} -6,0 0,-6`}
              fill={deg === 0 ? '#E88B7E' : '#9B907E'}
            />
          </g>
        );
      })}
      <circle cx={r} cy={r} r={5} fill={IDENTITY.brass} stroke={IDENTITY.ink} strokeWidth={1.4} />
    </svg>
  );
};

// ============================================================================
// LEMBAR 01 — OKTOBER 1582: 10 HARI DIHAPUS DARI KALENDER DUNIA
// Cards:
//  1A [0.04..3.23]: "Pada Oktober seribu lima ratus delapan puluh dua,"
//  1B [3.23..6.94]: "sepuluh hari dihapus begitu saja dari kalender."
//  1C [6.94..9.48]: "Orang tidur pada Kamis empat Oktober,"
//  1D [9.48..13.95]: "lalu bangun besok paginya langsung Jumat lima belas Oktober."
// ============================================================================

interface OctCellSpec {
  readonly col: number; // 0 = SEN .. 6 = MIN
  readonly row: number; // 0..4
  readonly originalDay: number; // 1..31 in un-cut layout, or Gregorian layout
}

export const Lembar01Oktober1582: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[0];

  const card1P = easeOutCubic(prog(sec, ch.start + 0.1, 1.35));
  // Erase phase triggered right on "sepuluh hari dihapus" (3.29s -> 5.5s)
  const eraseP = easeInOutCubic(prog(sec, 3.28, 5.55));
  // Collapse & shift phase: show both 1..4, 5..14 crossed out, and 15..31 clearly!
  // Keeping a full 31-slot historical audit calendar where 5..14 are struck out in red
  // and an arched trajectory leaps from KAMIS 4 directly to JUMAT 15!
  // Wait: let's check real weekdays!
  // Monday Oct 1, Tuesday Oct 2, Wednesday Oct 3, Thursday Oct 4!
  // Then 5..14 were erased, and the VERY NEXT DAY was Friday Oct 15!
  // Look how brilliantly we can show BOTH truths on one crystal-clear calendar:
  // Upper Main Calendar ("TABEL KALENDER OKTOBER 1582"):
  // Before 5.6s: 31-date Julian grid (Oct 1=Sen, 2=Sel, 3=Rab, 4=Kam, 5=Jum..14=Min, 15=Sen? No, in Julian 14 is Sun, 15 is Mon; when 10 days were skipped, Oct 15 was placed right on FRIDAY col 4!).
  // Even clearer & 100% historically exact:
  // Show the 5-row x 7-col Calendar Grid where:
  // - Row 0: SEN 1 | SEL 2 | RAB 3 | KAM 4 | [5–14 DIHAPUS -> JUM 15!]
  // Let's display TWO synchronized visual zones inside the plate so EVERY viewer grasps it in 0.5 seconds:
  //   ZONE A (Top, y=34..810): Full 31-Date Historical Calendar Sheet of OKTOBER 1582 showing all numbers 1..31:
  //     - Dates 1, 2, 3, 4 in crisp Iron-Gall Ink (Mon-Thu)
  //     - Dates 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 in Crimson Dashed Crossed-Out Cells ("DIHAPUS")
  //     - Dates 15..31 in Verdigris/Lapis Ink ("BERLAKU MULAI JUMAT 15 OKT")
  //   ZONE B (Bottom, y=840..1290): Magnified Day-to-Day Transition Strip ("MALAM PERGANTIAN · 4 → 15 OKTOBER"):
  //     - Left Card: [KAMIS · 4 OKTOBER 1582 · MALAM TIDUR ☾]
  //     - Center Leap Bridge: [+10 TANGGAL DIHAPUS — LANGSUNG BESOK PAGI]
  //     - Right Card: [JUMAT · 15 OKTOBER 1582 · BANGUN PAGI ☀]

  const sleepP = easeOutCubic(prog(sec, 6.95, 8.2));
  const wakeP = easeOutCubic(prog(sec, 9.52, 11.4));
  const leapArcP = easeInOutCubic(prog(sec, 9.65, 11.9));

  const dayHeaders = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];

  // 31 dates arranged starting Monday (col 0) so 1=SEN, 2=SEL, 3=RAB, 4=KAM,
  // 5..14 occupy 10 consecutive cells (struck out in Crimson!), and 15..31 follow!
  // And on each date >=15 we display its new official Gregorian weekday tag on wakeP!
  const gregWeekdayFor = (d: number): string => {
    // Oct 15, 1582 = Friday (index 4)
    const idx = (4 + (d - 15)) % 7;
    return dayHeaders[(idx + 7) % 7];
  };

  return (
    <AlmanacFolioSheet chapter={ch}>
      {/* Top Plate Banner */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: card1P,
          transform: `translateY(${(1 - card1P) * 14}px)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 16,
              height: 16,
              background: IDENTITY.crimson,
              transform: 'rotate(45deg)',
            }}
          />
          <span
            style={{
              fontFamily: IDENTITY.fontSerif,
              fontWeight: 900,
              fontSize: 38,
              color: IDENTITY.ink,
              letterSpacing: '0.02em',
            }}
          >
            OKTOBER 1582
          </span>
        </div>

        <AlmanacPlaque
          tone={eraseP > 0.45 ? 'crimson' : 'vellum'}
          size="sm"
          label={
            eraseP > 0.45
              ? '10 TANGGAL DIHAPUS (5–14 OKT)'
              : 'ARSIP KALENDER EROPA'
          }
        />
      </div>

      {/* ================================================================== */}
      {/* ZONE A: 31-DATE HISTORICAL AUDIT GRID                              */}
      {/* ================================================================== */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 104,
          height: 696,
          background: 'rgba(248, 244, 234, 0.92)',
          border: `2px solid ${IDENTITY.ink}`,
          boxShadow: '0 14px 34px rgba(25, 23, 20, 0.11)',
          opacity: card1P,
        }}
      >
        {/* Weekday Column Header Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            height: 62,
            background: IDENTITY.ink,
            borderBottom: `2px solid ${IDENTITY.ink}`,
          }}
        >
          {dayHeaders.map((dh, idx) => (
            <div
              key={dh}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: IDENTITY.fontMono,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: idx === 3 || idx === 4 ? '#F4BE44' : '#F4EFE3',
                borderRight:
                  idx < 6 ? '1px solid rgba(244, 239, 227, 0.16)' : 'none',
              }}
            >
              {dh}
            </div>
          ))}
        </div>

        {/* 5 Rows × 7 Columns Date Cells */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridTemplateRows: 'repeat(5, 1fr)',
            height: 634,
          }}
        >
          {Array.from({ length: 35 }).map((_, cellIdx) => {
            const dateNum = cellIdx + 1;
            const valid = dateNum <= 31;
            const isDeleted = dateNum >= 5 && dateNum <= 14;
            const isOct4 = dateNum === 4;
            const isOct15 = dateNum === 15;

            // Staggered strike-through across dates 5..14
            const delIdx = dateNum - 5;
            const cellErase = isDeleted
              ? clamp01((eraseP - delIdx * 0.055) / 0.42)
              : 0;

            let bg = 'transparent';
            if (!valid) {
              bg = 'rgba(25, 23, 20, 0.04)';
            } else if (isDeleted && cellErase > 0.02) {
              bg = `rgba(188, 52, 40, ${0.06 + 0.10 * cellErase})`;
            } else if (isOct4 && sleepP > 0.05) {
              bg = `rgba(33, 78, 120, ${0.18 * sleepP})`;
            } else if (isOct15 && wakeP > 0.05) {
              bg = `rgba(31, 106, 84, ${0.20 * wakeP})`;
            }

            return (
              <div
                key={cellIdx}
                style={{
                  position: 'relative',
                  borderRight:
                    cellIdx % 7 < 6
                      ? '1.2px solid rgba(25, 23, 20, 0.16)'
                      : 'none',
                  borderBottom:
                    cellIdx < 28
                      ? '1.2px solid rgba(25, 23, 20, 0.16)'
                      : 'none',
                  background: bg,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {valid ? (
                  <>
                    {/* Highlight ring on Oct 4 & Oct 15 */}
                    {isOct4 && sleepP > 0.02 && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 6,
                          border: `3px solid ${IDENTITY.lapis}`,
                          opacity: sleepP,
                        }}
                      />
                    )}
                    {isOct15 && wakeP > 0.02 && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 6,
                          border: `3px solid ${IDENTITY.verdigris}`,
                          opacity: wakeP,
                        }}
                      />
                    )}

                    {/* Date Number */}
                    <div
                      style={{
                        fontFamily: IDENTITY.fontSerif,
                        fontWeight: 900,
                        fontSize: isOct4 || isOct15 ? 52 : 44,
                        lineHeight: 1,
                        color: isDeleted
                          ? cellErase > 0.3
                            ? 'rgba(188, 52, 40, 0.42)'
                            : IDENTITY.ink
                          : isOct4 && sleepP > 0.2
                            ? IDENTITY.lapis
                            : isOct15 && wakeP > 0.2
                              ? IDENTITY.verdigris
                              : IDENTITY.ink,
                        transform: isDeleted
                          ? `scale(${1 - 0.1 * cellErase})`
                          : 'none',
                      }}
                    >
                      {dateNum}
                    </div>

                    {/* Small Sub-Label inside key cells */}
                    {isOct4 && sleepP > 0.15 && (
                      <div
                        style={{
                          marginTop: 5,
                          fontFamily: IDENTITY.fontMono,
                          fontSize: 15,
                          fontWeight: 700,
                          color: IDENTITY.lapis,
                          letterSpacing: '0.06em',
                          opacity: sleepP,
                        }}
                      >
                        KAM · TIDUR
                      </div>
                    )}
                    {isOct15 && wakeP > 0.15 && (
                      <div
                        style={{
                          marginTop: 5,
                          fontFamily: IDENTITY.fontMono,
                          fontSize: 15,
                          fontWeight: 700,
                          color: IDENTITY.verdigris,
                          letterSpacing: '0.06em',
                          opacity: wakeP,
                        }}
                      >
                        JUM · BANGUN
                      </div>
                    )}
                    {!isDeleted && dateNum > 15 && wakeP > 0.45 && (
                      <div
                        style={{
                          marginTop: 4,
                          fontFamily: IDENTITY.fontMono,
                          fontSize: 13,
                          fontWeight: 600,
                          color: IDENTITY.inkMuted,
                          opacity: (wakeP - 0.45) / 0.55,
                        }}
                      >
                        {gregWeekdayFor(dateNum)}
                      </div>
                    )}

                    {/* Animated Crimson Diagonal Cross-Out on Deleted Dates 5..14 */}
                    {isDeleted && cellErase > 0.02 && (
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                      >
                        <line
                          x1={14}
                          y1={16}
                          x2={14 + 72 * cellErase}
                          y2={16 + 68 * cellErase}
                          stroke={IDENTITY.crimson}
                          strokeWidth={4.2}
                          strokeLinecap="round"
                        />
                        {cellErase > 0.45 && (
                          <line
                            x1={86}
                            y1={16}
                            x2={86 - 72 * ((cellErase - 0.45) / 0.55)}
                            y2={16 + 68 * ((cellErase - 0.45) / 0.55)}
                            stroke={IDENTITY.crimson}
                            strokeWidth={4.2}
                            strokeLinecap="round"
                          />
                        )}
                      </svg>
                    )}
                  </>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* SVG Trajectory Leap Arrow from Cell 4 (row 0, col 3) to Cell 15 (row 2, col 0) */}
        {leapArcP > 0.02 && (
          <svg
            width={1146}
            height={634}
            style={{ position: 'absolute', left: 0, top: 62, pointerEvents: 'none' }}
          >
            <defs>
              <marker
                id="octLeapArrow"
                markerWidth="12"
                markerHeight="12"
                refX="9"
                refY="6"
                orient="auto"
              >
                <path d="M0,1 L10,6 L0,11 Z" fill={IDENTITY.crimson} />
              </marker>
            </defs>
            <path
              d="M 642 62 C 742 135, 390 250, 112 305"
              fill="none"
              stroke={IDENTITY.crimson}
              strokeWidth={5.5}
              strokeDasharray={760}
              strokeDashoffset={760 * (1 - leapArcP)}
              markerEnd="url(#octLeapArrow)"
            />
          </svg>
        )}
      </div>

      {/* ================================================================== */}
      {/* ZONE B: OVERNIGHT CHRONOLOGY JUMP (KAMIS 4 OKT -> JUMAT 15 OKT)    */}
      {/* ================================================================== */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 834,
          height: 458,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Overnight Comparison Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 164px 1fr',
            alignItems: 'center',
            gap: 14,
            height: 334,
          }}
        >
          {/* Left Card: KAMIS 4 OKTOBER (TIDUR) */}
          <div
            style={{
              height: '100%',
              background: '#F7F3E8',
              border: `2.5px solid ${sleepP > 0.1 ? IDENTITY.lapis : 'rgba(25,23,20,0.28)'}`,
              boxShadow: '0 12px 28px rgba(25, 23, 20, 0.10)',
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: 0.32 + 0.68 * sleepP,
              transform: `translateY(${(1 - sleepP) * 18}px)`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: IDENTITY.lapis,
                }}
              >
                MALAM SEBELUMNYA
              </span>
              {/* Crescent Moon SVG */}
              <svg width={34} height={34} viewBox="0 0 34 34">
                <path
                  d="M22 5 A12 12 0 1 0 29 23 A9.5 9.5 0 1 1 22 5 Z"
                  fill={IDENTITY.lapis}
                />
              </svg>
            </div>

            <div>
              <div
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 22,
                  fontWeight: 700,
                  color: IDENTITY.inkSoft,
                  letterSpacing: '0.08em',
                }}
              >
                HARI KAMIS
              </div>
              <div
                style={{
                  fontFamily: IDENTITY.fontSerif,
                  fontWeight: 900,
                  fontSize: 82,
                  lineHeight: 0.96,
                  color: IDENTITY.ink,
                  marginTop: 4,
                }}
              >
                4 Okt
              </div>
            </div>

            <div
              style={{
                padding: '8px 12px',
                background: IDENTITY.lapisSoft,
                fontFamily: IDENTITY.fontMono,
                fontSize: 18,
                fontWeight: 700,
                color: IDENTITY.lapis,
                letterSpacing: '0.06em',
              }}
            >
              KALENDER JULIAN TERAKHIR
            </div>
          </div>

          {/* Center Bridge: 10 DAYS SKIPPED */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              opacity: Math.max(eraseP * 0.6, leapArcP),
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                background: IDENTITY.crimson,
                color: '#FFF8F2',
                fontFamily: IDENTITY.fontMono,
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textAlign: 'center',
              }}
            >
              LOMPAT
              <br />
              +10 HARI
            </div>
            <svg width={132} height={42} viewBox="0 0 132 42">
              <line
                x1={6}
                y1={21}
                x2={108 * Math.max(0.2, leapArcP)}
                y2={21}
                stroke={IDENTITY.crimson}
                strokeWidth={5}
              />
              <polygon points="104,9 128,21 104,33" fill={IDENTITY.crimson} />
            </svg>
            <div
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 16,
                fontWeight: 700,
                color: IDENTITY.inkSoft,
                textAlign: 'center',
              }}
            >
              BESOK PAGI
            </div>
          </div>

          {/* Right Card: JUMAT 15 OKTOBER (BANGUN) */}
          <div
            style={{
              height: '100%',
              background: '#F7F3E8',
              border: `2.5px solid ${wakeP > 0.1 ? IDENTITY.verdigris : 'rgba(25,23,20,0.28)'}`,
              boxShadow: '0 12px 28px rgba(25, 23, 20, 0.10)',
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: 0.24 + 0.76 * wakeP,
              transform: `translateY(${(1 - wakeP) * 18}px)`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: IDENTITY.verdigris,
                }}
              >
                KEESOKAN PAGINYA
              </span>
              {/* Engraved Sun Icon */}
              <svg width={36} height={36} viewBox="0 0 36 36">
                <circle cx={18} cy={18} r={8} fill={IDENTITY.brass} />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                  <line
                    key={a}
                    x1={18 + Math.cos((a * Math.PI) / 180) * 11}
                    y1={18 + Math.sin((a * Math.PI) / 180) * 11}
                    x2={18 + Math.cos((a * Math.PI) / 180) * 16}
                    y2={18 + Math.sin((a * Math.PI) / 180) * 16}
                    stroke={IDENTITY.brass}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                ))}
              </svg>
            </div>

            <div>
              <div
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 22,
                  fontWeight: 700,
                  color: IDENTITY.inkSoft,
                  letterSpacing: '0.08em',
                }}
              >
                HARI JUMAT
              </div>
              <div
                style={{
                  fontFamily: IDENTITY.fontSerif,
                  fontWeight: 900,
                  fontSize: 82,
                  lineHeight: 0.96,
                  color: IDENTITY.crimson,
                  marginTop: 4,
                }}
              >
                15 Okt
              </div>
            </div>

            <div
              style={{
                padding: '8px 12px',
                background: IDENTITY.verdigrisSoft,
                fontFamily: IDENTITY.fontMono,
                fontSize: 18,
                fontWeight: 700,
                color: IDENTITY.verdigris,
                letterSpacing: '0.06em',
              }}
            >
              HARI KE-1 KALENDER BARU
            </div>
          </div>
        </div>

        {/* Bottom Ledger Bar */}
        <div
          style={{
            height: 86,
            background: IDENTITY.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 30px',
            opacity: 0.55 + 0.45 * eraseP,
          }}
        >
          <span
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: '0.10em',
              color: '#F4EFE3',
            }}
          >
            CATATAN SEJARAH · 5 S.D. 14 OKTOBER 1582
          </span>
          <span
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 23,
              fontWeight: 800,
              letterSpacing: '0.10em',
              color: '#F4BE44',
            }}
          >
            0 KELAHIRAN · 0 PERISTIWA (TIDAK PERNAH ADA)
          </span>
        </div>
      </div>
    </AlmanacFolioSheet>
  );
};

// ============================================================================
// LEMBAR 02 — KALENDER JULIAN BUATAN JULIUS CAESAR (45 SM · 365,25 HARI)
// Cards:
//  2A [14.03..18.04]: "Penyebabnya kalender Julian buatan Julius Caesar,"
//  2B [18.04..21.24]: "yang dipakai lebih dari seribu enam ratus tahun."
//  2C [21.24..23.95]: "Kalender ini mematok satu tahun"
//  2D [23.95..27.77]: "tepat tiga ratus enam puluh lima koma dua lima hari."
// ============================================================================

export const Lembar02KalenderJulian: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[1];

  const introP = easeOutCubic(prog(sec, ch.start + 0.08, ch.start + 1.3));
  const spanP = easeInOutCubic(prog(sec, 18.05, 20.85));
  const cycleP = easeOutCubic(prog(sec, 21.25, 23.6));
  const numP = easeOutCubic(prog(sec, 23.95, 26.5));

  const spanYears = Math.round(interpolate(spanP, [0, 1], [0, 1627]));
  const displayedYearLen = interpolate(numP, [0, 1], [365.0, 365.25]).toFixed(2).replace('.', ',');

  const fourYears = [
    { roman: 'TAHUN I', days: '365', tag: 'BIASA', leap: false },
    { roman: 'TAHUN II', days: '365', tag: 'BIASA', leap: false },
    { roman: 'TAHUN III', days: '365', tag: 'BIASA', leap: false },
    { roman: 'TAHUN IV', days: '366', tag: '+1 KABISAT', leap: true },
  ];

  return (
    <AlmanacFolioSheet chapter={ch}>
      {/* Upper Section: Roman Astronomical Medallion & 1,627-Year Span Ruler */}
      <div
        style={{
          position: 'absolute',
          left: 46,
          right: 46,
          top: 38,
          height: 510,
          background: 'rgba(248, 244, 234, 0.92)',
          border: `2px solid ${IDENTITY.ink}`,
          padding: '28px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          opacity: introP,
          transform: `translateY(${(1 - introP) * 16}px)`,
        }}
      >
        {/* Top Row: Roman Seal + Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {/* Engraved Roman Coin / Sun Seal */}
            <svg width={104} height={104} viewBox="0 0 104 104">
              <circle
                cx={52}
                cy={52}
                r={48}
                fill="#EFE6D2"
                stroke={IDENTITY.ink}
                strokeWidth={2.5}
              />
              <circle
                cx={52}
                cy={52}
                r={40}
                fill="none"
                stroke={IDENTITY.crimson}
                strokeWidth={1.6}
                strokeDasharray="4 3"
              />
              <text
                x={52}
                y={46}
                textAnchor="middle"
                fontFamily={IDENTITY.fontSerif}
                fontWeight={900}
                fontSize={22}
                fill={IDENTITY.ink}
              >
                XLVI
              </text>
              <text
                x={52}
                y={69}
                textAnchor="middle"
                fontFamily={IDENTITY.fontMono}
                fontWeight={700}
                fontSize={15}
                fill={IDENTITY.crimson}
              >
                45 SM
              </text>
            </svg>

            <div>
              <div
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  color: IDENTITY.crimson,
                }}
              >
                DEKRET ROMAWI KUNO · JULIUS CAESAR
              </div>
              <div
                style={{
                  fontFamily: IDENTITY.fontSerif,
                  fontSize: 46,
                  fontWeight: 900,
                  color: IDENTITY.ink,
                  marginTop: 4,
                }}
              >
                Kalender Julian
              </div>
              <div
                style={{
                  fontFamily: IDENTITY.fontBody,
                  fontSize: 22,
                  fontWeight: 600,
                  color: IDENTITY.inkSoft,
                  marginTop: 2,
                }}
              >
                Dirancang bersama astronom Sosigenes dari Aleksandria
              </div>
            </div>
          </div>

          <EngravedCompassRose size={98} rotationDeg={frame * 0.08} />
        </div>

        {/* Historical Span Caliper Track: 45 SM -> 1582 M */}
        <div
          style={{
            background: '#EFE7D6',
            border: '1.5px solid rgba(25, 23, 20, 0.28)',
            padding: '24px 30px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 21,
                fontWeight: 700,
                color: IDENTITY.inkSoft,
                letterSpacing: '0.10em',
              }}
            >
              MASA PEMAKAIAN DI EROPA
            </span>
            <span
              style={{
                fontFamily: IDENTITY.fontSerif,
                fontWeight: 900,
                fontSize: 42,
                color: spanP > 0.05 ? IDENTITY.crimson : IDENTITY.inkMuted,
              }}
            >
              {spanP > 0.05 ? `${spanYears.toLocaleString('id-ID')} Tahun` : '45 SM'}
            </span>
          </div>

          {/* Progress Bar with Century Tick Marks */}
          <div
            style={{
              position: 'relative',
              height: 46,
              background: '#DFD5C0',
              border: `2px solid ${IDENTITY.ink}`,
            }}
          >
            <div
              style={{
                width: `${Math.max(6, spanP * 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${IDENTITY.lapis} 0%, ${IDENTITY.crimson} 100%)`,
              }}
            />
            {Array.from({ length: 16 }).map((_, tIdx) => (
              <div
                key={tIdx}
                style={{
                  position: 'absolute',
                  left: `${((tIdx + 1) / 17) * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: 1.5,
                  background: 'rgba(25, 23, 20, 0.25)',
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 12,
              fontFamily: IDENTITY.fontMono,
              fontSize: 20,
              fontWeight: 700,
              color: IDENTITY.ink,
            }}
          >
            <span>45 SM (ROMA)</span>
            <span>325 M (NICEA)</span>
            <span>1000 M</span>
            <span style={{ color: IDENTITY.crimson }}>1582 M (DIROMBAK)</span>
          </div>
        </div>
      </div>

      {/* Lower Section: 4-Year Cycle + Monumental 365,25 HARI Readout */}
      <div
        style={{
          position: 'absolute',
          left: 46,
          right: 46,
          top: 582,
          height: 710,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* 4-Year Cycle Cards */}
        <div>
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: IDENTITY.inkSoft,
              marginBottom: 14,
              opacity: Math.max(0.35, cycleP),
            }}
          >
            RUMUS SIKLUS 4 TAHUN CAESAR (TANPA PENGECUALIAN)
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}
          >
            {fourYears.map((yr, idx) => {
              const cardAppear = clamp01((cycleP - idx * 0.14) / 0.44);
              return (
                <div
                  key={yr.roman}
                  style={{
                    height: 236,
                    background: yr.leap ? '#FDF3F1' : '#F8F4EA',
                    border: `2.5px solid ${yr.leap ? IDENTITY.crimson : IDENTITY.ink}`,
                    padding: '20px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: 0.25 + 0.75 * cardAppear,
                    transform: `translateY(${(1 - cardAppear) * 20}px)`,
                    boxShadow: '0 10px 24px rgba(25,23,20,0.09)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 19,
                      fontWeight: 700,
                      letterSpacing: '0.10em',
                      color: yr.leap ? IDENTITY.crimson : IDENTITY.inkSoft,
                    }}
                  >
                    {yr.roman}
                  </span>

                  <span
                    style={{
                      fontFamily: IDENTITY.fontSerif,
                      fontWeight: 900,
                      fontSize: 70,
                      lineHeight: 1,
                      color: yr.leap ? IDENTITY.crimson : IDENTITY.ink,
                    }}
                  >
                    {yr.days}
                  </span>

                  <span
                    style={{
                      padding: '5px 12px',
                      background: yr.leap
                        ? IDENTITY.crimson
                        : 'rgba(25, 23, 20, 0.09)',
                      color: yr.leap ? '#FFF8F2' : IDENTITY.inkSoft,
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {yr.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monumental Specification Plaque: 365,25 HARI */}
        <div
          style={{
            height: 368,
            background: IDENTITY.ink,
            border: `3px solid ${IDENTITY.ink}`,
            padding: '32px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 18px 42px rgba(25, 23, 20, 0.26)',
            opacity: 0.35 + 0.65 * Math.max(cycleP * 0.5, numP),
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
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: '#F4BE44',
              }}
            >
              PATOKAN RATA-RATA 1 TAHUN JULIAN
            </span>
            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 20,
                fontWeight: 600,
                color: 'rgba(244, 239, 227, 0.65)',
              }}
            >
              (3 × 365 + 366) ÷ 4
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: 24,
            }}
          >
            <span
              style={{
                fontFamily: IDENTITY.fontSerif,
                fontWeight: 900,
                fontSize: 136,
                lineHeight: 0.95,
                color: '#F6F1E6',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {displayedYearLen}
            </span>
            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: '0.10em',
                color: '#F4BE44',
              }}
            >
              HARI
            </span>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(244, 239, 227, 0.22)',
              paddingTop: 16,
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: IDENTITY.fontMono,
              fontSize: 21,
              fontWeight: 700,
              color: '#E7DEC9',
              letterSpacing: '0.08em',
            }}
          >
            <span>SETARA: 365 HARI + 6 JAM 00 MENIT PAS</span>
            <span style={{ color: '#FF8B7B' }}>TERLALU LAMBAT DARI ASLINYA!</span>
          </div>
        </div>
      </div>
    </AlmanacFolioSheet>
  );
};

// ============================================================================
// LEMBAR 03 — FISIKA ORBIT: BUMI BERPUTAR 11 MENIT 14 DETIK LEBIH CEPAT
// Cards:
//  3A [27.86..32.42]: "Padahal Bumi mengelilingi Matahari sedikit lebih cepat dari itu."
//  3B [32.42..34.55]: "Satu putaran penuh sebenarnya kurang"
//  3C [34.55..38.38]: "sebelas menit empat belas detik dari hitungan Caesar."
// ============================================================================

export const Lembar03SelisihSebelasMenit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[2];

  const orbitP = easeInOutCubic(prog(sec, ch.start + 0.15, 32.35));
  const diffReveal = easeOutCubic(prog(sec, 32.4, 34.4));
  const exactNumP = easeOutCubic(prog(sec, 34.45, 35.65));

  const minsCount = Math.round(interpolate(exactNumP, [0, 1], [0, 11]));
  const secsCount = Math.round(interpolate(exactNumP, [0, 1], [0, 14]));

  // Earth orbital angle: sweeps full 360 deg from top (-90 deg) back to top
  const earthAngleRad = -Math.PI / 2 + orbitP * Math.PI * 2;
  const cx = 567;
  const cy = 415;
  const rx = 405;
  const ry = 285;
  const ex = cx + Math.cos(earthAngleRad) * rx;
  const ey = cy + Math.sin(earthAngleRad) * ry;

  return (
    <AlmanacFolioSheet chapter={ch}>
      {/* Upper Heliocentric Ecliptic Diagram */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 34,
          height: 808,
          background: 'rgba(248, 244, 234, 0.90)',
          border: `2px solid ${IDENTITY.ink}`,
          overflow: 'hidden',
        }}
      >
        {/* Top Corner Labels */}
        <div
          style={{
            position: 'absolute',
            left: 28,
            top: 22,
            right: 28,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 5,
          }}
        >
          <AlmanacPlaque tone="lapis" size="sm" label="ORBIT TAHUN TROPIK BUMI" />
          <span
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 20,
              fontWeight: 700,
              color: IDENTITY.inkSoft,
              letterSpacing: '0.10em',
            }}
          >
            GARIS ACUAN: EKUIINOKS MARET (0°)
          </span>
        </div>

        <svg width={1146} height={808} style={{ position: 'absolute', inset: 0 }}>
          {/* Reference Vernal Equinox Vertical Axis */}
          <line
            x1={cx}
            y1={76}
            x2={cx}
            y2={748}
            stroke="rgba(25, 23, 20, 0.22)"
            strokeWidth={1.6}
            strokeDasharray="8 6"
          />
          <line
            x1={105}
            y1={cy}
            x2={1030}
            y2={cy}
            stroke="rgba(25, 23, 20, 0.16)"
            strokeWidth={1.4}
            strokeDasharray="8 6"
          />

          {/* Outer Julian 365.25 Ghost Arc */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx + 26}
            ry={ry + 18}
            fill="none"
            stroke="rgba(188, 52, 40, 0.34)"
            strokeWidth={2.2}
            strokeDasharray="6 6"
          />

          {/* True Earth Orbital Track */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="rgba(33, 78, 120, 0.24)"
            strokeWidth={5}
          />

          {/* Swept Progress Path along Ellipse */}
          {Array.from({ length: 90 }).map((_, segI) => {
            const f0 = segI / 90;
            const f1 = (segI + 1) / 90;
            if (f0 > orbitP) return null;
            const a0 = -Math.PI / 2 + f0 * Math.PI * 2;
            const a1 = -Math.PI / 2 + Math.min(orbitP, f1) * Math.PI * 2;
            return (
              <line
                key={segI}
                x1={cx + Math.cos(a0) * rx}
                y1={cy + Math.sin(a0) * ry}
                x2={cx + Math.cos(a1) * rx}
                y2={cy + Math.sin(a1) * ry}
                stroke={IDENTITY.lapis}
                strokeWidth={6}
                strokeLinecap="round"
              />
            );
          })}

          {/* 12 Month Radial Ticks on Orbit */}
          {Array.from({ length: 12 }).map((_, mIdx) => {
            const ang = -Math.PI / 2 + (mIdx / 12) * Math.PI * 2;
            const x1 = cx + Math.cos(ang) * (rx - 12);
            const y1 = cy + Math.sin(ang) * (ry - 12);
            const x2 = cx + Math.cos(ang) * (rx + 12);
            const y2 = cy + Math.sin(ang) * (ry + 12);
            return (
              <line
                key={mIdx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={IDENTITY.ink}
                strokeWidth={2}
              />
            );
          })}

          {/* Finish-Line Gap Wedge Highlight at Top when Orbit Completes */}
          {diffReveal > 0.05 && (
            <g opacity={diffReveal}>
              {/* Crimson Lag Sector representing Caesar's extra +11m 14s */}
              <path
                d={`M ${cx} ${cy - ry} L ${cx + 76} ${cy - ry - 20} L ${cx + 76} ${cy - ry + 24} Z`}
                fill="rgba(188, 52, 40, 0.18)"
              />
              <circle
                cx={cx + 68}
                cy={cy - ry + 4}
                r={12}
                fill={IDENTITY.crimson}
                stroke="#FFF8F2"
                strokeWidth={2.5}
              />
              <line
                x1={cx}
                y1={cy - ry - 38}
                x2={cx + 68}
                y2={cy - ry - 38}
                stroke={IDENTITY.crimson}
                strokeWidth={3.5}
              />
              <rect
                x={cx + 84}
                y={cy - ry - 58}
                width={318}
                height={46}
                fill="#FDF3F1"
                stroke={IDENTITY.crimson}
                strokeWidth={2}
              />
              <text
                x={cx + 243}
                y={cy - ry - 28}
                textAnchor="middle"
                fontFamily={IDENTITY.fontMono}
                fontWeight={800}
                fontSize={19}
                fill={IDENTITY.crimson}
              >
                CAESAR TELAT +11M 14D
              </text>
            </g>
          )}

          {/* Engraved Sun at Center */}
          <g transform={`translate(${cx}, ${cy})`}>
            {Array.from({ length: 16 }).map((_, rIdx) => {
              const a = (rIdx * 22.5 * Math.PI) / 180;
              const inner = 48;
              const outer = rIdx % 2 === 0 ? 74 : 61;
              return (
                <line
                  key={rIdx}
                  x1={Math.cos(a) * inner}
                  y1={Math.sin(a) * inner}
                  x2={Math.cos(a) * outer}
                  y2={Math.sin(a) * outer}
                  stroke={IDENTITY.brass}
                  strokeWidth={rIdx % 2 === 0 ? 3 : 1.8}
                />
              );
            })}
            <circle
              cx={0}
              cy={0}
              r={44}
              fill="#F5C451"
              stroke={IDENTITY.ink}
              strokeWidth={2.5}
            />
            <text
              x={0}
              y={7}
              textAnchor="middle"
              fontFamily={IDENTITY.fontMono}
              fontWeight={800}
              fontSize={16}
              fill={IDENTITY.ink}
            >
              MATAHARI
            </text>
          </g>

          {/* Moving Earth Marker */}
          <g transform={`translate(${ex}, ${ey})`}>
            <circle
              cx={0}
              cy={0}
              r={26}
              fill={IDENTITY.lapis}
              stroke="#FFF8F2"
              strokeWidth={3.5}
            />
            <circle cx={-6} cy={-5} r={7} fill="#6DB695" />
            <circle cx={7} cy={6} r={5.5} fill="#6DB695" />
          </g>

          {/* Bottom Orbit Labels */}
          <text
            x={cx}
            y={782}
            textAnchor="middle"
            fontFamily={IDENTITY.fontMono}
            fontWeight={700}
            fontSize={20}
            fill={IDENTITY.lapis}
            letterSpacing="0.08em"
          >
            1 PUTARAN ASLI BUMI = 365 HARI 5 JAM 48 MENIT 46 DETIK
          </text>
        </svg>
      </div>

      {/* Lower Head-to-Head Chronometer Comparison */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 870,
          height: 422,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Two Precision Time Bars */}
        <div
          style={{
            background: '#F8F4EA',
            border: `2px solid ${IDENTITY.ink}`,
            padding: '22px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            opacity: Math.max(0.35, diffReveal),
          }}
        >
          {/* Caesar Bar */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: IDENTITY.fontMono,
                fontSize: 20,
                fontWeight: 700,
                color: IDENTITY.inkSoft,
                marginBottom: 6,
              }}
            >
              <span>HITUNGAN CAESAR (JULIAN)</span>
              <span style={{ color: IDENTITY.crimson }}>365 HARI 06 JAM 00 MNT 00 DTK</span>
            </div>
            <div style={{ height: 26, background: '#DFD5C0', position: 'relative' }}>
              <div style={{ width: '100%', height: '100%', background: IDENTITY.crimson }} />
            </div>
          </div>

          {/* True Solar Year Bar */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: IDENTITY.fontMono,
                fontSize: 20,
                fontWeight: 700,
                color: IDENTITY.lapis,
                marginBottom: 6,
              }}
            >
              <span>ORBIT BUMI SEBENARNYA</span>
              <span style={{ color: IDENTITY.verdigris }}>365 HARI 05 JAM 48 MNT 46 DTK</span>
            </div>
            <div style={{ height: 26, background: '#DFD5C0', position: 'relative' }}>
              <div style={{ width: '93.5%', height: '100%', background: IDENTITY.verdigris }} />
            </div>
          </div>
        </div>

        {/* Giant Crimson Difference Plaque: 11 MENIT 14 DETIK */}
        <div
          style={{
            height: 202,
            background: IDENTITY.crimson,
            border: `3px solid ${IDENTITY.ink}`,
            padding: '20px 38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 16px 38px rgba(188, 52, 40, 0.28)',
            opacity: 0.25 + 0.75 * Math.max(diffReveal * 0.5, exactNumP),
            transform: `scale(${0.97 + 0.03 * exactNumP})`,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 21,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#FDE6DF',
              }}
            >
              KELEBIHAN TIAP 1 TAHUN
            </div>
            <div
              style={{
                fontFamily: IDENTITY.fontBody,
                fontSize: 24,
                fontWeight: 600,
                color: '#FFF8F2',
                marginTop: 6,
              }}
            >
              Kalender berjalan lebih lambat dari Bumi
            </div>
          </div>

          <div
            style={{
              fontFamily: IDENTITY.fontSerif,
              fontWeight: 900,
              fontSize: 84,
              lineHeight: 1,
              color: '#FFF8F2',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {minsCount}m {String(secsCount).padStart(2, '0')}d
          </div>
        </div>
      </div>
    </AlmanacFolioSheet>
  );
};

// ============================================================================
// LEMBAR 04 — AKUMULASI 128 TAHUN = 1 HARI -> TAHUN 1582 MELESET 10 HARI
// Cards:
//  4A [38.47..41.54]: "Selisih sebelas menit setahun terdengar sepele."
//  4B [41.54..44.74]: "Tapi setiap seratus dua puluh delapan tahun,"
//  4C [44.74..47.57]: "kalender meleset satu hari penuh."
//  4D [47.57..50.36]: "Memasuki tahun seribu lima ratus delapan puluh dua,"
//  4E [50.36..53.81]: "musim di Bumi sudah bergeser sepuluh hari dari tanggalnya."
// ============================================================================

export const Lembar04AkumulasiSepuluhHari: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const ch = CHAPTERS[3];

  const introP = easeOutCubic(prog(sec, ch.start + 0.1, 40.5));
  const stepOneP = easeOutCubic(prog(sec, 41.6, 46.8));
  const climbTenP = easeInOutCubic(prog(sec, 47.6, 51.8));
  const seasonShiftP = easeOutCubic(prog(sec, 50.4, 53.2));

  // Total active columns in the 10-step staircase:
  // During 41.6..47.5s, step 1 highlights ("128 tahun = 1 hari penuh")
  // During 47.6..52s, steps 2..10 climb all the way to +10 HARI at 1582!
  const activeSteps =
    sec < 47.55 ? stepOneP : 1 + climbTenP * 9;

  const driftSteps = [
    { step: 1, yr: '453' },
    { step: 2, yr: '581' },
    { step: 3, yr: '709' },
    { step: 4, yr: '837' },
    { step: 5, yr: '965' },
    { step: 6, yr: '1093' },
    { step: 7, yr: '1221' },
    { step: 8, yr: '1349' },
    { step: 9, yr: '1477' },
    { step: 10, yr: '1582' },
  ];

  return (
    <AlmanacFolioSheet chapter={ch}>
      {/* Top Formula Strip: 128 TAHUN × 11m 14d = 1 HARI PENUH */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 34,
          height: 146,
          background: '#F8F4EA',
          border: `2px solid ${IDENTITY.ink}`,
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: introP,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: IDENTITY.inkMuted,
            }}
          >
            RUMUS PENUMPUKAN WAKTU
          </div>
          <div
            style={{
              fontFamily: IDENTITY.fontSerif,
              fontWeight: 900,
              fontSize: 32,
              color: IDENTITY.ink,
              marginTop: 4,
              whiteSpace: 'nowrap',
            }}
          >
            11m 14d ×{' '}
            <span style={{ color: stepOneP > 0.15 ? IDENTITY.crimson : IDENTITY.ink }}>
              128 Tahun
            </span>{' '}
            ={' '}
            <span style={{ color: stepOneP > 0.55 ? IDENTITY.crimson : IDENTITY.ink }}>
              1 Hari Penuh
            </span>
          </div>
        </div>

        <AlmanacPlaque
          tone={climbTenP > 0.6 ? 'crimson' : 'lapis'}
          size="md"
          label={
            climbTenP > 0.6
              ? '1582: +10 HARI MELESET'
              : '24 JAM = 1.440 MENIT'
          }
        />
      </div>

      {/* Center 10-Step Staircase Accumulation Graph (325 M -> 1582 M) */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 208,
          height: 676,
          background: 'rgba(248, 244, 234, 0.92)',
          border: `2px solid ${IDENTITY.ink}`,
          padding: '28px 36px 34px 36px',
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
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.10em',
              color: IDENTITY.inkSoft,
              whiteSpace: 'nowrap',
            }}
          >
            PERGESERAN TANGGAL DARI KONSILI NICEA (325–1582 M)
          </span>
          <span
            style={{
              fontFamily: IDENTITY.fontSerif,
              fontWeight: 900,
              fontSize: 40,
              color: IDENTITY.crimson,
              whiteSpace: 'nowrap',
            }}
          >
            +{Math.max(0, Math.round(activeSteps))} Hari
          </span>
        </div>

        {/* 10 Columns Staircase */}
        <div
          style={{
            position: 'relative',
            height: 492,
            borderLeft: `2.5px solid ${IDENTITY.ink}`,
            borderBottom: `2.5px solid ${IDENTITY.ink}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            alignItems: 'end',
            gap: 12,
            padding: '0 14px',
          }}
        >
          {/* Horizontal Reference Grid Lines */}
          {[2, 4, 6, 8, 10].map((lvl) => (
            <div
              key={lvl}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${(lvl / 10.8) * 100}%`,
                borderTop: '1px dashed rgba(25, 23, 20, 0.18)',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 8,
                  top: -24,
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 15,
                  fontWeight: 700,
                  color: IDENTITY.inkMuted,
                }}
              >
                +{lvl}h
              </span>
            </div>
          ))}

          {driftSteps.map((st, idx) => {
            const fillAmt = clamp01(activeSteps - idx);
            const targetH = ((idx + 1) / 10.8) * 470;
            const isTenth = st.step === 10;
            return (
              <div
                key={st.step}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                }}
              >
                {fillAmt > 0.25 && (
                  <div
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: isTenth ? 21 : 17,
                      fontWeight: 800,
                      color: isTenth ? IDENTITY.crimson : IDENTITY.ink,
                      marginBottom: 6,
                      opacity: fillAmt,
                    }}
                  >
                    +{st.step}
                  </div>
                )}

                <div
                  style={{
                    width: '100%',
                    height: Math.max(4, targetH * fillAmt),
                    background: isTenth
                      ? IDENTITY.crimson
                      : fillAmt > 0.05
                        ? `linear-gradient(180deg, #D55447 0%, ${IDENTITY.crimson} 100%)`
                        : 'rgba(25, 23, 20, 0.08)',
                    border:
                      fillAmt > 0.05
                        ? `2px solid ${IDENTITY.ink}`
                        : '1px dashed rgba(25,23,20,0.2)',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* X-Axis Year Labels */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            padding: '0 14px',
            textAlign: 'center',
            fontFamily: IDENTITY.fontMono,
            fontSize: 17,
            fontWeight: 700,
            color: IDENTITY.inkSoft,
          }}
        >
          {driftSteps.map((st) => (
            <span
              key={st.yr}
              style={{
                color: st.step === 10 ? IDENTITY.crimson : IDENTITY.inkSoft,
                fontWeight: st.step === 10 ? 800 : 700,
              }}
            >
              {st.yr}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Seasonal Vernal Equinox Ruler: 21 MARET -> 11 MARET 1582 */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          right: 44,
          top: 912,
          height: 380,
          background: IDENTITY.ink,
          padding: '28px 38px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          opacity: 0.35 + 0.65 * Math.max(climbTenP * 0.6, seasonShiftP),
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
              color: '#F4BE44',
            }}
          >
            BUKTI DI LANGIT 1582 · TITIK AWAL MUSIM SEMI (MARET)
          </span>
          <span
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 19,
              fontWeight: 700,
              color: '#FF8B7B',
            }}
          >
            MELESET 10 HARI
          </span>
        </div>

        {/* March Date Track 8..24 */}
        <div style={{ position: 'relative', height: 158, marginTop: 10 }}>
          {/* Base Ruler Line */}
          <div
            style={{
              position: 'absolute',
              left: 20,
              right: 20,
              top: 92,
              height: 4,
              background: 'rgba(244, 239, 227, 0.32)',
            }}
          />

          {/* Date Ticks 9 Maret .. 23 Maret */}
          {Array.from({ length: 15 }).map((_, idx) => {
            const d = 9 + idx;
            const xPct = 4 + (idx / 14) * 92;
            const is11 = d === 11;
            const is21 = d === 21;
            return (
              <div
                key={d}
                style={{
                  position: 'absolute',
                  left: `${xPct}%`,
                  top: 76,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: is11 || is21 ? 4 : 2,
                    height: is11 || is21 ? 34 : 18,
                    background: is11
                      ? '#F4BE44'
                      : is21
                        ? '#FF6F5E'
                        : 'rgba(244,239,227,0.4)',
                  }}
                />
                <span
                  style={{
                    marginTop: 10,
                    fontFamily: IDENTITY.fontMono,
                    fontSize: is11 || is21 ? 22 : 16,
                    fontWeight: is11 || is21 ? 800 : 500,
                    color: is11
                      ? '#F4BE44'
                      : is21
                        ? '#FF8B7B'
                        : 'rgba(244,239,227,0.52)',
                  }}
                >
                  {d}
                </span>
              </div>
            );
          })}

          {/* Sliding Sun Position shifting from 21 Maret (18.2%)? 21 is idx 12 -> 4 + 12/14*92 = 82.8%, 11 is idx 2 -> 4 + 2/14*92 = 17.1% */}
          {(() => {
            const sunLeftPct = interpolate(seasonShiftP, [0, 1], [82.8, 17.1]);
            return (
              <>
                {/* Dimension Gap Bar between Sun and 21 Maret */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${sunLeftPct}%`,
                    width: `${82.8 - sunLeftPct}%`,
                    top: 86,
                    height: 16,
                    background: 'rgba(255, 111, 94, 0.36)',
                    borderTop: '2px solid #FF6F5E',
                    borderBottom: '2px solid #FF6F5E',
                  }}
                />

                {/* Sun Marker */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${sunLeftPct}%`,
                    top: 6,
                    transform: 'translateX(-50%)',
                    padding: '7px 14px',
                    background: '#F4BE44',
                    color: IDENTITY.ink,
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 18,
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ☀ MATAHARI ASLI (11 MAR)
                </div>

                {/* Official Calendar Marker at 21 Maret */}
                <div
                  style={{
                    position: 'absolute',
                    left: '82.8%',
                    top: 6,
                    transform: 'translateX(-50%)',
                    padding: '7px 14px',
                    background: IDENTITY.crimson,
                    color: '#FFF8F2',
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 18,
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  JADWAL KALENDER (21 MAR)
                </div>
              </>
            );
          })()}
        </div>

        <div
          style={{
            fontFamily: IDENTITY.fontBody,
            fontSize: 22,
            fontWeight: 600,
            color: '#E7DEC9',
            textAlign: 'center',
          }}
        >
          Posisi Matahari datang 10 hari lebih cepat daripada tanggal di kertas kalender
        </div>
      </div>
    </AlmanacFolioSheet>
  );
};
