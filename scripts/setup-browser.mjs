// The sandbox has no Chrome and no root. We give Remotion a headless Chromium
// plus the three NSS libraries it links against, all from npm, then wrap it.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {brotliDecompressSync} from 'node:zlib';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const work = '/tmp/naysi-browser';
fs.mkdirSync(work, {recursive: true});
fs.mkdirSync(path.join(root, '.bin'), {recursive: true});

const chromium = (await import('@sparticuz/chromium')).default;
const bin = await chromium.executablePath();
console.log('chromium:', bin);

if (!fs.existsSync(path.join(work, 'lib/libnss3.so'))) {
  const br = fs.readFileSync(path.join(root, 'node_modules/@sparticuz/chromium/bin/al2023.tar.br'));
  fs.writeFileSync(path.join(work, 'al2023.tar'), brotliDecompressSync(br));
  fs.mkdirSync(path.join(work, 'lib'), {recursive: true});
  execFileSync('tar', ['xf', path.join(work, 'al2023.tar'), '-C', work, 'lib']);
}

const wrapper = path.join(root, '.bin/chrome-wrapper');
fs.writeFileSync(wrapper, `#!/bin/sh\nexport LD_LIBRARY_PATH=${work}/lib\nexec ${bin} --no-sandbox --disable-dev-shm-usage --disable-gpu --mute-audio "$@"\n`);
fs.chmodSync(wrapper, 0o755);
console.log('wrapper:', wrapper);
