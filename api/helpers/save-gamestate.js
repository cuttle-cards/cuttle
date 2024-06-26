module.exports = {
  friendlyName: 'Save Game to a gameState then a gamestateRow',

  description: 'Save Gamestate & gamestateRow',

  inputs: {
    game: {
      type: 'ref',
      description: 'input : game, created gamestate and gamestateRow',
      required: true,
    },
    playedBy :{
      type : 'number',
      description: 'playedBy',
      required: true,
    },
    moveType :{
      type : 'number',
      description: 'moveType',
      required: true,
    },
    phase :{
      type : 'number',
      description: 'phase',
      required: true,
    }
  },

  fn: async ({game, playedBy, moveType, phase}, exits) => {

    try {
        // const addedInfos = {gameId: game.id, playedBy : playedBy, moveType : moveType,phase : phase }; 
        // const merged = {...game, ...addedInfos};
        // const gameState = await GameState.create(merged).fetch();
        // const gameStateRowData = await sails.helpers.packGamestate(gameState);
        // console.log(gameStateRowData);
        //const gameStateRow = await GameStateRow.create(gameStateRowData).fetch();
    
        return exits.success(true);
    } catch (err) {
        console.log(err);
        return exits.error(err);
    }
  },
};
