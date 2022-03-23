const path = require("path");

module.exports = {
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    devtool: "source-map",
  },
  outputDir: process.env.VUE_APP_BUILD_OUTPUT || "dist",

  lintOnSave: false,

  outputDir: "assets",
  pages: {
    index: {
      entry: "client/js/main.js",
      template: "client/public/index.html",
      filename: "index.html",
    },
  },

  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/js"),
      },
    },
  },
};
