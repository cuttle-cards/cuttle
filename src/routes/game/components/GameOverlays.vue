<template>
  <div class="game-overlays">
    <v-overlay
      id="waiting-for-game-to-start-scrim"
      v-model="waitingForGameToStart"
      persistent
      class="game-overlay"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        {{ t('game.overlays.waitingForGameToStart') }}
      </h1>
      <v-btn
        color="secondary"
        class="mt-4"
        data-cy="leave-unstarted-game-button"
        :loading="leavingGame"
        @click="goHome"
      >
        {{ t('game.overlays.leaveGame') }}
      </v-btn>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-counter-scrim"
      v-model="gameStore.waitingForOpponentToCounter"
      persistent
      class="d-flex flex-column justify-center align-center"
      scrim="surface-1"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        {{ showWaitingForOpponetToCounterMessage }}
      </h1>
      <div id="counter-scrim-cards">
        <GameCard
          v-if="gameStore.oneOff"
          :rank="gameStore.oneOff.rank"
          :suit="gameStore.oneOff.suit"
          :data-overlay-one-off="`${gameStore.oneOff.rank}-${gameStore.oneOff.suit}`"
          :jacks="gameStore.twos"
          class="overlay-card"
        />
        <div>
          <GameCard
            v-for="(two, index) in gameStore.twos"
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
      v-model="gameStore.waitingForOpponentToDiscard"
      persistent
      class="game-overlay"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        {{ t(opponentDiscardingText) }}
      </h1>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-resolve-three-scrim"
      v-model="gameStore.waitingForOpponentToPickFromScrap"
      persistent
      class="game-overlay"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        {{ t('game.overlays.opponentChoosingFromScrap') }}
      </h1>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-play-from-deck-scrim"
      v-model="showWaitingForOpponentToPlayFromDeck"
      class="game-overlay"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        {{ t('game.overlays.opponentPlayingFromDeck') }}
      </h1>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-to-discard-jack-from-deck"
      v-model="showWaitingForOpponentToDiscardJackFromDeck"
      persistent
      class="game-overlay"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        {{ t('game.overlays.opponentMustDiscardJack') }}
      </h1>
    </v-overlay>

    <v-overlay
      id="waiting-for-opponent-stalemate-scrim"
      v-model="gameStore.waitingForOpponentToStalemate"
      class="game-overlay"
    >
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', 'overlay-header']">
        <div>{{ t('game.overlays.opponentConsideringStalemate') }}</div>
      </h1>
    </v-overlay>

    <MoveChoiceOverlay
      v-if="selectedCard || cardSelectedFromDeck"
      :model-value="!targeting && (!!selectedCard || !!cardSelectedFromDeck)"
      :selected-card="selectedCard || cardSelectedFromDeck"
      :card-selected-from-deck="cardSelectedFromDeck"
      :is-players-turn="gameStore.isPlayersTurn"
      :opponent-queen-count="gameStore.opponentQueenCount"
      :frozen-id="gameStore.player.frozenId"
      :playing-from-deck="gameStore.playingFromDeck"
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
import { mapStores } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '@/stores/game';

import MoveChoiceOverlay from '@/routes/game/components/MoveChoiceOverlay.vue';
import GameCard from '@/routes/game/components/GameCard.vue';

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
  emits:[ 'points', 'face-card', 'one-off', 'clear-selection', 'target' ],
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      leavingGame: false,
    };
  },
  computed: {
    // Since we're not using namespacing, we need to destructure the game module
    // off of the global state to directly access the state values
    ...mapStores(useGameStore),
    waitingForGameToStart() {
      return !(this.gameStore.p0Ready && this.gameStore.p1Ready);
    },
    showWaitingForOpponetToCounterMessage() {
      const mayCounter = this.t('game.overlays.opponentMayCounter');
      const mustResolve = this.t('game.overlays.opponentMustResolve');
      const opponentHasTwo = this.gameStore.opponent.hand.some((card) => card.rank === 2);
      if (this.gameStore.playerQueenCount || (this.gameStore.hasGlassesEight && !opponentHasTwo)) {
        return mustResolve;
      }
      return mayCounter;
    },
    showWaitingForOpponentToDiscardJackFromDeck() {
      return (
        this.gameStore.waitingForOpponentToPlayFromDeck &&
        this.gameStore.topCard.rank === 11 &&
        (!this.gameStore.secondCard || this.gameStore.secondCard.rank === 11) &&
        (this.gameStore.opponentPointTotal === 0 || this.gameStore.opponentQueenCount > 0)
      );
    },
    showWaitingForOpponentToPlayFromDeck() {
      return this.gameStore.waitingForOpponentToPlayFromDeck && !this.showWaitingForOpponentToDiscardJackFromDeck;
    },
    opponentDiscardingText() {
      return this.gameStore.opponent.hand.length === 0 ?
        'game.overlays.opponentSkipsDiscarding' :
        'game.overlays.opponentIsDiscarding';
    },
  },
  methods: {
    handleTargeting(event) {
      this.$emit('target', event);
    },
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
