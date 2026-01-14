const GamePhase = require('../../../../../utils/GamePhase.json');
const BadRequestError = require('../../../../errors/badRequestError');

module.exports = {
  friendlyName: 'Validate request to resolve a three',

  description: 'Verifies whether a request to resolve a three is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to resolve a three
     * @param { String } requestedMove.cardId - Card to retrieve from the scrap pile
     * @param { MoveType.RESOLVE_THREE } requestedMove.moveType - Specifies that this a Resolve Three move
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
  fn: ({ requestedMove, currentState, playedBy }, exits) => {
    try {
      const target = currentState.scrap.find(card => card.id === requestedMove.cardId);

      if (currentState.turn % 2 !== playedBy) {
        throw new BadRequestError('game.snackbar.global.notYourTurn');
      }

      if (currentState.phase !== GamePhase.RESOLVING_THREE) {
        throw new BadRequestError('game.snackbar.oneOffs.three.notResolvingThreePhase');
      }

      if (!target) {
        throw new BadRequestError('game.snackbar.oneOffs.three.mustPickFromScrap');
      }

      if (target.rank === 3) {
        throw new BadRequestError('game.snackbar.oneOffs.three.cannotTargetThree');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
