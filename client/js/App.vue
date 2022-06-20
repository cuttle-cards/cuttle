<template>
  <v-app id="app">
    <navigation-drawer />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import NavigationDrawer from './components/NavigationDrawer.vue';

export default {
  components: {
    NavigationDrawer,
  },
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap');

#app {
  font-family: 'PT Serif', serif;
}

.gradient-text {
  background: linear-gradient(
    268.89deg,
    rgba(98, 2, 238, 0.87) 73.76%,
    rgba(253, 98, 34, 0.87) 99.59%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
