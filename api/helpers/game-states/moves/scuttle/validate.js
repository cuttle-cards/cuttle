const GamePhase = require('../../../../../types/GamePhase.json');
const BadRequestError = require('../../../../errors/badRequestError');

module.exports = {
  friendlyName: 'Validate request to scuttle',

  description: 'Verifies whether a request to make scuttle is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to scuttle
     * @param { String } requestedMove.cardId - Card Played for scuttle
     * @param { String } requestedMove.targetId - Card Targeted for scuttle
     * @param { MoveType.SCUTTLE } requestedMove.moveType - Specifies that this a scuttle
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
      const opponent = playedBy ? currentState.p0 : currentState.p1;

      const playedCard = player.hand.find(({ id }) => id === requestedMove.cardId);
      const targetCard = opponent.points.find(({ id }) => id === requestedMove.targetId);

      if (currentState.turn % 2 !== playedBy) {
        throw new BadRequestError('game.snackbar.global.notYourTurn');
      }

      if (currentState.phase !== GamePhase.MAIN) {
        throw new BadRequestError('game.snackbar.global.notInMainPhase');
      }

      if (!playedCard) {
        throw new BadRequestError('game.snackbar.global.playFromHand');
      }

      if (playedCard.isFrozen) {
        throw new BadRequestError('game.snackbar.global.cardFrozen');
      }

      if (playedCard.rank > 10) {
        throw new BadRequestError('game.snackbar.points.numberOnlyForPoints');
      }

      if (!targetCard) {
        throw new BadRequestError('game.snackbar.scuttle.mustTargetPointCard');
      }

      const lowerRank = playedCard.rank < targetCard.rank;
      const sameRankLowerSuit = playedCard.rank === targetCard.rank && playedCard.suit < targetCard.suit;

      if (lowerRank || sameRankLowerSuit) {
        throw new BadRequestError('game.snackbar.scuttle.rankTooLow');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
