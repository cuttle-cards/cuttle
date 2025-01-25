const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Pass',

  description: 'Returns new GameState resulting from requested pass',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player pass a move',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to pass (req.body)
     * @param { MoveType.PASS } requestedMove.moveType - Specifies that this a Pass move
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies moveType and which player is passing',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    },
  },
  sync: true, // synchronous helper
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    let result = _.cloneDeep(currentState);

    result.turn++;

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      playedCard: null,
      targetCard: null,
      discardedCards: [],
      resolved: null,
    };
    return exits.success(result);
  },
};
