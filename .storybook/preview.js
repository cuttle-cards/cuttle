import vuetifyConfig from '../client/js/plugins/vuetify';
import { addDecorator } from '@storybook/vue';
import { VApp, VMain, VContainer } from 'vuetify/lib';

// https://storybook.js.org/docs/vue/configure/overview#configure-story-rendering
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

addDecorator(() => ({
  vuetify: vuetifyConfig,
  components: { VApp, VMain, VContainer },
  template: `
    <v-app>
        <story/>
    </v-app>
    `,
}));
