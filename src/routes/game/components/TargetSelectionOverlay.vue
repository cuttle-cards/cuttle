<template>
  <div id="player-hand-targeting" class="d-flex justify-start" :class="{ 'my-turn': isPlayersTurn }">
    <GameCard
      :suit="selectedCard.suit"
      :rank="selectedCard.rank"
      :is-selected="true"
      @click="$emit('cancel')"
    />
    <div id="target-selection-header-wrapper" class="d-flex flex-column align-center">
      <h2 v-if="isMultiTarget">
        Choose {{ requiredTargetCount }} {{ moveDisplayName }} Targets ({{ selectedTargetCount }}/{{
          requiredTargetCount
        }})
      </h2>
      <h2 v-else>
        Choose {{ moveDisplayName }} Target
      </h2>
      <div class="d-flex align-center mt-2">
        <v-btn
          variant="outlined"
          color="primary"
          data-cy="cancel-target"
          @click="$emit('cancel')"
        >
          Cancel
        </v-btn>
        <v-btn
          v-if="isMultiTarget"
          class="ml-2 confirm-targets"
          color="primary"
          variant="flat"
          size="large"
          :disabled="!allTargetsChosen"
          data-cy="confirm-targets"
          @click="$emit('confirm')"
        >
          Confirm
        </v-btn>
      </div>
    </div>
    <v-btn
      icon
      data-cy="cancel-target-mobile"
      aria-label="Cancel move"
      @click="$emit('cancel')"
    >
      <v-icon
        icon="mdi-close"
        size="x-large"
        color="base-dark"
        aria-hidden="true"
      />
    </v-btn>
  </div>
</template>

<script>
import GameCard from '@/routes/game/components/GameCard.vue';

export default {
  name: 'TargetSelectionOverlay',
  components: {
    GameCard,
  },
  props: {
    selectedCard: {
      type: Object,
      required: true,
    },
    isPlayersTurn: {
      type: Boolean,
      required: true,
    },
    moveDisplayName: {
      type: String,
      required: true,
    },
    // Nines need two targets chosen before the move is sent; everything else fires on click
    requiredTargetCount: {
      type: Number,
      default: 1,
    },
    selectedTargetCount: {
      type: Number,
      default: 0,
    },
  },
  emits: [ 'cancel', 'confirm' ],
  computed: {
    isMultiTarget() {
      return this.requiredTargetCount > 1;
    },
    allTargetsChosen() {
      return this.selectedTargetCount === this.requiredTargetCount;
    },
  },
};
</script>

<style scoped lang="scss">
#player-hand-targeting {
  padding: 12px;
  contain: var(--contain-isolated);
}
#target-selection-header-wrapper {
  width: 100%;
}

/* Draws the eye once both targets are chosen, mirroring BaseDialog's .dialog-activator fab */
.confirm-targets:not(:disabled) {
  position: relative;
  overflow: hidden;
  animation: pulse-glow 2s infinite ease-in-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -150%;
    width: 200%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
    animation: strong-shimmer 4s infinite;
    z-index: 1;
  }

  &:hover::before {
    animation: strong-shimmer 2s infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    & {
      animation: none;

      &::before {
        animation: none;
      }
    }
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 15px rgba(225, 48, 108, 0.6);
  }
  50% {
    box-shadow: 0 0 35px rgba(225, 48, 108, 1);
  }
}

@keyframes strong-shimmer {
  0% {
    transform: translateX(-150%) skewX(-20deg);
  }
  100% {
    transform: translateX(150%) skewX(-20deg);
  }
}
</style>
