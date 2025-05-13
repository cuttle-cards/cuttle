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
      (game.p0 && game.p1) ||
      game.gameStates?.length;

    return exits.success(gameIsFull);
  },
};
