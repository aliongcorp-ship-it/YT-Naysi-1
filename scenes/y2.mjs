/* y2 — 3,8 cm / tahun
   The number, measured rather than announced. A surveyor's plate: the Moon's
   limb across the top, a graduated centimetre rule along the left edge, ten
   year-marks stepping away on the right, and the value itself set huge in the
   middle. The ruler does the arguing, so the caption does not have to. */

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {P, T, Finder} from './bulan.mjs';
import {MoonDisc} from '../src/ui/Moon';
import {Dust} from '../src/ui/Texture';
import {alpha, clamp, eOut, lerp} from '../src/theme';

const YEARS = 10;

export const Compo = ({local}) => {
  const wake = eOut(clamp(local / 1.0));

  return (
    <AbsoluteFill style={{background: P.abyss}}>
      <AbsoluteFill style={{background: 'linear-gradient(198deg, #1B130C 0%, #120C08 46%, #0A0705 100%)'}} />
      <Dust n={480} seed={21} opacity={0.45} color={P.ink} />

      {/* the Moon's limb, cropped by the top edge — we are close to it now */}
      <MoonDisc cx={700} cy={392} r={566} detail={1} lit={0.8} tilt={-22} seed={31} opacity={0.9} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1440,
          height: 1180,
          background: `linear-gradient(180deg, rgba(10,7,5,0) 34%, rgba(10,7,5,0.42) 70%, ${P.abyss} 96%)`,
        }}
      />

      <Finder opacity={0.22 * wake} />

      <Ruler local={local} />
      <Number local={local} />
      <YearMarks local={local} />
      <Fingernail local={local} />
    </AbsoluteFill>
  );
};

/* A graduated centimetre rule, vertical, on the left. A tick every millimetre,
   a number every centimetre, and the 3,8 line carried in amber. */
const Ruler = ({local}) => {
  const e = eOut(clamp((local - 0.1) / 1.0));
  const x = 176;
  const y0 = 560;
  const y1 = 1796;
  const step = (y1 - y0) / 100;
  return (
    <AbsoluteFill style={{opacity: e, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x, top: y0, width: 1, height: y1 - y0, background: alpha(P.ink, 0.34)}} />
      {Array.from({length: 101}).map((_, i) => {
        const y = y0 + i * step;
        const major = i % 10 === 0;
        const hot = i === 38;
        return (
          <div key={i}>
            <div
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: hot ? 40 : major ? 26 : 11,
                height: hot ? 2 : 1,
                background: hot ? P.accent : alpha(P.ink, major ? 0.5 : 0.2),
              }}
            />
            {major && i > 0 && i < 100 ? (
              <div
                style={{
                  position: 'absolute',
                  left: x + 34,
                  top: y - 13,
                  width: 30,
                  fontFamily: T.mono,
                  fontSize: 16,
                  color: alpha(P.ink, 0.34),
                }}
              >
                {i / 10}
              </div>
            ) : null}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: x + 54, top: y0 + 38 * step - 22, fontFamily: T.mono, fontSize: 24, fontWeight: 700, letterSpacing: '0.1em', color: P.accent}}>
        3,8
      </div>
      <div style={{position: 'absolute', left: x, top: y1 + 24, fontFamily: T.mono, fontSize: 16, letterSpacing: '0.34em', color: alpha(P.ink, 0.4)}}>
        CM
      </div>
    </AbsoluteFill>
  );
};

/* The value. Arrives on "tiga koma delapan", then stays put for the rest of the
   act so the eye can leave it and come back. */
const Number = ({local}) => {
  const at = 0.5;
  const e = eOut(clamp((local - at) / 0.55));
  if (local < at - 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 300, width: 1060, top: 962, textAlign: 'center', opacity: e, transform: `translateY(${(1 - e) * 20}px)`}}>
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 18}}>
        <span
          style={{
            fontFamily: T.display,
            fontSize: 296,
            fontWeight: 500,
            lineHeight: 0.88,
            letterSpacing: '-0.06em',
            color: P.ink,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          3,8
        </span>
        <span style={{fontFamily: T.mono, fontSize: 40, fontWeight: 700, letterSpacing: '0.16em', color: P.accent}}>CM</span>
      </div>
      <div style={{marginTop: 22, fontFamily: T.mono, fontSize: 25, letterSpacing: '0.46em', color: alpha(P.ink, 0.6)}}>PER TAHUN</div>
    </div>
  );
};

