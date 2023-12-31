<template>
  <section class="match-status-banner" :class="isRanked ? 'ranked' : 'casual'" data-cy="continue-match-banner">
    <div class="banner-content">
      <v-icon :icon="matchStatusIcon" color="surface-2" :data-cy="matchStatusIconDataCy" />
      <h2 class="banner-h2">
        {{ headerText }}
      </h2>
      <v-icon :icon="matchStatusIcon" color="surface-2" :data-cy="matchStatusIconDataCy" />
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
  if (gameStore.winnerPNum === null) {
    return 'Stalemate';
  }
  const winnerUsername = gameStore.players[gameStore.winnerPNum].username;
  return `${winnerUsername} won`;
});

const playingHeader = computed(() => {
  if (gameStore.iWantRematch) {
    return 'Waiting for Opponent';
  }

  if (!isRanked.value) {
    return 'Rematch?';
  }

  if (gameStore.currentMatch?.winner === null) {
    return 'Continue Match?';
  }

  const youLose = gameStore.currentMatch?.winner === gameStore.opponent.id;
  return youLose ? `${gameStore.opponent.username} Won` : `You beant ${gameStore.opponent.username}`;
});

const headerText = computed(() => {
  return isSpectating.value ? specatingHeader.value : playingHeader.value;
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