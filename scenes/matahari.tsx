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
import { Backdrop, Camera, ChapterEyebrow, DustMotes, FilmGrain, LeaderLabel, Mono, RuleLine, useChapterClock } from './kit';
import { BigNumber, Brackets, Corona4K, EarthGlobe, MilkyWay, MoonDisc, PhotonPacket, Prominence, StarField, SunCore, TickRule } from './graphics';
import { Counter, GhostSun, ThermoGauge, VectorArrow } from './sol';

// ============================================================================
// furniture — crop marks, slug, pips. the frame should look ruled, not empty.
// ============================================================================
export const Furniture: React.FC<{ i: number; t: number; color: string; note?: string }> = ({ i, t, color, note }) => (
  <g opacity={easeOutCubic(prog(t, 0.2, 1.2))}>
    {[
      [40, 40, 1, 1],
      [1400, 40, -1, 1],
      [40, 2000, 1, -1],
      [1400, 2000, -1, -1],
    ].map(([x, y, sx, sy], k) => (
      <g key={k} stroke="rgba(238,228,208,0.28)" strokeWidth={1.6}>
        <line x1={x} y1={y} x2={x + sx * 26} y2={y} />
        <line x1={x} y1={y} x2={x} y2={y + sy * 26} />
      </g>
    ))}
    <Mono x={40} y={1958} text={`BAB ${String(i + 1).padStart(2, '0')} — ${CHAPTERS[i].slug.toUpperCase()}`} size={17} color="rgba(238,228,208,0.34)" tracking={0.24} />
    {note && <Mono x={1400} y={1958} text={note} size={17} color="rgba(238,228,208,0.3)" tracking={0.2} anchor="end" />}
    {Array.from({ length: 12 }).map((_, k) => (
      <rect key={k} x={40 + k * 20} y={1990} width={12} height={3} fill={k === i ? color : 'rgba(238,228,208,0.22)'} />
    ))}
  </g>
);

export const Stage: React.FC<{ i: number; children: React.ReactNode; note?: string }> = ({ i, children, note }) => {
  const ch = CHAPTERS[i];
  return (
    <AbsoluteFill style={{ backgroundColor: ch.groundBottom, overflow: 'hidden' }}>
      {children}
      <DustMotes count={20} seed={i + 5} y0={280} y1={1860} color="rgba(244,232,208,0.18)" />
      <FilmGrain opacity={0.11} scale={196} />
    </AbsoluteFill>
  );
};

const Head: React.FC<{ i: number; t: number; y?: number; size?: number }> = ({ i, t, y = 640, size = 92 }) => {
  const art = CHAPTER_ART[i];
  const p = easeOutCubic(prog(t, 0.2, 1.2));
  return (
    <g opacity={p} transform={`translate(0 ${(1 - p) * 16})`}>
      <Mono x={116} y={y - 92} text={`${String(i + 1).padStart(2, '0')} / 12`} size={20} color={art.accent} tracking={0.3} />
      <text x={110} y={y} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={size} letterSpacing="0.014em">
        {CHAPTER_TITLES[i]}
      </text>
      <text x={116} y={y + 50} fill="rgba(240,232,216,0.46)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={32}>
        {CHAPTER_KICKERS[i]}
      </text>
    </g>
  );
};

