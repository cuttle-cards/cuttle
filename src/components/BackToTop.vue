<template>
  <div v-scroll:[parentModalId]="onScroll">
    <v-btn
      v-if="show"
      position="fixed"
      color="surface-2"
      class="fab"
      elevation="8"
      icon="mdi-chevron-up"
      size="large"
      @click="onClick"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const show = ref(false);

const props = defineProps({
  parentModalId: {
    type: String,
    default: '',
    required: false
  },
});
function onScroll(e) {
  const scrollTopValue = props.parentModalId ? e.target.scrollTop : window.scrollY;
  show.value = scrollTopValue > 200;
}

function onClick() {
  const scrollTarget = props.parentModalId ? document.querySelector(props.parentModalId) : window;
  scrollTarget.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
</script>

<style scoped>
.fab {
  margin: auto 8px 64px 8px;
  z-index: 1;
  right: 24px;
  bottom: 0;
}
@media (max-width: 600px) {
  .fab {
    right: 16px;
  }
}
</style>
