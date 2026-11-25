# NAYSI — satu episode, satu folder

Video vertikal 1440×2560, 90 fps, ±135 detik, digambar sepenuhnya dengan kode
(Remotion + React). Tidak ada rekaman, tidak ada stok, tidak ada efek glow.

Episode terpasang sekarang: **Bulan menjauh 3,8 cm tiap tahun** — identitas
`sidereal` (Sidereal Plate), 14 act, 16 shot. Semua audio keluar sebagai FLAC;
tidak ada satu pun container WAV di dalam pipeline.

## Struktur

```
scenes/
  script.tsx     300 baris: yang diucapkan, penekanan kata, daftar shot
  bulan.tsx      2000–3000 baris: identitas episode + pustaka gambar topik ini
  y1.tsx … yN.tsx  satu komposisi per shot (sesuai kebutuhan, saat ini 16)
  types.ts        props yang diterima setiap shot
src/             Timeline, caption, watermark, grain, font gate
scripts/         timeline, skor, narasi, pack, render
.github/workflows/render.yml   render penuh di GitHub Actions
```

Aturannya cuma satu: **topik yang berbeda = file topik yang berbeda**. Salin
bentuknya, jangan salin kulitnya. Setiap episode punya palet, pasangan huruf,
tekstur, dan tata bahasa kamera sendiri.

### `scenes/script.tsx`

```ts
export const acts: ActSpec[] = [
  {id: 'hook', em: ['Bulan', '3,8'],
   text: 'Bulan sedang menjauh …',
   shots: [{file: 'y1', label: 'cakrawala', from: 0, to: 0.54},
           {file: 'y2', label: '3,8 cm', from: 0.54, to: 'end'}]},
];
```

`text` dibacakan satu berkas per act ke `src/vo/sN.mp3` sesuai urutan array;
`scripts/vo.py` memangkas, menyamakan level, dan menulis `audio/vo_fx/sN.flac`
plus `durations.json` yang dibaca timeline.
`from`/`to` adalah pecahan dari durasi act **yang terukur**, jadi mengambil
ulang narasi hanya menggeser potongan, tidak merusaknya. Tipe `ActSpec`/`ShotSpec`
membuat salah nama shot jadi error kompilasi, bukan gambar hilang saat render.

### `scenes/bulan.tsx`

Tempat episode memutuskan rupanya: `ID` (palet 14 token, pasangan huruf, gerak
kamera, chrome), `fonts`, `T`, `L` (tata letak), `SZ` (skala huruf), helper gerak
(`rev`, `step`, `breathe`, `rig`, `wipe`), lalu primitif yang topik ini butuhkan:
`Paper`/`Grid`/`Halftone`/`Dust`, `Label`/`Figure`/`Counter`/`Note`/`Source`,
`Ticks`/`Span`/`VSpan`/`Brackets`/`Gauge`/`Ruler`/`Table`/`Status`,
`MoonDisc`/`MoonGround`/`Stars`/`StarFlare`/`Ridge`/`EarthDisc`,
`CornerCube`/`RetroArray`/`Telescope`/`Trace`/`TideDiagram`/`CoralSection`/`Dial`,
dan `Stage` sebagai alas setiap shot. Timeline mengimpor `ID` dan `fonts` dari
sini, bukan dari tema global. Nama komposisi Remotion = `ID.id`.

### `scenes/yN.tsx`

```tsx
export const Compo: React.FC<SceneProps> = ({act, shot, t, local, total}) => (
  <AbsoluteFill>…</AbsoluteFill>
);
```

Selalu pakai `local` (detik sejak shot ini mulai). Shot harus benar di
`local = 0` dan di `local = akhir`. Tanpa chrome: tidak ada slate, nomor bab,
garis bab, atau label seri — satu-satunya overlay tetap adalah watermark nama
kanal.

## Menambah shot

1. Tulis `scenes/y17.tsx` dengan `Compo`.
2. Daftarkan di `src/Timeline.tsx` (satu baris import + satu entri tabel).
3. Sebut di `script.tsx` pada act yang sesuai.
4. `node scripts/timeline.mjs` akan gagal kalau file yang disebut tidak ada.

## Render

Semua render terjadi di GitHub Actions — mesin Anda hanya perlu `git push`.

| yang Anda lakukan | yang terjadi di GitHub |
|---|---|
| push ke branch mana pun yang menyentuh `scenes/`, `src/`, `scripts/`, `public/`, `package*.json` | cek tipe, master audio, **satu still per shot** — ±6 menit |
| push tag `v*` | semua di atas, lalu **film penuh** + release — ±40 menit |
| Actions ▸ Render ▸ Run workflow | sama seperti tag (muncul otomatis begitu file workflow ada di `main`) |

```sh
git tag v1.0-bulan && git push origin v1.0-bulan    # render + release
```

Artefak tiap run (30 hari): `still-<shot>-<frame>.png` (16 berkas), dan pada render
penuh `naysi_master.mp4`, `naysi_pack.zip`, `probe.txt`, `render.log`.
Workflow menolak hasil < 3 MB dan melakukan decode penuh sebelum artefak
diunggah, jadi render rusak tidak lolos. `NAYSI_CONCURRENCY` (default 2 lokal,
4 di runner) mengatur jumlah tab render.

Setelah mengunggah ke YouTube, isi `ID video` di `scripts/pack.json` supaya
deskripsi episode berikutnya bisa menautkannya.

## Lokal (opsional)

```sh
npm ci
python3 -m pip install numpy
node scripts/build.mjs --audio-only   # narasi, timeline, skor, master.flac
node scripts/build.mjs --render-only  # out/naysi_master.mp4
npx remotion studio src/index.ts      # pratinjau
npx tsc --noEmit                      # cek tipe (scenes/ ikut)
```
