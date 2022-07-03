import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import store from './store/store';
import router from './router';
Vue.config.productionTip = false;

// TODO: Think through this, move to relevant location (post Vue 3 since it changes the TS implementation)
interface CuttleWindow extends Window {
  Cypress: Object;
  app: Object;
}
declare let window: CuttleWindow;

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
