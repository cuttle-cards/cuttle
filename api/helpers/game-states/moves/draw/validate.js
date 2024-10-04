const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to draw a card',

  description: 'Verifies whether a request to draw a card is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { MoveType.DRAW } requestedMove.moveType - Specifies that this a draw move
     * @param { Object } requestedMove - Object describing the request to draw
     * @param { 1 | 0 } requestedMove.playedBy - Which player is drawing
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
  fn: ({ currentState, playedBy }, exits) => {
    try {

      // Must be MAIN phase of the turn
      if (currentState.phase !== GamePhase.MAIN) {
        throw new Error('game.snackbar.global.notInMainPhase');
      }

      // Must be your turn
      if (currentState.turn % 2 !== playedBy) {
        throw new Error('game.snackbar.global.notYourTurn');
      }

      // Must be under hand limit of 8
      const player = playedBy ? currentState.p1 : currentState.p0;
      if (player.hand.length >= 8) {
        throw new Error('game.snackbar.draw.handLimit');
      }

      // Deck must have cards
      if (!currentState.deck.length) {
        throw new Error('game.snackbar.draw.deckIsEmpty');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
