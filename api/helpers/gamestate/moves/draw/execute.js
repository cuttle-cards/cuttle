module.exports = {
  friendlyName: 'Draw a card',

  description: 'Returns new GameState resulting from requested draw move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the requesting player draws a card',
      required: true,
    },
    /**
     * @param {Object} requestedMove - Object describing the request to play points (req.body)
     * @param { MoveType.DRAW } requestedMove.moveType - Specifies that this a Points move
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested. Specifies moveType and which player is drawing',
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
      playedCard: player.points.at(-1),
    };

    return exits.success(result);
  },
};
