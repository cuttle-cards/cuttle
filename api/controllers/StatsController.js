const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
dayjs.extend(isBetween);

const Result = {
  WON: 1,
  LOST: 2,
  INCOMPLETE: -1,
};

function transformSeasonToDTO(season) {
  const { rankings, ...rest } = season;
  const rankingsAsArray = Array.from(rankings.values()).map(player => {
    return {
      ...player,
      matches: Object.fromEntries(player.matches),
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
              const player1Season = relevantSeason.rankings.get(player1.id);
              // Initialize player1 matches if they don't already have them
              if (!player1Season) {
                relevantSeason.rankings.set(player1.id, {
                  username: player1.username,
                  matches: new Map(),
                });
              }
              const player1Matches = relevantSeason.rankings.get(player1.id).matches;
              let player1MatchesThisWeek = player1Matches.get(weekNum);
              // Create this week if it doesn't already exist
              if (!player1MatchesThisWeek) {
                player1Matches.set(weekNum, []);
                player1MatchesThisWeek = player1Matches.get(weekNum);
              }
              player1MatchesThisWeek.push({
                opponent: player2.username,
                result: match.winner === player1.id ? Result.WON : Result.LOST,
              });
              // Player 2
              const player2Season = relevantSeason.rankings.get(player2.id);
              // Initialize player2 matches if they don't already have them
              if (!player2Season) {
                relevantSeason.rankings.set(player2.id, {
                  username: player2.username,
                  matches: new Map(),
                });
              }
              const player2Matches = relevantSeason.rankings.get(player2.id).matches;
              let player2MatchesThisWeek = player2Matches.get(weekNum);
              if (!player2MatchesThisWeek) {
                player2Matches.set(weekNum, []);
                player2MatchesThisWeek = player2Matches.get(weekNum);
              }
              player2MatchesThisWeek.push({
                opponent: player1.username,
                result: match.winner === player2.id ? Result.WON : Result.LOST,
              });
            }
          }
        }
      }
      // Format seasons (convert dict to array)
      return res.ok(seasons.map(transformSeasonToDTO));
    });
  },
};
