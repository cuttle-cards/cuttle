<template>
  <header>
    <v-toolbar data-cy="nav-drawer" color="primary">
      <v-toolbar-title>
        <div class="d-flex flex-md-row flex-row-reverse align-center justify-space-between" style="cursor: pointer">
          <TheUserMenu />
          <img
            id="logo"
            alt="Cuttle logo"
            src="/img/cuttle_logo_text_white.svg"
            width="60"
            height="60"
            class="ma-md-auto desktop-logo"
          >
        </div>
      </v-toolbar-title>
      <v-toolbar-items v-if="!mobile" class="hidden-xs-only">
        <v-tabs class="pa-2">
          <v-tab
            v-for="({ text, icon, page, cyName }, i) in pageLinks"
            :key="i"
            variant="text"
            :data-cy="cyName"
            :title="text"
            :to="page"
          >
            <v-icon
              class="mr-1"
              :icon="`mdi-${icon}`"
              :aria-label="text"
              aria-hidden="false"
              role="img"
            />
            {{ text }}
          </v-tab>
        </v-tabs>
      </v-toolbar-items>
    </v-toolbar>
  </header>
</template>

<script setup>
import { getPageLinks } from '@/composables/navLink.js';
import TheUserMenu from './TheUserMenu.vue';
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay();
const pageLinks = getPageLinks();
</script>

<style scoped>
@media screen and (min-width: 960px) {
  .desktop-logo {
    position: absolute;
    left: calc(50% - 60px);
  }
}
</style>>