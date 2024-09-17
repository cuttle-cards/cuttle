const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to play Jack',

  description: 'Verifies whether a request to play a Jack is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play Jack
     * @param { String } requestedMove.cardId - Card Played (Jack)
     * @param { String } [ requestedMove.targetId ] - Card targeted by Jack
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

  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    try {
      const player = playedBy ? currentState.p1 : currentState.p0;
      const opponent = playedBy ? currentState.p0 : currentState.p1;

      const cardPlayed = player.hand.find(({ id }) => id === requestedMove.cardId);
      const targetCard = opponent.points.find(({ id }) => id === requestedMove.targetId);

      //gameState phase should be MAIN
      if (currentState.phase !== GamePhase.MAIN) {
        throw new Error(`Can only play a jack in main phase, not ${currentState.phase}`);
      }
      //is it player turn
      if (currentState.turn % 2 !== playedBy) {
        throw new Error('game.snackbar.global.notYourTurn');
      }
      //is cardPlayed in player hand
      if (!cardPlayed) {
        throw new Error('game.snackbar.global.playFromHand');
      }
      //is cardPlayed a jack
      if (!cardPlayed.rank === '11') {
        throw new Error('game.snackbar.jack.stealOnlyPointCards');
      }
      //is targetcard in the opponent points
      if (!targetCard) {
        throw new Error('game.snackbar.jack.stealOnlyPointCards');
      }
      //is any card frozen
      if (cardPlayed.isFrozen || targetCard.isFrozen) {
        throw new Error('game.snackbar.global.cardFrozen');
      }
      //does opponent have a queen in his faceCards to block the move
      const queenCount = opponent.faceCards.filter((faceCard) => faceCard.rank === 12).length;
      if (queenCount > 0) {
        throw new Error('game.snackbar.jack.noJackWithQueen');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
