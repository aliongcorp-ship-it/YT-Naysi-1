export type WordCue = readonly [word: string, start: number, end: number, emph: 0 | 1];

export interface CaptionCard {
  readonly text: string;
  readonly start: number;
  readonly end: number;
  readonly words: readonly WordCue[];
}

export type HeadlineSegment = readonly [prefix: string, highlight: string, suffix: string];

export interface ChapterSpec {
  readonly index: number;
  readonly num: string;
  readonly slug: string;
  readonly hud: string;
  readonly eyebrow: string;
  readonly headLines: readonly [HeadlineSegment, HeadlineSegment];
  readonly latin: string;
  readonly start: number;
  readonly end: number;
  readonly voStart: number;
  readonly voEnd: number;
  readonly cards: readonly CaptionCard[];
}

export const VIDEO_SPEC = {
  id: 'Naysi',
  width: 1440,
  height: 2560,
  fps: 90,
  durationInFrames: 10104,
  durationSec: 112.2667,
  seriesLeft: 'NAYSI',
  seriesRight: 'NAYSI · KOSMOS',
  title: 'Emas di Jarimu Bukan Buatan Bumi',
} as const;

export const IDENTITY = {
  bgStudio: '#0B0C10',
  bgStudioDeep: '#06070A',
  vellumTop: '#F3EDE1',
  vellumMid: '#EAE1D0',
  vellumDeep: '#DDD2BC',
  obsidian: '#151412',
  ink: '#1A1714',
  inkSoft: '#4B453C',
  inkMuted: '#7C7365',
  goldBright: '#FFD978',
  goldPure: '#E5A92B',
  goldDeep: '#9E6814',
  goldShadow: '#593708',
  kilonovaRed: '#B83926',
  cosmosDark: '#0A1020',
  cosmosMid: '#152442',
  neutronCyan: '#8BE8FF',
  captionWhite: '#F5F2EB',
  captionGold: '#F5BC38',
  captionDim: 'rgba(245, 242, 235, 0.28)',
  fontSerif: "'Fraunces', Georgia, serif",
  fontBody: "'Plus Jakarta Sans', -apple-system, sans-serif",
  fontDisplay: "'Space Grotesk', -apple-system, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
} as const;

