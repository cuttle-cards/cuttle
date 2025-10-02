module.exports = {
  friendlyName: 'Broadcast game event',

  description: 'Send game event with specified payload to all socket rooms associated with the specified game id',

  extendedDescription: `
    Payload is left as-is. Event is broacast to the p0, p1, and spectator rooms for the game.
    This is in contrast to sails.helpers.gameStates.publishGameState(), which 
    inputs a GameState and sends customized socket events to each room (hiding asymmetric information)
  `,

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
