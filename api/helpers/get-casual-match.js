module.exports = {
  friendlyName: 'Get Casual Match for a specified casual game',

  description:
    'Finds all the games that are in the rematch chain of the specified game and combines them into a mocked Match object to mock the Match model',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game record to be added to the appropriate match. Should include an array of players',
      required: true,
    },
  },

  fn: async ({ game }, exits) => {
    const games  = await sails.helpers.getRematchGames(game);
    const [ firstGame ] = games;

    return exits.success({
      player1: firstGame.p0,
      player2: firstGame.p1,
      winner: null, // no one wins a casual match
      startTime: firstGame.updatedAt,
      endTime: null,
      games,
    });
  },
};
