// One command, narration to master.
//
//   node scripts/build.mjs                 everything, locally
//   node scripts/build.mjs --audio-only    narration + timeline + score + master
//   node scripts/build.mjs --render-only   render out/naysi_master.mp4 (audio ready)
//
// CI splits it in two so a failed render never wastes the audio pass, and so a
// still-only run can stop after the stills. Nothing here knows where it runs:
// ffmpeg is the system binary when present, and the browser is Remotion's own
// unless NAYSI_BROWSER is set.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';

const args = new Set(process.argv.slice(2));
const audioOnly = args.has('--audio-only');
const renderOnly = args.has('--render-only');

const ffmpeg =
  process.env.NAYSI_FFMPEG ??
  (fs.existsSync('./node_modules/@ffmpeg-installer/linux-x64/ffmpeg')
    ? './node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
    : 'ffmpeg');

const remotion = fs.existsSync('./node_modules/.bin/remotion') ? './node_modules/.bin/remotion' : 'npx';
// A runner with 4 cores wants 4 tabs; the default 2 is for the small box the
// film was cut on. NAYSI_CONCURRENCY overrides either.
const concurrency = process.env.NAYSI_CONCURRENCY ?? '2';
const remotionArgs = remotion === 'npx' ? ['remotion'] : [];

// A sandbox with no system Chrome passes this; a normal machine leaves it unset
// and Remotion uses the browser it downloaded.
const browser = process.env.NAYSI_BROWSER ?? (fs.existsSync('./.bin/chrome') ? './.bin/chrome' : '');
const browserArgs = browser ? [`--browser-executable=${browser}`] : [];

const run = (cmd, cmdArgs, label) => {
  process.stdout.write(`\n▸ ${label}\n`);
  execFileSync(cmd, cmdArgs, {stdio: 'inherit'});
};

fs.mkdirSync('out', {recursive: true});
fs.mkdirSync('public/audio', {recursive: true});

if (!renderOnly) {
  run('python3', ['scripts/vo.py'], 'narration: trim + EQ + level');
  run('node', ['scripts/timeline.mjs'], 'timeline: acts, shots, word timings');
  run('node', ['scripts/identity.mjs'], 'identity: validate the topic file');
  run('python3', ['scripts/score.py'], 'score: synth bed, SFX, ducking');
  run(
    ffmpeg,
    ['-y', '-v', 'error', '-i', 'audio/mix/raw.wav', '-af', 'loudnorm=I=-14:TP=-1.4:LRA=11',
     '-ar', '48000', '-ac', '2', 'public/audio/master.wav'],
    'master bus: -14 LUFS'
  );
  run('node', ['scripts/pack.mjs'], 'upload pack: title, description, hashtags, tags');
  run('python3', ['scripts/pack_zip.py'], 'upload pack: zip');
  if (audioOnly) {
    console.log('\naudio ready: public/audio/master.wav');
    process.exit(0);
  }
}

run(
  remotion,
  [
    ...remotionArgs,
    'render', 'src/index.ts', 'Specimen', 'out/naysi_master.mp4',
    '--codec=h264', '--crf=18', `--concurrency=${concurrency}`,
    '--image-format=jpeg', '--jpeg-quality=95', '--pixel-format=yuv420p',
    '--audio-codec=aac', '--audio-bitrate=320k',
    '--overwrite',
    ...browserArgs,
  ],
  'render: 1440x2560 @ 90fps'
);

const size = fs.statSync('out/naysi_master.mp4').size / 1e6;
console.log(`\nmaster: out/naysi_master.mp4  ${size.toFixed(1)} MB`);
