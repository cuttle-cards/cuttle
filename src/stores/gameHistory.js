import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import  { useGameStore } from '@/stores/game';
import { ROUTE_NAME_SPECTATE } from '@/router';
import GameStatus from '../../utils/GameStatus.json';

export const useGameHistoryStore = defineStore('gameHistory', () => {
  // Dependencies
  const route = useRoute();
  const gameStore = useGameStore();

  // State
  const gameStates = ref([]);
  // Every game of the match this game belongs to, oldest first, as summarized by
  // the server's getMatchGames helper
  const matchGames = ref([]);
  // Whether playback is auto-advancing through the game's states. On a live game this doubles as
  // "following the live edge". Ephemeral: deliberately kept out of the URL so gameStateIndex keeps
  // a single meaning and a shared link never arrives mid-playback
  const isPlaying = ref(false);

  const isSpectating = computed(() => route.name === ROUTE_NAME_SPECTATE);
  
  
  // Reactive getter for the current game state index from route query
  const currentGameStateIndex = computed(() => {
    // Get the query param and try to convert to number
    const index = Number(route.query.gameStateIndex);
    
    // Return -1 if:
    // 1. The query param is missing (NaN after Number conversion)
    // 2. Not a finite number
    // 3. Index is out of bounds of the gameStates array
    if (
      isNaN(index) || 
      !isFinite(index) || 
      index < 0
    ) {
      return -1;
    }
    
    return index;
  });

  const currentGameState = computed(() => {
    return gameStates.value.at(currentGameStateIndex.value) ?? null;
  });

  const priorGameStates = computed(() => {
    return currentGameStateIndex.value === -1 ? 
      [ ...gameStates.value ] : 
      gameStates.value.slice(0, currentGameStateIndex.value + 1);
  });

  const log = computed(() => {
    return currentGameStateIndex.value === -1 ? 
      [ ...gameStore.log ] : 
      gameStore.log.slice(0, currentGameStateIndex.value + 1);
  });

  // Spectating a game that is still being played, so new states keep arriving over the socket
  const isLive = computed(() => isSpectating.value && gameStore.status === GameStatus.STARTED);

  // Where the viewed state actually sits in gameStates; -1 in the url means "the latest"
  const resolvedGameStateIndex = computed(() => {
    return currentGameStateIndex.value === -1 ?
      gameStates.value.length - 1 :
      currentGameStateIndex.value;
  });

  const isAtLatestState = computed(() => resolvedGameStateIndex.value === gameStates.value.length - 1);

  // Following live updates is just play mode while on the latest state
  const isFollowingLive = computed(() => isLive.value && isPlaying.value && isAtLatestState.value);

  // Incoming states must not re-render the board unless the spectator is following the live edge
  const holdLiveUpdates = computed(() => isLive.value && !isFollowingLive.value);

  // How many states have arrived ahead of the one on screen. Derived rather than counted, so there's
  // nothing to reset and the number ticks up visibly as each move lands on a paused board
  const statesBehind = computed(() => {
    return isLive.value ?
      Math.max(0, gameStates.value.length - 1 - resolvedGameStateIndex.value) :
      0;
  });

  const showPlaybackControls = computed(() => isSpectating.value);

  // A single-game match has nothing to navigate between. Live games are never sent matchGames,
  // so this stays false for them without needing to say so
  const showGameSelector = computed(() => {
    return showPlaybackControls.value && matchGames.value.length >= 2;
  });

  const canGoToPreviousState = computed(() => {
    return gameStates.value.length >= 2 && 
      (currentGameStateIndex.value === -1 || currentGameStateIndex.value > 0);
  });

  const canGoToNextState = computed(() => {
    return currentGameStateIndex.value >= 0 && currentGameStateIndex.value < gameStates.value.length - 1;
  });

  // Pinned behind the live edge, there's always somewhere forward to go: back to the action
  const canGoLive = computed(() => isLive.value && currentGameStateIndex.value !== -1);

  const clipUrl = computed(() => {
    const { origin } = window.location;
    const gameId = gameStore.id;
    const gameStateIndex =
      (isSpectating.value && currentGameStateIndex.value !== -1) ?
        currentGameStateIndex.value : gameStates.value.length - 1;
    const pNum = gameStore.myPNum;
    return `${origin}/spectate/${gameId}?gameStateIndex=${gameStateIndex}&pNum=${pNum}`;
  });

  return {
    gameStates,
    matchGames,
    isPlaying,
    isSpectating,
    currentGameStateIndex,
    currentGameState,
    priorGameStates,
    log,
    isLive,
    resolvedGameStateIndex,
    isAtLatestState,
    isFollowingLive,
    holdLiveUpdates,
    statesBehind,
    showPlaybackControls,
    showGameSelector,
    canGoToPreviousState,
    canGoToNextState,
    canGoLive,
    clipUrl,
  };
});
