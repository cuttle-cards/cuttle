<template>
  <footer>
    <v-bottom-navigation
      bg-color="surface-2"
      :elevation="0"
      grow
    >
      <v-btn
        v-for="({ text, icon, page }, i) in pageLinks"
        :key="i"
        variant="text"
        class="text-surface-1"
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
      </v-btn>
    </v-bottom-navigation>
  </footer>
</template>

<script setup>
import { getPageLinks } from '@/composables/navLink.js';

const pageLinks = getPageLinks();
</script>
