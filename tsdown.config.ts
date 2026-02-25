import { defineConfig, type Options } from 'tsdown';

/**
 * Builds each script entry into a single runnable artifact with @mcp-b/global
 * polyfill bundled in. Output is an IIFE that self-initializes on injection.
 *
 * Extension sync consumes these artifacts via chrome.userScripts.register().
 *
 * Each entry is a separate config because IIFE format requires codeSplitting: false,
 * which only supports a single entry per build.
 */

const entries: Record<string, string> = {
  'scripts/restaurant-example/tools.user':
    'scripts/restaurant-example/tools.ts',
  'scripts/thefork-manager/graphql/tools.user':
    'scripts/thefork-manager/graphql/tools.ts',
  'scripts/thefork-manager/verify-booking/tools.user':
    'scripts/thefork-manager/verify-booking/tools.ts',
  'scripts/thefork-manager/verify-service/tools.user':
    'scripts/thefork-manager/verify-service/tools.ts',
};

const shared: Omit<Options, 'entry'> = {
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

export default defineConfig(
  Object.entries(entries).map(([name, src]) => ({
    ...shared,
    entry: { [name]: src },
  })),
);
