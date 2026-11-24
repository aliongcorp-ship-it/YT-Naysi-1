// One command, narration to master. Everything else is generated from it.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';

const FF = './node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
const run = (cmd, args, label) => {
  process.stdout.write(`\n▸ ${label}\n`);
  execFileSync(cmd, args, {stdio: 'inherit'});
};

fs.mkdirSync('out', {recursive: true});
fs.mkdirSync('public/audio', {recursive: true});

run('python3', ['scripts/vo.py'], 'narration: trim + EQ + level');
run('node', ['scripts/timeline.mjs'], 'timeline: acts, shots, word timings');
run('python3', ['scripts/score.py'], 'score: synth bed, SFX, ducking');
run(FF, ['-y', '-v', 'error', '-i', 'audio/mix/raw.wav', '-af', 'loudnorm=I=-14:TP=-1.4:LRA=11', '-ar', '48000', '-ac', '2', 'public/audio/master.wav'], 'master bus: -14 LUFS');
run(
  './node_modules/.bin/remotion',
  [
    'render', 'src/index.ts', 'Specimen', 'out/naysi_master.mp4',
    '--browser-executable=./.bin/chrome',
    '--codec=h264', '--crf=18', '--concurrency=2',
    '--image-format=jpeg', '--jpeg-quality=95', '--pixel-format=yuv420p',
    '--audio-codec=aac', '--audio-bitrate=320k', '--overwrite',
  ],
  'render: 1440x2560 @ 90fps'
);
const size = fs.statSync('out/naysi_master.mp4').size / 1e6;
console.log(`\nmaster: out/naysi_master.mp4  ${size.toFixed(1)} MB`);
