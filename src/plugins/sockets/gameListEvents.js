import { useGameListStore } from '@/stores/gameList';
import { useGameStore } from '@/stores/game';
import { cloneDeep } from 'lodash';

export function handleGameCreated(evData) {
  const gameListStore = useGameListStore();
  const newGame = cloneDeep(evData);
  gameListStore.addGameToList(newGame);
}

export function handleGameStarted({ gameId }) {
  const gameListStore = useGameListStore();
  gameListStore.gameStarted(gameId);
}

export function handleGameFinished({ gameId }) {
  const gameListStore = useGameListStore();
  gameListStore.gameFinished(gameId);
}

export function handleJoin(evData) {
  const gameListStore = useGameListStore();
  const gameStore = useGameStore();
  gameListStore.joinGame({
    gameId: evData.gameId,
    newPlayer: evData.newPlayer,
    newStatus: evData.newStatus,
  });
  // If we are in game: update our game with new player
  if (evData.gameId === gameStore.id) {
    gameStore.opponentJoined(evData.newPlayer);
  }
}

export function handleLeftGame(evData) {
  const gameListStore = useGameListStore();
  const gameStore = useGameStore();
  if (evData.id === gameStore.id) {
    gameStore.opponentLeft();
  } else {
    gameListStore.otherLeftGame(evData.id);
  }
}

export function handleIsRanked(evData) {
  const gameListStore = useGameListStore();
  const gameStore = useGameStore();
  gameStore.isRanked = evData.isRanked;
  gameStore.showIsRankedChangedAlert = true;
  gameListStore.setIsRanked({ gameId: evData.gameId,isRanked: evData.isRanked });
}
