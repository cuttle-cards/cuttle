const GamePhase = require('../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Get Active Player pNum',

  description: 'Returns the pNum (0 or 1) of the player who is currently allowed to make a move',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },

  },
  sync: true,
  fn: ({ currentState }, exits) => {

    switch (currentState.phase) {
      case GamePhase.MAIN:
      case GamePhase.RESOLVING_THREE:
      case GamePhase.RESOLVING_FIVE:
      case GamePhase.RESOLVING_SEVEN:
        return exits.success(currentState.turn % 2);

      case GamePhase.COUNTERING: {
        const res = sails.helpers.gameStates.yourTurnToCounter(currentState, 0) ? 0 : 1;
        return exits.success(res);
      }

      case GamePhase.RESOLVING_FOUR:
        return exits.success((currentState.turn + 1) % 2);

      case GamePhase.CONSIDERING_STALEMATE:
        return exits.success((currentState.playedBy + 1) % 2);

      default:
        return exits.error(new Error(`Cannot identify active player for unknown game phase: ${currentState.phase}`));
    }
  },
};
