// api/helpers/gameState/moves/points/execute.js
const _ = require('lodash');

module.exports = {
  friendlyName: 'Play Points',

  description: 'Returns new GameState resulting from requested points move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest game state before the requesting player plays a card for points',
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
  },
  sync: true, // synchronous helper
  fn: ({ currentState, requestedMove }, exits) => {
    const { playedBy, cardPlayed } = requestedMove;
    let result = _.cloneDeep(currentState);
    const player = playedBy ? result.p1 : result.p0;

    player.points.push(requestedMove.cardPlayed);
    player.hand = player.hand.filter(({ id }) => id !== cardPlayed.id);
    result.scrap.push(cardPlayed);
    result.turn++;

    result = {
      ...result,
      ...requestedMove,
    };

    return exits.success(result);
  },
};
