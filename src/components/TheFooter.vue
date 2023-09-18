<template>
  <footer>
    <v-bottom-navigation
      bg-color="primary"
      :elevation="0"
      grow
    >
      <v-btn
        v-for="({ text, icon, page, cy_name }, i) in pageLinks"
        :key="i"
        variant="text"
        :data-cy="cy_name"
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
