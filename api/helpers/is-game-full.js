module.exports = {
  friendlyName: 'Is Game Full?',

  description: 'Returns true if a game is full and unavailable to join',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game to be evaluated',
      required: true,
    },
  },

  sync: true, // synchronous helper

  fn: ({ game }, exits) => {

    const gameIsFull =
      game.status !== gameService.GameStatus.CREATED ||
      game.players.length >= 2 || 
      game.log.length > 0 || 
      !_.isEqual(game.lastEvent, {});

    return exits.success(gameIsFull);
  },
};
