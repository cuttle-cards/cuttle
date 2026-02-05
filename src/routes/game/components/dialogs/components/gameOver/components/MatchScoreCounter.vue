<template>
  <div class="outer-container">
    <div class="inner-container" :class="isRanked ? 'ranked' : 'casual'" data-cy="match-score-counter">
      <span
        class="individual-score"
        :class="{'selected': latestResult === 'Won'}"
        data-cy="match-score-counter-wins"
      >
        {{ winsLabel }}: {{ wins }}
      </span>
      <span
        class="individual-score"
        :class="{'selected': latestResult === 'Lost'}"
        data-cy="match-score-counter-losses"
      >
        {{ lossesLabel }}: {{ losses }}
      </span>
      <span
        class="individual-score"
        :class="{'selected': latestResult === 'Stalemate'}"
        data-cy="match-score-counter-stalemates"
      >
        T: {{ stalemates }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  stalemates: {
    type: Number,
    default: 0,
  },
  latestResult: {
    type: String,
    required: true,
    validator: (val) => [ 'Won', 'Lost', 'Stalemate' ].includes(val),
  },
  isRanked: {
    type: Boolean,
    required: true,
  },
  isSpectating: {
    type: Boolean,
    default: false,
  },
});

const winsLabel = computed(() => props.isSpectating ? 'P1' : 'W');
const lossesLabel = computed(() => props.isSpectating ? 'P2' : 'L');
</script>

<style scoped lang="scss">
.outer-container {
  display: flex;
  justify-content: center;
}

.inner-container {
  display: flex;
  padding: 4px 8px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 800;
  background-color: rgba(var(--v-theme-game-card));
  color: rgba(var(--v-theme-game-board));
}

.individual-score {
  border-radius: 8px;
  margin: 8px;
  padding: 8px;

  .ranked &.selected {
    background-color: rgba(var(--v-theme-primary));
    color: rgba(var(--v-theme-game-card));
  }

  .casual &.selected {
    background-color: rgba(var(--v-theme-casual));
    color: rgba(var(--v-theme-game-card));
  }
}
</style>
