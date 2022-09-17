const {
  compareByRankThenSuit,
  getPlayerPnumByUsername,
  pNumIsValid,
} = require('../../../utils/game-utils');

describe('compareByRankThenSuit', () => {
  const aceOfClubs = {
    rank: 1,
    suit: 0,
  };
  const twoOfClubs = {
    rank: 1,
    suit: 0,
  };
  const aceOfHearts = {
    rank: 1,
    suit: 2,
  };
  const jackOfHearts = {
    rank: 11,
    suit: 2,
  };
  it('should sort by suit', () => {
    const sortedCards = [jackOfHearts, twoOfClubs].sort(compareByRankThenSuit);
    expect(sortedCards).toEqual([twoOfClubs, jackOfHearts]);
  });
  it('should sort by rank', () => {
    const sortedCards = [twoOfClubs, aceOfClubs].sort(compareByRankThenSuit);
    expect(sortedCards).toEqual([aceOfClubs, twoOfClubs]);
  });
  it('should sort by suit and rank', () => {
    const sortedCards = [jackOfHearts, aceOfHearts, twoOfClubs, aceOfClubs].sort(
      compareByRankThenSuit
    );
    expect(sortedCards).toEqual([aceOfClubs, twoOfClubs, aceOfHearts, jackOfHearts]);
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
