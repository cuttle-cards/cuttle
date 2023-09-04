<template>
  <v-bottom-navigation
    bg-color="primary"
    :elevation="0"
    grow
  >
    <v-btn
      variant="text"
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

<script setup>
import { getPageLinks } from '@/composables/navLink.js';

const pageLinks = getPageLinks();
</script>
