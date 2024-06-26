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
    
        return exits.success();
    } catch (err) {
        return exits.error(err);
    }
  },
};
