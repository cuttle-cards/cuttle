// stores/gameHistoryStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import  { useGameStore } from '@/stores/game';

export const useGameHistoryStore = defineStore('gameHistory', () => {
  // Dependencies
  const route = useRoute();
  const gameStore = useGameStore();

  // State
  const gameStates = ref([]);
  
  
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
  
  return {
    gameStates,
    currentGameStateIndex,
    currentGameState,
    priorGameStates,
    log,
  };
});
