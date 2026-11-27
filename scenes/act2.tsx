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
import { Counter, EarthDot, OceanSection, StarField, SunDisc, ThermoGauge } from './sol';

const Stage: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => {
  const { ch } = useChapterClock(i);
  return (
    <AbsoluteFill style={{ backgroundColor: ch.groundBottom, overflow: 'hidden' }}>
      {children}
      <DustMotes count={22} seed={i + 11} y0={340} y1={1800} color="rgba(226,240,248,0.26)" />
      <FilmGrain opacity={0.13} scale={190} />
    </AbsoluteFill>
  );
};

// ============================================================================
// 05 — MINGGU PERTAMA
// ============================================================================
export const Scene05: React.FC = () => {
  const { ch, art, localSec, dur } = useChapterClock(4);
  const t = localSec;
  const fall = easeOutCubic(prog(t, 1.0, 5.2));
  const temp = lerp(15, -18, fall);
  const wilt = prog(t, 2.2, 5.0);

  return (
    <Stage i={4}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="glass-mist" texOpacity={0.18}
        light={{ x: 400, y: 700, rx: 760, ry: 700, color: 'rgba(120,170,200,0.10)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={70} t={t} opacity={0.35} tint="#CFE0EC" />
        <Camera localSec={t} dur={dur} push={0.04} drift={8}>
          <ThermoGauge x={1010} y={700} h={700} value={temp} min={-100} max={30} color={art.accent} cold="#2F6E92" t={t} />

          <g opacity={easeOutCubic(prog(t, 0.4, 1.4))}>
            <Mono x={120} y={700} text="SUHU RATA-RATA BUMI" size={19} color={art.soft} tracking={0.28} />
            <text x={112} y={960} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={300} letterSpacing="-0.02em">
              {temp > -0.5 ? `+${Math.round(temp)}` : `${Math.round(temp)}`}
            </text>
            <text x={480} y={880} fill={art.accent} fontFamily={IDENTITY.fontDisplay} fontSize={120}>
              °C
            </text>
            <RuleLine x1={120} y1={1010} x2={860} y2={1010} color="rgba(212,232,242,0.26)" />
            <Mono x={120} y={1076} text="MINGGU PERTAMA" size={22} color="rgba(226,240,248,0.72)" tracking={0.26} />
          </g>

          {/* wilting leaf line art */}
          <g transform={`translate(300 1520) rotate(${lerp(0, 18, wilt)} 0 0)`} opacity={lerp(0.9, 0.35, wilt)}>
            <path d="M 0 260 C 0 160 40 60 120 0 C 190 70 200 180 130 250 C 90 292 40 292 0 260 Z"
              fill="none" stroke="rgba(180,214,225,0.7)" strokeWidth={3} />
            <path d="M 4 258 C 60 190 100 120 122 4" fill="none" stroke="rgba(180,214,225,0.55)" strokeWidth={2.4} />
            {Array.from({ length: 6 }).map((_, i) => (
              <path key={i} d={`M ${18 + i * 16} ${232 - i * 34} q ${26 + i * 4} ${-14 - i * 4} ${44 + i * 5} ${-30 - i * 5}`}
                fill="none" stroke="rgba(180,214,225,0.35)" strokeWidth={1.8} />
            ))}
            <path d="M 0 262 L 0 360" stroke="rgba(180,214,225,0.5)" strokeWidth={3} />
          </g>
          <Mono x={120} y={1900} text="FOTOSINTESIS BERHENTI DALAM HITUNGAN MENIT" size={17} color="rgba(226,240,248,0.45)" tracking={0.18} />

          <LeaderLabel from={[1010, 900]} to={[1210, 820]} text="−18 °C" sub="dalam 7 hari" anchor="start" progress={prog(t, 4.4, 5.4)} color="rgba(226,240,248,0.8)" />
          <ChapterEyebrow index={4} localSec={t} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 06 — TAHUN PERTAMA / LAUT MEMBEKU
// ============================================================================
export const Scene06: React.FC = () => {
  const { ch, art, localSec, dur } = useChapterClock(5);
  const t = localSec;
  const ice = easeOutCubic(prog(t, 0.6, 4.4));

  return (
    <Stage i={5}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="concrete" texOpacity={0.14}
        light={{ x: 720, y: 1500, rx: 800, ry: 520, color: 'rgba(255,140,60,0.10)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={80} t={t} opacity={0.3} tint="#D3E4EE" />
        <Camera localSec={t} dur={dur} push={0.05} drift={7}>
          <g opacity={easeOutCubic(prog(t, 0.2, 1.2))}>
            <Mono x={120} y={560} text="PENAMPANG LAUT" size={19} color={art.soft} tracking={0.28} />
            <text x={112} y={700} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={128} letterSpacing="0.01em">
              TAHUN PERTAMA
            </text>
          </g>
          <OceanSection x={120} y={800} w={1200} h={620} t={t} accent={art.accent} iceProgress={ice} glow={1} />

          <LeaderLabel from={[520, 880]} to={[300, 760]} text="ES LAUT 1–2 M" sub="terbentuk dari atas" anchor="end" progress={prog(t, 3.4, 4.4)} color="rgba(226,240,248,0.8)" />
          <LeaderLabel from={[860, 1230]} to={[1120, 1160]} text="AIR CAIR" sub="ratusan ribu tahun" anchor="start" progress={prog(t, 4.4, 5.4)} color="rgba(226,240,248,0.8)" />
          <LeaderLabel from={[720, 1400]} to={[980, 1460]} text="PANAS INTI BUMI" sub="masih menyala" anchor="start" progress={prog(t, 5.6, 6.6)} color="rgba(250,190,150,0.85)" />

          <g opacity={easeOutCubic(prog(t, 1.2, 2.2))}>
            <Counter x={112} y={1780} from={0} to={-73} localSec={t} startSec={1.2} durSec={2.2}
              format={(v) => `${Math.round(v)}`} size={210} color={art.ink} weight={400} />
            <text x={560} y={1700} fill={art.accent} fontFamily={IDENTITY.fontDisplay} fontSize={110}>°C</text>
            <Mono x={120} y={1850} text="SUHU PERMUKAAN SETELAH SETAHUN" size={18} color="rgba(226,240,248,0.5)" tracking={0.2} />
          </g>
          <ChapterEyebrow index={5} localSec={t} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 07 — RAKSASA MERAH
// ============================================================================
export const Scene07: React.FC = () => {
  const { ch, art, localSec, dur } = useChapterClock(6);
  const t = localSec;
  const grow = easeOutCubic(prog(t, 1.0, 4.6));
  const dwarf = prog(t, 5.6, 7.0);
  const railY = 1560;

  const stages = [
    { x: 320, label: 'SEKARANG', sub: 'bintang deret utama' },
    { x: 720, label: '+5 MILIAR TAHUN', sub: 'raksasa merah' },
    { x: 1120, label: 'AKHIR', sub: 'bara putih' },
  ];

  return (
    <Stage i={6}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="oxide-rust" texOpacity={0.16}
        light={{ x: 760, y: 980, rx: 820, ry: 820, color: 'rgba(255,120,50,0.2)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={110} t={t} opacity={0.4} tint="#F0D8C0" />
        <Camera localSec={t} dur={dur} push={0.045} drift={8}>
          <SunDisc cx={320} cy={980} r={86} t={t} glow={0.8} hot="#FFF3CE" mid="#F4C25E" edge="#B9702C" />
          <SunDisc cx={720} cy={980} r={lerp(86, 232, grow)} t={t} hot="#FFE2B4" mid="#E8703A" edge="#7E2312" glow={grow} grains={150} />

          {/* planets swallowed by the giant */}
          {[0, 1, 2].map((k) => {
            const p = prog(t, 3.2 + k * 0.7, 5.4 + k * 0.5);
            const rr = lerp(360, 180, p);
            const a = k * 2.1 + t * 0.4;
            return (
              <g key={k} opacity={1 - p}>
                <circle cx={720 + Math.cos(a) * rr} cy={980 + Math.sin(a) * rr * 0.55} r={11 - k * 2} fill="#E8C08A" />
              </g>
            );
          })}

          {dwarf > 0 && (
            <g opacity={dwarf}>
              <SunDisc cx={1120} cy={980} r={26} t={t} alive={dwarf} hot="#FFFFFF" mid="#CFE6F5" edge="#5B87A8" glow={0.6} grains={26} />
              <circle cx={1120} cy={980} r={44} fill="none" stroke="rgba(190,225,245,0.4)" strokeWidth={1.4} opacity={dwarf} />
            </g>
          )}

          {/* evolution rail */}
          <g opacity={easeOutCubic(prog(t, 0.6, 1.8))}>
            <RuleLine x1={200} y1={railY} x2={1240} y2={railY} color="rgba(246,231,213,0.35)" width={2} />
            {stages.map((s, i) => (
              <g key={s.label}>
                <line x1={s.x} y1={railY - 14} x2={s.x} y2={railY + 14} stroke={i === 1 ? art.accent : 'rgba(246,231,213,0.6)'} strokeWidth={2} />
                <circle cx={s.x} cy={railY} r={i === 1 ? 7 : 4} fill={i === 1 ? art.accent : 'rgba(246,231,213,0.7)'} />
                <text x={s.x} y={railY + 62} fill={i === 1 ? art.accent : 'rgba(246,231,213,0.82)'}
                  fontFamily={IDENTITY.fontMono} fontSize={20} letterSpacing="0.18em" textAnchor="middle">
                  {s.label}
                </text>
                <text x={s.x} y={railY + 96} fill="rgba(246,231,213,0.45)" fontFamily={IDENTITY.fontMono}
                  fontSize={16} letterSpacing="0.1em" textAnchor="middle">
                  {s.sub}
                </text>
              </g>
            ))}
          </g>

          <g opacity={easeOutCubic(prog(t, 2.4, 3.6))}>
            <text x={112} y={660} fill="rgba(246,231,213,0.95)" fontFamily={IDENTITY.fontDisplay} fontSize={124} letterSpacing="0.01em">
              MATAHARI TIDAK
            </text>
            <text x={112} y={790} fill="rgba(246,231,213,0.6)" fontFamily={IDENTITY.fontDisplay} fontSize={124} letterSpacing="0.01em">
              MELEDAK.
            </text>
          </g>
          <Mono x={120} y={1700} text="IA MEMBENGKAK, LALU MENINGGALKAN BARA PUTIH SEUKURAN BUMI" size={17}
            color="rgba(246,231,213,0.45)" tracking={0.16} />
          <ChapterEyebrow index={6} localSec={t} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 08 — MASA LALU
// ============================================================================
export const Scene08: React.FC = () => {
  const { ch, art, localSec, dur } = useChapterClock(7);
  const t = localSec;
  const breathe = 0.5 + 0.5 * Math.sin(t * 0.8);
  const cta = easeOutCubic(prog(t, 8.2, 9.4));

  return (
    <Stage i={7}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="wall-plaster" texOpacity={0.22}
        light={{ x: 980, y: 900, rx: 720, ry: 780, color: `rgba(255,206,130,${0.16 + 0.05 * breathe})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <Camera localSec={t} dur={dur} push={0.05} drift={9}>
          {/* window */}
          <g opacity={easeOutCubic(prog(t, 0.2, 1.4))}>
            <rect x={250} y={430} width={620} height={800} fill="#141009" stroke="rgba(240,220,186,0.45)" strokeWidth={6} />
            <rect x={270} y={450} width={580} height={760} fill="none" stroke="rgba(240,220,186,0.18)" strokeWidth={2} />
            <line x1={560} y1={430} x2={560} y2={1230} stroke="rgba(240,220,186,0.4)" strokeWidth={5} />
            <line x1={250} y1={830} x2={870} y2={830} stroke="rgba(240,220,186,0.4)" strokeWidth={5} />
          </g>
          {/* light shaft */}
          <g opacity={0.5 + 0.16 * breathe}>
            <defs>
              <linearGradient id="shaft" x1="0" y1="0" x2="0.6" y2="1">
                <stop offset="0%" stopColor="rgba(255,214,150,0.42)" />
                <stop offset="100%" stopColor="rgba(255,196,120,0.04)" />
              </linearGradient>
            </defs>
            <polygon points="270,450 870,1230 1180,1230 300,450" fill="url(#shaft)" />
            <ellipse cx={900} cy={1290} rx={330} ry={70} fill="rgba(255,206,140,0.22)" />
          </g>
          {/* sun plate on the wall */}
          <g opacity={easeOutCubic(prog(t, 1.4, 2.6))}>
            <SunDisc cx={1080} cy={760} r={92} t={t} glow={0.85} />
            <rect x={962} y={642} width={236} height={236} fill="none" stroke="rgba(240,220,186,0.35)" strokeWidth={3} />
            <Mono x={962} y={908} text="PLAT 08" size={15} color="rgba(240,220,186,0.45)" tracking={0.24} />
          </g>

          <g opacity={easeOutCubic(prog(t, 2.2, 3.6))}>
            <Mono x={250} y={1420} text="YANG KAMU LIHAT" size={19} color={art.soft} tracking={0.28} />
            <text x={242} y={1560} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={136} letterSpacing="0.01em">
              MATAHARI
            </text>
            <text x={242} y={1690} fill={art.accent} fontFamily={IDENTITY.fontDisplay} fontSize={136} letterSpacing="0.01em">
              YANG DULU
            </text>
            <Mono x={250} y={1760} text="CAHAYA BERUMUR 8 MENIT 20 DETIK" size={19} color="rgba(247,236,217,0.55)" tracking={0.2} />
          </g>

          {/* CTA */}
          <g opacity={cta} transform={`translate(0 ${(1 - cta) * 26})`}>
            <rect x={250} y={1840} width={940} height={148} rx={22} fill="rgba(217,164,65,0.10)" stroke={art.accent} strokeWidth={2} />
            <g transform="translate(300 1914)">
              <path d="M -22 -26 h 44 a 12 12 0 0 1 12 12 v 26 a 12 12 0 0 1 -12 12 h -22 l -14 14 v -14 a 12 12 0 0 1 -8 -12 v -26 a 12 12 0 0 1 8 -12 z"
                fill="none" stroke={art.accent} strokeWidth={2.4} />
            </g>
            <text x={370} y={1908} fill={art.ink} fontFamily={IDENTITY.fontGrotesk} fontSize={44} fontWeight={600} letterSpacing="-0.01em">
              Kamu pilih apa di kegelapan?
            </text>
            <text x={370} y={1954} fill="rgba(247,236,217,0.55)" fontFamily={IDENTITY.fontMono} fontSize={20} letterSpacing="0.16em">
              TULIS DI KOMENTAR
            </text>
          </g>
          <ChapterEyebrow index={7} localSec={t} />
        </Camera>
      </svg>
    </Stage>
  );
};
