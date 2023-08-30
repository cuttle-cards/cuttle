<template>
  <v-toolbar data-cy="nav-drawer" color="primary">
    <v-toolbar-title>
      <div class="d-flex flex-md-row flex-row-reverse align-center justify-space-between" style="cursor: pointer">
        <v-menu  transition="slide-x-transition">
          <template #activator="{ props }">
            <v-btn
              data-cy="user-menu"
              class="hidden-xs-only d-flex text-body-1"
              v-bind="props"
              variant="text"
            >
              <v-icon icon="mdi-account-circle" />
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
              exact
              :data-nav="text"
            />
          </v-list>
        </v-menu>
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

import usePageLinks from '../composables/navLink.js';

export default {
name: 'TheTopNavbar',
props: {
    isSmallDevice: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const { pageLinks, menuItems } = usePageLinks();
    return { pageLinks, menuItems };
  },
};
</script>
