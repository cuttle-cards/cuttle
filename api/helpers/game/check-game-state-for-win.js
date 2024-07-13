const GameStatus = require('../../../utils/GameStatus.json');

module.exports = {
  friendlyName: 'Check Game State for win',

  description: 'Determines if the game has ended and returns a victory object',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game state object',
      required: true,
    },
    players: {
      type: 'ref',
      description: 'Array of combined game players as well as gameState players',
      required: true,
    },
  },

  fn: async function ({ game, players }, exits) {
    const checkWin = (player) => {
      const points = player.points.reduce((sum, { rank }) => sum + rank, 0);
      const kings = player.faceCards.filter((faceCard) => faceCard.rank === 13).length;
      switch (kings) {
        case 0:
          return points >= 21;
        case 1:
          return points >= 14;
        case 2:
          return points >= 10;
        case 3:
          return points >= 5;
        case 4:
          return points >= 0;
      }
      return false;
    };

    const res = {
      gameOver: false,
      winner: null,
      conceded: false,
      currentMatch: null,
    };

    const [p0, p1] = players;
    const p0Wins = checkWin(p0);
    const p1Wins = checkWin(p1);

    if (p0Wins || p1Wins) {
      res.gameOver = true;
      const gameUpdates = {};
      gameUpdates.status = GameStatus.FINISHED;
      if (p0Wins) {
        res.winner = 0;
        gameUpdates.winner = p0.id;
      } else if (p1Wins) {
        res.winner = 1;
        gameUpdates.winner = p1.id;
      }
      await Game.updateOne({ id: game.id }).set(gameUpdates);
      game = {
        ...game,
        ...gameUpdates,
      };
      res.currentMatch = await sails.helpers.addGameToMatch(game);
    }
    return exits.success(res);
  },
};
