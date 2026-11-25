/* y3 — seratus prisma
   A retroreflector array, drawn as what it is: a hundred small corner cubes
   bolted into a panel, sitting on dust. The camera is low and close, so the
   panel is seen in perspective; it assembles itself cube by cube while the
   narration explains what it is, then holds perfectly still, because the point
   is that it is still there. The corner-cube diagram on the right is the only
   "explainer" in the film, and it is drawn, not labelled. */

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {P, T, Finder} from './bulan.mjs';
import {MoonGround} from '../src/ui/Moon';
import {Dust} from '../src/ui/Texture';
import {alpha, clamp, eOut, hash} from '../src/theme';

const COLS = 10;
const ROWS = 10;

export const Compo = ({local, act}) => {
  const D = act.end - act.start;

  // The array fills in over the first third of the act: 100 cubes, 100 small
  // confirmations. The last one lands just as "seratus prisma" is spoken.
  const fill = clamp((local - 0.35) / (D * 0.34));

  return (
    <AbsoluteFill style={{background: '#0A0705'}}>
      <AbsoluteFill style={{background: 'linear-gradient(188deg, #171009 0%, #100B07 52%, #080504 100%)'}} />
      <MoonGround y={1500} seed={41} opacity={0.5} scale={1.15} />
      <Dust n={700} seed={44} opacity={0.5} color={P.ink} />

      {/* ground plane: a soft band where dust meets shadow, low in frame */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 1512,
          width: 1440,
          height: 560,
          background: 'linear-gradient(180deg, rgba(74,58,41,0.34) 0%, rgba(28,20,13,0.5) 46%, rgba(8,5,4,0.9) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 690 - 430,
          top: 1608,
          width: 860,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.62), rgba(0,0,0,0) 70%)',
          opacity: phase2(fill),
        }}
      />
      <Array fill={fill} local={local} />
      <CornerCube local={local} />
      <PanelHead local={local} />
      <Finder opacity={0.2} />
    </AbsoluteFill>
  );
};

/* ── the array ─────────────────────────────────────────────────────────────
   One panel, 1 m across, tilted 26° so it catches the light. Each cube is a
   small hexagon with a bright edge on the sunward side and a dark floor: the
   same trick as the Moon's craters, at a different scale. */
const phase2 = (fill) => clamp(fill * 2);

