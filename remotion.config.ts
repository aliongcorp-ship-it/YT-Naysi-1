// Remotion config.
//
// Nothing here is sandbox-specific. The browser comes from Remotion's own
// download path when this runs on a normal machine or on a GitHub runner; the
// `--browser-executable` flag is only used by the sandbox helper (scripts/
// setup-browser.mjs) and is never required.
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);
// Two tabs at 1440x2560@90 is what a 2-core runner can keep fed; more just
// thrashes. Override with --concurrency on a bigger box.
Config.setConcurrency(2);
Config.setChromiumOpenGlRenderer('swangle');
// A 10 s shot with a big static SVG can take a while on a cold tab.
Config.setDelayRenderTimeoutInMilliseconds(120000);
// Reels are 1440x2560; do not let the renderer downscale.
Config.setScale(1);
