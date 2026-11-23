import React, { useMemo } from "react";
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import landTopo from "../land.json";
import { C } from "../theme";
import { abs, clamp01, ramp } from "../lib";
import { useCurrentFrame } from "remotion";

const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>;
const land = feature(topo, topo.objects.land) as any;
const graticule = geoGraticule10();

export const POINT_NEMO: [number, number] = [-123.3939, -48.8767];

export const Globe: React.FC<{
  radius: number;
  rotate: [number, number];
  landOpacity?: number;
  lineOpacity?: number;
  marker?: boolean;
  markerPulse?: number;
  showGraticule?: boolean;
  spin?: number;
}> = ({
  radius,
  rotate,
  landOpacity = 0.1,
  lineOpacity = 0.32,
  marker = true,
  markerPulse = 1,
  showGraticule = true,
  spin = 0,
}) => {
  const f = useCurrentFrame();
  const projection = useMemo(
    () =>
      geoOrthographic()
        .translate([0, 0])
        .scale(radius)
        .rotate([rotate[0], -rotate[1], spin])
        .clipAngle(90),
    [radius, rotate[0], rotate[1], spin],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const landPath = path(land);
  const gratPath = showGraticule ? path(graticule) : null;
  const pt = projection(POINT_NEMO);

  return (
    <div
      style={{
        position: "absolute",
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius,
      }}
    >
      {/* atmosphere */}
      <div
        style={{
          position: "absolute",
          inset: -radius * 0.09,
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 50%, rgba(143,214,210,0.10) 55%, rgba(255,90,31,0.10) 72%, rgba(0,0,0,0) 74%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 38% 32%, #16222E 0%, #0A1119 45%, #05080C 78%)",
          boxShadow: `inset 0 0 ${radius * 0.7}px rgba(0,0,0,0.9), 0 0 ${radius * 0.22}px rgba(143,214,210,0.10)`,
        }}
      />
      <svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`${-radius} ${-radius} ${radius * 2} ${radius * 2}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {gratPath && (
          <path d={gratPath ?? undefined} fill="none" stroke={C.cream} strokeWidth={0.8} opacity={lineOpacity * 0.42} />
        )}
        {landPath && (
          <path
            d={landPath}
            fill={C.cream}
            fillOpacity={landOpacity}
            stroke={C.cream}
            strokeWidth={1.1}
            strokeOpacity={lineOpacity}
          />
        )}
        {/* rim */}
        <circle r={radius} fill="none" stroke={C.cream} strokeWidth={1.2} strokeOpacity={0.22} />
      </svg>

      {marker && pt && (
        <div style={{ position: "absolute", left: radius + pt[0], top: radius + pt[1] }}>
          {[0, 1, 2].map((i) => {
            const p = clamp01(((f - i * 22) % 66) / 66);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: -radius * 0.16 * p,
                  top: -radius * 0.16 * p,
                  width: radius * 0.32 * p,
                  height: radius * 0.32 * p,
                  borderRadius: "50%",
                  border: `2px solid ${C.orange}`,
                  opacity: (1 - p) * 0.65 * markerPulse,
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              left: -7,
              top: -7,
              width: 14,
              height: 14,
              borderRadius: 99,
              background: C.orange,
              boxShadow: `0 0 26px ${C.orange}`,
            }}
          />
        </div>
      )}

      {/* terminator */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 26%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.15) 58%, rgba(0,0,0,0.72) 100%)",
        }}
      />
    </div>
  );
};
