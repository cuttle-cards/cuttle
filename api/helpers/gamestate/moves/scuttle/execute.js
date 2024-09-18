const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Scuttle',

  description: 'Returns new GameState resulting from requested draw move',

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
     * @param { MoveType.DRAW } requestedMove.moveType - Specifies that this a scuttle
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies moveType and which player is scuttling',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    },
  },
  sync: true, // synchronous helper
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    let result = _.cloneDeep(currentState);

    const { cardId, targetId } = requestedMove

    const player = playedBy ? result.p1 : result.p0;
    const opponent = playedBy ? result.p0 : result.p1;

    const playedCard = player.hand.find(({ id }) => id === cardId);
    const targetCard = opponent.points.find(({ id }) => id === targetId);
    
    // removing playedCard from players hand and
    const cardIndex = player.hand.findIndex(({ id }) => id === cardId);
    player.hand.splice(cardIndex, 1);
    result.scrap.push(playedCard);
    //remove target card from oppponent points
    const targetIndex = opponent.points.findIndex(({ id }) => id === targetId);
    opponent.points.splice(targetIndex, 1);
    result.scrap.push(targetCard);

    result.turn++;

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      playedCard: playedCard.id,
      targetCard: targetCard.id
    };
console.log(targetCard);
    return exits.success(result);
  },
};
