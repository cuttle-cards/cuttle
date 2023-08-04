// https://vue-i18n.intlify.dev/

import { createI18n } from 'vue-i18n';

// TODO we should lazyload non global translations on a per page basis
// https://vue-i18n.intlify.dev/guide/advanced/lazy.html
import en from '@/translations/en.json';
// import es from '@/translations/es.json';
// import fr from '@/translations/fr.json';

const messages = {
 en,
//  es,
//  fr,
};

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  // https://vue-i18n.intlify.dev/guide/essentials/fallback.html
  fallbackLocale: 'en',
  messages,
});

export default i18n;
