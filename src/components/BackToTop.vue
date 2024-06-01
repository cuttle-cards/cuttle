<template>
  <div v-scroll:[targetId]="onScroll">
    <v-btn
      v-if="show"
      position="fixed"
      location="bottom right"
      color="surface-2"
      elevation="8"
      icon="mdi-chevron-up"
      size="large"
      @click="onClick"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const show = ref(false)

const props = defineProps({targetId: {
  type: String,
  default: '',
  required: false
}})

function onScroll(e) {
  const scrollTopValue = props.targetId ? e.target.scrollTop : window.scrollY ;
  show.value = scrollTopValue > 200;
}

function onClick() {
  const targetSchroll = props.targetId ? document.getElementById('rulesDialog') : window ;
  targetSchroll.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
</script>

<style scoped>
button {
  margin: auto 8px 64px 8px;
  z-index: 1;
  right: 32px;
  bottom: 0;
}
</style>
