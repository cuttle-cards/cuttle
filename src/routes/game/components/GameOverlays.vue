<template>
  <div class="game-overlays">
    <BaseOverlay
      id="waiting-for-game-to-start-scrim"
      v-model="waitingForGameToStart"
      persistent
    >
      <template #header>
        {{ t('game.overlays.waitingForGameToStart') }}
      </template>
      <v-btn
        color="secondary"
        class="mt-4"
        data-cy="leave-unstarted-game-button"
        :loading="leavingGame"
        @click="goHome"
      >
        {{ t('game.overlays.leaveGame') }}
      </v-btn>
    </BaseOverlay>

    <BaseOverlay
      id="waiting-for-opponent-counter-scrim"
      v-model="gameStore.waitingForOpponentToCounter"
      persistent
      scrim="surface-dark"
    >
      <template #header>
        {{ showWaitingForOpponentToCounterMessage }}
      </template>
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
    </BaseOverlay>

    <BaseOverlay
      id="waiting-for-opponent-discard-scrim"
      v-model="gameStore.waitingForOpponentToDiscard"
      persistent
    >
      <template #header>
        {{ opponentDiscardingText }}
      </template>
    </BaseOverlay>

    <BaseOverlay
      id="waiting-for-opponent-resolve-three-scrim"
      v-model="gameStore.waitingForOpponentToPickFromScrap"
      persistent
    >
      <template #header>
        {{ choosingFromScrapMessage }}
      </template>
    </BaseOverlay>

    <BaseOverlay
      id="waiting-for-opponent-play-from-deck-scrim"
      v-model="showWaitingForOpponentToPlayFromDeck"
    >
      <template #header>
        {{ t('game.overlays.playingFromDeck', { opponentUsername }) }}
      </template>
    </BaseOverlay>

    <BaseOverlay
      id="waiting-for-opponent-to-discard-jack-from-deck"
      v-model="showWaitingForOpponentToDiscardJackFromDeck"
      persistent
    >
      <template #header>
        {{ t('game.overlays.mustDiscardJack', { opponentUsername }) }}
      </template>
    </BaseOverlay>

    <BaseOverlay
      id="waiting-for-opponent-stalemate-scrim"
      v-model="gameStore.waitingForOpponentToStalemate"
    >
      <template #header>
        {{ t('game.overlays.consideringStalemate', { opponentUsername }) }}
      </template>
    </BaseOverlay>

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

import BaseOverlay from '@/components/BaseOverlay.vue';
import MoveChoiceOverlay from '@/routes/game/components/MoveChoiceOverlay.vue';
import GameCard from '@/routes/game/components/GameCard.vue';

export default {
  name: 'GameOverlays',
  components: {
    BaseOverlay,
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
  emits: [ 'points', 'face-card', 'one-off', 'clear-selection', 'target' ],
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
    ...mapStores(useGameStore),
    waitingForGameToStart() {
      return !(this.gameStore.p0Ready && this.gameStore.p1Ready);
    },
    choosingFromScrapMessage(){
      return this.t('game.overlays.choosingFromScrap', { opponentUsername: this.opponentUsername });
    },
    showWaitingForOpponentToCounterMessage() {
      const mayCounter = this.t('game.overlays.mayCounter', { opponentUsername: this.opponentUsername });
      const mustResolve = this.t('game.overlays.mustResolve', { opponentUsername: this.opponentUsername });
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
      return (
        this.gameStore.waitingForOpponentToPlayFromDeck && !this.showWaitingForOpponentToDiscardJackFromDeck
      );
    },
    opponentUsername() {
      return this.gameStore.opponentUsername;
    },
    opponentDiscardingText() {
      return this.gameStore.opponent.hand.length === 0
        ? this.t('game.overlays.skipsDiscarding', { opponentUsername: this.opponentUsername })
        : this.t('game.overlays.isDiscarding', { opponentUsername: this.opponentUsername });
    },
  },
  methods: {
    handleTargeting(event) {
      this.$emit('target', event);
    },
    async goHome() {
      this.leavingGame = true;
      this.leavingGame = false;
      this.$router.push('/');
      this.gameStore.setGameOver({
        gameOver: false,
        conceded: false,
        winner: null,
      });
    },
  },
};
</script>

<style scoped lang="scss">
.game-overlays {
  contain: var(--contain-isolated);
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
