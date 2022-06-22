const { defineConfig } = require('cypress');

module.exports = defineConfig({
  pluginsFile: 'tests/e2e/plugins/index.js',
  baseUrl: 'http://localhost:8080',
  testFiles: ['out_of_game/**/*.js', 'in_game/**/*.js'],
  video: false,
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
});
