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
    
    // Test if gamestate is provided
    if(!gameState || gameState.gameId == null || gameState.gameId == undefined ){
      return exits.error({message: 'No GameState provided or undefined gameId'  });
    }
    // Test if required fields are provided
    const requiredField = ['playedBy', 'moveType', 'phase' ];
    requiredField.forEach(attribute => {
      if(!gameState.hasOwnProperty(attribute) && gameState[attribute] == null){
        return exits.error({message: 'A required GameStateRow attribute is null :' + attribute  });
      }
    });



    try {

        // converted data from gamestate format to a gamestateRow format
        const gameStateRowData = await sails.helpers.gamestate.packGamestate(gameState);
        const gameStateRow = await GameStateRow.create(gameStateRowData).fetch();

       //await Game.addToCollection(game.id, 'gameStates').members([gameStateRow.gameId]); //TODO

        return exits.success(gameStateRow);

    } catch (err) {
        return exits.error({message: 'Error while Saving GameStateRow :' + err });
    }

  }
};