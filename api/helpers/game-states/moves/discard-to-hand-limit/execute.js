const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Discard to hand limit',

  description: 'Returns new GameState resulting from a player discarding excess cards to reach the hand limit',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player discards excess cards',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to discard to hand limit
     * @param { String } requestedMove.cardId1 - First card to be discarded
     * @param { String } [requestedMove.cardId2] - Second card to be discarded (if needed)
     * @param { MoveType.DISCARD_TO_HAND_LIMIT } requestedMove.moveType
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested.',
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
  sync: true,
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    const { cardId1, cardId2 } = requestedMove;
    let result = _.cloneDeep(currentState);

    const player = playedBy ? result.p1 : result.p0;
    const discardedCards = [];

    const cardIndex1 = player.hand.findIndex(({ id }) => id === cardId1);
    discardedCards.push(player.hand[cardIndex1]);
    result.scrap.push(...player.hand.splice(cardIndex1, 1));

    if (cardId2) {
      const cardIndex2 = player.hand.findIndex(({ id }) => id === cardId2);
      if (cardIndex2 !== -1) {
        discardedCards.push(player.hand[cardIndex2]);
        result.scrap.push(...player.hand.splice(cardIndex2, 1));
      }
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
      resolved: null,
      oneOff: null,
    };

    return exits.success(result);
  },
};
