import Vue from 'vue';
import Vuetify from 'vuetify';
import { options } from '~plugins/vuetify';
import 'vuetify/dist/vuetify.min.css';
import './storybook.css';

Vue.use(Vuetify);

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

export const decorators = [
  (story, context) => {
    const vuetify = new Vuetify(options);
    const wrapped = story(context);

    return Vue.extend({
      vuetify,
      components: { wrapped },
      // props: {},
      // watch: {},
      template: `
      <v-app class="sb-app">
          <wrapped/>
      </v-app>
      `,
    });
  },
];
