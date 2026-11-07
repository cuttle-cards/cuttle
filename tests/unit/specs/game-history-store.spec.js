import { beforeEach, describe, it, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import GameStatus from '_/utils/GameStatus.json';

// Held in a container the mock factories fill in, so the tests can drive the route and the game
// store the way the app does. Both have to be reactive or the store's computeds never recompute
const mocks = vi.hoisted(() => ({ route: null, gameStore: null }));

vi.mock('vue-router', async () => {
  const { reactive } = await import('vue');
  mocks.route = reactive({ name: 'spectate', query: {} });
  return { useRoute: () => mocks.route };
});

vi.mock('@/stores/game', async () => {
  const { reactive } = await import('vue');
  mocks.gameStore = reactive({ id: 1, myPNum: 0, status: GameStatus.STARTED, log: [] });
  return { useGameStore: () => mocks.gameStore };
});

vi.mock('@/router', () => ({ ROUTE_NAME_SPECTATE: 'spectate' }));

const { useGameHistoryStore } = await import('@/stores/gameHistory');

const stateAt = (index) => ({ createdAt: index * 1000, moveType: 'draw', playedBy: index % 2 });

describe('gameHistory store live playback', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    mocks.route.name = 'spectate';
    mocks.route.query = {};
    mocks.gameStore.status = GameStatus.STARTED;
    mocks.gameStore.log = [];
    store = useGameHistoryStore();
    store.gameStates = [ 0, 1, 2, 3, 4 ].map(stateAt);
  });

  describe('showPlaybackControls', () => {
    it('Shows the controls while spectating a live game', () => {
      expect(store.showPlaybackControls).toBe(true);
    });

    it('Shows the controls while spectating a finished game', () => {
      mocks.gameStore.status = GameStatus.FINISHED;

      expect(store.showPlaybackControls).toBe(true);
    });

    it('Hides the controls when not spectating', () => {
      mocks.route.name = 'game';

      expect(store.showPlaybackControls).toBe(false);
    });
  });

  describe('isLive', () => {
    it('Is true only for a started game being spectated', () => {
      expect(store.isLive).toBe(true);

      mocks.gameStore.status = GameStatus.FINISHED;
      expect(store.isLive).toBe(false);

      mocks.gameStore.status = GameStatus.STARTED;
      mocks.route.name = 'game';
      expect(store.isLive).toBe(false);
    });
  });

  describe('resolvedGameStateIndex and isAtLatestState', () => {
    it('Resolves -1 to the last state', () => {
      expect(store.resolvedGameStateIndex).toBe(4);
      expect(store.isAtLatestState).toBe(true);
    });

    it('Keeps a concrete index as it is', () => {
      mocks.route.query = { gameStateIndex: '2' };

      expect(store.resolvedGameStateIndex).toBe(2);
      expect(store.isAtLatestState).toBe(false);
    });

    it('Counts the last concrete index as the latest state', () => {
      mocks.route.query = { gameStateIndex: '4' };

      expect(store.isAtLatestState).toBe(true);
    });
  });

  describe('isFollowingLive and holdLiveUpdates', () => {
    it('Follows live while playing at the live edge', () => {
      store.isPlaying = true;

      expect(store.isFollowingLive).toBe(true);
      expect(store.holdLiveUpdates).toBe(false);
    });

    it('Holds updates while paused at the live edge', () => {
      mocks.route.query = { gameStateIndex: '4' };
      store.isPlaying = false;

      expect(store.isFollowingLive).toBe(false);
      expect(store.holdLiveUpdates).toBe(true);
    });

    it('Holds updates while playing behind the live edge, where playback walks its own states', () => {
      mocks.route.query = { gameStateIndex: '1' };
      store.isPlaying = true;

      expect(store.isFollowingLive).toBe(false);
      expect(store.holdLiveUpdates).toBe(true);
    });

    it('Never holds updates on a finished game, so replay keeps handling its own socket events', () => {
      mocks.gameStore.status = GameStatus.FINISHED;
      mocks.route.query = { gameStateIndex: '1' };

      expect(store.holdLiveUpdates).toBe(false);
    });
  });

  describe('statesBehind', () => {
    it('Is zero at the live edge', () => {
      expect(store.statesBehind).toBe(0);
    });

    it('Counts the states ahead of the one on screen', () => {
      mocks.route.query = { gameStateIndex: '1' };

      expect(store.statesBehind).toBe(3);
    });

    it('Ticks up as new states land on a paused board', () => {
      mocks.route.query = { gameStateIndex: '4' };
      expect(store.statesBehind).toBe(0);

      store.gameStates = [ ...store.gameStates, stateAt(5), stateAt(6) ];

      expect(store.statesBehind).toBe(2);
    });

    it('Stays zero on a finished game, where falling behind means nothing', () => {
      mocks.gameStore.status = GameStatus.FINISHED;
      mocks.route.query = { gameStateIndex: '1' };

      expect(store.statesBehind).toBe(0);
    });
  });

  describe('canGoLive', () => {
    it('Is true whenever a live game is pinned to a concrete index', () => {
      mocks.route.query = { gameStateIndex: '4' };

      // Even at the last state: going live is what un-pins the url and resumes following
      expect(store.canGoToNextState).toBe(false);
      expect(store.canGoLive).toBe(true);
    });

    it('Is false while already following the live edge', () => {
      expect(store.canGoLive).toBe(false);
    });

    it('Is false on a finished game', () => {
      mocks.gameStore.status = GameStatus.FINISHED;
      mocks.route.query = { gameStateIndex: '2' };

      expect(store.canGoLive).toBe(false);
    });
  });

  describe('showGameSelector', () => {
    it('Stays hidden on a live game, which is never sent matchGames', () => {
      expect(store.matchGames).toEqual([]);
      expect(store.showGameSelector).toBe(false);
    });
  });
});
