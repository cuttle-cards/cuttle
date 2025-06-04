<template>
  <menu data-cy="playback-controls">
    <v-btn
      :disabled="!gameHistoryStore.canGoToPreviousState"
      variant="text"
      icon="mdi-skip-backward"
      data-cy="skip-backward"
      @click="goToState(0)"
    />
    <!-- Step backward -->
    <v-btn
      :disabled="!gameHistoryStore.canGoToPreviousState"
      variant="text"
      icon="mdi-step-backward"
      data-cy="step-backward"
      @click="goToState(currentGameStateIndex - 1)"
    />

    <!-- Step forward -->
    <v-btn
      :disabled="!gameHistoryStore.canGoToNextState"
      variant="text"
      icon="mdi-step-forward"
      data-cy="step-forward"
      @click="goToState(currentGameStateIndex + 1)"
    />
    <v-btn variant="text" icon="mdi-skip-forward" data-cy="skip-forward" />
  </menu>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGameHistoryStore } from '@/stores/gameHistory';
import { useGameStore } from '@/stores/game';

const router = useRouter();
const gameHistoryStore = useGameHistoryStore();
const gameStore = useGameStore();

const currentGameStateIndex = computed(() => gameHistoryStore.currentGameStateIndex);

function goToState(gameStateIndex) {
  const route = router.currentRoute.value;
  router.push({
    ...route,
    query: {
      ...route.query,
      gameStateIndex,
    },
  });  
}

watch(() => gameHistoryStore.currentGameStateIndex, async (newVal) => {
  console.log(`requesting gamestate ${newVal}`);
  await gameStore.requestGameState(gameStore.id, newVal);
});
</script>
