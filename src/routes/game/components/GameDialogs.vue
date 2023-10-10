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
      :opponent-queen-count="opponentQueenCount"
      :player-two-count="playerTwoCount"
      :twos-played="twosPlayed"
      :target="game.oneOffTarget"
      @resolve="resolve"
    />
    <four-dialog :model-value="discarding" @discard="discard" />
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
      :player-wins-game="playerWins"
      :stalemate="stalemate"
    />
    <reauthenticate-dialog :model-value="mustReauthenticate" />
    <opponent-requested-stalemate-dialog v-model="consideringOpponentStalemateRequest" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { mapState } from 'vuex';

import CannotCounterDialog from '@/routes/game/components/CannotCounterDialog.vue';
import CounterDialog from '@/routes/game/components/CounterDialog.vue';
import FourDialog from '@/routes/game/components/FourDialog.vue';
import GameOverDialog from '@/routes/game/components/GameOverDialog.vue';
import ReauthenticateDialog from '@/routes/game/components/ReauthenticateDialog.vue';
import SevenDoubleJacksDialog from '@/routes/game/components/SevenDoubleJacksDialog.vue';
import ThreeDialog from '@/routes/game/components/ThreeDialog.vue';
import OpponentRequestedStalemateDialog from '@/routes/game/components/OpponentRequestedStalemateDialog.vue';

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
    ...mapState({
      playingFromDeck: ({ game }) => game.playingFromDeck,
    }),

    ...mapGetters([
      'discarding',
      'player',
      'opponent',
      'opponentPointTotal',
      'opponentQueenCount',
      'playerWins',
    ]),
    game() {
      // TODO: Figure out a better way to do this, mapping the whole module is a
      // bit unusual-- the usages can probably be changed to only need a subset,
      // or moved to some sort of store method or getter
      return this.$store.state.game;
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
        return this.$store.state.auth.mustReauthenticate;
      },
      set(val) {
        this.$store.commit('setMustReauthenticate', val);
      },
    },
    pickingFromScrap() {
      return this.game.pickingFromScrap;
    },
    playerTwoCount() {
      return this.twoCount(this.player);
    },
    scrap() {
      return this.game.scrap;
    },
    secondCard() {
      return this.$store.state.game.secondCard;
    },
    showCannotCounterDialog() {
      return (
        (this.myTurnToCounter && !this.hasTwoInHand) ||
        (this.myTurnToCounter && this.hasTwoInHand && this.opponentQueenCount > 0)
      );
    },
    showCounterDialog() {
      return this.myTurnToCounter && this.hasTwoInHand && this.opponentQueenCount === 0;
    },
    showSevenDoubleJacksDialog() {
      return (
        this.playingFromDeck &&
        this.topCard.rank === 11 &&
        (!this.secondCard || this.secondCard.rank === 11) &&
        (this.opponentPointTotal === 0 || this.opponentQueenCount > 0)
      );
    },
    stalemate() {
      return this.$store.state.game.gameIsOver && this.$store.state.game.winnerPNum === null;
    },
    consideringOpponentStalemateRequest: {
      get() {
        return this.$store.state.game.consideringOpponentStalemateRequest;
      },
      set(val) {
        this.$store.commit('setConsideringOpponentStalemateRequest', val);
      },
    },
    topCard() {
      return this.$store.state.game.topCard;
    },
    twosInHand() {
      return this.player.hand.filter((card) => card.rank === 2);
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
      this.$store.dispatch('requestCounter', twoId).then(this.clearSelection).catch(this.handleError);
    },
    discard(cardIds) {
      const [cardId1] = cardIds;
      const cardId2 = cardIds.length > 1 ? cardIds[1] : null;
      this.$store.dispatch('requestDiscard', {
        cardId1,
        cardId2,
      });
    },
    handleError() {
      this.$emit('handle-error');
    },
    resolve() {
      this.$store.dispatch('requestResolve').then(this.clearSelection).catch(this.handleError);
    },
    resolveThree(cardId) {
      this.$store.dispatch('requestResolveThree', cardId).then(this.clearSelection).catch(this.handleError);
    },
    resolveSevenDoubleJacks({ cardId, index }) {
      this.$store
        .dispatch('requestResolveSevenDoubleJacks', { cardId, index })
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
