/**
 * Two-pass delivery encode.
 *
 * The Remotion master (out/short-video.mp4) runs ~110 Mbps because of the film
 * grain, which is far above anything a platform needs. This pass targets a
 * delivery bitrate while a light temporal denoise keeps the grain from eating
 * the budget, so the picture stays clean at a fraction of the size.
 *
 *   node scripts/encode.mjs [bitrateK] [outFile]
 */
import { execFileSync } from "node:child_process";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

const FF = ffmpegPath.path;
const BITRATE = process.argv[2] ?? "8800k";
const OUT = process.argv[3] ?? "out/short-upload.mp4";
const SRC = "out/short-video.mp4";
const AUDIO = "out/mix.wav";
const VF = "hqdn3d=2:1.5:3:3,format=yuv420p";
const COMMON = [
  "-vf", VF,
  "-c:v", "libx264",
  "-preset", "medium",
  "-b:v", BITRATE,
  "-maxrate", "10M",
  "-bufsize", "20M",
];

const run = (args) => execFileSync(FF, ["-y", "-v", "error", ...args], { stdio: "inherit" });
const t0 = Date.now();

run([
  "-i", SRC, ...COMMON,
  "-pass", "1", "-passlogfile", "out/x264pass",
  "-an", "-f", "null", "/dev/null",
]);
console.log(`pass 1: ${((Date.now() - t0) / 1000).toFixed(0)}s`);

const t1 = Date.now();
run([
  "-i", SRC, "-i", AUDIO, ...COMMON,
  "-pass", "2", "-passlogfile", "out/x264pass",
  "-profile:v", "high", "-level", "5.1",
  "-c:a", "aac", "-b:a", "192k",
  "-movflags", "+faststart", "-shortest", OUT,
]);
console.log(`pass 2: ${((Date.now() - t1) / 1000).toFixed(0)}s -> ${OUT}`);
