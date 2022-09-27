import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
// import store from './store/store';
// import router from './router';
Vue.config.productionTip = false;

const app = new Vue({
  vuetify,
  // store,
  // router,
  render: (h) => h(App),
}).$mount('#app');

// Expose app for testing
if (import.meta.env.NODE_ENV === 'development' || window.Cypress) {
  window.cuttle = {
    app,
  };
}
