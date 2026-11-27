import React from 'react';
import { CHAPTER_TITLES, IDENTITY, clamp01, easeOutCubic, hash, lerp, prog } from './script';
import { Backdrop, Camera, ChapterEyebrow, LeaderLabel, Mono, RuleLine, useChapterClock } from './kit';
import { BigNumber, Brackets, Corona4K, NoiseWash, StarField, SunCore, TickRule } from './graphics';
import { Stage } from './matahari';

// ============================================================================
// 09 — HIDUP TANPA CAHAYA
// ============================================================================
export const Scene09: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(8);
  const plume = 0.6 + 0.4 * Math.sin(t * 1.4);

  return (
    <Stage i={8}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="steel-brushed" texOpacity={0.1}
        light={{ x: 700, y: 1450, rx: 640, ry: 520, color: 'rgba(95,168,160,0.14)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        {/* water column */}
        <defs>
          <linearGradient id="abyss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#04121A" />
            <stop offset="70%" stopColor="#020A10" />
            <stop offset="100%" stopColor="#01060A" />
          </linearGradient>
          <linearGradient id="vent-heat" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(255,150,70,0.55)" />
            <stop offset="100%" stopColor="rgba(255,150,70,0)" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1440} height={2560} fill="url(#abyss)" />
        <NoiseWash x={0} y={0} w={1440} h={2560} seed={12} color="rgba(120,190,200,1)" cells={60} opacity={0.5} />

        <Camera localSec={t} dur={dur} push={0.055} drift={10}>
          <g opacity={easeOutCubic(prog(t, 0.2, 1.4))}>
            <Mono x={116} y={430} text="KEDALAMAN 2.000 M" size={18} color={art.accent} tracking={0.3} />
            <Mono x={1324} y={430} text="TEKANAN 200 ATM" size={16} color="rgba(217,232,236,0.4)" tracking={0.24} anchor="end" />
            <text x={110} y={560} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={110} letterSpacing="0.012em">
              {CHAPTER_TITLES[8]}
            </text>
          </g>

          {/* seafloor */}
          <path d="M 0 1560 Q 240 1500 420 1548 T 820 1520 T 1200 1556 T 1440 1524 L 1440 2100 L 0 2100 Z" fill="#0A1218" />
          <path d="M 0 1560 Q 240 1500 420 1548 T 820 1520 T 1200 1556 T 1440 1524" fill="none" stroke="rgba(140,190,200,0.28)" strokeWidth={2} />

          {/* chimney */}
          <g>
            <path d="M 640 1540 L 668 1180 L 780 1180 L 812 1548 Z" fill="#12191C" stroke="rgba(255,150,80,0.25)" strokeWidth={2} />
            <ellipse cx={724} cy={1180} rx={56} ry={16} fill="#0B1114" stroke="rgba(255,160,90,${0.35})" strokeWidth={2} />
            <ellipse cx={724} cy={1180} rx={40} ry={10} fill={`rgba(255,140,60,${0.5 * plume})`} />
            {Array.from({ length: 22 }).map((_, i) => {
              const k = (t * 0.35 + i / 22) % 1;
              const x = 724 + Math.sin(k * 7 + i) * (18 + k * 90);
              const y = 1170 - k * 560;
              return <circle key={i} cx={x} cy={y} r={5 + k * 16} fill="rgba(255,170,110,1)" opacity={0.22 * (1 - k)} />;
            })}
            <rect x={700} y={1360} width={48} height={180} fill="url(#vent-heat)" opacity={0.35} />
          </g>

          {/* tube worms */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const x = 900 + i * 52;
            const h = 120 + hash(i, 9) * 160;
            const sway = Math.sin(t * 0.9 + i) * 6;
            return (
              <g key={i} opacity={0.85}>
                <path d={`M ${x} 1552 C ${x - 6} ${1552 - h * 0.5} ${x + sway} ${1552 - h * 0.8} ${x + sway * 1.4} ${1552 - h}`}
                  fill="none" stroke="rgba(230,238,238,0.75)" strokeWidth={7} strokeLinecap="round" />
                <path d={`M ${x} 1552 C ${x - 6} ${1552 - h * 0.5} ${x + sway} ${1552 - h * 0.8} ${x + sway * 1.4} ${1552 - h}`}
                  fill="none" stroke="rgba(200,110,110,0.8)" strokeWidth={3} strokeLinecap="round" />
                <circle cx={x + sway * 1.4} cy={1552 - h} r={7} fill="#C25B4E" opacity={0.9} />
              </g>
            );
          })}

          <LeaderLabel from={[724, 1180]} to={[430, 1040]} text="FLUIDA 400 °C" sub="kaya hidrogen sulfida" anchor="end"
            progress={prog(t, 2.2, 3.4)} color="rgba(250,200,160,0.85)" />
          <LeaderLabel from={[980, 1400]} to={[1160, 1290]} text="CACING TABUNG" sub="tanpa mulut, tanpa usus" anchor="start"
            progress={prog(t, 3.8, 5.0)} color="rgba(217,232,236,0.8)" />

          <g opacity={easeOutCubic(prog(t, 5.4, 6.6))}>
            <Brackets x={116} y={1660} w={560} h={170} color="rgba(95,168,160,0.5)" size={22} />
            <Mono x={140} y={1716} text="KEMOSINTESIS" size={17} color={art.accent} tracking={0.28} />
            <text x={140} y={1782} fill="rgba(217,232,236,0.72)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={34}>
              energi dari batu, bukan dari bintang.
            </text>
          </g>
          <ChapterEyebrow index={8} localSec={t} x={116} />
        </Camera>
      </svg>
    </Stage>
  );
};

