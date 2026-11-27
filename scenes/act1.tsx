import React from 'react';
import { AbsoluteFill } from 'remotion';
import { IDENTITY, clamp01, easeOutCubic, prog } from './script';
import {
  Backdrop,
  Camera,
  ChapterEyebrow,
  DustMotes,
  FilmGrain,
  LeaderLabel,
  Mono,
  RuleLine,
  hash2,
  lerp,
  useChapterClock,
} from './kit';
import {
  Corona,
  Counter,
  EarthDot,
  GhostSun,
  OrbitRing,
  PlateFrame,
  StarField,
  SunDisc,
  VectorArrow,
} from './sol';

const Stage: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => {
  const { ch, localSec, dur } = useChapterClock(i);
  return (
    <AbsoluteFill style={{ backgroundColor: ch.groundBottom, overflow: 'hidden' }}>
      {children}
      <DustMotes count={26} seed={i + 3} y0={320} y1={1900} color="rgba(244,232,208,0.30)" />
      <FilmGrain opacity={0.13} scale={190} />
    </AbsoluteFill>
  );
};

// ============================================================================
// 01 — CAHAYA TERTUNDA
// ============================================================================
export const Scene01: React.FC = () => {
  const { ch, art, localSec, dur } = useChapterClock(0);
  const t = localSec;
  const off = prog(t, 11.2, 12.1); // the sun goes out in front of us
  const alive = 1 - off;
  const reveal = easeOutCubic(prog(t, 0.1, 1.4));
  const lightFade = 1 - easeOutCubic(prog(t, 11.9, 13.6));

  return (
    <Stage i={0}>
      <Backdrop
        top={ch.groundTop}
        bottom={ch.groundBottom}
        tex="ink-wash"
        texOpacity={0.3}
        light={{ x: 720, y: 1000, rx: 900, ry: 900, color: `rgba(255,170,70,${0.3 * lightFade})`, strength: 1 }}
      />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={110} t={t} opacity={0.5 + off * 0.4} />
        <Camera localSec={t} dur={dur} push={0.045} drift={10}>
          <PlateFrame x={236} y={470} w={968} h={1030} color="rgba(233,214,186,0.34)" no="PLAT 01 / 08" progress={reveal} />
          <Corona cx={720} cy={1010} r={352} t={t} strength={0.85 * alive} rays={86} />
          <SunDisc cx={720} cy={1010} r={352} t={t} alive={alive} glow={alive} />
          {off > 0.15 && <GhostSun cx={720} cy={1010} r={352} t={t} color={art.accent} />}

          {/* delay ruler: light already in flight */}
          <g opacity={easeOutCubic(prog(t, 1.1, 2.2))}>
            <Mono x={236} y={1600} text="CAHAYA BERANGKAT" size={17} color={art.soft} tracking={0.26} />
            <Mono x={1204} y={1600} text="KAMU MELIHATNYA" size={17} color={art.soft} tracking={0.26} anchor="end" />
            <RuleLine x1={236} y1={1636} x2={1204} y2={1636} color="rgba(226,206,172,0.4)" width={2} />
            {Array.from({ length: 9 }).map((_, i) => {
              const x = 236 + (968 / 8) * i;
              const lit = clamp01((t - 1.4) / 6) * 8;
              return (
                <g key={i}>
                  <line x1={x} y1={1636} x2={x} y2={1664} stroke={i <= lit ? art.accent : 'rgba(226,206,172,0.35)'} strokeWidth={i <= lit ? 3 : 1.4} />
                  <circle cx={x} cy={1636} r={i <= lit ? 5 : 3} fill={i <= lit ? art.accent : 'rgba(226,206,172,0.4)'} />
                </g>
              );
            })}
            <Mono x={720} y={1720} text="499 DETIK · 8 MENIT 19 DETIK" size={20} color="rgba(240,226,198,0.82)" tracking={0.22} anchor="middle" />
          </g>

          {/* clock readout */}
          <g opacity={easeOutCubic(prog(t, 2.0, 3.0))}>
            <Mono x={236} y={420} text="MATAHARI PADAM" size={18} color={art.accent} tracking={0.3} />
          </g>
          <Counter
            x={1204}
            y={452}
            from={0}
            to={8.2}
            localSec={t}
            startSec={2.0}
            durSec={3.4}
            format={(v) => `${v.toFixed(1)} mnt`}
            size={64}
            anchor="end"
            color="rgba(240,226,198,0.9)"
            family={IDENTITY.fontMono}
            weight={500}
          />
          <RuleLine x1={236} y1={470} x2={1204} y2={470} color="rgba(226,206,172,0.22)" />
          <ChapterEyebrow index={0} localSec={t} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 02 — HITUNG JARAK
// ============================================================================
export const Scene02: React.FC = () => {
  const { ch, art, localSec, dur } = useChapterClock(1);
  const t = localSec;
  const rows = [
    { label: 'JARAK MATAHARI – BUMI', unit: 'KM', to: 149600000, at: 0.5, size: 104, color: 'rgba(243,233,214,0.94)' },
    { label: 'KECEPATAN CAHAYA', unit: 'KM / DETIK', to: 299792, at: 2.4, size: 104, color: 'rgba(243,233,214,0.94)' },
  ];

  return (
    <Stage i={1}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="brass-brushed" texOpacity={0.22}
        light={{ x: 300, y: 700, rx: 820, ry: 820, color: 'rgba(255,196,110,0.16)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <Camera localSec={t} dur={dur} push={0.035} drift={6}>
          {rows.map((r, i) => {
            const p = easeOutCubic(prog(t, r.at, r.at + 1.5));
            const y = 720 + i * 380;
            return (
              <g key={r.label} opacity={clamp01(p * 2)}>
                <Mono x={120} y={y - 96} text={r.label} size={19} color={art.soft} tracking={0.28} />
                <Counter x={120} y={y} from={0} to={r.to} localSec={t} startSec={r.at} durSec={1.5}
                  format={(v) => Math.round(v).toLocaleString('id-ID')} size={r.size} color={r.color} weight={400} />
                <Mono x={1320} y={y} text={r.unit} size={22} color="rgba(243,233,214,0.45)" tracking={0.2} anchor="end" />
                <RuleLine x1={120} y1={y + 54} x2={1320} y2={y + 54} color="rgba(226,206,172,0.24)" />
              </g>
            );
          })}

          {/* division glyph */}
          <g opacity={easeOutCubic(prog(t, 4.0, 4.8))}>
            <line x1={120} y1={1178} x2={1320} y2={1178} stroke={art.accent} strokeWidth={2} opacity={0.55} />
            <Mono x={120} y={1252} text="÷" size={64} color={art.accent} tracking={0} />
            <Mono x={1320} y={1252} text="149.600.000 ÷ 299.792" size={26} color="rgba(243,233,214,0.6)" tracking={0.08} anchor="end" />
          </g>

          {/* result */}
          <g opacity={easeOutCubic(prog(t, 5.0, 6.0))}>
            <Mono x={120} y={1420} text="HASIL" size={19} color={art.accent} tracking={0.3} />
            <Counter x={112} y={1660} from={0} to={499} localSec={t} startSec={5.0} durSec={1.8} size={300} color={art.ink} weight={400} tracking="-0.03em" />
            <Mono x={1320} y={1600} text="DETIK" size={40} color="rgba(243,233,214,0.5)" tracking={0.2} anchor="end" />
            <RuleLine x1={120} y1={1730} x2={1320} y2={1730} color="rgba(226,206,172,0.3)" />
            <text x={120} y={1800} fill="rgba(243,233,214,0.62)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={44}>
              8 menit 19 detik — matahari yang kamu lihat selalu terlambat.
            </text>
          </g>
          <ChapterEyebrow index={1} localSec={t} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 03 — BAYANGAN GRAVITASI
// ============================================================================
export const Scene03: React.FC = () => {
  const { ch, art, localSec, dur } = useChapterClock(2);
  const t = localSec;
  const R = 452;
  const cx = 720;
  const cy = 1060;
  const ang = -0.9 + t * 0.24;
  const ex = cx + Math.cos(ang) * R;
  const ey = cy + Math.sin(ang) * R;
  const rings = [0, 1, 2];

  return (
    <Stage i={2}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="steel-brushed" texOpacity={0.16}
        light={{ x: 720, y: 1060, rx: 760, ry: 760, color: 'rgba(120,170,200,0.12)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={150} t={t} opacity={0.55} tint="#CFE0EC" />
        <Camera localSec={t} dur={dur} push={0.05} drift={7}>
          <OrbitRing cx={cx} cy={cy} rx={R} ry={R} ticks={96} t={t} color={art.accent} opacity={0.75} trailing={t * 0.05} />
          <OrbitRing cx={cx} cy={cy} rx={R * 0.66} ry={R * 0.66} ticks={48} t={t} color={art.accent} opacity={0.28} width={1} />

          {/* gravity ripples leaving a sun that is no longer there */}
          {rings.map((r) => {
            const p = ((t * 0.26 + r / rings.length) % 1);
            return (
              <circle key={r} cx={cx} cy={cy} r={lerp(96, R + 210, p)} fill="none"
                stroke={art.accent} strokeWidth={2.4 * (1 - p)} opacity={0.5 * (1 - p)} />
            );
          })}

          <GhostSun cx={cx} cy={cy} r={96} t={t} color={art.accent} />
          <Mono x={cx} y={cy + 6} text="0" size={26} color="rgba(220,231,236,0.5)" tracking={0.1} anchor="middle" />

          {/* earth orbit trail */}
          <path
            d={`M ${cx + Math.cos(ang - 0.85) * R} ${cy + Math.sin(ang - 0.85) * R} A ${R} ${R} 0 0 1 ${ex} ${ey}`}
            fill="none" stroke={art.ink} strokeWidth={3} opacity={0.55} strokeLinecap="round"
          />
          <EarthDot cx={ex} cy={ey} r={30} t={t} />
          <Mono x={ex + 46} y={ey + 8} text="BUMI" size={18} color="rgba(228,238,244,0.8)" tracking={0.26} />

          <LeaderLabel from={[cx + 210, cy - 150]} to={[cx + 300, cy - 300]} text="GRAVITASI = CAHAYA" sub="keduanya 299.792 km/detik" anchor="start" progress={prog(t, 2.0, 3.2)} color="rgba(226,238,244,0.8)" />
          <LeaderLabel from={[ex, ey]} to={[ex - 40, ey - 190]} text="ORBIT MASIH JALAN" sub="mengelilingi titik kosong" anchor="end" progress={prog(t, 4.2, 5.4)} color="rgba(226,238,244,0.8)" />

          <g opacity={easeOutCubic(prog(t, 0.6, 1.6))}>
            <Mono x={120} y={1780} text="T − 8:19" size={22} color={art.accent} tracking={0.3} />
            <text x={120} y={1880} fill="rgba(228,238,244,0.9)" fontFamily={IDENTITY.fontGrotesk} fontSize={54} fontWeight={600} letterSpacing="-0.02em">
              Bumi masih mengorbit
            </text>
            <text x={120} y={1948} fill="rgba(228,238,244,0.58)" fontFamily={IDENTITY.fontGrotesk} fontSize={54} fontWeight={400} letterSpacing="-0.02em">
              matahari yang sudah tidak ada.
            </text>
          </g>
          <ChapterEyebrow index={2} localSec={t} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 04 — LEPAS ORBIT
// ============================================================================
export const Scene04: React.FC = () => {
  const { ch, art, localSec, dur } = useChapterClock(3);
  const t = localSec;
  const launch = easeOutCubic(prog(t, 1.2, 3.4));
  const startX = 300;
  const startY = 1460;

  return (
    <Stage i={3}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="glass-mist" texOpacity={0.1}
        light={{ x: 980, y: 1200, rx: 900, ry: 700, color: 'rgba(140,180,210,0.12)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={140} t={t} opacity={0.5} tint="#D6E4F0" />
        {/* motion streaks */}
        <g opacity={0.5}>
          {Array.from({ length: 46 }).map((_, i) => {
            const y = 380 + hash2(i, 31) * 1500;
            const len = 90 + hash2(i, 32) * 460;
            const sp = 240 + hash2(i, 33) * 420;
            const x = ((hash2(i, 34) * 1900 + t * sp) % 1900) - 260;
            return (
              <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke="rgba(200,222,240,0.22)"
                strokeWidth={1 + hash2(i, 35) * 1.6} strokeLinecap="round" />
            );
          })}
        </g>

        <Camera localSec={t} dur={dur} push={0.045} drift={9}>
          {/* orbit left behind */}
          <path d={`M ${-160} ${700} A 700 700 0 0 0 ${startX} ${startY}`} fill="none" stroke={art.soft} strokeWidth={2} strokeDasharray="8 12" opacity={0.5} />
          <Mono x={120} y={1260} text="ORBIT LAMA" size={17} color={art.soft} tracking={0.26} />

          <VectorArrow x1={startX} y1={startY} x2={startX + 900} y2={startY - 380} color={art.accent} width={5} progress={prog(t, 1.2, 3.2)} head={34} />
          <EarthDot cx={startX + 900 * launch} cy={startY - 380 * launch} r={26} t={t} />

          <g opacity={easeOutCubic(prog(t, 3.0, 4.0))}>
            <Mono x={120} y={1720} text="KECEPATAN LEPAS" size={18} color={art.soft} tracking={0.28} />
            <Counter x={112} y={1900} from={0} to={107000} localSec={t} startSec={3.0} durSec={2.5}
              format={(v) => Math.round(v).toLocaleString('id-ID')} size={168} color={art.ink} weight={400} />
            <Mono x={120} y={1962} text="KILOMETER / JAM" size={26} color={art.accent} tracking={0.24} />
          </g>

          <g opacity={easeOutCubic(prog(t, 5.4, 6.6))}>
            <text x={120} y={880} fill="rgba(233,238,244,0.95)" fontFamily={IDENTITY.fontDisplay} fontSize={150} letterSpacing="0.01em">
              TANPA
            </text>
            <text x={120} y={1030} fill={art.accent} fontFamily={IDENTITY.fontDisplay} fontSize={150} letterSpacing="0.01em">
              PUSAT
            </text>
            <Mono x={126} y={1090} text="tidak ada yang menarik kita kembali" size={22} color="rgba(226,238,246,0.5)" tracking={0.14} />
          </g>
          <ChapterEyebrow index={3} localSec={t} />
        </Camera>
      </svg>
    </Stage>
  );
};
