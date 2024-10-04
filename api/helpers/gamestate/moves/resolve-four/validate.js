const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to resolve a four',

  description: 'Verifies whether a request to resolve a four is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to resolve a four
     * @param { String } requestedMove.cardId1 - First card to be discarded
     * @param { String } requestedMove.cardId2 - Second card to be discarded
     * @param { MoveType.RESOLVE_FOUR } requestedMove.moveType - Specifies that this is a Resolve Four move
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
      if (currentState.turn % 2 === playedBy) {
        throw new Error('game.snackbar.oneOffs.four.notYourTurn');
      }

      if (currentState.phase !== GamePhase.RESOLVING_FOUR) {
        throw new Error('game.snackbar.oneOffs.four.notResolvingFourPhase');
      }

      const player = playedBy ? currentState.p1 : currentState.p0;
      const { cardId1, cardId2 } = requestedMove;

      const selectedCard1 = player.hand.find(card => card.id === cardId1);
      const selectedCard2 = player.hand.find(card => card.id === cardId2);

      if ((requestedMove.cardId1 && !selectedCard1) || (requestedMove.cardId2 && !selectedCard2)) {
        throw new Error('game.snackbar.oneOffs.four.mustSelectCards');
      }

      if (!selectedCard2 && player.hand.length > 1) {
        throw new Error('game.snackbar.oneOffs.four.mustSelectCards');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
