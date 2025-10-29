import { defineConfig } from 'vitest/config';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitest.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      _: resolve(__dirname),
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['tests/unit/**/*.spec.{js,ts}'],
    // No sails tests in the initial run, those are triggered via npm run test:sails instead
    exclude: ['tests/unit/specs/sails/**/*'],
    globals: true,
    environment: 'node',
  },
});
