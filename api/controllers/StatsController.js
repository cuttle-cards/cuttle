const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
dayjs.extend(isBetween);

const Result = {
  WON: 1,
  LOST: 2,
  INCOMPLETE: -1,
};

/////////////
// Helpers //
/////////////
// Updates season data with one match for a specified player
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
 *  rankings: Map<int: playerId, {
 *    username: string
 *    matches: Map<int: weekNum, Array<{opponent: string, result: Result}>>
 *  }>
 * } season
 * @returns {
 *  name: string
 *  startTime: int
 *  endTime: int
 *  rankings: Array<{
 *    username: string
 *    matches: {weekNum: int, matches: Array<{opponent: string, result: Result}>}
 *  }>
 * }
 */
function transformSeasonToDTO(season) {
  const { rankings, ...rest } = season;
  // Convert rankings from Map to Array
  const rankingsAsArray = Array.from(rankings.values()).map(player => {
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
  getStats: function(req, res) {
    // Find records
    const seasons = Season.find({});
    const matches = Match.find({});
    const users = User.find({});
    return Promise.all([seasons, matches, users]).then(([seasons, matches, users]) => {
      const idToUserMap = new Map();
      for (const user of users) {
        idToUserMap.set(user.id, user);
      }
      // Add empty rankings dict to each season
      seasons = seasons.map(season => {
        return {
          rankings: new Map(), // playerId => PlayerMatches
          ...season,
        };
      });
      for (const match of matches) {
        // Only count finished matches
        if (match.endTime && match.winner) {
          const relevantSeason = seasons.find(season => {
            // Find season this match took place during
            return dayjs(match.startTime).isBetween(dayjs(season.startTime), dayjs(season.endTime));
          });
          if (relevantSeason) {
            // Calculate which week match counts towards
            const weekNum =
              dayjs(match.startTime).diff(dayjs(relevantSeason.startTime), 'week') + 1;
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
      }
      // Format seasons (convert maps to arrays and objects)
      return res.ok(seasons.map(transformSeasonToDTO));
    });
  },
};
