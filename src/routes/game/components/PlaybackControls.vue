<template>
  <menu id="playback-controls" data-cy="playback-controls">
    <UsernameToolTip
      id="player-username-container"
      :username="gameStore.playerUsername"
      :is-player="true"
    />
    <span id="playback-controls-button-wrapper">
      <!-- Jump to another game in this match -->
      <MatchGameSelector
        v-if="gameHistoryStore.showGameSelector"
        class="match-game-selector"
        :class="xs ? 'mr-1' : 'mr-4'"
      />

      <!--
        Whether the board is keeping up with the game. Paused and playing look identical at the live
        edge while a player thinks, so the only other signal -- the play/pause icon -- isn't enough
      -->
      <v-chip
        v-if="gameHistoryStore.isLive"
        class="live-indicator"
        :class="xs ? 'mr-1' : 'mr-4'"
        size="small"
        variant="flat"
        label
        :color="gameHistoryStore.isFollowingLive ? 'error' : 'surface-2'"
        :data-live="gameHistoryStore.isFollowingLive"
        data-cy="live-indicator"
      >
        {{ t(`game.playbackControls.${gameHistoryStore.isFollowingLive ? 'live' : 'paused'}`) }}
      </v-chip>

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
        :disabled="!gameHistoryStore.isPlaying && !gameHistoryStore.canGoToNextState && !gameHistoryStore.isLive"
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

      <!--
        Skip forward, which on a live game is the "take me back to the action" button. The badge is
        the only thing that moves while a paused spectator falls behind, so it carries the count
      -->
      <v-badge
        :model-value="gameHistoryStore.statesBehind > 0"
        :content="gameHistoryStore.statesBehind"
        color="error"
        offset-x="8"
        data-cy="states-behind-badge"
      >
        <v-btn
          :disabled="!gameHistoryStore.canGoToNextState && !gameHistoryStore.canGoLive"
          variant="text"
          :size="buttonSize"
          icon="mdi-skip-forward"
          :aria-label="skipForwardLabel"
          data-cy="skip-forward"
          @click="goToState(-1)"
        />
      </v-badge>
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

const skipForwardLabel = computed(() => {
  if (!gameHistoryStore.isLive) {
    return undefined;
  }
  const count = gameHistoryStore.statesBehind;
  return count > 0 ?
    t('game.playbackControls.goLiveNewStates', { count }) :
    t('game.playbackControls.goLive');
});

// -1 means "latest", so resolve it to a real position before comparing direction
function resolveIndex(gameStateIndex) {
  return gameStateIndex === -1 ? gameHistoryStore.gameStates.length - 1 : gameStateIndex;
}

function navigateTo(gameStateIndex, { replace = false } = {}) {
  const route = router.currentRoute.value;
  const target = { ...route, query: { ...route.query, gameStateIndex } };
  return replace ? router.replace(target) : router.push(target);
}

/**
 * On a live game `gameStateIndex=-1` means "the latest, and keep up with it", so landing on the
 * latest state is going live: the url says -1 and playback resumes. Reaching the live edge by
 * stepping counts, same as skipping to it.
 */
function goToState(gameStateIndex) {
  if (gameHistoryStore.isLive && resolveIndex(gameStateIndex) >= gameHistoryStore.gameStates.length - 1) {
    // Going live from the state already on screen only rewrites the url, so keep it out of history:
    // browser-back must not be able to land on a pinned url while playback is following the edge
    const replace = gameHistoryStore.isAtLatestState;
    gameHistoryStore.isPlaying = true;
    return navigateTo(-1, { replace });
  }
  return navigateTo(gameStateIndex);
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

// Stop playing without touching the url, for when there's no view left to pin (unmount, game switch)
function stopPlayback() {
  gameHistoryStore.isPlaying = false;
  clearAdvanceTimer();
}

function pause() {
  stopPlayback();
  // -1 keeps up with the live edge, so pausing there has to pin the url to the state on screen.
  // Otherwise the next move would leave the url claiming a position the board isn't at
  if (gameHistoryStore.isLive && currentGameStateIndex.value === -1) {
    navigateTo(gameHistoryStore.gameStates.length - 1, { replace: true });
  }
}

/**
 * Queue the move to the next state after the real gap between the two moves. Always called after the current state
 * has loaded, so requests can't pile up or resolve out of order. Playing past the final state ends playback on a
 * finished game; on a live one the latest state is a resting place, where playback waits for the next move.
 */
function scheduleAdvance() {
  clearAdvanceTimer();
  if (!gameHistoryStore.isPlaying) {
    return;
  }
  if (!gameHistoryStore.canGoToNextState) {
    if (!gameHistoryStore.isLive) {
      return pause();
    }
    if (currentGameStateIndex.value !== -1) {
      goToState(-1);
    }
    return;
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
  // Pressing play at the live edge rejoins the game rather than replaying anything
  if (gameHistoryStore.isLive && gameHistoryStore.isAtLatestState) {
    return goToState(-1);
  }
  gameHistoryStore.isPlaying = true;
  // If the current state is still loading, the watcher schedules the advance once it lands. Starting the timer now
  // could load the next state before this one finishes animating, which would then overwrite it with older moves
  if (!isLoadingState) {
    scheduleAdvance();
  }
}

watch(() => gameHistoryStore.currentGameStateIndex, async (newVal, oldVal) => {
  // Any navigation resets the timer, so stepping forward during playback hurries it along without stopping it
  clearAdvanceTimer();
  const from = resolveIndex(oldVal);
  const to = resolveIndex(newVal);
  // Moving backward pauses, however it happened (buttons or browser history)
  if (to < from) {
    pause();
  }
  // Arriving at -1 on a live game means following the live edge, however it happened. Browser
  // history can land here while paused, and a -1 url that nothing keeps up with would strand the
  // spectator: the forward buttons read as disabled and no count shows how far behind they are
  if (gameHistoryStore.isLive && newVal === -1) {
    gameHistoryStore.isPlaying = true;
  }
  // Pinning or unpinning the live edge rewrites the url between -1 and its index without moving the
  // board. There's nothing to fetch, and re-animating the state already on screen would be wrong
  if (to === from) {
    scheduleAdvance();
    return;
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

// Switching games (e.g. via the match game selector, or a rematch) starts over: follow a live game
// from its edge, and wait on the first state of a finished one
watch(() => gameStore.id, () => {
  stopPlayback();
  gameHistoryStore.isPlaying = gameHistoryStore.isLive;
});

onUnmounted(stopPlayback);
</script>

<style scoped>
#playback-controls {
  /* Pinned, so TheSnackbar can rely on how much room the bar takes at the bottom */
  min-height: 56px;
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

.match-game-selector,
.live-indicator {
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