// ============================================================================
// 10 — RAKSASA MERAH
// ============================================================================
export const Scene10: React.FC = () => {
  const { ch, art, localSec: t, dur } = useChapterClock(9);
  const grow = easeOutCubic(prog(t, 1.0, 4.8));
  const swallow = prog(t, 3.4, 6.0);

  return (
    <Stage i={9}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="oxide-rust" texOpacity={0.16}
        light={{ x: 760, y: 1020, rx: 860, ry: 860, color: 'rgba(255,120,50,0.2)' }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={120} t={t} opacity={0.35} tintA="#F0D8C0" />
        <Camera localSec={t} dur={dur} push={0.045} drift={8}>
          <g opacity={easeOutCubic(prog(t, 0.2, 1.4))}>
            <Mono x={116} y={430} text="EVOLUSI BINTANG · 5 MILIAR TAHUN" size={18} color={art.accent} tracking={0.3} />
            <text x={110} y={560} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={110} letterSpacing="0.012em">
              {CHAPTER_TITLES[9]}
            </text>
          </g>

          <SunCore cx={300} cy={1080} r={78} t={t} cores={70} spots={3} hot="#FFF3CE" mid="#F4C25E" edge="#B9702C" />
          <Mono x={300} y={1220} text="HARI INI" size={15} color="rgba(246,231,213,0.5)" tracking={0.22} anchor="middle" />

          <Corona4K cx={760} cy={1080} r={lerp(78, 250, grow)} t={t} strength={0.7 * grow} rays={80} color="#FF8A4A" />
          <SunCore cx={760} cy={1080} r={lerp(78, 250, grow)} t={t} hot="#FFE2B4" mid="#E8703A" edge="#7E2312" cores={170} spots={10} flare={grow} />
          <Mono x={760} y={1400} text="RAKSASA MERAH" size={16} color="rgba(246,231,213,0.6)" tracking={0.24} anchor="middle" />

          {/* planets being swallowed */}
          {[0, 1, 2].map((k) => {
            const p = prog(t, 3.4 + k * 0.8, 5.6 + k * 0.6);
            const rr = lerp(400, 210, p);
            const a = k * 2.2 + t * 0.35;
            return (
              <g key={k} opacity={1 - swallow * 0.15}>
                <circle cx={760 + Math.cos(a) * rr} cy={1080 + Math.sin(a) * rr * 0.5} r={k === 0 ? 12 : 9}
                  fill={k === 0 ? '#C9A45C' : k === 1 ? '#D9C08A' : '#8FB4C9'} opacity={1 - p * 0.9} />
                {k === 0 && <Mono x={760 + Math.cos(a) * rr} y={1080 + Math.sin(a) * rr * 0.5 - 22} text="MERKURIUS" size={12} color="rgba(246,231,213,0.4)" tracking={0.16} anchor="middle" />}
              </g>
            );
          })}

          {/* size comparison rule */}
          <g opacity={easeOutCubic(prog(t, 4.6, 5.8))}>
            <RuleLine x1={116} y1={1520} x2={1324} y2={1520} color="rgba(246,231,213,0.28)" />
            <Mono x={116} y={1566} text="SKALA JARI-JARI" size={15} color="rgba(246,231,213,0.4)" tracking={0.22} />
            <TickRule x1={116} y1={1600} x2={1324} y2={1600} major={5} minor={4} color="rgba(246,231,213,0.35)"
              labels={['0', '0,5', '1', '1,5', '2', '2,5 AU']} labelSize={15} progress={prog(t, 4.8, 6.0)} />
            <Mono x={1324} y={1680} text="250 × JARI-JARI HARI INI" size={16} color={art.accent} tracking={0.2} anchor="end" />
          </g>

          <g opacity={easeOutCubic(prog(t, 6.2, 7.4))}>
            <text x={116} y={1800} fill="rgba(246,231,213,0.9)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={42}>
              Bumi berubah jadi bara yang mengorbit bintang sekarat.
            </text>
          </g>
          <ChapterEyebrow index={9} localSec={t} x={116} />
        </Camera>
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
    <Stage i={10}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="ink-wash" texOpacity={0.18}
        light={{ x: 720, y: 1040, rx: 760, ry: 760, color: `rgba(150,166,212,${0.16 + 0.06 * expand})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <StarField count={200} t={t} opacity={0.6} tintA="#E2E6F4" band />
        <Camera localSec={t} dur={dur} push={0.05} drift={8}>
          <g opacity={easeOutCubic(prog(t, 0.2, 1.4))}>
            <Mono x={116} y={430} text="NEBULA PLANET · SISA BINTANG" size={18} color={art.accent} tracking={0.3} />
            <text x={110} y={560} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={110} letterSpacing="0.012em">
              {CHAPTER_TITLES[10]}
            </text>
          </g>

          {/* expanding shells */}
          {[0, 1, 2, 3, 4].map((k) => {
            const p = clamp01(expand * 1.15 - k * 0.11);
            const r = lerp(90, 520 - k * 40, p);
            return (
              <g key={k} opacity={0.5 * (1 - k * 0.13) * p}>
                <circle cx={720} cy={1120} r={r} fill="none" stroke={k % 2 ? '#9AA6D4' : '#7FB6C9'} strokeWidth={2.2} opacity={0.5} />
                <circle cx={720} cy={1120} r={r * 0.94} fill="none" stroke="#DCE4F6" strokeWidth={1} opacity={0.28} strokeDasharray="6 10" />
              </g>
            );
          })}

          {/* nebula wash */}
          <g opacity={0.5 * expand}>
            {Array.from({ length: 40 }).map((_, i) => {
              const a = hash(i, 61) * Math.PI * 2;
              const rr = 180 + hash(i, 62) * 330;
              return (
                <ellipse key={i} cx={720 + Math.cos(a) * rr} cy={1120 + Math.sin(a) * rr * 0.82}
                  rx={30 + hash(i, 63) * 90} ry={14 + hash(i, 64) * 46}
                  fill={i % 3 === 0 ? 'rgba(154,166,212,0.16)' : 'rgba(127,182,201,0.12)'} />
              );
            })}
          </g>

          <SunCore cx={720} cy={1120} r={26} t={t} hot="#FFFFFF" mid="#D6E8F6" edge="#6E9DBA" cores={24} spots={0} />
          <circle cx={720} cy={1120} r={54} fill="none" stroke="rgba(200,226,244,0.35)" strokeWidth={1.4} />
          <Mono x={720} y={1250} text="BARA PUTIH · ± 10.000 KM" size={15} color="rgba(226,230,244,0.55)" tracking={0.22} anchor="middle" />

          <LeaderLabel from={[960, 940]} to={[1140, 860]} text="LAPISAN LUAR TERLEPAS" sub="gas yang dilempar ke angkasa" anchor="start"
            progress={prog(t, 3.2, 4.4)} color="rgba(226,230,244,0.82)" />
          <LeaderLabel from={[620, 1290]} to={[400, 1400]} text="TINGGAL INTI" sub="seukuran bumi, sepadat matahari" anchor="end"
            progress={prog(t, 5.0, 6.2)} color="rgba(226,230,244,0.82)" />

          <g opacity={easeOutCubic(prog(t, 6.4, 7.6))}>
            <RuleLine x1={116} y1={1700} x2={1324} y2={1700} color="rgba(226,230,244,0.24)" />
            <text x={116} y={1790} fill="rgba(226,230,244,0.9)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={44}>
              Tidak ada ledakan. Hanya pendinginan
            </text>
            <text x={116} y={1850} fill="rgba(226,230,244,0.6)" fontFamily={IDENTITY.fontSerif} fontStyle="italic" fontSize={44}>
              yang berlangsung miliaran tahun.
            </text>
          </g>
          <ChapterEyebrow index={10} localSec={t} x={116} />
        </Camera>
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
  const cta = easeOutCubic(prog(t, 8.0, 9.2));

  return (
    <Stage i={11}>
      <Backdrop top={ch.groundTop} bottom={ch.groundBottom} tex="wall-plaster" texOpacity={0.2}
        light={{ x: 960, y: 900, rx: 760, ry: 800, color: `rgba(255,206,130,${0.15 + 0.05 * breathe})` }} />
      <svg width={1440} height={2560} style={{ position: 'absolute', inset: 0 }}>
        <Camera localSec={t} dur={dur} push={0.05} drift={9}>
          {/* window */}
          <g opacity={easeOutCubic(prog(t, 0.2, 1.4))}>
            <rect x={238} y={420} width={640} height={820} fill="#141009" stroke="rgba(240,220,186,0.42)" strokeWidth={6} />
            <rect x={260} y={442} width={596} height={776} fill="none" stroke="rgba(240,220,186,0.16)" strokeWidth={2} />
            <line x1={558} y1={420} x2={558} y2={1240} stroke="rgba(240,220,186,0.38)" strokeWidth={5} />
            <line x1={238} y1={830} x2={878} y2={830} stroke="rgba(240,220,186,0.38)" strokeWidth={5} />
            {[0, 1, 2, 3].map((k) => (
              <circle key={k} cx={270 + (k % 2) * 576} cy={466 + Math.floor(k / 2) * 720} r={6} fill="rgba(240,220,186,0.5)" />
            ))}
          </g>

          <g opacity={0.46 + 0.16 * breathe}>
            <defs>
              <linearGradient id="shaft12" x1="0" y1="0" x2="0.6" y2="1">
                <stop offset="0%" stopColor="rgba(255,214,150,0.4)" />
                <stop offset="100%" stopColor="rgba(255,196,120,0.03)" />
              </linearGradient>
            </defs>
            <polygon points="260,442 878,1240 1190,1240 292,442" fill="url(#shaft12)" />
            <ellipse cx={900} cy={1300} rx={340} ry={72} fill="rgba(255,206,140,0.2)" />
            {Array.from({ length: 34 }).map((_, i) => {
              const k = hash(i, 71);
              const x = 300 + k * 820;
              const y = 460 + hash(i, 72) * 780;
              return <circle key={i} cx={x + Math.sin(t * 0.5 + i) * 10} cy={y - ((t * 12 + i * 7) % 120)} r={1.4 + hash(i, 73) * 2.6}
                fill="rgba(255,226,180,0.6)" opacity={0.2 + hash(i, 74) * 0.5} />;
            })}
          </g>

          {/* postcard of the sun */}
          <g opacity={easeOutCubic(prog(t, 1.2, 2.4))}>
            <rect x={966} y={700} width={268} height={268} fill="#100C08" stroke="rgba(240,220,186,0.32)" strokeWidth={3} />
            <SunCore cx={1100} cy={834} r={92} t={t} cores={60} spots={2} />
            <Mono x={966} y={998} text="PLAT 12 · 8:20" size={14} color="rgba(240,220,186,0.45)" tracking={0.22} />
          </g>

          <g opacity={easeOutCubic(prog(t, 2.0, 3.4))}>
            <Mono x={238} y={1440} text="YANG KAMU LIHAT" size={18} color={art.soft} tracking={0.28} />
            <text x={230} y={1580} fill={art.ink} fontFamily={IDENTITY.fontDisplay} fontSize={128} letterSpacing="0.012em">
              MATAHARI
            </text>
            <text x={230} y={1706} fill={art.accent} fontFamily={IDENTITY.fontDisplay} fontSize={128} letterSpacing="0.012em">
              YANG DULU
            </text>
            <Mono x={238} y={1770} text="SELISIH 8 MENIT 20 DETIK" size={18} color="rgba(247,236,217,0.5)" tracking={0.2} />
          </g>

          <g opacity={cta} transform={`translate(0 ${(1 - cta) * 24})`}>
            <rect x={238} y={1830} width={948} height={152} rx={20} fill="rgba(217,164,65,0.10)" stroke={art.accent} strokeWidth={2} />
            <path d="M 300 1906 h 40 a 11 11 0 0 1 11 11 v 22 a 11 11 0 0 1 -11 11 h -20 l -13 13 v -13 a 11 11 0 0 1 -7 -11 v -22 a 11 11 0 0 1 7 -11 z"
              fill="none" stroke={art.accent} strokeWidth={2.2} />
            <text x={368} y={1898} fill={art.ink} fontFamily={IDENTITY.fontGrotesk} fontSize={42} fontWeight={600} letterSpacing="-0.01em">
              Satu pesan untuk matahari?
            </text>
            <text x={368} y={1944} fill="rgba(247,236,217,0.55)" fontFamily={IDENTITY.fontMono} fontSize={19} letterSpacing="0.16em">
              TULIS DI KOMENTAR
            </text>
          </g>
          <ChapterEyebrow index={11} localSec={t} x={116} />
        </Camera>
      </svg>
    </Stage>
  );
};
