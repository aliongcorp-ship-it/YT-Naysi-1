// Builds the YouTube upload pack: title, description, hashtags, tags. Nothing else.
//   node scripts/pack.mjs [identityId]
// Source of truth for the copy lives in scripts/pack.json so a new episode is a
// data edit, not a code edit.
import fs from 'node:fs';

const pack = JSON.parse(fs.readFileSync('scripts/pack.json', 'utf8'));
const tl = JSON.parse(fs.readFileSync('src/data/timeline.json', 'utf8'));

const MIN = 60;
const fmt = (s) => `${Math.floor(s / MIN)}:${String(Math.round(s % MIN)).padStart(2, '0')}`;

const title = pack.title;
if (title.length > 100) throw new Error(`title is ${title.length} chars, YouTube caps at 100`);
for (const h of pack.hashtags) {
  if (!/^#[\p{L}\p{N}_]+$/u.test(h)) throw new Error(`bad hashtag ${h}`);
}
const tagLen = pack.tags.reduce((a, t) => a + t.length + 1, 0);
if (tagLen > 480) throw new Error(`tags are ${tagLen} chars, YouTube caps near 500`);

const description = [
  pack.hook,
  '',
  ...pack.body,
  '',
  `Sumber: ${pack.sources.join(' · ')}`,
  '',
  pack.hashtags.join(' '),
].join('\n');

if (description.length > 4900) throw new Error(`description is ${description.length} chars`);

const assets = {
  title,
  description,
  hashtags: pack.hashtags,
  tags: pack.tags,
};

// The master itself is uploaded separately; this file is the packaging only.
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/naysi_pack.json', JSON.stringify(assets, null, 2));

// A plain-text twin, pasteable by hand: title, description, hashtags, tags. Nothing else.
fs.writeFileSync(
  'out/naysi_pack.txt',
  [
    'JUDUL',
    title,
    '',
    'DESKRIPSI',
    description,
    '',
    'HASHTAG',
    pack.hashtags.join(' '),
    '',
    'TAG',
    pack.tags.join(', '),
  ].join('\n') + '\n'
);

console.log(`title       ${title.length}/100`);
console.log(`description ${description.length}/5000`);
console.log(`hashtags    ${pack.hashtags.length}`);
console.log(`tags        ${pack.tags.length} (${tagLen} chars)`);
console.log(`runtime     ${fmt(tl.durationSec)} · ${tl.width}x${tl.height} · ${tl.fps}fps`);
console.log('written     out/naysi_pack.json, out/naysi_pack.txt');
