const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Play Untargeted One-Off',

  description: 'Returns new GameState resulting from requested untargetedOneOff move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player plays a one-off',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play points (req.body)
     * @param { String } requestedMove.cardId - Card Played for points
     * @param { MoveType.UNTARGETED_ONE_OFF } requestedMove.moveType
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies which player is asking to play a one-ff points',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    },
  },
  sync: true, // synchronous helper
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    const { cardId } = requestedMove;
    let result = _.cloneDeep(currentState);

    const player = currentState[`p${playedBy}`];
    const cardIndex = player.hand.findIndex(({ id }) => id === cardId);

    const [ playedCard ] = player.hand.splice(cardIndex, 1);

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.COUNTERING,
      oneOff: playedCard,
      playedBy,
      playedCard,
    };

    return exits.success(result);
  },
};
