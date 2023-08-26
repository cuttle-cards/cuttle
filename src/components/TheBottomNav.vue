<template>
  <v-bottom-navigation
    v-if="isSmallDevice"
    bg-color="primary"
    :elevation="0"
    grow
  >
    <v-btn
      variant="flat"
      v-for="({ text, icon, page }, i) in pageLinks"
      :key="i"
      :title="text"
      :to="page"
    >
      <v-icon>{{`mdi-${icon}`}}</v-icon>
      {{ text }}
    </v-btn>
  </v-bottom-navigation>
</template>

<script>
import { useI18n } from 'vue-i18n';

import {
  ROUTE_NAME_HOME,
  ROUTE_NAME_LOGIN,
  ROUTE_NAME_RULES,
  ROUTE_NAME_STATS,
} from '@/router.js';


export default {
name: 'TheBottomNav',
  setup() {
    // Vuetify has its own translation layer that isn't very good
    // It seems to conflict with the namespace of vue-i18n so we need to import it at the component
    // level and utilize it this way with a composable. There may be another more global way but
    // I haven't found anything just yet
    const { t } = useI18n();
    return { t };
  },
    computed: {
    authenticated() {
      return this.$store.state.auth.authenticated;
    },
    pageLinks() {
      const rules = [
        {
          text: this.t('global.rules'),
          icon: 'information',
          page: { name: ROUTE_NAME_RULES },
        },
      ];
      return !this.authenticated
        ? [
            {
              text: this.t('global.login'),
              icon: 'login',
              page: { name: ROUTE_NAME_LOGIN },
            },
            ...rules,
          ]
        : [
          { text: this.t('global.play'), icon: 'play', page: { name: ROUTE_NAME_HOME } },
          { text: this.t('global.stats'), icon: 'chart-bar', page: { name: ROUTE_NAME_STATS } },
            ...rules,
          ];
    },
    isSmallDevice() {
      return this.$vuetify.display.smAndDown;
    },
  },
};
</script>
