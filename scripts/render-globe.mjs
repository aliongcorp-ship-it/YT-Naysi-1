// Renders the rotating orthographic globe to an MP4 per scene.
// The main composition then plays it back with <OffthreadVideo/>, which is
// dramatically cheaper than re-rasterising a 1 Mpx SVG on every frame.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createCanvas } from "@napi-rs/canvas";
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import pkg from "topojson-client";
import timeline from "../src/timeline.json" with { type: "json" };

const { feature } = pkg;
const topo = JSON.parse(fs.readFileSync("src/land.json", "utf8"));
const land = feature(topo, topo.objects.land);
const graticule = geoGraticule10();
const FF = "node_modules/@ffmpeg-installer/linux-x64/ffmpeg";

const SIZE = 1200;
const R = SIZE / 2 - 8;
const CX = SIZE / 2;
const CY = SIZE / 2;
const POINT_NEMO = [-123.3939, -48.8767];

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ramp = (f, start, dur) => clamp01((f - start) / Math.max(1, dur));
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

const SCENES = {
  s2: (f, fps, dur) => {
    const p = easeInOut(ramp(f, 0, dur * 0.42));
    const drift = Math.sin((f / fps) * 0.5) * 2.2;
    return [lerp(214, 123.4, p) + drift, lerp(-16, -48.9, p)];
  },
  s8: (f, fps, dur) => {
    const p = easeInOut(ramp(f, 0, dur));
    return [lerp(150, 123.4, p), lerp(-30, -48.9, p)];
  },
};

function drawGlobe(ctx, rot, f) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "#04070B";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // sphere
  const g = ctx.createRadialGradient(CX - R * 0.22, CY - R * 0.28, R * 0.08, CX, CY, R);
  g.addColorStop(0, "#182634");
  g.addColorStop(0.45, "#0A1119");
  g.addColorStop(0.82, "#05080C");
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();

  const projection = geoOrthographic()
    .translate([CX, CY])
    .scale(R)
    .rotate([rot[0], -rot[1], 0])
    .clipAngle(90);
  const path = geoPath(projection, ctx);

  // graticule
  ctx.beginPath();
  path(graticule);
  ctx.strokeStyle = "rgba(239,230,212,0.18)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // land
  ctx.beginPath();
  path(land);
  ctx.fillStyle = "rgba(239,230,212,0.13)";
  ctx.fill();
  ctx.strokeStyle = "rgba(239,230,212,0.42)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // rim
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(239,230,212,0.22)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // marker
  const pt = projection(POINT_NEMO);
  if (pt) {
    for (let i = 0; i < 3; i++) {
      const p = (((f - i * 22) % 66) + 66) % 66 / 66;
      const rr = R * 0.16 * p;
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], rr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,90,31,${0.65 * (1 - p)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], 7, 0, Math.PI * 2);
    ctx.fillStyle = "#FF5A1F";
    ctx.shadowColor = "#FF5A1F";
    ctx.shadowBlur = 26;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // terminator
  const t = ctx.createRadialGradient(CX - R * 0.2, CY - R * 0.24, R * 0.3, CX, CY, R);
  t.addColorStop(0, "rgba(0,0,0,0)");
  t.addColorStop(0.58, "rgba(0,0,0,0.15)");
  t.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.fillStyle = t;
  ctx.fill();
}

for (const [id, rotFn] of Object.entries(SCENES)) {
  const scene = timeline.scenes.find((s) => s.id === id);
  const dir = `build/globe-${id}`;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d");
  const total = scene.durationInFrames;
  console.log(`globe ${id}: ${total} frames`);
  for (let f = 0; f < total; f++) {
    drawGlobe(ctx, rotFn(f, timeline.fps, total), f);
    fs.writeFileSync(path.join(dir, `${String(f).padStart(5, "0")}.png`), canvas.toBuffer("image/png"));
    if (f % 200 === 0) process.stdout.write(`  ${f}/${total}\r`);
  }
  console.log(`  ${total}/${total}`);

  execFileSync(FF, [
    "-y", "-v", "error", "-framerate", String(timeline.fps),
    "-i", path.join(dir, "%05d.png"),
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "16",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    `public/globe-${id}.mp4`,
  ]);
  console.log(`  -> public/globe-${id}.mp4`);
}
