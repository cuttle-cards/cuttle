/* eslint-disable no-unused-vars */
const path = require('path');

// https://storybook.js.org/docs/vue/configure/overview#configure-your-storybook-project
module.exports = {
  stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/vue',
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Add our client alias, this should match what's in vue.config.js
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../client/js'),
    };

    // Add sass loader
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        require.resolve('vue-style-loader'),
        require.resolve('css-loader'),
        require.resolve('sass-loader'),
      ],
    });

    return config;
  },
};
