import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {WaterColumn} from '../ui/Atmosphere';
import {Slate} from '../ui/Hud';
import {C, F, SAFE, clamp, eOut, eOutQuint, lerp, smooth} from '../theme';
import type {Act, Shot} from '../timeline';

/*  ACT 2 — the blind spot.
    A surveyed grid that keeps refusing to complete, and a number that climbs.  */

const COLS = 13;
const ROWS = 9;

const SurveyGrid: React.FC<{p: number; t: number}> = ({p, t}) => {
  const cells = useMemo(() => {
    const out: {x: number; y: number; d: number; id: number}[] = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        // survey boats sweep in bands, so fill in rows, with jitter
        const d = (y / ROWS) * 0.8 + ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 + 1) % 1 * 0.2;
        out.push({x, y, d, id: y * COLS + x});
      }
    }
    return out.sort((a, b) => a.d - b.d);
  }, []);
  const cw = 84;
  const ch = 46;
  const ox = 120;
  const oy = 1090;
  return (
    <div style={{position: 'absolute', inset: 0, perspective: 1500}}>
      <div
        style={{
          position: 'absolute',
          left: ox,
          top: oy,
          transform: `rotateX(54deg) rotateZ(-16deg)`,
          transformOrigin: '50% 50%',
          width: COLS * cw,
          height: ROWS * ch,
        }}
      >
        {cells.map((c) => {
          const local = clamp((p - c.d * 0.72) / 0.12);
          if (local <= 0) return null;
          const e = eOut(local);
          const isNew = p - c.d * 0.72 < 0.34;
          return (
            <div
              key={c.id}
              style={{
                position: 'absolute',
                left: c.x * cw,
                top: c.y * ch,
                width: cw - 4,
                height: ch - 4,
                border: `1.5px solid ${isNew ? C.sonar : `${C.sonar}55`}`,
                background: `linear-gradient(150deg, ${isNew ? `${C.sonar}30` : `${C.sonar}0C`}, ${C.sonar}03)`,
                opacity: e,
                transform: `translateZ(${e * 6}px)`,
                boxShadow: isNew ? `0 0 22px ${C.sonar}44` : 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 4,
                  bottom: 3,
                  fontFamily: F.mono,
                  fontSize: 9,
                  letterSpacing: '0.06em',
                  color: `${C.sonar}88`,
                  opacity: isNew ? 0.9 : 0.32,
                }}
              >
                {String(Math.floor(c.d * 7440))}
              </div>
            </div>
          );
        })}
        {/* sweep bar that "acquires" the data */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${clamp(p / 1.15) * 100}%`,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${C.sonar}, transparent)`,
            boxShadow: `0 0 30px ${C.sonar}`,
            opacity: p < 1.15 ? 0.9 : 0,
          }}
        />
      </div>
    </div>
  );
};

const Counter: React.FC<{value: number; t: number}> = ({value, t}) => {
  const shown = value.toFixed(1).replace('.', ',');
  const [int, dec] = shown.split(',');
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left - 6,
        top: 620,
        display: 'flex',
        alignItems: 'baseline',
        fontFamily: F.display,
        fontWeight: 700,
        letterSpacing: '-0.055em',
        color: C.foam,
        textShadow: `0 0 90px ${C.sonar}55`,
      }}
    >
      <span style={{fontSize: 340, lineHeight: 0.8, fontVariantNumeric: 'tabular-nums'}}>{int}</span>
      <span style={{fontSize: 190, lineHeight: 0.8, fontVariantNumeric: 'tabular-nums'}}>,{dec}</span>
      <span style={{fontSize: 150, lineHeight: 0.8, marginLeft: 10, color: C.sonar}}>%</span>
    </div>
  );
};

export const Grid: React.FC<{act: Act; shot: Shot}> = ({act, shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - shot.start;

  // 6% (2017) -> 27.3% (2025)
  const grow = eOutQuint(clamp((t - 1.1) / 6.4));
  const pct = lerp(6, 27.3, grow);
  const p = clamp((t - 0.4) / 6.2) * 1.15;
  const tag = eOut(clamp((t - 7.9) / 0.8));

  return (
    <AbsoluteFill>
      <WaterColumn depth={120} intensity={0.85} rays={0.7} seed={5} />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 330,
          fontFamily: F.mono,
          fontSize: 22,
          letterSpacing: '0.34em',
          color: C.sonar,
          opacity: eOut(clamp(t / 0.6)),
        }}
      >
        DASAR LAUT DUNIA · TERPETAKAN MODERN
      </div>

      <Counter value={pct} t={t} />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 1010,
          display: 'flex',
          gap: 40,
          opacity: eOut(clamp((t - 2.2) / 0.7)),
        }}
      >
        {[
          ['2017', '6%'],
          ['2025', '27,3%'],
        ].map(([k, v], i) => (
          <div key={k} style={{fontFamily: F.mono, borderLeft: `2px solid ${i ? C.sonar : C.faint}`, paddingLeft: 16}}>
            <div style={{fontSize: 17, letterSpacing: '0.3em', color: C.muted}}>{k}</div>
            <div style={{fontSize: 40, color: i ? C.foam : C.muted, fontWeight: 600, marginTop: 4}}>{v}</div>
          </div>
        ))}
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 20,
            letterSpacing: '0.24em',
            color: C.ember,
            alignSelf: 'flex-end',
            paddingBottom: 10,
            opacity: tag * 0.9,
          }}
        >
          +21,3 POIN / 8 TAHUN
        </div>
      </div>

      <SurveyGrid p={p} t={t} />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 1640,
          width: 1100,
          fontFamily: F.display,
          fontWeight: 500,
          fontSize: 42,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          color: C.muted,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 20}px)`,
        }}
      >
        Sisa <span style={{color: C.ink}}>72,7 persen</span> belum pernah diukur langsung — dan sebagian besar
        ada di laut dalam.
      </div>
    </AbsoluteFill>
  );
};
