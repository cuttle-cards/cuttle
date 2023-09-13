<template>
  <div class="game-dialogs">
    <counter-dialog
      :model-value="showCounterDialog"
      :one-off="game.oneOff"
      :target="game.oneOffTarget"
      :twos-in-hand="twosInHand"
      :twos-played="twosPlayed"
      @resolve="resolve"
      @counter="counter($event)"
    />
    <cannot-counter-dialog
      :model-value="showCannotCounterDialog"
      :one-off="game.oneOff"
      :opponent-queen-count="gameStore.opponentQueenCount"
      :player-two-count="playerTwoCount"
      :twos-played="twosPlayed"
      :target="game.oneOffTarget"
      @resolve="resolve"
    />
    <four-dialog :model-value="gameStore.discarding" @discard="discard" />
    <three-dialog
      :model-value="pickingFromScrap"
      :one-off="game.oneOff"
      :scrap="scrap"
      @resolve-three="resolveThree($event)"
    />
    <seven-double-jacks-dialog
      :model-value="showSevenDoubleJacksDialog"
      :top-card="topCard"
      :second-card="secondCard"
      @resolve-seven-double-jacks="resolveSevenDoubleJacks($event)"
    />
    <game-over-dialog
      v-if="gameIsOver"
      :model-value="gameIsOver"
      :player-wins-game="gameStore.playerWins"
      :stalemate="stalemate"
    />
    <reauthenticate-dialog :model-value="mustReauthenticate" />
    <opponent-requested-stalemate-dialog v-model="consideringOpponentStalemateRequest" />
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import CannotCounterDialog from '@/components/GameView/CannotCounterDialog.vue';
import CounterDialog from '@/components/GameView/CounterDialog.vue';
import FourDialog from '@/components/GameView/FourDialog.vue';
import GameOverDialog from '@/components/GameView/GameOverDialog.vue';
import ReauthenticateDialog from '@/components/GameView/ReauthenticateDialog.vue';
import SevenDoubleJacksDialog from '@/components/GameView/SevenDoubleJacksDialog.vue';
import ThreeDialog from '@/components/GameView/ThreeDialog.vue';
import OpponentRequestedStalemateDialog from './OpponentRequestedStalemateDialog.vue';

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
  },
  emits: ['clear-selection', 'handle-error'],
  computed: {
    ...mapStores(useGameStore),
    ...mapStores(useAuthStore),
    game() {
      // TODO: Figure out a better way to do this, mapping the whole module is a
      // bit unusual-- the usages can probably be changed to only need a subset,
      // or moved to some sort of store method or getter
      return this.gameStore;
    },
    gameIsOver() {
      return this.game.gameIsOver;
    },
    hasTwoInHand() {
      return this.twosInHand.length > 0;
    },
    myTurnToCounter() {
      return this.game.myTurnToCounter;
    },
    // TODO: Refactor and combine usage in GameView.vue
    mustReauthenticate: {
      get() {
        return this.authStore.mustReauthenticate;
      },
      set(val) {
        this.authStore.setMustReauthenticate(val);
      },
    },
    pickingFromScrap() {
      return this.game.pickingFromScrap;
    },
    playerTwoCount() {
      return this.twoCount(this.gameStore.player);
    },
    scrap() {
      return this.game.scrap;
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
    consideringOpponentStalemateRequest: {
      get() {
        return this.gameStore.consideringOpponentStalemateRequest;
      },
      set(val) {
        this.gameStore.setConsideringOpponentStalemateRequest(val);
      },
    },
    topCard() {
      return this.gameStore.topCard;
    },
    twosInHand() {
      return this.gameStore.player.hand.filter((card) => card.rank === 2);
    },
    twosPlayed() {
      return this.game.twos;
    },
  },
  methods: {
    clearSelection() {
      this.$emit('clear-selection');
    },
    counter(twoId) {
      this.gameStore.requestCounter(twoId).then(this.clearSelection).catch(this.handleError);
    },
    discard(cardIds) {
      const [cardId1] = cardIds;
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
      this.gameStore.requestResolve().then(this.clearSelection).catch(this.handleError);
    },
    resolveThree(cardId) {
      this.gameStore.requestResolveThree(cardId).then(this.clearSelection).catch(this.handleError);
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
