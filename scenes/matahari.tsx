import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  CHAPTERS,
  CHAPTER_ART,
  CHAPTER_KICKERS,
  CHAPTER_TITLES,
  IDENTITY,
  clamp01,
  easeOutCubic,
  hash,
  lerp,
  prog,
} from './script';
import {
  Backdrop,
  Camera,
  ChapterEyebrow,
  DustMotes,
  FilmGrain,
  LeaderLabel,
  Mono,
  RuleLine,
  useChapterClock,
} from './kit';
import {
  BigNumber,
  Brackets,
  Corona4K,
  EarthGlobe,
  MilkyWay,
  MoonDisc,
  NoiseWash,
  PhotonPacket,
  Prominence,
  StarField,
  SunCore,
  TickRule,
} from './graphics';
import { Counter, GhostSun, PlateFrame, ThermoGauge, VectorArrow } from './sol';

// ============================================================================
// STAGE — every chapter gets its own world, grain and dust budget
// ============================================================================
export const Stage: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => {
  const ch = CHAPTERS[i];
  return (
    <AbsoluteFill style={{ backgroundColor: ch.groundBottom, overflow: 'hidden' }}>
      {children}
      <DustMotes count={24} seed={i + 5} y0={280} y1={1900} color="rgba(244,232,208,0.20)" />
      <FilmGrain opacity={0.12} scale={192} />
    </AbsoluteFill>
  );
};

const ChapterHead: React.FC<{ i: number; t: number; y?: number; size?: number; sub?: boolean }> = ({
  i,
  t,
  y = 610,
  size = 118,
  sub = true,
}) => {
  const art = CHAPTER_ART[i];
  const p = easeOutCubic(prog(t, 0.25, 1.25));
  return (
    <g opacity={p} transform={`translate(0 ${(1 - p) * 18})`}>
      <Mono x={116} y={y - 84} text={`${String(i + 1).padStart(2, '0')} / 12`} size={17} color={art.accent} tracking={0.3} />
      <text x={110} y={y} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={size} letterSpacing="0.012em">
        {CHAPTER_TITLES[i]}
      </text>
      {sub && (
        <text x={116} y={y + 52} fill="rgba(240,232,216,0.45)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={34}>
          {CHAPTER_KICKERS[i]}
        </text>
      )}
    </g>
  );
};

