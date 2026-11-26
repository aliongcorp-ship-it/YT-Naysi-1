export type WordCue = readonly [word: string, start: number, end: number, emph: 0 | 1];

export interface SentenceCue {
  readonly text: string;
  readonly start: number;
  readonly end: number;
  readonly words: readonly WordCue[];
}

export interface ChapterDef {
  readonly index: number;
  readonly num: string;
  readonly slug: string;
  readonly title: string;
  readonly start: number;
  readonly end: number;
  readonly voStart: number;
  readonly voEnd: number;
  readonly surface: 'asphalt' | 'drafting';
  readonly sentences: readonly SentenceCue[];
}

export const VIDEO_SPEC = {
  id: 'Naysi',
  width: 1440,
  height: 2560,
  fps: 90,
  durationInFrames: 7720,
  durationSec: 85.7778,
  brand: 'NAYSI',
  nicheTag: 'NAYSI · EKONOMI',
  episodeTitle: 'Menambah Jalan Baru Justru Bikin Macet Makin Parah',
} as const;

export const IDENTITY = {
  bgObsidian: '#0A0E0D',
  bgAsphalt: '#101715',
  bgElevated: '#16201D',
  cardFill: 'rgba(20, 29, 26, 0.94)',
  cardFillDeep: 'rgba(13, 19, 17, 0.96)',
  cardBorder: 'rgba(244, 239, 230, 0.13)',
  cardHighlight: 'rgba(255, 255, 255, 0.07)',
  gridLine: 'rgba(168, 196, 184, 0.055)',
  contourLine: 'rgba(130, 175, 158, 0.075)',
  ivory: '#F4EFE6',
  ivorySoft: '#D5CFC3',
  slateMuted: '#7E8E88',
  vermilion: '#FF5634',
  vermilionSoft: 'rgba(255, 86, 52, 0.18)',
  emerald: '#2CE59B',
  emeraldSoft: 'rgba(44, 229, 155, 0.16)',
  citrine: '#F6C844',
  citrineSoft: 'rgba(246, 200, 68, 0.18)',
  cobalt: '#5BB0FF',
  deskWoodDark: '#1C140E',
  deskWoodWarm: '#2E2016',
  vellumPaper: '#EFE7D6',
  vellumShadow: '#DED3BC',
  vellumInk: '#1D211F',
  vellumRuleRed: 'rgba(196, 62, 47, 0.48)',
  vellumRuleBlue: 'rgba(72, 114, 154, 0.22)',
  fontDisplay: "'Space Grotesk', sans-serif",
  fontBody: "'Plus Jakarta Sans', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  fontSerif: "'Instrument Serif', serif",
} as const;

