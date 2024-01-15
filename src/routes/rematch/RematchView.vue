<template>
  <div id="game-view-wrapper">
    <!-- Unauthenticated/Must re-log in/ Unavailable game -->
    <template v-if="myPNum === null">
      <GameUnavailableView />
    </template>

    <!-- Authenticated View -->
    <template v-else>
      <div id="game-menu-wrapper" class="d-flex flex-column flex-sm-row align-center">
        <GameMenu :is-spectating="false" />
      </div>

      <div class="game-overlays">
        <v-overlay id="waiting-for-game-to-start-scrim" v-model="waitingForGameToStart" class="game-overlay">
          <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
            Waiting for Game to Start
          </h1>
          <v-btn
            color="secondary"
            class="mt-4"
            data-cy="leave-unstarted-game-button"
            :loading="leavingGame"
            @click="goHome"
          >
            Leave Game
          </v-btn>
        </v-overlay>
      </div>
    </template>
  </div>
  <BaseSnackbar
    v-model="showSnackbar"
    :message="snackBarMessage"
    :color="snackColor"
    data-cy="game-snackbar"
    @clear="clearSnackBar"
  />
</template>

<script>

import { ROUTE_NAME_HOME } from '@/router';
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import GameMenu from '@/routes/game/components/GameMenu.vue';
import GameUnavailableView from '@/routes/game/components/GameUnavailableView.vue';
import BaseSnackbar from '@/components/BaseSnackbar.vue';

export default {
  name: 'RematchView',
  components: {
    GameMenu,
    GameUnavailableView,
    BaseSnackbar,
  },
  data() {
    return {
      leavingGame: false,
      showSnackbar: false,
      snackBarMessage: '',
      snackColor: 'error',
    };
  },
  computed:{
    ...mapStores(useGameStore, useAuthStore),
    myPNum() {
      return this.gameStore.myPNum;
    },  
    mustReauthenticate: {
      get() {
        return this.authStore.mustReauthenticate;
      },
      set(val) {
        this.authStore.mustReauthenticate = val;
      },
    },
    waitingForGameToStart() {
      return !(this.gameStore.p0Rematch && this.gameStore.p1Rematch);
    },
  },

  async mounted() {
    if (this.isSpectating && !this.gameStore.id) {
      let { gameId } = this.$router.currentRoute.value.params;
      gameId = Number(gameId);
      if (!Number.isInteger(gameId)) {
        this.$router.push(ROUTE_NAME_HOME);
        return;
      }
      this.gameStore.requestSpectate(gameId);
    }

    if (!this.authStore.authenticated) {
      this.authStore.mustReauthenticate = true;
    }
    document.documentElement.style.setProperty('--browserHeight', `${window.innerHeight / 100}px`);
    window.addEventListener('resize', () => {
      // We execute the same script as before
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--browserHeight', `${vh}px`);
    });
  },
  methods: {
    clearSnackBar() {
      this.snackBarMessage = '';
      this.showSnackbar = false;
    },
    async goHome() {
      this.leavingGame = true;
      try {
        await this.gameStore.requestUnsubscribeFromGame();
      } finally {
        this.leavingGame = false;
        this.$router.push('/');
        this.gameStore.setGameOver({
          gameOver: false,
          conceded: false,
          winner: null,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#game-view-wrapper {
  color: #fff;
  width: 100vw;
  height: 100%;
  background-image: url('/img/game/board-background.webp');
  background-size: cover;
  background-position: center;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: 15vh 5vh 55vh 5vh 20vh;
  grid-template-areas:
    'opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand'
    'decks decks opp-score opp-score opp-score opp-score history history'
    'decks decks field field field field history history'
    'score score score score score score score score'
    'hand hand hand hand hand hand hand hand';
}

#game-menu-wrapper {
  position: absolute;
  display: inline-block;
  right: 0;
  margin: 10px;
  z-index: 3;
}

.game-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* Mobile styling overrides */
@media (max-width: 600px) {
  #game-view-wrapper {
    grid-template-rows: bh(7) bh(5) bh(50) bh(20) bh(5) bh(13);
    grid-template-areas:
      'opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand'
      'opp-score opp-score opp-score opp-score opp-score opp-score opp-score opp-score'
      'field field field field field field field field'
      'decks decks decks decks decks decks decks decks'
      'score score score score score score score score'
      'hand hand hand hand hand hand hand hand';
  }
}
</style>
