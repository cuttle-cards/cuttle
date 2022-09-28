import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// TODO figure out where to put theme stuff
// const options = {
//   theme: {
//     options: { customProperties: true },
//     themes: {
//       light: {
//         primary: '#6202EE',
//         secondary: '#FD6222',
//         accent: '#219653',
//         firstPlace: '#AF9500',
//         secondPlace: '#B4B4B4',
//         thirdPlace: '#6A3805',
//         neutral: {
//           lighten5: '#FAFBFC',
//           lighten4: '#FAFAFA',
//           lighten3: '#F2F4F5',
//           lighten2: '#E6E9EB',
//           lighten1: '#CDD1D4',
//           base: '#A3ADB5',
//           darken1: '#7D8C97',
//           darken2: '#607280',
//           darken3: '#3D505E',
//           darken4: '#2A3740',
//         },
//       },
//     },
//   },
// };

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});
