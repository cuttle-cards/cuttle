import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import { handleInGameEvents } from '@/plugins/sockets/inGameEvents';
import SocketEvent from '_/types/SocketEvent';

const { mockGameStore, mockGameHistoryStore, mockSnackbarStore, mockRouter } = vi.hoisted(() => ({
  mockGameStore: {
    id: 1,
    myPNum: 0,
    updateGame: vi.fn(),
    processFours: vi.fn(),
  },
  mockGameHistoryStore: {
    isSpectating: false,
  },
  mockSnackbarStore: {
    alert: vi.fn(),
  },
  mockRouter: {
    currentRoute: {
      value: {
        name: 'game',
        params: { gameId: '1' },
      },
    },
    replace: vi.fn(),
    push: vi.fn(),
  },
}));

vi.mock('@/stores/game', () => ({
  useGameStore: () => mockGameStore,
}));

vi.mock('@/stores/gameHistory', () => ({
  useGameHistoryStore: () => mockGameHistoryStore,
}));

vi.mock('_/src/stores/snackbar', () => ({
  useSnackbarStore: () => mockSnackbarStore,
}));

vi.mock('@/router.js', () => ({
  default: mockRouter,
  ROUTE_NAME_GAME: 'game',
  ROUTE_NAME_SPECTATE: 'spectate',
  ROUTE_NAME_LOBBY: 'lobby',
}));

describe('handleInGameEvents - SocketEvent.RESOLVE case 4', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGameStore.myPNum = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs processFours when the local player is the caster (playedBy === myPNum)', async () => {
    mockGameStore.myPNum = 0;
    const discardedCards = [ { rank: 1, suit: 1 }, { rank: 10, suit: 2 } ];
    const evData = {
      change: SocketEvent.RESOLVE,
      gameId: 1,
      playedBy: 0,
      discardedCards,
      game: {
        id: 1,
        lastEvent: {
          oneOff: { rank: 4 },
        },
      },
    };

    await handleInGameEvents(evData);

    expect(mockGameStore.processFours).toHaveBeenCalledWith(discardedCards, evData.game);
    expect(mockGameStore.updateGame).not.toHaveBeenCalled();
  });

  it('calls updateGame directly when the local player is the victim (playedBy !== myPNum)', async () => {
    mockGameStore.myPNum = 1;
    const discardedCards = [ { rank: 1, suit: 1 }, { rank: 10, suit: 2 } ];
    const evData = {
      change: SocketEvent.RESOLVE,
      gameId: 1,
      playedBy: 0,
      discardedCards,
      game: {
        id: 1,
        lastEvent: {
          oneOff: { rank: 4 },
        },
      },
    };

    await handleInGameEvents(evData);

    expect(mockGameStore.updateGame).toHaveBeenCalledWith(evData.game);
    expect(mockGameStore.processFours).not.toHaveBeenCalled();
  });
});
