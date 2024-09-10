const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to play untargeted one-off',

  description:
    'Verifies whether a request to play untargeted one-off is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play points
     * @param { String } requestedMove.cardId - Card Played for points
     * @param { String } [ requestedMove.targetId ] - OPTIONAL target of one-off
     * @param { MoveType.ONE_OFF } requestedMove.moveType
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
      const player = currentState[`p${playedBy}`];
      const opponent = currentState[`p${(playedBy + 1) % 2}`];

      const cardPlayed = player.hand.find(({ id }) => id === requestedMove.cardId);

      if (currentState.phase !== GamePhase.MAIN) {
        throw new Error(`Can only play one-off in main phase, not ${currentState.phase}`);
      }

      if (currentState.oneOff) {
        throw new Error('There is already a one-off in play; You cannot play any card, except a two to counter.');
      }

      if (!cardPlayed) {
        throw new Error('game.snackbar.global.playFromHand');
      }

      if (currentState.turn % 2 !== playedBy) {
        throw new Error('game.snackbar.global.notYourTurn');
      }

      if (cardPlayed.isFrozen) {
        throw new Error('game.snackbar.global.cardFrozen');
      }


      switch (cardPlayed.rank) {
        case 1:
          return exits.success();
        case 2:
          return exits.success();
        case 3:
          return exits.success();
        case 4:
          return exits.success();
        case 5:
          return exits.success();
        case 6:
          return exits.success();
        case 7:
          return exits.success();
        case 9:
          return exits.success();
        default: 
          throw new Error('You cannot play that card as a one-off without a target.');
      }

    } catch (err) {
      return exits.error(err);
    }
  },
};
