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
     * @param {Object} requestedMove - Object describing the request to play points
     * @param {1 | 0} requestedMove.playedBy - Which player is playing
     * @param { Card } requestedMove.cardPlayed - Card Played for points
     * @param { MoveType.POINTS } requestedMove.moveType - Specifies that this a Points move
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies which player is asking to play a card for points',
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player making move.',
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
      cardPlayed: player.points.at(-1),
    };

    return exits.success(result);
  },
};
