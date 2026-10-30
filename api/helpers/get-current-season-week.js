const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

module.exports = {
  friendlyName: 'Get Current Season Week',

  description: 'Finds the season that is currently running, along with the start and end times of its current week',

  extendedDescription: `
    Returns undefined when no season is currently running. Weeks are zero-indexed and anchored to the
    season's exact startTime instant rather than to calendar weeks.
  `,

  fn: async (_, exits) => {
    const currentTime = dayjs.utc();
    try {
      const season = await Season.findOne({
        startTime: { '<=': currentTime.toDate() },
        endTime: { '>=': currentTime.toDate() },
      });

      if (!season) {
        return exits.success();
      }

      const seasonStartTime = dayjs.utc(season.startTime);
      const weeksSinceSeasonStart = currentTime.diff(seasonStartTime, 'week');

      return exits.success({
        season,
        weekStartTime: seasonStartTime.add(weeksSinceSeasonStart, 'week').toDate(),
        weekEndTime: seasonStartTime.add(weeksSinceSeasonStart + 1, 'week').toDate(),
      });
    } catch (err) {
      return exits.error(err);
    }
  },
};
