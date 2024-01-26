<template>
  <section class="match-status-banner" :class="wrapperClass" data-cy="continue-match-banner">
    <div class="banner-content">
      <v-icon
        v-if="!gameStore.someoneDeclinedRematch"
        :icon="matchStatusIcon"
        color="surface-2"
        :data-cy="matchStatusIconDataCy"
      />
      <h2 class="banner-h2" :class="headerClass">
        {{ headerText }}
      </h2>
      <v-icon
        v-if="!gameStore.someoneDeclinedRematch"
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
  if (gameStore.someoneDeclinedRematch) {
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

const headerClass = computed(() => !gameStore.someoneDeclinedRematch && gameStore.iWantToContinueSpectating ? 'loading' : '');

const wrapperClass = computed(() => {
  if (gameStore.someoneDeclinedRematch) {
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

    // https://stackoverflow.com/questions/13014808/is-there-any-way-to-animate-an-ellipsis-with-css-animations
    &.loading:after {
      overflow: hidden;
      display: inline-block;
      vertical-align: bottom;
      animation: ellipsis-animation steps(1,end) 2s infinite;
      content: "\2026"; /* ascii code for the ellipsis character */
    }
  }

  & .banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
}

@keyframes ellipsis-animation {
    0%  { clip-path: inset(0 100% 0 0); }
    25% { clip-path: inset(0 66.6% 0 0); }
    50% { clip-path: inset(0 33.3% 0 0); }
    75% { clip-path: inset(0 0 0 0); }
}
</style>