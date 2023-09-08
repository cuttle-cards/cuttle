<template>
  <header>
    <v-toolbar data-cy="nav-drawer" color="surface-2">
      <v-toolbar-title>
        <div class="d-flex flex-md-row flex-row-reverse align-center justify-space-between" style="cursor: pointer">
          <TheUserMenu />
          <img
            id="logo"
            alt="Cuttle logo"
            src="/img/cuttle_logo_text_brown.svg"
            width="60"
            height="60"
            class="ma-md-auto"
          >
        </div>
      </v-toolbar-title>
      <v-toolbar-items v-if="!mobile" class="hidden-xs-only">
        <v-tabs class="pa-2">
          <v-tab
            v-for="({ text, icon, page }, i) in pageLinks"
            :key="i"
            :class="isActiveTab(page.name)"
            variant="text"
            :data-cy="text"
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
  </header>
</template>

<script setup>
import { getPageLinks } from '@/composables/navLink.js';
import TheUserMenu from './TheUserMenu.vue';
import { useDisplay } from 'vuetify';
import { useRoute } from 'vue-router';

const route = useRoute();
const { mobile } = useDisplay();
const pageLinks = getPageLinks();

function isActiveTab(page) {
  return route.name === page ? 'text-newPrimary' : 'text-surface-1';
}

</script>
