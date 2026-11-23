import { Config } from "@remotion/cli/config";

// 2K vertical master (1440x2560) — YouTube Shorts / TikTok / Reels
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(94);
Config.setCodec("h264");
Config.setCrf(20);
Config.setPixelFormat("yuv420p");
Config.setConcurrency(2);

// Lets the repo render in this sandbox (no system Chrome) while staying
// portable: on a normal machine Remotion downloads its own browser.
if (process.env.CHROME_PATH) {
  Config.setBrowserExecutable(process.env.CHROME_PATH);
}
