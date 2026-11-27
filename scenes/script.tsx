import { TIMELINE } from './timing';

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

// ---------------------------------------------------------------------------
// IDENTITY — graphite, bone, brass and oxblood. No neon anywhere.
// ---------------------------------------------------------------------------
export const IDENTITY = {
  graphite: '#101215',
  graphiteDeep: '#08090B',
  boneIvory: '#F1EAD9',
  boneDim: '#C9BFA9',
  brass: '#C2A05A',
  brassLight: '#E4C786',
  brassDeep: '#7A5E2B',
  oxblood: '#8E3B2C',
  oxbloodLight: '#B5563F',
  slateBlue: '#5B7280',
  fluoroTeal: '#5E9E96',
  paperCream: '#EDE3CE',
  inkBlack: '#1D1A15',
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

// Every chapter owns a different material world and a different type voice.
export const CHAPTER_ART: readonly ChapterArt[] = [
  { paper: '#0B0A08', ink: '#F3E9D6', accent: '#D9A441', soft: '#7A6440' }, // 01 solar plate
  { paper: '#0C0B08', ink: '#F1E7D2', accent: '#C9A45C', soft: '#6E5C3C' }, // 02 brass calculator
  { paper: '#080A0C', ink: '#DCE7EC', accent: '#6E93A8', soft: '#43606E' }, // 03 orbit diagram
  { paper: '#07080B', ink: '#E9EEF4', accent: '#8FB4C9', soft: '#455C6B' }, // 04 escape vector
  { paper: '#0A0D10', ink: '#E4EDF2', accent: '#7FA8BF', soft: '#3F5A68' }, // 05 freeze gauge
  { paper: '#080B0F', ink: '#E7EFF3', accent: '#9BB9C7', soft: '#3D5866' }, // 06 frozen ocean
  { paper: '#120A07', ink: '#F6E7D5', accent: '#D2703F', soft: '#7A3E2A' }, // 07 red giant
  { paper: '#0C0A07', ink: '#F7ECD9', accent: '#D9A441', soft: '#6E5A3A' }, // 08 last light
];

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const prog = (t: number, t0: number, t1: number): number => (t1 <= t0 ? 1 : clamp01((t - t0) / (t1 - t0)));
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

export const CHAPTERS: readonly ChapterSpec[] = TIMELINE.chapters as readonly ChapterSpec[];

export const getActiveChapterIndex = (sec: number): number => {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) {
    if (sec >= CHAPTERS[i].start) return i;
  }
  return 0;
};
