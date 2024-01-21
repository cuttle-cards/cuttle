<template>
  <section class="match-status-banner" :class="wrapperClass" data-cy="continue-match-banner">
    <div class="banner-content">
      <v-icon
        v-if="!gameStore.opponentDeclinedRematch"
        :icon="matchStatusIcon"
        color="surface-2"
        :data-cy="matchStatusIconDataCy"
      />
      <h2 class="banner-h2">
        {{ headerText }}
      </h2>
      <v-icon
        v-if="!gameStore.opponentDeclinedRematch"
        :icon="matchStatusIcon"
        color="surface-2"
        :data-cy="matchStatusIconDataCy"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useGameStore } from '@/stores/game.js';

const gameStore = useGameStore();

const isRanked = computed(() => gameStore.isRanked);
const isSpectating = computed(() => gameStore.isSpectating);

const matchStatusIcon = computed(() => isRanked.value ? 'mdi-sword-cross' : 'mdi-coffee-outline');
const matchStatusIconDataCy = computed(() => isRanked.value ? 'ranked-icon' : 'casual-icon');

const specatingHeader = computed(() => {
  const someOneDeclinedRematch = [gameStore.p0Rematch, gameStore.p1Rematch].includes(false);
  if (someOneDeclinedRematch) {
    return 'Player left - click to go home.';
  }
  if (gameStore.iWantToContinueSpectating) {
    return 'Waiting for Players';
  }
  if (gameStore.currentMatch?.winner) {
    return 'Good Match!';
  }
  return 'Continue Spectating?';
});

const playingHeader = computed(() => {
  if (gameStore.opponentDeclinedRematch) {
    return 'Opponent left - click to go home.';
  }

  if (gameStore.iWantRematch) {
    return 'Waiting for Opponent';
  }

  if (!isRanked.value) {
    return 'Rematch?';
  }

  if (gameStore.currentMatch?.winner === null) {
    return 'Continue Match?';
  }

  return 'Good Match!';
});

const headerText = computed(() => {
  return isSpectating.value ? specatingHeader.value : playingHeader.value;
});

const wrapperClass = computed(() => {
  if (gameStore.opponentDeclinedRematch) {
    return 'opponent-left';
  }
  return isRanked.value ? 'ranked' : 'casual';
});
</script>

<style scoped lang="scss">
.match-status-banner {
  margin: 0px -24px -10px -24px;
  padding: 8px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &.ranked {
    background-color: rgba(var(--v-theme-newPrimary));
  }
  &.casual {
    background-color: rgba(var(--v-theme-newSecondary));
  }
  &.opponent-left {
    background-color: #FAAB34;
    color: rgba(var(--v-theme-surface-1));
    & .banner-content {
      justify-content: center;
    }
  }

  & .banner-h2 {
    text-align: center;
    font-size: 32px;
    font-style: normal;
    font-weight: 700;
    line-height: 32px;
    margin: 8px;
  }

  & .banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
}
</style>