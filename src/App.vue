<template>
  <v-app id="app">
    <the-header v-if="showNav" />
    <v-main>
      <router-view />
    </v-main>
    <the-footer v-if="showNav && isSmallDevice" />
  </v-app>
</template>

<script>
import TheHeader from '@/core/components/TheHeader.vue';
import TheFooter from '@/core/components/TheFooter.vue';

export default {
  components: {
    TheHeader,
    TheFooter
  },
  data(){
    return{
      showNav: false,
    };
  },
  computed:{
    isSmallDevice() {
      return this.$vuetify.display.smAndDown;
    },
  },
  watch:{
  '$route.meta'({hideNavigation}){
    this.showNav = !hideNavigation;
  }
 }
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Infant:wght@400;600;700&family=Luckiest+Guy&family=Changa:wght@400;500;700&family=Libre+Baskerville:wght@400;700&family=PT+Serif:wght@400;700&display=swap');

.gradient-text {
  background: linear-gradient(268.89deg, rgba(98, 2, 238, 0.87) 73.76%, rgba(253, 98, 34, 0.87) 99.59%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}


/* v-main automatically applies a min-height attribute of '100vh' to the '.v-application--wrap' class below */
/* This can be an issue on mobile devices, as 'vh' unit does not account for the url bar in mobile browsers */
/* Overriding min-height to be '100%' on screen sizes <600px ensures that the game view will fit within */
/* mobile viewports without the need to scroll */
@media (max-width: 600px) {
  div > .v-application--wrap {
    min-height: 100%;
  }
}
</style>
