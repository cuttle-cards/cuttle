<template>
  <div class="game-dialogs">
    <CounterDialog
      :model-value="showCounterDialog"
      :one-off="gameStore.oneOff"
      :target="gameStore.oneOffTarget"
      :twos-in-hand="twosInHand"
      :twos-played="twosPlayed"
      @resolve="resolve"
      @counter="counter($event)"
    />
    <CannotCounterDialog
      :model-value="showCannotCounterDialog"
      :one-off="gameStore.oneOff"
      :opponent-queen-count="gameStore.opponentQueenCount"
      :player-two-count="playerTwoCount"
      :twos-played="twosPlayed"
      :target="gameStore.oneOffTarget"
      @resolve="resolve"
    />

    <FourDialog :model-value="gameStore.showResolveFour" @discard="discard" />
    <FiveDialog v-if="gameStore.showResolveFive" @resolve-five="resolveFive" />

    <ThreeDialog
      :model-value="pickingFromScrap"
      :one-off="gameStore.oneOff"
      :scrap="scrap"
      @resolve-three="resolveThree($event)"
    />
    <SevenDoubleJacksDialog
      :model-value="showSevenDoubleJacksDialog"
      :top-card="topCard"
      :second-card="secondCard"
      @resolve-seven-double-jacks="resolveSevenDoubleJacks($event)"
    />
    <GameOverDialog
      v-if="gameIsOver"
      :model-value="gameIsOver"
      :player-wins-game="gameStore.playerWins"
      :stalemate="stalemate"
    />
    <ReauthenticateDialog :model-value="mustReauthenticate" />
    <OpponentRequestedStalemateDialog :model-value="consideringOpponentStalemateRequest" />
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import CannotCounterDialog from './components/CannotCounterDialog.vue';
import CounterDialog from './components/CounterDialog.vue';
import FourDialog from './components/FourDialog.vue';
import GameOverDialog from './components/gameOver/GameOverDialog.vue';
import ReauthenticateDialog from './components/ReauthenticateDialog.vue';
import SevenDoubleJacksDialog from './components/SevenDoubleJacksDialog.vue';
import ThreeDialog from './components/ThreeDialog.vue';
import OpponentRequestedStalemateDialog from './components/OpponentRequestedStalemateDialog.vue';
import FiveDialog from './components/FiveDialog.vue';


export default {
  name: 'GameDialogs',
  components: {
    CannotCounterDialog,
    CounterDialog,
    FourDialog,
    GameOverDialog,
    ReauthenticateDialog,
    SevenDoubleJacksDialog,
    ThreeDialog,
    OpponentRequestedStalemateDialog,
    FiveDialog
  },

  emits: [ 'clear-selection', 'handle-error' ],
  computed: {
    ...mapStores(useGameStore, useAuthStore),
    gameIsOver() {
      return this.gameStore.gameIsOver;
    },
    hasTwoInHand() {
      return this.twosInHand.length > 0;
    },
    myTurnToCounter() {
      return this.gameStore.myTurnToCounter;
    },
    // TODO: Refactor and combine usage in GameView.vue
    mustReauthenticate: {
      get() {
        return this.authStore.mustReauthenticate;
      },
      set(val) {
        this.authStore.mustReauthenticate = val;
      },
    },
    pickingFromScrap() {
      return this.gameStore.pickingFromScrap;
    },
    playerTwoCount() {
      return this.twoCount(this.gameStore.player);
    },
    scrap() {
      return this.gameStore.scrap;
    },
    secondCard() {
      return this.gameStore.secondCard;
    },
    showCannotCounterDialog() {
      return (
        (this.myTurnToCounter && !this.hasTwoInHand) ||
        (this.myTurnToCounter && this.hasTwoInHand && this.gameStore.opponentQueenCount > 0)
      );
    },
    showCounterDialog() {
      return this.myTurnToCounter && this.hasTwoInHand && this.gameStore.opponentQueenCount === 0;
    },
    showSevenDoubleJacksDialog() {
      return (
        this.gameStore.playingFromDeck &&
        this.topCard.rank === 11 &&
        (!this.secondCard || this.secondCard.rank === 11) &&
        (this.gameStore.opponentPointTotal === 0 || this.gameStore.opponentQueenCount > 0)
      );
    },
    stalemate() {
      return this.gameStore.gameIsOver && this.gameStore.winnerPNum === null;
    },
    consideringOpponentStalemateRequest() {
      return this.gameStore.consideringOpponentStalemateRequest;
    },
    topCard() {
      return this.gameStore.topCard;
    },
    twosInHand() {
      return this.gameStore.player.hand.filter((card) => card.rank === 2);
    },
    twosPlayed() {
      return this.gameStore.twos;
    },
  },
  methods: {
    clearSelection() {
      this.$emit('clear-selection');
    },
    counter(twoId) {
      this.gameStore.requestCounter(twoId).then(this.clearSelection)
        .catch(this.handleError);
    },
    discard(cardIds) {
      const [ cardId1 ] = cardIds;
      const cardId2 = cardIds.length > 1 ? cardIds[1] : null;
      this.gameStore.requestDiscard({
        cardId1,
        cardId2,
      });
    },
    handleError() {
      this.$emit('handle-error');
    },
    resolve() {
      this.gameStore.requestResolve().then(this.clearSelection)
        .catch(this.handleError);
    },
    resolveThree(cardId) {
      this.gameStore.requestResolveThree(cardId).then(this.clearSelection)
        .catch(this.handleError);
    },
    resolveFive(cardId) {
      this.gameStore.requestResolveFive(cardId);
    },
    resolveSevenDoubleJacks({ cardId, index }) {
      this.gameStore.requestResolveSevenDoubleJacks({ cardId, index })
        .then(this.clearSelection)
        .catch(this.handleError);
    },
    /**
     * @returns number of queens a given player has
     * @param player is the player object
     */
    twoCount(player) {
      return player.faceCards.reduce((twoCount, card) => twoCount + (card.rank === 2 ? 1 : 0), 0);
    },
  },
};
</script>
