const GamePhase = require('../../../../../utils/GamePhase.json');
const BadRequestError = require('../../../../errors/badRequestError');

module.exports = {
  friendlyName: 'Validate request to choose discards for a four',

  description:
    'Verifies whether a request to choose two of the cards revealed by the opponent for them to discard ' +
    'is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to choose discards
     * @param { string[] } requestedMove.discardedCards - IDs of the two revealed cards to discard
     * @param { MoveType.DISCARD_FOUR } requestedMove.moveType
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
      // The four's player chooses on their own turn
      if (currentState.turn % 2 !== playedBy) {
        throw new BadRequestError('game.snackbar.global.notYourTurn');
      }

      if (currentState.phase !== GamePhase.RESOLVING_FOUR_DISCARD) {
        throw new BadRequestError('game.snackbar.oneOffs.four.notChoosingDiscardsPhase');
      }

      const { discardedCards } = requestedMove;

      if (!Array.isArray(discardedCards) || new Set(discardedCards).size !== 2 || discardedCards.length !== 2) {
        throw new BadRequestError('game.snackbar.oneOffs.four.mustChooseTwoRevealed');
      }

      const allRevealed = discardedCards.every((id) => currentState.fourRevealedCards.some((card) => card.id === id));
      if (!allRevealed) {
        throw new BadRequestError('game.snackbar.oneOffs.four.mustChooseTwoRevealed');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
