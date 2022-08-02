<template>
  <div class="game-overlays">
    <v-overlay
      id="waiting-for-opponent-counter-scrim"
      v-model="waitingForOpponentToCounter"
      opacity=".6"
    >
      <h1>Opponent May Counter</h1>
    </v-overlay>
    <v-overlay
      id="waiting-for-opponent-discard-scrim"
      v-model="waitingForOpponentToDiscard"
      opacity=".6"
    >
      <h1>Opponent Is Discarding</h1>
    </v-overlay>
    <v-overlay
      id="waiting-for-opponent-resolve-three-scrim"
      v-model="waitingForOpponentToPickFromScrap"
      opacity=".6"
    >
      <h1>Opponent Choosing Card from Scrap</h1>
    </v-overlay>
    <v-overlay
      id="waiting-for-opponent-play-from-deck-scrim"
      v-model="waitingForOpponentToPlayFromDeck"
      opacity=".6"
    >
      <h1>Opponent Playing from Deck</h1>
    </v-overlay>
    <move-choice-overlay
      :value="!targeting && (!!selectedCard || !!cardSelectedFromDeck)"
      :selected-card="selectedCard || cardSelectedFromDeck"
      :is-players-turn="isPlayersTurn"
      :opponent-queen-count="opponentQueenCount"
      @points="$emit('points')"
      @faceCard="$emit('face-card')"
      @oneOff="$emit('one-off')"
      @scuttle="handleTargeting"
      @jack="handleTargeting"
      @targetedOneOff="handleTargeting"
      @cancel="$emit('clear-selection')"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import MoveChoiceOverlay from '@/components/GameView/MoveChoiceOverlay.vue';

export default {
  name: 'GameOverlays',
  components: {
    MoveChoiceOverlay,
  },
  props: {
    targeting: {
      type: Boolean,
      required: true,
    },
    selectedCard: {
      type: Object,
      default: null,
      validator: (value) => {
        return typeof value === Object || value === null;
      },
    },
    cardSelectedFromDeck: {
      type: Object,
      default: null,
      validator: (value) => {
        return typeof value === Object || value === null;
      },
    },
  },
  computed: {
    // Since we're not using namespacing, we need to destructure the game module
    // off of the global state to directly access the state values
    ...mapState({
      waitingForOpponentToCounter: ({ game }) => game.waitingForOpponentToCounter,
      waitingForOpponentToDiscard: ({ game }) => game.waitingForOpponentToDiscard,
      waitingForOpponentToPickFromScrap: ({ game }) => game.waitingForOpponentToPickFromScrap,
      waitingForOpponentToPlayFromDeck: ({ game }) => game.waitingForOpponentToPlayFromDeck,
    }),
    ...mapGetters(['isPlayersTurn', 'opponentQueenCount']),
  },
  methods: {
    handleTargeting(event) {
      this.$emit('target', event);
    },
  },
};
</script>
