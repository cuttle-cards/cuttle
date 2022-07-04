import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import store from './store/store';
import router from './router';

Vue.config.productionTip = process.env.CUTTLE_ENV === 'production';

const app = new Vue({
  vuetify,
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');

// Expose app for testing
// TODO: Think through this, move to relevant location (post Vue 3 since it changes the TS implementation)
interface CuttleWindow extends Window {
  Cypress: any;
  app: any;
}
declare let window: CuttleWindow;

if (window.Cypress) {
  window.app = app;
}
