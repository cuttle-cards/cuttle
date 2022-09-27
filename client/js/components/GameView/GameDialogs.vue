<template>
  <div class="game-dialogs">
    <counter-dialog
      v-model="showCounterDialog"
      :one-off="game.oneOff"
      :target="game.oneOffTarget"
      :twos-in-hand="twosInHand"
      :twos-played="twosPlayed"
      @resolve="resolve"
      @counter="counter($event)"
    />
    <cannot-counter-dialog
      v-model="showCannotCounterDialog"
      :one-off="game.oneOff"
      :opponent-queen-count="opponentQueenCount"
      :player-two-count="playerTwoCount"
      :twos-played="twosPlayed"
      :target="game.oneOffTarget"
      @resolve="resolve"
    />
    <four-dialog v-model="discarding" @discard="discard" />
    <three-dialog
      v-model="pickingFromScrap"
      :one-off="game.oneOff"
      :scrap="scrap"
      @resolveThree="resolveThree($event)"
    />
    <seven-double-jacks-dialog
      v-model="showSevenDoubleJacksDialog"
      :top-card="topCard"
      :second-card="secondCard"
      @resolveSevenDoubleJacks="resolveSevenDoubleJacks($event)"
    />
    <game-over-dialog v-model="gameIsOver" :player-wins="playerWins" :stalemate="stalemate" />
    <reauthenticate-dialog v-model="mustReauthenticate" />
    <opponent-requested-stalemate-dialog v-model="consideringOpponentStalemateRequest" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

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
  computed: {
    ...mapGetters([
      'discarding',
      'player',
      'opponent',
      'opponentPointTotal',
      'opponentQueenCount',
      'playerWins',
      'resolvingSeven',
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
        this.resolvingSeven &&
        this.topCard.rank === 11 &&
        this.secondCard.rank === 11 &&
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
