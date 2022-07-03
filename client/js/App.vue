<script setup>
import NavigationDrawer from './components/NavigationDrawer.vue';
</script>

<template>
  <v-app id="app">
    <NavigationDrawer />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

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
