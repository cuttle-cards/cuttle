// api/helpers/gameState/moves/points/validate.js
const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Parse points request',

  description: 'Returns needed values to make points requests',

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
  },
  sync: true, // synchronous helper
  fn: ({ requestedMove, gameState }, exits) => {
    const cardPlayed = gameState[`${requestedMove.playedBy}Hand`].includes(requestedMove.cardPlayed);

    if (gameState.phase !== GamePhase.MAIN) {
      throw { message: 'Cannot play points during this phase' };
    }

    if (!cardPlayed) {
      throw { message: 'game.snackbar.global.playFromHand' };
    }

    if (cardPlayed.isFrozen) {
      throw { message: 'game.snackbar.global.cardFrozen' };
    }

    if (gameState.turn % 2 !== requestedMove.playedBy) {
      throw { message: 'game.snackbar.global.notYourTurn' };
    }

    if (cardPlayed.rank > 10) {
      throw { message: 'game.snackbar.points.numberOnlyForPoints' };
    }
    exits.success();
  },
};
