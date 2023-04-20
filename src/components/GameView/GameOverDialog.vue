<template>
  <base-dialog v-model="show" id="game-over-dialog">
    <template #title>
      <h1 :data-cy="headingDataAttr" class="dialog-header">{{ heading }}</h1>
      <v-img v-if="currentMatch && !isMobilePortrait" :src="logoSrc" :data-cy="logoDataAttr" class="logo-image-match" />
    </template>

    <template #body>
      <template v-if="isMobilePortrait || !currentMatch">
        <div class="d-flex justify-center">
          <v-img :src="logoSrc" :data-cy="logoDataAttr" class="logo-image" />
        </div>
      </template>
      <template v-if="currentMatch">
        <p class="dialog-text" v-if="currentMatch" data-cy="match-result-section">
          Match against {{ opponent.username }}
          <span>: {{ matchIsOver ? 'Finished' : 'In Progress' }}</span>
        </p>
        <p class="dialog-text" v-if="matchIsOver" data-cy="match-winner-message">
          You {{ playerWinsMatch ? 'won' : 'lost' }} your game against {{ opponent.username }}
        </p>
        <div data-cy="match-result-games" class="dialog-text">
          <div class="d-flex">
            <div class="d-flex flex-column mr-4 align-center" v-for="(gameStatus, i) in matchGameStats"
                 :key="`${gameStatus}-${i}`">
              <v-icon size="x-large" color="surface-2" :icon="iconFromGameStatus(gameStatus)" />
              {{ gameStatus }}
            </div>
          </div>
        </div>
      </template>
    </template>

    <template #actions>
      <v-btn
        color="surface-1"
        variant="flat"
        data-cy="gameover-go-home"
        :loading="leavingGame"
        @click="goHome"
      >
        Go Home
      </v-btn>
    </template>
  </base-dialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import BaseDialog from '@/components/Global/BaseDialog.vue';

export default {
  name: 'GameOverDialog',
  components: {
    BaseDialog,
  },
  props: {
 
    modelValue: {
      type: Boolean,
      required: true,
    },
    playerWinsGame: {
      type: Boolean,
      required: true,
    },
    stalemate: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      leavingGame: false,
    };
  },
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set() {
        // do nothing - parent controls whether dialog is open
      },
    },
    ...mapState({
      playingFromDeck: ({ game }) => game.playingFromDeck,
      game: ({ game }) => game,
    }),
    ...mapGetters(['player', 'opponent']),
    heading() {
      if (this.matchIsOver) {
        return this.playerWinsMatch ? 'You Win the Match' : 'You Lose the Match';
      }
      const currentMatchGames = this.game.currentMatch?.games ?? [];
      const gameNumberPrefix = currentMatchGames.length > 0 ? `Game ${currentMatchGames.length}: ` : '';
      const winnerMessage = this.stalemate ? 'Draw' : this.playerWinsGame ? 'You Win' : 'You Lose';

      return `${gameNumberPrefix}${winnerMessage}`;
    },
    headingDataAttr() {
      if (this.stalemate) {
        return 'stalemate-heading';
      }

      if (this.playerWinsGame) {
        return 'victory-heading';
      }

      return 'loss-heading';
    },
    isMobilePortrait() {
      return this.$vuetify.display.xs;
    },
    logoSrc() {
      if (this.stalemate) {
        return '/img/logo-stalemate.svg';
      }

      if (this.playerWinsGame) {
        return '/img/logo-body-no-text.svg';
      }

      return '/img/logo-dead.svg';
    },
    logoDataAttr() {
      if (this.stalemate) {
        return 'stalemate-img';
      }

      if (this.playerWinsGame) {
        return 'victory-img';
      }

      return 'loss-img';
    },
    currentMatch() {
      return this.game.currentMatch;
    },
    matchGameStats() {
      const currentMatchGames = this.game.currentMatch?.games ?? [];
      return currentMatchGames.map((game) => {
        switch (game.result) {
          case 0: // p0 won game
            return game.p0 === this.player.id ? 'W' : 'L';
          case 1: // p1 won game
            return game.p1 === this.player.id ? 'W' : 'L';
          case 2: // draw
            return 'D';
          default: // incomplete
            return 'I';
        }
      });
    },
    matchIsOver() {
      return this.game.currentMatch?.winner;
    },
    playerWinsMatch() {
      return this.game.currentMatch?.winner === this.player.id;
    },
  },
  methods: {
    async goHome() {
      this.leavingGame = true;
      try {
        await this.$store.dispatch('requestUnsubscribeFromGame');
      } finally {
        this.leavingGame = false;
        this.$router.push('/');
        this.$store.commit('setGameOver', {
          gameOver: false,
          conceded: false,
          winner: null,
        });
      }
    },
    iconFromGameStatus(gameStatus) {
      switch (gameStatus) {
        case 'W':
          return 'mdi-thumb-up-outline';
        case 'L':
          return 'mdi-thumb-down-outline';
        case 'I':
          return 'mdi-account-clock-outline';
        case 'D':
          return 'mdi-handshake-outline';
      }
    },
  },
};
</script>

<style scoped lang="scss">
.logo-image {
  height: auto;
  max-width: 180px;
  margin-bottom: 16px;
}

.logo-image-match {
  position: absolute;
  right: 12px;
  top: 12px;
  height: auto;
  min-width: 90px;
  max-width: 90px;
  max-height: 90px;
}

.dialog-header,
.dialog-text {
  font-family: 'PT Serif', serif;
}
</style>
