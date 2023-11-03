<template>
  <BaseDialog id="game-over-dialog" v-model="show">
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
          Match against {{ gameStore.opponent.username }}
          <span>: {{ matchIsOver ? 'Finished' : 'In Progress' }}</span>
        </p>
        <p v-if="matchIsOver" class="dialog-text" data-cy="match-winner-message">
          <!-- You won/lost your game against  -->
          {{ t('game.dialogs.gameOverDialog.you') }} {{ playerWinsMatch ? t('game.dialogs.gameOverDialog.won') : t('game.dialogs.gameOverDialog.lost') }} {{ t('game.dialogs.gameOverDialog.yourGameAgainst') }} {{ gameStore.opponent.username }}
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
                :aria-label="`${gameStatus} icon`"
                aria-hidden="false"
                role="img"
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
        {{ t('game.dialogs.gameOverDialog.goHome') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import BaseDialog from '@/components/BaseDialog.vue';
import GameStatus from '_/utils/GameStatus.json';

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
  setup() {
    // Vuetify has its own translation layer that isn't very good. It seems to conflict with the namespace of vue-i18n so we need to import it at the component level and utilize it this way with a composable. There may be another more global way but I haven't found anything just yet
    const { t } = useI18n();
    return {
      t,
    };
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
    ...mapStores(useGameStore),
    heading() {
      if (this.matchIsOver) {
        // You win the match / you lose the match
        return this.playerWinsMatch ? this.t('game.dialogs.gameOverDialog.youWinTheMatch') : this.t('game.dialogs.gameOverDialog.youLoseTheMatch');
      }
      const currentMatchGames = this.gameStore.currentMatch?.games ?? [];
      // Game number
      const gameNumberPrefix = currentMatchGames.length > 0 ? this.t('game.dialogs.gameOverDialog.game') `${currentMatchGames.length}: ` : '';
      // Draw / You Win / You Lose
      const winnerMessage = this.stalemate ? this.t('game.dialogs.gameOverDialog.draw') : this.playerWinsGame ? this.t('game.dialogs.gameOverDialog.youWin') : this.t('game.dialogs.gameOverDialog.youLose');

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
      return this.gameStore.currentMatch;
    },
    matchGameStats() {
      const currentMatchGames = this.gameStore.currentMatch?.games ?? [];
      return currentMatchGames.map((game) => {
        if (game.status === GameStatus.FINISHED){
          return game.winner === null ? 'D' : game.winner === this.gameStore.opponent.id ? 'L' : 'W';
        } 
        return 'I';
      });
    },
    matchIsOver() {
      return this.gameStore.currentMatch?.winner;
    },
    playerWinsMatch() {
      return this.gameStore.currentMatch?.winner === this.gameStore.player.id;
    },
  },
  methods: {
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
