const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Seven Scuttle',

  description: 'Returns new GameState resulting from requested scuttle move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player scuttles',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to scuttle from the top of the deck
     * @param { String } requestedMove.cardId - Card Played 
     * @param { String } requestedMove.targetId - Card Targeted
     * @param { MoveType.SEVEN_SCUTTLE } requestedMove.moveType - Specifies that this a sevenScuttle
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies moveType, card played and targeted',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    },
  },
  sync: true,
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    const { cardId, targetId } = requestedMove;
    let result = _.cloneDeep(currentState);

    const opponent = playedBy ? result.p0 : result.p1;

    // Remove playedCard from the top of the deck
    const cardIndex = result.deck.findIndex(({ id }) => id === cardId);
    const [ playedCard ] = result.deck.splice(cardIndex, 1);

    // Remove targetCard from opponent's points
    const targetIndex = opponent.points.findIndex(({ id }) => id === targetId);
    const [ targetCard ] = opponent.points.splice(targetIndex, 1);

    // Move both cards to scrap and cleanup seven
    const { oneOff } = result;
    result.scrap.push(oneOff, targetCard, playedCard);

    result.turn++;

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      oneOff: null,
      playedBy,
      playedCard,
      targetCard: null,
      discardedCards: [],
      resolved: oneOff,
    };

    return exits.success(result);
  },
};
