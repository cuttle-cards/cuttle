<template>
  <header>
    <v-toolbar data-cy="nav-drawer" :color="theme === 'light' ? 'surface-2' : 'surface-1'">
      <v-toolbar-title>
        <div class="d-flex flex-md-row flex-row-reverse align-center justify-space-between" style="cursor: pointer">
          <TheUserMenu :theme="theme" />
          <img
            v-if="theme === 'light'"
            id="logo"
            alt="Cuttle logo"
            src="/img/cuttle_logo_text_brown.svg"
            width="60"
            height="60"
            class="ma-md-auto"
          >
          <img
            v-else
            id="logo"
            alt="Cuttle logo"
            src="/img/cuttle_logo_text_white.svg"
            width="60"
            height="60"
            class="ma-md-auto"
          >
        </div>
      </v-toolbar-title>
      <v-toolbar-items v-if="!mobile" class="hidden-xs-only">
        <v-tabs class="pa-2">
          <v-tab
            v-for="({ text, icon, page, cyName }, i) in pageLinks"
            :key="i"
            :class="tabColor(page.name)"
            variant="text"
            :data-cy="cyName"
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
import { ref, toRefs, watch } from 'vue';

const props = defineProps({
  theme:{
      type:String,
      default:'light'
    }
});

const route = useRoute();
const { theme } = toRefs(props);
const { mobile } = useDisplay();
const pageLinks = getPageLinks();
const linkColor = ref(theme.value === 'light' ? 'text-surface-1' : 'text-surface-2');

const tabColor = (page) => {
  return route.name === page ? 'text-newPrimary' : linkColor.value;
};

watch(theme, (newValue) => {
  console.log(newValue);
  linkColor.value = newValue === 'light' ? 'text-surface-1' : 'text-surface-2';
});
</script>
