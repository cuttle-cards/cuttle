const { defineConfig } = require('cypress');
const isProd = process.env.NODE_ENV === 'production';
module.exports = defineConfig({
  pluginsFile: 'tests/e2e/plugins/index.js',
  baseUrl: process.env.VUE_APP_API_URL || 'http://localhost:8080',
  testFiles: [
    ...(isProd ? ['out_of_game/**/*.spec-prod.js'] : ['out_of_game/**/*.spec-dev.js']),
    'out_of_game/**/*.spec.js',
    'in_game/**/*.spec.js',
  ],
  video: false,
  // TODO: Properly configure environments for Cypress
  env: {
    ENABLE_VUE_DEVTOOLS: process.env.ENABLE_VUE_DEVTOOLS,
    NODE_ENV: process.env.NODE_ENV,
  },
});
