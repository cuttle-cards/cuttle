const GamePhase = require('../../../../../utils/GamePhase.json');
const BadRequestError = require('../../../../errors/badRequestError');

module.exports = {
  friendlyName: 'Validate request to resolve pending one-off and counters',

  description: 'Verifies whether a request to resolve one-offs is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { MoveType.RESOLVE } requestedMove.moveType - Specifies that this a resolve move
     * @param { Object } requestedMove - Object describing the request to resolve
     * @param { 1 | 0 } requestedMove.playedBy - Which player is resolving
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

      // Must be COUNTERING phase
      if (currentState.phase !== GamePhase.COUNTERING) {
        throw new BadRequestError(`Can only resolve during the countering phase`);
      }

      if (!currentState.oneOff) {
        throw new BadRequestError('You cannot resolve unless there is a one-off pending');
      }

      // Must be your chance to resolve
      const yourTurnToResolve = sails.helpers.gameStates.yourTurnToCounter(currentState, playedBy);
      if (!yourTurnToResolve) {
        throw new BadRequestError('Waiting for opponent to counter');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
