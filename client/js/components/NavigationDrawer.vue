<template>
  <v-navigation-drawer
    :value="showNav"
    class="primary"
    dark
    app
    :permanent="showNav"
    :mini-variant="isSmallDevice"
  >
    <v-list>
      <v-list-item
        v-for="({ text, icon, page }, i) in pageLinks"
        :key="i"
        link
        exact
        :to="page"
        :data-nav="text"
      >
        <v-icon class="mr-4"> mdi-{{ icon }} </v-icon>
        {{ text }}
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'NavigationDrawer',
  computed: {
    authenticated() {
      return this.$store.state.auth.authenticated;
    },
    pageLinks() {
      let res = [];
      const rules = { text: 'Rules', icon: 'script-text', page: { name: 'Rules' } };

      if (!this.authenticated) {
        res = [{ text: 'Login', icon: 'login', page: { name: 'Login' } }, rules];
      }
      // Authenticated
      else {
        res = [
          { text: 'Logout', icon: 'logout', page: { name: 'Login' } },
          rules,
          { text: 'Play', icon: 'play', page: { name: 'Home' } },
          { text: 'Stats', icon: 'chart-bar', page: { name: 'Stats' } },
        ];
      }
      return res;
    },
    showNav() {
      const pagesToHideNav = ['Lobby', 'Game'];
      return !pagesToHideNav.includes(this.$route.name);
    },
    isSmallDevice() {
      return this.$vuetify.breakpoint.smAndDown;
    },
  },
};
</script>
