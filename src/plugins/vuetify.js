import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

const cuttleTheme = {
  dark: false,
  colors: {
    // Standard UI colors
    primary: '#E1306C',
    secondary: '#FD6222',
    accent: '#219653',
    'accent-lighten1': '#43b16c',
    disabled: '#ACACAC',
    anchor: '#4dd0e1',

    // Muted UI colors
    neutral: '#A3ADB5',
    'neutral-lighten2': '#E6E9EB',
    'neutral-darken2': '#607280',

    // Game mode colors
    casual: '#5865F2',

    // Game surface colors
    'game-board': '#4A2416',
    'game-card': '#FFF4D7',

    // Game state colors
    frozen: '#00a5ff',
    forfeit: '#FAAB34',

    // Ranking colors
    firstPlace: '#AF9500',
    secondPlace: '#636361',
    thirdPlace: '#6A3805',
  },
};

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'cuttleTheme',
    themes: {
      cuttleTheme,
    },
  },
});
