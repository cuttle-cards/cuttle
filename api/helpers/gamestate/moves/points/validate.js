const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to play points',

  description: 'Verifies whether a request to make points is legal, throwing explanatory error if not.',

  inputs: {
    /**
     * @param {Object} requestedMove - Object describing the request to play points
     * @param {1 | 0} requestedMove.playedBy - Which player is playing
     * @param { Card } requestedMove.cardPlayed - Card Played for points
     * @param { MoveType.POINTS } requestedMove.moveType - Specifies that this a Points move
     */
    requestedMove: {
      type: 'ref',
      description: 'Object containing data needed for current move',
      required: true,
    },
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    pNum: {
      type: 'number',
      description: 'Player number of player requesting move',
      required: true,
    },
  },
  sync: true,
  fn: ({ requestedMove, currentState, pNum }, exits) => {
    try {
      const playedBy = pNum ? 'p1' : 'p0';

      const cardPlayed = currentState[playedBy].hand.find(({ id }) => id === requestedMove.cardId);

      if (currentState.phase !== GamePhase.MAIN) {
        throw new Error(`Can only play points in main phase, not ${currentState.phase}`);
      }

      if (!cardPlayed) {
        throw new Error('game.snackbar.global.playFromHand');
      }

      if (cardPlayed.isFrozen) {
        throw new Error('game.snackbar.global.cardFrozen');
      }

      if (currentState.turn % 2 !== pNum) {
        throw new Error('game.snackbar.global.notYourTurn');
      }

      if (cardPlayed.rank > 10) {
        throw new Error('game.snackbar.points.numberOnlyForPoints');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
