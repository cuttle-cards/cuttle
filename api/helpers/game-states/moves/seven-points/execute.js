const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Play Points from seven',

  description: 'Returns new GameState resulting from requested move to play one of the top two cards of the deck as points (from a seven one-off)',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player plays a card for points from a seven',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play points (req.body)
     * @param { MoveType.SEVEN_POINTS } requestedMove.moveType - Specifies that this a sevenPoints move
     * @param { String } requestedMove.cardId - Card Played for points
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies moveType and which card is being played for points',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    },
  },
  sync: true, // synchronous helper
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    const { cardId } = requestedMove;
    let result = _.cloneDeep(currentState);

    const player = playedBy ? result.p1 : result.p0;
    const cardIndex = result.deck.findIndex(({ id }) => id === cardId);
    const [ playedCard ] = result.deck.splice(cardIndex, 1);
    const { oneOff } = result;
    player.points.push(playedCard);
    result.scrap.push(oneOff);
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
