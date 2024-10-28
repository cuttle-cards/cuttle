const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to seven-scuttle',

  description: 'Verifies whether a request to scuttle with a seven is legal, throwing an explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to scuttle from the top of the deck
     * @param { String } requestedMove.cardId - Card Played for scuttle
     * @param { String } requestedMove.targetId - Card Targeted for scuttle
     * @param { MoveType.SEVEN_SCUTTLE } requestedMove.moveType - Specifies that this a sevenScuttle
     */
    requestedMove: {
      type: 'ref',
      description: 'Object describing the request to scuttle',
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
      const targetCard = opponent.points.find(({ id }) => id === requestedMove.targetId);
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

      // Check if the playedCard is a number card (rank < 11)
      if (playedCard.rank >= 11) {
        throw new Error('game.snackbar.points.numberOnlyForPoints');
      }

      // Check if the targetCard is in the opponent's points
      if (!targetCard) {
        throw new Error('game.snackbar.scuttle.mustTargetPointCard');
      }

      if (playedCard.rank < targetCard.rank) {
        throw new Error('game.snackbar.scuttle.rankTooLow');
      }

      const lowerRank = playedCard.rank < targetCard.rank;
      const sameRankLowerSuit = playedCard.rank === targetCard.rank && playedCard.suit < targetCard.suit;
      if (lowerRank || sameRankLowerSuit) {
        throw new Error('game.snackbar.scuttle.rankTooLow');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
