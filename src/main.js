/* eslint-disable no-undef */

import { createApp } from 'vue';

// import store from './store/store';

import App from './App.vue';

// import vuetify from './plugins/vuetify';
// import router from './router';

// const app = new Vue({
//   // vuetify,
//   // store,
//   // router,
//   render: (h) => h(App),
// }).$mount('#app');

const app = createApp(App);

// Add vuex store to vue
// app.use(store);

app.mount('#app');

// Expose app for debugging/testing
window.cuttle = {
  app,
};
