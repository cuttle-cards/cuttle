const GamePhase = require('../../../../../utils/GamePhase.json');
const BadRequestError = require('../../../../errors/badRequestError');

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
    priorStates: {
      type: 'ref',
      description: 'List of packed gameStateRows for this game\'s prior states',
      required: true,
    }
  },
  sync: true,
  fn: ({ currentState, playedBy }, exits) => {
    try {
      // Must be your turn
      if (currentState.turn % 2 !== playedBy) {
        throw new BadRequestError('game.snackbar.global.notYourTurn');
      }

      // Must be MAIN phase of the turn
      if (currentState.phase !== GamePhase.MAIN) {
        throw new BadRequestError('game.snackbar.global.notInMainPhase');
      }

      // TODO: Translate this
      if (currentState.deck.length) {
        throw new BadRequestError('Can\'t pass while there are cards in deck');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
