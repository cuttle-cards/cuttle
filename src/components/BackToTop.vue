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

<script>

import { ref } from 'vue';


export default {
  name:'BackToTop',
  props: {
    targetId: {
      type: String,
      default: '',
      required: false
    },
  },
  data: () => ({
    show : ref(false),
  }),
  methods: {
    onScroll(e) {
      const scrollTopValue = !!this.targetId ? e.target.scrollTop : window.scrollY ;
      this.show = scrollTopValue > 200;
    },
    onClick() {
      const targetSchroll = !!this.targetId ? document.getElementById('rulesDialog') : window 
      targetSchroll.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }
};
</script>

<style scoped>
button {
  margin: auto 8px 64px 8px;
  z-index: 1;
  right :32px;
  bottom:0;
}
</style>
