module.exports = {
  friendlyName: 'Save GameStateRow',

  description: 'This helper saves a GameStateRow to the database, converting a GameState to a GameStateRow (using string representations for card lists)',

  inputs: {
    gameState: {
      type: 'ref',
      description: 'GameState to convert and save',
      required: true,
    },
  },

  fn: async ({ gameState }, exits) => {

    try {
      // validate and format
      const gameStateCleaned = sails.helpers.gameStates.validateGamestate(gameState);
      // convert
      const gameStateRowData = sails.helpers.gameStates.packGamestate(gameStateCleaned);
      // Save and fetch
      const gameStateRow = await GameStateRow.create(gameStateRowData).fetch();

      return exits.success(gameStateRow);

    } catch (err) {
      return exits.error({ message: 'Error while Saving GameStateRow :' + err });
    }
  }
};
