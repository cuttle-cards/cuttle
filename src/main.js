/* eslint-disable no-undef */

import { createApp } from 'vue';

import store from '@/store/store';
import router from '@/router';
import vuetify from '@/plugins/vuetify';

import App from '@/App.vue';

// const app = new Vue({
//   // vuetify,
//   // store,
//   // router,
//   render: (h) => h(App),
// }).$mount('#app');

const app = createApp(App);

// Add router to vue
app.use(router);

// Add vuetify to vue
app.use(vuetify);

// Add vuex store to vue
app.use(store);

app.mount('#app');

// Expose app for debugging/testing
window.cuttle = {
  app,
};
