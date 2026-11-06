import { beforeEach, describe, it, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/stores/auth', () => ({ useAuthStore: () => ({ username: 'me' }) }));
vi.mock('@/stores/gameHistory', () => ({
  useGameHistoryStore: () => ({ isSpectating: false, gameStates: [] }),
}));
vi.mock('vue-router', () => ({ useRoute: () => ({ query: {} }) }));
vi.mock('@/plugins/sails.js', () => ({ io: { socket: { get: vi.fn(), post: vi.fn() } } }));
vi.mock('@/plugins/sockets/inGameEvents', () => ({ handleInGameEvents: vi.fn() }));
vi.mock('@/router', () => ({ default: {}, ROUTE_NAME_VS_AI: 'vsAI' }));

const { useGameStore } = await import('@/stores/game');

const hidden = () => ({ isHidden: true });
const revealed = (id, rank, suit) => ({ id, rank, suit, isRevealed: true });

// A non-empty deck keeps showOpponentHand false, so the hand stays masked
const gameWith = (opponentHand) => ({
  deck: [ { id: 90, rank: 2, suit: 1 }, { id: 91, rank: 4, suit: 1 } ],
  players: [
    { pNum: 0, username: 'me', hand: [], points: [], faceCards: [] },
    { pNum: 1, username: 'them', hand: opponentHand, points: [], faceCards: [] },
  ],
});

/**
 * The opponent's hand is keyed by slot rather than by card, so that a card keeps its DOM node
 * while it is in the hand: revealing it flips that node in place, and a card leaving releases
 * its own node. These assert the two halves of that, which pull in opposite directions.
 */
describe('Opponent hand slot keys', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useGameStore();
  });

  const keys = () => store.opponent.hand.map(({ handKey }) => handKey);

  it('Gives every card in a hidden hand its own key', () => {
    store.updateGame(gameWith([ hidden(), hidden(), hidden() ]));

    expect(keys()).toHaveLength(3);
    expect(new Set(keys()).size).toBe(3);
    expect(keys().every((key) => key !== undefined)).toBe(true);
  });

  it('Keeps every key when a four reveals cards, so they flip in place', () => {
    store.updateGame(gameWith([ hidden(), hidden(), hidden(), hidden(), hidden() ]));
    const before = keys();

    // The victim reveals their 1st, 3rd and 5th cards; the hand neither shrinks nor reorders
    store.updateGame(
      gameWith([ revealed(1, 1, 2), hidden(), revealed(2, 13, 3), hidden(), revealed(3, 7, 0) ]),
    );

    expect(keys()).toEqual(before);
  });

  it('Releases only the discarded cards keys, so the rest stay put', async () => {
    store.updateGame(gameWith([ hidden(), hidden(), hidden(), hidden(), hidden() ]));
    store.updateGame(
      gameWith([ revealed(1, 1, 2), hidden(), revealed(2, 13, 3), hidden(), revealed(3, 7, 0) ]),
    );
    const [ aceKey, firstHiddenKey, kingKey, secondHiddenKey, sevenKey ] = keys();

    // The caster picks the ace and the king; the seven stays revealed in the hand
    vi.useFakeTimers();
    const resolving = store.processFours(
      [ revealed(1, 1, 2), revealed(2, 13, 3) ],
      gameWith([ hidden(), hidden(), revealed(3, 7, 0) ]),
    );
    // Partway through, the discards are still in the hand holding their own keys
    expect(keys()).toEqual([ aceKey, firstHiddenKey, kingKey, secondHiddenKey, sevenKey ]);
    await vi.advanceTimersByTimeAsync(1000);
    await resolving;
    vi.useRealTimers();

    expect(keys()).toEqual([ firstHiddenKey, secondHiddenKey, sevenKey ]);
    expect(keys()).not.toContain(aceKey);
    expect(keys()).not.toContain(kingKey);
  });

  it('Keeps existing keys when the opponent draws', () => {
    store.updateGame(gameWith([ hidden(), hidden() ]));
    const before = keys();

    store.updateGame(gameWith([ hidden(), hidden(), hidden() ]));

    expect(keys().slice(0, 2)).toEqual(before);
    expect(before).not.toContain(keys()[2]);
  });

  it('Keeps a revealed cards key while the cards around it leave', () => {
    store.updateGame(gameWith([ revealed(1, 1, 2), hidden(), hidden() ]));
    const [ aceKey ] = keys();

    store.updateGame(gameWith([ revealed(1, 1, 2) ]));

    expect(keys()).toEqual([ aceKey ]);
  });
});
