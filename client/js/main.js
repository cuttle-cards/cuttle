import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import store from './store/store';
import router from './router';
Vue.config.productionTip = false;

async function initApp() {
  // Make sure we try and reestablish a user's session if one exists
  // We do this before the app mounts to preempt the reauth/logout logic
  await store.dispatch('requestStatus');

  const app = new Vue({
    vuetify,
    store,
    router,
    render: (h) => h(App),
  }).$mount('#app');

  // Expose app for testing
  if (window.Cypress) {
    window.app = app;
  }
}

initApp();
