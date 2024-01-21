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
        :is-ranked="isRanked"
        :is-spectating="gameStore.isSpectating"
      />
      <section class="d-flex justify-space-around mt-6 mb-8">
        <template v-if="matchIsOver">
          <MatchWonOrLostIndicator
            :username="gameStore.player.username"
            :won-match="playerWinsMatch"
            data-cy="player-match-result"
          />
          <MatchWonOrLostIndicator
            :username="gameStore.opponent.username"
            :won-match="opponentWinsMatch"
            data-cy="opponent-match-result"
          />
        </template>
        <template v-else>
          <LobbyPlayerIndicator
            :player-username="gameStore.player.username"
            :player-ready="gameStore.iWantRematch"
            card-face-name="rematch"
            small
            data-cy="my-rematch-indicator"
          />
          <LobbyPlayerIndicator
            :player-username="gameStore.opponent.username"
            :player-ready="gameStore.opponentWantsRematch"
            :player-declined="gameStore.opponentDeclinedRematch"
            card-face-name="rematch"
            small
            data-cy="opponent-rematch-indicator"
          />
        </template>
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
          v-if="!matchIsOver"
          :color="rematchButtonColor"
          :disabled="rematchButtonDisabled"
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
import MatchScoreCounter from './components/MatchScoreCounter.vue';
import MatchStatusBanner from './components/MatchStatusBanner.vue';
import MatchWonOrLostIndicator from './components/MatchWonOrLostIndicator.vue';
import LobbyPlayerIndicator from '@/routes/lobby/components/LobbyPlayerIndicator.vue';

export default {
  name: 'GameOverDialog',
  components: {
    BaseDialog,
    BaseSnackbar,
    MatchScoreCounter,
    MatchStatusBanner,
    MatchWonOrLostIndicator,
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
          return this.matchIsOver ? 'P1 Wins Match' : 'P1 Wins';
        case 1:
          return this.matchIsOver ? 'P2 Wins Match' : 'P2 Wins';
        default:
          return 'Stalemate';
      }
    },
    headingDataAttr() {
      if (this.stalemate) {
        return 'stalemate-heading';
      }

      if (this.playerWinsGame) {
        return this.gameStore.isSpectating ?  'p1-wins-heading' : 'victory-heading';
      }

      return this.gameStore.isSpectating ? 'p2-wins-heading' : 'loss-heading';
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
    opponentWinsMatch() {
      return this.gameStore.currentMatch?.winner === this.gameStore.opponent.id;
    },
    opponentWantsToRematch() {
      return (
        (this.gameStore.p0Rematch && this.gameStore.myPNum === 1) 
        || (this.gameStore.p1Rematch && this.gameStore.myPNum === 0)
      );
    },
    opponentDeclinedRematch() {
      return this.gameStore.opponentDeclinedRematch;
    },
    rematchButtonColor() {
      if (this.rematchButtonDisabled) {
        return undefined;
      }
      return this.isRanked ? 'newPrimary' : 'newSecondary';
    },
    rematchButtonText() {
      if (this.gameStore.isSpectating) {
        return 'Spectate';
      }
      return this.isRanked ? 'Continue Match' : 'Rematch';
    },
    rematchButtonDisabled() {
      if (this.gameStore.isSpectating) {
        return this.gameStore.someoneDeclinedRematch || this.gameStore.iWantToContinueSpectating;
      }
      return this.opponentDeclinedRematch || this.gameStore.iWantRematch;
    },
  },
  methods: {
    async goHome() {
      this.leavingGame = false;
      this.$router.push('/');
      this.gameStore.setGameOver({
        gameOver: false,
        conceded: false,
        winner: null,
      });
      await this.gameStore.requestUnsubscribeFromGame();
      await this.gameStore.requestRematch({gameId:this.gameStore.id, rematch: false});
    },
    async rematch() {
      try {
        if (this.gameStore.isSpectating) {
          return this.continueSpectating();
        }
        await this.gameStore.requestRematch({ gameId: this.gameStore.id, rematch: true});
      } catch (e) {
        this.showSnackbar = true;
        this.snackBarMessage = 'Error requesting rematch';
        this.$router.push('/');
      }
    },
    async continueSpectating() {
      this.gameStore.iWantToContinueSpectating = true;
      if (this.gameStore.p0Rematch && this.gameStore.p1Rematch) {
        this.gameStore.iWantToContinueSpectating = false;
        await this.gameStore.requestSpectate(this.gameStore.rematchGameId);

        this.$router.push({
          name: this.$router.currentRoute.name,
          params: {
            gameId: this.gameStore.rematchGameId,
          },
        });
      }
      return;
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
