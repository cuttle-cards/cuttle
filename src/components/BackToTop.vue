<template>
  <v-btn
    v-show="model"
    v-scroll="onScroll"
    position="fixed"
    location="bottom right"
    class="mt-auto pointer-events-initial ma-4"
    color="surface-2"
    elevation="8"
    icon="mdi-chevron-up"
    size="large"
    @click="onClick"
  />
</template>

<script setup>
import { ref } from 'vue';

const model = ref(false);

function onScroll() {
  model.value = window.scrollY > 200;
}

function onClick() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
</script>

<style scoped>
.pointer-events-none {
  pointer-events: none;
}

.pointer-events-initial {
  pointer-events: initial;
}
</style>
