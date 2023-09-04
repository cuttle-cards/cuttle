<template>
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
          class="ma-md-auto"
        />
      </div>
    </v-toolbar-title>
    <v-toolbar-items v-if="!mobile" class="hidden-xs-only">
      <v-tabs class="pa-2">
        <v-tab
          variant="text"
          v-for="({ text, icon, page }, i) in pageLinks"
          :data-cy="text"
          :key="i"
          :title="text"
          :to="page"
        >
          <v-icon
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

</template>

<script setup>
import { getPageLinks } from '@/composables/navLink.js';
import TheUserMenu from './TheUserMenu.vue';
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay();
const pageLinks = getPageLinks();
</script>
