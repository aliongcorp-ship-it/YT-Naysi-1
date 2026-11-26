import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  CHAPTERS,
  IDENTITY,
  clamp01,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  easeOutQuart,
  formatIntID,
  rangeProgress,
} from './script';

export interface SceneRenderProps {
  readonly sec: number;
  readonly localSec: number;
  readonly durationSec: number;
}

export interface NetworkFlowConfig {
  readonly northBridgeCars: number;
  readonly southBridgeCars: number;
  readonly northWideCars: number;
  readonly southWideCars: number;
  readonly shortcutCars: number;
  readonly shortcutState: 'hidden' | 'building' | 'open' | 'closed';
  readonly shortcutBuildProgress?: number;
  readonly highlightPioneer?: number;
  readonly showLabels?: boolean;
  readonly compact?: boolean;
}

const STAGE_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 136,
  width: 1440,
  height: 1710,
  overflow: 'hidden',
  pointerEvents: 'none',
};

export const StageContainer: React.FC<{children: React.ReactNode}> = ({
  children,
}) => <div style={STAGE_STYLE}>{children}</div>;

export const CartographicBackdrop: React.FC<{
  readonly sec: number;
  readonly mood: 'emerald' | 'citrine' | 'vermilion' | 'mixed';
  readonly focusX?: number;
  readonly focusY?: number;
}> = ({sec, mood, focusX = 720, focusY = 920}) => {
  const glowColor =
    mood === 'emerald'
      ? 'rgba(44, 229, 155, 0.13)'
      : mood === 'citrine'
        ? 'rgba(246, 200, 68, 0.14)'
        : mood === 'vermilion'
          ? 'rgba(255, 86, 52, 0.15)'
          : 'rgba(91, 176, 255, 0.12)';

  const secondaryGlow =
    mood === 'vermilion'
      ? 'rgba(246, 200, 68, 0.06)'
      : mood === 'citrine'
        ? 'rgba(44, 229, 155, 0.07)'
        : 'rgba(44, 229, 155, 0.05)';

  const driftX = Math.sin(sec * 0.35) * 18;
  const driftY = Math.cos(sec * 0.28) * 14;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at ${focusX + driftX}px ${focusY + driftY}px, ${glowColor} 0%, ${secondaryGlow} 36%, rgba(12, 18, 16, 0.96) 72%, ${IDENTITY.bgObsidian} 100%)`,
      }}
    >
      <svg
        width={1440}
        height={2560}
        viewBox="0 0 1440 2560"
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <pattern
            id="minor-survey-grid"
            width={72}
            height={72}
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 72 0 L 0 0 0 72"
              fill="none"
              stroke={IDENTITY.gridLine}
              strokeWidth={1}
            />
          </pattern>
          <pattern
            id="major-survey-grid"
            width={288}
            height={288}
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 288 0 L 0 0 0 288"
              fill="none"
              stroke="rgba(184, 212, 200, 0.085)"
              strokeWidth={1.3}
            />
            <path
              d="M -6 0 L 6 0 M 0 -6 L 0 6"
              stroke="rgba(244, 239, 230, 0.18)"
              strokeWidth={1.4}
            />
          </pattern>
        </defs>

        <rect width={1440} height={2560} fill="url(#minor-survey-grid)" />
        <rect width={1440} height={2560} fill="url(#major-survey-grid)" />

        <g
          transform={`translate(${driftX * 0.7}, ${driftY * 0.7})`}
          fill="none"
          stroke={IDENTITY.contourLine}
          strokeWidth={1.35}
        >
          <path d="M -120 420 C 260 310, 580 540, 960 410 C 1210 325, 1380 430, 1560 370" />
          <path d="M -120 535 C 290 420, 620 650, 995 515 C 1245 425, 1400 545, 1560 480" />
          <path d="M -120 1320 C 240 1210, 590 1430, 980 1290 C 1230 1200, 1390 1315, 1560 1260" />
          <path d="M -120 1465 C 260 1355, 640 1560, 1020 1430 C 1270 1345, 1410 1445, 1560 1395" />
          <ellipse cx={310} cy={880} rx={360} ry={210} opacity={0.55} />
          <ellipse cx={310} cy={880} rx={240} ry={135} opacity={0.42} />
          <ellipse cx={1140} cy={990} rx={390} ry={235} opacity={0.5} />
          <ellipse cx={1140} cy={990} rx={250} ry={145} opacity={0.38} />
        </g>

        <g opacity={0.34}>
          {Array.from({length: 19}).map((_, i) => {
            const y = 220 + i * 90;
            const major = i % 4 === 0;
            return (
              <g key={`tick-l-${i}`}>
                <line
                  x1={26}
                  y1={y}
                  x2={major ? 46 : 36}
                  y2={y}
                  stroke={IDENTITY.ivorySoft}
                  strokeWidth={major ? 1.5 : 1}
                />
                <line
                  x1={1414}
                  y1={y}
                  x2={major ? 1394 : 1404}
                  y2={y}
                  stroke={IDENTITY.ivorySoft}
                  strokeWidth={major ? 1.5 : 1}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export const AnodizedCard: React.FC<{
  readonly style?: React.CSSProperties;
  readonly accentColor?: string;
  readonly headerLeft?: string;
  readonly headerRight?: string;
  readonly statusDot?: string;
  readonly children: React.ReactNode;
}> = ({
  style,
  accentColor = IDENTITY.cardBorder,
  headerLeft,
  headerRight,
  statusDot,
  children,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 28,
        background:
          'linear-gradient(168deg, rgba(24, 34, 31, 0.96) 0%, rgba(13, 19, 17, 0.97) 100%)',
        border: `1.5px solid ${accentColor}`,
        boxShadow:
          '0 28px 64px rgba(0, 0, 0, 0.56), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 36,
          right: 36,
          top: 0,
          height: 1.5,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.26) 50%, transparent 100%)',
        }}
      />
      {(headerLeft || headerRight) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 28px 14px 28px',
            borderBottom: '1px solid rgba(244, 239, 230, 0.075)',
            background: 'rgba(255, 255, 255, 0.018)',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            {statusDot && (
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  background: statusDot,
                  boxShadow: `0 0 14px ${statusDot}`,
                  display: 'inline-block',
                }}
              />
            )}
            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '0.14em',
                color: IDENTITY.ivorySoft,
                textTransform: 'uppercase',
              }}
            >
              {headerLeft}
            </span>
          </div>
          {headerRight && (
            <span
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 19,
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: IDENTITY.slateMuted,
                textTransform: 'uppercase',
              }}
            >
              {headerRight}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export const SplitFlapDigits: React.FC<{
  readonly value: string;
  readonly unit?: string;
  readonly color?: string;
  readonly digitWidth?: number;
  readonly digitHeight?: number;
  readonly fontSize?: number;
}> = ({
  value,
  unit,
  color = IDENTITY.ivory,
  digitWidth = 68,
  digitHeight = 94,
  fontSize = 58,
}) => {
  const chars = value.split('');
  return (
    <div style={{display: 'inline-flex', alignItems: 'baseline', gap: 12}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 7}}>
        {chars.map((ch, idx) => {
          const isNarrow = ch === '.' || ch === ',' || ch === ':';
          if (isNarrow) {
            return (
              <span
                key={`sep-${idx}`}
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: fontSize * 0.85,
                  fontWeight: 700,
                  color,
                  padding: '0 2px',
                }}
              >
                {ch}
              </span>
            );
          }
          return (
            <div
              key={`flap-${idx}`}
              style={{
                position: 'relative',
                width: digitWidth,
                height: digitHeight,
                borderRadius: 13,
                background:
                  'linear-gradient(180deg, #212C28 0%, #18211E 49%, #111816 51%, #17201D 100%)',
                border: '1.5px solid rgba(244, 239, 230, 0.16)',
                boxShadow:
                  '0 10px 22px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: 2,
                  background: 'rgba(0, 0, 0, 0.68)',
                  zIndex: 3,
                }}
              />
              <span
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize,
                  fontWeight: 700,
                  color,
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                  zIndex: 2,
                  textShadow: `0 0 18px ${color}33`,
                }}
              >
                {ch}
              </span>
            </div>
          );
        })}
      </div>
      {unit && (
        <span
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: Math.round(fontSize * 0.42),
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: IDENTITY.slateMuted,
            textTransform: 'uppercase',
          }}
        >
          {unit}
        </span>
      )}
    </div>
  );
};

export const MechanicalControlSwitch: React.FC<{
  readonly toggleProgress: number;
  readonly pulseAge: number;
  readonly topTitle: string;
  readonly subTitle: string;
}> = ({toggleProgress, pulseAge, topTitle, subTitle}) => {
  const p = clamp01(toggleProgress);
  const leverAngle = interpolate(p, [0, 1], [-28, 28]);
  const isOpen = p > 0.5;
  const activeColor = isOpen ? IDENTITY.vermilion : IDENTITY.emerald;

  return (
    <div
      style={{
        width: 286,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
      }}
    >
      <div style={{textAlign: 'center'}}>
        <div
          style={{
            fontFamily: IDENTITY.fontDisplay,
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: IDENTITY.ivory,
          }}
        >
          {topTitle}
        </div>
        <div
          style={{
            fontFamily: IDENTITY.fontMono,
            fontSize: 19,
            fontWeight: 500,
            letterSpacing: '0.16em',
            color: IDENTITY.slateMuted,
            marginTop: 4,
          }}
        >
          {subTitle}
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          width: 274,
          height: 196,
          borderRadius: 24,
          background:
            'linear-gradient(165deg, #27322E 0%, #18201E 52%, #111715 100%)',
          border: `1.5px solid ${isOpen ? 'rgba(255,86,52,0.48)' : 'rgba(244,239,230,0.18)'}`,
          boxShadow: `0 22px 46px rgba(0,0,0,0.6), 0 0 36px ${isOpen ? 'rgba(255,86,52,0.22)' : 'rgba(44,229,155,0.10)'}`,
          padding: 20,
        }}
      >
        {[
          [16, 16],
          [246, 16],
          [16, 168],
          [246, 168],
        ].map(([sx, sy], idx) => (
          <div
            key={`screw-${idx}`}
            style={{
              position: 'absolute',
              left: sx,
              top: sy,
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: '#0D1211',
              border: '1px solid rgba(255,255,255,0.16)',
            }}
          />
        ))}

        <div
          style={{
            textAlign: 'center',
            fontFamily: IDENTITY.fontMono,
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: IDENTITY.ivorySoft,
          }}
        >
          JALAN PINTAS TENGAH
        </div>

        <svg
          width={234}
          height={128}
          viewBox="0 0 234 128"
          style={{marginTop: 6, overflow: 'visible'}}
        >
          {pulseAge > 0 && pulseAge < 1 && (
            <circle
              cx={117}
              cy={68}
              r={26 + pulseAge * 92}
              fill="none"
              stroke={IDENTITY.vermilion}
              strokeWidth={3 * (1 - pulseAge)}
              opacity={1 - pulseAge}
            />
          )}

          <rect
            x={69}
            y={42}
            width={96}
            height={52}
            rx={26}
            fill="#0B100E"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={1.5}
          />

          <circle
            cx={36}
            cy={68}
            r={9}
            fill={!isOpen ? IDENTITY.emerald : '#1F2925'}
          />
          {!isOpen && (
            <circle
              cx={36}
              cy={68}
              r={16}
              fill={IDENTITY.emerald}
              opacity={0.22}
            />
          )}
          <text
            x={36}
            y={104}
            textAnchor="middle"
            fill={!isOpen ? IDENTITY.emerald : IDENTITY.slateMuted}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            fontWeight={700}
          >
            TUTUP
          </text>

          <circle
            cx={198}
            cy={68}
            r={9}
            fill={isOpen ? IDENTITY.vermilion : '#1F2925'}
          />
          {isOpen && (
            <circle
              cx={198}
              cy={68}
              r={18}
              fill={IDENTITY.vermilion}
              opacity={0.28}
            />
          )}
          <text
            x={198}
            y={104}
            textAnchor="middle"
            fill={isOpen ? IDENTITY.vermilion : IDENTITY.slateMuted}
            fontFamily={IDENTITY.fontMono}
            fontSize={16}
            fontWeight={700}
          >
            BUKA
          </text>

          <g transform={`translate(117, 68) rotate(${leverAngle})`}>
            <rect
              x={-9}
              y={-52}
              width={18}
              height={56}
              rx={9}
              fill="url(#lever-grad)"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={1}
            />
            <circle
              cx={0}
              cy={-50}
              r={16}
              fill={activeColor}
              stroke="#FFFFFF"
              strokeWidth={2}
            />
            <circle
              cx={0}
              cy={0}
              r={17}
              fill="#2B3834"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth={2}
            />
          </g>
          <defs>
            <linearGradient id="lever-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8DA099" />
              <stop offset="50%" stopColor="#E5ECE9" />
              <stop offset="100%" stopColor="#62736D" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

interface Point2D {
  readonly x: number;
  readonly y: number;
}

const evalQuadBezier = (
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  t: number,
): {x: number; y: number; angleDeg: number} => {
  const u = 1 - t;
  const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x;
  const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y;
  const dx = 2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const dy = 2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return {x, y, angleDeg};
};

const renderBezierVehicles = (
  keyPrefix: string,
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  carCount: number,
  sec: number,
  speedFactor: number,
  congested: boolean,
  bodyColor: string,
  laneOffset = 0,
) => {
  if (carCount <= 0) return null;
  const visualCount = Math.min(22, Math.max(4, Math.round(carCount / 195)));
  const items: React.ReactNode[] = [];

  for (let i = 0; i < visualCount; i++) {
    const seed = (i * 0.6180339887) % 1;
    const rawT = (i / visualCount + sec * speedFactor + seed * 0.06) % 1;
    const t = rawT < 0 ? rawT + 1 : rawT;
    const pos = evalQuadBezier(p0, p1, p2, t);
    const rad = ((pos.angleDeg + 90) * Math.PI) / 180;
    const ox = Math.cos(rad) * laneOffset;
    const oy = Math.sin(rad) * laneOffset;

    items.push(
      <g
        key={`${keyPrefix}-${i}`}
        transform={`translate(${pos.x + ox}, ${pos.y + oy}) rotate(${pos.angleDeg})`}
      >
        <polygon
          points="9,-3 26,-8 26,8 9,3"
          fill="rgba(255, 244, 206, 0.18)"
        />
        {congested && (
          <circle cx={-11} cy={0} r={8.5} fill="#FF3B24" opacity={0.42} />
        )}
        <rect
          x={-10}
          y={-5.2}
          width={20}
          height={10.4}
          rx={3.6}
          fill={congested ? '#FF6A4B' : bodyColor}
          stroke="rgba(10, 14, 13, 0.85)"
          strokeWidth={1.1}
        />
        <rect
          x={-3}
          y={-3.6}
          width={7.5}
          height={7.2}
          rx={1.8}
          fill="rgba(12, 20, 22, 0.72)"
        />
        {congested && (
          <>
            <circle cx={-9.5} cy={-3.2} r={1.8} fill="#FF1E00" />
            <circle cx={-9.5} cy={3.2} r={1.8} fill="#FF1E00" />
          </>
        )}
      </g>,
    );
  }
  return items;
};

export const DiamondNetworkStage: React.FC<{
  readonly sec: number;
  readonly config: NetworkFlowConfig;
  readonly height?: number;
}> = ({sec, config, height = 880}) => {
  const W = 1272;
  const H = height;
  const ptA: Point2D = {x: 138, y: H * 0.52};
  const ptB: Point2D = {x: 1134, y: H * 0.52};
  const ptN: Point2D = {x: 636, y: H * 0.17};
  const ptS: Point2D = {x: 636, y: H * 0.87};

  const ctrlAN: Point2D = {x: 345, y: H * 0.21};
  const ctrlNB: Point2D = {x: 927, y: H * 0.21};
  const ctrlAS: Point2D = {x: 345, y: H * 0.83};
  const ctrlSB: Point2D = {x: 927, y: H * 0.83};
  const ctrlNS: Point2D = {x: 636, y: H * 0.52};

  const nBridgeCongested = config.northBridgeCars > 2600;
  const sBridgeCongested = config.southBridgeCars > 2600;
  const nBridgeTime = Math.round(config.northBridgeCars / 100);
  const sBridgeTime = Math.round(config.southBridgeCars / 100);

  const nBridgeStroke = nBridgeCongested
    ? IDENTITY.vermilion
    : IDENTITY.emerald;
  const sBridgeStroke = sBridgeCongested
    ? IDENTITY.vermilion
    : IDENTITY.emerald;

  const wideNorthActive = config.northWideCars > 100;
  const wideSouthActive = config.southWideCars > 100;

  const buildP = clamp01(config.shortcutBuildProgress ?? 1);

  let pioneerNode: React.ReactNode = null;
  if (
    config.highlightPioneer !== undefined &&
    config.highlightPioneer > 0 &&
    config.highlightPioneer < 1
  ) {
    const u = config.highlightPioneer;
    let pos: {x: number; y: number; angleDeg: number};
    if (u < 0.36) {
      pos = evalQuadBezier(ptA, ctrlAN, ptN, u / 0.36);
    } else if (u < 0.64) {
      pos = evalQuadBezier(ptN, ctrlNS, ptS, (u - 0.36) / 0.28);
    } else {
      pos = evalQuadBezier(ptS, ctrlSB, ptB, (u - 0.64) / 0.36);
    }
    pioneerNode = (
      <g transform={`translate(${pos.x}, ${pos.y})`}>
        <circle
          cx={0}
          cy={0}
          r={38 + Math.sin(sec * 9) * 5}
          fill="rgba(246, 200, 68, 0.16)"
          stroke={IDENTITY.citrine}
          strokeWidth={2}
          strokeDasharray="6 5"
        />
        <g transform={`rotate(${pos.angleDeg})`}>
          <rect
            x={-16}
            y={-8.5}
            width={32}
            height={17}
            rx={5.5}
            fill={IDENTITY.citrine}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          <rect
            x={-4}
            y={-5.5}
            width={11}
            height={11}
            rx={2.5}
            fill="#141C19"
          />
        </g>
        <g transform="translate(0, -54)">
          <rect
            x={-84}
            y={-22}
            width={168}
            height={34}
            rx={17}
            fill="#141D1A"
            stroke={IDENTITY.citrine}
            strokeWidth={1.8}
          />
          <text
            x={0}
            y={1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={IDENTITY.citrine}
            fontFamily={IDENTITY.fontMono}
            fontSize={17}
            fontWeight={700}
          >
            MOBIL #01
          </text>
        </g>
      </g>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: W,
        height: H,
        margin: '0 auto',
        borderRadius: 32,
        background:
          'linear-gradient(180deg, rgba(17, 25, 22, 0.92) 0%, rgba(11, 16, 15, 0.95) 100%)',
        border: '1.5px solid rgba(244, 239, 230, 0.13)',
        boxShadow:
          '0 30px 70px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id="road-glow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform="translate(1188, 72)" opacity={0.62}>
          <circle
            cx={0}
            cy={0}
            r={32}
            fill="rgba(12,18,16,0.8)"
            stroke="rgba(244,239,230,0.2)"
            strokeWidth={1.2}
          />
          <polygon points="0,-24 6,-4 0,-9 -6,-4" fill={IDENTITY.vermilion} />
          <polygon points="0,24 6,4 0,9 -6,4" fill={IDENTITY.slateMuted} />
          <text
            x={0}
            y={-38}
            textAnchor="middle"
            fill={IDENTITY.ivorySoft}
            fontFamily={IDENTITY.fontMono}
            fontSize={15}
            fontWeight={700}
          >
            U
          </text>
        </g>

        {/* Wide Road North->B (Constant 45 min) */}
        <g opacity={wideNorthActive ? 1 : 0.34}>
          <path
            d={`M ${ptN.x} ${ptN.y} Q ${ctrlNB.x} ${ctrlNB.y} ${ptB.x} ${ptB.y}`}
            fill="none"
            stroke="#24312D"
            strokeWidth={44}
            strokeLinecap="round"
          />
          <path
            d={`M ${ptN.x} ${ptN.y} Q ${ctrlNB.x} ${ctrlNB.y} ${ptB.x} ${ptB.y}`}
            fill="none"
            stroke={wideNorthActive ? '#3A524A' : '#1E2825'}
            strokeWidth={36}
            strokeLinecap="round"
          />
          <path
            d={`M ${ptN.x} ${ptN.y} Q ${ctrlNB.x} ${ctrlNB.y} ${ptB.x} ${ptB.y}`}
            fill="none"
            stroke="rgba(244, 239, 230, 0.28)"
            strokeWidth={2}
            strokeDasharray="14 14"
          />
          {renderBezierVehicles(
            'nb-1',
            ptN,
            ctrlNB,
            ptB,
            config.northWideCars * 0.5,
            sec,
            0.16,
            false,
            IDENTITY.emerald,
            -8,
          )}
          {renderBezierVehicles(
            'nb-2',
            ptN,
            ctrlNB,
            ptB,
            config.northWideCars * 0.5,
            sec + 1.7,
            0.16,
            false,
            '#7CF2C2',
            8,
          )}
        </g>

        {/* Wide Road A->South (Constant 45 min) */}
        <g opacity={wideSouthActive ? 1 : 0.34}>
          <path
            d={`M ${ptA.x} ${ptA.y} Q ${ctrlAS.x} ${ctrlAS.y} ${ptS.x} ${ptS.y}`}
            fill="none"
            stroke="#24312D"
            strokeWidth={44}
            strokeLinecap="round"
          />
          <path
            d={`M ${ptA.x} ${ptA.y} Q ${ctrlAS.x} ${ctrlAS.y} ${ptS.x} ${ptS.y}`}
            fill="none"
            stroke={wideSouthActive ? '#3A524A' : '#1E2825'}
            strokeWidth={36}
            strokeLinecap="round"
          />
          <path
            d={`M ${ptA.x} ${ptA.y} Q ${ctrlAS.x} ${ctrlAS.y} ${ptS.x} ${ptS.y}`}
            fill="none"
            stroke="rgba(244, 239, 230, 0.28)"
            strokeWidth={2}
            strokeDasharray="14 14"
          />
          {renderBezierVehicles(
            'as-1',
            ptA,
            ctrlAS,
            ptS,
            config.southWideCars * 0.5,
            sec + 0.4,
            0.16,
            false,
            IDENTITY.cobalt,
            -8,
          )}
          {renderBezierVehicles(
            'as-2',
            ptA,
            ctrlAS,
            ptS,
            config.southWideCars * 0.5,
            sec + 2.1,
            0.16,
            false,
            IDENTITY.emerald,
            8,
          )}
        </g>

        {/* Narrow Bridge A->North (T / 100) */}
        <g>
          {nBridgeCongested && (
            <path
              d={`M ${ptA.x} ${ptA.y} Q ${ctrlAN.x} ${ctrlAN.y} ${ptN.x} ${ptN.y}`}
              fill="none"
              stroke="rgba(255, 86, 52, 0.34)"
              strokeWidth={42}
              strokeLinecap="round"
              filter="url(#road-glow)"
            />
          )}
          <path
            d={`M ${ptA.x} ${ptA.y} Q ${ctrlAN.x} ${ctrlAN.y} ${ptN.x} ${ptN.y}`}
            fill="none"
            stroke="#1A2421"
            strokeWidth={26}
            strokeLinecap="round"
          />
          <path
            d={`M ${ptA.x} ${ptA.y} Q ${ctrlAN.x} ${ctrlAN.y} ${ptN.x} ${ptN.y}`}
            fill="none"
            stroke={nBridgeStroke}
            strokeWidth={4}
            strokeOpacity={0.75}
          />
          {renderBezierVehicles(
            'an',
            ptA,
            ctrlAN,
            ptN,
            config.northBridgeCars,
            sec,
            nBridgeCongested ? 0.085 : 0.22,
            nBridgeCongested,
            IDENTITY.emerald,
            0,
          )}
        </g>

        {/* Narrow Bridge South->B (T / 100) */}
        <g>
          {sBridgeCongested && (
            <path
              d={`M ${ptS.x} ${ptS.y} Q ${ctrlSB.x} ${ctrlSB.y} ${ptB.x} ${ptB.y}`}
              fill="none"
              stroke="rgba(255, 86, 52, 0.34)"
              strokeWidth={42}
              strokeLinecap="round"
              filter="url(#road-glow)"
            />
          )}
          <path
            d={`M ${ptS.x} ${ptS.y} Q ${ctrlSB.x} ${ctrlSB.y} ${ptB.x} ${ptB.y}`}
            fill="none"
            stroke="#1A2421"
            strokeWidth={26}
            strokeLinecap="round"
          />
          <path
            d={`M ${ptS.x} ${ptS.y} Q ${ctrlSB.x} ${ctrlSB.y} ${ptB.x} ${ptB.y}`}
            fill="none"
            stroke={sBridgeStroke}
            strokeWidth={4}
            strokeOpacity={0.75}
          />
          {renderBezierVehicles(
            'sb',
            ptS,
            ctrlSB,
            ptB,
            config.southBridgeCars,
            sec + 0.6,
            sBridgeCongested ? 0.085 : 0.22,
            sBridgeCongested,
            IDENTITY.emerald,
            0,
          )}
        </g>

        {/* Center Shortcut North->South (0 min) */}
        {config.shortcutState !== 'hidden' && (
          <g>
            {config.shortcutState === 'open' && (
              <line
                x1={ptN.x}
                y1={ptN.y}
                x2={ptN.x}
                y2={ptN.y + (ptS.y - ptN.y) * buildP}
                stroke="rgba(246, 200, 68, 0.28)"
                strokeWidth={36}
                strokeLinecap="round"
                filter="url(#road-glow)"
              />
            )}
            <line
              x1={ptN.x}
              y1={ptN.y}
              x2={ptN.x}
              y2={ptN.y + (ptS.y - ptN.y) * buildP}
              stroke={
                config.shortcutState === 'closed' ? '#2A3430' : '#2D2715'
              }
              strokeWidth={24}
              strokeLinecap="round"
            />
            <line
              x1={ptN.x}
              y1={ptN.y}
              x2={ptN.x}
              y2={ptN.y + (ptS.y - ptN.y) * buildP}
              stroke={
                config.shortcutState === 'closed'
                  ? 'rgba(255,86,52,0.45)'
                  : IDENTITY.citrine
              }
              strokeWidth={4.5}
              strokeDasharray={
                config.shortcutState === 'closed' ? '10 10' : undefined
              }
            />
            {config.shortcutState === 'open' &&
              config.shortcutCars > 0 &&
              renderBezierVehicles(
                'ns',
                ptN,
                ctrlNS,
                ptS,
                config.shortcutCars,
                sec,
                0.34,
                false,
                IDENTITY.citrine,
                0,
              )}

            {config.shortcutState === 'closed' && (
              <g transform={`translate(${ptN.x}, ${H * 0.52})`}>
                <rect
                  x={-88}
                  y={-24}
                  width={176}
                  height={48}
                  rx={14}
                  fill="#1E1412"
                  stroke={IDENTITY.vermilion}
                  strokeWidth={2}
                />
                <text
                  x={0}
                  y={2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={IDENTITY.vermilion}
                  fontFamily={IDENTITY.fontMono}
                  fontSize={19}
                  fontWeight={700}
                >
                  DITUTUP ✕
                </text>
              </g>
            )}
          </g>
        )}

        {pioneerNode}

        {/* Segment Telemetry Callouts */}
        {config.showLabels !== false && (
          <g>
            {/* A->N Bridge Pill */}
            <g transform={`translate(${330}, ${H * 0.23})`}>
              <rect
                x={-118}
                y={-28}
                width={236}
                height={56}
                rx={16}
                fill="rgba(13, 19, 17, 0.94)"
                stroke={nBridgeStroke}
                strokeWidth={1.8}
              />
              <text
                x={0}
                y={-6}
                textAnchor="middle"
                fill={IDENTITY.slateMuted}
                fontFamily={IDENTITY.fontMono}
                fontSize={15}
                fontWeight={600}
              >
                JEMBATAN SEMPIT
              </text>
              <text
                x={0}
                y={16}
                textAnchor="middle"
                fill={nBridgeStroke}
                fontFamily={IDENTITY.fontMono}
                fontSize={21}
                fontWeight={700}
              >
                {formatIntID(config.northBridgeCars)} → {nBridgeTime} MNT
              </text>
            </g>

            {/* N->B Wide Pill */}
            <g
              transform={`translate(${942}, ${H * 0.23})`}
              opacity={wideNorthActive ? 1 : 0.45}
            >
              <rect
                x={-114}
                y={-28}
                width={228}
                height={56}
                rx={16}
                fill="rgba(13, 19, 17, 0.94)"
                stroke="rgba(244,239,230,0.22)"
                strokeWidth={1.5}
              />
              <text
                x={0}
                y={-6}
                textAnchor="middle"
                fill={IDENTITY.slateMuted}
                fontFamily={IDENTITY.fontMono}
                fontSize={15}
                fontWeight={600}
              >
                JALAN LEBAR 4 LAJUR
              </text>
              <text
                x={0}
                y={16}
                textAnchor="middle"
                fill={IDENTITY.ivory}
                fontFamily={IDENTITY.fontMono}
                fontSize={21}
                fontWeight={700}
              >
                TETAP 45 MNT
              </text>
            </g>

            {/* A->S Wide Pill */}
            <g
              transform={`translate(${330}, ${H * 0.81})`}
              opacity={wideSouthActive ? 1 : 0.45}
            >
              <rect
                x={-114}
                y={-28}
                width={228}
                height={56}
                rx={16}
                fill="rgba(13, 19, 17, 0.94)"
                stroke="rgba(244,239,230,0.22)"
                strokeWidth={1.5}
              />
              <text
                x={0}
                y={-6}
                textAnchor="middle"
                fill={IDENTITY.slateMuted}
                fontFamily={IDENTITY.fontMono}
                fontSize={15}
                fontWeight={600}
              >
                JALAN LEBAR 4 LAJUR
              </text>
              <text
                x={0}
                y={16}
                textAnchor="middle"
                fill={IDENTITY.ivory}
                fontFamily={IDENTITY.fontMono}
                fontSize={21}
                fontWeight={700}
              >
                TETAP 45 MNT
              </text>
            </g>

            {/* S->B Bridge Pill */}
            <g transform={`translate(${942}, ${H * 0.81})`}>
              <rect
                x={-118}
                y={-28}
                width={236}
                height={56}
                rx={16}
                fill="rgba(13, 19, 17, 0.94)"
                stroke={sBridgeStroke}
                strokeWidth={1.8}
              />
              <text
                x={0}
                y={-6}
                textAnchor="middle"
                fill={IDENTITY.slateMuted}
                fontFamily={IDENTITY.fontMono}
                fontSize={15}
                fontWeight={600}
              >
                JEMBATAN SEMPIT
              </text>
              <text
                x={0}
                y={16}
                textAnchor="middle"
                fill={sBridgeStroke}
                fontFamily={IDENTITY.fontMono}
                fontSize={21}
                fontWeight={700}
              >
                {formatIntID(config.southBridgeCars)} → {sBridgeTime} MNT
              </text>
            </g>

            {/* Center Shortcut Pill */}
            {(config.shortcutState === 'open' ||
              config.shortcutState === 'building') && (
              <g
                transform={`translate(${ptN.x + 132}, ${H * 0.52})`}
                opacity={buildP}
              >
                <rect
                  x={-106}
                  y={-28}
                  width={212}
                  height={56}
                  rx={16}
                  fill="#1E1A0E"
                  stroke={IDENTITY.citrine}
                  strokeWidth={2}
                />
                <text
                  x={0}
                  y={-6}
                  textAnchor="middle"
                  fill={IDENTITY.ivorySoft}
                  fontFamily={IDENTITY.fontMono}
                  fontSize={15}
                  fontWeight={600}
                >
                  JALAN PINTAS
                </text>
                <text
                  x={0}
                  y={16}
                  textAnchor="middle"
                  fill={IDENTITY.citrine}
                  fontFamily={IDENTITY.fontMono}
                  fontSize={22}
                  fontWeight={700}
                >
                  0 MENIT ⚡
                </text>
              </g>
            )}
          </g>
        )}

        {/* Hub Nodes A, B, Utara, Selatan */}
        {[
          {pt: ptA, code: 'A', label: 'ASAL · 4.000', accent: IDENTITY.ivory},
          {pt: ptB, code: 'B', label: 'TUJUAN KOTA', accent: IDENTITY.emerald},
          {pt: ptN, code: 'U', label: 'UTARA', accent: IDENTITY.ivorySoft},
          {pt: ptS, code: 'S', label: 'SELATAN', accent: IDENTITY.ivorySoft},
        ].map((hub) => (
          <g key={hub.code} transform={`translate(${hub.pt.x}, ${hub.pt.y})`}>
            <circle
              cx={0}
              cy={0}
              r={36}
              fill="#101816"
              stroke={hub.accent}
              strokeWidth={3}
            />
            <circle
              cx={0}
              cy={0}
              r={26}
              fill="rgba(244,239,230,0.06)"
              stroke="rgba(244,239,230,0.16)"
              strokeWidth={1}
            />
            <text
              x={0}
              y={2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={hub.accent}
              fontFamily={IDENTITY.fontDisplay}
              fontSize={30}
              fontWeight={700}
            >
              {hub.code}
            </text>
            <rect
              x={-74}
              y={44}
              width={148}
              height={28}
              rx={14}
              fill="rgba(10, 14, 13, 0.88)"
              stroke="rgba(244,239,230,0.14)"
              strokeWidth={1}
            />
            <text
              x={0}
              y={59}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={IDENTITY.ivorySoft}
              fontFamily={IDENTITY.fontMono}
              fontSize={14}
              fontWeight={600}
            >
              {hub.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

/* ==========================================================================
   CHAPTER 01 — JALAN BARU (0.00s -> 10.61s)
   ========================================================================== */
export const Scene01JalanBaru: React.FC<SceneRenderProps> = ({
  sec,
  localSec,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const ch = CHAPTERS[0];
  const sent2Start = ch.sentences[1].start;

  const enterSpring = spring({
    frame,
    fps,
    config: {damping: 18, stiffness: 120},
  });

  const switchTriggerSec = 2.05;
  const switchP = easeOutBack(rangeProgress(localSec, switchTriggerSec, 2.55));
  const pulseAge = rangeProgress(localSec, switchTriggerSec + 0.12, 3.05);
  const jamP = easeInOutCubic(rangeProgress(localSec, 2.35, 4.9));

  const diagAppear = easeOutQuart(
    rangeProgress(sec, sent2Start - 0.12, sent2Start + 0.55),
  );
  const pillRightAppear = easeOutBack(
    rangeProgress(sec, sent2Start + 1.35, sent2Start + 1.95),
  );

  const etaMinutes = Math.round(interpolate(jamP, [0, 1], [65, 80]));
  const deltaKmOrMin = Math.round(interpolate(jamP, [0, 1], [0, 15]));
  const isJammed = jamP > 0.35;

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <CartographicBackdrop
        sec={sec}
        mood={isJammed ? 'vermilion' : 'emerald'}
        focusX={830}
        focusY={840}
      />

      <StageContainer>
        {/* Left Control Column */}
        <div
          style={{
            position: 'absolute',
            left: 72,
            top: 320,
            opacity: interpolate(diagAppear, [0, 1], [1, 0.28]),
            transform: `translateY(${(1 - enterSpring) * 40}px) scale(${1 - diagAppear * 0.05})`,
          }}
        >
          <MechanicalControlSwitch
            toggleProgress={switchP}
            pulseAge={pulseAge}
            topTitle="BRAESS"
            subTitle="PARADOKS JARINGAN"
          />

          <div
            style={{
              marginTop: 28,
              width: 286,
              padding: '20px 22px',
              borderRadius: 22,
              background: 'rgba(15, 22, 20, 0.92)',
              border: `1.5px solid ${isJammed ? 'rgba(255,86,52,0.36)' : 'rgba(44,229,155,0.3)'}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 16,
                letterSpacing: '0.14em',
                color: IDENTITY.slateMuted,
              }}
            >
              STATUS JARINGAN KOTA
            </div>
            <div
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 30,
                fontWeight: 700,
                color: isJammed ? IDENTITY.vermilion : IDENTITY.emerald,
                marginTop: 8,
              }}
            >
              {isJammed ? 'MACET +23%' : 'LANCAR 100%'}
            </div>
          </div>
        </div>

        {/* Right Hero Smartphone / Urban Transit Monitor */}
        <div
          style={{
            position: 'absolute',
            left: 410,
            top: 90,
            width: 944,
            height: 1210,
            borderRadius: 58,
            padding: 18,
            background:
              'linear-gradient(155deg, #394641 0%, #1B2421 45%, #0F1513 100%)',
            boxShadow:
              '0 42px 95px rgba(0,0,0,0.72), inset 0 2px 2px rgba(255,255,255,0.22)',
            transform: `translateY(${(1 - enterSpring) * 55}px)`,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 44,
              background: '#0C1311',
              overflow: 'hidden',
              border: '1.5px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Status Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '22px 38px 12px 38px',
                fontFamily: IDENTITY.fontMono,
                fontSize: 21,
                fontWeight: 600,
                color: IDENTITY.ivory,
              }}
            >
              <span>07:42 WIB ▴</span>
              <div
                style={{
                  width: 148,
                  height: 30,
                  borderRadius: 16,
                  background: '#050807',
                }}
              />
              <span>5G · GPS</span>
            </div>

            {/* Navigation Top Banner */}
            <div
              style={{
                margin: '10px 28px 0 28px',
                padding: '22px 28px',
                borderRadius: 24,
                background: isJammed
                  ? 'linear-gradient(135deg, #B82E18 0%, #7E1C0D 100%)'
                  : 'linear-gradient(135deg, #136F4B 0%, #0D4F35 100%)',
                border: `1.5px solid ${isJammed ? '#FF785A' : '#49F2B2'}`,
                boxShadow: '0 18px 36px rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: 22,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: 'rgba(0,0,0,0.26)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: IDENTITY.fontDisplay,
                  fontSize: 34,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                {isJammed ? '!' : '↱'}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontDisplay,
                    fontSize: 31,
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  {isJammed
                    ? 'Semua jalur mengunci...'
                    : 'Koridor Kota Lancar'}
                </div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontBody,
                    fontSize: 21,
                    color: 'rgba(255,255,255,0.86)',
                    marginTop: 3,
                  }}
                >
                  {isJammed
                    ? '4.000 mobil menumpuk lewat jalan pintas baru'
                    : 'Arus terbagi seimbang di Utara & Selatan'}
                </div>
              </div>
            </div>

            {/* Live Map Canvas inside Phone */}
            <svg
              width={908}
              height={830}
              viewBox="0 0 908 830"
              style={{display: 'block'}}
            >
              <g stroke="rgba(160, 195, 180, 0.08)" strokeWidth={1.2}>
                {Array.from({length: 11}).map((_, i) => (
                  <line
                    key={`mv-${i}`}
                    x1={i * 90}
                    y1={0}
                    x2={i * 90 + 40}
                    y2={830}
                  />
                ))}
                {Array.from({length: 9}).map((_, i) => (
                  <line
                    key={`mh-${i}`}
                    x1={0}
                    y1={i * 95}
                    x2={908}
                    y2={i * 95 - 25}
                  />
                ))}
              </g>

              {/* River Corridor */}
              <path
                d="M 0 430 C 260 390, 580 465, 908 410"
                fill="none"
                stroke="#12262B"
                strokeWidth={64}
              />

              {/* Left & Right Parallel Routes */}
              <path
                d="M 210 760 C 200 540, 230 300, 340 80"
                fill="none"
                stroke={isJammed ? '#FF5634' : '#2CE59B'}
                strokeWidth={18}
                strokeLinecap="round"
              />
              <path
                d="M 690 760 C 700 540, 670 300, 570 80"
                fill="none"
                stroke={isJammed ? '#FF5634' : '#2CE59B'}
                strokeWidth={18}
                strokeLinecap="round"
              />

              {/* Newly Opened Diagonal Shortcut */}
              {switchP > 0.05 && (
                <g opacity={switchP}>
                  <line
                    x1={242}
                    y1={510}
                    x2={242 + (668 - 242) * switchP}
                    y2={510 + (320 - 510) * switchP}
                    stroke={IDENTITY.citrine}
                    strokeWidth={22}
                    strokeLinecap="round"
                  />
                  <rect
                    x={356}
                    y={386}
                    width={196}
                    height={40}
                    rx={12}
                    fill="#1B170C"
                    stroke={IDENTITY.citrine}
                    strokeWidth={1.8}
                  />
                  <text
                    x={454}
                    y={408}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={IDENTITY.citrine}
                    fontFamily={IDENTITY.fontMono}
                    fontSize={18}
                    fontWeight={700}
                  >
                    TOL PINTAS BARU
                  </text>
                </g>
              )}

              {/* Congestion Red Shockwave Circles */}
              {jamP > 0.1 && (
                <g opacity={jamP}>
                  <circle
                    cx={242}
                    cy={510}
                    r={45 + jamP * 68}
                    fill="rgba(255, 86, 52, 0.22)"
                    stroke={IDENTITY.vermilion}
                    strokeWidth={2}
                    strokeDasharray="8 6"
                  />
                  <circle
                    cx={668}
                    cy={320}
                    r={45 + jamP * 68}
                    fill="rgba(255, 86, 52, 0.22)"
                    stroke={IDENTITY.vermilion}
                    strokeWidth={2}
                    strokeDasharray="8 6"
                  />
                </g>
              )}

              {/* Moving Dots on Phone Map */}
              {Array.from({length: 14}).map((_, i) => {
                const u = ((i / 14 + sec * (isJammed ? 0.09 : 0.24)) % 1 + 1) % 1;
                const x1 = 210 + (340 - 210) * u;
                const y1 = 760 - 680 * u;
                const x2 = 690 + (570 - 690) * u;
                const y2 = 760 - 680 * u;
                return (
                  <g key={`pcar-${i}`}>
                    <circle
                      cx={x1}
                      cy={y1}
                      r={6.5}
                      fill={isJammed ? '#FFD2C7' : '#FFFFFF'}
                    />
                    <circle
                      cx={x2}
                      cy={y2}
                      r={6.5}
                      fill={isJammed ? '#FFD2C7' : '#FFFFFF'}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Bottom ETA Footer inside Phone */}
            <div
              style={{
                position: 'absolute',
                left: 24,
                right: 24,
                bottom: 24,
                padding: '20px 30px',
                borderRadius: 26,
                background: 'rgba(15, 22, 20, 0.96)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 42,
                    fontWeight: 700,
                    color: isJammed ? IDENTITY.vermilion : IDENTITY.emerald,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {etaMinutes} mnt
                </div>
                <div
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 19,
                    color: IDENTITY.slateMuted,
                  }}
                >
                  4.000 mobil · tiba {isJammed ? '09:02' : '08:47'}
                </div>
              </div>
              <div
                style={{
                  padding: '12px 26px',
                  borderRadius: 999,
                  background: isJammed ? IDENTITY.vermilion : '#25332E',
                  fontFamily: IDENTITY.fontDisplay,
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                {isJammed ? `+${deltaKmOrMin} Mnt Molor` : 'Tepat Waktu'}
              </div>
            </div>
          </div>
        </div>

        {/* Sentence 1B Floating Precision Telemetry Overlay (like 09:41:27,654 375 in GPS ref!) */}
        {diagAppear > 0.01 && (
          <div
            style={{
              position: 'absolute',
              left: 110,
              right: 110,
              top: 230,
              opacity: diagAppear,
              transform: `translateY(${(1 - diagAppear) * 28}px) scale(${0.96 + diagAppear * 0.04})`,
            }}
          >
            <AnodizedCard
              accentColor="rgba(246, 200, 68, 0.55)"
              headerLeft="DIAGNOSIS PARADOKS · PERJALANAN KOTA"
              headerRight="NASH EQUILIBRIUM"
              statusDot={IDENTITY.citrine}
              style={{
                background:
                  'linear-gradient(165deg, rgba(28, 26, 18, 0.96) 0%, rgba(15, 19, 17, 0.98) 100%)',
                boxShadow:
                  '0 38px 90px rgba(0,0,0,0.78), 0 0 60px rgba(246, 200, 68, 0.16)',
              }}
            >
              <div
                style={{
                  padding: '30px 38px 34px 38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 86,
                      fontWeight: 700,
                      color: IDENTITY.ivory,
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    65 →{' '}
                    <span style={{color: IDENTITY.citrine}}>80</span>
                    <span
                      style={{
                        fontSize: 38,
                        color: IDENTITY.ivorySoft,
                        marginLeft: 12,
                      }}
                    >
                      MENIT
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 20,
                      letterSpacing: '0.14em',
                      color: IDENTITY.slateMuted,
                      marginTop: 14,
                    }}
                  >
                    JALAN BERTAMBAH SATU · SEMUA ORANG RUGI +15 MENIT
                  </div>
                </div>
              </div>
            </AnodizedCard>
          </div>
        )}

        {/* Bottom Status Diagnostic Pills (like SINYAL PENUH ✓ vs WAKTU ! in GPS ref) */}
        <div
          style={{
            position: 'absolute',
            left: 110,
            right: 110,
            top: 1385,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {diagAppear < 0.05 ? (
            <div
              style={{
                margin: '0 auto',
                padding: '16px 38px',
                borderRadius: 22,
                background: 'rgba(24, 16, 15, 0.92)',
                border: `1.5px solid ${isJammed ? 'rgba(255,86,52,0.45)' : 'rgba(244,239,230,0.15)'}`,
                display: 'flex',
                alignItems: 'baseline',
                gap: 14,
              }}
            >
              <span
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 54,
                  fontWeight: 700,
                  color: isJammed ? IDENTITY.vermilion : IDENTITY.emerald,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                +{deltaKmOrMin}
              </span>
              <span
                style={{
                  fontFamily: IDENTITY.fontMono,
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: IDENTITY.ivorySoft,
                }}
              >
                MENIT LEBIH LAMBAT / HARI
              </span>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  opacity: diagAppear,
                  transform: `translateY(${(1 - diagAppear) * 18}px)`,
                }}
              >
                <div style={{display: 'flex', alignItems: 'flex-end', gap: 5}}>
                  {[14, 22, 30, 38].map((bh, idx) => (
                    <div
                      key={`bar-${idx}`}
                      style={{
                        width: 8,
                        height: bh,
                        borderRadius: 3,
                        background: IDENTITY.emerald,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    padding: '13px 28px',
                    borderRadius: 999,
                    border: `2px solid ${IDENTITY.emerald}`,
                    background: IDENTITY.emeraldSoft,
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 25,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: IDENTITY.emerald,
                  }}
                >
                  ASPAL CUKUP
                </div>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: IDENTITY.emerald,
                  }}
                >
                  ✓
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  opacity: pillRightAppear,
                  transform: `scale(${0.86 + pillRightAppear * 0.14})`,
                }}
              >
                <div
                  style={{
                    padding: '13px 28px',
                    borderRadius: 999,
                    border: `2px solid ${IDENTITY.citrine}`,
                    background: IDENTITY.citrineSoft,
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 25,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: IDENTITY.citrine,
                  }}
                >
                  PILIHAN KITA
                </div>
                <span
                  style={{
                    fontFamily: IDENTITY.fontDisplay,
                    fontSize: 44,
                    fontWeight: 800,
                    color: IDENTITY.vermilion,
                  }}
                >
                  !
                </span>
              </div>
            </>
          )}
        </div>
      </StageContainer>
    </div>
  );
};

/* ==========================================================================
   CHAPTER 02 — DUA JALUR (10.61s -> 20.05s)
   ========================================================================== */
export const Scene02DuaJalur: React.FC<SceneRenderProps> = ({
  sec,
  localSec,
}) => {
  const ch = CHAPTERS[1];
  const sent2Start = ch.sentences[1].start;

  const introP = easeOutQuart(rangeProgress(localSec, 0, 0.75));
  const countUpP = easeOutCubic(rangeProgress(localSec, 0.25, 2.2));
  const splitP = easeInOutCubic(
    rangeProgress(sec, sent2Start - 0.25, sent2Start + 1.45),
  );

  const totalCars = Math.round(interpolate(countUpP, [0, 1], [0, 4000]));
  const northCars = Math.round(interpolate(splitP, [0, 1], [1000, 2000]));
  const southCars = Math.round(interpolate(splitP, [0, 1], [1000, 2000]));

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <CartographicBackdrop
        sec={sec}
        mood="emerald"
        focusX={720}
        focusY={780}
      />

      <StageContainer>
        {/* Top Title Header */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 28,
            opacity: introP,
            transform: `translateY(${(1 - introP) * 24}px)`,
          }}
        >
          <div
            style={{
              fontFamily: IDENTITY.fontMono,
              fontSize: 21,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: IDENTITY.emerald,
            }}
          >
            MODEL JARINGAN DIETRICH BRAESS
          </div>
          <div
            style={{
              fontFamily: IDENTITY.fontDisplay,
              fontSize: 52,
              fontWeight: 700,
              color: IDENTITY.ivory,
              marginTop: 6,
            }}
          >
            {formatIntID(totalCars)} MOBIL · DUA JALUR KEMBAR
          </div>
        </div>

        {/* Hero Diamond Network */}
        <div
          style={{
            marginTop: 34,
            opacity: introP,
            transform: `scale(${0.95 + introP * 0.05})`,
          }}
        >
          <DiamondNetworkStage
            sec={sec}
            height={880}
            config={{
              northBridgeCars: 2000,
              southBridgeCars: 2000,
              northWideCars: 2000,
              southWideCars: 2000,
              shortcutCars: 0,
              shortcutState: 'hidden',
              showLabels: true,
            }}
          />
        </div>

        {/* Bottom 50/50 Flow Distribution Panel */}
        <div
          style={{
            width: 1272,
            margin: '38px auto 0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 220px 1fr',
            gap: 22,
            alignItems: 'stretch',
          }}
        >
          <AnodizedCard
            accentColor="rgba(44, 229, 155, 0.4)"
            headerLeft="RUTE UTARA (A → U → B)"
            statusDot={IDENTITY.emerald}
          >
            <div style={{padding: '22px 28px 26px 28px'}}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 52,
                    fontWeight: 700,
                    color: IDENTITY.emerald,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatIntID(northCars)}
                </span>
                <span
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 24,
                    fontWeight: 700,
                    color: IDENTITY.ivorySoft,
                  }}
                >
                  50% ARUS
                </span>
              </div>
              <div
                style={{
                  marginTop: 16,
                  height: 14,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${50 + splitP * 50}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: IDENTITY.emerald,
                  }}
                />
              </div>
            </div>
          </AnodizedCard>

          <div
            style={{
              borderRadius: 28,
              background: 'rgba(20, 29, 26, 0.94)',
              border: '1.5px solid rgba(244,239,230,0.16)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 18,
            }}
          >
            <div
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 17,
                letterSpacing: '0.14em',
                color: IDENTITY.slateMuted,
              }}
            >
              PEMBAGIAN
            </div>
            <div
              style={{
                fontFamily: IDENTITY.fontDisplay,
                fontSize: 42,
                fontWeight: 700,
                color: IDENTITY.ivory,
                marginTop: 6,
              }}
            >
              50 : 50
            </div>
            <div
              style={{
                fontFamily: IDENTITY.fontMono,
                fontSize: 16,
                color: IDENTITY.emerald,
                marginTop: 6,
              }}
            >
              SIMETRIS ✓
            </div>
          </div>

          <AnodizedCard
            accentColor="rgba(91, 176, 255, 0.4)"
            headerLeft="RUTE SELATAN (A → S → B)"
            statusDot={IDENTITY.cobalt}
          >
            <div style={{padding: '22px 28px 26px 28px'}}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 52,
                    fontWeight: 700,
                    color: IDENTITY.cobalt,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatIntID(southCars)}
                </span>
                <span
                  style={{
                    fontFamily: IDENTITY.fontMono,
                    fontSize: 24,
                    fontWeight: 700,
                    color: IDENTITY.ivorySoft,
                  }}
                >
                  50% ARUS
                </span>
              </div>
              <div
                style={{
                  marginTop: 16,
                  height: 14,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${50 + splitP * 50}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: IDENTITY.cobalt,
                  }}
                />
              </div>
            </div>
          </AnodizedCard>
        </div>
      </StageContainer>
    </div>
  );
};

