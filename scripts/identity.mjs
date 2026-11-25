// Read the current episode's identity out of its topic file and validate it.
//
// The identity used to live here, in a table of five skins. That meant a video's
// look was decided in a build script instead of in the video, and the table
// could drift out of sync with what actually rendered. The topic file
// (scenes/<topic>.mjs) is now the only place an identity is defined; this script
// exists to validate it and to emit the two artefacts other tools consume:
//
//   src/data/identity.json   machine-readable palette + type + motion
//   out/identity.css         the palette as CSS custom properties
//
//   node scripts/identity.mjs [scenes/<topic>.mjs]
//   node scripts/identity.mjs                 -> uses scenes/script.mjs EPISODE

import fs from 'node:fs';
import path from 'node:path';
import {transform} from 'esbuild';

const SCHEMA = 'naysi.identity/1';
const REQUIRED = ['void', 'abyss', 'deep', 'mid', 'shallow', 'ink', 'muted', 'faint', 'accent', 'accentDim', 'hot', 'warm', 'alt'];
const CUTS = ['bloom', 'paper', 'cut', 'iris'];

export function validate(identity) {
  for (const k of REQUIRED) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(identity?.palette?.[k] ?? '')) {
      throw new Error(`identity ${identity?.id ?? '?'}: palette.${k} must be a #RRGGBB hex`);
    }
  }
  for (const k of ['display', 'mono', 'editorial']) {
    if (!identity.type?.[k]) throw new Error(`identity ${identity.id}: type.${k} missing`);
  }
  if (!CUTS.includes(identity.motion?.cut)) {
    throw new Error(`identity ${identity.id}: motion.cut must be ${CUTS.join('|')}`);
  }
  for (const k of ['punch', 'grain']) {
    if (typeof identity.motion?.[k] !== 'number') throw new Error(`identity ${identity.id}: motion.${k} must be a number`);
  }
  return identity;
}

const arg = process.argv[2];
let file = arg;
if (!file) {
  const {EPISODE} = await import(path.resolve('scenes/script.mjs'));
  file = path.resolve('scenes', `${EPISODE.slug}.mjs`);
}

// The topic file is a module with JSX in it (it owns the episode's drawing
// primitives). Node cannot load JSX, so the file is transpiled in memory and
// imported from a temp path. Same code the renderer runs, no second copy.
const mod = await loadModule(path.resolve(file));
const identity = validate({schema: SCHEMA, ...mod.ID});

async function loadModule(abs) {
  const code = fs.readFileSync(abs, 'utf8');
  const out = await transform(code, {loader: 'tsx', format: 'esm', target: 'node20', jsx: 'automatic'});
  // keep relative imports working: the temp file has to sit beside the original
  const tmp = path.join(path.dirname(abs), `.${path.basename(abs, '.mjs')}.build-${process.pid}.mjs`);
  fs.writeFileSync(tmp, out.code);
  try {
    return await import(tmp);
  } finally {
    fs.rmSync(tmp, {force: true});
  }
}

fs.mkdirSync('src/data', {recursive: true});
fs.writeFileSync('src/data/identity.json', JSON.stringify({schema: SCHEMA, ...identity}, null, 1));

const css = [':root {', ...Object.entries(identity.palette).map(([k, v]) => `  --${k}: ${v};`), '}'].join('\n');
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/identity.css', css + '\n');

console.log(`identity: ${identity.id} (${identity.name ?? '—'})  from ${path.relative(process.cwd(), file)}`);
console.log(`  palette  ${Object.keys(identity.palette).length} tokens`);
console.log(`  type     ${Object.values(identity.type).join(' / ')}`);
console.log(`  motion   cut=${identity.motion.cut} grain=${identity.motion.grain}`);
