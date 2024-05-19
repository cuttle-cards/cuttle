const { defineConfig } = require('cypress');

const cypressConfig = require('../../../cypress.config');

module.exports = defineConfig({
  ...cypressConfig,
  e2e: {
    ...cypressConfig.e2e,
    specPattern: 'tests/e2e/**/*.spec.js',
    excludeSpecPattern: '',
  },
});
