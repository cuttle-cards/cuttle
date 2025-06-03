import { createApp } from 'vue';
import { createPinia } from 'pinia';
import i18n from '@/plugins/i18n';
import rollbar from '@/plugins/rollbar';
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import { createHead } from '@unhead/vue';
import { initCuttleGlobals } from '_/utils/config-utils';
import App from '@/App.vue';

const pinia = createPinia();

const app = createApp(App);

// Create global head instance
const head = createHead();

// Add rollbar to vue
if (import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN) {
  // TODO #1129 - re-enable rollbar when it doesn't crash the tab
  app.use(rollbar);
}

// Add router to vue
app.use(router);

// Add vuetify to vue
app.use(vuetify);

// Add pinia store to vue
app.use(pinia);

// Add localization to vue
app.use(i18n);

// Add Cuttle window object
initCuttleGlobals(app);

// Add unHead to vue
app.use(head);

app.mount('#app');
