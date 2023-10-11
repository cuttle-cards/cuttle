/** @type { import('@storybook/vue3').Preview } */
import { setup } from "@storybook/vue3";
import vuetify from "../src/plugins/vuetify";

setup((app) => {
  // Registers your app's plugins into Storybook
  app.use(vuetify);
});

const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
