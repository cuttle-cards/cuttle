const GamePhase = require('../../../../../types/GamePhase.json');
const BadRequestError = require('../../../../errors/badRequestError');

module.exports = {
  friendlyName: 'Validate request to play points',

  description: 'Verifies whether a request to make points is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play points
     * @param { String } requestedMove.cardId - Card Played for points
     * @param { MoveType.POINTS } requestedMove.moveType - Specifies that this a Points move
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
  fn: ({ requestedMove, currentState, playedBy }, exits) => {
    try {
      const player = playedBy ? currentState.p1 : currentState.p0;

      const playedCard = player.hand.find(({ id }) => id === requestedMove.cardId);

      if (currentState.turn % 2 !== playedBy) {
        throw new BadRequestError('game.snackbar.global.notYourTurn');
      }

      if (currentState.phase !== GamePhase.MAIN) {
        throw new BadRequestError('game.snackbar.global.notInMainPhase');
      }

      if (!playedCard) {
        throw new BadRequestError('game.snackbar.global.playFromHand');
      }
      
      if (playedCard.rank > 10) {
        throw new BadRequestError('game.snackbar.points.numberOnlyForPoints');
      }

      if (playedCard.isFrozen) {
        throw new BadRequestError('game.snackbar.global.cardFrozen');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
