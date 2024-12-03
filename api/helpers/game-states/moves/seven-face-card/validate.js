const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate sevenFaceCard',

  description: 'Verifies whether a request to play a face card from the top of the deck when resolving a seven is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play face card via seven
     * @param { String } requestedMove.cardId - Card Played as face card
     * @param { MoveType.SEVEN_FACE_CARD } requestedMove.moveType - Specifies that this a sevenFaceCard move
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

      if (![ 8, 12, 13 ].includes(playedCard.rank)) {
        throw new Error('game.snackbar.faceCard.withoutTarget');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
