const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Reveal cards for a four',

  description:
    'Returns new GameState resulting from the victim of a four revealing three cards from their hand, ' +
    'from which the four\'s player will choose two to discard',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player reveals cards',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to reveal cards
     * @param { string[] } requestedMove.fourRevealedCards - IDs of the three cards from hand to reveal
     * @param { MoveType.REVEAL_FOUR } requestedMove.moveType
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
    const { fourRevealedCards: revealedIds } = requestedMove;
    let result = _.cloneDeep(currentState);

    const player = playedBy ? result.p1 : result.p0;
    // The cards stay in hand; fourRevealedCards only records which ones the four's player may choose
    const fourRevealedCards = player.hand.filter(({ id }) => revealedIds.includes(id));

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.RESOLVING_FOUR_DISCARD,
      playedBy,
      playedCard: null,
      targetCard: null,
      discardedCards: [],
      fourRevealedCards,
    };

    return exits.success(result);
  },
};
