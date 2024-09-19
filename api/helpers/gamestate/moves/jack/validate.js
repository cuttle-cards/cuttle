const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to play Jack',

  description: 'Verifies whether a request to play a Jack is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'Object containing the current gameState',
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
        throw new Error('game.snackbar.global.notInMainPhase');
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
      if (cardPlayed.rank !== 11) {
        throw new Error('game.snackbar.jack.stealOnlyPointCards');
      }

      //is targetcard in the opponent points
      if (!targetCard) {
        throw new Error('game.snackbar.jack.stealOnlyPointCards');
      }

      //is cardPlayed frozen
      if (cardPlayed.isFrozen) {
        throw new Error('game.snackbar.global.cardFrozen');
      }

      //Can't hack if opponent has queen
      const queenCount = opponent.faceCards.filter(({ rank }) => rank === 12).length;
      if (queenCount > 0) {
        throw new Error('game.snackbar.jack.noJackWithQueen');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
