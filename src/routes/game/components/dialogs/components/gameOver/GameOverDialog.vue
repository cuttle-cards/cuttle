<template>
  <BaseDialog id="game-over-dialog" v-model="show">
    <template #title>
      <h1 :data-cy="headingDataAttr" :class="isMobilePortrait ? 'text-h4' : 'heading'">
        {{ heading }}
      </h1>
    </template>

    <template #body>
      <MatchScoreCounter
        :wins="wins"
        :losses="losses"
        :stalemates="stalemates"
        :latest-result="latestResult"
      />
      <section class="d-flex justify-space-around mt-6 mb-8">
        <LobbyPlayerIndicator
          :player-username="gameStore.player.username"
          :player-ready="gameStore.iWantRematch"
          small
          data-cy="my-indicator"
        />
        <LobbyPlayerIndicator
          :player-username="gameStore.opponent.username"
          :player-ready="gameStore.opponentWantsRematch"
          small
          data-cy="opponent-indicator"
        />
      </section>
      <MatchStatusBanner />
    </template>

    <template #actions>
      <div class="d-flex gap-2">
        <v-btn
          class="mr-4"
          color="surface-1"
          variant="outlined"
          data-cy="gameover-go-home"
          :loading="leavingGame"
          @click="goHome"
        >
          {{ t('game.dialogs.gameOverDialog.goHome') }}
        </v-btn>
        <v-btn
          :color="rematchButtonColor"
          :disabled="opponentDeclinedRematch"
          variant="flat"
          data-cy="gameover-rematch"
          @click="rematch"
        >
          {{ rematchButtonText }}
        </v-btn>
      </div>
    </template>
  </BaseDialog>
  <BaseSnackbar
    v-model="showSnackbar"
    :message="snackBarMessage"
    :color="snackColor"
    data-cy="game-over-snackbar"
    @clear="clearSnackBar"
  />
</template>

<script>
import { useI18n } from 'vue-i18n';
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import BaseDialog from '@/components/BaseDialog.vue';
import GameStatus from '_/utils/GameStatus.json';
import BaseSnackbar from '@/components/BaseSnackbar.vue';
import MatchScoreCounter from './MatchScoreCounter.vue';
import MatchStatusBanner from './MatchStatusBanner.vue';
import LobbyPlayerIndicator from '@/routes/lobby/components/LobbyPlayerIndicator.vue';

export default {
  name: 'GameOverDialog',
  components: {
    BaseDialog,
    BaseSnackbar,
    MatchScoreCounter,
    MatchStatusBanner,
    LobbyPlayerIndicator
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
    const { t } = useI18n();
    return {
      t,
    };
  },
  data() {
    return {
      leavingGame: false,
      showSnackbar: false,
      snackBarMessage: '',
      snackColor: 'error',
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
      if (this.gameStore.isSpectating) {
        return this.spectatorHeading;
      }
      if (this.matchIsOver) {
        // You win the match / you lose the match
        const messageName = this.playerWinsMatch ? 'game.dialogs.gameOverDialog.youWinTheMatch' : 'game.dialogs.gameOverDialog.youLoseTheMatch';
        return this.t(messageName);
      }
      // Draw / You Won / You Lose
      const messageName = this.stalemate ? 'game.dialogs.gameOverDialog.draw' : this.playerWinsGame ? 'game.dialogs.gameOverDialog.youWin' : 'game.dialogs.gameOverDialog.youLose';
      return this.t(messageName);
    },
    spectatorHeading() {
      switch (this.gameStore.winnerPNum) {
        case 0:
          return 'P1 Wins';
        case 1:
          return 'P2 Wins';
        default:
          return 'Stalemate';
      }
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
    latestResult() {
      if (this.stalemate) {
        return 'Stalemate';
      }
      return this.playerWinsGame ? 'Won' : 'Lost';
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
    wins() {
      // const currentMatchGames = this.gameStore.currentMatch?.games ?? [];
      // return currentMatchGames.filter((game) => game.winner === this.authStore.)
      return this.matchGameStats.filter((gameResult) => gameResult === 'W').length;
    },
    losses() {
      return this.matchGameStats.filter((gameResult) => gameResult === 'L').length;
    },
    stalemates() {
      return this.matchGameStats.filter((gameResult) => gameResult === 'D').length;
    },
    isRanked() {
      return this.gameStore.isRanked;
    },
    matchIsOver() {
      return this.gameStore.currentMatch?.winner;
    },
    playerWinsMatch() {
      return this.gameStore.currentMatch?.winner === this.gameStore.player.id;
    },
    opponentWantsToRematch() {
      return (
        (this.gameStore.p0Rematch && this.gameStore.myPNum === 1) 
        || (this.gameStore.p1Rematch && this.gameStore.myPNum === 0)
      );
    },
    opponentDeclinedRematch() {
      return (
        (this.gameStore.p0Rematch === false && this.gameStore.myPNum === 1) ||
        (this.gameStore.p1Rematch === false && this.gameStore.myPNum === 0)
      );
    },
    rematchButtonColor() {
      return this.isRanked ? 'newPrimary' : 'newSecondary';
    },
    rematchButtonText() {
      if (this.gameStore.isSpectating) {
        return 'Spectate';
      }
      return this.isRanked ? 'Continue Match' : 'Rematch';
    }
  },
  methods: {
    async goHome() {
      this.leavingGame = true;
      try {
        await this.gameStore.requestUnsubscribeFromGame();
        await this.gameStore.requestRematch({gameId:this.gameStore.id, rematch: false});
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
    async rematch() {
      this.gameStore.setGameOver({gameOver: false});
      try {
        await this.gameStore.requestRematch({ gameId:this.gameStore.id, rematch: true});
      } catch (e) {
        this.showSnackbar = true;
        this.snackBarMessage = 'Error requesting rematch';
        this.$router.push('/');
      }
    },
    clearSnackBar() {
      this.showSnackbar = false;
      this.snackBarMessage = '';
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
* {
  color: rgba(var(--v-theme-surface-2));
}
.heading {
  text-align: center;
  text-align: center;
  font-family: Luckiest Guy;
  font-size: 64px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  padding-top: 24px;
  width: 100%;
}

</style>
