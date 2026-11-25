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
import {build} from 'esbuild';

const CACHE = path.resolve('node_modules/.cache/naysi');

export async function loadTsx(relPath) {
  const abs = path.resolve(relPath);
  if (!fs.existsSync(abs)) throw new Error(`missing module: ${relPath}`);
  // Bundle rather than transpile file-by-file: the scene files import
  // `../src/theme` and `./bulan` without extensions (webpack resolves that,
  // Node does not), so a per-file emit produces a graph Node cannot walk.
  // Bundling inlines the local graph and leaves the packages to Node.
  const {outputFiles} = await build({
    entryPoints: [abs],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    jsx: 'automatic',
    logLevel: 'silent',
    external: ['react', 'react-dom', 'react/jsx-runtime', 'remotion', '@remotion/*'],
  });
  const code = outputFiles[0].text;
  const rel = path.relative(process.cwd(), abs).replace(/\.tsx?$/, '.mjs');
  const out = path.join(CACHE, rel);
  fs.mkdirSync(path.dirname(out), {recursive: true});
  fs.writeFileSync(out, code);
  return import(pathToFileURL(out).href);
}
