import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import {
  ROUTE_NAME_HOME,
  ROUTE_NAME_LOGIN,
  ROUTE_NAME_RULES,
  ROUTE_NAME_STATS,
} from '@/router.js';

export function getPageLinks() {
  const store = useStore();
  const { t } = useI18n();

  return computed(() => {
    const { authenticated } = store.state.auth;
    if (!authenticated) {
      return [
        { text: t('global.login'), icon: 'login', page: { name: ROUTE_NAME_LOGIN }, 'cy_name': 'Log In' },
        { text: t('global.rules'), icon: 'information', page: { name: ROUTE_NAME_RULES }, 'cy_name': 'About' },
      ];
    } 
    return [
      { text: t('global.play'), icon: 'play', page: { name: ROUTE_NAME_HOME }, 'cy_name': 'Play' },
      { text: t('global.stats'), icon: 'chart-bar', page: { name: ROUTE_NAME_STATS }, 'cy_name': 'Stats' },
      { text: t('global.rules'), icon: 'information', page: { name: ROUTE_NAME_RULES }, 'cy_name': 'About' },
    ];
  });
}


