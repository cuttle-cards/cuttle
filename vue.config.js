const path = require('path');

const { isProd } = require('./utils/config-utils');

module.exports = {
  transpileDependencies: ['vuetify'],

  // `assets` is set in the build script, and in the `.env` file as a default
  // `dist` is the vue cli default value
  outputDir: process.env.VUE_APP_BUILD_OUTPUT || 'dist',

  lintOnSave: false,

  pages: {
    index: {
      entry: 'client/js/main.ts',
      template: 'client/public/index.html',
      filename: 'index.html',
      // We never want devtools for production, and want to opt in for dev builds
      // https://devtools.vuejs.org/guide/installation.html#standalone
      ...(!isProd && process.env.ENABLE_VUE_DEVTOOLS === 'true'
        ? {
            vueDevToolsScript: '<script src="http://localhost:8098" data-cy-vue-devtools></script>',
          }
        : {}),
    },
  },

  configureWebpack: {
    // https://blog.scottlogic.com/2017/11/01/webpack-source-map-options-quick-guide.html
    ...(!isProd
      ? {
          devtool: 'eval-cheap-module-source-map',
        }
      : {}),
    resolve: {
      // Must match alias definitions in tsconfig.js
      alias: {
        '@': path.resolve(__dirname, 'client/js'),
      },
    },
  },
};
