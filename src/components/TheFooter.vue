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
import { getPageLinks } from '@/composables/navLink.js';
import { useRoute } from 'vue-router';
import { computed, toRefs } from 'vue';

const props = defineProps({
  variant:{
    type:String,
    default:'light'
  }
});

const route = useRoute();
const { variant } = toRefs(props);
const pageLinks = getPageLinks();
const linkColor = computed(() => variant.value === 'light' ? 'text-surface-1' : 'text-surface-2');

const tabColor = (page) => {
  return route.name === page ? 'text-newPrimary' : linkColor.value;
};

</script>