// ============================================================================
// 01 — CAHAYA YANG TERLAMBAT
// ============================================================================
export const Scene01: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(0);
  const reveal = easeOutCubic(prog(t, 0.1, 1.3));
  const off = prog(t, 10.6, 11.6);
  const alive = 1 - off;
  const packets = [0.12, 0.34, 0.56, 0.78];

  return (
    <Stage i={0}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="ink-wash" texOpacity={0.28}
        light={{ x: 720, y: 980, rx: 940, ry: 940, color: `rgba(255,176,80,${0.26 * alive})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={120} t={t} opacity={0.35 + off * 0.5} />
        <Camera localSec={t} dur={dur} push={0.05} drift={9}>
          {/* photographic plate */}
          <g opacity={reveal}>
            <rect x={232} y={700} width={976} height={1000} fill="rgba(8,7,6,0.35)" />
            <Brackets x={232} y={700} w={976} h={1000} color="rgba(233,214,186,0.4)" size={40} />
            <Mono x={232} y={672} text="PLAT 01 · KORONA, PAPAN FOTOGRAFI" size={16} color="rgba(233,214,186,0.5)" tracking={0.28} />
            <Mono x={1208} y={672} text="1440 × 2560 · 90 FPS" size={16} color="rgba(233,214,186,0.35)" tracking={0.24} anchor="end" />
            {[0, 1, 2, 3].map((k) => (
              <g key={k} opacity={0.5}>
                <line x1={232 + (k % 2) * 976} y1={700 + Math.floor(k / 2) * 1000} x2={232 + (k % 2) * 976 - 26} y2={700 + Math.floor(k / 2) * 1000} stroke="rgba(233,214,186,0.5)" strokeWidth={1.4} />
                <line x1={232 + (k % 2) * 976} y1={700 + Math.floor(k / 2) * 1000} x2={232 + (k % 2) * 976} y2={700 + Math.floor(k / 2) * 1000 - 26} stroke="rgba(233,214,186,0.5)" strokeWidth={1.4} />
              </g>
            ))}
          </g>

          <Corona4K cx={720} cy={1200} r={318} t={t} strength={0.9 * alive} rays={104} />
          <SunCore cx={720} cy={1200} r={318} t={t} alive={alive} cores={150} spots={6} />
          <Prominence cx={720} cy={1200} r={318} angle={-0.6} height={120} t={t} phase={0.4} />
          <Prominence cx={720} cy={1200} r={318} angle={2.4} height={92} t={t} phase={2.1} />
          {off > 0.1 && <GhostSun cx={720} cy={1200} r={318} t={t} color={art.accent} />}

          {/* the light already in flight */}
          <g opacity={easeOutCubic(prog(t, 1.2, 2.2))}>
            {packets.map((k, i) => {
              const head = ((t * 0.18 + k) % 1);
              return (
                <PhotonPacket key={i} x1={720} y1={1200} x2={180} y2={1880} head={head}
                  color={i % 2 === 0 ? '#FFD79A' : '#FFB463'} trail={300 - i * 40} width={2.4} />
              );
            })}
            <Mono x={180} y={1940} text="CAHAYA TERAKHIR" size={17} color={art.soft} tracking={0.26} />
            <TickRule x1={180} y1={1976} x2={1260} y2={1976} major={8} minor={4} color="rgba(226,206,172,0.5)"
              labels={['0', '', '', '', '', '', '', '', '8:20']} labelSize={18} progress={prog(t, 2.0, 3.4)} />
          </g>

          <ChapterHead i={0} t={t} y={560} size={112} />
          <ChapterEyebrow index={0} localSec={t} x={116} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 02 — EMPAT RATUS SEMBILAN PULUH SEMBILAN
// ============================================================================
export const Scene02: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(1);
  const rows = [
    { label: 'JARAK MATAHARI – BUMI', digits: '149.600.000', unit: 'KM', at: 0.6, to: 149600000 },
    { label: 'KECEPATAN CAHAYA DI VAKUM', digits: '299.792', unit: 'KM / DETIK', at: 2.6, to: 299792 },
  ];

  return (
    <Stage i={1}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="brass-brushed" texOpacity={0.2}
        light={{ x: 340, y: 660, rx: 820, ry: 780, color: 'rgba(255,196,110,0.15)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <NoiseWash x={0} y={0} w={1440} h={2560} seed={3} color="rgba(255,220,160,1)" cells={70} opacity={0.5} />
        <Camera localSec={t} dur={dur} push={0.03} drift={6}>
          <ChapterHead i={1} t={t} y={560} size={104} />

          {rows.map((r, i) => {
            const y = 860 + i * 420;
            const p = easeOutCubic(prog(t, r.at, r.at + 1.4));
            return (
              <g key={r.label} opacity={clamp01(p * 1.8)}>
                <Mono x={116} y={y - 118} text={r.label} size={18} color={art.soft} tracking={0.28} />
                <Mono x={1324} y={y - 118} text={`0${i + 1}`} size={18} color="rgba(241,231,210,0.35)" tracking={0.3} anchor="end" />
                <Counter x={110} y={y} from={0} to={r.to} localSec={t} startSec={r.at} durSec={1.4}
                  size={118} color="rgba(243,233,214,0.95)" weight={400} />
                <Mono x={1324} y={y} text={r.unit} size={24} color="rgba(243,233,214,0.42)" tracking={0.18} anchor="end" />
                <RuleLine x1={116} y1={y + 58} x2={1324} y2={y + 58} color="rgba(226,206,172,0.22)" />
              </g>
            );
          })}

          <g opacity={easeOutCubic(prog(t, 4.4, 5.2))}>
            <line x1={116} y1={1330} x2={1324} y2={1330} stroke={art.accent} strokeWidth={2} opacity={0.5} />
            <g transform="translate(116 1396)">
              <path d="M 0 0 h 26 M 13 -13 v 26" stroke={art.accent} strokeWidth={3} strokeLinecap="round" />
            </g>
            <Mono x={160} y={1404} text="149.600.000 ÷ 299.792" size={26} color="rgba(243,233,214,0.6)" tracking={0.06} />
          </g>

          <g opacity={easeOutCubic(prog(t, 5.2, 6.2))}>
            <Mono x={116} y={1540} text="HASIL" size={18} color={art.accent} tracking={0.3} />
            <Counter x={104} y={1804} from={0} to={499} localSec={t} startSec={5.2} durSec={1.6}
              size={300} color={art.ink} weight={400} tracking="-0.035em" />
            <Mono x={1324} y={1720} text="DETIK" size={42} color="rgba(243,233,214,0.45)" tracking={0.2} anchor="end" />
            <RuleLine x1={116} y1={1862} x2={1324} y2={1862} color="rgba(226,206,172,0.28)" />
            <text x={116} y={1938} fill="rgba(243,233,214,0.6)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={44}>
              8 menit 19 detik. Selisih antara matahari yang ada dan matahari yang kamu lihat.
            </text>
          </g>
          <ChapterEyebrow index={1} localSec={t} x={116} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 03 — MELIHAT MASA LALU
// ============================================================================
export const Scene03: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(2);
  const baseY = 1500;
  const x0 = 150;
  const x1 = 1290;
  const logMin = -1.6; // 0.025 ly
  const logMax = 6.6; // 4 Mly
  const lx = (ly: number) => x0 + ((Math.log10(ly) - logMin) / (logMax - logMin)) * (x1 - x0);

  const objects = [
    { name: 'MATAHARI', ly: 1.58e-5, sub: '8,3 menit cahaya', at: 0.6 },
    { name: 'PROXIMA CENTAURI', ly: 4.24, sub: '4,2 tahun cahaya', at: 2.2 },
    { name: 'BETELGEUSE', ly: 548, sub: '548 tahun cahaya', at: 3.8 },
    { name: 'ANDROMEDA', ly: 2.5e6, sub: '2,5 juta tahun cahaya', at: 5.4 },
  ];

  return (
    <Stage i={2}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="paper-fibre" texOpacity={0.16}
        light={{ x: 900, y: 900, rx: 780, ry: 780, color: 'rgba(150,180,215,0.12)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={300} t={t} opacity={0.75} band />
        <MilkyWay t={t} opacity={0.42} />
        <Camera localSec={t} dur={dur} push={0.04} drift={8}>
          <ChapterHead i={2} t={t} y={600} size={104} />

          <TickRule x1={x0} y1={baseY} x2={x1} y2={baseY} major={10} minor={5} color="rgba(230,237,244,0.4)"
            labels={['', '1 th', '', '100 th', '', '10 rb', '', '1 jt', '', '100 jt', '']} labelSize={16}
            progress={prog(t, 0.3, 2.0)} />
          <Mono x={x0} y={baseY + 96} text="SKALA LOGARITMIS · JARAK CAHAYA" size={16} color="rgba(230,237,244,0.4)" tracking={0.24} />

          {objects.map((o, i) => {
            const p = easeOutCubic(prog(t, o.at, o.at + 1.0));
            const x = lx(o.ly);
            const up = i % 2 === 0;
            const yTop = baseY - (up ? 210 : 130);
            return (
              <g key={o.name} opacity={clamp01(p * 1.6)}>
                <line x1={x} y1={baseY} x2={x} y2={lerp(baseY, yTop, p)} stroke={art.accent} strokeWidth={1.6} />
                <circle cx={x} cy={baseY} r={i === 0 ? 9 : 6} fill={i === 0 ? '#FFD79A' : art.accent} />
                <circle cx={x} cy={baseY} r={i === 0 ? 22 : 14} fill={i === 0 ? 'rgba(255,190,110,0.20)' : 'rgba(143,169,196,0.16)'} />
                <text x={x} y={yTop - 18} fill={art.ink} fontFamily={IDENTITY.fontMono} fontSize={18} letterSpacing="0.18em"
                  textAnchor={i === objects.length - 1 ? 'end' : 'middle'}>
                  {o.name}
                </text>
                <text x={x} y={yTop + 6} fill="rgba(230,237,244,0.45)" fontFamily={IDENTITY.fontMono} fontSize={15}
                  letterSpacing="0.1em" textAnchor={i === objects.length - 1 ? 'end' : 'middle'}>
                  {o.sub}
                </text>
              </g>
            );
          })}

          <g opacity={easeOutCubic(prog(t, 6.4, 7.6))}>
            <RuleLine x1={116} y1={1706} x2={1324} y2={1706} color="rgba(230,237,244,0.25)" />
            <text x={116} y={1790} fill="rgba(230,237,244,0.9)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={46}>
              Teleskop bukan mesin waktu. Ia hanya mengumpulkan cahaya yang sudah tua.
            </text>
            <Mono x={116} y={1850} text="SEMAKIN JAUH YANG KAMU LIHAT, SEMAKIN TUA YANG KAMU LIHAT" size={16}
              color="rgba(230,237,244,0.45)" tracking={0.22} />
          </g>
          <ChapterEyebrow index={2} localSec={t} x={116} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 04 — MENGELILINGI BAYANGAN
// ============================================================================
export const Scene04: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(3);
  const cx = 720;
  const cy = 1150;
  const R = 400;
  const ang = -1.1 + t * 0.26;
  const ex = cx + Math.cos(ang) * R;
  const ey = cy + Math.sin(ang) * R;

  return (
    <Stage i={3}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="steel-brushed" texOpacity={0.14}
        light={{ x: cx, y: cy, rx: 700, ry: 700, color: 'rgba(120,170,200,0.12)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={170} t={t} opacity={0.55} tintA="#CFE0EC" />
        <Camera localSec={t} dur={dur} push={0.05} drift={7}>
          <ChapterHead i={3} t={t} y={560} size={100} />

          {[0, 1, 2].map((k) => {
            const p = (t * 0.24 + k / 3) % 1;
            return (
              <circle key={k} cx={cx} cy={cy} r={lerp(120, R + 240, p)} fill="none" stroke={art.accent}
                strokeWidth={2.6 * (1 - p)} opacity={0.45 * (1 - p)} />
            );
          })}

          <g opacity={0.85}>
            <ellipse cx={cx} cy={cy} rx={R} ry={R} fill="none" stroke="rgba(220,231,236,0.4)" strokeWidth={1.6} />
            <TickRule x1={cx - R} y1={cy - R} x2={cx + R} y2={cy - R} major={12} minor={3} color="rgba(220,231,236,0.25)" labelSize={12} />
            <TickRule x1={cx + R} y1={cy - R} x2={cx + R} y2={cy + R} major={12} minor={3} color="rgba(220,231,236,0.25)" labelSize={12} />
            <TickRule x1={cx + R} y1={cy + R} x2={cx - R} y2={cy + R} major={12} minor={3} color="rgba(220,231,236,0.25)" labelSize={12} />
            <TickRule x1={cx - R} y1={cy + R} x2={cx - R} y2={cy - R} major={12} minor={3} color="rgba(220,231,236,0.25)" labelSize={12} />
          </g>

          <GhostSun cx={cx} cy={cy} r={104} t={t} color={art.accent} />
          <Mono x={cx} y={cy - 132} text="TITIK KOSONG" size={16} color="rgba(220,231,236,0.5)" tracking={0.24} anchor="middle" />

          <path d={`M ${cx + Math.cos(ang - 0.8) * R} ${cy + Math.sin(ang - 0.8) * R} A ${R} ${R} 0 0 1 ${ex} ${ey}`}
            fill="none" stroke={art.ink} strokeWidth={3.4} opacity={0.55} strokeLinecap="round" />
          <EarthGlobe cx={ex} cy={ey} r={36} t={t} terminator={0.45} />

          <LeaderLabel from={[cx + 210, cy - 190]} to={[cx + 300, cy - 340]} text="GRAVITASI = CAHAYA" sub="keduanya 299.792 km/detik"
            anchor="start" progress={prog(t, 2.2, 3.4)} color="rgba(226,238,244,0.8)" />
          <LeaderLabel from={[ex, ey]} to={[ex + 60, ey - 210]} text="ORBIT MASIH BERJALAN" sub="mengelilingi ketiadaan"
            anchor="start" progress={prog(t, 4.6, 5.8)} color="rgba(226,238,244,0.8)" />

          <g opacity={easeOutCubic(prog(t, 0.8, 1.8))}>
            <Mono x={116} y={1830} text="T − 8:19" size={22} color={art.accent} tracking={0.3} />
            <Mono x={116} y={1888} text="BUMI BELUM TAHU APA PUN" size={17} color="rgba(220,231,236,0.45)" tracking={0.22} />
          </g>
          <ChapterEyebrow index={3} localSec={t} x={116} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 05 — ORBIT LEPAS
// ============================================================================
export const Scene05: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(4);
  const sx = 300;
  const sy = 1420;
  const launch = easeOutCubic(prog(t, 1.2, 3.6));

  return (
    <Stage i={4}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="glass-mist" texOpacity={0.08}
        light={{ x: 980, y: 1200, rx: 900, ry: 700, color: 'rgba(140,180,210,0.12)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={150} t={t} opacity={0.5} tintA="#D6E4F0" />
        <g opacity={0.55}>
          {Array.from({ length: 56 }).map((_, i) => {
            const y = 340 + hash(i, 31) * 1700;
            const len = 100 + hash(i, 32) * 520;
            const sp = 260 + hash(i, 33) * 480;
            const x = ((hash(i, 34) * 2000 + t * sp) % 2000) - 280;
            return <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke="rgba(200,222,240,0.2)" strokeWidth={1 + hash(i, 35) * 1.5} strokeLinecap="round" />;
          })}
        </g>
        <Camera localSec={t} dur={dur} push={0.045} drift={9}>
          <ChapterHead i={4} t={t} y={560} size={104} />
          <path d={`M -220 700 A 720 720 0 0 0 ${sx} ${sy}`} fill="none" stroke={art.soft} strokeWidth={2} strokeDasharray="9 13" opacity={0.5} />
          <Mono x={140} y={1240} text="ORBIT LAMA" size={16} color={art.soft} tracking={0.26} />

          <VectorArrow x1={sx} y1={sy} x2={sx + 920} y2={sy - 400} color={art.accent} width={5} progress={prog(t, 1.2, 3.4)} head={34} />
          <EarthGlobe cx={sx + 920 * launch} cy={sy - 400 * launch} r={30} t={t} terminator={0.5} />

          <g opacity={easeOutCubic(prog(t, 3.2, 4.2))}>
            <Mono x={116} y={1680} text="KECEPATAN LEPAS" size={18} color={art.soft} tracking={0.28} />
            <Counter x={108} y={1876} from={0} to={107000} localSec={t} startSec={3.2} durSec={2.4}
              size={172} color={art.ink} weight={400} />
            <Mono x={116} y={1938} text="KILOMETER / JAM" size={26} color={art.accent} tracking={0.22} />
            <Mono x={1324} y={1876} text="≈ 29,8 KM / DETIK" size={20} color="rgba(233,238,244,0.45)" tracking={0.16} anchor="end" />
          </g>

          <g opacity={easeOutCubic(prog(t, 5.6, 6.8))}>
            <Brackets x={116} y={800} w={620} h={190} color="rgba(143,180,201,0.5)" size={22} />
            <Mono x={140} y={858} text="TANPA PUSAT" size={18} color={art.accent} tracking={0.3} />
            <text x={140} y={930} fill="rgba(233,238,244,0.75)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
              tidak ada yang menarik
            </text>
            <text x={140} y={972} fill="rgba(233,238,244,0.75)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
              kita kembali.
            </text>
          </g>
          <ChapterEyebrow index={4} localSec={t} x={116} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 06 — MINGGU PERTAMA
// ============================================================================
export const Scene06: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(5);
  const fall = easeOutCubic(prog(t, 1.0, 5.4));
  const temp = lerp(15, -18, fall);

  // cooling curve: day -> celsius
  const pts: readonly [number, number][] = [
    [0, 15],
    [0.5, 6],
    [1, -2],
    [2, -9],
    [4, -14],
    [7, -18],
    [14, -26],
    [30, -40],
    [90, -58],
    [180, -66],
    [365, -73],
  ];
  const gx0 = 150;
  const gx1 = 1290;
  const gy0 = 1780;
  const gy1 = 1180;
  const px = (d: number) => gx0 + (Math.log10(d + 1) / Math.log10(366)) * (gx1 - gx0);
  const py = (c: number) => gy0 - ((c + 80) / 100) * (gy0 - gy1);
  const path = pts.map(([d, c], i) => `${i === 0 ? 'M' : 'L'} ${px(d)} ${py(c)}`).join(' ');

  return (
    <Stage i={5}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="glass-mist" texOpacity={0.16}
        light={{ x: 420, y: 760, rx: 780, ry: 720, color: 'rgba(120,170,200,0.10)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={80} t={t} opacity={0.28} tintA="#CFE0EC" />
        <Camera localSec={t} dur={dur} push={0.04} drift={8}>
          <ChapterHead i={5} t={t} y={560} size={104} />

          <ThermoGauge x={1076} y={820} h={620} value={temp} min={-100} max={30} color={art.accent} cold="#2F6E92" t={t} />
          <Mono x={1076} y={1580} text="SUHU RATA-RATA" size={16} color="rgba(226,240,248,0.45)" tracking={0.24} anchor="middle" />

          <g opacity={easeOutCubic(prog(t, 0.4, 1.4))}>
            <BigNumber x={108} y={980} value={temp > -0.5 ? `+${Math.round(temp)}` : `${Math.round(temp)}`} size={260} color={art.ink} />
            <BigNumber x={452} y={900} value="°C" size={112} color={art.accent} />
            <RuleLine x1={116} y1={1024} x2={900} y2={1024} color="rgba(212,232,242,0.24)" />
          </g>

          {/* cooling curve */}
          <g opacity={easeOutCubic(prog(t, 1.2, 2.2))}>
            <Mono x={150} y={1140} text="KURVA PENDINGINAN · HARI → SUHU" size={16} color="rgba(226,240,248,0.45)" tracking={0.22} />
            <line x1={gx0} y1={gy0} x2={gx1} y2={gy0} stroke="rgba(212,232,242,0.3)" strokeWidth={1.6} />
            <line x1={gx0} y1={gy0} x2={gx0} y2={gy1 - 40} stroke="rgba(212,232,242,0.3)" strokeWidth={1.6} />
            {[20, 0, -20, -40, -60, -80].map((c) => (
              <g key={c}>
                <line x1={gx0 - 8} y1={py(c)} x2={gx0} y2={py(c)} stroke="rgba(212,232,242,0.35)" strokeWidth={1.2} />
                <text x={gx0 - 18} y={py(c) + 6} fill="rgba(212,232,242,0.45)" fontFamily={IDENTITY.fontMono} fontSize={14} textAnchor="end">
                  {c}
                </text>
              </g>
            ))}
            {[1, 7, 30, 365].map((d) => (
              <g key={d}>
                <line x1={px(d)} y1={gy0} x2={px(d)} y2={gy0 + 8} stroke="rgba(212,232,242,0.35)" strokeWidth={1.2} />
                <text x={px(d)} y={gy0 + 34} fill="rgba(212,232,242,0.45)" fontFamily={IDENTITY.fontMono} fontSize={14} textAnchor="middle">
                  {d === 365 ? '1 th' : `${d} hr`}
                </text>
              </g>
            ))}
            <path d={path} fill="none" stroke={art.accent} strokeWidth={3}
              strokeDasharray="1600" strokeDashoffset={1600 * (1 - easeOutCubic(prog(t, 2.2, 5.2)))} strokeLinecap="round" />
            {pts.map(([d, c], i) => (
              <circle key={i} cx={px(d)} cy={py(c)} r={4} fill={art.ink} opacity={0.6 * easeOutCubic(prog(t, 2.2 + i * 0.12, 2.6 + i * 0.12))} />
            ))}
          </g>

          <g opacity={easeOutCubic(prog(t, 6.2, 7.2))}>
            <text x={116} y={1900} fill="rgba(226,240,248,0.85)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={40}>
              Fotosintesis berhenti lebih dulu daripada dinginnya.
            </text>
          </g>
          <ChapterEyebrow index={5} localSec={t} x={116} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 07 — BULAN IKUT PADAM
// ============================================================================
export const Scene07: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(6);
  const fade = easeOutCubic(prog(t, 2.0, 6.2));
  const moonPhase = clamp01(1 - fade);

  return (
    <Stage i={6}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="wall-plaster" texOpacity={0.12}
        light={{ x: 820, y: 900, rx: 820, ry: 820, color: `rgba(190,205,230,${0.14 * (0.4 + moonPhase)})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={260} t={t} opacity={0.5 + fade * 0.45} tintA="#D8E2EE" band />
        <Camera localSec={t} dur={dur} push={0.045} drift={7}>
          <ChapterHead i={6} t={t} y={560} size={104} />

          <g opacity={1 - fade * 0.55}>
            <MoonDisc cx={720} cy={1180} r={210} t={t} phase={moonPhase} opacity={0.35 + 0.65 * (1 - fade)} tint="#D9DEE4" />
          </g>
          <g opacity={fade}>
            <circle cx={720} cy={1180} r={212} fill="none" stroke="rgba(200,212,232,0.35)" strokeWidth={1.6} strokeDasharray="12 14" />
            <Mono x={720} y={1440} text="CAHAYA PANTULAN HABIS" size={17} color="rgba(200,212,232,0.55)" tracking={0.24} anchor="middle" />
          </g>

          <LeaderLabel from={[900, 1010]} to={[1080, 900]} text="ALBEDO 0,12" sub="bulan hanya memantulkan 12%" anchor="start"
            progress={prog(t, 1.6, 2.8)} color="rgba(216,226,238,0.8)" />
          <LeaderLabel from={[520, 1330]} to={[300, 1430]} text="TANPA SUMBER" sub="tidak ada cahaya baru" anchor="end"
            progress={prog(t, 5.0, 6.2)} color="rgba(216,226,238,0.8)" />

          <g opacity={easeOutCubic(prog(t, 6.6, 7.8))}>
            <RuleLine x1={116} y1={1680} x2={1324} y2={1680} color="rgba(216,226,238,0.25)" />
            <text x={116} y={1770} fill="rgba(216,226,238,0.9)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={46}>
              Langit jadi hitam, dan hanya bintang
            </text>
            <text x={116} y={1830} fill="rgba(216,226,238,0.6)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={46}>
              yang tersisa — terlalu redup untuk membaca.
            </text>
          </g>
          <ChapterEyebrow index={6} localSec={t} x={116} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 08 — TAHUN PERTAMA
// ============================================================================
export const Scene08: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(7);
  const ice = easeOutCubic(prog(t, 0.6, 4.6));

  return (
    <Stage i={7}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="concrete" texOpacity={0.14}
        light={{ x: 720, y: 1500, rx: 820, ry: 520, color: 'rgba(255,140,60,0.10)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={90} t={t} opacity={0.28} tintA="#D3E4EE" />
        <Camera localSec={t} dur={dur} push={0.05} drift={7}>
          <ChapterHead i={7} t={t} y={600} size={112} />

          {/* ocean cross section with explicit layer labels */}
          <g>
            <rect x={116} y={860} width={1208} height={620} fill="#071822" />
            <rect x={116} y={860} width={1208} height={28 + 84 * ice} fill="#9CC2D6" opacity={0.92} />
            {Array.from({ length: 26 }).map((_, i) => (
              <line key={i} x1={116 + hash(i, 3, 2) * 1208} y1={880 + hash(i, 4, 2) * (20 + 70 * ice)}
                x2={116 + hash(i, 3, 2) * 1208 + 90} y2={890 + hash(i, 4, 2) * (20 + 70 * ice)} stroke="rgba(240,252,255,0.5)" strokeWidth={1.1}
                opacity={0.4 * ice} />
            ))}
            <ellipse cx={720} cy={1480} rx={520} ry={110} fill="rgba(255,140,60,0.16)" />
            <path d="M 116 1480 L 116 1436 Q 420 1400 720 1424 T 1324 1440 L 1324 1480 Z" fill="#0A1A24" />
            <rect x={116} y={860} width={1208} height={620} fill="none" stroke={art.accent} strokeWidth={1.2} opacity={0.3} />
            <Mono x={128} y={842} text="PENAMPANG · 0 – 4 KM" size={15} color="rgba(226,240,248,0.4)" tracking={0.22} />
          </g>
          <LeaderLabel from={[520, 900]} to={[300, 800]} text="ES LAUT 1–2 M" sub="terbentuk dari atas" anchor="end"
            progress={prog(t, 3.2, 4.2)} color="rgba(226,240,248,0.8)" />
          <LeaderLabel from={[880, 1240]} to={[1140, 1160]} text="AIR CAIR" sub="ratusan ribu tahun" anchor="start"
            progress={prog(t, 4.2, 5.2)} color="rgba(226,240,248,0.8)" />
          <LeaderLabel from={[720, 1440]} to={[1000, 1520]} text="PANAS INTI BUMI" sub="0,087 W/m²" anchor="start"
            progress={prog(t, 5.4, 6.4)} color="rgba(250,190,150,0.85)" />

          <g opacity={easeOutCubic(prog(t, 1.4, 2.4))}>
            <Counter x={108} y={1720} from={0} to={-73} localSec={t} startSec={1.4} durSec={2.0}
              format={(v) => `${Math.round(v)}`} size={196} color={art.ink} weight={400} />
            <BigNumber x={520} y={1650} value="°C" size={104} color={art.accent} />
            <Mono x={116} y={1790} text="SUHU PERMUKAAN SETELAH SETAHUN" size={17} color="rgba(226,240,248,0.45)" tracking={0.2} />
          </g>
          <ChapterEyebrow index={7} localSec={t} x={116} />
        </Camera>
      </svg>
    </Stage>
  );
};
