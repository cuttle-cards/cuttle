// Pull the logic into func outside fn to allow recursion w/o bumping into weirdness w/ sails' exits
async function getRematchGames (game, priorRematchGames = []) {
  const rematchGames = [ game, ...priorRematchGames ].map((matchGame) => {
    return {
      ...matchGame,
      // Get p0 and p1 id, whether populated or not
      p0: matchGame.p0?.id ?? matchGame.p0,
      p1: matchGame.p1?.id ?? matchGame.p1,
    };
  });
  const gameToAdd = await Game.findOne({ rematchGame: game.id });

  if (!gameToAdd) {
    return rematchGames;
  }

  return getRematchGames(gameToAdd, rematchGames);
}

module.exports = {
  friendlyName: 'Get Rematch Games',

  description:
    'Finds all the games that are in the rematch chain of the specified game',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game record to be added to the appropriate match. Should include an array of players',
      required: true,
    },
    priorRematchGames: {
      type: 'ref',
      description: 'List of previously played games in the current string of rematches',
      defaultsTo: [],
    }
  },

  fn: async ({ game, priorRematchGames }, exits) => {
    const games  = await getRematchGames(game, priorRematchGames);
    return exits.success(games);
  }
};
