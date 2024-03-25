import { createApp } from 'vue';

import App from '@/App.vue';
import { i18nConfig } from '@/config/i18n-config';

import router from './router';

const app = createApp(App);
app.use(router);
app.use(i18nConfig);
app.mount('#app');
