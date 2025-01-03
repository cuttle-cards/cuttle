const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Counter One-Off',

  description: 'Returns new GameState resulting from requested counter move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player counters the pending one-off',
      required: true,
    },
    /**
     * @param { Object } requestedMove - The move being requested. 
     * Specifies that the move is to counter
     * @param { MoveType.COUNTER } requestedMove.moveType
     * @param { String } requestedMove.cardId
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies the moveType and the card being played to counter',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    },
  },
  sync: true, // synchronous helper
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    let result = _.cloneDeep(currentState);

    const { cardId } = requestedMove;
    const player = playedBy ? result.p1 : result.p0;
    const cardIndex = player.hand.findIndex(({ id }) => id === cardId);
    const targetCard = result.twos[result.twos.length - 1] ?? result.oneOff;
    const [ playedCard ] = player.hand.splice(cardIndex, 1);
    result.twos.push(playedCard);

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.COUNTERING,
      playedBy,
      playedCard,
      targetCard,
      discardedCards: [],
      resolved: null,
    };

    return exits.success(result);
  },
};