export const CHAPTERS: readonly ChapterSpec[] = [
  {
    index: 1, num: "01", slug: "bukan-dari-bumi", hud: "BUKAN DARI BUMI",
    eyebrow: "LEMBAR 01  ·  LOGAM ASING",
    headLines: [["Emas di jarimu ", "bukan", ""], ["buatan planet Bumi", "", ""]],
    latin: "Aurum Cosmica · Nomor Atom 79",
    start: 0.0, end: 10.764, voStart: 0.34, voEnd: 10.554,
    cards: [
      { text: "Emas yang melingkar di jarimu", start: 0.03, end: 2.29,
        words: [["Emas", 0.34, 0.54, 1], ["yang", 0.54, 0.86, 0], ["melingkar", 0.86, 1.53, 0], ["di", 1.53, 1.693, 0], ["jarimu", 1.693, 2.28, 0]] },
      { text: "sebenarnya bukan buatan Bumi.", start: 2.28, end: 4.25,
        words: [["sebenarnya", 2.32, 2.94, 0], ["bukan", 2.94, 3.34, 1], ["buatan", 3.34, 3.82, 0], ["Bumi.", 3.82, 4.24, 1]] },
      { text: "Sejak terbentuk empat setengah miliar tahun lalu,", start: 4.24, end: 6.815,
        words: [["Sejak", 4.28, 4.704, 0], ["terbentuk", 4.7, 5.137, 0], ["empat", 5.137, 5.38, 1], ["setengah", 5.38, 5.769, 1], ["miliar", 5.769, 6.06, 1], ["tahun", 6.059, 6.543, 0], ["lalu,", 6.543, 6.805, 0]] },
      { text: "Bumi tak sanggup membuat satu gram emas pun.", start: 6.805, end: 10.734,
        words: [["Bumi", 6.845, 7.414, 1], ["tak", 7.414, 7.704, 0], ["sanggup", 7.704, 8.381, 0], ["membuat", 8.381, 9.059, 0], ["satu", 9.059, 9.155, 1], ["gram", 9.155, 9.543, 1], ["emas", 9.543, 9.833, 1], ["pun.", 9.833, 10.554, 0]] },
    ],
  },
  {
    index: 2, num: "02", slug: "perut-bumi", hud: "PERUT BUMI",
    eyebrow: "LEMBAR 02  ·  DAPUR BUMI",
    headLines: [["Gunung api cuma ", "kurir", ""], ["pengantar dari dalam", "", ""]],
    latin: "Venae Magmaticae · Kerak & Mantel Bumi",
    start: 10.764, end: 22.089, voStart: 11.014, voEnd: 21.879,
    cards: [
      { text: "Gunung berapi dan magma panas di bawah tanah", start: 10.794, end: 13.799,
        words: [["Gunung", 11.014, 11.345, 0], ["berapi", 11.345, 11.795, 0], ["dan", 11.795, 12.021, 0], ["magma", 12.021, 12.397, 1], ["panas", 12.397, 12.772, 0], ["di", 12.772, 12.922, 0], ["bawah", 12.922, 13.284, 0], ["tanah", 13.284, 13.789, 0]] },
      { text: "ternyata cuma bertugas mengangkut emas ke permukaan.", start: 13.789, end: 16.679,
        words: [["ternyata", 13.829, 14.222, 0], ["cuma", 14.222, 14.511, 0], ["bertugas", 14.511, 15.089, 0], ["mengangkut", 15.089, 15.763, 1], ["emas", 15.763, 15.965, 1], ["ke", 15.965, 16.1, 0], ["permukaan.", 16.1, 16.669, 0]] },
      { text: "Panas perut Bumi jauh terlalu lemah", start: 16.669, end: 19.849,
        words: [["Panas", 16.709, 17.39, 0], ["perut", 17.39, 18.006, 0], ["Bumi", 18.006, 18.384, 1], ["jauh", 18.384, 18.686, 0], ["terlalu", 18.686, 19.216, 0], ["lemah", 19.216, 19.839, 1]] },
      { text: "untuk merakit inti atom seberat emas.", start: 19.839, end: 22.059,
        words: [["untuk", 19.879, 20.048, 0], ["merakit", 20.048, 20.577, 0], ["inti", 20.577, 20.879, 1], ["atom", 20.879, 21.182, 0], ["seberat", 21.182, 21.711, 1], ["emas.", 21.711, 21.879, 1]] },
    ],
  },
  {
    index: 3, num: "03", slug: "mentok-di-besi", hud: "MENTOK DI BESI",
    eyebrow: "LEMBAR 03  ·  BATAS BINTANG",
    headLines: [["Bintang raksasa ", "padam", ""], ["saat menyentuh besi", "", ""]],
    latin: "Fornax Stellaris · Inti Besi-56",
    start: 22.089, end: 35.546, voStart: 22.339, voEnd: 35.336,
    cards: [
      { text: "Bahkan bintang raksasa yang jutaan derajat panasnya", start: 22.119, end: 26.099,
        words: [["Bahkan", 22.339, 22.726, 0], ["bintang", 22.726, 23.317, 1], ["raksasa", 23.317, 23.883, 0], ["yang", 23.883, 24.207, 0], ["jutaan", 24.207, 24.693, 1], ["derajat", 24.693, 25.259, 0], ["panasnya", 25.259, 26.089, 0]] },
      { text: "ikut menyerah saat intinya berubah menjadi besi.", start: 26.089, end: 29.324,
        words: [["ikut", 26.129, 26.324, 0], ["menyerah", 26.324, 26.933, 0], ["saat", 26.933, 27.238, 0], ["intinya", 27.238, 27.771, 0], ["berubah", 27.771, 28.305, 0], ["menjadi", 28.305, 28.838, 0], ["besi.", 28.838, 29.314, 1]] },
      { text: "Begitu menyentuh besi, tungku bintang langsung padam", start: 29.314, end: 32.639,
        words: [["Begitu", 29.354, 29.653, 0], ["menyentuh", 29.653, 30.304, 0], ["besi,", 30.304, 30.692, 1], ["tungku", 30.692, 31.157, 0], ["bintang", 31.157, 31.699, 1], ["langsung", 31.699, 32.319, 0], ["padam", 32.319, 32.629, 1]] },
      { text: "dan runtuh oleh gravitasinya sendiri.", start: 32.629, end: 35.516,
        words: [["dan", 32.669, 33.094, 0], ["runtuh", 33.094, 33.559, 1], ["oleh", 33.559, 33.869, 0], ["gravitasinya", 33.869, 34.799, 0], ["sendiri.", 34.799, 35.336, 0]] },
    ],
  },
  {
    index: 4, num: "04", slug: "tabrakan-bintang", hud: "TABRAKAN BINTANG",
    eyebrow: "LEMBAR 04  ·  DUA BINTANG MATI",
    headLines: [["Lahir dari ", "tabrakan", ""], ["dua bintang neutron", "", ""]],
    latin: "Kilonova · Tangkapan Neutron Cepat",
    start: 35.546, end: 51.827, voStart: 35.796, voEnd: 51.617,
    cards: [
      { text: "Emas baru bisa lahir dari bencana paling ekstrem,", start: 35.576, end: 39.266,
        words: [["Emas", 35.796, 36.01, 1], ["baru", 36.01, 36.343, 0], ["bisa", 36.343, 36.676, 0], ["lahir", 36.676, 37.093, 0], ["dari", 37.093, 37.426, 0], ["bencana", 37.426, 38.01, 0], ["paling", 38.01, 38.51, 0], ["ekstrem,", 38.51, 39.256, 1]] },
      { text: "ketika dua bintang neutron yang padat saling menghantam.", start: 39.256, end: 43.406,
        words: [["ketika", 39.296, 39.676, 0], ["dua", 39.676, 39.926, 0], ["bintang", 39.926, 40.51, 1], ["neutron", 40.51, 41.093, 1], ["yang", 41.093, 41.426, 0], ["padat", 41.426, 41.76, 0], ["saling", 41.76, 42.26, 0], ["menghantam.", 42.26, 43.396, 1]] },
      { text: "Ledakan dahsyat bernama kilonova itu memaksa atom", start: 43.396, end: 47.871,
        words: [["Ledakan", 43.436, 43.944, 0], ["dahsyat", 43.944, 44.712, 0], ["bernama", 44.712, 45.48, 0], ["kilonova", 45.48, 46.358, 1], ["itu", 46.358, 46.687, 0], ["memaksa", 46.687, 47.289, 0], ["atom", 47.289, 47.861, 0]] },
      { text: "menelan ribuan neutron dan berubah menjadi emas murni.", start: 47.861, end: 51.797,
        words: [["menelan", 47.901, 48.236, 0], ["ribuan", 48.236, 48.752, 1], ["neutron", 48.752, 49.354, 1], ["dan", 49.354, 49.612, 0], ["berubah", 49.612, 50.214, 0], ["menjadi", 50.214, 50.816, 0], ["emas", 50.816, 51.16, 1], ["murni.", 51.16, 51.617, 1]] },
    ],
  },
  {
    index: 5, num: "05", slug: "ratusan-bulan", hud: "RATUSAN BULAN",
    eyebrow: "LEMBAR 05  ·  SKALA KOSMIK",
    headLines: [["Sekali meledak, ", "emas", ""], ["seberat ratusan Bulan", "", ""]],
    latin: "Ejecta Aurea · Massa Ratusan Bulan",
    start: 51.827, end: 66.33, voStart: 52.077, voEnd: 66.12,
    cards: [
      { text: "Hanya dalam hitungan detik, satu ledakan kilonova", start: 51.857, end: 55.677,
        words: [["Hanya", 52.077, 52.386, 0], ["dalam", 52.386, 52.815, 0], ["hitungan", 52.815, 53.501, 0], ["detik,", 53.501, 54.101, 1], ["satu", 54.101, 54.444, 1], ["ledakan", 54.444, 55.045, 0], ["kilonova", 55.045, 55.667, 1]] },
      { text: "sanggup menyemburkan awan emas seberat ratusan Bulan.", start: 55.667, end: 59.547,
        words: [["sanggup", 55.707, 56.332, 0], ["menyemburkan", 56.332, 57.361, 0], ["awan", 57.361, 57.704, 0], ["emas", 57.704, 58.016, 1], ["seberat", 58.016, 58.562, 1], ["ratusan", 58.562, 59.162, 1], ["Bulan.", 59.162, 59.537, 1]] },
      { text: "Padahal seluruh emas yang pernah ditambang manusia", start: 59.537, end: 63.377,
        words: [["Padahal", 59.577, 60.305, 0], ["seluruh", 60.305, 60.855, 0], ["emas", 60.855, 61.091, 1], ["yang", 61.091, 61.405, 0], ["pernah", 61.405, 61.877, 0], ["ditambang", 61.877, 62.584, 0], ["manusia", 62.584, 63.367, 0]] },
      { text: "hanya muat di dalam satu kubus seukuran rumah.", start: 63.367, end: 66.3,
        words: [["hanya", 63.407, 63.605, 0], ["muat", 63.605, 63.92, 0], ["di", 63.92, 64.077, 0], ["dalam", 64.077, 64.47, 0], ["satu", 64.47, 64.784, 1], ["kubus", 64.784, 65.177, 1], ["seukuran", 65.177, 65.805, 0], ["rumah.", 65.805, 66.12, 1]] },
    ],
  },
  {
    index: 6, num: "06", slug: "hujan-meteor", hud: "HUJAN METEOR",
    eyebrow: "LEMBAR 06  ·  BUMI PURBA",
    headLines: [["Terkubur di ", "inti,", ""], ["ditabur ulang meteor", "", ""]],
    latin: "Imber Meteoriticus · 3,9 Miliar Tahun Lalu",
    start: 66.33, end: 82.456, voStart: 66.58, voEnd: 82.246,
    cards: [
      { text: "Saat Bumi muda masih berupa lautan magma cair,", start: 66.36, end: 69.795,
        words: [["Saat", 66.58, 66.802, 0], ["Bumi", 66.802, 67.143, 1], ["muda", 67.143, 67.485, 0], ["masih", 67.485, 67.911, 0], ["berupa", 67.911, 68.509, 0], ["lautan", 68.509, 69.021, 0], ["magma", 69.021, 69.439, 1], ["cair,", 69.439, 69.785, 0]] },
      { text: "hampir semua emas awalnya tenggelam ke inti terdalam.", start: 69.785, end: 74.155,
        words: [["hampir", 69.825, 70.493, 0], ["semua", 70.493, 70.938, 0], ["emas", 70.938, 71.205, 1], ["awalnya", 71.205, 71.827, 0], ["tenggelam", 71.827, 72.627, 1], ["ke", 72.627, 72.816, 0], ["inti", 72.816, 73.16, 1], ["terdalam.", 73.16, 74.145, 0]] },
      { text: "Emas yang kita tambang hari ini datang belakangan,", start: 74.145, end: 77.585,
        words: [["Emas", 74.185, 74.69, 1], ["yang", 74.69, 74.997, 0], ["kita", 74.997, 75.304, 0], ["tambang", 75.304, 75.842, 0], ["hari", 75.842, 76.148, 0], ["ini", 76.148, 76.455, 0], ["datang", 76.455, 76.916, 0], ["belakangan,", 76.916, 77.575, 0]] },
      { text: "dibawa hujan meteor raksasa hampir empat miliar tahun lalu.", start: 77.575, end: 82.426,
        words: [["dibawa", 77.615, 78.626, 0], ["hujan", 78.626, 79.244, 1], ["meteor", 79.244, 79.667, 1], ["raksasa", 79.667, 80.16, 0], ["hampir", 80.16, 80.583, 0], ["empat", 80.583, 80.936, 1], ["miliar", 80.936, 81.358, 1], ["tahun", 81.358, 81.711, 0], ["lalu.", 81.711, 82.246, 0]] },
    ],
  },
  {
    index: 7, num: "07", slug: "bukti-2017", hud: "BUKTI 2017",
    eyebrow: "LEMBAR 07  ·  AGUSTUS 2017",
    headLines: [["Tujuh puluh ", "teleskop", ""], ["memergoki pabrik emas", "", ""]],
    latin: "GW170817 · Galaksi NGC 4993",
    start: 82.456, end: 99.502, voStart: 82.706, voEnd: 99.292,
    cards: [
      { text: "Asal usul ini terbukti langsung pada Agustus dua ribu tujuh belas,", start: 82.486, end: 86.676,
        words: [["Asal", 82.706, 82.964, 0], ["usul", 82.964, 83.343, 0], ["ini", 83.343, 83.626, 0], ["terbukti", 83.626, 84.383, 0], ["langsung", 84.383, 85.24, 0], ["pada", 85.24, 85.437, 0], ["Agustus", 85.437, 85.782, 1], ["dua", 85.782, 85.93, 0], ["ribu", 85.93, 86.128, 0], ["tujuh", 86.128, 86.374, 1], ["belas,", 86.374, 86.67, 0]] },
      { text: "saat tujuh puluh teleskop dunia mengarah ke satu titik langit.", start: 86.666, end: 90.881,
        words: [["saat", 86.706, 87.085, 0], ["tujuh", 87.085, 87.424, 1], ["puluh", 87.424, 87.847, 1], ["teleskop", 87.847, 88.525, 1], ["dunia", 88.525, 88.949, 0], ["mengarah", 88.949, 89.626, 0], ["ke", 89.626, 89.779, 0], ["satu", 89.779, 90.055, 1], ["titik", 90.055, 90.402, 0], ["langit.", 90.402, 90.871, 0]] },
      { text: "Para astronom memergoki kilatan emas dan platina baru", start: 90.871, end: 95.176,
        words: [["Para", 90.911, 91.401, 0], ["astronom", 91.401, 92.071, 0], ["memergoki", 92.071, 92.993, 0], ["kilatan", 92.993, 93.579, 0], ["emas", 93.579, 93.83, 1], ["dan", 93.83, 94.081, 0], ["platina", 94.081, 94.667, 1], ["baru", 94.667, 95.166, 0]] },
      { text: "dari tabrakan bintang berjarak seratus tiga puluh juta tahun cahaya.", start: 95.166, end: 99.472,
        words: [["dari", 95.206, 95.383, 0], ["tabrakan", 95.383, 95.977, 0], ["bintang", 95.977, 96.497, 1], ["berjarak", 96.497, 97.091, 0], ["seratus", 97.091, 97.61, 1], ["tiga", 97.61, 97.907, 0], ["puluh", 97.907, 98.278, 1], ["juta", 98.278, 98.575, 0], ["tahun", 98.575, 98.947, 0], ["cahaya.", 98.947, 99.292, 1]] },
    ],
  },
  {
    index: 8, num: "08", slug: "fosil-bintang", hud: "FOSIL BINTANG",
    eyebrow: "LEMBAR 08  ·  WARISAN KOSMOS",
    headLines: [["Sepotong ", "bintang mati", ""], ["melingkar di jarimu", "", ""]],
    latin: "Reliquia Stellarum · Lebih Tua dari Matahari",
    start: 99.502, end: 112.267, voStart: 99.752, voEnd: 111.114,
    cards: [
      { text: "Jadi setiap perhiasan emas yang berkilau di dekatmu", start: 99.532, end: 103.607,
        words: [["Jadi", 99.752, 100.045, 0], ["setiap", 100.045, 100.54, 0], ["perhiasan", 100.54, 101.282, 0], ["emas", 101.282, 101.529, 1], ["yang", 101.529, 101.859, 0], ["berkilau", 101.859, 102.601, 0], ["di", 102.601, 102.766, 0], ["dekatmu", 102.766, 103.597, 0]] },
      { text: "adalah kepingan bintang mati yang lebih tua dari Matahari.", start: 103.597, end: 107.597,
        words: [["adalah", 103.637, 103.921, 0], ["kepingan", 103.921, 104.581, 1], ["bintang", 104.581, 105.241, 1], ["mati", 105.241, 105.571, 1], ["yang", 105.571, 105.9, 0], ["lebih", 105.9, 106.313, 0], ["tua", 106.313, 106.56, 0], ["dari", 106.56, 106.89, 0], ["Matahari.", 106.89, 107.587, 1]] },
      { text: "Ada benda emas yang sedang kamu pakai sekarang? Tulis di komentar.", start: 107.587, end: 111.65,
        words: [["Ada", 107.627, 107.855, 0], ["benda", 107.855, 108.225, 0], ["emas", 108.225, 108.447, 1], ["yang", 108.447, 108.743, 0], ["sedang", 108.743, 109.188, 0], ["kamu", 109.188, 109.484, 0], ["pakai", 109.484, 109.781, 0], ["sekarang?", 109.78, 110.32, 0], ["Tulis", 110.34, 110.68, 1], ["di", 110.68, 110.84, 0], ["komentar.", 110.84, 111.38, 1]] },
    ],
  },
];

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - clamp01(t), 3);

export const easeInOutCubic = (t: number): number => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

export const prog = (sec: number, s: number, e: number): number =>
  clamp01((sec - s) / Math.max(0.001, e - s));

export const getActiveChapterIndex = (sec: number): number => {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) {
    if (sec >= CHAPTERS[i].start) return i;
  }
  return 0;
};

export const getActiveCard = (
  ch: ChapterSpec,
  sec: number,
): { card: CaptionCard; cardIndex: number } | null => {
  for (let i = 0; i < ch.cards.length; i++) {
    const c = ch.cards[i];
    const nextStart = i + 1 < ch.cards.length ? ch.cards[i + 1].start : c.end;
    if (sec >= c.start && sec < nextStart) {
      return { card: c, cardIndex: i };
    }
  }
  const last = ch.cards[ch.cards.length - 1];
  if (sec >= last.start && sec <= last.end) {
    return { card: last, cardIndex: ch.cards.length - 1 };
  }
  return null;
};
