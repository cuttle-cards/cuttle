const path = require("path");

module.exports = {
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    devtool: "source-map",
  },
  outputDir: process.env.VUE_APP_BUILD_OUTPUT || "dist",

  lintOnSave: false,

  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "assets/js"),
      },
    },
  },
};
