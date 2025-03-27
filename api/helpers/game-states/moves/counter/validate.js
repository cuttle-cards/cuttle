const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to counter pending one-off',

  description: 'Verifies whether a request to counter is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to 
     * @param { MoveType.COUNTER } requestedMove.moveType - Specifies that this a counter move
     * @param { 1 | 0 } requestedMove.playedBy - Which player is resolving
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

      // Must be COUNTERING phase
      if (currentState.phase !== GamePhase.COUNTERING) {
        throw new Error(`game.phase.invalidCounterPhase`);
      }

      if (!currentState.oneOff) {
        throw new Error('game.phase.invalidCounterNoOneOff');
      }

      const player = playedBy ? currentState.p1 : currentState.p0;
      const playedCard = player.hand.find(({ id }) => requestedMove.cardId === id);
      if (!playedCard) {
        throw new Error('game.snackbar.global.playFromHand');
      }

      // Must be your chance to counter
      const yourTurnToCounter = sails.helpers.gameStates.yourTurnToCounter(currentState, playedBy);
      if (!yourTurnToCounter) {
        throw new Error('game.phase.invalidCounterWaitingForOpponent');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
