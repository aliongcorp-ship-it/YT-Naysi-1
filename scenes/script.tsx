import { TIMELINE } from './timing';

// ============================================================================
// TYPES
// ============================================================================

export type WordCue = readonly [word: string, start: number, end: number, emph: 0 | 1];

export interface CaptionCard {
  readonly text: string;
  readonly start: number;
  readonly end: number;
  readonly words: readonly WordCue[];
}

export interface ChapterSpec {
  readonly index: number;
  readonly slug: string;
  readonly eyebrow: string;
  readonly groundTop: string;
  readonly groundBottom: string;
  readonly start: number;
  readonly end: number;
  readonly voStart: number;
  readonly voEnd: number;
  readonly mood: string;
  readonly cards: readonly CaptionCard[];
}

// ============================================================================
// FORMAT
// ============================================================================

export const WIDTH = 1440;
export const HEIGHT = 2560;
export const FPS = 90;
export const TOTAL_FRAMES = TIMELINE.totalFrames;
export const TOTAL_DURATION_SEC = TIMELINE.totalDuration;

export const VIDEO_SPEC = {
  id: 'Naysi',
  title: '8 Menit Setelah Matahari Mati',
  topicWatermark: 'ASTRONOMI · 8 MENIT',
  width: WIDTH,
  height: HEIGHT,
  fps: FPS,
  durationInFrames: TOTAL_FRAMES,
  durationSec: TOTAL_DURATION_SEC,
} as const;

// headline of every chapter, used by the scene compositions
export const CHAPTER_TITLES: readonly string[] = [
  'CAHAYA YANG TERLAMBAT',
  'EMPAT RATUS SEMBILAN PULUH SEMBILAN',
  'MELIHAT MASA LALU',
  'MENGELILINGI BAYANGAN',
  'ORBIT LEPAS',
  'MINGGU PERTAMA',
  'BULAN IKUT PADAM',
  'TAHUN PERTAMA',
  'HIDUP TANPA CAHAYA',
  'RAKSASA MERAH',
  'BARA PUTIH',
  'PESAN UNTUK MATAHARI',
];

export const CHAPTER_KICKERS: readonly string[] = [
  'skenario yang mustahil, tapi tetap diajarkan',
  'aritmetika cahaya',
  'skala yang membuat kepala pusing',
  'relativitas umum, versi sederhana',
  'kecepatan melarikan diri',
  'tiga puluh derajat di bawah titik beku',
  'cahaya pantulan yang ikut mati',
  'laut yang membeku dari atas',
  'ekosistem yang tidak pernah butuh fajar',
  'evolusi bintang deret utama',
  'sisa yang sangat padat',
  'delapan menit yang tidak bisa dikembalikan',
];

// ============================================================================
// IDENTITY — graphite, solar gold, ember, cold steel. No neon, no glassmorphism.
// ============================================================================

export const IDENTITY = {
  graphite: '#101215',
  graphiteDeep: '#08090B',
  boneIvory: '#F3E9D6',
  boneDim: '#C9BFA9',
  brass: '#C9A45C',
  brassLight: '#E8CF95',
  brassDeep: '#7A5E2B',
  ember: '#D2703F',
  emberDeep: '#7E2312',
  solar: '#D9A441',
  solarPale: '#FFE7B4',
  steelBlue: '#6E93A8',
  steelDeep: '#26485F',
  ice: '#CFE6F0',
  inkBlack: '#1D1A15',
  paperCream: '#EDE3CE',
  fontDisplay: "'Bebas Neue', 'Oswald', sans-serif",
  fontEditorial: "'Oswald', 'Plus Jakarta Sans', sans-serif",
  fontSerif: "'Cormorant Garamond', 'Instrument Serif', Georgia, serif",
  fontBody: "'Plus Jakarta Sans', -apple-system, sans-serif",
  fontMono: "'IBM Plex Mono', 'JetBrains Mono', monospace",
  fontGrotesk: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
  fontInstrument: "'Instrument Serif', 'Cormorant Garamond', Georgia, serif",
  fontFraunces: "'Fraunces', 'Cormorant Garamond', Georgia, serif",
} as const;

export interface ChapterArt {
  readonly paper: string;
  readonly ink: string;
  readonly accent: string;
  readonly soft: string;
}

// one material world per chapter: plate, brass, atlas, wireframe, void, frost,
// moonlight, ice, abyss, ember, nebula, tungsten room
export const CHAPTER_ART: readonly ChapterArt[] = [
  { paper: '#0B0A08', ink: '#F3E9D6', accent: '#D9A441', soft: '#7A6440' },
  { paper: '#0C0B08', ink: '#F1E7D2', accent: '#C9A45C', soft: '#6E5C3C' },
  { paper: '#090B0E', ink: '#E6EDF4', accent: '#8FA9C4', soft: '#4A5F76' },
  { paper: '#080A0C', ink: '#DCE7EC', accent: '#6E93A8', soft: '#43606E' },
  { paper: '#07080B', ink: '#E9EEF4', accent: '#8FB4C9', soft: '#455C6B' },
  { paper: '#0A0D10', ink: '#E4EDF2', accent: '#7FA8BF', soft: '#3F5A68' },
  { paper: '#08090D', ink: '#D8E2EE', accent: '#A8B6CC', soft: '#4C5670' },
  { paper: '#080B0F', ink: '#E7EFF3', accent: '#9BB9C7', soft: '#3D5866' },
  { paper: '#07090C', ink: '#D9E8EC', accent: '#5FA8A0', soft: '#356A66' },
  { paper: '#120A07', ink: '#F6E7D5', accent: '#D2703F', soft: '#7A3E2A' },
  { paper: '#0A0B10', ink: '#E7E9F2', accent: '#9AA6D4', soft: '#4E5680' },
  { paper: '#0C0A07', ink: '#F7ECD9', accent: '#D9A441', soft: '#6E5A3A' },
];

// ============================================================================
// MATH
// ============================================================================

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const prog = (t: number, t0: number, t1: number): number =>
  t1 <= t0 ? (t >= t0 ? 1 : 0) : clamp01((t - t0) / (t1 - t0));
export const smoothstep = (x: number): number => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
export const easeOutCubic = (x: number): number => 1 - Math.pow(1 - clamp01(x), 3);
export const easeOutQuart = (x: number): number => 1 - Math.pow(1 - clamp01(x), 4);
export const easeOutExpo = (x: number): number => {
  const c = clamp01(x);
  return c === 1 ? 1 : 1 - Math.pow(2, -10 * c);
};
export const easeInOutCubic = (x: number): number => {
  const c = clamp01(x);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};
export const easeInOutSine = (x: number): number => -(Math.cos(Math.PI * clamp01(x)) - 1) / 2;

// deterministic hash, safe inside render
export const hash = (a: number, b = 0, c = 0): number => {
  const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return v - Math.floor(v);
};

// ============================================================================
// FORMATTERS (Indonesian conventions: 149.600.000 / 8,20)
// ============================================================================

export const nf = (v: number, digits = 0): string =>
  v.toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const mmss = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

// ============================================================================
// CHAPTER DATA
// ============================================================================

export const CHAPTERS: readonly ChapterSpec[] = TIMELINE.chapters as readonly ChapterSpec[];

export const getActiveChapterIndex = (sec: number): number => {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) {
    if (sec >= CHAPTERS[i].start) return i;
  }
  return 0;
};

export const CHAPTER_CARDS = CHAPTERS.map((c) => c.cards);
