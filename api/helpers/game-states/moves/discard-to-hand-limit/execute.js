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
     * @param { string[] } requestedMove.discardedCards - IDs of cards to discard (exactly hand.length - 8)
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
    const { discardedCards: discardIds } = requestedMove;
    let result = _.cloneDeep(currentState);

    const player = playedBy ? result.p1 : result.p0;
    const discardedCards = [];

    for (const cardId of discardIds) {
      const cardIndex = player.hand.findIndex(({ id }) => id === cardId);
      if (cardIndex !== -1) {
        discardedCards.push(player.hand[cardIndex]);
        result.scrap.push(...player.hand.splice(cardIndex, 1));
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
