import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

const cuttleTheme = {
  dark: false,
  colors: {
    primary: '#6202EE',
    secondary: '#FD6222',
    newPrimary: '#E1306C',
    newSecondary: '#5865F2',
    disabled: '#ACACAC',
    accent: '#219653',
    anchor: '#4dd0e1',
    'accent-darken1': '#007b3b',
    'accent-darken2': '#006224',
    'accent-darken3': '#00490d',
    'accent-darken4': '#003100',
    'accent-lighten1': '#43b16c',
    'accent-lighten2': '#61cd85',
    'accent-lighten3': '#7eeaa0',
    'accent-lighten4': '#9affbb',
    'accent-lighten5': '#b7ffd7',
    firstPlace: '#AF9500',
    secondPlace: '#B4B4B4',
    thirdPlace: '#6A3805',
    neutral: '#A3ADB5',
    'neutral-darken1': '#7D8C97',
    'neutral-darken2': '#607280',
    'neutral-darken3': '#3D505E',
    'neutral-darken4': '#2A3740',
    'neutral-lighten1': '#CDD1D4',
    'neutral-lighten2': '#E6E9EB',
    'neutral-lighten3': '#F2F4F5',
    'neutral-lighten4': '#FAFAFA',
    'neutral-lighten5': '#FAFBFC',
    'surface-1': '#4A2416',
    'surface-2': '#FFF4D7',
  },
};

export default createVuetify({
  components: {
    ...components,
  },
  directives,
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
