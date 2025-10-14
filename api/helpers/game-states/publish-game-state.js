module.exports = {
  friendlyName: 'Publish Game State',

  description: 'Creates three socket events and broadcasts them to their respective rooms (p0, p1, spectator)',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game object',
      required: true,
    },
    gameState: {
      type: 'ref',
      description: 'Game state object (unpacked)',
      required: true,
    },
  },

  fn: async function ({ game, gameState }, exits) {
    try {
      // Create the three socket events using the createSocketEvents helper
      const socketEvents = await sails.helpers.gameStates.createSocketEvents(game, gameState);

      // Extract the three states
      const { p0State, p1State, spectatorState } = socketEvents;

      // Define room names
      const { gameId } = gameState;
      const p0Room = `game_${gameId}_p0`;
      const p1Room = `game_${gameId}_p1`;
      const spectatorRoom = `game_${gameId}_spectator`;

      // Broadcast to each room
      sails.sockets.broadcast(p0Room, 'game', p0State),
      sails.sockets.broadcast(p1Room, 'game', p1State),
      sails.sockets.broadcast(spectatorRoom, 'game', spectatorState);

      return exits.success({
        p0State,
        p1State,
        spectatorState,
        rooms: [ p0Room, p1Room, spectatorRoom ]
      });

    } catch (err) {
      return exits.error(new Error(`Error publishing game state: ${err.message}`));
    }
  },
};
