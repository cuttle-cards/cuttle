<template>
  <v-navigation-drawer
    v-if="showNav"
    color="primary"
    data-cy="nav-drawer"
    permanent
    :rail="isCollapsed"
    class="text-body-1"
  >
    <!-- Page Links -->
    <v-list>
      <v-list-item
        v-for="({ text, icon, page }, i) in pageLinks"
        :key="i"
        :prepend-icon="`mdi-${icon}`"
        :title="text"
        :to="page"
        :data-nav="text"
      />
    </v-list>

    <!-- Expand/Collapse -->
    <template #append>
      <v-list v-if="!isSmallDevice">
        <v-list-item
          :prepend-icon="collapseMenuIcon"
          :title="`${!isCollapsed ? $t('global.collapseMenu') : ''}`"
          :data-cy="collapseMenuAttribute"
          @click="userHasCollapsed = !userHasCollapsed"
        />
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { useI18n } from 'vue-i18n';

import {
  ROUTE_NAME_HOME,
  ROUTE_NAME_LOGIN,
  ROUTE_NAME_LOGOUT,
  ROUTE_NAME_RULES,
  ROUTE_NAME_STATS,
} from '@/router.js';

export default {
  name: 'NavigationDrawer',
  setup() {
    // Vuetify has its own translation layer that isn't very good
    // It seems to conflict with the namespace of vue-i18n so we need to import it at the component
    // level and utilize it this way with a composable. There may be another more global way but
    // I haven't found anything just yet
    const { t } = useI18n();
    return { $t: t };
  },
  data() {
    return {
      // User controlls for collapsing only available on desktop
      userHasCollapsed: false,
    };
  },
  computed: {
    authenticated() {
      return this.$store.state.auth.authenticated;
    },
    pageLinks() {
      const rules = [
        {
          text: this.$t('global.rules'),
          icon: 'script-text',
          page: { name: ROUTE_NAME_RULES },
        },
      ];
      return !this.authenticated
        ? [
            {
              text: this.$t('global.login'),
              icon: 'login',
              page: { name: ROUTE_NAME_LOGIN },
            },
            ...rules,
          ]
        : [
            { text: this.$t('global.logout'), icon: 'logout', page: { name: ROUTE_NAME_LOGOUT } },
            ...rules,
            { text: this.$t('global.play'), icon: 'play', page: { name: ROUTE_NAME_HOME } },
            { text: this.$t('global.stats'), icon: 'chart-bar', page: { name: ROUTE_NAME_STATS } },
          ];
    },
    showNav() {
      return this.$route.meta?.hideNavigation !== true;
    },
    isSmallDevice() {
      return this.$vuetify.display.smAndDown;
    },
    isCollapsed() {
      return this.userHasCollapsed || this.isSmallDevice;
    },
    // Expand/Collapse button
    collapseMenuAttribute() {
      return this.userHasCollapsed ? 'expand-nav' : 'collapse-nav';
    },
    collapseMenuIcon() {
      return this.userHasCollapsed ? 'mdi-arrow-right' : 'mdi-arrow-left';
    },
  },
};
</script>
