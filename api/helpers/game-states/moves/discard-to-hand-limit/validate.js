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
     * @param { String } requestedMove.cardId1 - First card to be discarded
     * @param { String } [requestedMove.cardId2] - Second card to be discarded (required if hand > 9)
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

      if (player.hand.length <= 8) {
        throw new BadRequestError('game.snackbar.oneOffs.discardToHandLimit.handNotOverLimit');
      }

      const { cardId1, cardId2 } = requestedMove;

      const selectedCard1 = player.hand.find(card => card.id === cardId1);
      if (!selectedCard1) {
        throw new BadRequestError('game.snackbar.oneOffs.discardToHandLimit.mustSelectCards');
      }

      if (player.hand.length > 9 && !player.hand.find(card => card.id === cardId2)) {
        throw new BadRequestError('game.snackbar.oneOffs.discardToHandLimit.mustSelectCards');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
