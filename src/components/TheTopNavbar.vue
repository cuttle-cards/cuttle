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
    <v-toolbar-items v-if="!isSmallDevice" class="hidden-xs-only">
      <v-tabs class="pa-2">
        <v-tab
          variant="text"
          v-for="({ text, icon, page }, i) in pageLinks"
          :data-cy="text"
          :key="i"
          :title="text"
          :to="page"
        >
          <v-icon :icon="`mdi-${icon}`" />
          {{ text }}
        </v-tab>
      </v-tabs>
    </v-toolbar-items>
  </v-toolbar>

</template>

<script>
import { getPageLinks } from '../composables/navLink.js';
import TheUserMenu from '../components/TheUserMenu.vue';

export default {
name: 'TheTopNavbar',
  components: {
    TheUserMenu
  },
  props: {
    isSmallDevice: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const pageLinks = getPageLinks();
    return { pageLinks };
  },
};
</script>
