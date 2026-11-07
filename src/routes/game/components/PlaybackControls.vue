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
        :size="buttonSize"
        icon="mdi-skip-backward"
        data-cy="skip-backward"
        @click="goToState(0)"
      />

      <!-- Step backward -->
      <v-btn
        :disabled="!gameHistoryStore.canGoToPreviousState"
        variant="text"
        :size="buttonSize"
        icon="mdi-step-backward"
        data-cy="step-backward"
        @click="goToState(previousGameStateIndex)"
      />

      <!-- Play / pause: only the one that applies is shown -->
      <v-btn
        :disabled="!gameHistoryStore.isPlaying && !gameHistoryStore.canGoToNextState"
        variant="text"
        :size="buttonSize"
        :icon="gameHistoryStore.isPlaying ? 'mdi-pause' : 'mdi-play'"
        :aria-label="t(gameHistoryStore.isPlaying ? 'game.playbackControls.pause' : 'game.playbackControls.play')"
        :data-cy="gameHistoryStore.isPlaying ? 'pause' : 'play'"
        @click="togglePlayback"
      />

      <!-- Step forward -->
      <v-btn
        :disabled="!gameHistoryStore.canGoToNextState"
        variant="text"
        :size="buttonSize"
        icon="mdi-step-forward"
        data-cy="step-forward"
        @click="goToState(currentGameStateIndex + 1)"
      />

      <!-- Skip forward -->
      <v-btn
        :disabled="!gameHistoryStore.canGoToNextState"
        variant="text"
        :size="buttonSize"
        icon="mdi-skip-forward"
        data-cy="skip-forward"
        @click="goToState(-1)"
      />
    </span>
  </menu>
</template>

<script setup>
import { computed, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useGameHistoryStore } from '@/stores/gameHistory';
import { useGameStore } from '@/stores/game';
import UsernameToolTip from '@/routes/game/components/UsernameToolTip.vue';
import MatchGameSelector from '@/routes/game/components/MatchGameSelector.vue';
import { getPlaybackDelay } from '@/util/playbackDelay';

const { t } = useI18n();
const router = useRouter();
const { xs } = useDisplay();
const gameHistoryStore = useGameHistoryStore();
const gameStore = useGameStore();

// Five buttons plus the game selector and username don't fit on phones at the default size
const buttonSize = computed(() => (xs.value ? 'small' : 'default'));

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

let advanceTimer = null;
// Identifies the most recent navigation, so a slow response for a superseded one can't schedule an advance
let navigationId = 0;
// True from the moment a navigation requests its state until that state (and its animation) has finished loading
let isLoadingState = false;

function clearAdvanceTimer() {
  clearTimeout(advanceTimer);
  advanceTimer = null;
}

function pause() {
  gameHistoryStore.isPlaying = false;
  clearAdvanceTimer();
}

/**
 * Queue the move to the next state after the real gap between the two moves. Always called after the current state
 * has loaded, so requests can't pile up or resolve out of order. Playing past the final state ends playback.
 */
function scheduleAdvance() {
  clearAdvanceTimer();
  if (!gameHistoryStore.isPlaying) {
    return;
  }
  if (!gameHistoryStore.canGoToNextState) {
    return pause();
  }
  const fromIndex = currentGameStateIndex.value;
  const { gameStates } = gameHistoryStore;
  const delay = getPlaybackDelay(gameStates[fromIndex], gameStates[fromIndex + 1]);
  advanceTimer = setTimeout(() => goToState(fromIndex + 1), delay);
}

function togglePlayback() {
  if (gameHistoryStore.isPlaying) {
    return pause();
  }
  gameHistoryStore.isPlaying = true;
  // If the current state is still loading, the watcher schedules the advance once it lands. Starting the timer now
  // could load the next state before this one finishes animating, which would then overwrite it with older moves
  if (!isLoadingState) {
    scheduleAdvance();
  }
}

// -1 means "latest", so resolve it to a real position before comparing direction
function resolveIndex(gameStateIndex) {
  return gameStateIndex === -1 ? gameHistoryStore.gameStates.length - 1 : gameStateIndex;
}

watch(() => gameHistoryStore.currentGameStateIndex, async (newVal, oldVal) => {
  // Any navigation resets the timer, so stepping forward during playback hurries it along without stopping it
  clearAdvanceTimer();
  // Moving backward pauses, however it happened (buttons or browser history)
  if (resolveIndex(newVal) < resolveIndex(oldVal)) {
    pause();
  }

  const thisNavigationId = ++navigationId;
  isLoadingState = true;
  let res;
  try {
    res = await gameStore.requestGameState(gameStore.id, newVal);
  } catch (err) {
    pause();
    throw err;
  } finally {
    // Only the latest navigation settles the loading state; a superseded one finishing must not clear it early
    if (thisNavigationId === navigationId) {
      isLoadingState = false;
    }
  }
  // A null response means the user must reauthenticate before anything else can load
  if (res === null) {
    return pause();
  }
  if (thisNavigationId === navigationId) {
    scheduleAdvance();
  }
});

// Switching games (e.g. via the match game selector) bypasses goToState, so don't carry playback into the new game
watch(() => gameStore.id, pause);

onUnmounted(pause);
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
@media (max-width: 600px) {
  #player-username-container :deep(.username) {
    padding-inline: 0.5em;
  }

  .match-game-selector :deep(.v-field) {
    --v-field-padding-start: 10px;
    --v-field-padding-end: 2px;
  }
}
</style>
