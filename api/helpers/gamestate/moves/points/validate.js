const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to play points',

  description: 'Verifies whether a request to make points is legal, throwing explanatory error if not.',

  inputs: {
    requestedMove: {
      type: 'ref',
      description: 'Object containing data needed for current move',
      required: true,
    },
    /**
     * @param {Object} requestedMove - Object describing the request to play points
     * @param {1 | 0} requestedMove.playedBy - Which player is playing
     * @param { Card } requestedMove.cardPlayed - Card Played for points
     * @param { MoveType.POINTS } requestedMove.moveType - Specifies that this a Points move
     */
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    lock: {
      type: 'string',
      descriptions: 'UUID Lock',
      required: true,
    },
  },
  fn: async ({ requestedMove, currentState, lock }, exits) => {
    try {
      const playedBy = requestedMove.playedBy ? 'p1' : 'p0';

      const cardPlayed = currentState[playedBy].hand.find(({ id }) => id === requestedMove.cardId);

      if (currentState.phase !== GamePhase.MAIN) {
        throw new Error('Cannot play points during this phase');
      }

      if (!cardPlayed) {
        throw new Error('game.snackbar.global.playFromHand');
      }

      if (cardPlayed.isFrozen) {
        throw new Error('game.snackbar.global.cardFrozen');
      }

      if (currentState.turn % 2 !== requestedMove.playedBy) {
        throw new Error('game.snackbar.global.notYourTurn');
      }

      if (cardPlayed.rank > 10) {
        throw new Error('game.snackbar.points.numberOnlyForPoints');
      }
      return exits.success();
    } catch (err) {
      await sails.helpers.unlockGame(lock);
      return exits.error(err);
    }
  },
};
