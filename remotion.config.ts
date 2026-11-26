import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(94);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);
Config.setOverwriteOutput(true);
