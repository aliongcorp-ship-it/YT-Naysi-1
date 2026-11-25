// The sandbox ships no Chrome and no root. @sparticuz/chromium provides a
// headless build plus the NSS/GL libs it links against; this script unpacks
// both and writes a wrapper Remotion can exec.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {brotliDecompressSync} from 'node:zlib';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const work = process.env.NAYSI_BROWSER_DIR ?? '/tmp/naysi-browser';
fs.mkdirSync(work, {recursive: true});
fs.mkdirSync(path.join(root, '.bin'), {recursive: true});

const chromium = (await import('@sparticuz/chromium')).default;
const exe = await chromium.executablePath();
console.log('chromium', exe);

// system libs (NSS + expat) shipped beside the binary
const libsDir = path.join(work, 'lib');
if (!fs.existsSync(path.join(libsDir, 'libnss3.so'))) {
  const tgz = execFileSync('npm', ['pack', '@sparticuz/chromium', '--silent'], {cwd: work, encoding: 'utf8'}).trim().split('\n').pop();
  execFileSync('tar', ['xzf', tgz, '-C', work], {cwd: work});
  const br = fs.readFileSync(path.join(work, 'package/bin/al2023.tar.br'));
  fs.writeFileSync(path.join(work, 'al2023.tar'), brotliDecompressSync(br));
  execFileSync('tar', ['xf', path.join(work, 'al2023.tar'), '-C', work]);
  fs.mkdirSync(libsDir, {recursive: true});
  // The tarball unpacks into `work/lib`, which is already `libsDir`; copying a
  // directory onto itself throws ERR_FS_CP_EINVAL. Only move it when the
  // unpacked location really differs from the target.
  const srcLibs = path.join(work, 'lib');
  if (fs.existsSync(srcLibs) && path.resolve(srcLibs) !== path.resolve(libsDir)) {
    fs.cpSync(srcLibs, libsDir, {recursive: true});
  }
  console.log('libs ->', libsDir);
}

const wrapper = path.join(root, '.bin/chrome');
fs.writeFileSync(
  wrapper,
  `#!/bin/sh\nexport LD_LIBRARY_PATH=${libsDir}\nexec ${exe} --no-sandbox --disable-dev-shm-usage --disable-gpu --mute-audio --font-render-hinting=none "$@"\n`
);
fs.chmodSync(wrapper, 0o755);
console.log('wrapper', wrapper);
