const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to Pass',

  description: 'Verifies whether a request to pass a move is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to pass
     * @param { MoveType.PASS } requestedMove.moveType - Specifies that this a passing move
     * @param { 1 | 0 } requestedMove.playedBy - Which player is passing
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
      // Must be your turn
      if (currentState.turn % 2 !== playedBy) {
        throw new Error('game.snackbar.global.notYourTurn');
      }

      // Must be MAIN phase of the turn
      if (currentState.phase !== GamePhase.MAIN) {
        throw new Error('game.snackbar.global.notInMainPhase');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
