const dayjs = require('dayjs');
const Result = require('../../types/Result.es5');

/////////////
// Helpers //
/////////////
/**
 * Find the season in which a given timestamp occurred using binary search
 * @param {*} sortedSeasons - Seasons sorted (OLDEST FIRST)
 * @param {*} timeStamp - Desired time in millis since epoch
 * @returns the season | null if none is found
 */
function getSeasonFromTimeStamp(sortedSeasons, timeStamp) {
  if (sortedSeasons.length <= 0) {
    return null;
  }
  let minIndex = 0;
  let maxIndex = sortedSeasons.length - 1;
  let currentIndex = Math.floor((minIndex + maxIndex) / 2);
  // let currentSeason = sortedSeasons[currentIndex];
  while (minIndex <= maxIndex) {
    const currentSeason = sortedSeasons[currentIndex];
    if (timeStamp >= currentSeason.startTime && timeStamp <= currentSeason.endTime) {
      return currentSeason;
    }
    // Target time is before current season
    if (timeStamp < currentSeason.startTime) {
      minIndex = currentIndex + 1;
      // Target time is after current season
    } else {
      maxIndex = currentIndex - 1;
    }
    currentIndex = currentIndex = Math.floor((minIndex + maxIndex) / 2);
  }
  return null;
}

function updateRankingsFromGames(games, season) {
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
    if (!match.endTime || !match.winner) return;
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
 * @param {
 *  name: string
 *  startTime: int
 *  endTime: int
 *  firstPlace: int (playerId)
 *  secondPlace: int (playerId)
 *  thirdPlace: int (playerId)
 *  fourthPlace: int (playerId)
 *  rankings: Map<int: playerId, {
 *    username: string
 *    matches: Map<int: weekNum, Array<{opponent: string, result: Result}>>
 *  }>
 * gameCounts: Array<int>
 * uniquePlayersPerWeek: Array<Set<int: playerIds>>
 * } season The season in which the match took place
 * @param {
 *  player1: int,
 *  player2: int,
 *  winner: int | null,
 *  startTime: int,
 *  endTime: int
 * } match the match to add
 * @param {User} player which player's record to update
 * @param {User} opponent // The opponent in the match
 */

function addMatchToRankings(season, match, player, opponent) {
  // Calculate which week match counts towards
  const weekNum = dayjs(match.startTime).diff(dayjs(season.startTime), 'week') + 1;
  console.log(season.rankings);
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
 * @param {
 *  name: string
 *  startTime: int
 *  endTime: int
 *  firstPlace: int (playerId)
 *  secondPlace: int (playerId)
 *  thirdPlace: int (playerId)
 *  fourthPlace: int (playerId)
 *  rankings: Map<int: playerId, {
 *    username: string
 *    matches: Map<int: weekNum, Array<{opponent: string, result: Result}>>
 *  }>
 * gameCounts: Array<int>
 * uniquePlayersPerWeek: Array<Set<int: playerIds>>
 * } season
 * @returns {
 *  name: string
 *  startTime: int
 *  endTime: int
 *  firstPlace: int (playerId)
 *  secondPlace: int (playerId)
 *  thirdPlace: int (playerId)
 *  fourthPlace: int (playerId)
 *  rankings: Array<{
 *    username: string
 *    matches: {weekNum: int, matches: Array<{opponent: string, result: Result}>}
 *  }>
 * gameCounts: Array<int>
 * uniquePlayersPerWeek: Array<int>
 * }
 */
function transformSeasonToDTO(season) {
  const { rankings, ...rest } = season;
  // Convert rankings from Map to Array
  const rankingsAsArray = Array.from(rankings.values()).map((player) => {
    return {
      ...player,
      matches: Object.fromEntries(player.matches), // Convert matches from Map to Object
    };
  });
  return {
    ...rest,
    rankings: rankingsAsArray,
    uniquePlayersPerWeek: season.uniquePlayersPerWeek.map((playerSet) => playerSet.size),
  };
}

module.exports = {
  getCurrentStats: async function (_req, res) {
    const seasons = await sails.helpers.getSeasonsWithoutRankings();
    const [currentSeason] = seasons;
    const allUsers = User.find({});
    const currentSeasonMatches = Match.find({
      startTime: { '>': currentSeason.startTime },
      endTime: { '<': currentSeason.endTime },
    });
    const currentSeasonGames = Game.find({
      status: gameService.GameStatus.FINISHED,
      updatedAt: { '>': currentSeason.startTime, '<': currentSeason.endTime },
    });
    const [users, matches, games] = await Promise.all([allUsers, currentSeasonMatches, currentSeasonGames]);
    updateRankingsFromMatches(users, matches, currentSeason);
    updateRankingsFromGames(games, currentSeason);
    seasons[0] = transformSeasonToDTO(currentSeason);
    return res.ok(seasons);
  },
  getRequestedStats: async function (req, res) {
    const { requestedSeason } = req.body;
    const allUsers = User.find({});
    const requestedSeasonMatches = Match.find({
      startTime: { '>': requestedSeason.startTime },
      endTime: { '<': requestedSeason.endTime },
    });
    const requestedSeasonGames = Game.find({
      status: gameService.GameStatus.FINISHED,
      updatedAt: { '>': requestedSeason.startTime, '<': requestedSeason.endTime },
    });
    const [users, matches, games] = await Promise.all([
      allUsers,
      requestedSeasonMatches,
      requestedSeasonGames,
    ]);
    updateRankingsFromMatches(users, matches, requestedSeason);
    updateRankingsFromGames(games, requestedSeason);
    return res.ok(transformSeasonToDTO(requestedSeason));
  },
};
