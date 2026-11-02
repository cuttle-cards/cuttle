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

const belongsToAMatch = (game) => Boolean(game.match?.id ?? game.match);

/**
 * Collect the casual rematch chain the given game sits in, walking backward to the
 * first game and forward to the last.
 *
 * Both walks stop at a game that belongs to a Match: once a ranked match is won,
 * rematch.js makes every further rematch casual, so the chain runs straight out of
 * the ranked match it grew from. Those games are a separate list.
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
    if (!previousGame || chain.has(previousGame.id) || belongsToAMatch(previousGame)) {
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
    if (!nextGame || belongsToAMatch(nextGame)) {
      break;
    }
    chain.set(nextGame.id, nextGame);
    current = nextGame;
  }

  return [ ...chain.values() ];
}

/**
 * Collect rematches that belong to this match but aren't recorded on it yet.
 *
 * addGameToMatch attaches a game to its Match only once the game finishes, and
 * rematch.js creates the next game without a match, so a ranked rematch that is
 * still being played is missing from Match.games. Walk forward from the newest
 * recorded game to pick it up.
 *
 * The walk stops at the first game that isn't part of this match: once a match
 * has been won, rematch.js makes every further rematch casual, and those games
 * belong to no match at all.
 */
async function collectUnrecordedRematches(matchGames, matchId) {
  const unrecorded = new Map();
  const seen = new Set(matchGames.map(({ id }) => id));
  let current = matchGames.at(-1);

  while (current) {
    const nextGameId = current.rematchGame?.id ?? current.rematchGame;
    if (!nextGameId || seen.has(nextGameId)) {
      break;
    }
    seen.add(nextGameId);

    const nextGame = await Game.findOne({ id: nextGameId });
    const nextGameMatchId = nextGame?.match?.id ?? nextGame?.match;
    const belongsToThisMatch = nextGame?.isRanked && (!nextGameMatchId || nextGameMatchId === matchId);
    if (!belongsToThisMatch) {
      break;
    }

    unrecorded.set(nextGame.id, nextGame);
    current = nextGame;
  }

  return [ ...unrecorded.values() ];
}

module.exports = {
  friendlyName: 'Get Match Games',

  description:
    'Returns every game in the match the specified game belongs to, oldest first. Ranked games resolve through their Match record, plus any rematch still in progress that the match has not recorded yet; casual games resolve through their rematch chain. Read-only: unlike addGameToMatch, this neither creates nor mutates records, and it does not truncate the list to games played so far.',

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
        matchGames.sort((game1, game2) => game1.id - game2.id);
        matchGames = [ ...matchGames, ...await collectUnrecordedRematches(matchGames, matchId) ];
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
