const GameStatus = require('../../utils/GameStatus.json');

// Summarize a game record down to what a spectator needs to navigate between
// games, normalizing p0/p1 to ids whether or not they're populated
const summarizeGame = (game) => ({
  id: game.id,
  status: game.status,
  winner: game.winner?.id ?? game.winner ?? null,
  p0: game.p0?.id ?? game.p0 ?? null,
  p1: game.p1?.id ?? game.p1 ?? null,
  createdAt: game.createdAt,
});

/**
 * Collect the whole rematch chain the given game sits in, walking backward to the
 * first game and forward to the last.
 *
 * This deliberately does not reuse getRematchGames: that helper only walks backward
 * (it looks up whichever game points at the current one), and it recurses without
 * tracking which games it has already seen. A spectator request must terminate even
 * if rematchGame ever forms a cycle, so both directions stop on a repeat id.
 */
async function collectRematchChain(game) {
  const chain = new Map([ [ game.id, game ] ]);

  // Backward: the game whose rematchGame points at the one we're holding
  let current = game;
  while (current) {
    const previousGame = await Game.findOne({ rematchGame: current.id });
    if (!previousGame || chain.has(previousGame.id)) {
      break;
    }
    chain.set(previousGame.id, previousGame);
    current = previousGame;
  }

  // Forward: follow rematchGame to each successor
  current = game;
  while (current) {
    const nextGameId = current.rematchGame?.id ?? current.rematchGame;
    if (!nextGameId || chain.has(nextGameId)) {
      break;
    }
    const nextGame = await Game.findOne({ id: nextGameId });
    if (!nextGame) {
      break;
    }
    chain.set(nextGame.id, nextGame);
    current = nextGame;
  }

  return [ ...chain.values() ];
}

module.exports = {
  friendlyName: 'Get Match Games',

  description:
    'Returns every game in the match the specified game belongs to, oldest first. Ranked games resolve through their Match record; casual games resolve through their rematch chain. Read-only: unlike addGameToMatch, this neither creates nor mutates records, and it does not truncate the list to games played so far.',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game record whose match should be listed',
      required: true,
    },
  },

  fn: async ({ game }, exits) => {
    try {
      const matchId = game.match?.id ?? game.match;
      let matchGames;

      if (matchId) {
        const match = await Match.findOne({ id: matchId }).populate('games');
        matchGames = match?.games ?? [ game ];
      } else {
        matchGames = await collectRematchChain(game);
      }

      const summarized = _.uniqBy(matchGames.map(summarizeGame), 'id')
        // A rematch lobby that was created but never started can't be spectated
        .filter(({ status }) => status !== GameStatus.CREATED)
        .sort((game1, game2) => game1.id - game2.id);

      return exits.success(summarized);
    } catch (err) {
      return exits.error(err);
    }
  },
};
