const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Draw a card',

  description: 'Returns new GameState resulting from requested draw move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player draws a card',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to draw (req.body)
     * @param { MoveType.DRAW } requestedMove.moveType - Specifies that this a Draw move
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies moveType and which player is drawing',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    },
  },
  sync: true, // synchronous helper
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    let result = _.cloneDeep(currentState);

    const player = playedBy ? result.p1 : result.p0;

    player.hand.push(result.deck.shift());
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
