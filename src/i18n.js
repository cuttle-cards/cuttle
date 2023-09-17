// https://vue-i18n.intlify.dev/

import { createI18n } from 'vue-i18n';

// TODO we should lazyload non global translations on a per page basis
// https://vue-i18n.intlify.dev/guide/advanced/lazy.html
import English from '@/translations/en.json';
import Español from '@/translations/es.json';
import Française from '@/translations/fr.json';

const messages = {
 English,
 Español,
 Française,
};

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'English',
  // https://vue-i18n.intlify.dev/guide/essentials/fallback.html
  fallbackLocale: 'English',
  messages,
});

export default i18n;
