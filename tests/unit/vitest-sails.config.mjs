import { defineConfig } from 'vitest/config';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(resolve(__filename,'../..'));

export default defineConfig({
  resolve: {
    alias: {
      alias: {
        _: __dirname,
        '@': resolve(__dirname, './src'),
      },
    },
  },
  test: {
    // vitest includes tests from the project root
    include: ['tests/unit/specs/sails/**/*'],
    globals: true,
    environment: 'node',
    setupFiles: ['tests/unit/setup-sails.vitest.js'],
    // Sails tests can not be parallelized
    async: false,
    threads: false,
    isolate: false,
  },
});
