<template>
  <menu id="playback-controls" data-cy="playback-controls">
    <UsernameToolTip id="player-username-container" :username="gameStore.playerUsername" />
    <span id="playback-controls-button-wrapper">
      <!-- Skip backward -->
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

      <!-- Skip forward -->
      <v-btn
        :disabled="!gameHistoryStore.canGoToNextState"
        variant="text"
        icon="mdi-skip-forward"
        data-cy="skip-forward"
        @click="goToState(-1)"
      />
    </span>
  </menu>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGameHistoryStore } from '@/stores/gameHistory';
import { useGameStore } from '@/stores/game';
import UsernameToolTip from '@/routes/game/components/UsernameToolTip.vue';

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
  await gameStore.requestGameState(gameStore.id, newVal);
});
</script>

<style scoped>
#playback-controls {
  position: fixed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  bottom: 0;
  background-color: rgba(var(--v-theme-surface-1)) !important;
  width: 100%;
}

#playback-controls-button-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

#player-username-container {
  justify-self: flex-start;
}
</style>
