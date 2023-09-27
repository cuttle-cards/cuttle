<template>
  <footer>
    <v-bottom-navigation
      :bg-color="variant === 'light' ? 'surface-2' : 'surface-1'"
      :elevation="0"
      grow
    >
      <v-btn
        v-for="({ text, icon, page, cyName }, i) in pageLinks"
        :key="i"
        variant="text"
        :class="[variant === 'light' ? 'text-surface-1' : 'text-surface-2']"
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
import { getPageLinks } from '@/composables/navLink.js';

defineProps({
  variant:{
      type:String,
      default:'light'
    }
});

const pageLinks = getPageLinks();
</script>
