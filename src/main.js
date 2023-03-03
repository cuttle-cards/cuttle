import { createApp } from 'vue';

import vuetify from '@/plugins/vuetify';
import router from '@/router';
import store from '@/store/store';
import { initCuttleGlobals } from '_/utils/config-utils';

import App from '@/App.vue';


const app = createApp(App);

// Add router to vue
app.use(router);

// Add vuetify to vue
app.use(vuetify);

// Add vuex store to vue
app.use(store);

app.mount('#app');

// Add Cuttle window object
initCuttleGlobals(app);
