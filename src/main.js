import { createApp } from 'vue';
import { createPinia } from 'pinia';
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import i18n from '@/i18n';
import { initCuttleGlobals } from '_/utils/config-utils';
import App from '@/App.vue';
const pinia = createPinia();

const app = createApp(App);
// Add router to vue
app.use(router);

// Add vuetify to vue
app.use(vuetify);

// Add pinia store to vue
app.use(pinia);

// Add localization to vue
app.use(i18n);

// Add Cuttle window object
await initCuttleGlobals(app);

app.mount('#app');
