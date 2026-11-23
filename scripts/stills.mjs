// Render a set of QA stills from one bundle (much faster than n remotion still calls).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const frames = (process.argv[2] ?? "400,1200,2000,2900,3800,4900,5700,6500,7200")
  .split(",")
  .map((x) => parseInt(x.trim(), 10))
  .filter((x) => !Number.isNaN(x));

const browserExecutable = process.env.CHROME_PATH || "/tmp/chromium";
fs.mkdirSync("out/stills", { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "Short", browserExecutable });
console.log("composition", composition.width, composition.height, composition.fps, composition.durationInFrames);

for (const frame of frames) {
  const output = `out/stills/f${String(frame).padStart(4, "0")}.png`;
  const t0 = Date.now();
  await renderStill({ composition, serveUrl, output, frame, browserExecutable, inputProps: {} });
  console.log(output, `${Date.now() - t0}ms`);
}
