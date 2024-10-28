const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to resolve five',

  description: 'Verifies whether a request to resolve a five is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to resolve five
     * @param { String } [requestedMove.cardId] - Card to discard (optional if no cards in hand)
     * @param { MoveType.RESOLVE_FIVE } requestedMove.moveType - Specifies that this a Resolve Five move
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
      const player = playedBy ? currentState.p1 : currentState.p0;

      if (currentState.turn % 2 !== playedBy) {
        throw new Error('game.snackbar.global.notYourTurn');
      }

      if (currentState.phase !== GamePhase.RESOLVING_FIVE) {
        throw new Error('game.snackbar.oneOffs.five.wrongPhase');
      }

      if (player.hand.length > 0 && !requestedMove.cardId) {
        throw new Error('game.snackbar.oneOffs.five.selectCardToDiscard');
      }

      if (requestedMove.cardId && !player.hand.find(({ id }) => id === requestedMove.cardId)) {
        throw new Error('You must discard a card from your hand');
      }

      if (currentState.deck.length === 0) {
        throw new Error('game.snackbar.oneOffs.five.fiveDeckIsEmpty');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
