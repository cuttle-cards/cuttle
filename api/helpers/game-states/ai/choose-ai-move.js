const MoveType = require('../../../../utils/MoveType');

module.exports = {
  friendlyName: 'Choose an AI move',

  description: 'Returns new GameState with AI\'s chosen move',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move',
      required: true,
    },
    priorStates: {
      type: 'ref',
      description: 'List of packed gameStateRows for this game\'s prior states',
      required: true,
    }
  },
  sync: true,
  fn: ({ currentState, playedBy, priorStates }, exits) => {
    try {

      const aiMove = {
        moveType: MoveType.DRAW,
        playedBy,
      };

      const res = sails.helpers.gameStates.moves.draw.execute(currentState, aiMove, playedBy, priorStates);

      return exits.success(res);
    } catch (err) {
      return exits.error(err);
    }
  },
};
