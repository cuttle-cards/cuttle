<template>
  <BaseDialog id="game-over-dialog" v-model="show">
    <template #title>
      <h1 :data-cy="headingDataAttr" :class="isMobilePortrait ? 'text-h4' : 'heading'">
        {{ heading }}
      </h1>
    </template>

    <template #body>
      <MatchScoreCounter
        :wins="leftPlayerWins"
        :losses="rightPlayerWins"
        :stalemates="stalemates"
        :latest-result="latestResult"
        :is-ranked="isRanked"
        :is-spectating="gameHistoryStore.isSpectating"
      />
      <section class="d-flex justify-space-around mt-6 mb-8">
        <template v-if="matchIsOver">
          <MatchWonOrLostIndicator
            :username="leftPlayerUsername"
            :won-match="leftPlayerWonMatch"
            data-cy="player-match-result"
          />
          <MatchWonOrLostIndicator
            :username="rightPlayerUsername"
            :won-match="rightPlayerWonMatch"
            data-cy="opponent-match-result"
          />
        </template>
        <template v-else>
          <PlayerReadyIndicator
            :player-username="leftPlayerUsername"
            :player-ready="leftPlayerRematch === true"
            :player-declined="leftPlayerRematch === false"
            card-face-name="rematch"
            small
            data-cy="my-rematch-indicator"
          />
          <PlayerReadyIndicator
            :player-username="rightPlayerUsername"
            :player-ready="rightPlayerRematch === true"
            :player-declined="rightPlayerRematch === false"
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
          color="base-dark"
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
</template>

<script>
import { useI18n } from 'vue-i18n';
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import { useGameHistoryStore } from '@/stores/gameHistory';
import { useSnackbarStore } from '@/stores/snackbar';
import { useGameListStore } from '@/stores/gameList';
import { WhichPlayer, usePlayerData } from './composables/playerData';
import BaseDialog from '@/components/BaseDialog.vue';
import GameStatus from '_/utils/GameStatus.json';
import MatchScoreCounter from './components/MatchScoreCounter.vue';
import MatchStatusBanner from './components/MatchStatusBanner.vue';
import MatchWonOrLostIndicator from './components/MatchWonOrLostIndicator.vue';
import PlayerReadyIndicator from '@/components/PlayerReadyIndicator.vue';

