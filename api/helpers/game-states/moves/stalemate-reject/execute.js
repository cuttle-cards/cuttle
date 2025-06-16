const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Reject offer for Stalemate',

  description: 'Reject opponent\'s stalemate offer',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to reject the requested stalemate
     * @param { MoveType.STALEMATE_REJECT } requestedMove.moveType - Specifies that this accepts a stalemate offer
     * @param { 1 | 0 } requestedMove.playedBy - Which player is rejecting a stalemate
     */
    requestedMove: {
      type: 'ref',
      description: 'Object containing data needed for current move',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move',
      required: true,
    },
    priorStates: {
      type: 'ref',
      description: "List of packed gameStateRows for this game's prior states",
      required: true,
    }
  },
  sync: true,
  fn: ({ currentState, requestedMove, playedBy, priorStates }, exits) => {
    let result = _.cloneDeep(currentState);

    const phase = priorStates.at(-2)?.phase ?? GamePhase.MAIN;

    result = {
      ...result,
      ...requestedMove,
      playedBy,
      phase
    };

    return exits.success(result);
  },
};
