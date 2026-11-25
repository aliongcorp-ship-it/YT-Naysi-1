/* =============================================================================
   scenes/script.tsx — the episode's script and edit decision list.

   This is the only source of truth for *what is said* and *where it cuts*. It
   is data, but typed: a typo in a shot name or a stray `to` is a compile error
   instead of a missing picture at render time.

     scenes/script.tsx         narration, emphasis, shot list      <- you are here
     scenes/bulan.tsx          topic file: identity + visual library
     scenes/y1.tsx … yN.tsx    one composition per shot, in order
     scenes/types.ts           the props every shot receives

   `text` feeds the voice takes in src/vo/sN.mp3 one-for-one, in array order.
   Never re-order or edit a line without re-recording, because caption timings
   are measured from that take.
   ========================================================================== */

export type ShotSpec = {
  /** file name under scenes/, without extension */
  file: string;
  /** shown in the build log and on the shot list */
  label: string;
  /** fraction of the act's measured span, 0..1 */
  from: number;
  /** fraction of the act's measured span, or 'end' */
  to: number | 'end';
};

export type ActSpec = {
  id: string;
  /** words the caption may colour — one beat each, in spoken order */
  em: string[];
  /** the narration, exactly as it should be spoken */
  text: string;
  shots: ShotSpec[];
};

// The watermark is the channel name and nothing else. No slate, no chapter
// number, no series tag: the picture has to carry itself.
export const CHANNEL = {name: 'NAYSI'};

export const EPISODE = {
  slug: 'bulan',
  identity: 'regolith',
  topic: 'Bulan menjauh 3,8 cm tiap tahun',
  /** the topic file that owns this episode's look */
  file: 'scenes/bulan.tsx',
};

/* A shot is one continuous piece of picture. `from`/`to` are fractions of the
   act's measured span, so a re-take only moves the cut, never breaks it. Two
   shots may share an act — that is how the opening gets its establishing frame
   and its number without the narration pausing. */
export const acts: ActSpec[] = [
  {
    id: 'hook',
    em: ['Bulan', 'menjauh', '3,8', 'kuku'],
    text:
      'Bulan sedang menjauh dari kita, tiga koma delapan sentimeter tiap tahun, secepat kuku Anda tumbuh.',
    shots: [
      {file: 'y1', label: 'cakrawala & bulan', from: 0.0, to: 0.54},
      {file: 'y2', label: '3,8 cm / tahun', from: 0.54, to: 'end'},
    ],
  },
  {
    id: 'mirror',
    em: ['cermin', 'seratus', 'koper', 'bekerja'],
    text:
      'Tahun enam puluh sembilan astronot menaruh cermin di Bulan, seratus prisma seukuran koper, tanpa baterai, dan masih bekerja sampai sekarang.',
    shots: [{file: 'y3', label: 'seratus prisma', from: 0.0, to: 'end'}],
  },
  {
    id: 'photon',
    em: ['laser', '384', 'triliunan', 'satu'],
    text:
      'Laser ditembakkan ke cermin itu, tiga ratus delapan puluh empat ribu kilometer jauhnya. Dari triliunan foton, mungkin satu yang pulang.',
    shots: [{file: 'y4', label: 'laser & satu foton', from: 0.0, to: 'end'}],
  },
  {
    id: 'millimetre',
    em: ['satu', 'pikodetik', 'milimeter', 'dekade'],
    text:
      'Satu foton cukup. Waktu tempuhnya diukur sampai pikodetik, jaraknya terbaca sampai milimeter. Setiap malam, selama lima dekade.',
    shots: [{file: 'y5', label: 'pikodetik', from: 0.0, to: 'end'}],
  },
  {
    id: 'tide',
    em: ['gravitasi', 'pasang', 'mendahului', 'pergi'],
    text:
      'Gravitasi Bulan menarik laut jadi pasang. Bumi berputar lebih cepat, jadi pasang selalu mendahului. Dorongan itu yang mendorong Bulan pergi.',
    shots: [{file: 'y6', label: 'pasang mendahului', from: 0.0, to: 'end'}],
  },
  {
    id: 'day',
    em: ['melambat', '1,8', '22', 'jam'],
    text:
      'Putaran Bumi melambat karenanya. Satu koma delapan milidetik per abad. Empat ratus juta tahun lalu, sehari cuma dua puluh dua jam.',
    shots: [{file: 'y7', label: '22 vs 24 jam', from: 0.0, to: 'end'}],
  },
  {
    id: 'past',
    em: ['dekat', 'ganas', 'karang', 'arsip'],
    text:
      'Dulu Bulan jauh lebih dekat, pasangnya jauh lebih ganas. Karang purba menyimpan hitungan harinya, seperti arsip yang ikut menua.',
    shots: [{file: 'y8', label: 'karang purba', from: 0.0, to: 'end'}],
  },
  {
    id: 'end',
    em: ['pergi', 'miliaran', 'lebih jauh', 'kemarin'],
    text:
      'Bulan akan terus pergi, miliaran tahun lamanya. Malam ini, saat Anda menengadah, ia sudah lebih jauh daripada kemarin.',
    shots: [
      {file: 'y9', label: '384.400 km', from: 0.0, to: 0.46},
      {file: 'y10', label: 'malam ini', from: 0.46, to: 'end'},
    ],
  },
];

export default acts;
