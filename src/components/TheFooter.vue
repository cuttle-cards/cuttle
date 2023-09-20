<template>
  <footer>
    <v-bottom-navigation
      :bg-color="navToggle.isHomeView ? 'surface-2' : 'surface-1'"
      :elevation="0"
      grow
    >
      <v-btn
        v-for="({ text, icon, page }, i) in pageLinks"
        :key="i"
        variant="text"
        :class="[navToggle.isHomeView ? 'text-surface-1' : 'text-surface-2']"
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
import { toRefs } from 'vue';

const props = defineProps({
  navToggle:{
    isHomeView: {
    type: Boolean,
    default: true
  },
    linkColor: {
      type: String,
      default: 'text-surface-1'
    }
  }
})

const pageLinks = getPageLinks();
</script>
