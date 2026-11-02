<template>
  <menu id="playback-controls" data-cy="playback-controls">
    <UsernameToolTip id="player-username-container" :username="gameStore.playerUsername" />
    <span id="playback-controls-button-wrapper">
      <!-- Jump to another game in this match -->
      <MatchGameSelector
        v-if="gameHistoryStore.showGameSelector"
        class="match-game-selector"
        :class="xs ? 'mr-1' : 'mr-4'"
      />

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
        @click="goToState(previousGameStateIndex)"
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
import { useDisplay } from 'vuetify';
import { useGameHistoryStore } from '@/stores/gameHistory';
import { useGameStore } from '@/stores/game';
import UsernameToolTip from '@/routes/game/components/UsernameToolTip.vue';
import MatchGameSelector from '@/routes/game/components/MatchGameSelector.vue';

const router = useRouter();
const { xs } = useDisplay();
const gameHistoryStore = useGameHistoryStore();
const gameStore = useGameStore();

const currentGameStateIndex = computed(() => gameHistoryStore.currentGameStateIndex);

const previousGameStateIndex = computed(() => currentGameStateIndex.value === -1 ?
  gameHistoryStore.gameStates.length - 2 :
  currentGameStateIndex.value - 1
);

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
  background-color: rgba(var(--v-theme-base-dark)) !important;
  width: 100%;
  z-index: 2500; /* greater than v-dialog's z-index */
}

#playback-controls-button-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

#player-username-container {
  justify-self: flex-start;
  /* Let the username truncate before the game selector or buttons get squeezed on narrow screens */
  min-width: 0;
}

.match-game-selector {
  flex-shrink: 0;
}

/* Reclaim horizontal space on phones, where the bar also holds the username and four buttons */
@media (max-width: 599.98px) {
  #player-username-container :deep(.username) {
    padding-inline: 0.5em;
  }

  .match-game-selector :deep(.v-field) {
    --v-field-padding-start: 10px;
    --v-field-padding-end: 2px;
  }
}
</style>
