const {
  compareByRankThenSuit,
  getPlayerPnumByUsername,
  pNumIsValid,
} = require('../../../utils/game-utils');
const Card = require('../../e2e/fixtures/cardFixtures.js');

describe('compareByRankThenSuit', () => {
  const { ACE_OF_CLUBS, TWO_OF_CLUBS, TEN_OF_CLUBS, ACE_OF_HEARTS, JACK_OF_HEARTS } = Card;
  it('should sort by rank', () => {
    const sortedCards = [TWO_OF_CLUBS, ACE_OF_CLUBS].sort(compareByRankThenSuit);
    expect(sortedCards).toEqual([ACE_OF_CLUBS, TWO_OF_CLUBS]);
  });
  it('should sort by suit', () => {
    const sortedCards = [JACK_OF_HEARTS, TWO_OF_CLUBS].sort(compareByRankThenSuit);
    expect(sortedCards).toEqual([TWO_OF_CLUBS, JACK_OF_HEARTS]);
  });
  it('should sort by rank and suit', () => {
    const sortedCards = [
      JACK_OF_HEARTS,
      TEN_OF_CLUBS,
      ACE_OF_HEARTS,
      TWO_OF_CLUBS,
      ACE_OF_CLUBS,
    ].sort(compareByRankThenSuit);
    expect(sortedCards).toEqual([
      ACE_OF_CLUBS,
      ACE_OF_HEARTS,
      TWO_OF_CLUBS,
      TEN_OF_CLUBS,
      JACK_OF_HEARTS,
    ]);
  });
});

describe('getPlayerPnumByUsername', () => {
  const mockPlayers = [
    {
      username: 'player',
    },
    {
      username: 'opponent',
    },
  ];
  it('should fail gracefully', () => {
    expect(getPlayerPnumByUsername()).toBe(null);
    expect(getPlayerPnumByUsername(null, [])).toBe(null);
    expect(getPlayerPnumByUsername([], null)).toBe(null);
    expect(getPlayerPnumByUsername(mockPlayers, 'unknown')).toBe(null);
  });
  it('should return player pNum', () => {
    expect(getPlayerPnumByUsername(mockPlayers, 'player')).toBe(0);
    expect(getPlayerPnumByUsername(mockPlayers, 'opponent')).toBe(1);
  });
});

describe('getPlayerPnumByUsername', () => {
  it('should be false for numbers below 0', () => {
    expect(pNumIsValid(-1)).toBe(false);
  });
  it('should be false for numbers above 1', () => {
    expect(pNumIsValid(2)).toBe(false);
  });
  it('should be true for 0 and 1', () => {
    expect(pNumIsValid(0)).toBe(true);
    expect(pNumIsValid(1)).toBe(true);
  });
});
