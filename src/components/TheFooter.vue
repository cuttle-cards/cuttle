<template>
  <footer>
    <v-bottom-navigation
      bg-color="surface-2"
      :elevation="0"
      grow
    >
      <v-btn
        v-for="({ text, icon, page, cyName }, i) in pageLinks"
        :key="i"
        variant="text"
        :class="tabColor(page.name)"
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
      </v-btn>
    </v-bottom-navigation>
  </footer>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { getPageLinks } from '@/composables/navLink.js';


const route = useRoute();
const pageLinks = getPageLinks();

const tabColor = (page) => {
  return route.name === page ? 'text-primary' : 'text-surface-1';
};

</script>
