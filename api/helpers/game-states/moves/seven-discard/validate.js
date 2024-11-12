const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to seven-discard',

  description: 'Verifies whether a request to discard a jack via a seven is legal (because no cards can be played), throwing an explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play jack from the top of the deck
     * @param { String } requestedMove.cardId - The jack from the top of the deck
     * @param { MoveType.SEVEN_DISCARD } requestedMove.moveType - Specifies that this a sevenDiscard
     */
    requestedMove: {
      type: 'ref',
      description: 'Object describing the request to discard jack via a seven',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting the move',
      required: true,
    },
  },

  sync: true,

  fn: ({ requestedMove, currentState, playedBy }, exits) => {
    try {
      // Determine opponent (opponent is the other player)
      const opponent = playedBy ? currentState.p0 : currentState.p1;

      // Get the top two cards from the deck
      const topTwoCards = currentState.deck.slice(0, 2);
      const playedCard = topTwoCards.find(({ id }) => id === requestedMove.cardId);

      // Check if it's the player's turn
      if (currentState.turn % 2 !== playedBy) {
        throw new Error('game.snackbar.global.notYourTurn');
      }

      // Check if the game phase is RESOLVING_SEVEN
      if (currentState.phase !== GamePhase.RESOLVING_SEVEN) {
        throw new Error('game.snackbar.seven.wrongPhase');
      }

      // Check if the playedCard is one of the top two cards
      if (!playedCard) {
        throw new Error('game.snackbar.seven.pickAndPlay');
      }

      // Top 2 cards must both be jacks
      if (topTwoCards.some((card) => card.rank !== 11)) {
        throw new Error('game.snackbar.jack.mustBeDoubleJacks');
      }

      // Jacks must be unplayable due to queen or lack of points
      const queenCount = opponent.faceCards.filter(({ rank }) => rank === 12).length;
      const pointCount = opponent.points.length;
      if (queenCount === 0 && pointCount > 0) {
        throw new Error('game.snackbar.jack.jacksMustBeUnplayable');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
