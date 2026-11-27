const GameStatus = require('../../../utils/GameStatus.json');

module.exports = {
  friendlyName: 'Finish Game',

  description:
    'Records the end of a game that a move just ended: marks it finished, sets its winner, and adds it to its match. Returns the match. Safe to call again on a game that is already (partly) recorded: get-game does so when a move failed part-way',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game object, with its players populated',
      required: true,
    },
    victory: {
      type: 'ref',
      description: 'Result of checkGameStateForWin for the game state that ended the game',
      required: true,
    },
  },

  fn: async function ({ game, victory }, exits) {
    try {
      const gameUpdates = {
        status: GameStatus.FINISHED,
      };

      if (victory.winner === 0) {
        gameUpdates.winner = game.p0.id;
      } else if (victory.winner === 1) {
        gameUpdates.winner = game.p1.id;
      }

      if (game.status === GameStatus.STARTED) {
        await Game.updateOne({ id: game.id }).set(gameUpdates);
      }

      const currentMatch = await sails.helpers.addGameToMatch({
        ...game,
        ...gameUpdates,
      });

      return exits.success(currentMatch);
    } catch (err) {
      return exits.error(err);
    }
  },
};
