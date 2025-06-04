<template>
  <menu data-cy="playback-controls">
    <v-btn variant="text" icon="mdi-skip-backward" data-cy="skip-backward" />
    <!-- Step backward -->
    <v-btn
      :disabled="!gameHistoryStore.canGoToPreviousState"
      variant="text"
      icon="mdi-step-backward"
      data-cy="step-backward"
      @click="stepBackward"
    />

    <!-- Step forward -->
    <v-btn
      :disabled="!gameHistoryStore.canGoToNextState"
      variant="text"
      icon="mdi-step-forward"
      data-cy="step-forward"
      @click="stepForward"
    />
    <v-btn variant="text" icon="mdi-skip-forward" data-cy="skip-forward" />
  </menu>
</template>

<script setup>
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGameHistoryStore } from '@/stores/gameHistory';
import { useGameStore } from '@/stores/game';

const router = useRouter();
const gameHistoryStore = useGameHistoryStore();
const gameStore = useGameStore();

function stepBackward() {
  const route = router.currentRoute.value;
  router.push({
    ...route,
    query: {
      ...route.query,
      gameStateIndex: gameHistoryStore.currentGameStateIndex - 1,
    },
  });  
}

function stepForward() {
  const route = router.currentRoute.value;
  router.push({
    ...route,
    query: {
      ...route.query,
      gameStateIndex: gameHistoryStore.currentGameStateIndex + 1,
    },
  });
}

watch(() => gameHistoryStore.currentGameStateIndex, async (newVal) => {
  console.log(`requesting gamestate ${newVal}`);
  await gameStore.requestGameState(gameStore.id, newVal);
});
</script>
