/**
 * @param {Object} requestedMove - Object describing the request to play points
 * @param {1 | 0} requestedMove.playedBy - Which player is playing
 * @param { Card } requestedMove.cardPlayed - Card Played for points
 * @param { MoveType.POINTS } requestedMove.moveType - Specifies that this a Points move
 */

module.exports = {
  friendlyName: 'Parse points request',

  description: 'Returns needed values to make points requests',

  inputs: {
    body: {
      type: 'ref',
      description: 'The body of the HTTP request',
      required: true,
    },
  },
  sync: true, // synchronous helper
  fn: ({ body }, exits) => {
    try {
      const { moveType, playedBy, cardPlayed } = body;
      const requestedMove = { moveType, playedBy, cardPlayed };
      return exits.success(requestedMove);
    } catch (e) {
      throw { message: e.message };
    }
  },
};
