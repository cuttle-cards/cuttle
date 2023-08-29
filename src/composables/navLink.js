import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import {
  ROUTE_NAME_HOME,
  ROUTE_NAME_LOGIN,
  ROUTE_NAME_RULES,
  ROUTE_NAME_STATS,
  ROUTE_NAME_LOGOUT
} from '@/router.js';

export default function usePageLinks() {
  const store = useStore();
  const { t } = useI18n();

  const pageLinks = computed(() => {
    const {authenticated} = store.state.auth;
    if (!authenticated) {
      return [
        { text: t('global.login'), icon: 'login', page: { name: ROUTE_NAME_LOGIN } },
        { text: t('global.rules'), icon: 'information', page: { name: ROUTE_NAME_RULES } },
      ];
    } 
      return [
        { text: t('global.play'), icon: 'play', page: { name: ROUTE_NAME_HOME } },
        { text: t('global.stats'), icon: 'chart-bar', page: { name: ROUTE_NAME_STATS } },
        { text: t('global.rules'), icon: 'information', page: { name: ROUTE_NAME_RULES } },
      ];
    
  });

  const menuItems = [{ text: t('global.logout'), icon: 'logout', page: { name: ROUTE_NAME_LOGOUT } },];

  return { pageLinks, menuItems };
}
