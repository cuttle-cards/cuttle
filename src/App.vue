<template>
  <v-app id="app">
    <TheHeader v-if="showNav" :variant="variant" class="sticky" />
    <v-main>
      <RouterView />
    </v-main>
    <TheFooter v-if="showFooter" :variant="variant" />
  </v-app>
</template>

<script>
import { mapStores } from 'pinia';
import TheHeader from '@/components/TheHeader.vue';
import TheFooter from '@/components/TheFooter.vue';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import { useGameListStore } from '@/stores/gameList';

export default {
  components: {
    TheHeader,
    TheFooter,
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
    variant() {
      const isHomeView = this.$router.currentRoute.value.name !== 'Stats';
      return isHomeView ? 'light' : 'dark';
    },
    showFooter() {
      return this.showNav && this.isSmallDevice && this.isAuthenticated;
    }
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
    }
  },
};
</script>

<style lang="scss">

//use self hosted google fonts
/* changa-regular - arabic_latin_latin-ext */
@font-face {
  font-display: swap;
  font-family: 'Changa';
  font-style: normal;
  font-weight: 400;
  src: url('public/fonts/changa/changa-v27-arabic_latin_latin-ext-500.woff2') format('woff2');
}

/* changa-500 - arabic_latin_latin-ext */
@font-face {
  font-display: swap;
  font-family: 'Changa';
  font-style: normal;
  font-weight: 500;
  src: url('public/fonts/changa/changa-v27-arabic_latin_latin-ext-500.woff2') format('woff2');
}

/* changa-700 - arabic_latin_latin-ext */
@font-face {
  font-display: swap;
  font-family: 'Changa';
  font-style: normal;
  font-weight: 700;
  src: url('public/fonts/changa/changa-v27-arabic_latin_latin-ext-700.woff2') format('woff2');
}

/* cormorant-infant-regular - cyrillic_cyrillic-ext_latin_latin-ext_vietnamese */
@font-face {
  font-display: swap;
  font-family: 'Cormorant Infant';
  font-style: normal;
  font-weight: 400;
  src: url('public/fonts/cormorantInfant/cormorant-infant-v17-cyrillic_cyrillic-ext_latin_latin-ext_vietnamese-regular.woff2') format('woff2');
}

/* cormorant-infant-600 - cyrillic_cyrillic-ext_latin_latin-ext_vietnamese */
@font-face {
  font-display: swap;
  font-family: 'Cormorant Infant';
  font-style: normal;
  font-weight: 600;
  src: url('public/fonts/cormorantInfant/cormorant-infant-v17-cyrillic_cyrillic-ext_latin_latin-ext_vietnamese-600.woff2') format('woff2');
}

/* cormorant-infant-700 - cyrillic_cyrillic-ext_latin_latin-ext_vietnamese */
@font-face {
  font-display: swap;
  font-family: 'Cormorant Infant';
  font-style: normal;
  font-weight: 700;
  src: url('public/fonts/cormorantInfant/cormorant-infant-v17-cyrillic_cyrillic-ext_latin_latin-ext_vietnamese-700.woff2') format('woff2');
}

/* libre-baskerville-regular - latin_latin-ext */
@font-face {
  font-display: swap;
  font-family: 'Libre Baskerville';
  font-style: normal;
  font-weight: 400;
  src: url('public/fonts/libreBaskerville/libre-baskerville-v14-latin_latin-ext-regular.woff2') format('woff2');
}

/* libre-baskerville-700 - latin_latin-ext */
@font-face {
  font-display: swap;
  font-family: 'Libre Baskerville';
  font-style: normal;
  font-weight: 700;
  src: url('public/fonts/libreBaskerville/libre-baskerville-v14-latin_latin-ext-700.woff2') format('woff2');
}

/* luckiest-guy-regular - latin_latin-ext */
@font-face {
  font-display: swap;
  font-family: 'Luckiest Guy';
  font-style: normal;
  font-weight: 400;
  src: url('public/fonts/luckiestGuy/luckiest-guy-v23-latin_latin-ext-regular.woff2') format('woff2');
}

/* pt-serif-regular - cyrillic_cyrillic-ext_latin_latin-ext */
@font-face {
  font-display: swap;
  font-family: 'PT Serif';
  font-style: normal;
  font-weight: 400;
  src: url('public/fonts/ptSerif/pt-serif-v18-cyrillic_cyrillic-ext_latin_latin-ext-regular.woff2') format('woff2');
}

/* pt-serif-700 - cyrillic_cyrillic-ext_latin_latin-ext */
@font-face {
  font-display: swap;
  font-family: 'PT Serif';
  font-style: normal;
  font-weight: 700;
  src: url('public/fonts/ptSerif/pt-serif-v18-cyrillic_cyrillic-ext_latin_latin-ext-700.woff2') format('woff2');
}

@import '@/sass/typography';

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

.sticky{
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 500;
}

</style>
