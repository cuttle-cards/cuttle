const dayjs = require('dayjs');
const Result = require('../../types/Result.es5');
const GameStatus = require('../../utils/GameStatus');

/////////////
// Helpers //
/////////////

function computeUsageStats(games, season) {
  games.forEach((game) => {
    const weekNum = dayjs(game.updatedAt).diff(season.startTime, 'week');
    season.gameCounts[weekNum]++;
    season.uniquePlayersPerWeek[weekNum].add(game.p0);
    season.uniquePlayersPerWeek[weekNum].add(game.p1);
  });
}

function updateRankingsFromMatches(users, matches, season) {
  const idToUserMap = new Map();
  users.forEach((user) => {
    idToUserMap.set(user.id, user);
  });

  matches.forEach((match) => {
    if (!match.endTime || !match.winner) {
      return;
    }
    const player1 = idToUserMap.get(match.player1);
    const player2 = idToUserMap.get(match.player2);
    if (player1 && player2) {
      // Player 1
      addMatchToRankings(season, match, player1, player2);
      // Player 2
      addMatchToRankings(season, match, player2, player1);
    }
  });
}

/**
 * Adds a match to a player's season rankings in the appropriate week
 * @param {Object} season The season in which the match took place
 * @param {string} season.name
 * @param {number} season.startTime
 * @param {number} season.endTime
 * @param {number} season.firstPlace playerId
 * @param {number} season.secondPlace playerId
 * @param {number} season.thirdPlace playerId
 * @param {number} season.fourthPlace playerId
 * @param {Map<number, {
 *  username: string,
 *  matches: Map<number, Array<{opponent: string, result: number}>>
 * }>} season.rankings keyed by playerId; each player's matches are keyed by weekNum, and result is a Result value
 * @param {Array<number>} season.gameCounts
 * @param {Array<Set<number>>} season.uniquePlayersPerWeek playerIds seen each week
 * @param {Object} match the match to add
 * @param {number} match.player1
 * @param {number} match.player2
 * @param {number | null} match.winner
 * @param {number} match.startTime
 * @param {number} match.endTime
 * @param {User} player which player's record to update
 * @param {User} opponent // The opponent in the match
 */

function addMatchToRankings(season, match, player, opponent) {
  // Calculate which week match counts towards
  const weekNum = dayjs(match.startTime).diff(dayjs(season.startTime), 'week') + 1;
  const playerSeason = season.rankings.get(player.id);
  // Create player season if it doesn't already exist
  if (!playerSeason) {
    season.rankings.set(player.id, {
      username: player.username,
      matches: new Map(),
    });
  }
  const playerMatches = season.rankings.get(player.id).matches;
  let playerMatchesThisWeek = playerMatches.get(weekNum);
  // Create this week if it doesn't already exist
  if (!playerMatchesThisWeek) {
    playerMatches.set(weekNum, []);
    playerMatchesThisWeek = playerMatches.get(weekNum);
  }
  playerMatchesThisWeek.push({
    opponent: opponent.username,
    result: match.winner === player.id ? Result.WON : Result.LOST,
  });
}

/**
 * Converts season to DTO for client consumption
 * @param {Object} season
 * @param {string} season.name
 * @param {number} season.startTime
 * @param {number} season.endTime
 * @param {number} season.firstPlace playerId
 * @param {number} season.secondPlace playerId
 * @param {number} season.thirdPlace playerId
 * @param {number} season.fourthPlace playerId
 * @param {Map<number, {
 *  username: string,
 *  matches: Map<number, Array<{opponent: string, result: number}>>
 * }>} season.rankings keyed by playerId; each player's matches are keyed by weekNum, and result is a Result value
 * @param {Array<number>} season.gameCounts
 * @param {Array<Set<number>>} season.uniquePlayersPerWeek playerIds seen each week
 * @returns {{
 *  name: string,
 *  startTime: number,
 *  endTime: number,
 *  firstPlace: number,
 *  secondPlace: number,
 *  thirdPlace: number,
 *  fourthPlace: number,
 *  rankings: Array<{username: string, matches: Object<number, Array<{opponent: string, result: number}>>}>,
 *  gameCounts: Array<number>,
 *  uniquePlayersPerWeek: Array<number>
 * }} The season with rankings as an array (matches keyed by weekNum), trailing zero weeks
 *  trimmed, and uniquePlayersPerWeek as player counts
 */
