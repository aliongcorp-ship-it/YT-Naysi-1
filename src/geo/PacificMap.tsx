import React, { useMemo } from "react";
import { geoEquirectangular, geoGraticule10, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import landTopo from "../land.json";
import { C } from "../theme";
import { POINT_NEMO } from "./Globe";

const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>;
const land = feature(topo, topo.objects.land) as any;
const graticule = geoGraticule10();

export const PacificMap: React.FC<{
  scale?: number;
  width?: number;
  height?: number;
  landOpacity?: number;
  lineOpacity?: number;
  graticuleOpacity?: number;
}> = ({
  scale = 960,
  width = 1440,
  height = 1600,
  landOpacity = 0.1,
  lineOpacity = 0.3,
  graticuleOpacity = 0.08,
}) => {
  const projection = useMemo(
    () =>
      geoEquirectangular()
        .center(POINT_NEMO)
        .scale(scale)
        .translate([width / 2, height / 2]),
    [scale, width, height],
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", left: 0, top: 0, overflow: "hidden" }}
    >
      <path d={path(graticule) ?? undefined} fill="none" stroke={C.cream} strokeWidth={1} opacity={graticuleOpacity} />
      <path
        d={path(land) ?? undefined}
        fill={C.cream}
        fillOpacity={landOpacity}
        stroke={C.cream}
        strokeWidth={1.3}
        strokeOpacity={lineOpacity}
      />
    </svg>
  );
};

export const projectPacific = (lon: number, lat: number, scale = 960, width = 1440, height = 1600) => {
  const projection = geoEquirectangular()
    .center(POINT_NEMO)
    .scale(scale)
    .translate([width / 2, height / 2]);
  return projection([lon, lat]) as [number, number] | null;
};
