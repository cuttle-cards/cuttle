const { defineConfig } = require('cypress');

const { isProd } = require('../utils/config-utils');

module.exports = defineConfig({
  projectId: 'i8bxr8',
  pluginsFile: 'tests/e2e/plugins/index.js',
  baseUrl: process.env.VUE_APP_API_URL || 'http://localhost:8080',
  // Always test spec.js files, but switch between spec.prod and spec.dev based on the environment
  testFiles: [...(isProd ? ['**/*.spec.prod.js'] : ['**/*.spec.dev.js']), '**/*.spec.js'],
  video: false,
  // TODO: Properly configure environments for Cypress
  env: {
    ENABLE_VUE_DEVTOOLS: process.env.ENABLE_VUE_DEVTOOLS,
    NODE_ENV: isProd ? 'production' : 'dev',
  },
});
