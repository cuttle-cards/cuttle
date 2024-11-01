const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Resolve Five',

  description: 'Returns new GameState resulting from resolving a five',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player resolves the five',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to resolve five (req.body)
     * @param { String } [requestedMove.cardId] - Optional card to discard (if player has cards in hand)
     * @param { MoveType.RESOLVE_FIVE } requestedMove.moveType - Specifies that this is a Resolve Five move
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies the card to discard (optional if hand is empty).',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player resolving the five.',
    },
  },
  sync: true,
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    const { cardId } = requestedMove;
    let result = _.cloneDeep(currentState);

    const player = playedBy ? result.p1 : result.p0;
    
    result.scrap.push(result.oneOff);
    result.discardedCards = [];
    
    if (cardId) {
      const cardIndex = player.hand.findIndex(({ id }) => id === cardId);
      const [ discardedCard ] = player.hand.splice(cardIndex, 1);
      result.scrap.push(discardedCard); 
      result.discardedCards.push(discardedCard);
    }

    const cardsToDraw = Math.min(3, result.deck.length);
    const spaceInHand = 8 - player.hand.length;
    const actualCardsToDraw = Math.min(cardsToDraw, spaceInHand);

    player.hand.push(...result.deck.splice(0, actualCardsToDraw));

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      playedCard: null,
      targetCard: null,
      resolved: result.oneOff,
      oneOff: null,
      turn: result.turn + 1,
    };

    return exits.success(result);
  },
};
