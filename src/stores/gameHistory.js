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
      index < 0 || 
      index >= gameStates.value.length
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

  const showPlaybackControls = computed(() => {
    return isSpectating.value && [ GameStatus.FINISHED, GameStatus.ARCHIVED ].includes(gameStore.status);
  });

  const canGoToPreviousState = computed(() => {
    return gameStates.value.length >= 2 && 
      (currentGameStateIndex.value === -1 || currentGameStateIndex.value > 0);
  });

  const canGoToNextState = computed(() => {
    return currentGameStateIndex.value >= 0 && currentGameStateIndex.value < gameStates.value.length - 1;
  });

  const clipUrl = computed(() => {
    const { origin } = window.location;
    const gameId = gameStore.id;
    const gameStateIndex = 
      (isSpectating.value && currentGameStateIndex.value !== -1) ?
        currentGameStateIndex.value : gameStates.value.length - 1;
    return `${origin}/spectate/${gameId}?gameStateIndex=${gameStateIndex}`;
  });

  return {
    gameStates,
    isSpectating,
    currentGameStateIndex,
    currentGameState,
    priorGameStates,
    log,
    showPlaybackControls,
    canGoToPreviousState,
    canGoToNextState,
    clipUrl,
  };
});
