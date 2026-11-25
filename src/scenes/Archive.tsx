import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, W, alpha, clamp, eOut, lerp} from '../theme';
import {SpaceBackdrop, StarField, CoordGrid} from '../ui/Atmosphere';
import {Panel} from '../ui/Hud';
import type {Act, Shot} from '../timeline';

/* 07 — DULU.
   The fossil record as a core sample. The bands are drawn as discrete pairs
   with varied thickness (real growth bands are not a even stripe), a scan line
   walks down the core, and the tally climbs to 400 — the number is the payoff,
   so it gets its own instrument panel instead of competing with the caption. */

const BX = 150;
const BY = 470;
const BW = W - 300;
const BH = 940;
const DAYS_SHOWN = 64; // bands drawn; the tally still counts the full year

// deterministic band heights that sum to the strip height
const BANDS = (() => {
  const raw = Array.from({length: DAYS_SHOWN}).map((_, i) => {
    const h = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    return 0.6 + h * 0.9;
  });
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => (v / sum) * BH);
})();

export const Archive: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const local = t - shot.start;

  const enter = eOut(clamp(local / 0.8));
  const scan = clamp((local - 0.9) / 4.6);
  const count = Math.round(lerp(0, 400, eOut(scan)));

  let y = 0;
  const bands = BANDS.map((h, i) => {
    const top = y;
    y += h;
    return {top, h, i};
  });

  return (
    <AbsoluteFill style={{background: C.void}}>
      <SpaceBackdrop from={C.abyss} to={C.void} />
      <StarField opacity={0.26} drift={0.12} seed={61} />
      <CoordGrid opacity={0.05} step={160} />

      <div style={{position: 'absolute', left: BX, top: BY - 66, fontFamily: '"PlexMono"', fontSize: 20, letterSpacing: '0.26em', color: C.muted, opacity: enter}}>
        KARANG PURBA · 400 JUTA TAHUN LALU
      </div>

      {/* the core: light/dark pairs, each pair one day */}
      <div
        style={{
          position: 'absolute',
          left: BX,
          top: BY,
          width: BW,
          height: BH,
          opacity: enter,
          overflow: 'hidden',
          border: `1px solid ${alpha(C.ink, 0.22)}`,
          background: '#3B372C',
        }}
      >
        {bands.map((b) => {
          const done = scan * BH > b.top + b.h;
          return (
            <React.Fragment key={b.i}>
              {/* daylight band */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: b.top,
                  width: '100%',
                  height: b.h * 0.56,
                  background: done ? 'rgba(242,234,212,0.95)' : 'rgba(242,234,212,0.30)',
                }}
              />
              {/* night band */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: b.top + b.h * 0.56,
                  width: '100%',
                  height: b.h * 0.44,
                  background: done ? 'rgba(92,84,64,0.92)' : 'rgba(92,84,64,0.34)',
                }}
              />
            </React.Fragment>
          );
        })}
        {/* the scan line that does the counting */}
        {scan > 0 && scan < 1 ? (
          <div style={{position: 'absolute', left: 0, top: scan * BH, width: '100%', height: 2, background: C.coral}} />
        ) : null}
        {/* hairline column, like a drill core */}
        <div style={{position: 'absolute', left: BW * 0.56, top: 0, width: 1, height: '100%', background: alpha(C.ink, 0.18)}} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: BX,
          top: BY + BH + 26,
          width: BW,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: '"PlexMono"',
          fontSize: 19,
          letterSpacing: '0.2em',
          color: C.muted,
          opacity: enter,
        }}
      >
        <span>SATU PASANG PITA = SATU HARI</span>
        <span style={{color: C.gold}}>EMPAT RATUS HARI SETAHUN</span>
      </div>

      <Panel
        label="HITUNGAN HARI"
        value={String(count)}
        unit="/ 400"
        sub="dihitung dari pita pertumbuhan"
        at={shot.start + 0.6}
        t={t}
        y={1452}
        color={count >= 400 ? C.gold : C.ink}
        size={92}
        width={BW}
      />
    </AbsoluteFill>
  );
};
