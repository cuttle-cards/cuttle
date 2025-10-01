module.exports = {
  friendlyName: 'Broadcast game event',

  description: 'Send game event to all socket rooms associated with the game id',

  inputs: {
    gameId: {
      type: 'number',
      required: true,
    },
    payload: {
      type: 'ref',
      required: true,
    },
  },

  sync: true,

  fn: ({ gameId, payload }, exits) => {
    try {
      sails.sockets.broadcast(`game_${gameId}_p0`, 'game', payload);
      sails.sockets.broadcast(`game_${gameId}_p1`, 'game', payload);
      sails.sockets.broadcast(`game_${gameId}_spectator`, 'game', payload);
    } catch (err) {
      return exits.error(err);
    }
    return exits.success(true);
  },
};
