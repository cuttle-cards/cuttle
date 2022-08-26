import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import store from './store/store';
import router from './router';
Vue.config.productionTip = false;

async function initApp() {
  // Make sure we try and reestablish a player's session if one exists
  // We do this before the app mounts to preempt the reauth/logout logic
  try {
    await store.dispatch('requestStatus');
  } catch {
    // Unable to validate player status or player not authenticated
    // Swallow the error to let the player continue
  }

  const app = new Vue({
    vuetify,
    store,
    router,
    render: (h) => h(App),
  }).$mount('#app');

  // Expose app for testing
  if (process.env.NODE_ENV === 'development' || window.Cypress) {
    window.cuttle = {
      app,
    };
  }
}

initApp();
