const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
const Result = require('../../types/Result');
dayjs.extend(isBetween);

/////////////
// Helpers //
/////////////
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
  };
}

module.exports = {
  getStats: function (req, res) {
    // Find records
    const seasons = sails.helpers.getSeasonsWithoutRankings();
    const matches = Match.find({});
    const users = User.find({});
    return Promise.all([seasons, matches, users]).then(([seasons, matches, users]) => {
      const idToUserMap = new Map();
      users.forEach((user) => {
        idToUserMap.set(user.id, user);
      });
      // Add each match to the appropriate rankings
      matches.forEach((match) => {
        // Only count finished matches
        if (match.endTime && match.winner) {
          const relevantSeason = seasons.find((season) => {
            // Find season this match took place during
            return dayjs(match.startTime).isBetween(dayjs(season.startTime), dayjs(season.endTime));
          });
          if (relevantSeason) {
            const player1 = idToUserMap.get(match.player1);
            const player2 = idToUserMap.get(match.player2);
            if (player1 && player2) {
              // Player 1
              addMatchToRankings(relevantSeason, match, player1, player2);
              // Player 2
              addMatchToRankings(relevantSeason, match, player2, player1);
            }
          }
        }
      });
      // Format seasons (convert maps to arrays and objects)
      return res.ok(seasons.map(transformSeasonToDTO));
    });
  },
};
