<template>
  <div class="game-overlays">

    <v-overlay
      id="waiting-for-game-to-start-scrim"
      v-model="waitingForGameToStart"
      class="game-overlay"
    >
      <h1 :class="[this.$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        Waiting for Game to Start
      </h1>
      <v-btn
        color="secondary"
        class="mt-4"
        data-cy="leave-unstarted-game-button"
        :loading="leavingGame"
        @click="goHome"
      >
        Leave Game
      </v-btn>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-counter-scrim"
      v-model="waitingForOpponentToCounter"
      class="d-flex flex-column justify-center align-center"
    >
      <h1 :class="[this.$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        {{ showWaitingForOpponetToCounterMessage }}
      </h1>
      <div class="mt-4 d-flex justify-center">
        <game-card
          v-if="oneOff"
          :rank="oneOff.rank"
          :suit="oneOff.suit"
          :data-overlay-one-off="`${oneOff.rank}-${oneOff.suit}`"
          :jacks="twos"
          class="overlay-card"
        />
        <div>
          <game-card
            v-for="(two, index) in twos"
            :key="`overlay-two-${two.id}`"
            :rank="two.rank"
            :suit="two.suit"
            :data-overlay-counter="`${two.rank}-${two.suit}`"
            :class="`overlay-card overlay-two overlay-two-${index}`"
            :high-elevation="true"
          />
        </div>
        <!-- <div class="jacks-container">
        </div> -->
        <!-- <span v-for="two in twos" :key="`overlay-two-${two.id}`" class="d-flex align-center">
          <v-icon icon="mdi-chevron-right" size="x-large" color="black" />
          <game-card
            :rank="two.rank"
            :suit="two.suit"
            :data-overlay-counter="`${two.rank}-${two.suit}`"
            class="overlay-card"
          />
        </span> -->
      </div>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-discard-scrim"
      v-model="waitingForOpponentToDiscard"
      class="game-overlay"
    >
      <h1 :class="[this.$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        Opponent Is Discarding
      </h1>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-resolve-three-scrim"
      v-model="waitingForOpponentToPickFromScrap"
      class="game-overlay"
    >
      <h1 :class="[this.$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        Opponent Choosing Card from Scrap
      </h1>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-play-from-deck-scrim"
      v-model="showWaitingForOpponentToPlayFromDeck"
      class="game-overlay"
    >
      <h1 :class="[this.$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        Opponent Playing from Deck
      </h1>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-to-discard-jack-from-deck"
      v-model="showWaitingForOpponentToDiscardJackFromDeck"
      class="game-overlay"
    >
      <h1 :class="[this.$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        Opponent Must Discard Jack
      </h1>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-stalemate-scrim"
      v-model="waitingForOpponentToStalemate"
      class="game-overlay"
    >
      <h1 :class="[this.$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        <div>Opponent Considering Stalemate Request</div>
      </h1>
    </v-overlay>

    <move-choice-overlay
      v-if="selectedCard || cardSelectedFromDeck"
      :modelValue="!targeting && (!!selectedCard || !!cardSelectedFromDeck)"
      :selected-card="selectedCard || cardSelectedFromDeck"
      :card-selected-from-deck="cardSelectedFromDeck"
      :is-players-turn="isPlayersTurn"
      :opponent-queen-count="opponentQueenCount"
      :frozen-id="player.frozenId"
      :playing-from-deck="playingFromDeck"
      @points="$emit('points')"
      @faceCard="$emit('face-card')"
      @scuttle="handleTargeting"
      @jack="handleTargeting"
      @oneOff="$emit('one-off')"
      @targetedOneOff="handleTargeting"
      @cancel="$emit('clear-selection')"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import MoveChoiceOverlay from '@/components/GameView/MoveChoiceOverlay.vue';
import GameCard from '@/components/GameView/GameCard.vue';

export default {
  name: 'GameOverlays',
  components: {
    MoveChoiceOverlay,
    GameCard,
  },
  emits:['points', 'face-card', 'one-off', 'clear-selection', 'target'],
  props: {
    targeting: {
      type: Boolean,
      required: true,
    },
    selectedCard: {
      type: Object,
      default: null,
    },
    cardSelectedFromDeck: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      leavingGame: false,
    };
  },
  computed: {
    // Since we're not using namespacing, we need to destructure the game module
    // off of the global state to directly access the state values
    ...mapState({
      waitingForOpponentToCounter: ({ game }) => game.waitingForOpponentToCounter,
      waitingForOpponentToDiscard: ({ game }) => game.waitingForOpponentToDiscard,
      waitingForOpponentToPickFromScrap: ({ game }) => game.waitingForOpponentToPickFromScrap,
      waitingForOpponentToPlayFromDeck: ({ game }) => game.waitingForOpponentToPlayFromDeck,
      waitingForOpponentToStalemate: ({ game }) => game.waitingForOpponentToStalemate,
      topCard: ({ game }) => game.topCard,
      secondCard: ({ game }) => game.secondCard,
      oneOff: ({ game }) => game.oneOff,
      twos: ({ game }) => game.twos,
      playingFromDeck: ({ game }) => game.playingFromDeck,
    }),
    ...mapGetters([
      'isPlayersTurn',
      'playerQueenCount',
      'opponentQueenCount',
      'opponentPointTotal',
      'opponent',
      'hasGlassesEight',
      'player',
    ]),
    waitingForGameToStart() {
      return !(this.$store.state.game.p0Ready && this.$store.state.game.p1Ready);
    },
    showWaitingForOpponetToCounterMessage() {
      const mayCounter = 'Opponent May Counter';
      const mustResolve = 'Opponent Must Resolve';
      const opponentHasTwo = this.opponent.hand.some((card) => card.rank === 2);
      if (this.playerQueenCount || (this.hasGlassesEight && !opponentHasTwo)) {
        return mustResolve;
      }
      return mayCounter;
    },
    showWaitingForOpponentToDiscardJackFromDeck() {
      return (
        this.waitingForOpponentToPlayFromDeck &&
        this.topCard.rank === 11 &&
        (!this.secondCard || this.secondCard.rank === 11) &&
        (this.opponentPointTotal === 0 || this.opponentQueenCount > 0)
      );
    },
    showWaitingForOpponentToPlayFromDeck() {
      return this.waitingForOpponentToPlayFromDeck && !this.showWaitingForOpponentToDiscardJackFromDeck;
    },
  },
  methods: {
    handleTargeting(event) {
      this.$emit('target', event);
    },
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
  },
};
</script>

<style scoped lang="scss">
.game-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.overlay-header {
    font-weight: bold;
    background-color: #FFF4D7;
    padding: 24px;
    margin-top: 80px;
    text-align: center;
    width: 100vw;
  }

.jacks-container {
    position: absolute;
    right: -5%;
    top: 0;
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .overlay-card {
    position: relative;
    display: inline-block;
    margin-right: -48px !important;
  }
  .overlay-two-0 {
    // height: 90%;
    transform: rotate(-5deg);
  }
  .overlay-two-1 {
    transform: rotate(3deg);
  }
  .overlay-two-2 {
    transform: rotate(-10deg);
  }
</style>
