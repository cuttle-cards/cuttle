import { addons } from '@storybook/addons';

import theme from './theme/cuttle';

addons.setConfig({
  theme,
  // For available options, see https://storybook.js.org/docs/configurations/options-parameter/
  panelPosition: 'right',
  enableShortcuts: false,
});
