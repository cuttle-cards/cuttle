const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Seven_Scuttle',

  description: 'Returns new GameState resulting from requested scuttle move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player scuttles',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to scuttle from the top of the deck
     * @param { String } requestMove.cardId - Card Played 
     * @param { String } requestMove.targetId - Card Targeted
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
    let result = _.cloneDeep(currentState);

    const { cardId, targetId } = requestedMove;

    const opponent = playedBy ? result.p0 : result.p1;

    const cardIndex = result.deck.findIndex(({ id }) => id === cardId);
    const [ playedCard ] = result.deck.splice(cardIndex, 1);
    
    const targetPlayedIndex = opponent.points.findIndex(({ id }) => id === targetId);
    const [ targetCard ] = opponent.points.splice(targetPlayedIndex, 1);
    
    result.scrap.push(targetCard, playedCard);

    result.turn++;

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      playedCard,
      targetCard
    };
    return exits.success(result);
  },
};