/* eslint-disable no-undef */
import devtools from '@vue/devtools'
import { createApp } from 'vue';

import store from '@/store/store';
import router from '@/router';
import vuetify from '@/plugins/vuetify';

import App from '@/App.vue';


const app = createApp(App);

// Add router to vue
app.use(router);

// Add vuetify to vue
app.use(vuetify);

// Add vuex store to vue
app.use(store);

app.mount('#app');

////////////////////////
// Development Config //
////////////////////////

if (!import.meta.env.PROD || window.Cypress) {
  // Expose app for debugging/testing
  window.cuttle = {
    app,
  };
}

if (!import.meta.env.PROD) {
  // Connect the devtools -- non-prod only
  devtools.connect(null, 8098);
}
