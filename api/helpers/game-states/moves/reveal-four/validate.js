const GamePhase = require('../../../../../utils/GamePhase.json');
const BadRequestError = require('../../../../errors/badRequestError');

module.exports = {
  friendlyName: 'Validate request to reveal cards for a four',

  description:
    'Verifies whether a request to reveal three cards from hand to the player of a four is legal, ' +
    'throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to reveal cards
     * @param { string[] } requestedMove.revealedCards - IDs of the three cards from hand to reveal
     * @param { MoveType.REVEAL_FOUR } requestedMove.moveType
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
      // The four's victim reveals on the four player's turn
      if (currentState.turn % 2 === playedBy) {
        throw new BadRequestError('game.snackbar.global.notYourTurn');
      }

      if (currentState.phase !== GamePhase.RESOLVING_FOUR_REVEAL) {
        throw new BadRequestError('game.snackbar.oneOffs.four.notRevealingPhase');
      }

      const player = playedBy ? currentState.p1 : currentState.p0;
      const { revealedCards } = requestedMove;

      if (!Array.isArray(revealedCards) || new Set(revealedCards).size !== 3 || revealedCards.length !== 3) {
        throw new BadRequestError('game.snackbar.oneOffs.four.mustRevealThree');
      }

      const allInHand = revealedCards.every((id) => player.hand.some((card) => card.id === id));
      if (!allInHand) {
        throw new BadRequestError('game.snackbar.oneOffs.four.mustRevealThree');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
