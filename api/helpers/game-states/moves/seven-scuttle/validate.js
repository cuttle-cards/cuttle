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
      const player = playedBy ? currentState.p1 : currentState.p0;
      const opponent = playedBy ? currentState.p0 : currentState.p1;

      const topTwoCards = currentState.deck.slice(0, 2);

      const cardPlayedIndex = topTwoCards.findIndex(({ id }) => id === requestedMove.cardId);
      if (cardPlayedIndex === -1) {
        throw new Error('game.snackbar.seven.pickAndPlay');
      }

      const targetCard = opponent.points.find(({ id }) => id === requestedMove.targetId);

      if (currentState.turn % 2 !== playedBy) {
        throw new Error('game.snackbar.global.notYourTurn');
      }

      if (currentState.phase !== GamePhase.RESOLVING_SEVEN) {
        throw new Error('game.snackbar.global.notInMainPhase');
      }

      if (!playedCard) {
        throw new Error('game.snackbar.global.playFromHand');
      }

      if (playedCard.rank !== 7) {
        throw new Error('game.snackbar.sevenScuttle.mustPlaySeven');
      }

      if (!targetCard) {
        throw new Error('game.snackbar.scuttle.mustTargetPointCard');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
