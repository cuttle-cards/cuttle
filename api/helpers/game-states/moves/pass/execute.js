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
    priorStates: {
      type: 'ref',
      description: 'List of packed gameStateRows for this game\'s prior states',
      required: true,
    }
  },
  sync: true, // synchronous helper
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    let result = _.cloneDeep(currentState);

    const player = playedBy ? result.p1 : result.p0;
    const playerMustDiscard = player.hand.length > 8;

    result = {
      ...result,
      ...requestedMove,
      phase: playerMustDiscard ? GamePhase.DISCARDING_TO_HAND_LIMIT : GamePhase.MAIN,
      turn: playerMustDiscard ? result.turn : result.turn + 1,
      playedBy,
      playedCard: null,
      targetCard: null,
      discardedCards: [],
      resolved: null,
    };
    return exits.success(result);
  },
};
