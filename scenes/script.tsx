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
  readonly cards: readonly CaptionCard[];
}

export const WIDTH = 1440;
export const HEIGHT = 2560;
export const FPS = 90;
export const TOTAL_FRAMES = 10490;
export const TOTAL_DURATION_SEC = 116.5556;

export const VIDEO_SPEC = {
  id: 'Naysi',
  title: 'Bau Hujan Itu Bukan Aroma Air, Tapi Jebakan Bakteri',
  topicWatermark: 'BIOLOGI · ALAM',
  width: WIDTH,
  height: HEIGHT,
  fps: FPS,
  durationInFrames: TOTAL_FRAMES,
  durationSec: TOTAL_DURATION_SEC,
} as const;

// Bespoke Non-Neon Botanical Herbarium & Tropical Monsoon Palette
export const IDENTITY = {
  canvasRainTop: '#101715',
  canvasRainBot: '#090D0C',
  amberSpore: '#D8A148',
  amberLight: '#ECC77E',
  amberDeep: '#8C5F1E',
  mossSage: '#7A9E73',
  mossLight: '#A8C4A0',
  mossDeep: '#3E5939',
  lateriteClay: '#B66343',
  lateriteDeep: '#7A3B24',
  stampRust: '#9E3324',
  rainMist: '#CFDCD9',
  rainSlate: '#5A767D',
  poolTile: '#3B6978',
  poolWater: '#4F818E',
  ivoryText: '#F2EFE8',
  stoneText: '#A7A398',
  mutedText: '#6F6C63',
  paperHerbarium: '#EFE7D6',
  paperInk: '#221E18',
  paperMuted: '#655C4F',
  paperRule: 'rgba(42, 35, 26, 0.18)',
  fontDisplay: "'Bebas Neue', 'Oswald', sans-serif",
  fontEditorial: "'Oswald', 'Plus Jakarta Sans', sans-serif",
  fontSerif: "'Cormorant Garamond', 'Instrument Serif', Georgia, serif",
  fontBody: "'Plus Jakarta Sans', -apple-system, sans-serif",
  fontMono: "'IBM Plex Mono', 'JetBrains Mono', monospace",
  fontGrotesk: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
  fontInstrument: "'Instrument Serif', 'Cormorant Garamond', Georgia, serif",
  fontFraunces: "'Fraunces', 'Cormorant Garamond', Georgia, serif",
} as const;

// ---------------------------------------------------------------------------
// PER-CHAPTER ART DIRECTION — every chapter owns a distinct palette & type voice
// ---------------------------------------------------------------------------
export interface ChapterArt {
  readonly paper: string;
  readonly ink: string;
  readonly accent: string;
  readonly soft: string;
}
export const CHAPTER_ART: readonly ChapterArt[] = [
  { paper: '#0B100E', ink: '#EDE7D7', accent: '#C9A45C', soft: '#6E8170' },
  { paper: '#080C0D', ink: '#DDE5E2', accent: '#DDB066', soft: '#57707A' },
  { paper: '#120E0A', ink: '#F0E8D6', accent: '#C98B4B', soft: '#7E6136' },
  { paper: '#EFE6D2', ink: '#231D15', accent: '#9E3B2A', soft: '#5D6B57' },
  { paper: '#0C110C', ink: '#ECE6D4', accent: '#B7A46A', soft: '#5F7A55' },
  { paper: '#0A0907', ink: '#EAE3D3', accent: '#AA8A50', soft: '#6A5E45' },
  { paper: '#151009', ink: '#F3EAD8', accent: '#C9974E', soft: '#7C5D3A' },
  { paper: '#0F0C0A', ink: '#F4ECDC', accent: '#C0703F', soft: '#6B6A52' },
];

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

export const prog = (t: number, t0: number, t1: number): number =>
  t1 <= t0 ? 1 : clamp01((t - t0) / (t1 - t0));

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

