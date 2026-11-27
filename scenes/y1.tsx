import React from 'react';
import { CHAPTER_TITLES, IDENTITY, clamp01, easeOutCubic, hash, lerp, prog } from './script';
import { Backdrop, Camera, ChapterEyebrow, LeaderLabel, Mono, RuleLine, useChapterClock } from './kit';
import { BigNumber, Brackets, Corona4K, EarthGlobe, MoonDisc, StarField, SunCore, TickRule } from './graphics';
import { Furniture, Stage } from './matahari';

const Head: React.FC<{ i: number; t: number; y?: number; size?: number }> = ({ i, t, y = 640, size = 92 }) => (
  <g opacity={easeOutCubic(prog(t, 0.2, 1.2))}>
    <Mono x={116} y={y - 92} text={`${String(i + 1).padStart(2, '0')} / 12`} size={20} color="#9BB9C7" tracking={0.3} />
    <text x={110} y={y} fill="#E7EFF3" fontFamily={IDENTITY.fontDisplay} fontSize={size} letterSpacing="0.014em">
      {CHAPTER_TITLES[i]}
    </text>
  </g>
);

// ============================================================================
// 07 — BULAN IKUT PADAM
// ============================================================================
export const Scene07: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(6);
  const sweep = easeOutCubic(prog(t, 1.4, 6.0));
  const phase = 1 - sweep * 0.98;

  return (
    <Stage i={6} note="ALBEDO 0,12">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="wall-plaster" texOpacity={0.1}
        light={{ x: 760, y: 1000, rx: 860, ry: 860, color: `rgba(190,205,230,${0.16 * (0.35 + phase)})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={300} t={t} opacity={0.55 + sweep * 0.4} tintA="#D8E2EE" band />
        <Camera localSec={t} dur={dur} push={0.045} drift={7}>
          <Head i={6} t={t} y={640} size={96} />

          {/* reflected light cone from moon toward earth */}
          <g opacity={0.5 * (1 - sweep)}>
            <polygon points="560,1180 880,1180 1060,1560 380,1560" fill="rgba(200,216,235,0.08)" />
          </g>

          <MoonDisc cx={720} cy={1180} r={196} t={t} phase={phase} opacity={0.92} tint="#DEE4EC" />
          <circle cx={720} cy={1180} r={200} fill="none" stroke="rgba(210,224,240,0.28)" strokeWidth={1.6} strokeDasharray="10 14" />

          <EarthGlobe cx={720} cy={1620} r={54} t={t} terminator={0.62} atmosphere={0.8} />
          <Mono x={720} y={1706} text="BUMI · MALAM PERMANEN" size={18} color="rgba(216,226,238,0.45)" tracking={0.22} anchor="middle" />

          <LeaderLabel from={[880, 1080]} to={[1090, 990]} text="MEMANTULKAN 12%" sub="sinar matahari, bukan sinarnya sendiri" anchor="start"
            progress={prog(t, 1.0, 2.2)} color="rgba(216,226,238,0.85)" size={21} />
          <LeaderLabel from={[560, 1300]} to={[320, 1400]} text="TANPA SUMBER" sub="tidak ada cahaya baru" anchor="end"
            progress={prog(t, 4.6, 5.8)} color="rgba(216,226,238,0.85)" size={21} />

          <g opacity={easeOutCubic(prog(t, 6.4, 7.6))}>
            <RuleLine x1={116} y1={1800} x2={1324} y2={1800} color="rgba(216,226,238,0.26)" />
            <text x={116} y={1876} fill="rgba(216,226,238,0.9)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={40}>
              Yang tersisa hanya bintang — terlalu redup untuk membaca.
            </text>
          </g>
          <ChapterEyebrow index={6} localSec={t} x={116} />
        </Camera>
        <Furniture i={6} t={t} color={art.accent} note="FASE BULAN = GEOMETRI, BUKAN BAYANGAN BUMI" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 08 — TAHUN PERTAMA
// ============================================================================
export const Scene08: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(7);
  const ice = easeOutCubic(prog(t, 0.8, 4.6));
  const iceH = 30 + 96 * ice;

  return (
    <Stage i={7} note="PENAMPANG LAUT">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="concrete" texOpacity={0.12}
        light={{ x: 720, y: 1560, rx: 860, ry: 560, color: 'rgba(255,140,60,0.12)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={110} t={t} opacity={0.3} tintA="#D3E4EE" />
        <Camera localSec={t} dur={dur} push={0.05} drift={7}>
          <Head i={7} t={t} y={640} size={96} />

          {/* ocean panel */}
          <g>
            <rect x={116} y={760} width={1208} height={700} fill="#04121A" />
            <rect x={116} y={760} width={1208} height={200} fill="#061A26" />
            {Array.from({ length: 7 }).map((_, k) => (
              <line key={k} x1={116} y1={860 + k * 60} x2={1324} y2={860 + k * 60} stroke="rgba(120,170,200,0.10)" strokeWidth={1} strokeDasharray="6 10" />
            ))}
            <rect x={116} y={760} width={1208} height={iceH} fill="#BBD8E6" />
            <rect x={116} y={760} width={1208} height={10} fill="#EAF6FB" opacity={0.9} />
            {Array.from({ length: 34 }).map((_, k) => {
              const x = 116 + hash(k, 3, 2) * 1208;
              return <line key={k} x1={x} y1={766} x2={x + 70 + hash(k, 5) * 90} y2={766 + iceH * (0.3 + hash(k, 4) * 0.5)}
                stroke="rgba(240,252,255,0.55)" strokeWidth={1.2} opacity={0.4 * ice} />;
            })}
            {/* seafloor + vent glow */}
            <path d={`M 116 ${1460} Q 380 1418 620 1452 T 980 1436 T 1324 1456 L 1324 1460 Z`} fill="#0A1A24" />
            <ellipse cx={700} cy={1430} rx={250} ry={54} fill="rgba(255,140,60,0.22)" />
            <ellipse cx={700} cy={1430} rx={120} ry={26} fill="rgba(255,178,110,0.28)" />
            <rect x={116} y={760} width={1208} height={700} fill="none" stroke="rgba(155,185,199,0.3)" strokeWidth={1.4} />
            <Mono x={128} y={742} text="PENAMPANG VERTIKAL · 0 – 4 KM" size={18} color="rgba(226,240,248,0.42)" tracking={0.22} />
          </g>

          <LeaderLabel from={[520, 800]} to={[300, 700]} text="ES 1–2 M" sub="terbentuk dari atas" anchor="end" progress={prog(t, 3.0, 4.0)} color="rgba(226,240,248,0.85)" size={21} />
          <LeaderLabel from={[900, 1240]} to={[1150, 1140]} text="AIR CAIR" sub="ratusan ribu tahun" anchor="start" progress={prog(t, 4.0, 5.0)} color="rgba(226,240,248,0.85)" size={21} />
          <LeaderLabel from={[700, 1420]} to={[980, 1330]} text="PANAS INTI BUMI" sub="0,087 W/m²" anchor="start" progress={prog(t, 5.2, 6.2)} color="rgba(250,190,150,0.9)" size={21} />

          <g opacity={easeOutCubic(prog(t, 1.2, 2.2))}>
            <Mono x={116} y={1540} text="SUHU PERMUKAAN · SETELAH SETAHUN" size={20} color="rgba(226,240,248,0.45)" tracking={0.2} />
            <BigNumber x={108} y={1720} value="-73" size={186} color={art.ink} />
            <BigNumber x={470} y={1650} value="°C" size={96} color={art.accent} />
            <Mono x={116} y={1790} text="DI ATAS ES, SUHU BISA LEBIH RENDAH LAGI" size={18} color="rgba(226,240,248,0.4)" tracking={0.16} />
          </g>
          <ChapterEyebrow index={7} localSec={t} x={116} />
        </Camera>
        <Furniture i={7} t={t} color={art.accent} note="STABIL ± −240 °C SETELAH JUTAAN TAHUN" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 09 — HIDUP TANPA CAHAYA
// ============================================================================
export const Scene09: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(8);
  const plume = 0.72 + 0.28 * Math.sin(t * 1.3);

  return (
    <Stage i={8} note="ZONA AFOTIK">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="steel-brushed" texOpacity={0.1}
        light={{ x: 700, y: 1420, rx: 620, ry: 520, color: 'rgba(95,168,160,0.16)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="abyss9" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#051520" />
            <stop offset="62%" stopColor="#020A10" />
            <stop offset="100%" stopColor="#01060A" />
          </linearGradient>
          <linearGradient id="crust9" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#2A211B" />
            <stop offset="60%" stopColor="#171310" />
            <stop offset="100%" stopColor="#0C0A09" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1440} height={2560} fill="url(#abyss9)" />

        <Camera localSec={t} dur={dur} push={0.055} drift={10}>
          <Head i={8} t={t} y={640} size={96} />
          <g opacity={easeOutCubic(prog(t, 0.3, 1.4))}>
            <Mono x={116} y={742} text="KEDALAMAN 2.000 M" size={20} color={art.accent} tracking={0.28} />
            <Mono x={1324} y={742} text="TEKANAN 200 ATM" size={19} color="rgba(217,232,236,0.42)" tracking={0.24} anchor="end" />
          </g>

          {/* seafloor */}
          <path d="M 0 1500 Q 260 1446 460 1492 T 900 1466 T 1320 1500 T 1440 1470 L 1440 2100 L 0 2100 Z" fill="#0B1418" />
          <path d="M 0 1500 Q 260 1446 460 1492 T 900 1466 T 1320 1500 T 1440 1470" fill="none" stroke="rgba(140,190,200,0.26)" strokeWidth={2} />

          {/* black smoker with crust */}
          <g>
            <path d="M 632 1494 L 664 1130 L 788 1130 L 820 1500 Z" fill="url(#crust9)" stroke="rgba(255,150,80,0.28)" strokeWidth={2} />
            {Array.from({ length: 16 }).map((_, k) => (
              <line key={k} x1={650 + hash(k, 8) * 150} y1={1150 + hash(k, 9) * 330} x2={660 + hash(k, 8) * 150} y2={1170 + hash(k, 9) * 330}
                stroke="rgba(255,190,140,0.18)" strokeWidth={2} />
            ))}
            <ellipse cx={726} cy={1132} rx={62} ry={18} fill="#0B1114" stroke="rgba(255,160,90,0.4)" strokeWidth={2} />
            <ellipse cx={726} cy={1132} rx={44} ry={12} fill={`rgba(255,150,70,${0.75 * plume})`} />
            <ellipse cx={726} cy={1132} rx={86} ry={30} fill={`rgba(255,140,60,${0.14 * plume})`} />
            {Array.from({ length: 30 }).map((_, i) => {
              const k = (t * 0.32 + i / 30) % 1;
              const x = 726 + Math.sin(k * 8 + i) * (16 + k * 110);
              const y = 1124 - k * 640;
              return <circle key={i} cx={x} cy={y} r={4 + k * 18} fill="rgba(255,178,116,1)" opacity={0.24 * (1 - k)} />;
            })}
          </g>

          {/* bacterial mat */}
          <g opacity={0.55}>
            {Array.from({ length: 60 }).map((_, i) => (
              <circle key={i} cx={380 + hash(i, 21) * 700} cy={1470 + hash(i, 22) * 40} r={3 + hash(i, 23) * 5}
                fill={i % 3 === 0 ? '#5FA8A0' : '#C9A45C'} opacity={0.25 + hash(i, 24) * 0.4} />
            ))}
          </g>

          {/* tube worm clusters */}
          {[0, 1, 2].map((cluster) =>
            [0, 1, 2, 3, 4].map((i) => {
              const x = 900 + cluster * 130 + i * 24 + hash(cluster * 9 + i, 7) * 10;
              const h = 110 + hash(cluster * 9 + i, 8) * 170;
              const sway = Math.sin(t * 0.9 + i + cluster) * 7;
              return (
                <g key={`${cluster}-${i}`}>
                  <path d={`M ${x} 1490 C ${x - 8} ${1490 - h * 0.5} ${x + sway} ${1490 - h * 0.8} ${x + sway * 1.5} ${1490 - h}`}
                    fill="none" stroke="rgba(228,238,238,0.8)" strokeWidth={9} strokeLinecap="round" />
                  <path d={`M ${x} 1490 C ${x - 8} ${1490 - h * 0.5} ${x + sway} ${1490 - h * 0.8} ${x + sway * 1.5} ${1490 - h}`}
                    fill="none" stroke="rgba(120,60,58,0.9)" strokeWidth={3.4} strokeLinecap="round" />
                  <ellipse cx={x + sway * 1.5} cy={1490 - h - 6} rx={9} ry={12} fill="#C25B4E" />
                  <ellipse cx={x + sway * 1.5} cy={1490 - h - 6} rx={15} ry={18} fill="rgba(194,91,78,0.22)" />
                </g>
              );
            }),
          )}

          <LeaderLabel from={[726, 1132]} to={[420, 1020]} text="FLUIDA 400 °C" sub="kaya hidrogen sulfida" anchor="end" progress={prog(t, 2.2, 3.4)} color="rgba(250,200,160,0.9)" size={21} />
          <LeaderLabel from={[1000, 1380]} to={[1190, 1270]} text="CACING TABUNG" sub="tanpa mulut, tanpa usus" anchor="start" progress={prog(t, 3.8, 5.0)} color="rgba(217,232,236,0.85)" size={21} />

          <g opacity={easeOutCubic(prog(t, 5.4, 6.6))}>
            <Brackets x={116} y={1650} w={620} h={190} color="rgba(95,168,160,0.5)" size={24} />
            <Mono x={144} y={1712} text="KEMOSINTESIS" size={20} color={art.accent} tracking={0.28} />
            <text x={144} y={1782} fill="rgba(217,232,236,0.78)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
              energi dari batu, bukan dari bintang.
            </text>
            <Mono x={144} y={1826} text="H₂S + O₂ → S + H₂O + ENERGI" size={17} color="rgba(217,232,236,0.4)" tracking={0.14} />
          </g>
          <ChapterEyebrow index={8} localSec={t} x={116} />
        </Camera>
        <Furniture i={8} t={t} color={art.accent} note="TANPA CAHAYA SEJAK AWAL" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 10 — RAKSASA MERAH
// ============================================================================
export const Scene10: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(9);
  const grow = easeOutCubic(prog(t, 1.0, 4.6));

  const bars = [
    { name: 'BUMI', rel: 0.009, at: 4.4, color: '#5E93B4' },
    { name: 'JUPITER', rel: 0.1, at: 4.9, color: '#C9A45C' },
    { name: 'MATAHARI', rel: 1, at: 5.4, color: '#F4C25E' },
    { name: 'RAKSASA MERAH', rel: 2.4, at: 6.0, color: '#D2703F' },
  ];

  return (
    <Stage i={9} note="DERET UTAMA → RAKSASA">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="oxide-rust" texOpacity={0.16}
        light={{ x: 760, y: 1020, rx: 880, ry: 880, color: 'rgba(255,120,50,0.22)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={140} t={t} opacity={0.32} tintA="#F0D8C0" />
        <Camera localSec={t} dur={dur} push={0.045} drift={8}>
          <Head i={9} t={t} y={640} size={96} />

          <SunCore cx={286} cy={1020} r={70} t={t} cores={80} spots={3} hot="#FFF3CE" mid="#F4C25E" edge="#B9702C" />
          <Mono x={286} y={1132} text="HARI INI" size={18} color="rgba(246,231,213,0.5)" tracking={0.24} anchor="middle" />

          <Corona4K cx={790} cy={1020} r={lerp(70, 236, grow)} t={t} strength={0.75 * grow} rays={92} color="#FF8A4A" />
          <SunCore cx={790} cy={1020} r={lerp(70, 236, grow)} t={t} hot="#FFE2B4" mid="#E8703A" edge="#7E2312" cores={210} spots={8} flare={grow} />
          <Mono x={790} y={1320} text="RAKSASA MERAH" size={19} color="rgba(246,231,213,0.62)" tracking={0.24} anchor="middle" />

          {[0, 1, 2].map((k) => {
            const p = prog(t, 3.2 + k * 0.7, 5.4 + k * 0.6);
            const rr = lerp(390, 200, p);
            const a = k * 2.2 + t * 0.32;
            return (
              <g key={k}>
                <circle cx={790 + Math.cos(a) * rr} cy={1020 + Math.sin(a) * rr * 0.5} r={k === 0 ? 13 : 9}
                  fill={k === 0 ? '#C9A45C' : k === 1 ? '#D9C08A' : '#8FB4C9'} opacity={1 - p * 0.95} />
                <circle cx={790 + Math.cos(a) * rr} cy={1020 + Math.sin(a) * rr * 0.5} r={20} fill="rgba(255,150,90,0.12)" opacity={1 - p} />
              </g>
            );
          })}

          {/* size comparison bars */}
          <g opacity={easeOutCubic(prog(t, 4.2, 5.2))}>
            <Mono x={116} y={1440} text="PERBANDINGAN JARI-JARI" size={19} color="rgba(246,231,213,0.45)" tracking={0.24} />
            {bars.map((b, i) => {
              const p = easeOutCubic(prog(t, b.at, b.at + 1.0));
              const w = 40 + Math.sqrt(b.rel) * 520;
              const y = 1492 + i * 78;
              return (
                <g key={b.name} opacity={p}>
                  <text x={116} y={y + 20} fill="rgba(246,231,213,0.55)" fontFamily={IDENTITY.fontMono} fontSize={17} letterSpacing="0.16em">
                    {b.name}
                  </text>
                  <rect x={380} y={y} width={w * p} height={26} fill={b.color} opacity={0.85} />
                  <text x={380 + w * p + 14} y={y + 20} fill="rgba(246,231,213,0.45)" fontFamily={IDENTITY.fontMono} fontSize={16}>
                    {b.rel >= 1 ? `${b.rel.toFixed(1)} ×` : b.rel.toFixed(3)}
                  </text>
                </g>
              );
            })}
          </g>

          <text x={116} y={1880} fill="rgba(246,231,213,0.9)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
            Merkurius ditelan. Venus ditelan. Bumi jadi bara.
          </text>
          <ChapterEyebrow index={9} localSec={t} x={116} />
        </Camera>
        <Furniture i={9} t={t} color={art.accent} note="± 5 MILIAR TAHUN DARI SEKARANG" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 11 — BARA PUTIH
// ============================================================================
export const Scene11: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(10);
  const expand = easeOutCubic(prog(t, 1.0, 6.0));

  return (
    <Stage i={10} note="NEBULA PLANET">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="ink-wash" texOpacity={0.18}
        light={{ x: 720, y: 1040, rx: 800, ry: 800, color: `rgba(150,166,212,${0.16 + 0.06 * expand})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={240} t={t} opacity={0.7} tintA="#E2E6F4" band />
        <Camera localSec={t} dur={dur} push={0.05} drift={8}>
          <Head i={10} t={t} y={640} size={96} />

          {[0, 1, 2, 3, 4, 5].map((k) => {
            const p = clamp01(expand * 1.2 - k * 0.1);
            const r = lerp(80, 520 - k * 34, p);
            return (
              <g key={k} opacity={0.55 * (1 - k * 0.12) * p}>
                <circle cx={720} cy={1140} r={r} fill="none" stroke={k % 2 ? '#9AA6D4' : '#7FB6C9'} strokeWidth={2.4} opacity={0.5} />
                <circle cx={720} cy={1140} r={r * 0.93} fill="none" stroke="#DCE4F6" strokeWidth={1} opacity={0.24} strokeDasharray="5 11" />
              </g>
            );
          })}

          <g opacity={0.55 * expand}>
            {Array.from({ length: 54 }).map((_, i) => {
              const a = hash(i, 61) * Math.PI * 2;
              const rr = 160 + hash(i, 62) * 360;
              return (
                <ellipse key={i} cx={720 + Math.cos(a) * rr} cy={1140 + Math.sin(a) * rr * 0.8}
                  rx={26 + hash(i, 63) * 86} ry={12 + hash(i, 64) * 44}
                  fill={i % 3 === 0 ? 'rgba(154,166,212,0.18)' : 'rgba(127,182,201,0.13)'} />
              );
            })}
          </g>

          <SunCore cx={720} cy={1140} r={24} t={t} hot="#FFFFFF" mid="#D6E8F6" edge="#6E9DBA" cores={22} spots={0} />
          <circle cx={720} cy={1140} r={52} fill="none" stroke="rgba(200,226,244,0.35)" strokeWidth={1.4} />
          <Mono x={720} y={1256} text="BARA PUTIH · ± 10.000 KM" size={18} color="rgba(226,230,244,0.55)" tracking={0.22} anchor="middle" />

          {/* spectrum strip */}
          <g opacity={easeOutCubic(prog(t, 4.4, 5.6))}>
            <defs>
              <linearGradient id="spec11" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6B7BD6" />
                <stop offset="26%" stopColor="#7FB6C9" />
                <stop offset="50%" stopColor="#C9D6E8" />
                <stop offset="76%" stopColor="#E8D6B0" />
                <stop offset="100%" stopColor="#D2703F" />
              </linearGradient>
            </defs>
            <rect x={116} y={1660} width={1208} height={44} fill="url(#spec11)" opacity={0.8} />
            {[0.14, 0.22, 0.38, 0.52, 0.66, 0.74, 0.88].map((k, i) => (
              <rect key={i} x={116 + k * 1208} y={1660} width={3 + (i % 2) * 3} height={44} fill="#05070C" opacity={0.85} />
            ))}
            <Mono x={116} y={1640} text="SPEKTRUM SERAPAN · BARA PUTIH" size={18} color="rgba(226,230,244,0.45)" tracking={0.22} />
            <Mono x={116} y={1740} text="4.000 K → 100.000 K → MENDINGIN SELAMANYA" size={17} color="rgba(226,230,244,0.4)" tracking={0.14} />
          </g>

          <LeaderLabel from={[980, 940]} to={[1150, 856]} text="LAPISAN LUAR TERLEPAS" sub="gas dilempar ke angkasa" anchor="start" progress={prog(t, 3.2, 4.4)} color="rgba(226,230,244,0.85)" size={21} />
          <LeaderLabel from={[610, 1290]} to={[390, 1390]} text="TINGGAL INTI" sub="seukuran bumi, sepadat matahari" anchor="end" progress={prog(t, 5.0, 6.2)} color="rgba(226,230,244,0.85)" size={21} />

          <text x={116} y={1866} fill="rgba(226,230,244,0.9)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={38}>
            Tidak ada ledakan. Hanya pendinginan yang panjang.
          </text>
          <ChapterEyebrow index={10} localSec={t} x={116} />
        </Camera>
        <Furniture i={10} t={t} color={art.accent} note="10⁹ TAHUN MENDINGIN" />
      </svg>
    </Stage>
  );
};

// ============================================================================
// 12 — PESAN UNTUK MATAHARI
// ============================================================================
export const Scene12: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(11);
  const breathe = 0.5 + 0.5 * Math.sin(t * 0.8);
  const cta = easeOutCubic(prog(t, 7.2, 8.6));

  return (
    <Stage i={11} note="CAHAYA = MASA LALU">
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="wall-plaster" texOpacity={0.2}
        light={{ x: 960, y: 900, rx: 780, ry: 800, color: `rgba(255,206,130,${0.16 + 0.05 * breathe})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <Camera localSec={t} dur={dur} push={0.05} drift={9}>
          <g opacity={easeOutCubic(prog(t, 0.2, 1.4))}>
            <rect x={232} y={700} width={650} height={840} fill="#141009" stroke="rgba(240,220,186,0.42)" strokeWidth={6} />
            <rect x={254} y={722} width={606} height={796} fill="none" stroke="rgba(240,220,186,0.16)" strokeWidth={2} />
            <line x1={557} y1={700} x2={557} y2={1540} stroke="rgba(240,220,186,0.36)" strokeWidth={5} />
            <line x1={232} y1={1120} x2={882} y2={1120} stroke="rgba(240,220,186,0.36)" strokeWidth={5} />
            {[0, 1, 2, 3].map((k) => (
              <circle key={k} cx={264 + (k % 2) * 588} cy={748 + Math.floor(k / 2) * 742} r={6} fill="rgba(240,220,186,0.5)" />
            ))}
          </g>

          <g opacity={0.44 + 0.18 * breathe}>
            <defs>
              <linearGradient id="shaft12" x1="0" y1="0" x2="0.6" y2="1">
                <stop offset="0%" stopColor="rgba(255,214,150,0.42)" />
                <stop offset="100%" stopColor="rgba(255,196,120,0.03)" />
              </linearGradient>
            </defs>
            <polygon points="254,722 882,1540 1210,1540 296,722" fill="url(#shaft12)" />
            <ellipse cx={900} cy={1600} rx={350} ry={74} fill="rgba(255,206,140,0.2)" />
            {Array.from({ length: 40 }).map((_, i) => (
              <circle key={i} cx={300 + hash(i, 71) * 880 + Math.sin(t * 0.5 + i) * 12} cy={740 + hash(i, 72) * 800 - ((t * 14 + i * 9) % 140)}
                r={1.4 + hash(i, 73) * 2.8} fill="rgba(255,226,180,0.6)" opacity={0.18 + hash(i, 74) * 0.5} />
            ))}
          </g>

          <g opacity={easeOutCubic(prog(t, 1.2, 2.4))}>
            <rect x={986} y={760} width={280} height={280} fill="#100C08" stroke="rgba(240,220,186,0.32)" strokeWidth={3} />
            <SunCore cx={1126} cy={900} r={96} t={t} cores={70} spots={2} />
            <Mono x={986} y={1070} text="PLAT 12 · 8:20" size={17} color="rgba(240,220,186,0.45)" tracking={0.22} />
          </g>

          <g opacity={easeOutCubic(prog(t, 2.0, 3.4))}>
            <Mono x={232} y={1700} text="YANG KAMU LIHAT" size={20} color={art.soft} tracking={0.28} />
            <text x={224} y={1818} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={124} letterSpacing="0.012em">
              MATAHARI
            </text>
            <text x={224} y={1938} fill={art.accent} fontFamily={IDENTITY.fontDisplay} fontSize={124} letterSpacing="0.012em">
              YANG DULU
            </text>
          </g>

          <g opacity={cta} transform={`translate(0 ${(1 - cta) * 22})`}>
            <Mono x={232} y={1656} text="SELISIH 8 MENIT 20 DETIK" size={20} color="rgba(247,236,217,0.55)" tracking={0.22} />
            <Mono x={1324} y={1656} text="TULIS DI KOMENTAR →" size={20} color={art.accent} tracking={0.24} anchor="end" />
          </g>
          <ChapterEyebrow index={11} localSec={t} x={116} />
        </Camera>
        <Furniture i={11} t={t} color={art.accent} note="SELALU MATAHARI 8 MENIT LALU" />
      </svg>
    </Stage>
  );
};
