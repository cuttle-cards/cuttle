<template>
  <base-dialog id="game-over-dialog" v-model="show">
    <template #title>
      <h1 :data-cy="headingDataAttr" :class="isMobilePortrait ? 'text-h4' : ''">
        {{ heading }}
      </h1>
      <v-img
        v-if="currentMatch && !isMobilePortrait"
        :src="logoSrc"
        :data-cy="logoDataAttr"
        class="logo-image-match"
      />
    </template>

    <template #body>
      <template v-if="isMobilePortrait || !currentMatch">
        <div class="d-flex justify-center">
          <v-img
            :src="logoSrc"
            :data-cy="logoDataAttr"
            :class="isMobilePortrait ? 'small-logo-image' : 'logo-image'"
          />
        </div>
      </template>
      <template v-if="currentMatch">
        <p v-if="currentMatch" class="dialog-text" data-cy="match-result-section">
          Match against {{ opponent.username }}
          <span>: {{ matchIsOver ? 'Finished' : 'In Progress' }}</span>
        </p>
        <p v-if="matchIsOver" class="dialog-text" data-cy="match-winner-message">
          You {{ playerWinsMatch ? 'won' : 'lost' }} your game against {{ opponent.username }}
        </p>
        <div data-cy="match-result-games" class="mb-4">
          <div class="d-flex">
            <div
              v-for="(gameStatus, i) in matchGameStats"
              :key="`${gameStatus}-${i}`"
              class="d-flex flex-column mr-4 align-center"
              :data-cy="`match-result-game-${i+1}`"
            >
              <v-icon
                size="x-large"
                color="surface-2"
                :icon="iconFromGameStatus(gameStatus)"
                :data-cy="`icon-${gameStatus}`"
              />
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
import BaseDialog from '@/core/components/BaseDialog.vue';
import GameStatus from '../../../../utils/GameStatus.json';

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
        if (game.status === GameStatus.FINISHED){
          return game.winner === null ? 'D' : game.winner === this.opponent.id ? 'L' : 'W';
        } 
        return 'I';
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

.small-logo-image {
  height: auto;
  max-width: 120px;
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

</style>
