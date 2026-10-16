import { defineConfig } from 'vitest/config';
import { aliases } from '../../utils/path-aliases.js';

export default defineConfig({
  resolve: {
    alias: aliases,
  },
  test: {
    // vitest includes tests from the project root
    include: [ 'tests/unit/specs/sails/**/*' ],
    globals: true,
    environment: 'node',
    setupFiles: [ 'tests/unit/setup-sails.vitest.js' ],
    // Sails tests can not be parallelized
    pool: 'forks',
    maxWorkers: 1,
    isolate: false,
    env:{
      VITE_JWT_SECRET: 'cuttle_TEST_JWT_SECRET',
    }
  },
});
