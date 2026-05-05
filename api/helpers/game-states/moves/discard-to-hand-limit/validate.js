const GamePhase = require('../../../../../utils/GamePhase.json');
const BadRequestError = require('../../../../errors/badRequestError');

module.exports = {
  friendlyName: 'Validate request to discard to hand limit',

  description: 'Verifies whether a request to discard excess cards is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to discard to hand limit
     * @param { string[] } requestedMove.discardedCards - IDs of cards to discard (must equal hand.length - 8)
     * @param { MoveType.DISCARD_TO_HAND_LIMIT } requestedMove.moveType
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
      description: 'List of packed gameStateRows for this game\'s prior states',
      required: true,
    }
  },
  sync: true,
  fn: ({ requestedMove, currentState, playedBy }, exits) => {
    try {
      if (currentState.phase !== GamePhase.DISCARDING_TO_HAND_LIMIT) {
        throw new BadRequestError('game.snackbar.oneOffs.discardToHandLimit.notDiscardingPhase');
      }

      const player = playedBy ? currentState.p1 : currentState.p0;
      const overflowCount = player.hand.length - 8;

      if (overflowCount <= 0) {
        throw new BadRequestError('game.snackbar.oneOffs.discardToHandLimit.handNotOverLimit');
      }

      const { discardedCards } = requestedMove;

      if (!Array.isArray(discardedCards) || discardedCards.length !== overflowCount) {
        throw new BadRequestError('game.snackbar.oneOffs.discardToHandLimit.mustSelectCards');
      }

      const allInHand = discardedCards.every(id => player.hand.some(card => card.id === id));
      if (!allInHand) {
        throw new BadRequestError('game.snackbar.oneOffs.discardToHandLimit.mustSelectCards');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