function transformSeasonToDTO(season) {
  const {
    rankings: originalRankings,
    gameCounts: originalGameCounts,
    uniquePlayersPerWeek: originalUniquePlayersPerWeek,
    ...rest
  } = season;

  // Convert rankings from Map to Array
  const rankings = Array.from(originalRankings.values()).map((player) => {
    return {
      ...player,
      matches: Object.fromEntries(player.matches), // Convert matches from Map to Object
    };
  });

  // Remove zero-valued gameCounts + uniquePlayersPerWeek from the end
  const gameCounts = [ ...originalGameCounts ];
  let uniquePlayersPerWeek = [ ...originalUniquePlayersPerWeek ];
  if (gameCounts[gameCounts.length - 1] === 0) {
    gameCounts.pop();
    uniquePlayersPerWeek.pop();
  }

  // Convert uniquePlayersPerWeek from Set[] to int[] number of players
  uniquePlayersPerWeek = uniquePlayersPerWeek.map((playerSet) => playerSet.size);

  return {
    ...rest,
    rankings,
    gameCounts,
    uniquePlayersPerWeek,
  };
}

module.exports = {
  getCurrentStats: async function (_req, res) {
    try {
      const seasons = await sails.helpers.getSeasonsWithoutRankings();
      const [ currentSeason ] = seasons;
      const allUsers = User.find({
        select: [ 'id', 'username' ],
      });
      const currentSeasonMatches = Match.find({
        startTime: { '>': currentSeason.startTime },
        endTime: { '<': currentSeason.endTime },
      });
      const currentSeasonGames = Game.find({
        select: [ 'updatedAt', 'p0', 'p1' ],
        where: {
          status: GameStatus.FINISHED,
          updatedAt: {
            '>': currentSeason.startTime,
            '<': currentSeason.endTime,
          },
        },
      });
      const [ users, matches, games ] = await Promise.all([ allUsers, currentSeasonMatches, currentSeasonGames ]);
      updateRankingsFromMatches(users, matches, currentSeason);
      computeUsageStats(games, currentSeason);
      seasons[0] = transformSeasonToDTO(currentSeason);
      return res.ok(seasons);
    } catch (err) {
      return res.badRequest(err);
    }
  },
  getSeasonStats: async function (req, res) {
    const seasonId = parseInt(req.params.seasonId);
    try {
      const [ requestedSeason ] = await sails.helpers.getSeasonsWithoutRankings(seasonId);
      const allUsers = User.find({
        select: [ 'id', 'username' ],
      });
      const requestedSeasonMatches = Match.find({
        startTime: { '>': requestedSeason.startTime },
        endTime: { '<': requestedSeason.endTime },
      });
      const requestedSeasonGames = Game.find({
        select: [ 'updatedAt', 'p0', 'p1' ],
        where: {
          status: GameStatus.FINISHED,
          updatedAt: {
            '>': requestedSeason.startTime,
            '<': requestedSeason.endTime,
          },
        },
      });
      const [ users, matches, games ] = await Promise.all([
        allUsers,
        requestedSeasonMatches,
        requestedSeasonGames,
      ]);
      updateRankingsFromMatches(users, matches, requestedSeason);
      computeUsageStats(games, requestedSeason);
      const updatedSeason = transformSeasonToDTO(requestedSeason);
      return res.ok({
        gameCounts: updatedSeason.gameCounts,
        rankings: updatedSeason.rankings,
        uniquePlayersPerWeek: updatedSeason.uniquePlayersPerWeek,
      });
    } catch (err) {
      return res.badRequest(err);
    }
  },
};
