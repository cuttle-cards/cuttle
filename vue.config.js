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
      entry: 'client/js/main.js',
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
      alias: {
        _: path.resolve(__dirname),
        '@': path.resolve(__dirname, 'client/js'),
      },
    },
  },

  // In order for the sails cookie to be set on the client when browsing in dev mode, we need
  // to proxy requests to the server
  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    proxy: {
      '/game': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/test': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
    },
  },
};
