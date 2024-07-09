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
        const gameStateCleaned = sails.helpers.gamestate.validateGamestate(gameState);
        // converted data from gamestate format to a gamestateRow format
        const gameStateRowData = sails.helpers.gamestate.packGamestate(gameStateCleaned);
        const gameStateRow = await GameStateRow.create(gameStateRowData).fetch();

       //await Game.addToCollection(game.id, 'gameStates').members([gameStateRow.gameId]); //TODO

        return exits.success(gameStateRow);

    } catch (err) {
        return exits.error({message: 'Error while Saving GameStateRow :' + err });
    }

  }
};