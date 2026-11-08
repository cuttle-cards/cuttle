import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import { handleInGameEvents } from '@/plugins/sockets/inGameEvents';
import SocketEvent from '_/types/SocketEvent';

const { mockGameStore, mockGameHistoryStore, mockSnackbarStore, mockRouter } = vi.hoisted(() => ({
  mockGameStore: {
    id: 1,
    myPNum: 0,
    iWantToContinueSpectating: true,
    updateGame: vi.fn(),
    updateGameMetadata: vi.fn(),
    processFours: vi.fn(),
    setGameOver: vi.fn(),
    addSpectator: vi.fn(),
    removeSpectator: vi.fn(),
    requestSpectate: vi.fn(),
  },
  mockGameHistoryStore: {
    isSpectating: false,
    holdLiveUpdates: false,
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

/**
 * A live spectator who has paused keeps the board they stopped on. Only events the server pushed can
 * reach them in that state; a state they navigated to must always render, however far behind it is.
 */
describe('handleInGameEvents - paused behind the live edge', () => {
  const pointsEvent = (extra = {}) => ({
    change: SocketEvent.POINTS,
    gameId: 1,
    playedBy: 1,
    game: { id: 1, status: 2, log: [ 'a move happened' ], gameStates: [ {}, {}, {} ] },
    ...extra,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.currentRoute.value = { name: 'spectate', params: { gameId: '1' } };
    mockGameHistoryStore.isSpectating = true;
    mockGameHistoryStore.holdLiveUpdates = true;
    mockGameStore.iWantToContinueSpectating = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockRouter.currentRoute.value = { name: 'game', params: { gameId: '1' } };
    mockGameHistoryStore.isSpectating = false;
    mockGameHistoryStore.holdLiveUpdates = false;
  });

  it('Updates the surrounding game but not the board on a pushed move', async () => {
    const evData = pointsEvent();

    await handleInGameEvents(evData, null, { fromSocket: true });

    expect(mockGameStore.updateGameMetadata).toHaveBeenCalledWith(evData.game);
    expect(mockGameStore.updateGame).not.toHaveBeenCalled();
  });

  it('Defers game over rather than spoiling the result of a state the spectator has not reached', async () => {
    const evData = pointsEvent({ victory: { gameOver: true, winner: 0, conceded: false } });

    await handleInGameEvents(evData, null, { fromSocket: true });

    expect(mockGameStore.setGameOver).not.toHaveBeenCalled();
    expect(mockGameStore.updateGameMetadata).toHaveBeenCalledWith(evData.game);
  });

  it('Does not carry the spectator into a rematch', async () => {
    const evData = {
      change: SocketEvent.NEW_GAME_FOR_REMATCH,
      oldGameId: 1,
      gameId: 2,
      newGame: { id: 2 },
    };

    await handleInGameEvents(evData, null, { fromSocket: true });

    expect(mockGameStore.requestSpectate).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('Keeps the list of who else is watching current', async () => {
    await handleInGameEvents(
      { change: SocketEvent.SPECTATOR_JOINED, gameId: 1, username: 'someoneElse' },
      null,
      { fromSocket: true },
    );

    expect(mockGameStore.addSpectator).toHaveBeenCalledWith('someoneElse');

    await handleInGameEvents(
      { change: SocketEvent.SPECTATOR_LEFT, gameId: 1, username: 'someoneElse' },
      null,
      { fromSocket: true },
    );

    // These carry no game payload, so holding them would drop them rather than defer them
    expect(mockGameStore.removeSpectator).toHaveBeenCalledWith('someoneElse');
  });

  it('Still sends the spectator home when the game is archived out from under them', async () => {
    await handleInGameEvents(
      { change: SocketEvent.GAME_ARCHIVED, gameId: 1 },
      null,
      { fromSocket: true },
    );

    expect(mockRouter.push).toHaveBeenCalledWith({
      path: '/',
      query: { gameId: 1, error: 'home.snackbar.gameArchived' },
    });
  });

  it('Renders a state the spectator navigated to, which never comes from the socket', async () => {
    const evData = pointsEvent();

    await handleInGameEvents(evData);

    expect(mockGameStore.updateGame).toHaveBeenCalledWith(evData.game);
    expect(mockGameStore.updateGameMetadata).not.toHaveBeenCalled();
  });

  it('Renders a pushed move once the spectator is following the live edge again', async () => {
    mockGameHistoryStore.holdLiveUpdates = false;
    const evData = pointsEvent();

    await handleInGameEvents(evData, null, { fromSocket: true });

    expect(mockGameStore.updateGame).toHaveBeenCalledWith(evData.game);
    expect(mockGameStore.updateGameMetadata).not.toHaveBeenCalled();
  });
});
