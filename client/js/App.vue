<template>
  <v-app id="app">
    <v-navigation-drawer v-model="showNav" class="primary" dark app>
      <v-list>
        <v-list-item
          v-for="({ text, icon, page }, i) in pageLinks"
          :key="i"
          link
          :to="page"
        >
          <v-icon class="mr-4">mdi-{{ icon }}</v-icon>
          {{ text }}
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      showNav: true,
    };
  },
  computed: {
    authenticated() {
      return this.$store.state.auth.authenticated;
    },
    pageLinks() {
      const res = [{ text: 'Rules', icon: 'script-text', page: 'Rules' }];
      return res;
    },
  },
}
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
