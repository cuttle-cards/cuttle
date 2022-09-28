<template>
  <v-navigation-drawer
    :value="showNav"
    class="primary"
    dark
    app
    data-cy="nav-drawer"
    :permanent="showNav"
    :mini-variant="isCollapsed"
  >
    <!-- Page Links -->
    <v-list>
      <v-list-item
        v-for="({ text, icon, page }, i) in pageLinks"
        :key="i"
        link
        exact
        :to="page"
        :data-nav="text"
      >
        <v-icon class="mr-4" :icon="`mdi-${icon}`" />
        {{ text }}
      </v-list-item>
    </v-list>
    <!-- Expand/Collapse -->
    <template #append>
      <v-list v-if="!isSmallDevice">
        <v-list-item :data-cy="collapseMenuAttribute" @click="userHasCollapsed = !userHasCollapsed">
          <v-icon class="mr-2" :icon="collapseMenuIcon" />
          <template v-if="!isCollapsed">Collapse Menu</template>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'NavigationDrawer',
  data() {
    return {
      // User controlls for collapsing only available on desktop
      userHasCollapsed: false,
    };
  },
  computed: {
    authenticated() {
      return this.$store.state.auth.authenticated;
    },
    pageLinks() {
      const rules = [
        {
          text: 'Rules',
          icon: 'script-text',
          page: { name: 'Rules' },
        },
      ];
      return !this.authenticated
        ? [
            {
              text: 'Login',
              icon: 'login',
              page: { name: 'Login' },
            },
            ...rules,
          ]
        : [
            { text: 'Logout', icon: 'logout', page: { name: 'Logout' } },
            ...rules,
            { text: 'Play', icon: 'play', page: { name: 'Home' } },
            { text: 'Stats', icon: 'chart-bar', page: { name: 'Stats' } },
          ];
    },
    showNav() {
      const pagesToHideNav = ['Lobby', 'Game'];
      return !pagesToHideNav.includes(this.$route.name);
    },
    isSmallDevice() {
      return this.$vuetify.display.smAndDown;
    },
    isCollapsed() {
      return this.userHasCollapsed || this.isSmallDevice;
    },
    // Expand/Collapse button
    collapseMenuAttribute() {
      return this.userHasCollapsed ? 'expand-nav' : 'collapse-nav';
    },
    collapseMenuIcon() {
      return this.userHasCollapsed ? 'mdi-arrow-right' : 'mdi-arrow-left';
    },
  },
};
</script>
