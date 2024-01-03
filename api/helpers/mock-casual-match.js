async function getRematchGames (game, priorRematchGames = []) {
  const rematchGames = [...priorRematchGames, game];
  const gameToAdd = await Game.findOne({ rematchGame: game.id });
  if (!gameToAdd) {
    return rematchGames;
  }
  rematchGames.unshift(gameToAdd);
  if (!gameToAdd.rematchGame) {
    return rematchGames;
  }
  return getRematchGames(gameToAdd, rematchGames);
}

module.exports = {
  friendlyName: 'Mock Casual Match',

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
    const games  = await getRematchGames(game);
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
