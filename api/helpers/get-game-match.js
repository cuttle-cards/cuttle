module.exports = {
  friendlyName: 'Get Game Match',

  description:
    'Returns the match the specified game belongs to, counting only the games played up to it. Casual games resolve through their rematch chain. Ranked games resolve through the Match they were recorded in, or null if they have not been added to one. Read-only: unlike addGameToMatch, this neither creates nor mutates records.',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game record whose match should be returned',
      required: true,
    },
  },

  fn: async ({ game }, exits) => {
    try {
      if (!game.isRanked) {
        const match = await sails.helpers.getCasualMatch(game);
        return exits.success(match);
      }

      const matchId = game.match?.id ?? game.match;
      if (!matchId) {
        return exits.success(null);
      }

      const match = await Match.findOne({ id: matchId }).populate('games');
      if (!match) {
        return exits.success(null);
      }

      match.games = match.games.filter((matchGame) => matchGame.id <= game.id);
      const p1Wins = match.games.filter((matchGame) => matchGame.winner === match.player1).length;
      const p2Wins = match.games.filter((matchGame) => matchGame.winner === match.player2).length;

      // Compute winner based on games played prior to current game
      match.winner = p1Wins >= 2 ?
        match.player1 : p2Wins >= 2 ?
          match.player2 : null;

      return exits.success(match);
    } catch (err) {
      return exits.error(err);
    }
  },
};
