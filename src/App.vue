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
  --font-heading: 'Luckiest Guy', cursive;
  --font-body: 'Changa', sans-serif;
  --font-body-serif: 'Libre Baskerville', Georgia, serif;
  --font-heading-serif: 'Cormorant Infant', 'PT Serif', serif;
  --font-sans: 'Roboto', system-ui, sans-serif;

  // Animation duration buckets (all respect prefers-reduced-motion)
  --duration-instant: 0.1s;
  --duration-fast: 0.3s;
  --duration-normal: 0.5s;
  --duration-slow: 1s;
  --duration-slower: 1.5s;

  // Legacy aliases (for existing code)
  --transition-duration: var(--duration-slow);
  --transition-duration-fast: var(--duration-fast);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0s;
    --duration-fast: 0s;
    --duration-normal: 0s;
    --duration-slow: 0s;
    --duration-slower: 0s;
  }
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