/* ==========================================================================
   CHAPTER 03 — 65 MENIT (20.05s -> 31.36s)
   ========================================================================== */
export const Scene03EnamPuluhLima: React.FC<SceneRenderProps> = ({
  sec,
  localSec,
}) => {
  const ch = CHAPTERS[2];
  const sent2Start = ch.sentences[1].start;

  const card1P = easeOutQuart(rangeProgress(localSec, 0.0, 0.75));
  const card2P = easeOutQuart(rangeProgress(localSec, 2.8, 3.65));
  const card3P = easeOutBack(
    rangeProgress(sec, sent2Start - 0.15, sent2Start + 0.7),
  );

  const sumVal = Math.round(
    interpolate(
      easeOutCubic(rangeProgress(sec, sent2Start + 0.6, sent2Start + 2.1)),
      [0, 1],
      [45, 65],
    ),
  );

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <CartographicBackdrop
        sec={sec}
        mood="emerald"
        focusX={720}
        focusY={860}
      />

      <StageContainer>
        <div
          style={{
            width: 1272,
            margin: '24px auto 0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
        >
          {/* Specimen 1: Wide 4-Lane Highway */}
          <div
            style={{
              opacity: card1P,
              transform: `translateY(${(1 - card1P) * 32}px)`,
            }}
          >
            <AnodizedCard
              accentColor="rgba(244, 239, 230, 0.22)"
              headerLeft="KOMPONEN 01 · JALAN RAYA LEBAR (4 LAJUR)"
              headerRight="BEBAS HAMBATAN"
              statusDot={IDENTITY.ivory}
            >
              <div
                style={{
                  padding: '24px 32px 28px 32px',
                  display: 'grid',
                  gridTemplateColumns: '1.35fr 0.85fr',
                  gap: 28,
                  alignItems: 'center',
                }}
              >
                <svg width={690} height={240} viewBox="0 0 690 240">
                  <rect
                    x={8}
                    y={24}
                    width={674}
                    height={192}
                    rx={18}
                    fill="#18221F"
                    stroke="rgba(255,255,255,0.14)"
                    strokeWidth={2}
                  />
                  {[72, 120, 168].map((ly, idx) => (
                    <line
                      key={`lane-${idx}`}
                      x1={24}
                      y1={ly}
                      x2={666}
                      y2={ly}
                      stroke={
                        idx === 1
                          ? 'rgba(246, 200, 68, 0.55)'
                          : 'rgba(244, 239, 230, 0.22)'
                      }
                      strokeWidth={idx === 1 ? 3 : 2}
                      strokeDasharray={idx === 1 ? undefined : '18 16'}
                    />
                  ))}
                  {[48, 96, 144, 192].map((cy, laneIdx) =>
                    Array.from({length: 4}).map((__, ci) => {
                      const cx =
                        36 +
                        (((ci * 165 + sec * (155 + laneIdx * 18)) % 620) +
                          620) %
                          620;
                      return (
                        <g
                          key={`wcar-${laneIdx}-${ci}`}
                          transform={`translate(${cx}, ${cy})`}
                        >
                          <rect
                            x={-14}
                            y={-7}
                            width={28}
                            height={14}
                            rx={4.5}
                            fill={
                              laneIdx % 2 === 0
                                ? IDENTITY.emerald
                                : IDENTITY.ivorySoft
                            }
                          />
                          <polygon
                            points="14,-5 34,-11 34,11 14,5"
                            fill="rgba(255,245,205,0.16)"
                          />
                        </g>
                      );
                    }),
                  )}
                </svg>

                <div style={{textAlign: 'right'}}>
                  <div
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 19,
                      letterSpacing: '0.12em',
                      color: IDENTITY.slateMuted,
                    }}
                  >
                    WAKTU TEMPUH KONSTAN
                  </div>
                  <div
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 76,
                      fontWeight: 700,
                      color: IDENTITY.ivory,
                      lineHeight: 1.05,
                      marginTop: 8,
                    }}
                  >
                    45
                    <span
                      style={{
                        fontSize: 30,
                        color: IDENTITY.slateMuted,
                        marginLeft: 10,
                      }}
                    >
                      MNT
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      display: 'inline-block',
                      padding: '8px 18px',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.06)',
                      fontFamily: IDENTITY.fontBody,
                      fontSize: 20,
                      color: IDENTITY.ivorySoft,
                    }}
                  >
                    Tetap 45 mnt berapapun mobilnya
                  </div>
                </div>
              </div>
            </AnodizedCard>
          </div>

          {/* Specimen 2: Narrow Suspension Bottleneck Bridge */}
          <div
            style={{
              opacity: Math.max(0.22, card2P),
              transform: `translateY(${(1 - card2P) * 28}px)`,
            }}
          >
            <AnodizedCard
              accentColor="rgba(44, 229, 155, 0.42)"
              headerLeft="KOMPONEN 02 · JEMBATAN SEMPIT (1 LAJUR)"
              headerRight="SENSITIF KEPADATAN"
              statusDot={IDENTITY.emerald}
            >
              <div
                style={{
                  padding: '24px 32px 28px 32px',
                  display: 'grid',
                  gridTemplateColumns: '1.35fr 0.85fr',
                  gap: 28,
                  alignItems: 'center',
                }}
              >
                <svg width={690} height={255} viewBox="0 0 690 255">
                  {/* Suspension Towers & Cables */}
                  <path
                    d="M 30 155 Q 110 42 190 42 Q 345 158 500 42 Q 580 42 660 155"
                    fill="none"
                    stroke="rgba(44, 229, 155, 0.55)"
                    strokeWidth={3}
                  />
                  {Array.from({length: 15}).map((_, hi) => {
                    const hx = 65 + hi * 40;
                    const norm = (hx - 345) / 155;
                    const cableY =
                      hx >= 190 && hx <= 500
                        ? 155 - (1 - norm * norm) * 0 + (norm * norm) * 0
                        : 95;
                    const topY =
                      hx < 190
                        ? 155 - ((hx - 30) / 160) * 110
                        : hx > 500
                          ? 45 + ((hx - 500) / 160) * 110
                          : 42 + (1 - Math.pow((hx - 345) / 155, 2)) * 96;
                    const _unused = cableY;
                    void _unused;
                    return (
                      <line
                        key={`hanger-${hi}`}
                        x1={hx}
                        y1={topY}
                        x2={hx}
                        y2={156}
                        stroke="rgba(244,239,230,0.22)"
                        strokeWidth={1.5}
                      />
                    );
                  })}
                  <rect
                    x={182}
                    y={28}
                    width={16}
                    height={196}
                    rx={4}
                    fill="#384943"
                  />
                  <rect
                    x={492}
                    y={28}
                    width={16}
                    height={196}
                    rx={4}
                    fill="#384943"
                  />

                  {/* Narrow Single Lane Deck */}
                  <rect
                    x={16}
                    y={156}
                    width={658}
                    height={44}
                    rx={10}
                    fill="#14201C"
                    stroke={IDENTITY.emerald}
                    strokeWidth={2.2}
                  />
                  {Array.from({length: 7}).map((_, ci) => {
                    const cx =
                      32 + (((ci * 92 + sec * 125) % 624) + 624) % 624;
                    return (
                      <rect
                        key={`bcar-${ci}`}
                        x={cx - 13}
                        y={171}
                        width={26}
                        height={14}
                        rx={4}
                        fill={IDENTITY.emerald}
                      />
                    );
                  })}
                </svg>

                <div style={{textAlign: 'right'}}>
                  <div
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 19,
                      letterSpacing: '0.1em',
                      color: IDENTITY.emerald,
                    }}
                  >
                    RUMUS: MOBIL ÷ 100
                  </div>
                  <div
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 76,
                      fontWeight: 700,
                      color: IDENTITY.emerald,
                      lineHeight: 1.05,
                      marginTop: 8,
                    }}
                  >
                    20
                    <span
                      style={{
                        fontSize: 30,
                        color: IDENTITY.ivorySoft,
                        marginLeft: 10,
                      }}
                    >
                      MNT
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      display: 'inline-block',
                      padding: '8px 18px',
                      borderRadius: 999,
                      background: IDENTITY.emeraldSoft,
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 20,
                      fontWeight: 600,
                      color: IDENTITY.emerald,
                    }}
                  >
                    2.000 mobil ÷ 100 = 20 mnt
                  </div>
                </div>
              </div>
            </AnodizedCard>
          </div>

          {/* Card 3: Total Equilibrium Equation 20 + 45 = 65 MENIT */}
          <div
            style={{
              opacity: card3P,
              transform: `translateY(${(1 - card3P) * 34}px) scale(${0.95 + card3P * 0.05})`,
            }}
          >
            <AnodizedCard
              accentColor="rgba(44, 229, 155, 0.58)"
              headerLeft="TOTAL WAKTU TEMPUH AWAL · TITIK SEIMBANG"
              headerRight="UTARA = SELATAN"
              statusDot={IDENTITY.emerald}
            >
              <div
                style={{
                  padding: '32px 38px 36px 38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
                  <SplitFlapDigits
                    value="20"
                    color={IDENTITY.emerald}
                    digitWidth={62}
                    digitHeight={88}
                    fontSize={52}
                  />
                  <span
                    style={{
                      fontFamily: IDENTITY.fontDisplay,
                      fontSize: 48,
                      fontWeight: 700,
                      color: IDENTITY.slateMuted,
                    }}
                  >
                    +
                  </span>
                  <SplitFlapDigits
                    value="45"
                    color={IDENTITY.ivory}
                    digitWidth={62}
                    digitHeight={88}
                    fontSize={52}
                  />
                  <span
                    style={{
                      fontFamily: IDENTITY.fontDisplay,
                      fontSize: 48,
                      fontWeight: 700,
                      color: IDENTITY.citrine,
                    }}
                  >
                    =
                  </span>
                  <SplitFlapDigits
                    value={String(sumVal)}
                    unit="MENIT"
                    color={IDENTITY.citrine}
                    digitWidth={74}
                    digitHeight={102}
                    fontSize={62}
                  />
                </div>

                <div
                  style={{
                    padding: '16px 28px',
                    borderRadius: 20,
                    background: IDENTITY.emeraldSoft,
                    border: `1.5px solid ${IDENTITY.emerald}`,
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: IDENTITY.fontMono,
                      fontSize: 22,
                      fontWeight: 700,
                      color: IDENTITY.emerald,
                    }}
                  >
                    SEMUA TIBA 65 MNT ✓
                  </div>
                  <div
                    style={{
                      fontFamily: IDENTITY.fontBody,
                      fontSize: 18,
                      color: IDENTITY.ivorySoft,
                      marginTop: 4,
                    }}
                  >
                    Tak ada yang perlu pindah jalur
                  </div>
                </div>
              </div>
            </AnodizedCard>
          </div>
        </div>
      </StageContainer>
    </div>
  );
};
