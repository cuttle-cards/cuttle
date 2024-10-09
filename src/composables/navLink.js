import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import {
  ROUTE_NAME_HOME,
  ROUTE_NAME_RULES,
  ROUTE_NAME_STATS,
} from '@/router.js';

export function getPageLinks() {
  const authStore = useAuthStore();
  const { t } = useI18n();

  return computed(() => {
    const { authenticated } = authStore;
    return authenticated ?
      [
        { text: t('global.play'), icon: 'play', page: { name: ROUTE_NAME_HOME }, cyName: 'Play' },
        { text: t('global.stats'), icon: 'chart-bar', page: { name: ROUTE_NAME_STATS }, cyName: 'Stats' },
        { text: t('global.rules'), icon: 'information', page: { name: ROUTE_NAME_RULES }, cyName: 'About' },
      ] : [];
  });
}


