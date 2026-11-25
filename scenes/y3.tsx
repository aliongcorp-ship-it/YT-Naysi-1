/* y3 — ilustrasi & indeks
   The evidence, presented as a catalogue plate. Left: an illustration of the
   retroreflector array (in plan oblique), assembling itself cell by cell. Right:
   the index of the five missions that put one on the Moon, as a data table.

   Nothing here is a fact the narration does not state, and every row carries the
   same three fields, so the table reads as a record rather than as decoration. */

import React from 'react';
import type {SceneProps} from './types';
import {
  Brackets, Figure, Label, L, Note, P, RetroArray, SZ, Stage, Status, T, Table, alpha, rev,
} from './bulan';

const ROWS = [
  ['Apollo 11', '1969', '100'],
  ['Apollo 14', '1971', '100'],
  ['Apollo 15', '1971', '300'],
  ['Luna 17', '1970', '14'],
  ['Luna 21', '1973', '14'],
];

export const Compo: React.FC<SceneProps> = ({local}) => {
  const array = rev(local, 0.2, 2.4, (t) => t);
  const head = rev(local, 0.1, 0.9);
  const table = rev(local, 1.4, 1.2);
  const total = rev(local, 3.2, 1.0);

  return (
    <Stage grid={0.3} gridCell={132} paper={0.46} dustSeed={3} shade={0.9}>
      <Label text="BUKTI · CERMIN SUDUT" y={L.top} on={head} />
      <Label text="ILUSTRASI" y={L.top + 300} on={head * 0.8} rule={30} size={14} color={alpha(P.muted, 0.7)} />

      {/* the array, in plan oblique, filling as it is "placed" */}
      <RetroArray cx={L.left + 372} cy={812} cols={10} rows={10} cell={46} fill={array} on={head} />

      {/* the array's own dimension lines, so the drawing is measurable */}
      <div style={{opacity: array * 0.85}}>
        <svg width={L.w} height={L.h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={L.left + 24} y1={1088} x2={L.left + 750} y2={1088} stroke={alpha(P.accent, 0.5)} strokeWidth={1} />
          <line x1={L.left + 24} y1={1078} x2={L.left + 24} y2={1098} stroke={alpha(P.accent, 0.5)} strokeWidth={1} />
          <line x1={L.left + 750} y1={1078} x2={L.left + 750} y2={1098} stroke={alpha(P.accent, 0.5)} strokeWidth={1} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: L.left + 332,
            top: 1102,
            fontFamily: T.mono,
            fontSize: SZ.micro,
            letterSpacing: '0.26em',
            color: P.accent,
          }}
        >
          46 CM
        </div>
        <Note text="tiap sel: tiga cermin saling tegak lurus" x={L.left + 20} y={1160} side="right" width={720} size={SZ.small} on={array} />
      </div>

      {/* the index */}
      <div style={{opacity: table}}>
        <Label text="INDEKS MISI" y={1244} on={table} rule={44} size={15} />
        <Table
          x={L.left}
          y={1290}
          width={L.measure}
          head={['MISI', 'TAHUN', 'PRISMA']}
          colWidths={[520, 300, 356]}
          rows={ROWS}
          rowH={56}
          on={table}
          size={SZ.small}
        />
      </div>

      {/* the total, set as the answer to the table */}
      <div style={{opacity: total}}>
        <div
          style={{
            position: 'absolute',
            left: L.left,
            top: 1622,
            width: L.measure,
            height: 1,
            background: alpha(P.ink, 0.24),
          }}
        />
        <Figure value="528" x={L.left} y={1642} size={92} unit="PRISMA TERPASANG" unitColor={P.accent} />
        <Status text="SEMUA MASIH BEKERJA" x={L.right - 320} y={1680} on={total} />
      </div>

      <Brackets x0={L.left - 24} y0={L.top + 268} x1={L.left + 758} y1={1216} len={24} on={head * 0.7} />
    </Stage>
  );
};

export default Compo;
