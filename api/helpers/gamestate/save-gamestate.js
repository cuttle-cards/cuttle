module.exports = {
  friendlyName: 'Save GameStateRow',

  description: 'This helper saves a gamestateRow to the database, converting a gamestate to a gamestateRow(to a string representation for database storing)',

  inputs: {
    gameState: {
      type: 'ref',
      description: 'GameState',
      required: true,
    },
  },

  fn: async ({ gameState }, exits) => {

    try {
        //validate and format
        const gameStateCleaned = sails.helpers.gamestate.validateGamestate(gameState);
        //convert
        const gameStateRowData = sails.helpers.gamestate.packGamestate(gameStateCleaned);
        //Save and fetch
        const gameStateRow = await GameStateRow.create(gameStateRowData).fetch();

        return exits.success(gameStateRow);

    } catch (err) {
        return exits.error({message: 'Error while Saving GameStateRow :' + err });
    }
  }
};
