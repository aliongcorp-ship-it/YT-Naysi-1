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
  durationInFrames: 10619,
  durationSec: 117.9889,
  seriesLeft: 'NAYSI',
  seriesRight: 'NAYSI · SEJARAH',
  title: '10 Hari di Oktober 1582 Hilang dari Kalender',
} as const;

export const IDENTITY = {
  bgStudio: '#0D0E12',
  bgStudioDeep: '#07080B',
  vellumTop: '#F4EFE3',
  vellumMid: '#EDE5D4',
  vellumDeep: '#E3D8C3',
  plateBg: '#EAE1CF',
  plateTint: '#DFD5C0',
  ink: '#191714',
  inkSoft: '#49433A',
  inkMuted: '#7A7164',
  inkHairline: 'rgba(25, 23, 20, 0.18)',
  crimson: '#BC3428',
  crimsonSoft: 'rgba(188, 52, 40, 0.13)',
  lapis: '#214E78',
  lapisSoft: 'rgba(33, 78, 120, 0.13)',
  brass: '#B88224',
  verdigris: '#1F6A54',
  verdigrisSoft: 'rgba(31, 106, 84, 0.14)',
  captionWhite: '#F5F2EB',
  captionGold: '#F4BE44',
  captionDim: 'rgba(245, 242, 235, 0.28)',
  fontSerif: "'Fraunces', Georgia, serif",
  fontBody: "'Plus Jakarta Sans', -apple-system, sans-serif",
  fontDisplay: "'Space Grotesk', -apple-system, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
} as const;

