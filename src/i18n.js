// https://vue-i18n.intlify.dev/

import { createI18n } from 'vue-i18n';

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
  es: {
    global: {
      signup: 'Registrarse',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      rules: 'Reglas',
      play: 'Jugar',
      stats: 'Estadísticas'
    },
  },
};

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  messages,
});

export default i18n;
