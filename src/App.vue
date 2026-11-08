<template>
  <v-app id="app">
    <TheHeader v-if="showNav" class="sticky" />
    <v-main>
      <RouterView />
    </v-main>
    <TheFooter v-if="showFooter" />
    <TheSnackbar />
  </v-app>
</template>

<script>
import { mapStores } from 'pinia';
import TheHeader from '@/components/TheHeader.vue';
import TheFooter from '@/components/TheFooter.vue';
import TheSnackbar from '@/components/TheSnackbar.vue';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import { useGameListStore } from '@/stores/gameList';
import { useMyGamesStore } from '@/stores/myGames';

export default {
  components: {
    TheHeader,
    TheFooter,
    TheSnackbar,
  },
  data() {
    return {
      showNav: false,
    };
  },
  computed: {
    ...mapStores(useAuthStore),
    isAuthenticated() {
      return this.authStore.authenticated;
    },
    isSmallDevice() {
      return this.$vuetify.display.smAndDown;
    },
    showFooter() {
      return this.showNav && this.isSmallDevice && this.isAuthenticated;
    },
  },
  watch: {
    '$route.meta'({ hideNavigation }) {
      this.showNav = !hideNavigation;
    },
  },
  created() {
    // Pass store to window object on testing
    if (window.Cypress) {
      window.cuttle.gameStore = useGameStore();
      window.cuttle.authStore = useAuthStore();
      window.cuttle.gameListStore = useGameListStore();
      window.cuttle.myGamesStore = useMyGamesStore();
    }
  },
};
</script>

<style lang="scss">
@use '@/sass/typography';
@use '@/sass/transitions';

:root {
  // CSS containment for isolated components
  --contain-isolated: layout style;

  // Chrome that must stay above every vuetify overlay: the spectator playback bar and the game
  // menu wrapper. Vuetify assigns overlay z-indexes from a running stack (see useStack), starting
  // at 2400 for a dialog and climbing +10 for each overlay open at the same time, so 3000 leaves
  // room for dozens of them. That headroom only holds while no component declares a z-index on an
  // overlay of its own: a declared value seeds the stack, and everything opened on top of it
  // inherits the raised base. See #1479, and the lint rule that enforces it in eslint.config.js.
  --z-above-overlays: 3000;
}

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

.sticky {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 500;
}
</style>