export const CHAPTERS: readonly ChapterDef[] = [
  { index: 1, num: '01', slug: 'jalan-baru', title: 'JALAN BARU', start: 0.0, end: 10.614, voStart: 0.3, voEnd: 10.394, surface: 'asphalt', sentences: [
    { text: 'Menambah jalan baru harusnya mengurai macet, tapi justru bisa membuat semua orang pulang lebih lambat.', start: 0.04, end: 6.462, words: [
      ['Menambah', 0.3, 0.798, 0], ['jalan', 0.798, 1.135, 0], ['baru', 1.135, 1.466, 0],
      ['harusnya', 1.466, 2.01, 0], ['mengurai', 2.01, 2.517, 0], ['macet,', 2.517, 2.926, 1],
      ['tapi', 3.126, 3.457, 0], ['justru', 3.457, 3.805, 0], ['bisa', 3.805, 4.101, 0],
      ['membuat', 4.101, 4.473, 0], ['semua', 4.473, 4.789, 0], ['orang', 4.789, 5.134, 0],
      ['pulang', 5.134, 5.512, 0], ['lebih', 5.512, 5.835, 0], ['lambat.', 5.835, 6.202, 1],
    ] },
    { text: 'Masalahnya bukan kurang aspal, tapi pilihan kita sendiri.', start: 6.462, end: 10.574, words: [
      ['Masalahnya', 6.562, 7.3, 0], ['bukan', 7.3, 7.717, 0], ['kurang', 7.717, 8.163, 0],
      ['aspal,', 8.163, 8.648, 1], ['tapi', 8.848, 9.17, 0], ['pilihan', 9.17, 9.575, 1],
      ['kita', 9.575, 9.921, 0], ['sendiri.', 9.921, 10.394, 1],
    ] },
  ] },
  { index: 2, num: '02', slug: 'dua-jalur', title: 'DUA JALUR', start: 10.614, end: 20.048, voStart: 10.794, voEnd: 19.828, surface: 'asphalt', sentences: [
    { text: 'Bayangkan empat ribu mobil berangkat dari titik A ke titik B lewat dua jalur kembar.', start: 10.654, end: 16.686, words: [
      ['Bayangkan', 10.794, 11.34, 0], ['empat', 11.34, 11.76, 1], ['ribu', 11.76, 12.156, 1],
      ['mobil', 12.156, 12.511, 0], ['berangkat', 12.511, 13.128, 0], ['dari', 13.128, 13.468, 0],
      ['titik', 13.468, 13.891, 0], ['A', 13.891, 14.099, 0], ['ke', 14.099, 14.37, 0],
      ['titik', 14.37, 14.828, 0], ['B', 14.828, 15.05, 0], ['lewat', 15.13, 15.48, 0],
      ['dua', 15.48, 15.687, 1], ['jalur', 15.687, 16.013, 0], ['kembar.', 16.013, 16.426, 1],
    ] },
    { text: 'Separuh lewat utara, separuh lagi lewat selatan.', start: 16.686, end: 20.008, words: [
      ['Separuh', 16.786, 17.279, 0], ['lewat', 17.279, 17.63, 0], ['utara,', 17.63, 18.092, 1],
      ['separuh', 18.292, 18.799, 0], ['lagi', 18.799, 19.058, 0], ['lewat', 19.058, 19.334, 0],
      ['selatan.', 19.334, 19.828, 1],
    ] },
  ] },
  { index: 3, num: '03', slug: 'enam-puluh-lima', title: '65 MENIT', start: 20.048, end: 31.361, voStart: 20.228, voEnd: 31.141, surface: 'asphalt', sentences: [
    { text: 'Tiap jalur punya satu jalan lebar empat puluh lima menit, dan satu jembatan sempit yang melambat saat padat.', start: 20.088, end: 26.93, words: [
      ['Tiap', 20.228, 20.43, 0], ['jalur', 20.43, 20.781, 0], ['punya', 20.781, 21.128, 0],
      ['satu', 21.128, 21.444, 0], ['jalan', 21.444, 21.81, 0], ['lebar', 21.81, 22.137, 0],
      ['empat', 22.137, 22.474, 1], ['puluh', 22.474, 22.833, 0], ['lima', 22.833, 23.202, 1],
      ['menit,', 23.202, 23.584, 0], ['dan', 23.784, 23.985, 0], ['satu', 23.985, 24.297, 0],
      ['jembatan', 24.297, 24.833, 1], ['sempit', 24.833, 25.236, 1], ['yang', 25.236, 25.482, 0],
      ['melambat', 25.482, 25.985, 0], ['saat', 25.985, 26.21, 0], ['padat.', 26.21, 26.67, 0],
    ] },
    { text: 'Karena terbagi rata, semua mobil tiba dalam enam puluh lima menit.', start: 26.93, end: 31.321, words: [
      ['Karena', 27.03, 27.457, 0], ['terbagi', 27.457, 27.887, 0], ['rata,', 27.887, 28.266, 0],
      ['semua', 28.466, 28.793, 0], ['mobil', 28.793, 29.095, 0], ['tiba', 29.095, 29.393, 0],
      ['dalam', 29.393, 29.764, 0], ['enam', 29.764, 30.06, 1], ['puluh', 30.06, 30.394, 0],
      ['lima', 30.394, 30.728, 1], ['menit.', 30.728, 31.141, 1],
    ] },
  ] },
  { index: 4, num: '04', slug: 'jalan-pintas', title: 'JALAN PINTAS', start: 31.361, end: 40.115, voStart: 31.541, voEnd: 39.895, surface: 'asphalt', sentences: [
    { text: 'Lalu dibuka jalan pintas supercepat di tengah yang cuma butuh nol menit.', start: 31.401, end: 36.253, words: [
      ['Lalu', 31.541, 31.87, 0], ['dibuka', 31.87, 32.251, 0], ['jalan', 32.251, 32.577, 0],
      ['pintas', 32.577, 32.896, 1], ['supercepat', 32.896, 33.512, 1], ['di', 33.512, 33.743, 0],
      ['tengah', 33.743, 34.137, 0], ['yang', 34.217, 34.491, 0], ['cuma', 34.491, 34.923, 0],
      ['butuh', 34.923, 35.347, 0], ['nol', 35.347, 35.577, 1], ['menit.', 35.577, 35.993, 0],
    ] },
    { text: 'Pengemudi pertama yang pindah langsung hemat dua puluh lima menit.', start: 36.253, end: 40.075, words: [
      ['Pengemudi', 36.353, 36.887, 0], ['pertama', 36.887, 37.299, 0], ['yang', 37.299, 37.47, 0],
      ['pindah', 37.47, 37.849, 0], ['langsung', 37.929, 38.323, 0], ['hemat', 38.323, 38.662, 1],
      ['dua', 38.662, 38.88, 1], ['puluh', 38.88, 39.219, 0], ['lima', 39.219, 39.528, 1],
      ['menit.', 39.528, 39.895, 0],
    ] },
  ] },
  { index: 5, num: '05', slug: 'jebakan-nash', title: 'JEBAKAN NASH', start: 40.115, end: 52.089, voStart: 40.295, voEnd: 51.869, surface: 'asphalt', sentences: [
    { text: 'Melihat itu, semua pengemudi ikut pindah demi mengejar rute tercepat bagi dirinya sendiri.', start: 40.155, end: 46.437, words: [
      ['Melihat', 40.295, 40.807, 0], ['itu,', 40.807, 41.191, 0], ['semua', 41.391, 41.703, 1],
      ['pengemudi', 41.703, 42.281, 0], ['ikut', 42.281, 42.569, 0], ['pindah', 42.569, 42.975, 1],
      ['demi', 42.975, 43.281, 0], ['mengejar', 43.281, 43.886, 0], ['rute', 43.886, 44.175, 0],
      ['tercepat', 44.175, 44.7, 1], ['bagi', 44.7, 45.093, 0], ['dirinya', 45.093, 45.641, 0],
      ['sendiri.', 45.641, 46.177, 0],
    ] },
    { text: 'Akibatnya, kedua jembatan sempit langsung diserbu empat ribu mobil sekaligus.', start: 46.437, end: 52.049, words: [
      ['Akibatnya,', 46.537, 47.273, 0], ['kedua', 47.473, 47.849, 0], ['jembatan', 47.849, 48.409, 0],
      ['sempit', 48.409, 48.932, 0], ['langsung', 48.932, 49.345, 0], ['diserbu', 49.345, 49.874, 1],
      ['empat', 49.874, 50.343, 1], ['ribu', 50.343, 50.704, 1], ['mobil', 50.704, 51.074, 0],
      ['sekaligus.', 51.074, 51.869, 1],
    ] },
  ] },
  { index: 6, num: '06', slug: 'delapan-puluh', title: '80 MENIT', start: 52.089, end: 61.067, voStart: 52.269, voEnd: 60.847, surface: 'asphalt', sentences: [
    { text: 'Waktu di tiap jembatan bengkak dua kali lipat menjadi empat puluh menit.', start: 52.129, end: 56.545, words: [
      ['Waktu', 52.269, 52.622, 0], ['di', 52.622, 52.775, 0], ['tiap', 52.775, 52.982, 0],
      ['jembatan', 52.982, 53.482, 0], ['bengkak', 53.482, 53.887, 1], ['dua', 53.887, 54.051, 0],
      ['kali', 54.051, 54.402, 0], ['lipat', 54.402, 54.723, 0], ['menjadi', 54.723, 55.207, 0],
      ['empat', 55.207, 55.517, 1], ['puluh', 55.517, 55.919, 1], ['menit.', 55.919, 56.285, 1],
    ] },
    { text: 'Hasilnya, perjalanan semua orang justru molor menjadi delapan puluh menit.', start: 56.545, end: 61.027, words: [
      ['Hasilnya,', 56.645, 57.351, 0], ['perjalanan', 57.551, 58.11, 0], ['semua', 58.11, 58.4, 0],
      ['orang', 58.4, 58.691, 0], ['justru', 58.691, 59.016, 0], ['molor', 59.016, 59.287, 1],
      ['menjadi', 59.287, 59.675, 0], ['delapan', 59.675, 60.096, 1], ['puluh', 60.096, 60.413, 1],
      ['menit.', 60.413, 60.847, 1],
    ] },
  ] },
  { index: 7, num: '07', slug: 'seoul-2003', title: 'SEOUL 2003', start: 61.067, end: 74.651, voStart: 61.247, voEnd: 74.431, surface: 'drafting', sentences: [
    { text: 'Tahun dua ribu tiga, kota Seoul nekat membongkar jalan layang enam lajur berisi seratus enam puluh delapan ribu mobil sehari.', start: 61.107, end: 69.619, words: [
      ['Tahun', 61.247, 61.594, 0], ['dua', 61.594, 61.789, 0], ['ribu', 61.789, 62.145, 0],
      ['tiga,', 62.145, 62.543, 0], ['kota', 62.743, 63.102, 0], ['Seoul', 63.102, 63.338, 1],
      ['nekat', 63.338, 63.681, 0], ['membongkar', 63.681, 64.299, 1], ['jalan', 64.299, 64.672, 0],
      ['layang', 64.672, 65.04, 0], ['enam', 65.04, 65.388, 1], ['lajur', 65.388, 65.745, 0],
      ['berisi', 65.745, 66.331, 0], ['seratus', 66.331, 66.845, 1], ['enam', 66.845, 67.218, 1],
      ['puluh', 67.218, 67.593, 0], ['delapan', 67.593, 68.121, 1], ['ribu', 68.121, 68.463, 0],
      ['mobil', 68.463, 68.808, 0], ['sehari.', 68.808, 69.359, 0],
    ] },
    { text: 'Bukannya lumpuh total, arus lalu lintas kota justru mengalir lebih lancar.', start: 69.619, end: 74.611, words: [
      ['Bukannya', 69.719, 70.248, 0], ['lumpuh', 70.248, 70.641, 1], ['total,', 70.641, 71.025, 0],
      ['arus', 71.225, 71.569, 0], ['lalu', 71.569, 71.91, 0], ['lintas', 71.91, 72.37, 0],
      ['kota', 72.37, 72.757, 0], ['justru', 72.757, 73.131, 0], ['mengalir', 73.131, 73.643, 0],
      ['lebih', 73.643, 73.991, 0], ['lancar.', 73.991, 74.431, 1],
    ] },
  ] },
  { index: 8, num: '08', slug: 'ditutup-lancar', title: 'DITUTUP LANCAR', start: 74.651, end: 85.7778, voStart: 74.831, voEnd: 84.525, surface: 'asphalt', sentences: [
    { text: 'Kadang obat macet bukan menambah jalan, melainkan menutup jalan pintas yang salah.', start: 74.691, end: 80.573, words: [
      ['Kadang', 74.831, 75.22, 0], ['obat', 75.22, 75.585, 0], ['macet', 75.585, 76.016, 0],
      ['bukan', 76.016, 76.488, 1], ['menambah', 76.488, 77.042, 0], ['jalan,', 77.042, 77.477, 0],
      ['melainkan', 77.677, 78.284, 0], ['menutup', 78.284, 78.837, 1], ['jalan', 78.837, 79.231, 0],
      ['pintas', 79.231, 79.666, 0], ['yang', 79.666, 79.9, 0], ['salah.', 79.9, 80.313, 1],
    ] },
    { text: 'Jalan mana di kotamu yang sudah dilebarkan tapi tetap macet? Tulis di komentar.', start: 80.573, end: 85.735, words: [
      ['Jalan', 80.673, 80.937, 0], ['mana', 80.937, 81.18, 0], ['di', 81.18, 81.315, 0],
      ['kotamu', 81.315, 81.713, 0], ['yang', 81.713, 81.885, 0], ['sudah', 81.885, 82.168, 0],
      ['dilebarkan', 82.168, 82.691, 0], ['tapi', 82.691, 82.978, 0], ['tetap', 82.978, 83.313, 0],
      ['macet?', 83.313, 83.669, 1], ['Tulis', 83.749, 83.97, 1], ['di', 83.97, 84.104, 0],
      ['komentar.', 84.104, 84.525, 1],
    ] },
  ] },
];

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

export const rangeProgress = (t: number, start: number, end: number): number =>
  end <= start ? 1 : clamp01((t - start) / (end - start));

export const easeOutCubic = (x: number): number => 1 - Math.pow(1 - clamp01(x), 3);

export const easeOutQuart = (x: number): number => 1 - Math.pow(1 - clamp01(x), 4);

export const easeInOutCubic = (x: number): number => {
  const p = clamp01(x);
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
};

export const easeOutBack = (x: number, overshoot = 1.45): number => {
  const p = clamp01(x) - 1;
  return 1 + (overshoot + 1) * p * p * p + overshoot * p * p;
};

export const formatIntID = (n: number): string =>
  Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const getChapterAt = (sec: number): ChapterDef => {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) {
    if (sec >= CHAPTERS[i].start) return CHAPTERS[i];
  }
  return CHAPTERS[0];
};

export const getSentenceAt = (sec: number): { chapter: ChapterDef; sentence: SentenceCue | null } => {
  const chapter = getChapterAt(sec);
  for (const s of chapter.sentences) {
    if (sec >= s.start - 0.06 && sec <= s.end + 0.14) {
      return { chapter, sentence: s };
    }
  }
  return { chapter, sentence: null };
};
