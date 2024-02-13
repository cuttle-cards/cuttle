import { computed } from 'vue';
import { useGameStore } from '@/stores/game';

export const WhichPlayer = {
  CURRENT_PLAYER: 'current_player',
  CURRENT_OPPONENT: 'current_opponent',
  ORIGINAL_P0: 'original_p0',
  ORIGINAL_P1: 'original_p1',
};

export function usePlayerData(whichPlayer) {
  const gameStore = useGameStore();

  const firstGameThisMatch = computed(() => gameStore.currentMatch?.games[0] ?? null);

  const originalP0 = computed(() => {
    return firstGameThisMatch.value?.p0 === gameStore.opponent.id ? gameStore.opponent : gameStore.player;
  });

  const originalP1 = computed(() => {
    return firstGameThisMatch.value?.p1 === gameStore.opponent.id ? gameStore.opponent : gameStore.player;
  });

  const username = computed(() => {
    switch (whichPlayer) {
      case WhichPlayer.CURRENT_PLAYER:
        return gameStore.player.username;
      case WhichPlayer.CURRENT_OPPONENT:
        return gameStore.opponent.username;
      case WhichPlayer.ORIGINAL_P0:
        return originalP0.value.username;
      case WhichPlayer.ORIGINAL_P1:
        return originalP1.value.username;
      default:
        return '';
    }
  });

  const rematch = computed(() => {
    switch (whichPlayer) {
      case WhichPlayer.CURRENT_PLAYER:
        return gameStore.iWantRematch;
      case WhichPlayer.CURRENT_OPPONENT:
        return gameStore.opponentWantsRematch;
      case WhichPlayer.ORIGINAL_P0:
        return originalP0.value.id === gameStore.opponent.id ? gameStore.opponentWantsRematch : gameStore.iWantRematch;
      case WhichPlayer.ORIGINAL_P1:
        return originalP1.value.id === gameStore.opponent.id ? gameStore.opponentWantsRematch : gameStore.iWantRematch;
      default:
        return false;
    }
  });

  const wins = computed(() => {
    switch (whichPlayer) {
      case WhichPlayer.CURRENT_PLAYER:
        return gameStore.currentMatch?.games.filter(game => game.winner === gameStore.player.id).length ?? 0;
      case WhichPlayer.CURRENT_OPPONENT:
        return gameStore.currentMatch?.games.filter(game => game.winner === gameStore.opponent.id).length ?? 0;
      case WhichPlayer.ORIGINAL_P0:
        return gameStore.currentMatch?.games.filter(game => game.winner === originalP0.value.id).length ?? 0;
      case WhichPlayer.ORIGINAL_P1:
        return gameStore.currentMatch?.games.filter(game => game.winner === originalP1.value.id).length ?? 0;
      default:
        return 0;
    }
  });

  const wonMatch = computed(() => {
    if (!gameStore.isRanked) {
      return false;
    }

    switch (whichPlayer) {
      case WhichPlayer.CURRENT_PLAYER:
        return gameStore.currentMatch?.winner === gameStore.player.id;
      case WhichPlayer.CURRENT_OPPONENT:
        return gameStore.currentMatch?.winner === gameStore.opponent.id;
      case WhichPlayer.ORIGINAL_P0:
        return gameStore.currentMatch?.winner === originalP0.value.id;
      case WhichPlayer.ORIGINAL_P1:
        return gameStore.currentMatch?.winner === originalP1.value.id;
      default:
        return false;
    }
  });

  return {
    username,
    rematch,
    wins,
    wonMatch,
  };
}
