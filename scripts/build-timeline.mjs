// Single source of truth: the seven narration takes define scene timing and captions.
import fs from 'node:fs';

const FPS = 90;
const WIDTH = 1440;
const HEIGHT = 2560;
const LEAD = 0.38;
const GAPS = [0.32, 0.34, 0.34, 0.34, 0.34, 0.38, 0];
const TAIL = 1.2;
const SEGMENTS = [
  {id: 'hook', label: 'KOK BISA LUPA?', text: 'Kamu masuk ke kamar buat ambil sesuatu. Begitu sampai, kamu lupa. Tapi waktu balik ke ruangan semula, tiba-tiba ingat lagi. Kenapa pintu bisa bikin pikiranmu seperti ter-reset?'},
  {id: 'phenomenon', label: 'EFEK AMBANG PINTU', text: 'Psikolog menyebutnya efek ambang pintu. Bukan pintunya menghapus memori, tetapi perpindahan tempat bisa mengubah informasi mana yang mudah diakses. Otak memecah pengalaman menjadi beberapa peristiwa.'},
  {id: 'experiment', label: 'INGATAN DIUJI', text: 'Dalam eksperimen, peserta mengingat benda sambil berjalan melewati beberapa ruangan virtual. Setelah melewati ambang pintu, ingatan terhadap sebagian benda melemah, meski mereka berusaha mengingatnya.'},
  {id: 'evidence', label: 'BUKAN TOMBOL HAPUS', text: 'Studi tahun dua ribu dua puluh empat oleh Ongchoco dan Xu di Journal of Vision menemukan efek paling kuat pada benda pertama yang dilihat sebelum melewati pintu. Jadi ini bukan tombol hapus universal.'},
  {id: 'mechanism', label: 'BAB BARU, KONTEKS BARU', text: 'Otak terus memperbarui gambaran tentang apa yang sedang terjadi. Pintu bisa menjadi batas peristiwa: bab lama ditutup, bab baru dibuka. Informasi lama tidak hilang, tetapi bisa lebih sulit dipanggil saat konteks berubah.'},
  {id: 'practice', label: 'COBA INI', text: 'Tapi efek ini tidak selalu muncul. Perubahan konteks, beban ingatan, dan gangguan perhatian ikut berperan. Kalau lupa, coba kembali ke tempat semula atau ucapkan tujuanmu sebelum berpindah.'},
  {id: 'close', label: 'OTAKMU BUKAN RUSAK', text: 'Jadi, bukan berarti kamu pelupa. Otakmu sedang mengatur ulang adegan. Ingat: pintu bukan penghapus ingatan—hanya penanda bahwa konteks sudah berubah.'},
];

const wordList = (text) => text.split(/\s+/).filter(Boolean);
const acts = [];
let cursor = LEAD;
for (let i = 0; i < SEGMENTS.length; i++) {
  const segment = SEGMENTS[i];
  const file = `audio/vo_fx/s${i + 1}.wav`;
  if (!fs.existsSync(file)) throw new Error(`Missing generated narration: ${file}`);
  const duration = (fs.statSync(file).size - 44) / 96000;
  const words = wordList(segment.text);
  const weights = words.map((word) => {
    let weight = word.replace(/[^\p{L}\p{N}]/gu, '').length + 2.5;
    if (/[,;:]$/.test(word)) weight += 5.5;
    if (/[.!?]$/.test(word)) weight += 9;
    return weight;
  });
  const total = weights.reduce((sum, n) => sum + n, 0);
  let offset = 0;
  const timedWords = words.map((word, j) => {
    const d = weights[j] / total * Math.max(0.1, duration - 0.06);
    const item = {w: word, t: +(cursor + offset).toFixed(4), d: +d.toFixed(4)};
    offset += d;
    return item;
  });
  const phraseGroups = [];
  let group = [];
  for (const word of timedWords) {
    group.push(word);
    if (/[,;:.!?]$/.test(word.w) || group.length >= 4) {
      phraseGroups.push(group);
      group = [];
    }
  }
  if (group.length) phraseGroups.push(group);
  const phrases = phraseGroups.map((words, index) => ({
    words: words.map(({w, t, d}) => ({w, t, d})),
    start: words[0].t,
    end: +(words.at(-1).t + words.at(-1).d).toFixed(3),
    index,
  }));
  const start = i === 0 ? 0 : acts[i - 1].end;
  acts.push({
    index: i + 1, id: segment.id, label: segment.label, vo: file,
    voStart: +cursor.toFixed(4), voEnd: +(cursor + duration).toFixed(4), start: +start.toFixed(4),
    end: +(cursor + duration + GAPS[i]).toFixed(4), words: timedWords, phrases,
  });
  cursor += duration + GAPS[i];
}
const durationSec = +(cursor + TAIL).toFixed(3);
const durationInFrames = Math.ceil(durationSec * FPS);
fs.mkdirSync('src/data', {recursive: true});
fs.writeFileSync('src/data/timeline.json', JSON.stringify({fps: FPS, width: WIDTH, height: HEIGHT, durationInFrames, durationSec, acts}, null, 1));
fs.writeFileSync('src/data/cues.json', JSON.stringify({durationSec, acts: acts.map(({index, id, label, start, end, voStart, voEnd, phrases}) => ({index, id, label, start, end, voStart, voEnd, phrases: phrases.map((p) => p.start)}))}, null, 1));
console.log(`Timeline: ${durationSec.toFixed(2)}s · ${durationInFrames} frames @ ${FPS}fps · ${acts.length} scenes`);
acts.forEach((act) => console.log(`${act.index}. ${act.label.padEnd(22)} ${act.start.toFixed(2)}–${act.end.toFixed(2)}s`));
