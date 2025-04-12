const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to reject pending stalemate offer',

  description: 'Verifies request to reject stalemate offer is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request for stalemate
     * @param { MoveType.STALEMATE_REJECT } requestedMove.moveType - Specifies that this a to reject a stalemate offer
     * @param { 1 | 0 } requestedMove.playedBy - Which player is rejecting the stalemate
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
  fn: ({ currentState, playedBy }, exits) => {
    try {
      // Must already be considering a stalemate
      if (currentState.phase !== GamePhase.CONSIDERING_STALEMATE) {
        throw new Error('game.snackbar.stalemate.noStalemateOffered');
      }

      // Cannot reject your own stalemate request
      if (currentState.playedBy === playedBy) {
        throw new Error('game.snackbar.stalemate.opponentConsideringStalemate');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
