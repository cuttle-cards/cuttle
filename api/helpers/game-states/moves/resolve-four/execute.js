const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Resolve four',

  description: 'Returns new GameState resulting from requested resolve four move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player resolves a four card',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to resolve a four
     * @param { String } requestedMove.cardId1 - First card to be discarded
     * @param { String } requestedMove.cardId2 - Second card to be discarded
     * @param { MoveType.RESOLVE_FOUR } requestedMove.moveType - Specifies that this is a Resolve Four move
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies which player is asking to resolve a four',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    },
  },
  sync: true, // synchronous helper
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    const { cardId1, cardId2 } = requestedMove;
    let result = _.cloneDeep(currentState);

    const player = playedBy ? result.p1 : result.p0;
    const discardedCards = [];

    const cardIndex1 = player.hand.findIndex(({ id }) => id === cardId1);

    discardedCards.push(player.hand[cardIndex1]);
    result.scrap.push(result.oneOff, ...player.hand.splice(cardIndex1, 1));
  
    const cardIndex2 = cardId2 ? player.hand.findIndex(({ id }) => id === cardId2) : -1;

    if (cardIndex2 !== -1) {
      discardedCards.push(player.hand[cardIndex2]);
      result.scrap.push(...player.hand.splice(cardIndex2, 1));
    }

    result.turn++;

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      playedCard: null,
      targetCard: null,
      discardedCards,
      resolved: result.oneOff,
      oneOff: null,
    };

    return exits.success(result);
  },
};
