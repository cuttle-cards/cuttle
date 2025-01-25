const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Scuttle',

  description: 'Returns new GameState resulting from requested scuttle move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player scuttles',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play scuttle
     * @param { String } requestMove.cardId - Card Played 
     * @param { String } requestMove.targetId - Card Targeted
     * @param { MoveType.SCUTTLE } requestedMove.moveType - Specifies that this a scuttle
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
  sync: true, // synchronous helper
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    let result = _.cloneDeep(currentState);

    const { cardId, targetId } = requestedMove;

    const player = playedBy ? result.p1 : result.p0;
    const opponent = playedBy ? result.p0 : result.p1;

    // remove playedCard from players hand
    const cardPlayedIndex = player.hand.findIndex(({ id }) => id === cardId);
    const [ playedCard  ] = player.hand.splice(cardPlayedIndex, 1);
    
    // remove target card from oppponent points
    const targetPlayedIndex = opponent.points.findIndex(({ id }) => id === targetId);
    const [ targetCard ]= opponent.points.splice(targetPlayedIndex, 1);
    
    // move both cards into scrap
    result.scrap.push(targetCard, playedCard );

    result.turn++;

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      playedCard,
      targetCard,
      discardedCards: [],
      resolved: null,
    };
    return exits.success(result);
  },
};
