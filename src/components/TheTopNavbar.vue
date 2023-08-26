<template>
    <v-toolbar data-cy="nav-drawer" color="primary">
      <v-toolbar-title>
        <div class="d-flex flex-md-row flex-row-reverse align-center justify-space-between" style="cursor: pointer">
        <v-menu  transition="slide-x-transition">
      <template v-slot:activator="{ props }">
        <v-btn
        class="hidden-xs-only d-flex text-body-1"
          v-bind="props"
        >
           <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 42 42" fill="none">
              <path d="M21 33.6C16.625 33.6 12.7575 31.36 10.5 28C10.5525 24.5 17.5 22.575 21 22.575C24.5 22.575 31.4475 24.5 31.5 28C29.2425 31.36 25.375 33.6 21 33.6ZM21 8.75C22.3924 8.75 23.7277 9.30312 24.7123 10.2877C25.6969 11.2723 26.25 12.6076 26.25 14C26.25 15.3924 25.6969 16.7277 24.7123 17.7123C23.7277 18.6969 22.3924 19.25 21 19.25C19.6076 19.25 18.2723 18.6969 17.2877 17.7123C16.3031 16.7277 15.75 15.3924 15.75 14C15.75 12.6076 16.3031 11.2723 17.2877 10.2877C18.2723 9.30312 19.6076 8.75 21 8.75ZM21 3.5C18.7019 3.5 16.4262 3.95265 14.303 4.83211C12.1798 5.71157 10.2507 7.00061 8.62563 8.62563C5.34374 11.9075 3.5 16.3587 3.5 21C3.5 25.6413 5.34374 30.0925 8.62563 33.3744C10.2507 34.9994 12.1798 36.2884 14.303 37.1679C16.4262 38.0474 18.7019 38.5 21 38.5C25.6413 38.5 30.0925 36.6563 33.3744 33.3744C36.6563 30.0925 38.5 25.6413 38.5 21C38.5 11.3225 30.625 3.5 21 3.5Z" fill="white"/>
            </svg>
            {{$store.state.auth.username}}
        </v-btn>
      </template>
      <v-list density="compact" class="bg-surface-2 text-surface-1">
      <v-list-item
        v-for="({ text, icon, page }, i) in menuItems"
        :key="i"
        :prepend-icon="`mdi-${icon}`"
        :title="text"
        :to="page"
        exact="/page"
        :data-nav="text"
      />
    </v-list>
    </v-menu>
        <img
          id="logo"
          alt="Cuttle logo"
          src="/public/img/cullteLogo.svg"
          width="60"
          height="60"
          class="ma-md-auto"
        />
        </div>
      </v-toolbar-title>
      <v-toolbar-items v-if="!isSmallDevice" class="hidden-xs-only">
        <v-btn
          flat
          v-for="({ text, icon, page }, i) in pageLinks"
          :key="i"
          :title="text"
          :to="page"
          >
          <v-icon>{{`mdi-${icon}`}}</v-icon>
          {{ text }}
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
<v-bottom-navigation v-if="isSmallDevice" bg-color="primary" :elevation="0" grow>
        <v-btn
          flat
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
  ROUTE_NAME_LOGOUT,
  ROUTE_NAME_RULES,
  ROUTE_NAME_STATS,
} from '@/router.js';


export default {
name: 'TheTopNavbar',
  setup() {
    // Vuetify has its own translation layer that isn't very good
    // It seems to conflict with the namespace of vue-i18n so we need to import it at the component
    // level and utilize it this way with a composable. There may be another more global way but
    // I haven't found anything just yet
    const { t } = useI18n();
    return { t };
  },
  data(){
    return {
      menuItems: [
          { text: this.t('global.logout'), icon: 'logout', page: { name: ROUTE_NAME_LOGOUT } },
     ]
    }
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
