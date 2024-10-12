const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

module.exports = {
  friendlyName: 'Find Or Create Current Match Between Two Players',

  description:
    'Finds the relevant match for the specified players for the current week, and creates the match if it does not already exist',

  inputs: {
    player1: {
      type: 'number',
      descritiption: 'The database id of the first player in the desired match',
      example: 44,
      required: true,
    },
    player2: {
      type: 'number',
      descritiption: 'The database id of the second player in the desired match',
      example: 45,
      required: true,
    },
  },

  fn: async ({ player1, player2 }, exits) => {
    const currentTime = dayjs.utc();
    try {
      const currentSeason = await Season.findOne({
        startTime: { '<=': currentTime.toDate() },
        endTime: { '>=': currentTime.toDate() },
      });
      // FIXME: Handle missing season gracefully
      if (!currentSeason) {
        return exits.success();
      }
      // Find relevant match between specified players for current week
      const seasonStartTime = dayjs.utc(currentSeason.startTime);
      const weeksSinceSeasonStart = currentTime.diff(seasonStartTime, 'week');
      const currentWeekStartTime = seasonStartTime.add(weeksSinceSeasonStart, 'week').toDate();
      const currentWeekEndTime = seasonStartTime.add(weeksSinceSeasonStart + 1, 'week').toDate();
      let currentMatch = await Match.findOne({
        and: [
          // Match started within current week
          { startTime: { '>=': currentWeekStartTime } },
          { startTime: { '<=': currentWeekEndTime } },
          // Match is between specified players
          {
            or: [
              { and: [ { player1 }, { player2 } ] },
              // case where args are reveresed from match
              { and: [ { player1: player2 }, { player2: player1 } ] },
            ],
          },
        ],
      }).populate('games');

      // Create current match if it doesn't already exist
      if (!currentMatch) {
        currentMatch = await Match.create({
          startTime: currentTime.toDate(),
          player1,
          player2,
        }).fetch();
      }
      return exits.success(currentMatch);
    } catch (err) {
      return exits.error(err);
    }
  },
};