export const CHAPTERS: readonly ChapterSpec[] = [
  {
    index: 0,
    slug: "bukan-air",
    eyebrow: "FENOMENA PETRIKOR \u00b7 TETES HUJAN PERTAMA",
    groundTop: "#101715",
    groundBottom: "#090D0C",
    start: 0.0,
    end: 11.22,
    voStart: 0.18,
    voEnd: 11.08,
    cards: [
      { text: "Aroma wangi yang langsung tercium saat", start: 0.2, end: 2.351, words: [["Aroma", 0.2, 0.741, 0], ["wangi", 0.741, 1.121, 0], ["yang", 1.121, 1.328, 0], ["langsung", 1.328, 1.741, 0], ["tercium", 1.741, 2.144, 0], ["saat", 2.144, 2.351, 0]] },
      { text: "hujan turun sebenarnya bukan bau air.", start: 2.351, end: 4.64, words: [["hujan", 2.351, 2.73, 0], ["turun", 2.73, 3.11, 0], ["sebenarnya", 3.11, 3.869, 0], ["bukan", 3.869, 4.249, 1], ["bau", 4.249, 4.444, 1], ["air.", 4.444, 4.64, 0]] },
      { text: "Air hujan murni sama sekali tidak punya", start: 4.83, end: 6.705, words: [["Air", 4.83, 4.969, 1], ["hujan", 4.969, 5.239, 0], ["murni", 5.239, 5.509, 0], ["sama", 5.509, 5.771, 0], ["sekali", 5.771, 6.165, 0], ["tidak", 6.165, 6.435, 0], ["punya", 6.435, 6.705, 0]] },
      { text: "aroma, wangi khas itu justru jebakan kimia", start: 6.705, end: 9.415, words: [["aroma,", 6.705, 7.09, 0], ["wangi", 7.27, 7.628, 0], ["khas", 7.628, 7.822, 0], ["itu", 7.822, 8.158, 0], ["justru", 8.158, 8.527, 0], ["jebakan", 8.527, 9.058, 1], ["kimia", 9.058, 9.415, 0]] },
      { text: "yang dipasang bakteri tanah.", start: 9.415, end: 11.04, words: [["yang", 9.415, 9.61, 0], ["dipasang", 9.61, 10.152, 0], ["bakteri", 10.152, 10.682, 1], ["tanah.", 10.682, 11.04, 0]] },
    ],
  },
  {
    index: 1,
    slug: "aerosol-mit",
    eyebrow: "KAMERA KECEPATAN TINGGI \u00b7 MIT 2015",
    groundTop: "#11181A",
    groundBottom: "#090E10",
    start: 11.22,
    end: 26.05,
    voStart: 11.36,
    voEnd: 25.91,
    cards: [
      { text: "Rekaman kamera super cepat di MIT mengungkap", start: 11.39, end: 13.998, words: [["Rekaman", 11.39, 11.853, 0], ["kamera", 11.853, 12.307, 0], ["super", 12.307, 12.619, 0], ["cepat", 12.619, 12.931, 0], ["di", 12.931, 13.082, 0], ["MIT", 13.082, 13.507, 1], ["mengungkap", 13.507, 13.998, 0]] },
      { text: "caranya melompat ke udara.", start: 13.998, end: 15.53, words: [["caranya", 13.998, 14.461, 0], ["melompat", 14.461, 14.934, 0], ["ke", 14.934, 15.085, 0], ["udara.", 15.085, 15.53, 0]] },
      { text: "Saat gerimis pelan menimpa tanah berpori,", start: 15.72, end: 17.93, words: [["Saat", 15.72, 15.892, 0], ["gerimis", 15.892, 16.361, 1], ["pelan", 16.361, 16.677, 0], ["menimpa", 16.677, 17.145, 0], ["tanah", 17.145, 17.461, 1], ["berpori,", 17.461, 17.93, 0]] },
      { text: "tetesannya mengurung gelembung udara kecil", start: 18.13, end: 20.557, words: [["tetesannya", 18.13, 18.776, 0], ["mengurung", 18.776, 19.275, 0], ["gelembung", 19.275, 19.773, 1], ["udara", 19.773, 20.234, 0], ["kecil", 20.234, 20.557, 0]] },
      { text: "yang meletup seperti soda dan melontarkan", start: 20.557, end: 22.827, words: [["yang", 20.557, 20.733, 0], ["meletup", 20.733, 21.212, 0], ["seperti", 21.212, 21.692, 0], ["soda", 21.692, 22.005, 1], ["dan", 22.005, 22.171, 0], ["melontarkan", 22.171, 22.827, 0]] },
      { text: "ratusan kabut halus pembawa bau mendahului", start: 22.827, end: 25.244, words: [["ratusan", 22.827, 23.306, 0], ["kabut", 23.306, 23.629, 1], ["halus", 23.629, 23.952, 0], ["pembawa", 23.952, 24.432, 0], ["bau", 24.432, 24.598, 1], ["mendahului", 24.598, 25.244, 1]] },
      { text: "awan hujan.", start: 25.244, end: 25.88, words: [["awan", 25.244, 25.557, 0], ["hujan.", 25.557, 25.88, 0]] },
    ],
  },
  {
    index: 2,
    slug: "streptomyces",
    eyebrow: "MIKROBIOLOGI TANAH \u00b7 KOLONI STREPTOMYCES",
    groundTop: "#161410",
    groundBottom: "#0C0A08",
    start: 26.05,
    end: 42.78,
    voStart: 26.19,
    voEnd: 42.64,
    cards: [
      { text: "Peracik utamanya adalah bakteri tanah", start: 26.21, end: 29.097, words: [["Peracik", 26.21, 26.792, 0], ["utamanya", 26.792, 27.553, 0], ["adalah", 27.553, 28.123, 0], ["bakteri", 28.123, 28.705, 1], ["tanah", 28.705, 29.097, 1]] },
      { text: "bernama Streptomyces, keluarga mikroba", start: 29.097, end: 31.459, words: [["bernama", 29.097, 29.679, 0], ["Streptomyces,", 29.679, 30.32, 1], ["keluarga", 30.52, 30.994, 0], ["mikroba", 30.994, 31.459, 0]] },
      { text: "penghasil dua pertiga antibiotik medis", start: 31.459, end: 33.507, words: [["penghasil", 31.459, 31.942, 0], ["dua", 31.942, 32.103, 1], ["pertiga", 32.103, 32.568, 1], ["antibiotik", 32.568, 33.194, 1], ["medis", 33.194, 33.507, 0]] },
      { text: "dunia.", start: 33.507, end: 33.82, words: [["dunia.", 33.507, 33.82, 0]] },
      { text: "Ketika tanah mengering saat kemarau,", start: 34.03, end: 36.13, words: [["Ketika", 34.03, 34.537, 0], ["tanah", 34.537, 34.885, 1], ["mengering", 34.885, 35.423, 0], ["saat", 35.423, 35.613, 0], ["kemarau,", 35.613, 36.13, 0]] },
      { text: "koloni bakteri ini terancam mati lalu", start: 36.37, end: 38.926, words: [["koloni", 36.37, 36.877, 0], ["bakteri", 36.877, 37.394, 1], ["ini", 37.394, 37.722, 0], ["terancam", 37.722, 38.25, 0], ["mati", 38.25, 38.588, 0], ["lalu", 38.588, 38.926, 0]] },
      { text: "memproduksi spora bersama molekul parfum", start: 38.926, end: 41.375, words: [["memproduksi", 38.926, 39.633, 0], ["spora", 39.633, 39.982, 0], ["bersama", 39.982, 40.499, 0], ["molekul", 40.499, 41.017, 0], ["parfum", 41.017, 41.375, 0]] },
      { text: "bumi bernama geosmin.", start: 41.375, end: 42.6, words: [["bumi", 41.375, 41.713, 0], ["bernama", 41.713, 42.231, 0], ["geosmin.", 42.231, 42.6, 1]] },
    ],
  },
  {
    index: 3,
    slug: "empat-ratus-kolam",
    eyebrow: "AMBANG PENCIUMAN MANUSIA \u00b7 GEOSMIN",
    groundTop: "#0E1618",
    groundBottom: "#080D0F",
    start: 42.78,
    end: 59.49,
    voStart: 42.92,
    voEnd: 59.35,
    cards: [
      { text: "Anehnya, hidung manusia sanggup mengendus", start: 42.94, end: 45.918, words: [["Anehnya,", 42.94, 43.61, 0], ["hidung", 43.81, 44.234, 0], ["manusia", 44.234, 44.846, 0], ["sanggup", 44.846, 45.282, 0], ["mengendus", 45.282, 45.918, 0]] },
      { text: "geosmin hanya pada kadar lima bagian per", start: 45.918, end: 48.614, words: [["geosmin", 45.918, 46.355, 1], ["hanya", 46.355, 46.766, 0], ["pada", 46.766, 47.166, 0], ["kadar", 47.166, 47.578, 0], ["lima", 47.578, 47.977, 1], ["bagian", 47.977, 48.402, 0], ["per", 48.402, 48.614, 0]] },
      { text: "triliun, setara satu sendok teh di dalam", start: 48.614, end: 51.209, words: [["triliun,", 48.614, 49.05, 1], ["setara", 49.18, 49.721, 0], ["satu", 49.721, 50.082, 0], ["sendok", 50.082, 50.465, 0], ["teh", 50.465, 50.656, 0], ["di", 50.656, 50.837, 0], ["dalam", 50.837, 51.209, 0]] },
      { text: "empat ratus kolam renang Olimpiade.", start: 51.209, end: 53.44, words: [["empat", 51.209, 51.581, 1], ["ratus", 51.581, 51.952, 1], ["kolam", 51.952, 52.324, 0], ["renang", 52.324, 52.707, 0], ["Olimpiade.", 52.707, 53.44, 0]] },
      { text: "Kepekaan kita terhadap bau hujan dua ratus", start: 53.62, end: 56.12, words: [["Kepekaan", 53.62, 54.159, 0], ["kita", 54.159, 54.504, 0], ["terhadap", 54.504, 55.042, 0], ["bau", 55.042, 55.225, 1], ["hujan", 55.225, 55.581, 0], ["dua", 55.581, 55.764, 1], ["ratus", 55.764, 56.12, 1]] },
      { text: "ribu kali lebih tajam daripada hiu saat", start: 56.12, end: 58.588, words: [["ribu", 56.12, 56.465, 1], ["kali", 56.465, 56.81, 0], ["lebih", 56.81, 57.165, 0], ["tajam", 57.165, 57.521, 0], ["daripada", 57.521, 58.211, 0], ["hiu", 58.211, 58.394, 1], ["saat", 58.394, 58.588, 0]] },
      { text: "mencium darah.", start: 58.588, end: 59.32, words: [["mencium", 58.588, 58.964, 0], ["darah.", 58.964, 59.32, 0]] },
    ],
  },
  {
    index: 4,
    slug: "kutu-pegas",
    eyebrow: "EVOLUSI 450 JUTA TAHUN \u00b7 COLLEMBOLA",
    groundTop: "#131712",
    groundBottom: "#0A0D09",
    start: 59.49,
    end: 74.01,
    voStart: 59.63,
    voEnd: 73.87,
    cards: [
      { text: "Namun parfum itu bukan dibuat untuk manusia.", start: 59.66, end: 62.3, words: [["Namun", 59.66, 60.013, 0], ["parfum", 60.013, 60.376, 0], ["itu", 60.376, 60.708, 0], ["bukan", 60.708, 61.06, 1], ["dibuat", 61.06, 61.424, 0], ["untuk", 61.424, 61.776, 0], ["manusia.", 61.776, 62.3, 0]] },
      { text: "Riset tahun dua ribu dua puluh membuktikan", start: 62.49, end: 64.968, words: [["Riset", 62.49, 62.842, 0], ["tahun", 62.842, 63.195, 0], ["dua", 63.195, 63.376, 1], ["ribu", 63.376, 63.718, 1], ["dua", 63.718, 63.9, 1], ["puluh", 63.9, 64.252, 0], ["membuktikan", 64.252, 64.968, 0]] },
      { text: "geosmin adalah umpan berusia ratusan juta", start: 64.968, end: 67.596, words: [["geosmin", 64.968, 65.342, 1], ["adalah", 65.342, 65.854, 0], ["umpan", 65.854, 66.207, 1], ["berusia", 66.207, 66.73, 0], ["ratusan", 66.73, 67.254, 0], ["juta", 67.254, 67.596, 0]] },
      { text: "tahun untuk memancing kutu pegas,", start: 67.596, end: 69.54, words: [["tahun", 67.596, 67.948, 0], ["untuk", 67.948, 68.301, 0], ["memancing", 68.301, 68.846, 0], ["kutu", 68.846, 69.188, 1], ["pegas,", 69.188, 69.54, 1]] },
      { text: "hewan tanah seukuran ujung jarum yang", start: 69.75, end: 71.8, words: [["hewan", 69.75, 70.088, 0], ["tanah", 70.088, 70.427, 1], ["seukuran", 70.427, 70.939, 0], ["ujung", 70.939, 71.278, 0], ["jarum", 71.278, 71.616, 0], ["yang", 71.616, 71.8, 0]] },
      { text: "memiliki antena pelacak geosmin.", start: 71.8, end: 73.81, words: [["memiliki", 71.8, 72.457, 0], ["antena", 72.457, 72.949, 1], ["pelacak", 72.949, 73.452, 0], ["geosmin.", 73.452, 73.81, 1]] },
    ],
  },
  {
    index: 5,
    slug: "kurir-spora",
    eyebrow: "SIMBIOSIS PENYEBARAN \u00b7 LONTARAN EKOR PEGAS",
    groundTop: "#15130F",
    groundBottom: "#0B0A08",
    start: 74.01,
    end: 89.12,
    voStart: 74.15,
    voEnd: 88.98,
    cards: [
      { text: "Terpikat baunya, kutu pegas datang melahap", start: 74.17, end: 76.701, words: [["Terpikat", 74.17, 74.753, 0], ["baunya,", 74.753, 75.15, 0], ["kutu", 75.33, 75.627, 1], ["pegas", 75.627, 75.932, 1], ["datang", 75.932, 76.247, 0], ["melahap", 76.247, 76.701, 1]] },
      { text: "bakteri tersebut bulat-bulat.", start: 76.701, end: 78.23, words: [["bakteri", 76.701, 77.155, 1], ["tersebut", 77.155, 77.619, 0], ["bulat-bulat.", 77.619, 78.23, 0]] },
      { text: "Padahal cangkang spora bakteri tahan dicerna", start: 78.47, end: 80.869, words: [["Padahal", 78.47, 78.942, 0], ["cangkang", 78.942, 79.289, 0], ["spora", 79.289, 79.606, 0], ["bakteri", 79.606, 80.079, 1], ["tahan", 80.079, 80.397, 1], ["dicerna", 80.397, 80.869, 1]] },
      { text: "di dalam perut dan menempel di tubuhnya,", start: 80.869, end: 82.94, words: [["di", 80.869, 81.023, 0], ["dalam", 81.023, 81.341, 0], ["perut", 81.341, 81.659, 0], ["dan", 81.659, 81.822, 0], ["menempel", 81.822, 82.304, 0], ["di", 82.304, 82.458, 0], ["tubuhnya,", 82.458, 82.94, 0]] },
      { text: "sehingga saat kutu pegas melenting jauh", start: 83.14, end: 85.325, words: [["sehingga", 83.14, 83.681, 0], ["saat", 83.681, 83.876, 0], ["kutu", 83.876, 84.222, 1], ["pegas", 84.222, 84.579, 1], ["melenting", 84.579, 85.131, 1], ["jauh", 85.131, 85.325, 0]] },
      { text: "ke tanah lembap baru,", start: 85.325, end: 86.57, words: [["ke", 85.325, 85.499, 0], ["tanah", 85.499, 85.856, 1], ["lembap", 85.856, 86.224, 0], ["baru,", 86.224, 86.57, 0]] },
      { text: "ia menjadi kurir penyebar koloni baru.", start: 86.75, end: 88.92, words: [["ia", 86.75, 86.902, 0], ["menjadi", 86.902, 87.369, 0], ["kurir", 87.369, 87.683, 1], ["penyebar", 87.683, 88.158, 0], ["koloni", 88.158, 88.615, 0], ["baru.", 88.615, 88.92, 0]] },
    ],
  },
  {
    index: 6,
    slug: "kompas-gurun",
    eyebrow: "NALURI EVOLUSI \u00b7 PELACAK SUMBER AIR",
    groundTop: "#17140F",
    groundBottom: "#0C0A07",
    start: 89.12,
    end: 102.27,
    voStart: 89.26,
    voEnd: 102.13,
    cards: [
      { text: "Manusia ikut menyukai bau jebakan ini", start: 89.28, end: 91.375, words: [["Manusia", 89.28, 89.73, 0], ["ikut", 89.73, 90.024, 0], ["menyukai", 90.024, 90.484, 0], ["bau", 90.484, 90.64, 1], ["jebakan", 90.64, 91.09, 1], ["ini", 91.09, 91.375, 0]] },
      { text: "karena alasan bertahan hidup.", start: 91.375, end: 93.02, words: [["karena", 91.375, 91.816, 0], ["alasan", 91.816, 92.258, 0], ["bertahan", 92.258, 92.717, 1], ["hidup.", 92.717, 93.02, 1]] },
      { text: "Bagi nenek moyang kita hingga kawanan", start: 93.51, end: 95.481, words: [["Bagi", 93.51, 93.805, 0], ["nenek", 93.805, 94.109, 0], ["moyang", 94.109, 94.422, 0], ["kita", 94.422, 94.717, 0], ["hingga", 94.717, 95.03, 0], ["kawanan", 95.03, 95.481, 0]] },
      { text: "unta di gurun kering,", start: 95.481, end: 96.54, words: [["unta", 95.481, 95.776, 1], ["di", 95.776, 95.923, 0], ["gurun", 95.923, 96.227, 0], ["kering,", 96.227, 96.54, 0]] },
      { text: "hembusan geosmin dari kejauhan adalah", start: 96.85, end: 99.188, words: [["hembusan", 96.85, 97.394, 0], ["geosmin", 97.394, 97.774, 1], ["dari", 97.774, 98.122, 0], ["kejauhan", 98.122, 98.666, 0], ["adalah", 98.666, 99.188, 0]] },
      { text: "kompas alami penunjuk sumber air dan tanah", start: 99.188, end: 101.711, words: [["kompas", 99.188, 99.558, 1], ["alami", 99.558, 100.069, 0], ["penunjuk", 100.069, 100.613, 0], ["sumber", 100.613, 100.983, 0], ["air", 100.983, 101.167, 1], ["dan", 101.167, 101.352, 0], ["tanah", 101.352, 101.711, 1]] },
      { text: "subur.", start: 101.711, end: 102.07, words: [["subur.", 101.711, 102.07, 0]] },
    ],
  },
  {
    index: 7,
    slug: "paradoks-ikan",
    eyebrow: "SATU MOLEKUL DUA WAJAH \u00b7 C12H22O",
    groundTop: "#141210",
    groundBottom: "#0A0908",
    start: 102.27,
    end: 116.5556,
    voStart: 102.41,
    voEnd: 116.13,
    cards: [
      { text: "Uniknya, molekul geosmin yang persis sama", start: 102.43, end: 104.954, words: [["Uniknya,", 102.43, 103.06, 0], ["molekul", 103.24, 103.74, 0], ["geosmin", 103.74, 104.097, 1], ["yang", 104.097, 104.281, 0], ["persis", 104.281, 104.627, 0], ["sama", 104.627, 104.954, 0]] },
      { text: "juga menjadi penyebab rasa bau tanah pada", start: 104.954, end: 107.455, words: [["juga", 104.954, 105.281, 0], ["menjadi", 105.281, 105.781, 0], ["penyebab", 105.781, 106.292, 0], ["rasa", 106.292, 106.618, 0], ["bau", 106.618, 106.792, 1], ["tanah", 106.792, 107.129, 1], ["pada", 107.129, 107.455, 0]] },
      { text: "ikan lele dan gurame yang dibenci lidah", start: 107.455, end: 109.793, words: [["ikan", 107.455, 107.782, 0], ["lele", 107.782, 108.109, 1], ["dan", 108.109, 108.282, 0], ["gurame", 108.282, 108.773, 1], ["yang", 108.773, 108.956, 0], ["dibenci", 108.956, 109.456, 0], ["lidah", 109.456, 109.793, 0]] },
      { text: "kita.", start: 109.793, end: 110.12, words: [["kita.", 109.793, 110.12, 0]] },
      { text: "Saat gerimis pertama turun,", start: 110.34, end: 111.75, words: [["Saat", 110.34, 110.51, 0], ["gerimis", 110.51, 110.974, 1], ["pertama", 110.974, 111.438, 0], ["turun,", 111.438, 111.75, 0]] },
      { text: "kamu tim langsung keluar menghirup udaranya", start: 111.93, end: 113.95, words: [["kamu", 111.93, 112.206, 0], ["tim", 112.206, 112.353, 0], ["langsung", 112.353, 112.664, 0], ["keluar", 112.664, 112.957, 1], ["menghirup", 112.957, 113.397, 0], ["udaranya", 113.397, 113.95, 0]] },
      { text: "atau tetap di dalam rumah?", start: 113.95, end: 115.22, words: [["atau", 113.95, 114.227, 0], ["tetap", 114.227, 114.512, 0], ["di", 114.512, 114.65, 0], ["dalam", 114.65, 114.935, 0], ["rumah?", 114.935, 115.22, 0]] },
      { text: "Tulis di komentar.", start: 115.41, end: 116.08, words: [["Tulis", 115.41, 115.633, 0], ["di", 115.633, 115.742, 0], ["komentar.", 115.742, 116.08, 1]] },
    ],
  },
];

export function getActiveChapterIndex(sec: number): number {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) {
    if (sec >= CHAPTERS[i].start) return i;
  }
  return 0;
}
