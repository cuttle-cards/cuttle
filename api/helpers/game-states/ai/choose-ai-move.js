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

      const legalMoves = sails.helpers.gameStates.ai.getLegalMoves(currentState, playedBy, priorStates);

      // Pro gamer move
      const res = _.sample(legalMoves, 1);

      return exits.success(res);
    } catch (err) {
      return exits.error(err);
    }
  },
};
