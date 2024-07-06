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
  },

  fn: async function ({ game }, exits) {
    const res = {
      gameOver: false,
      winner: null,
      conceded: false,
      currentMatch: null,
    };
    const [p0, p1] = game.players;
    const p0Wins = userService.checkWin({ user: p0 });
    const p1Wins = userService.checkWin({ user: p1 });
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