export default {
  name: 'GameOverDialog',
  components: {
    BaseDialog,
    MatchScoreCounter,
    MatchStatusBanner,
    MatchWonOrLostIndicator,
    PlayerReadyIndicator,
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
    const gameHistoryStore = useGameHistoryStore();

    const leftPlayer = gameHistoryStore.isSpectating ? WhichPlayer.ORIGINAL_P0 : WhichPlayer.CURRENT_PLAYER;
    const rightPlayer = gameHistoryStore.isSpectating
      ? WhichPlayer.ORIGINAL_P1
      : WhichPlayer.CURRENT_OPPONENT;

    const {
      username: leftPlayerUsername,
      rematch: leftPlayerRematch,
      wins: leftPlayerWins,
      wonMatch: leftPlayerWonMatch,
    } = usePlayerData(leftPlayer);

    const {
      username: rightPlayerUsername,
      rematch: rightPlayerRematch,
      wins: rightPlayerWins,
      wonMatch: rightPlayerWonMatch,
    } = usePlayerData(rightPlayer);

    return {
      t,
      gameHistoryStore,
      leftPlayerUsername,
      leftPlayerRematch,
      leftPlayerWins,
      rightPlayerUsername,
      rightPlayerRematch,
      rightPlayerWins,
      leftPlayerWonMatch,
      rightPlayerWonMatch,
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
    ...mapStores(useGameStore, useSnackbarStore, useGameListStore),
    heading() {
      if (this.gameHistoryStore.isSpectating) {
        return this.spectatorHeading;
      }
      if (this.matchIsOver) {
        // You win the match / you lose the match
        const messageName = this.leftPlayerWonMatch
          ? 'game.dialogs.gameOverDialog.youWinTheMatch'
          : 'game.dialogs.gameOverDialog.youLoseTheMatch';
        return this.t(messageName);
      }
      // Draw / You Won / You Lose
      const messageName = this.stalemate
        ? 'game.dialogs.gameOverDialog.draw'
        : this.playerWinsGame
          ? 'game.dialogs.gameOverDialog.youWin'
          : 'game.dialogs.gameOverDialog.youLose';
      return this.t(messageName);
    },
    spectatorHeading() {
      const prefix = 'game.dialogs.gameOverDialog';
      if (this.gameStore.winnerPNum === null) {
        return this.t(`${prefix}.draw`);
      }
      const winner = this.gameStore.players[this.gameStore.winnerPNum];
      const res =
        winner.id === this.gameStore.currentMatch?.games[0].p0
          ? this.t(`${prefix}.p1Wins`)
          : this.t(`${prefix}.p2Wins`);
      const matchTranslation = this.t(`${prefix}.match`);
      return this.matchIsOver ? `${res} ${matchTranslation}` : res;
    },
    headingDataAttr() {
      if (this.stalemate) {
        return 'stalemate-heading';
      }

      if (this.gameHistoryStore.isSpectating) {
        const origianlP0 = this.gameStore.currentMatch?.games[0].p0;
        const winner = this.gameStore.players[this.gameStore.winnerPNum];
        return winner.id === origianlP0 ? 'p1-wins-heading' : 'p2-wins-heading';
      }

      return this.playerWinsGame ? 'victory-heading' : 'loss-heading';
    },
    latestResult() {
      if (this.stalemate) {
        return 'Stalemate';
      }
      if (this.gameHistoryStore.isSpectating) {
        const origianlP0 = this.gameStore.currentMatch?.games[0].p0;
        const winner = this.gameStore.players[this.gameStore.winnerPNum];
        return winner.id === origianlP0 ? 'Won' : 'Lost';
      }

      return this.playerWinsGame ? 'Won' : 'Lost';
    },
    isMobilePortrait() {
      return this.$vuetify.display.xs;
    },
    currentMatch() {
      return this.gameStore.currentMatch;
    },
    stalemates() {
      return this.gameStore.currentMatch?.games.filter(
        (game) => game.status === GameStatus.FINISHED && game.winner === null,
      ).length;
    },
    isRanked() {
      return this.gameStore.isRanked;
    },
    matchIsOver() {
      return this.gameStore.currentMatch?.winner;
    },
    opponentDeclinedRematch() {
      return this.gameStore.opponentDeclinedRematch;
    },
    rematchButtonColor() {
      if (this.rematchButtonDisabled) {
        return undefined;
      }
      return this.isRanked ? 'primary' : 'casual';
    },
    rematchButtonText() {
      if (this.gameHistoryStore.isSpectating) {
        return 'Spectate';
      }
      return this.isRanked ? 'Continue Match' : 'Rematch';
    },
    rematchButtonDisabled() {
      if (this.gameHistoryStore.isSpectating) {
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

      if (!this.gameHistoryStore.isSpectating) {
        await this.gameStore.requestRematch({ gameId: this.gameStore.id, rematch: false });
      }
    },
    async rematch() {
      try {
        if (this.gameHistoryStore.isSpectating) {
          return this.continueSpectating();
        }
        if (this.gameStore.isVsAi) {
          const gameId = await this.gameListStore.requestCreateAIGame(this.gameStore.id);
          this.$router.replace(`/ai/${gameId}`);
          return this.gameStore.requestGameState(gameId);
        }
        await this.gameStore.requestRematch({ gameId: this.gameStore.id, rematch: true });
      } catch (e) {
        this.snackbarStore.alert('Error requesting rematch');
        this.$router.push('/');
      }
    },
    async continueSpectating() {
      this.gameStore.iWantToContinueSpectating = true;
      if (this.gameStore.p0Rematch && this.gameStore.p1Rematch) {
        this.gameStore.iWantToContinueSpectating = false;
        let rematchGameId;
        try {
          ({ rematchGameId } = this.gameStore);
          const route = {
            name: this.$router.currentRoute.name,
            params: {
              gameId: rematchGameId,
            },
          };
          await this.gameStore.requestSpectate(rematchGameId, null, route);
          const gameStateIndex = this.gameStore.status === GameStatus.STARTED ? -1 : 0;
          this.$router.push({
            ...route,
            query: {
              gameStateIndex,
              pNum: this.gameStore.myPNum,
            },
          });
        } catch (err) {
          this.$router.push({
            name: 'Home',
            query: {
              gameId: rematchGameId,
              error: err?.message ?? err ?? `Could not spectate game ${rematchGameId}`,
            },
          });
        }
      }
      return;
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
#game-over-dialog {
  color: rgba(var(--v-theme-base-light));
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
