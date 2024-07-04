module.exports = {
  friendlyName: 'Emit Game State',

  description: 'Determines if the game has ended and sends a socket event based on the game status.',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game state object',
      required: true,
    },
  },

  fn: async function ({ game }, exits) {
    const victory = sails.helpers.game.checkWinGame(game);
    return exits.success(victory);
  },
};
