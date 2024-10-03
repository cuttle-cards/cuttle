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

    player.hand.forEach((card, index, object) => {
      if (card.id === cardId1 || card.id === cardId2) {
        discardedCards.push(card);
        result.scrap.push(card);
        object.splice(index, 1);
      }
    });

    result.turn++;

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      playedCard: null,
      discardedCards,
      resolved: result.oneOff,
      oneOff: null,
    };

    return exits.success(result);
  },
};
