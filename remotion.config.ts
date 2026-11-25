import path from 'node:path';
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(96);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);
Config.setConcurrency(2);
Config.setChromiumOpenGlRenderer('swangle');
Config.setDelayRenderTimeoutInMilliseconds(120000);

// `.mjs` under `scenes/` carries JSX: the episode's own scene files are plain
// modules so a new episode is a copy, not a TypeScript project. The stock
// bundler only routes `.jsx?` through esbuild, and treats `.mjs` as a *strict*
// ES module (every import would have to spell out `.tsx`). Patch both: give it
// the same loader the `.tsx` rule uses, and put it back in automatic module
// mode so bare specifiers resolve the way they do everywhere else.
const MJS = /\.mjs$/;

Config.overrideWebpackConfig((config) => {
  const currentRules = config.module?.defaultRules;
  // Leave webpack's defaults alone unless it already handed us the list: if we
  // return an empty array, webpack skips installing its own (JSON, CSS, wasm)
  // defaults and nothing parses.
  const defaultRules = Array.isArray(currentRules)
    ? currentRules.filter((r: any) => !(r && r.test instanceof RegExp && r.test.test('probe.mjs')))
    : currentRules;

  return {
    ...config,
    module: {
      ...config.module,
      ...(defaultRules ? {defaultRules} : {}),
      rules: [
        ...(config.module?.rules ?? []),
        {
          test: /\.mjs$/,
          exclude: /node_modules/,
          // `.mjs` would otherwise be a strict ES module: webpack would demand
          // the full path in every import. This episode's scene files import the
          // way the rest of the repo does.
          type: 'javascript/auto',
          resolve: {fullySpecified: false},
          use: [
            {
              loader: path.resolve(process.cwd(), 'node_modules/@remotion/bundler/dist/esbuild-loader/index.js'),
              options: {target: 'chrome85', loader: 'tsx', remotionRoot: process.cwd()},
            },
          ],
        },
      ],
    },
  };
});
