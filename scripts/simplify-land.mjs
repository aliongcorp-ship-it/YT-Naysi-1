import fs from 'fs';
import pkg from 'topojson-simplify';
const { presimplify, simplify } = pkg;
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-110m.json','utf8'));
const pre = presimplify(topo);
const count = (t) => t.arcs.reduce((a, arc) => a + arc.length, 0);
console.log('original points', count(topo));
for (const min of [0.2, 0.5, 1, 2, 4]) {
  const s = simplify(pre, min);
  console.log('min', min, 'points', count(s));
  fs.writeFileSync(`build/land-${min}.json`, JSON.stringify(s));
}