// ============================================================================
// 01 — CAHAYA YANG TERLAMBAT
// ============================================================================
export const Scene01: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(0);
  const off = prog(t, 9.4, 10.4);
  const alive = 1 - off;
  const reveal = easeOutCubic(prog(t, 0.1, 1.2));

  return (
    <Stage i={0} note="PLAT 01 · KORONA">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="ink-wash" texOpacity={0.26}
        light={{ x: 720, y: 1120, rx: 900, ry: 900, color: `rgba(255,176,80,${0.3 * alive})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={150} t={t} opacity={0.32 + off * 0.5} />
        <Camera localSec={t} dur={dur} push={0.055} drift={9}>
          <Head i={0} t={t} y={640} size={96} />

          {/* plate: punch holes + ruled border */}
          <g opacity={reveal}>
            <rect x={214} y={766} width={1012} height={1012} fill="rgba(10,8,6,0.38)" stroke="rgba(233,214,186,0.22)" strokeWidth={1.4} />
            {[0, 1, 2, 3].map((k) => (
              <g key={k} opacity={0.55}>
                <line x1={214} y1={766 + k * 337} x2={1226} y2={766 + k * 337} stroke="rgba(233,214,186,0.05)" strokeWidth={1} />
                <line x1={214 + k * 337} y1={766} x2={214 + k * 337} y2={1778} stroke="rgba(233,214,186,0.05)" strokeWidth={1} />
              </g>
            ))}
            <Mono x={214} y={740} text="PELAT FOTOGRAFI · 1/2000 s" size={20} color="rgba(233,214,186,0.5)" tracking={0.26} />
            <Mono x={1226} y={740} text="F/8 · ISO 100" size={20} color="rgba(233,214,186,0.4)" tracking={0.24} anchor="end" />
          </g>

          <Corona4K cx={720} cy={1268} r={296} t={t} strength={0.95 * alive} rays={120} />
          <SunCore cx={720} cy={1268} r={296} t={t} alive={alive} cores={240} spots={4} />
          <Prominence cx={720} cy={1268} r={296} angle={-0.55} height={150} t={t} phase={0.4} />
          <Prominence cx={720} cy={1268} r={296} angle={2.45} height={112} t={t} phase={2.1} />
          <Prominence cx={720} cy={1268} r={296} angle={-2.2} height={88} t={t} phase={4.2} />
          <circle cx={720} cy={1268} r={296} fill="none" stroke="rgba(255,236,196,0.55)" strokeWidth={2} />
          {off > 0.12 && <GhostSun cx={720} cy={1268} r={296} t={t} color={art.accent} />}

          {/* light already in flight toward the lower left */}
          <g opacity={easeOutCubic(prog(t, 1.2, 2.2))}>
            {[0.1, 0.32, 0.54, 0.76].map((k, i) => (
              <PhotonPacket key={i} x1={720} y1={1268} x2={190} y2={1830} head={(t * 0.2 + k) % 1}
                color={i % 2 === 0 ? '#FFD79A' : '#FFB463'} trail={300 - i * 40} width={2.6} />
            ))}
            <TickRule x1={190} y1={1856} x2={1250} y2={1856} major={8} minor={4} color="rgba(226,206,172,0.45)"
              labels={['0', '', '', '', '', '', '', '', '8:20']} labelSize={24} progress={prog(t, 2.0, 3.4)} />
            <Mono x={190} y={1824} text="CAHAYA TERAKHIR" size={20} color={art.soft} tracking={0.26} />
          </g>
          <ChapterEyebrow index={0} localSec={t} x={116} />
        </Camera>
        <Furniture i={0} t={t} color={art.accent} note="499,0 S DARI MATAHARI" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 02 — 499 DETIK
// ============================================================================
export const Scene02: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(1);
  const rows = [
    { label: 'JARAK MATAHARI – BUMI', unit: 'KM', at: 0.5, to: 149600000 },
    { label: 'KECEPATAN CAHAYA', unit: 'KM / DETIK', at: 2.4, to: 299792 },
  ];

  return (
    <Stage i={1} note="ARITMETIKA CAHAYA">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="brass-brushed" texOpacity={0.2}
        light={{ x: 320, y: 720, rx: 860, ry: 820, color: 'rgba(255,196,110,0.13)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        {/* engraved arc texture instead of bokeh */}
        <g opacity={0.3}>
          {Array.from({ length: 9 }).map((_, k) => (
            <circle key={k} cx={1180} cy={980} r={330 + k * 78} fill="none" stroke="rgba(255,214,150,0.12)" strokeWidth={1} />
          ))}
        </g>
        <Camera localSec={t} dur={dur} push={0.03} drift={6}>
          <Head i={1} t={t} y={640} size={96} />

          {rows.map((r, i) => {
            const y = 900 + i * 400;
            const p = easeOutCubic(prog(t, r.at, r.at + 1.4));
            return (
              <g key={r.label} opacity={clamp01(p * 1.8)}>
                <Mono x={116} y={y - 128} text={r.label} size={22} color={art.soft} tracking={0.28} />
                <Mono x={1324} y={y - 128} text={`0${i + 1}`} size={22} color="rgba(241,231,210,0.32)" tracking={0.3} anchor="end" />
                <Counter x={110} y={y} from={0} to={r.to} localSec={t} startSec={r.at} durSec={1.4} size={112} color="rgba(243,233,214,0.96)" weight={400} />
                <Mono x={1324} y={y} text={r.unit} size={26} color="rgba(243,233,214,0.42)" tracking={0.18} anchor="end" />
                <RuleLine x1={116} y1={y + 56} x2={1324} y2={y + 56} color="rgba(226,206,172,0.24)" />
              </g>
            );
          })}

          <g opacity={easeOutCubic(prog(t, 4.2, 5.0))}>
            <line x1={116} y1={1348} x2={1324} y2={1348} stroke={art.accent} strokeWidth={2} opacity={0.5} />
            <Mono x={116} y={1404} text="÷" size={52} color={art.accent} tracking={0} />
            <Mono x={180} y={1400} text="149.600.000 ÷ 299.792" size={28} color="rgba(243,233,214,0.6)" tracking={0.06} />
          </g>

          <g opacity={easeOutCubic(prog(t, 5.0, 6.0))}>
            <Mono x={116} y={1520} text="HASIL" size={22} color={art.accent} tracking={0.3} />
            <Counter x={104} y={1780} from={0} to={499} localSec={t} startSec={5.0} durSec={1.8} size={290} color={art.ink} weight={400} tracking="-0.035em" />
            <Mono x={1324} y={1706} text="DETIK" size={44} color="rgba(243,233,214,0.45)" tracking={0.2} anchor="end" />
            <RuleLine x1={116} y1={1840} x2={1324} y2={1840} color="rgba(226,206,172,0.28)" />
            <text x={116} y={1906} fill="rgba(243,233,214,0.66)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
              499 detik. Matahari yang kamu lihat selalu terlambat.
            </text>
          </g>
          <ChapterEyebrow index={1} localSec={t} x={116} />
        </Camera>
        <Furniture i={1} t={t} color={art.accent} note="c = 299.792 km/s" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 03 — MELIHAT MASA LALU
// ============================================================================
export const Scene03: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(2);
  const baseY = 1520;
  const x0 = 150;
  const x1 = 1290;
  const logMin = -1.7;
  const logMax = 6.7;
  const lx = (ly: number) => x0 + ((Math.log10(ly) - logMin) / (logMax - logMin)) * (x1 - x0);

  const objects = [
    { name: 'MATAHARI', ly: 1.58e-5, sub: '8,3 menit', at: 0.5, up: true },
    { name: 'PROXIMA CENTAURI', ly: 4.24, sub: '4,2 tahun', at: 2.0, up: false },
    { name: 'BETELGEUSE', ly: 548, sub: '548 tahun', at: 3.6, up: true },
    { name: 'ANDROMEDA', ly: 2.5e6, sub: '2,5 juta tahun', at: 5.2, up: false },
  ];

  return (
    <Stage i={2} note="SKALA LOGARITMIS">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="paper-fibre" texOpacity={0.12}
        light={{ x: 900, y: 960, rx: 820, ry: 820, color: 'rgba(150,180,215,0.13)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={420} t={t} opacity={0.95} band tintB="#F6E3C4" />
        <MilkyWay t={t} opacity={0.55} />
        <Camera localSec={t} dur={dur} push={0.04} drift={8}>
          <Head i={2} t={t} y={640} size={96} />

          {/* constellation guides */}
          <g opacity={0.35} stroke="#9FB4CC" strokeWidth={1.2}>
            <path d="M 180 900 L 320 800 L 470 860 L 560 760 L 700 830" fill="none" />
            <path d="M 760 1780 L 880 1700 L 1010 1760 L 1120 1680" fill="none" />
            <path d="M 1180 980 L 1280 1060 L 1220 1180" fill="none" />
          </g>
          {[[180, 900], [320, 800], [470, 860], [560, 760], [700, 830], [760, 1780], [880, 1700], [1010, 1760], [1120, 1680], [1180, 980], [1280, 1060], [1220, 1180]].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={3 + (k % 3)} fill="#EAF1F8" opacity={0.75} />
          ))}

          <TickRule x1={x0} y1={baseY} x2={x1} y2={baseY} major={4} minor={4} color="rgba(230,237,244,0.5)"
            labels={['1 hr', '1 th', '1 rb th', '1 jt th', '1 M th']} labelSize={23} progress={prog(t, 0.3, 2.0)} />
          <Mono x={x0} y={baseY + 108} text="SKALA LOGARITMIS · JARAK CAHAYA" size={20} color="rgba(230,237,244,0.42)" tracking={0.24} />

          {objects.map((o, i) => {
            const p = easeOutCubic(prog(t, o.at, o.at + 1.0));
            const x = lx(o.ly);
            const yTop = baseY - (o.up ? 230 : 140);
            const anchor: 'start' | 'middle' | 'end' = i === objects.length - 1 ? 'end' : i === 0 ? 'start' : 'middle';
            const tx = anchor === 'end' ? x + 10 : anchor === 'start' ? x - 10 : x;
            return (
              <g key={o.name} opacity={clamp01(p * 1.6)}>
                <line x1={x} y1={baseY} x2={x} y2={lerp(baseY, yTop, p)} stroke={art.accent} strokeWidth={1.8} />
                <circle cx={x} cy={baseY} r={i === 0 ? 10 : 7} fill={i === 0 ? '#FFD79A' : art.accent} />
                <circle cx={x} cy={baseY} r={i === 0 ? 26 : 16} fill={i === 0 ? 'rgba(255,190,110,0.18)' : 'rgba(143,169,196,0.14)'} />
                <text x={tx} y={yTop - 26} fill={art.ink} fontFamily={IDENTITY.fontMono} fontSize={22} letterSpacing="0.16em" textAnchor={anchor}>
                  {o.name}
                </text>
                <text x={tx} y={yTop } fill="rgba(230,237,244,0.5)" fontFamily={IDENTITY.fontMono} fontSize={19} letterSpacing="0.08em" textAnchor={anchor}>
                  {o.sub}
                </text>
              </g>
            );
          })}

          <g opacity={easeOutCubic(prog(t, 6.2, 7.4))}>
            <RuleLine x1={116} y1={1720} x2={1324} y2={1720} color="rgba(230,237,244,0.26)" />
            <text x={116} y={1800} fill="rgba(230,237,244,0.92)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={42}>
              Teleskop bukan mesin waktu.
            </text>
            <text x={116} y={1856} fill="rgba(230,237,244,0.6)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={42}>
              Ia hanya mengumpulkan cahaya yang sudah tua.
            </text>
          </g>
          <ChapterEyebrow index={2} localSec={t} x={116} />
        </Camera>
        <Furniture i={2} t={t} color={art.accent} note="1 TH CAHAYA = 9,46 × 10¹² KM" />
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
  const cy = 1180;
  const R = 392;
  const ang = -1.15 + t * 0.26;
  const ex = cx + Math.cos(ang) * R;
  const ey = cy + Math.sin(ang) * R;

  return (
    <Stage i={3} note="GRAVITASI = c">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="steel-brushed" texOpacity={0.14}
        light={{ x: cx, y: cy, rx: 720, ry: 720, color: 'rgba(120,170,200,0.14)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={220} t={t} opacity={0.7} tintA="#CFE0EC" />
        <Camera localSec={t} dur={dur} push={0.05} drift={7}>
          <Head i={3} t={t} y={640} size={92} />

          {[0, 1, 2].map((k) => {
            const p = (t * 0.22 + k / 3) % 1;
            return <circle key={k} cx={cx} cy={cy} r={lerp(130, R + 250, p)} fill="none" stroke={art.accent} strokeWidth={3 * (1 - p)} opacity={0.5 * (1 - p)} />;
          })}

          <g opacity={0.9}>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(220,231,236,0.42)" strokeWidth={1.8} />
            <circle cx={cx} cy={cy} r={R * 0.62} fill="none" stroke="rgba(220,231,236,0.16)" strokeWidth={1.2} />
            <TickRule x1={cx - R} y1={cy - R} x2={cx + R} y2={cy - R} major={10} minor={4} color="rgba(220,231,236,0.3)" labelSize={14} />
            <TickRule x1={cx + R} y1={cy + R} x2={cx - R} y2={cy + R} major={10} minor={4} color="rgba(220,231,236,0.3)" labelSize={14} />
          </g>

          <GhostSun cx={cx} cy={cy} r={112} t={t} color={art.accent} />
          <Mono x={cx} y={cy + 196} text="TITIK KOSONG" size={20} color="rgba(220,231,236,0.55)" tracking={0.24} anchor="middle" />

          <path d={`M ${cx + Math.cos(ang - 0.8) * R} ${cy + Math.sin(ang - 0.8) * R} A ${R} ${R} 0 0 1 ${ex} ${ey}`}
            fill="none" stroke={art.ink} strokeWidth={4} opacity={0.6} strokeLinecap="round" />
          <EarthGlobe cx={ex} cy={ey} r={46} t={t} terminator={0.45} atmosphere={0.45} />

          <LeaderLabel from={[cx + 250, cy - 250]} to={[cx + 356, cy - 420]} text="GRAVITASI = CAHAYA" sub="keduanya 299.792 km/detik" anchor="start"
            progress={prog(t, 2.2, 3.4)} color="rgba(226,238,244,0.85)" size={22} />
          <LeaderLabel from={[ex, ey]} to={[ex + 40, ey - 230]} text="ORBIT MASIH BERJALAN" sub="mengelilingi ketiadaan" anchor="start"
            progress={prog(t, 4.6, 5.8)} color="rgba(226,238,244,0.85)" size={22} />

          <g opacity={easeOutCubic(prog(t, 0.8, 1.8))}>
            <Mono x={116} y={1800} text="T − 8:19" size={30} color={art.accent} tracking={0.28} />
            <Mono x={116} y={1852} text="BUMI BELUM TAHU APA PUN" size={21} color="rgba(220,231,236,0.45)" tracking={0.2} />
          </g>
          <ChapterEyebrow index={3} localSec={t} x={116} />
        </Camera>
        <Furniture i={3} t={t} color={art.accent} note="ORBIT 365,25 HARI · 29,8 KM/S" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 05 — ORBIT LEPAS
// ============================================================================
export const Scene05: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(4);
  const sx = 320;
  const sy = 1380;
  const launch = easeOutCubic(prog(t, 1.2, 3.6));

  return (
    <Stage i={4} note="VEKTOR LEPAS">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="glass-mist" texOpacity={0.07}
        light={{ x: 1180, y: 900, rx: 900, ry: 760, color: 'rgba(140,180,210,0.14)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={260} t={t} opacity={0.8} tintA="#D6E4F0" />
        <g opacity={0.7}>
          {Array.from({ length: 70 }).map((_, i) => {
            const y = 320 + hash(i, 31) * 1600;
            const len = 120 + hash(i, 32) * 620;
            const sp = 300 + hash(i, 33) * 520;
            const x = ((hash(i, 34) * 2100 + t * sp) % 2100) - 300;
            return <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke="rgba(200,222,240,0.26)" strokeWidth={1 + hash(i, 35) * 1.8} strokeLinecap="round" />;
          })}
        </g>
        <Camera localSec={t} dur={dur} push={0.05} drift={10}>
          <Head i={4} t={t} y={640} size={96} />

          {/* the sun we leave behind */}
          <g opacity={0.6}>
            <SunCore cx={-96} cy={1240} r={150} t={t} cores={90} spots={2} limb={0.9} />
            <Mono x={96} y={1330} text="MATAHARI" size={19} color="rgba(246,231,213,0.5)" tracking={0.24} />
          </g>

          <path d={`M -220 760 A 740 740 0 0 0 ${sx} ${sy}`} fill="none" stroke={art.soft} strokeWidth={2.4} strokeDasharray="10 14" opacity={0.55} />
          <Mono x={150} y={1180} text="ORBIT LAMA" size={19} color={art.soft} tracking={0.26} />

          <VectorArrow x1={sx} y1={sy} x2={sx + 900} y2={sy - 430} color={art.accent} width={7} progress={prog(t, 1.2, 3.4)} head={42} />
          <EarthGlobe cx={sx + 900 * launch} cy={sy - 430 * launch} r={42} t={t} terminator={0.5} />

          <g opacity={easeOutCubic(prog(t, 3.2, 4.2))}>
            <Mono x={116} y={1500} text="KECEPATAN LEPAS" size={22} color={art.soft} tracking={0.28} />
            <Counter x={108} y={1700} from={0} to={107000} localSec={t} startSec={3.2} durSec={2.4} size={166} color={art.ink} weight={400} />
            <Mono x={116} y={1762} text="KILOMETER / JAM" size={30} color={art.accent} tracking={0.2} />
            <Mono x={1324} y={1700} text="≈ 29,8 KM / DETIK" size={24} color="rgba(233,238,244,0.45)" tracking={0.14} anchor="end" />
          </g>

          <g opacity={easeOutCubic(prog(t, 5.6, 6.8))}>
            <Brackets x={116} y={830} w={660} h={190} color="rgba(143,180,201,0.5)" size={24} />
            <Mono x={144} y={890} text="TANPA PUSAT" size={21} color={art.accent} tracking={0.3} />
            <text x={144} y={962} fill="rgba(233,238,244,0.8)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={40}>
              tidak ada yang menarik kita kembali.
            </text>
          </g>
          <ChapterEyebrow index={4} localSec={t} x={116} />
        </Camera>
        <Furniture i={4} t={t} color={art.accent} note="T+8:20 · ORBIT DILEPAS" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 06 — MINGGU PERTAMA
// ============================================================================
export const Scene06: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(5);
  const fall = easeOutCubic(prog(t, 1.0, 5.2));
  const temp = lerp(15, -18, fall);

  const pts: readonly [number, number][] = [[0, 15], [0.5, 6], [1, -2], [2, -9], [4, -14], [7, -18], [14, -26], [30, -40], [90, -58], [180, -66], [365, -73]];
  const gx0 = 150;
  const gx1 = 1290;
  const gy0 = 1780;
  const gy1 = 1160;
  const px = (d: number) => gx0 + (Math.log10(d + 1) / Math.log10(366)) * (gx1 - gx0);
  const py = (c: number) => gy0 - ((c + 80) / 100) * (gy0 - gy1);
  const path = pts.map(([d, c], i) => `${i === 0 ? 'M' : 'L'} ${px(d)} ${py(c)}`).join(' ');

  return (
    <Stage i={5} note="KURVA PENDINGINAN">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="glass-mist" texOpacity={0.15}
        light={{ x: 400, y: 780, rx: 800, ry: 740, color: 'rgba(120,170,200,0.11)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={120} t={t} opacity={0.35} tintA="#CFE0EC" />
        <Camera localSec={t} dur={dur} push={0.04} drift={8}>
          <Head i={5} t={t} y={640} size={96} />

          <ThermoGauge x={1092} y={880} h={560} value={temp} min={-100} max={30} color={art.accent} cold="#2F6E92" t={t} />
          <Mono x={1092} y={1560} text="SUHU RATA-RATA" size={18} color="rgba(226,240,248,0.45)" tracking={0.24} anchor="middle" />

          <g opacity={easeOutCubic(prog(t, 0.4, 1.4))}>
            <BigNumber x={108} y={1010} value={temp > -0.5 ? `+${Math.round(temp)}` : `${Math.round(temp)}`} size={230} color={art.ink} />
            <BigNumber x={430} y={940} value="°C" size={100} color={art.accent} />
            <RuleLine x1={116} y1={1052} x2={860} y2={1052} color="rgba(212,232,242,0.24)" />
            <Mono x={116} y={1108} text="MINGGU 1 · RATA-RATA GLOBAL" size={20} color="rgba(226,240,248,0.5)" tracking={0.22} />
          </g>

          <g opacity={easeOutCubic(prog(t, 1.2, 2.2))}>
            <Mono x={150} y={1144} text="SUHU PERMUKAAN · HARI KE-" size={18} color="rgba(226,240,248,0.45)" tracking={0.22} />
            <line x1={gx0} y1={gy0} x2={gx1} y2={gy0} stroke="rgba(212,232,242,0.32)" strokeWidth={1.6} />
            <line x1={gx0} y1={gy0} x2={gx0} y2={gy1 - 30} stroke="rgba(212,232,242,0.32)" strokeWidth={1.6} />
            {[20, 0, -20, -40, -60, -80].map((c) => (
              <g key={c}>
                <line x1={gx0 - 10} y1={py(c)} x2={gx0} y2={py(c)} stroke="rgba(212,232,242,0.4)" strokeWidth={1.4} />
                <text x={gx0 - 22} y={py(c) + 7} fill="rgba(212,232,242,0.5)" fontFamily={IDENTITY.fontMono} fontSize={18} textAnchor="end">{c}</text>
              </g>
            ))}
            {[1, 7, 30, 365].map((d) => (
              <g key={d}>
                <line x1={px(d)} y1={gy0} x2={px(d)} y2={gy0 + 10} stroke="rgba(212,232,242,0.4)" strokeWidth={1.4} />
                <text x={px(d)} y={gy0 + 38} fill="rgba(212,232,242,0.5)" fontFamily={IDENTITY.fontMono} fontSize={18} textAnchor="middle">
                  {d === 365 ? '1 th' : `${d} hr`}
                </text>
              </g>
            ))}
            <path d={path} fill="none" stroke={art.accent} strokeWidth={3.4} strokeDasharray="1700"
              strokeDashoffset={1700 * (1 - easeOutCubic(prog(t, 2.2, 5.0)))} strokeLinecap="round" />
            {pts.map(([d, c], i) => (
              <circle key={i} cx={px(d)} cy={py(c)} r={4.5} fill={art.ink} opacity={0.65 * easeOutCubic(prog(t, 2.2 + i * 0.1, 2.5 + i * 0.1))} />
            ))}
          </g>

          <text x={116} y={1888} fill="rgba(226,240,248,0.82)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
            Fotosintesis berhenti lebih dulu daripada dinginnya.
          </text>
          <ChapterEyebrow index={5} localSec={t} x={116} />
        </Camera>
        <Furniture i={5} t={t} color={art.accent} note="−18 °C DALAM 7 HARI" />
      </svg>
    </Stage>
  );
};
