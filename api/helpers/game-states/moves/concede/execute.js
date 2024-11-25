module.exports = {
  friendlyName: 'Concede',
  description: 'Forfeit the game, declaring your opponent the winner',
  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest gameState before Conceding',
      required: true,
    },
    /**
     * @param { Object } requestedMove - The move being requested.
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
    const result = {
      ...(_.cloneDeep(currentState)),
      moveType: requestedMove.moveType, // MoveType.CONCEDE
      playedBy,
      playedCard: null,
      targetCard: null,
      discardedCards: [],
      resolved: null,
    };

    return exits.success(result);
  },
};
