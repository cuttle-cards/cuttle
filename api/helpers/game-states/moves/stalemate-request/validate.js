const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request for Stalemate',

  description: 'Verifies whether a request for a stalemate is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request for stalemate
     * @param { MoveType.STALEMATE_REQUEST } requestedMove.moveType - Specifies that this a request for a stalemate
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
  },
  sync: true,
  fn: ({ currentState }, exits) => {
    try {
      // Must not already be considering a stalemate
      if (currentState.phase === GamePhase.STALEMATE_REQUEST) {
        throw new Error('game.snackbar.global.alreadyConsideringStalemate');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
