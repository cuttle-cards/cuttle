const { getLobbyDataByGame } = require('../../../utils/game-utils');

describe('getLobbyDataByGame', () => {
  it('should return null when a game is not set', () => {
    expect(getLobbyDataByGame()).toBe(null);
  });

  it('should return a valid object when a game is set', () => {
    const mockGame = {
      id: 11,
      name: 'Test',
      players: [
        // 0
        { username: 'player1' },
        // 1
        { username: 'player2' },
      ],
      p0Ready: false,
      p1Ready: false,
    };
    expect(getLobbyDataByGame(mockGame)).toEqual({
      id: 11,
      name: 'Test',
      players: [
        { username: 'player1', pNum: 0 },
        { username: 'player2', pNum: 1 },
      ],
      p0Ready: false,
      p1Ready: false,
    });
  });
});
