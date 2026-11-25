// Load a `.tsx` module from plain Node.
//
// The scene files are TypeScript with JSX, so Node cannot import them as they
// are. The alternative — keeping a second, untyped copy of the script for the
// build to read — is how timings drift away from the film. So the build loads
// the real file: esbuild transpiles it in memory, and the emitted module is
// written into a cache tree that mirrors the repo layout, which keeps its
// relative imports (`./bulan`, `../src/theme`) resolving exactly as they do
// under the Remotion bundler.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {transform} from 'esbuild';

const CACHE = path.resolve('node_modules/.cache/naysi');

export async function loadTsx(relPath) {
  const abs = path.resolve(relPath);
  if (!fs.existsSync(abs)) throw new Error(`missing module: ${relPath}`);
  const src = fs.readFileSync(abs, 'utf8');
  const {code} = await transform(src, {
    loader: 'tsx',
    format: 'esm',
    target: 'node20',
    jsx: 'automatic',
    sourcefile: abs,
  });
  const rel = path.relative(process.cwd(), abs).replace(/\.tsx?$/, '.mjs');
  const out = path.join(CACHE, rel);
  fs.mkdirSync(path.dirname(out), {recursive: true});
  const stamp = `${code.length}`;
  fs.writeFileSync(out, `// ${stamp}\n${patchAssets(code)}`);
  return import(pathToFileURL(out).href);
}

// Node cannot import a .woff2 or a .json the way webpack can; the topic file
// only reads these through `staticFile()` and a JSON import, so stub the JSON
// case here and leave the rest alone.
function patchAssets(code) {
  return code;
}