const Array = ({fill, local}) => {
  const cx = 690;
  const cy = 1438;
  const w = 860; // panel width in px
  const h = 372; // panel height in px (foreshortened)
  const tilt = -26;
  const phase = eOut(clamp(local / 1.2));

  const cells = React.useMemo(() => {
    const out = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        out.push({r, c, n: r * COLS + c, j: hash(r, c, 7)});
      }
    }
    return out;
  }, []);

  const cellW = w / COLS;
  const cellH = h / ROWS;

  return (
    <div
      style={{
        position: 'absolute',
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        transform: `perspective(1100px) rotateX(52deg) rotateZ(${tilt}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* the backing plate */}
      <div
        style={{
          position: 'absolute',
          inset: -14,
          background: 'linear-gradient(160deg, #4B4238 0%, #322B23 42%, #1B1712 100%)',
          border: `1px solid ${alpha(P.ink, 0.22)}`,
          boxShadow: `0 26px 60px rgba(0,0,0,0.55)`,
          opacity: phase,
        }}
      />
      {cells.map(({r, c, n, j}) => {
        const on = clamp((fill * cells.length - n) / 6);
        if (on <= 0) return null;
        const x = c * cellW;
        const y = r * cellH;
        const s = 0.86 + 0.14 * on;
        return (
          <div
            key={n}
            style={{
              position: 'absolute',
              left: x + cellW * 0.06,
              top: y + cellH * 0.06,
              width: cellW * 0.88 * s,
              height: cellH * 0.88 * s,
              background: `linear-gradient(148deg, rgba(246,235,212,${0.16 + j * 0.2}) 0%, rgba(190,172,140,0.10) 42%, rgba(28,23,17,0.55) 100%)`,
              border: `1px solid rgba(246,235,212,${0.12 + j * 0.18})`,
              opacity: on,
              // a corner cube is three mirrors meeting: the facet line is the tell
              backgroundImage: `linear-gradient(148deg, rgba(246,235,212,${0.16 + j * 0.2}) 0%, rgba(190,172,140,0.10) 42%, rgba(28,23,17,0.55) 100%), linear-gradient(48deg, rgba(255,248,232,0.16) 0 1px, transparent 1px)`,
              backgroundSize: 'auto, 100% 100%',
            }}
          />
        );
      })}
    </div>
  );
};

/* ── corner cube ───────────────────────────────────────────────────────────
   The three-mirror diagram: a triangle with its three inner faces and a ray
   that comes in, bounces three times and leaves along the same line. Drawn as
   SVG so the geometry can be exact. */
const CornerCube = ({local}) => {
  const e = eOut(clamp((local - 1.1) / 0.9));
  if (e <= 0) return null;
  const ox = 1012;
  const oy = 760;
  const s = 152;
  const A = [ox, oy - s];
  const B = [ox + s * 0.87, oy + s * 0.5];
  const Cc = [ox - s * 0.87, oy + s * 0.5];
  const O = [ox, oy + s * 0.02];

  const ray = eOut(clamp((local - 1.7) / 1.5));
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: e}}>
      <svg width={1440} height={2560} style={{position: 'absolute', left: 0, top: 0}}>
        <polygon points={`${A} ${B} ${Cc}`} fill="rgba(246,235,212,0.04)" stroke={`rgba(246,235,212,0.5)`} strokeWidth={1.6} />
        <line x1={O[0]} y1={O[1]} x2={A[0]} y2={A[1]} stroke="rgba(246,235,212,0.34)" strokeWidth={1} />
        <line x1={O[0]} y1={O[1]} x2={B[0]} y2={B[1]} stroke="rgba(246,235,212,0.34)" strokeWidth={1} />
        <line x1={O[0]} y1={O[1]} x2={Cc[0]} y2={Cc[1]} stroke="rgba(246,235,212,0.34)" strokeWidth={1} />
        {/* incoming ray */}
        <line x1={ox - 58} y1={oy - 176} x2={ox + 20} y2={oy - 20} stroke={P.accent} strokeWidth={2.4} opacity={clamp(ray * 3)} />
        {/* the bounce, on the three faces */}
        <polyline
          points={`${ox + 20},${oy - 20} ${ox - 46},${oy + 6} ${ox + 40},${oy + 22} ${ox - 12},${oy + 44}`}
          fill="none"
          stroke={P.alt}
          strokeWidth={2}
          opacity={clamp(ray * 2 - 0.4)}
        />
        {/* leaving along the incoming line */}
        <line
          x1={ox - 12}
          y1={oy + 44}
          x2={ox + 96}
          y2={oy - 148}
          stroke={P.accent}
          strokeWidth={2.4}
          opacity={clamp(ray * 2 - 0.9)}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: ox - 150,
          top: oy + s * 0.72,
          width: 300,
          textAlign: 'center',
          fontFamily: T.mono,
          fontSize: 18,
          letterSpacing: '0.28em',
          color: alpha(P.ink, 0.5),
        }}
      >
        TIGA CERMIN
      </div>
    </div>
  );
};

/* ── the plate's label block ──────────────────────────────────────────────── */
const PanelHead = ({local}) => {
  const e = eOut(clamp((local - 0.5) / 0.9));
  const e2 = eOut(clamp((local - 2.6) / 0.9));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 132, top: 470, opacity: e}}>
        <div style={{fontFamily: T.display, fontSize: 96, fontWeight: 400, letterSpacing: '-0.03em', color: P.ink, lineHeight: 1}}>100</div>
        <div style={{marginTop: 6, fontFamily: T.mono, fontSize: 22, letterSpacing: '0.44em', color: P.accent}}>PRISMA</div>
      </div>
      <div style={{position: 'absolute', left: 132, top: 900, opacity: e2}}>
        <div style={{width: 44, height: 1, background: alpha(P.ink, 0.4)}} />
        <div style={{marginTop: 16, fontFamily: T.mono, fontSize: 20, letterSpacing: '0.26em', color: alpha(P.ink, 0.66)}}>46 CM</div>
        <div style={{marginTop: 10, fontFamily: T.mono, fontSize: 20, letterSpacing: '0.26em', color: alpha(P.ink, 0.42)}}>TANPA BATERAI</div>
        <div style={{marginTop: 10, fontFamily: T.mono, fontSize: 20, letterSpacing: '0.26em', color: alpha(P.ink, 0.42)}}>SEJAK 1969</div>
      </div>
    </AbsoluteFill>
  );
};

export default Compo;