/* Ten year-marks, each 3,8 cm (scaled to 26 px) further out than the last, read
   as a flight of steps rather than a bar: the point is that it keeps going. */
const YearMarks = ({local}) => {
  const e = eOut(clamp((local - 1.0) / 1.2));
  if (e <= 0) return null;
  const x0 = 348;
  const y0 = 1470;
  const dx = 52;
  const dy = 18;
  return (
    <AbsoluteFill style={{opacity: e, pointerEvents: 'none'}}>
      {Array.from({length: YEARS}).map((_, i) => {
        const x = x0 + i * dx;
        const y = y0 + i * dy;
        const last = i === YEARS - 1;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x, top: y - 9, width: 1, height: 18, background: last ? P.hot : alpha(P.ink, 0.3)}} />
            <div style={{position: 'absolute', left: x - 4, top: y - 4, width: 9, height: 9, background: last ? P.hot : P.ink, opacity: last ? 1 : 0.55}} />
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: x0 - 4, top: y0 + 26, fontFamily: T.mono, fontSize: 16, letterSpacing: '0.3em', color: alpha(P.ink, 0.42)}}>
        SEKARANG
      </div>
      <div
        style={{
          position: 'absolute',
          left: x0 + (YEARS - 1) * dx - 44,
          top: y0 + (YEARS - 1) * dy + 26,
          fontFamily: T.mono,
          fontSize: 16,
          letterSpacing: '0.3em',
          color: alpha(P.ink, 0.42),
        }}
      >
        +10 TH
      </div>
      <div
        style={{
          position: 'absolute',
          left: x0 + (YEARS - 1) * dx + 22,
          top: y0 + (YEARS - 1) * dy - 12,
          fontFamily: T.mono,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: P.hot,
        }}
      >
        38 CM
      </div>
    </AbsoluteFill>
  );
};

/* "Secepat kuku Anda tumbuh": a nail with the same 3,8 cm marked along it. The
   one warm, human object in an episode about instruments. */
const Fingernail = ({local}) => {
  const at = 1.6;
  const e = eOut(clamp((local - at) / 0.7));
  if (local < at - 0.01) return null;
  const len = 196 * e;
  const x = 986;
  const y = 1180;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: e}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 124,
          height: 176,
          borderRadius: '60px 60px 50px 50px',
          background: 'linear-gradient(158deg, rgba(255,217,160,0.22), rgba(255,217,160,0.04) 60%, rgba(198,83,58,0.12))',
          border: `1px solid ${alpha(P.warm, 0.4)}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 5,
          top: 7,
          width: 114,
          height: 32,
          borderRadius: '58px 58px 0 0',
          border: `1px solid ${alpha(P.ink, 0.28)}`,
          borderBottom: 'none',
        }}
      />
      <div style={{position: 'absolute', left: 158, top: 82}}>
        <div style={{width: len, height: 1, background: P.accent}} />
        <div style={{position: 'absolute', left: 0, top: -14, width: 1, height: 28, background: P.accent}} />
        <div style={{position: 'absolute', left: Math.max(0, len - 1), top: -14, width: 1, height: 28, background: P.accent}} />
        <div style={{position: 'absolute', left: -30, width: len + 60, top: -50, textAlign: 'center', fontFamily: T.mono, fontSize: 19, letterSpacing: '0.18em', color: P.accent, opacity: clamp(len / 196)}}>
          3,8 CM
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: -30,
          top: 202,
          width: 240,
          textAlign: 'center',
          fontFamily: T.italic,
          fontStyle: 'italic',
          fontSize: 30,
          color: alpha(P.ink, 0.58),
        }}
      >
        setahun
      </div>
    </div>
  );
};

export default Compo;
