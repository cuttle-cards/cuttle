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
      username: 'Username',
      password: 'Password',
      collapseMenu: 'Collapse Menu',
    },
    login: {
      noAccount: `Don't have an account?`,
      haveAccount: `Already have an account?`,
      title: 'What is Cuttle?',
      quote: '"Cuttle is a sharp, fast game built entirely on excellent mechanics. It is the sort of game - had I known about it in college - I would have worn decks ragged through play."',
      quoteCite: 'Richard Garfield - Creator of Magic: The Gathering',
      paragraph1: `Cuttle is a 2 player battle card game played with a standard 52-card deck of cards. It has the strategic nuance of trading card games like Magic, with the elegant balance of a standard deck--and you can play it for free! Test your mettle in the deepest cardgame under the sea!`,
      paragraph2: `Be the first to score 21 points in this explosive battle of wits. Mount a valiant offense while disrupting your opponent with dastardly tricks. Do you have what it takes to become the Lord of the Deep?`,
      learnRules: 'Learn the Rules',
    },
  },
  es: {
    global: {
      signup: 'Registrarse',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      rules: 'Reglas',
      play: 'Jugar',
      stats: 'Estadísticas',
      username: 'Usuario',
      password: 'Contraseña',
      collapseMenu: 'Contraer Menú',
    },
    login: {
      noAccount: '¿No tienes una cuenta?',
      haveAccount: '¿Ya tienes una cuenta?',
      title: '¿Qué es Cuttle?',
      quote: '"Cuttle es un juego rápido y afilado construido completamente sobre excelentes mecánicas. Es el tipo de juego - si lo hubiera conocido en la universidad - que habría desgastado barajas a través del juego."',
      quoteCite: 'Richard Garfield - Creador de Magic: The Gathering',
      paragraph1: `"Cuttle es un juego de cartas de batalla para 2 jugadores que se juega con un mazo estándar de 52 cartas. Tiene la sutileza estratégica de los juegos de cartas coleccionables como Magic, con el equilibrio elegante de un mazo estándar, ¡y puedes jugarlo gratis! ¡Pon a prueba tu temple en el juego de cartas más profundo bajo el mar!`,
      paragraph2: `¡Sé el primero en alcanzar 21 puntos en esta explosiva batalla de ingenio! Monta una valiente ofensiva mientras perturbas a tu oponente con trucos perversos. ¿Tienes lo necesario para convertirte en el Señor de las Profundidades?"`,
      learnRules: 'Aprende las Reglas',
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
