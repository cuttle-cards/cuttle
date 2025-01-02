const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Discard a Jack via a seven',

  description: 'Returns new GameState resulting in discarding the played card (due to being unable to play card to resolve a previous seven, when both of the top two cards were jacks which could not be played)',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest gameState before discarding Jack from the seven',
      required: true,
    },
    /**
     * @param { Object } requestedMove - The move being requested.
     * @param { String } requestedMove.cardId - Card Played (Jack)
     * @param { MoveType.SEVEN_DISCARD } requestedMove.moveType - Specifies that this a sevenDiscard
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: '0 or 1 for whether p0 or p1 is making the move',
      required: true,
    },
  },
  sync: true,

  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    let result = _.cloneDeep(currentState);

    const { cardId } = requestedMove;
    const cardIndex = result.deck.findIndex(({ id }) => id === cardId);

    // Remove discarded card from the deck
    const [ playedCard ] = result.deck.splice(cardIndex, 1);

    // Scrap oneOff and playedCard
    const { oneOff } = result;
    result.scrap.push(oneOff, playedCard);

    result.turn++;

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      playedCard,
      discardCards: [ playedCard ],
      resolved: oneOff,
      oneOff: null,
    };

    return exits.success(result);
  },
};
