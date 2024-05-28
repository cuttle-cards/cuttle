<template>
  <div v-scroll="onScroll">
    <v-btn
      v-if="show"
      position="fixed"
      color="surface-2"
      elevation="8"
      icon="mdi-chevron-up"
      size="large"
      @click="onClick"
    />
  </div>
</template>

<script>
import { ref, onMounted   } from 'vue';


export default {
  name:'BackToTop',
  props: {
    isInModal : {
    type :Boolean,
    default: false
    },
  },  
  setup(props) {
      const show = ref(false);
      const onScrollModal = () => {
        const scrollTopValue = document.getElementById('rulesDialog').scrollTop;
        show.value = scrollTopValue > 200;
      };
      onMounted(() => {
        if (props.isInModal && document.getElementById('rulesDialog')) {
          document.getElementById('rulesDialog').addEventListener('scroll', onScrollModal);
        }
      });
      return {
        show
      };
    },
  methods: {
    onScroll() {
      const scrollTopValue =  window.scrollY ;
      this.show = scrollTopValue > 200;
    },
    onClick() {
      const targetSchroll = this.isInModal? document.getElementById('rulesDialog') : window ;
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
  right :32px;
  bottom:0;
}
</style>
