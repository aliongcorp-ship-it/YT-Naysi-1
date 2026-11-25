// Every episode gets its own visual identity: palette, type pairing, background
// treatment, camera grammar and UI language. Nothing is inherited by default.
//
//   node --input-type=module -e "import('./scripts/identity.mjs')"   -> validation
//
// The active identity is written to src/data/identity.json and consumed by
// src/identity.ts, so the same codebase can carry completely different films.

import fs from 'node:fs';

const P = (hex) => hex;
const SCHEMA = 'naysi.identity/1';

const IDENTITIES = {
  // EP 01 — what we already shipped: a survey ship's instruments, cold sonar.
  abyss: {
    schema: SCHEMA,
    id: 'abyss',
    name: 'Abbysal Survey',
    palette: {
      void: '#01060A',
      abyss: '#03101A',
      deep: '#062231',
      mid: '#0B3B4C',
      shallow: '#12657A',
      ink: '#F2FBFB',
      muted: '#7FA2AC',
      faint: '#254250',
      accent: '#5FF3E0',
      accentDim: '#2AA899',
      hot: '#FF7A45',
      warm: '#FFB88C',
      alt: '#8C7BFF',
    },
    type: {display: 'SpaceGrotesk', mono: 'PlexMono', editorial: 'Fraunces'},
    motion: {cut: 'bloom', punch: 1.004, grain: 0.05, ease: 'quint'},
    ui: {chrome: 'instrument', rail: true, marks: true},
  },

  // EP 02 example — a warm archive identity for history / anthropology.
  archive: {
    schema: SCHEMA,
    id: 'archive',
    name: 'Cold Archive',
    palette: {
      void: '#0B0906',
      abyss: '#14100B',
      deep: '#1E1811',
      mid: '#2A2117',
      shallow: '#3B2E1F',
      ink: '#F7F1E4',
      muted: '#A08F76',
      faint: '#3A2F22',
      accent: '#E8B44A',
      accentDim: '#B4862B',
      hot: '#D2543C',
      warm: '#F0C987',
      alt: '#7E9C6B',
    },
    type: {display: 'SpaceGrotesk', mono: 'PlexMono', editorial: 'Fraunces'},
    motion: {cut: 'paper', punch: 1.002, grain: 0.12, ease: 'quart'},
    ui: {chrome: 'ledger', rail: false, marks: true},
  },

  // EP 03 example — a clinical identity for psychology / human behaviour.
  clinic: {
    schema: SCHEMA,
    id: 'clinic',
    name: 'Clinical White',
    palette: {
      void: '#08090C',
      abyss: '#0D0F14',
      deep: '#14171E',
      mid: '#1C2029',
      shallow: '#262B36',
      ink: '#F4F7FA',
      muted: '#8C97A8',
      faint: '#2C323D',
      accent: '#7BC8FF',
      accentDim: '#3E8FC4',
      hot: '#FF6B8A',
      warm: '#FFC7D3',
      alt: '#B8A6FF',
    },
    type: {display: 'SpaceGrotesk', mono: 'PlexMono', editorial: 'Fraunces'},
    motion: {cut: 'cut', punch: 1.006, grain: 0.03, ease: 'quint'},
    ui: {chrome: 'chart', rail: true, marks: false},
  },

  // EP 04 example — a cosmic identity for astronomy / physics.
  orbital: {
    schema: SCHEMA,
    id: 'orbital',
    name: 'Orbital Night',
    palette: {
      void: '#03030C',
      abyss: '#070720',
      deep: '#0C0C33',
      mid: '#151546',
      shallow: '#22225E',
      ink: '#F5F3FF',
      muted: '#8E8BC0',
      faint: '#26244A',
      accent: '#C9A7FF',
      accentDim: '#8B6FD1',
      hot: '#FF9D5C',
      warm: '#FFD9A8',
      alt: '#5FE3C0',
    },
    type: {display: 'SpaceGrotesk', mono: 'PlexMono', editorial: 'Fraunces'},
    motion: {cut: 'iris', punch: 1.005, grain: 0.06, ease: 'quint'},
    ui: {chrome: 'telescope', rail: true, marks: true},
  },

  // EP 04 — lunar laser ranging. Deep space at night, measured by hand:
  // a navy-black void, one gold for instruments, mint for verified data and
  // coral only when something is leaving or wrong. No glow, no bloom.
  lrr: {
    schema: SCHEMA,
    id: 'lrr',
    name: 'Lunar Ranging',
    palette: {
      void: '#04060D',     // near-black, cool
      abyss: '#070C18',
      deep: '#0B1424',
      mid: '#152134',
      shallow: '#26374F',
      ink: '#F6F2E8',      // bone white, slightly warm
      muted: '#8B97A8',
      faint: '#2B3547',
      accent: '#E9B44C',   // instrument gold
      accentDim: '#A87B26',
      hot: '#E2564A',      // coral: recession / alarm
      warm: '#FFD9A0',
      alt: '#5FCFAA',      // mint: verified measurement
    },
    type: {display: 'SpaceGrotesk', mono: 'PlexMono', editorial: 'Fraunces'},
    motion: {cut: 'iris', punch: 1.003, grain: 0.045, ease: 'quint'},
    ui: {chrome: 'instrument', rail: true, marks: true},
  },
};

const REQUIRED = ['void', 'abyss', 'deep', 'mid', 'shallow', 'ink', 'muted', 'faint', 'accent', 'accentDim', 'hot', 'warm', 'alt'];

export function validate(identity) {
  if (identity.schema !== SCHEMA) throw new Error(`identity ${identity.id}: wrong schema`);
  for (const k of REQUIRED) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(identity.palette[k] ?? '')) {
      throw new Error(`identity ${identity.id}: palette.${k} must be a #RRGGBB hex`);
    }
  }
  for (const k of ['display', 'mono', 'editorial']) {
    if (!identity.type?.[k]) throw new Error(`identity ${identity.id}: type.${k} missing`);
  }
  if (!['bloom', 'paper', 'cut', 'iris'].includes(identity.motion?.cut)) {
    throw new Error(`identity ${identity.id}: motion.cut must be bloom|paper|cut|iris`);
  }
  return identity;
}

export function useIdentity(id) {
  const found = IDENTITIES[id];
  if (!found) throw new Error(`unknown identity "${id}" — available: ${Object.keys(IDENTITIES).join(', ')}`);
  return validate(found);
}

const active = process.argv[2] ?? 'abyss';
const identity = useIdentity(active);

// Consumers only need the numbers; also emit a CSS-var block for reference.
fs.mkdirSync('src/data', {recursive: true});
fs.writeFileSync('src/data/identity.json', JSON.stringify(identity, null, 1));

const css = [':root {', ...Object.entries(identity.palette).map(([k, v]) => `  --${k}: ${P(v)};`), '}'].join('\n');
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/identity.css', css + '\n');

console.log(`identity: ${identity.id} (${identity.name})`);
console.log(`  palette  ${Object.keys(identity.palette).length} tokens`);
console.log(`  type     ${Object.values(identity.type).join(' / ')}`);
console.log(`  motion   cut=${identity.motion.cut} grain=${identity.motion.grain}`);
console.log(`  available: ${Object.keys(IDENTITIES).join(', ')}`);
