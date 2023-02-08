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

// Non-Production config
if (!import.meta.env.PROD) {
  // Expose app for debugging/testing
  if (window.Cypress) {
    window.cuttle = {
      app,
    };
  }
  // Connect the devtools
  devtools.connect(null, 8098);
}

