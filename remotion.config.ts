import path from 'node:path';
import {Config} from '@remotion/cli/config';
Config.setBrowserExecutable(path.resolve(process.cwd(), '.bin/chrome-wrapper'));
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(90);
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
Config.setChromiumOpenGlRenderer('swangle');
