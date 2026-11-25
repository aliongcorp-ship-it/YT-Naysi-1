// Read the current episode's identity out of its topic file and validate it.
//
// The identity used to live here, in a table of five skins. That meant a video's
// look was decided in a build script instead of in the video, and the table
// could drift out of sync with what actually rendered. The topic file
// (scenes/<topic>.tsx) is now the only place an identity is defined; this script
// exists to validate it and to emit the two artefacts other tools consume:
//
//   out/identity.css         the palette as CSS custom properties, for docs
//
//   node scripts/identity.mjs [scenes/<topic>.tsx]
//   node scripts/identity.mjs                 -> uses scenes/script.tsx EPISODE

import fs from 'node:fs';
import path from 'node:path';
import {loadTsx} from './load.mjs';

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
  const {EPISODE} = await loadTsx('scenes/script.tsx');
  file = `scenes/${EPISODE.slug}.tsx`;
}

const mod = await loadTsx(file);
const identity = validate({schema: SCHEMA, ...mod.ID});
const css = [':root {', ...Object.entries(identity.palette).map(([k, v]) => `  --${k}: ${v};`), '}'].join('\n');
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/identity.css', css + '\n');

console.log(`identity: ${identity.id} (${identity.name ?? '—'})  from ${path.relative(process.cwd(), file)}`);
console.log(`  palette  ${Object.keys(identity.palette).length} tokens`);
console.log(`  type     ${Object.values(identity.type).join(' / ')}`);
console.log(`  motion   cut=${identity.motion.cut} grain=${identity.motion.grain}`);
