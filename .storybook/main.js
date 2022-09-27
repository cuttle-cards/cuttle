/* eslint-disable no-unused-vars */
const { resolve } = require('path');

// https://storybook.js.org/docs/vue/configure/overview#configure-your-storybook-project
module.exports = {
  stories: ['../stories/**/*.stories.@(js|jsx|mdx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: '@storybook/vue',
  staticDirs: ['../src/img'],
  webpackFinal: async (config, { configType }) => {
    // Use Sass loader for vuetify components
    config.module.rules.push({
      test: /\.sass$/,
      use: [
        'style-loader',
        'vue-style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
        },
      ],
      include: resolve(__dirname, '../'),
    });
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        'style-loader',
        'vue-style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
        },
      ],
      include: resolve(__dirname, '../'),
    });

    config.module.rules.push({
      resolve: {
        alias: {
          '@': resolve(__dirname, '../src'),
          vue: 'vue/dist/vue.js',
          vue$: 'vue/dist/vue.esm.js',
        },
      },
    });

    // Return the altered config
    return config;
  },
};
