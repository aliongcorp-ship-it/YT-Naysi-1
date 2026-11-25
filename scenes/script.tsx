/* =============================================================================
   scenes/script.tsx — the episode: what is said, in what order, and where it cuts.

   This is a science-explainer, so the script is built as numbered findings, not
   as a mood piece. Every act makes one claim, and the claim is on screens.

     scenes/script.tsx        narration + shot list              <- you are here
     scenes/bulan.tsx         identity + the whole visual library
     scenes/y1.tsx … y17.tsx  one composition per shot
     scenes/types.ts          the props every shot receives

   `text` is recorded one file per act into src/vo/sN.mp3, in array order.
   Captions are timed from that take, so editing a line means re-recording it.

   Timing rules that the build enforces:
     · total runtime stays under 180 s (Shorts ceiling)
     · every `file` named here must exist as scenes/<file>.tsx
   ========================================================================== */

export type ShotSpec = {
  /** file name under scenes/, without extension */
  file: string;
  /** shown in the build log and on the shot list */
  label: string;
  /** fraction of the act's measured span */
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

// The watermark is the channel name and nothing else: no slate, no act number,
// no chapter rule. The picture has to carry itself.
export const CHANNEL = {name: 'NAYSI'};

export const EPISODE = {
  slug: 'bulan',
  identity: 'sidereal',
  topic: 'Bulan menjauh 3,8 cm tiap tahun',
  file: 'scenes/bulan.tsx',
};

/* Six sections. The section name is not printed on screen; it exists so the
   build log, the score and the shot list agree on the order of the argument. */
export const acts: ActSpec[] = [
  /* 01 ─ the claim ------------------------------------------------------- */
  {
    id: 'claim',
    em: ['Bulan', 'menjauh', '3,8', 'kuku'],
    text:
      'Bulan menjauh dari Bumi tiga koma delapan sentimeter setiap tahun. Secepat kuku Anda tumbuh.',
    shots: [
      {file: 'y1', label: 'horizon', from: 0.0, to: 0.5},
      {file: 'y2', label: '3,8 cm', from: 0.5, to: 'end'},
    ],
  },

  /* 02 ─ how we know ----------------------------------------------------- */
  {
    id: 'mirror',
    em: ['cermin', 'seratus', 'koper', '1969'],
    text:
      'Sejak 1969, lima misi menaruh cermin di Bulan. Seratus prisma seukuran koper, tanpa baterai, tanpa satu pun bagian bergerak.',
    shots: [
      {file: 'y3', label: 'ilustrasi & indeks', from: 0.0, to: 'end'},
    ],
  },
  {
    id: 'laser',
    em: ['laser', '384.400', '2,56', 'triliunan'],
    text:
      'Dari Bumi, laser ditembakkan ke prisma itu. Jaraknya 384.400 kilometer. Perjalanan pulang pergi memakan dua koma lima enam detik.',
    shots: [
      {file: 'y4', label: 'teleskop & pulsa', from: 0.0, to: 'end'},
    ],
  },
  {
    id: 'photon',
    em: ['foton', 'triliunan', 'satu', 'detik'],
    text:
      'Dari triliunan foton yang berangkat, hanya sekitar satu dari seratus juta yang kembali. Yang satu itu sudah cukup.',
    shots: [
      {file: 'y5', label: 'satu foton pulang', from: 0.0, to: 'end'},
    ],
  },
  {
    id: 'precision',
    em: ['pikodetik', 'milimeter', 'tiga', 'milimeter'],
    text:
      'Waktu tempuhnya diukur sampai pikodetik. Dari situ jarak terbaca sampai tiga milimeter, setiap malam, selama lebih dari lima dekade.',
    shots: [
      {file: 'y6', label: 'trace & angka', from: 0.0, to: 'end'},
    ],
  },

  /* 03 ─ why it happens -------------------------------------------------- */
  {
    id: 'tide',
    em: ['pasang', 'dua', 'mendahului', 'dorongan'],
    text:
      'Bulan menarik laut jadi dua pasang. Bumi berputar lebih cepat daripada Bulan mengorbit, jadi pasang selalu sedikit mendahului.',
    shots: [
      {file: 'y7', label: 'dua pasang, satu poros', from: 0.0, to: 'end'},
    ],
  },
  {
    id: 'torque',
    em: ['dorongan', 'pergi', 'tiga', 'delapan'],
    text:
      'Pasang yang mendahului itu menarik Bulan ke depan. Dorongan kecil itu yang membuat Bulan pergi, tiga koma delapan sentimeter tiap tahun.',
    shots: [
      {file: 'y8', label: 'dorongan & spiral', from: 0.0, to: 'end'},
    ],
  },
  {
    id: 'slowing',
    em: ['melambat', '1,8', 'abad', 'jam'],
    text:
      'Sebaliknya, Bumi membayarnya. Putaran kita melambat satu koma delapan milidetik per abad. Empat ratus juta tahun lalu, sehari hanya dua puluh dua jam.',
    shots: [
      {file: 'y9', label: '24 vs 22 jam', from: 0.0, to: 0.52},
      {file: 'y10', label: 'seribu detik', from: 0.52, to: 'end'},
    ],
  },

  /* 04 ─ the evidence ---------------------------------------------------- */
  {
    id: 'coral',
    em: ['karang', 'hari', '400', 'arsip'],
    text:
      'Bulan tidak mencatatnya. Karang yang mencatat. Karang purba menyimpan garis pertumbuhan harian, dan garisnya bisa dihitung.',
    shots: [
      {file: 'y11', label: 'karang & garis harian', from: 0.0, to: 'end'},
    ],
  },
  {
    id: 'archive',
    em: ['400', '385', '400 juta', 'hari'],
    text:
      'Empat ratus juta tahun lalu, satu tahun berisi 400 hari. Sekarang 365. Tahunnya sama, harinya yang bertambah.',
    shots: [
      {file: 'y12', label: '400 vs 365 hari', from: 0.0, to: 'end'},
    ],
  },

  /* 05 ─ the future ------------------------------------------------------ */
  {
    id: 'future',
    em: ['besar', 'pasang', 'ratus', 'ganas'],
    text:
      'Karena Bulan menjauh, Bulan dulu tampak lebih besar dan pasangnya lebih ganas. Beberapa ratus juta tahun lagi, gerhana Matahari total akan berhenti terjadi.',
    shots: [
      {file: 'y13', label: 'busur & gerhana', from: 0.0, to: 'end'},
    ],
  },
  {
    id: 'locked',
    em: ['terkunci', 'lima', 'puluh', 'berhenti'],
    text:
      'Sampai suatu hari nanti, Bumi dan Bulan saling mengunci. Bulan akan tergantung di satu titik langit, dan pasang berhenti bergerak.',
    shots: [
      {file: 'y14', label: 'bulan tergantung', from: 0.0, to: 'end'},
    ],
  },

  /* 06 ─ tonight --------------------------------------------------------- */
  {
    id: 'tonight',
    em: ['tahun', 'tiga', 'meter', 'hidup'],
    text:
      'Tiap tahun, Bulan tiga koma delapan sentimeter lebih jauh. Dalam satu masa hidup, jaraknya melebar sekitar tiga meter.',
    shots: [
      {file: 'y15', label: '384.400 km', from: 0.0, to: 'end'},
    ],
  },
  {
    id: 'farewell',
    em: ['tengadah', 'lebih jauh', 'perlahan', 'kemarin'],
    text:
      'Malam ini, saat Anda menengadah, Bulan sudah lebih jauh daripada kemarin. Perpisahan paling lambat, dan paling tidak terasa.',
    shots: [
      {file: 'y16', label: 'langit malam', from: 0.0, to: 'end'},
    ],
  },
];

export default acts;
