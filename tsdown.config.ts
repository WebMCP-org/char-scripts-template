import type { Options } from 'tsdown';

/**
 * Builds each script entry into a single runnable artifact with @mcp-b/global
 * polyfill bundled in. Output is an IIFE that self-initializes on injection.
 *
 * Extension sync consumes these artifacts via chrome.userScripts.register().
 */
const config: Options = {
  entry: {
    'scripts/restaurant-example/tools.user':
      'scripts/restaurant-example/tools.ts',
  },
  format: ['iife'],
  platform: 'browser',
  target: 'esnext',
  treeshake: true,
  minify: false,
  sourcemap: false,
  dts: false,
  clean: false,
  outDir: '.',
  external: [],
  noExternal: [/.*/],
  outExtensions: () => ({ js: '.js' }),
};

export default config;
