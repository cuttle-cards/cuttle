<template>
  <v-list-item
    v-if="format === 'listItem'"
    data-cy="full-screen-list-item"
    class="full-screen-list-item"
    :prepend-icon="fullScreenState.icon"
    :title="fullScreenState.text"
    @click="toggleFullScreen"
  />

  <button 
    v-if="format === 'iconButton'"
    
    class="full-screen-button" 
    @click="toggleFullScreen"
  >
    <v-icon
      data-cy="full-screen-icon-button"
      :class="{ 'dimmed': dimmed }"
      size="large"
      :icon="fullScreenState.icon"
      aria-hidden="true"
    />
  </button>
</template>

<script setup>
import { useFullScreen } from '@/composables/fullScreen.js';
import { onMounted } from 'vue';

defineProps({
  format: {
      type: String,
      default: 'listItem',
    },
  dimmed: {
      type: Boolean,
      default: false,
    },
});

const { fullScreenState, toggleFullScreen } = useFullScreen();

let doc = null;
onMounted(() => {
  doc = document.getElementById('app');
  doc.addEventListener('click', () => {
    console.log(fullScreenState.value);
  });
});
</script>


<style scoped>
.dimmed {
  opacity: var(--v-medium-emphasis-opacity);
}
.r {
  border: 1px solid red;
}
</style>
