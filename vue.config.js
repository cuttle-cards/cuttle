const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  transpileDependencies: ['vuetify'],

  // `assets` is set in the build script, and in the `.env` file as a default
  // `dist` is the vue cli default value
  outputDir: process.env.VUE_APP_BUILD_OUTPUT || 'dist',

  lintOnSave: false,

  pages: {
    index: {
      entry: 'client/js/main.js',
      template: 'client/public/index.html',
      filename: 'index.html',
      // https://devtools.vuejs.org/guide/installation.html#standalone
      ...(process.env.ENABLE_VUE_DEVTOOLS === 'true'
        ? {
            vueDevToolsScript: '<script src="http://localhost:8098" data-vue-devtools></script>',
          }
        : {}),
    },
  },

  configureWebpack: {
    // https://blog.scottlogic.com/2017/11/01/webpack-source-map-options-quick-guide.html
    ...(process.env.ENABLE_VUE_DEVTOOLS !== 'true'
      ? {
          devtool: 'cheap-module-eval-source-map',
        }
      : {}),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client/js'),
      },
    },
  },
};
