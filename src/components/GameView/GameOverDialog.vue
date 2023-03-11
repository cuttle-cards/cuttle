<template>
  <v-dialog v-model="show" persistent max-width="650">
    <v-card id="game-over-dialog">
      <div id="dialog-header">
        <div v-if="currentMatch" class="d-flex">
          <v-card-title :data-cy="headingDataAttr" class="mt-8">
            <h1 class="dialog-header">{{ heading }}</h1>
          </v-card-title>
          <v-card-text class="d-flex justify-end mr-4 mt-4">
            <v-img :src="logoSrc" :data-cy="logoDataAttr" class="logo-image-match" />
          </v-card-text>
        </div>
        <div v-else>
          <v-card-title :data-cy="headingDataAttr">
            <h1 class="dialog-header">{{ heading }}</h1>
          </v-card-title>
          <v-card-text class="d-flex justify-center">
            <v-img :src="logoSrc" :data-cy="logoDataAttr" class="logo-image" />
          </v-card-text>
        </div>
      </div>
      <v-card-text class="dialog-text" v-if="currentMatch" data-cy="match-result-section">
        Match against {{ opponent.username }}
        <span>: {{ currentMatchWinner ? 'Finished' : 'In Progress' }}</span>
      </v-card-text>
      <v-card-text class="dialog-text" v-if="currentMatchWinner" data-cy="match-winner-message">
        You {{ playerWinsMatch ? 'won' : 'lost' }} your game against {{ opponent.username }}
      </v-card-text>
      <v-card-text data-cy="match-result-games" class="dialog-text">
        <div class="d-flex">
          <div class="d-flex flex-column mr-4 align-center" v-for="(gameStatus, i) in matchGameStats"
               :key="`${gameStatus}-${i}`">
            <v-icon size="x-large" color="black" :icon="iconFromGameStatus(gameStatus)" />
            {{ gameStatus }}
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn color="primary" variant="flat" data-cy="gameover-go-home" @click="goHome"> Go Home </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'GameOverDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    playerWins: {
      type: Boolean,
      required: true,
    },
    stalemate: {
      type: Boolean,
      required: true,
    },
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
      if (this.currentMatchWinner) {
        return this.playerWinsMatch ? 'You Win the Match' : 'You Lose the Match';
      }
      const currentMatchGames = this.game.currentMatch?.games ?? [];
      const gameNumberPrefix = currentMatchGames.length > 0 ? `Game ${currentMatchGames.length}: ` : '';
      const winnerMessage = this.stalemate ? 'Draw' : this.playerWins ? 'You Win' : 'You Lose';

      return `${gameNumberPrefix}${winnerMessage}`;
    },
    headingDataAttr() {
      if (this.stalemate) {
        return 'stalemate-heading';
      }

      if (this.playerWins) {
        return 'victory-heading';
      }

      return 'loss-heading';
    },
    logoSrc() {
      if (this.stalemate) {
        return '/img/logo-stalemate.svg';
      }

      if (this.playerWins) {
        return '/img/logo-body-no-text.svg';
      }

      return '/img/logo-dead.svg';
    },
    logoDataAttr() {
      if (this.stalemate) {
        return 'stalemate-img';
      }

      if (this.playerWins) {
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
    currentMatchWinner() {
      return this.game.currentMatch?.winner;
    },
    playerWinsMatch() {
      return this.game.currentMatch?.winner === this.player.id;
    },
  },
  methods: {
    goHome() {
      this.$store.dispatch('requestUnsubscribeFromGame').then(() => {
        this.$router.push('/');
        this.$store.commit('setGameOver', {
          gameOver: false,
          conceded: false,
          winner: null,
        });
      });
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
}

.logo-image-match {
  height: auto;
  max-width: 90px;
  max-height: 90px;
}

.dialog-header,
.dialog-text {
  font-family: 'PT Serif', serif;
}
</style>
