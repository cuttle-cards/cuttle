import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [ '.agents/tools/__tests__/**/*.spec.mjs' ],
    environment: 'node',
    globals: true,
  },
});
