module.exports = {
  friendlyName: 'Validate Concede',
  description: 'Validate request to forfeit the game, declaring your opponent the winner. Always returns true',
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
  fn: (_inputs, exits) => {
    return exits.success(true);
  },
};
