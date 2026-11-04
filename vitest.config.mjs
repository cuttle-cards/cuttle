import { defineConfig } from 'vitest/config';
import { aliases } from './utils/path-aliases.js';

// https://vitest.dev/config/
export default defineConfig({
  resolve: {
    alias: aliases,
  },
  test: {
    include: [ 'tests/unit/**/*.spec.{js,ts}' ],
    // No sails tests in the initial run, those are triggered via npm run test:sails instead
    exclude: [ 'tests/unit/specs/sails/**/*' ],
    globals: true,
    environment: 'node',
  },
});
