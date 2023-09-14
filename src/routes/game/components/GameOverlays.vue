<template>
  <div class="game-overlays">
    <v-overlay
      id="waiting-for-game-to-start-scrim"
      v-model="waitingForGameToStart"
      class="game-overlay"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
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
      scrim="surface-1"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        {{ showWaitingForOpponetToCounterMessage }}
      </h1>
      <div id="counter-scrim-cards">
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
      </div>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-discard-scrim"
      v-model="waitingForOpponentToDiscard"
      class="game-overlay"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        Opponent Is Discarding
      </h1>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-resolve-three-scrim"
      v-model="waitingForOpponentToPickFromScrap"
      class="game-overlay"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        Opponent Choosing Card from Scrap
      </h1>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-play-from-deck-scrim"
      v-model="showWaitingForOpponentToPlayFromDeck"
      class="game-overlay"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        Opponent Playing from Deck
      </h1>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-to-discard-jack-from-deck"
      v-model="showWaitingForOpponentToDiscardJackFromDeck"
      class="game-overlay"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        Opponent Must Discard Jack
      </h1>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-stalemate-scrim"
      v-model="waitingForOpponentToStalemate"
      class="game-overlay"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        <div>Opponent Considering Stalemate Request</div>
      </h1>
    </v-overlay>

    <move-choice-overlay
      v-if="selectedCard || cardSelectedFromDeck"
      :model-value="!targeting && (!!selectedCard || !!cardSelectedFromDeck)"
      :selected-card="selectedCard || cardSelectedFromDeck"
      :card-selected-from-deck="cardSelectedFromDeck"
      :is-players-turn="isPlayersTurn"
      :opponent-queen-count="opponentQueenCount"
      :frozen-id="player.frozenId"
      :playing-from-deck="playingFromDeck"
      @points="$emit('points')"
      @face-card="$emit('face-card')"
      @scuttle="handleTargeting"
      @jack="handleTargeting"
      @one-off="$emit('one-off')"
      @targeted-one-off="handleTargeting"
      @cancel="$emit('clear-selection')"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import MoveChoiceOverlay from '~routes/game/components/MoveChoiceOverlay.vue';
import GameCard from '~routes/game/components/GameCard.vue';

export default {
  name: 'GameOverlays',
  components: {
    MoveChoiceOverlay,
    GameCard,
  },
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
  emits:['points', 'face-card', 'one-off', 'clear-selection', 'target'],
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
:deep(.v-overlay__content) {
  left: 0;
}
.game-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.overlay-header {
    font-weight: bold;
    background-color: rgba(var(--v-theme-surface-2));
    color: rgba(var(--v-theme-surface-1));
    padding: 24px;
    text-align: center;
    width: 100vw;
  }
  #counter-scrim-cards {
    position: absolute;
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 16px;
  }
  .overlay-card {
    position: relative;
    display: inline-block;
    margin-right: -48px !important;
    min-width: 90px;
  }
  .overlay-two-0 {
    transform: rotate(-5deg);
  }
  .overlay-two-1 {
    transform: rotate(3deg);
  }
  .overlay-two-2 {
    transform: rotate(-10deg);
  }
  .overlay-two-3 {
    transform: rotate(-4deg);
  }
</style>