export const CHAPTERS: readonly ChapterSpec[] = [
  {
    index: 1, num: "01", slug: "sepuluh-hari", hud: "10 HARI HILANG",
    eyebrow: "LEMBAR 01  \u00b7  OKTOBER 1582",
    headLines: [["Sepuluh hari ", "lenyap", ""], ["dari kalender dunia", "", ""]],
    latin: "Tabula Mensis Octobris · Anno Domini 1582",
    start: 0.0, end: 13.985, voStart: 0.363, voEnd: 13.758,
    cards: [
      { text: "Pada Oktober seribu lima ratus delapan puluh dua,", start: 0.03, end: 3.238,
        words: [["Pada", 0.363, 0.573, 0], ["Oktober", 0.573, 1.153, 1], ["seribu", 1.153, 1.643, 0], ["lima", 1.643, 1.973, 1], ["ratus", 1.973, 2.383, 0], ["delapan", 2.383, 2.743, 0], ["puluh", 2.743, 2.981, 0], ["dua,", 2.981, 3.248, 0]] },
      { text: "sepuluh hari dihapus begitu saja dari kalender.", start: 3.238, end: 6.948,
        words: [["sepuluh", 3.288, 3.683, 1], ["hari", 3.683, 4.013, 0], ["dihapus", 4.013, 4.583, 1], ["begitu", 4.583, 5.083, 0], ["saja", 5.083, 5.413, 0], ["dari", 5.413, 5.743, 0], ["kalender.", 5.743, 6.958, 0]] },
      { text: "Orang tidur pada Kamis empat Oktober,", start: 6.948, end: 9.488,
        words: [["Orang", 6.998, 7.253, 0], ["tidur", 7.253, 7.663, 0], ["pada", 7.663, 7.993, 0], ["Kamis", 7.993, 8.403, 1], ["empat", 8.403, 8.813, 1], ["Oktober,", 8.813, 9.498, 0]] },
      { text: "lalu bangun besok paginya langsung Jumat lima belas Oktober.", start: 9.488, end: 13.945,
        words: [["lalu", 9.538, 10.163, 0], ["bangun", 10.163, 10.413, 0], ["besok", 10.413, 10.803, 0], ["paginya", 10.803, 11.443, 0], ["langsung", 11.443, 12.003, 0], ["Jumat", 12.003, 12.403, 1], ["lima", 12.403, 12.723, 1], ["belas", 12.723, 13.103, 1], ["Oktober.", 13.103, 13.758, 0]] },
    ],
  },
  {
    index: 2, num: "02", slug: "julius-caesar", hud: "KALENDER JULIAN",
    eyebrow: "LEMBAR 02  \u00b7  ASAL MASALAH",
    headLines: [["Kesalahan kecil", "", ""], ["kalender ", "Julius Caesar", ""]],
    latin: "Calendarium Iulianum · Roma, 45 SM",
    start: 13.985, end: 27.815, voStart: 14.238, voEnd: 27.588,
    cards: [
      { text: "Penyebabnya kalender Julian buatan Julius Caesar,", start: 14.015, end: 18.053,
        words: [["Penyebabnya", 14.268, 15.318, 0], ["kalender", 15.318, 15.798, 0], ["Julian", 15.798, 16.278, 1], ["buatan", 16.278, 16.758, 0], ["Julius", 16.758, 17.238, 0], ["Caesar,", 17.238, 18.063, 1]] },
      { text: "yang dipakai lebih dari seribu enam ratus tahun.", start: 18.053, end: 21.253,
        words: [["yang", 18.103, 18.238, 0], ["dipakai", 18.238, 18.768, 0], ["lebih", 18.768, 19.158, 0], ["dari", 19.158, 19.478, 0], ["seribu", 19.478, 19.958, 1], ["enam", 19.958, 20.288, 1], ["ratus", 20.288, 20.698, 0], ["tahun.", 20.698, 21.263, 0]] },
      { text: "Kalender ini mematok satu tahun", start: 21.253, end: 23.958,
        words: [["Kalender", 21.303, 22.078, 0], ["ini", 22.078, 22.578, 0], ["mematok", 22.578, 22.968, 0], ["satu", 22.968, 23.328, 0], ["tahun", 23.328, 23.968, 0]] },
      { text: "tepat tiga ratus enam puluh lima koma dua lima hari.", start: 23.958, end: 27.775,
        words: [["tepat", 24.008, 24.208, 1], ["tiga", 24.208, 24.558, 0], ["ratus", 24.558, 24.998, 0], ["enam", 24.998, 25.498, 1], ["puluh", 25.498, 25.838, 0], ["lima", 25.838, 26.148, 1], ["koma", 26.148, 26.488, 1], ["dua", 26.488, 26.768, 1], ["lima", 26.768, 27.118, 1], ["hari.", 27.118, 27.588, 0]] },
    ],
  },
  {
    index: 3, num: "03", slug: "sebelas-menit", hud: "SELISIH 11 MENIT",
    eyebrow: "LEMBAR 03  \u00b7  FISIKA ORBIT",
    headLines: [["Bumi berputar", "", ""], ["", "sebelas menit", " lebih cepat"]],
    latin: "Annus Tropicus · Orbit Bumi Mengelilingi Matahari",
    start: 27.815, end: 38.425, voStart: 28.068, voEnd: 38.198,
    cards: [
      { text: "Padahal Bumi mengelilingi Matahari sedikit lebih cepat dari itu.", start: 27.845, end: 32.428,
        words: [["Padahal", 28.088, 28.478, 0], ["Bumi", 28.478, 28.778, 1], ["mengelilingi", 28.778, 29.728, 0], ["Matahari", 29.728, 30.298, 1], ["sedikit", 30.298, 30.848, 0], ["lebih", 30.848, 31.268, 0], ["cepat", 31.268, 31.618, 1], ["dari", 31.618, 31.918, 0], ["itu.", 31.918, 32.438, 0]] },
      { text: "Satu putaran penuh sebenarnya kurang", start: 32.428, end: 34.558,
        words: [["Satu", 32.478, 32.828, 0], ["putaran", 32.828, 33.318, 0], ["penuh", 33.318, 33.668, 0], ["sebenarnya", 33.668, 34.388, 0], ["kurang", 34.388, 34.568, 1]] },
      { text: "sebelas menit empat belas detik dari hitungan Caesar.", start: 34.558, end: 38.385,
        words: [["sebelas", 34.608, 35.308, 1], ["menit", 35.308, 35.658, 1], ["empat", 35.658, 36.018, 1], ["belas", 36.018, 36.358, 0], ["detik", 36.358, 36.708, 1], ["dari", 36.708, 36.998, 0], ["hitungan", 36.998, 37.558, 0], ["Caesar.", 37.558, 38.198, 0]] },
    ],
  },
  {
    index: 4, num: "04", slug: "meleset-sepuluh", hud: "MELESET 10 HARI",
    eyebrow: "LEMBAR 04  \u00b7  EFEK TUMPUKAN",
    headLines: [["Menumpuk jadi", "", ""], ["", "sepuluh hari", " penuh"]],
    latin: "Accumulatio Temporis · 325 M – 1582 M",
    start: 38.425, end: 53.855, voStart: 38.678, voEnd: 53.628,
    cards: [
      { text: "Selisih sebelas menit setahun terdengar sepele.", start: 38.455, end: 41.548,
        words: [["Selisih", 38.58, 38.88, 0], ["sebelas", 38.88, 39.34, 0], ["menit", 39.34, 39.68, 0], ["setahun", 39.68, 40.078, 0], ["terdengar", 40.078, 40.798, 0], ["sepele.", 40.798, 41.558, 1]] },
      { text: "Tapi setiap seratus dua puluh delapan tahun,", start: 41.548, end: 44.753,
        words: [["Tapi", 41.598, 41.773, 0], ["setiap", 41.773, 42.108, 0], ["seratus", 42.11, 42.78, 1], ["dua", 42.78, 43.05, 0], ["puluh", 43.05, 43.39, 0], ["delapan", 43.39, 43.85, 1], ["tahun,", 43.85, 44.76, 0]] },
      { text: "kalender meleset satu hari penuh.", start: 44.753, end: 47.578,
        words: [["kalender", 44.803, 45.438, 0], ["meleset", 45.438, 46.068, 1], ["satu", 46.068, 46.428, 1], ["hari", 46.428, 46.788, 1], ["penuh.", 46.788, 47.588, 0]] },
      { text: "Memasuki tahun seribu lima ratus delapan puluh dua,", start: 47.578, end: 50.373,
        words: [["Memasuki", 47.628, 48.048, 0], ["tahun", 48.048, 48.308, 0], ["seribu", 48.308, 48.648, 0], ["lima", 48.648, 48.878, 0], ["ratus", 48.878, 49.288, 0], ["delapan", 49.288, 49.578, 1], ["puluh", 49.578, 49.868, 0], ["dua,", 49.868, 50.383, 0]] },
      { text: "musim di Bumi sudah bergeser sepuluh hari dari tanggalnya.", start: 50.373, end: 53.815,
        words: [["musim", 50.423, 50.568, 0], ["di", 50.568, 50.688, 0], ["Bumi", 50.688, 50.928, 0], ["sudah", 50.928, 51.238, 0], ["bergeser", 51.238, 51.748, 1], ["sepuluh", 51.748, 52.158, 1], ["hari", 52.158, 52.408, 1], ["dari", 52.408, 52.658, 0], ["tanggalnya.", 52.658, 53.558, 0]] },
    ],
  },
  {
    index: 5, num: "05", slug: "paus-gregorius", hud: "POTONG 10 HARI",
    eyebrow: "LEMBAR 05  \u00b7  REFORMASI 1582",
    headLines: [["Keputusan nekat", "", ""], ["", "Paus Gregorius", ""]],
    latin: "Bulla Inter Gravissimas · 24 Februari 1582",
    start: 53.855, end: 68.335, voStart: 54.108, voEnd: 68.108,
    cards: [
      { text: "Untuk meluruskannya kembali,", start: 53.885, end: 56.203,
        words: [["Untuk", 54.138, 54.408, 0], ["meluruskannya", 54.408, 55.498, 0], ["kembali,", 55.498, 56.213, 0]] },
      { text: "Paus Gregorius ketiga belas dan astronom Aloysius Lilius merombak kalender.", start: 56.203, end: 62.293,
        words: [["Paus", 56.253, 56.598, 0], ["Gregorius", 56.598, 57.398, 1], ["ketiga", 57.398, 57.858, 0], ["belas", 57.858, 58.278, 0], ["dan", 58.278, 58.528, 0], ["astronom", 58.528, 59.238, 0], ["Aloysius", 59.238, 59.888, 0], ["Lilius", 59.888, 60.368, 1], ["merombak", 60.368, 61.058, 1], ["kalender.", 61.058, 62.303, 0]] },
      { text: "Sepuluh tanggal di bulan Oktober langsung dipotong,", start: 62.293, end: 65.458,
        words: [["Sepuluh", 62.343, 62.628, 1], ["tanggal", 62.628, 63.158, 0], ["di", 63.158, 63.278, 0], ["bulan", 63.278, 63.638, 0], ["Oktober", 63.638, 64.438, 0], ["langsung", 64.438, 64.728, 0], ["dipotong,", 64.728, 65.468, 1]] },
      { text: "tanpa mengubah urutan hari Kamis ke Jumat.", start: 65.458, end: 68.295,
        words: [["tanpa", 65.508, 65.808, 1], ["mengubah", 65.808, 66.418, 0], ["urutan", 66.418, 66.818, 0], ["hari", 66.818, 67.108, 0], ["Kamis", 67.108, 67.468, 1], ["ke", 67.468, 67.608, 0], ["Jumat.", 67.608, 68.108, 1]] },
    ],
  },
  {
    index: 6, num: "06", slug: "aturan-kabisat", hud: "ATURAN ABAD",
    eyebrow: "LEMBAR 06  \u00b7  RUMUS KABISAT",
    headLines: [["Rahasia tahun", "", ""], ["", "seribu sembilan ratus", ""]],
    latin: "Regula Bissextilis · 97 Kabisat per 400 Tahun",
    start: 68.335, end: 85.36, voStart: 68.588, voEnd: 85.133,
    cards: [
      { text: "Supaya tidak meleset lagi, aturan tahun kabisat ikut diubah.", start: 68.365, end: 72.868,
        words: [["Supaya", 68.618, 68.948, 0], ["tidak", 68.948, 69.348, 0], ["meleset", 69.348, 69.908, 0], ["lagi,", 69.908, 70.508, 0], ["aturan", 70.508, 70.868, 0], ["tahun", 70.868, 71.268, 0], ["kabisat", 71.268, 71.878, 1], ["ikut", 71.878, 72.308, 0], ["diubah.", 72.308, 72.878, 1]] },
      { text: "Tahun abad bulat seperti seribu tujuh ratus,", start: 72.868, end: 76.488,
        words: [["Tahun", 72.918, 73.328, 0], ["abad", 73.328, 73.678, 0], ["bulat", 73.678, 74.128, 0], ["seperti", 74.128, 74.768, 0], ["seribu", 74.768, 75.308, 0], ["tujuh", 75.308, 75.758, 0], ["ratus,", 75.758, 76.498, 0]] },
      { text: "seribu delapan ratus, dan seribu sembilan ratus bukan kabisat,", start: 76.488, end: 80.753,
        words: [["seribu", 76.538, 76.978, 0], ["delapan", 76.978, 77.578, 0], ["ratus,", 77.578, 78.208, 0], ["dan", 78.208, 78.418, 0], ["seribu", 78.418, 78.838, 0], ["sembilan", 78.838, 79.398, 0], ["ratus", 79.398, 79.888, 0], ["bukan", 79.888, 80.238, 1], ["kabisat,", 80.238, 80.763, 1]] },
      { text: "kecuali yang habis dibagi empat ratus seperti tahun dua ribu.", start: 80.753, end: 85.32,
        words: [["kecuali", 80.803, 81.518, 1], ["yang", 81.518, 81.828, 0], ["habis", 81.828, 82.228, 0], ["dibagi", 82.228, 82.668, 0], ["empat", 82.668, 83.048, 1], ["ratus", 83.048, 83.428, 0], ["seperti", 83.428, 83.978, 0], ["tahun", 83.978, 84.398, 0], ["dua", 84.398, 84.598, 1], ["ribu.", 84.598, 85.133, 1]] },
    ],
  },
  {
    index: 7, num: "07", slug: "efek-domino", hud: "MAKIN TELAT",
    eyebrow: "LEMBAR 07  \u00b7  ADOPSI DUNIA",
    headLines: [["Makin telat pindah,", "", ""], ["", "makin banyak", " hilang"]],
    latin: "Adoptio Mundi · Inggris 1752 & Rusia 1918",
    start: 85.36, end: 103.9, voStart: 85.613, voEnd: 103.673,
    cards: [
      { text: "Uniknya, tidak semua negara langsung mau ikut.", start: 85.39, end: 88.898,
        words: [["Uniknya,", 85.633, 86.213, 0], ["tidak", 86.213, 86.613, 0], ["semua", 86.613, 87.013, 0], ["negara", 87.013, 87.503, 0], ["langsung", 87.503, 88.133, 0], ["mau", 88.133, 88.373, 0], ["ikut.", 88.373, 88.908, 0]] },
      { text: "Inggris baru pindah tahun seribu tujuh ratus lima puluh dua", start: 88.898, end: 92.643,
        words: [["Inggris", 88.948, 89.463, 1], ["baru", 89.463, 89.743, 0], ["pindah", 89.743, 90.243, 0], ["tahun", 90.243, 90.513, 0], ["seribu", 90.513, 90.933, 0], ["tujuh", 90.933, 91.283, 0], ["ratus", 91.283, 91.633, 0], ["lima", 91.633, 91.913, 0], ["puluh", 91.913, 92.263, 0], ["dua", 92.263, 92.653, 0]] },
      { text: "dan harus memotong sebelas hari.", start: 92.643, end: 95.288,
        words: [["dan", 92.693, 93.073, 0], ["harus", 93.073, 93.253, 0], ["memotong", 93.253, 94.033, 0], ["sebelas", 94.033, 94.673, 1], ["hari.", 94.673, 95.298, 0]] },
      { text: "Rusia bahkan baru pindah tahun seribu sembilan ratus delapan belas,", start: 95.288, end: 99.838,
        words: [["Rusia", 95.338, 95.893, 1], ["bahkan", 95.893, 96.398, 0], ["baru", 96.398, 96.573, 0], ["pindah", 96.573, 97.053, 0], ["tahun", 97.053, 97.453, 0], ["seribu", 97.453, 97.933, 0], ["sembilan", 97.933, 98.563, 0], ["ratus", 98.563, 99.083, 0], ["delapan", 99.083, 99.313, 0], ["belas,", 99.313, 99.848, 0]] },
      { text: "sehingga terpaksa melompati tiga belas hari sekaligus.", start: 99.838, end: 103.86,
        words: [["sehingga", 99.888, 100.413, 0], ["terpaksa", 100.413, 101.053, 0], ["melompati", 101.053, 101.773, 0], ["tiga", 101.773, 102.123, 1], ["belas", 102.123, 102.493, 1], ["hari", 102.493, 102.953, 0], ["sekaligus.", 102.953, 103.673, 1]] },
    ],
  },
  {
    index: 8, num: "08", slug: "cek-ponselmu", hud: "CEK PONSELMU",
    eyebrow: "LEMBAR 08  \u00b7  BUKTI HARI INI",
    headLines: [["Masih hilang", "", ""], ["di ", "kalender ponselmu", ""]],
    latin: "Probatio Hodierna · Oktober 1582",
    start: 103.9, end: 117.989, voStart: 104.153, voEnd: 116.703,
    cards: [
      { text: "Sampai hari ini, jejaknya masih tersimpan di banyak kalender digital.", start: 103.93, end: 108.938,
        words: [["Sampai", 104.183, 104.513, 0], ["hari", 104.513, 104.833, 0], ["ini,", 104.833, 105.233, 0], ["jejaknya", 105.233, 105.873, 1], ["masih", 105.873, 106.273, 0], ["tersimpan", 106.273, 106.993, 0], ["di", 106.993, 107.153, 0], ["banyak", 107.153, 107.643, 0], ["kalender", 107.643, 108.133, 0], ["digital.", 108.133, 108.948, 1]] },
      { text: "Coba cek Oktober seribu lima ratus delapan puluh dua di ponselmu,", start: 108.938, end: 113.043,
        words: [["Coba", 108.988, 109.323, 0], ["cek", 109.323, 109.563, 0], ["Oktober", 109.563, 110.063, 0], ["seribu", 110.063, 110.543, 0], ["lima", 110.543, 110.773, 0], ["ratus", 110.773, 111.143, 0], ["delapan", 111.143, 111.683, 0], ["puluh", 111.683, 112.003, 0], ["dua", 112.003, 112.223, 0], ["di", 112.223, 112.373, 0], ["ponselmu,", 112.373, 113.053, 1]] },
      { text: "apakah sepuluh tanggal itu ikut hilang? Tulis di komentar.", start: 113.043, end: 117.153,
        words: [["apakah", 113.093, 113.613, 0], ["sepuluh", 113.613, 114.063, 1], ["tanggal", 114.063, 114.528, 0], ["itu", 114.528, 114.703, 0], ["ikut", 114.703, 114.963, 0], ["hilang?", 114.963, 115.593, 1], ["Tulis", 115.593, 115.953, 1], ["di", 115.953, 116.093, 0], ["komentar.", 116.093, 116.703, 1]] },
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
