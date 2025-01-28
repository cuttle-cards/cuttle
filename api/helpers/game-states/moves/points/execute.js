const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Play Points',

  description: 'Returns new GameState resulting from requested points move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player plays a card for points',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to play points (req.body)
     * @param { String } requestedMove.cardId - Card Played for points
     * @param { MoveType.POINTS } requestedMove.moveType - Specifies that this a Points move
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies which player is asking to play a card for points',
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
    const cardIndex = player.hand.findIndex(({ id }) => id === cardId);

    player.points.push(...player.hand.splice(cardIndex, 1));
    result.turn++;

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      playedCard: player.points.at(-1),
      targetCard: null,
      discardedCards: [],
      resolved: null,
    };

    return exits.success(result);
  },
};
