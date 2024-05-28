<template>
  <div v-if="isModal" v-scroll:#rulesDialog="onScroll">  
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
import { ref } from 'vue';


export default {
  props: {isModal : {
    type :Boolean,
    default: false
    }
  },
  data: () => ({
    show : ref(false),
  }),
  methods: {
    onScroll(e) {
      const scrollTopValue = this.isModal? e.target.scrollTop : window.scrollY ;
      this.show = scrollTopValue > 200;
    },
    onClick() {
      const targetSchroll = this.isModal? document.getElementById('rulesDialog') : window ;
      targetSchroll.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  },
  render(createElement) {
    // Define the button element
    const button = this.show
      ? createElement('v-btn', {
          attrs: {
            position: 'fixed',
            location: 'bottom right',
            class: 'fab',
            color: 'surface-2',
            elevation: '8',
            icon: 'mdi-chevron-up',
            size: 'large',
          },
          on: {
            click: this.onClick,
          },
        })
      : null;

    // Define the div element with the scroll directive
    return createElement(
      'div',
      {
        directives: [
          {
            name: 'scroll',
            value: this.onScroll,
            ...(this.isModal ? { arg: 'rulesDialog' } : {}),
          },
        ],
      },
      [button]
    );
  }
};
</script>

<style scoped>
.fab {
  margin: auto 8px 64px 8px;
  z-index: 1;
}
</style>
