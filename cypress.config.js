const { defineConfig } = require('cypress');

module.exports = defineConfig({
  pluginsFile: 'tests/e2e/plugins/index.js',
  baseUrl: process.env.VUE_APP_API_URL || 'http://localhost:8080',
  testFiles: ['out_of_game/**/*.js', 'in_game/**/*.js'],
  video: false,
  // TODO: Properly configure environments for Cypress
  env: {
    ENABLE_VUE_DEVTOOLS: process.env.ENABLE_VUE_DEVTOOLS,
  },
});
