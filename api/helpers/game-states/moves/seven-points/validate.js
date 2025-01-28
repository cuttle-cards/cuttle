const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate sevenPoints',

  description: 'Verifies whether a request to play points from the top of the deck when resolving a seven is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play points via seven
     * @param { String } requestedMove.cardId - Card Played for points
     * @param { MoveType.SEVEN_POINTS } requestedMove.moveType - Specifies that this a sevenPoints move
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
  fn: ({ requestedMove, currentState, playedBy }, exits) => {
    try {
      const topTwoCards = currentState.deck.slice(0, 2);
      const playedCard = topTwoCards.find(({ id }) => id === requestedMove.cardId);

      if (currentState.turn % 2 !== playedBy) {
        throw new Error('game.snackbar.global.notYourTurn');
      }

      if (currentState.phase !== GamePhase.RESOLVING_SEVEN) {
        throw new Error('game.snackbar.seven.wrongPhase');
      }

      if (!playedCard) {
        throw new Error('game.snackbar.seven.pickAndPlay');
      }

      if (playedCard.rank > 10) {
        throw new Error('game.snackbar.points.numberOnlyForPoints');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
