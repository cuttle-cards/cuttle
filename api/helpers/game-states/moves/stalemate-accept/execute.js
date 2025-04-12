const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Accept offer for Stalemate',

  description: 'Accept opponent\'s stalemate offer',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request for stalemate
     * @param { MoveType.STALEMATE_ACCDEPT } requestedMove.moveType - Specifies that this accepts a stalemate offer
     * @param { 1 | 0 } requestedMove.playedBy - Which player is requesting a stalemate
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
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    let result = _.cloneDeep(currentState);

    result = {
      ...result,
      ...requestedMove,
      playedBy,
      phase: GamePhase.MAIN,
      playedCard: null,
      targetCard: null,
      discardedCards: [],
      resolved: null,
    };

    return exits.success(result);
  },
};
