// https://vue-i18n.intlify.dev/

import VueI18n from 'vue-i18n';

const messages = {
  en: {
    global: {
      signup: 'Sign Up',
      login: 'Log In',
      logout: 'Log Out',
      rules: 'Rules',
      play: 'Play',
      stats: 'Stats',
    },
  },
};

const i18n = VueI18n.createI18n({
  locale: 'en',
  messages,
});

export default i18n;
