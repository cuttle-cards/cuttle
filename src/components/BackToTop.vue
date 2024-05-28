<template>
  <div v-if="isModal" v-scroll:#rulesDialog="onScroll">  
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
  <div v-else v-scroll="onScroll">
    <v-btn
      v-if="show"
      position="fixed"
      location="bottom right"
      class="fab"
      color="surface-2"
      elevation="8"
      icon="mdi-chevron-up"
      size="large"
      @click="onClick"
    />
  </div>
</template>

<script>
import { ref  } from 'vue';

export default {
  name:'BackToTop',
  props: {
    isModal : {
    type :Boolean,
    default: false
    },
  },  
  data: () => ({
    show : ref(false),
  }),
  methods: {
    onScroll(e) {
      const scrollTopValue = this.isModal? e.target.scrollTop : window.scrollY ;
      this.show = scrollTopValue > 200;
      console.log(this.show);
    },
    onClick() {
      const targetSchroll = this.isModal? document.getElementById('rulesDialog') : window ;
      targetSchroll.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  },

};
</script>

<style scoped>
button {
  margin: auto 8px 64px 8px;
  z-index: 1;
}
</style>
