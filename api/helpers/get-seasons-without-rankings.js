const dayjs = require('dayjs');

module.exports = {
  friendlyName: 'Get Seasons Without Matches',

  description: 'Get all Season records and initialize them with an empty map of rankings',

  inputs: {
    seasonId: {
      type: 'number',
      required: false,
    },
  },

  fn: async ({ seasonId }, exits) => {
    const seasons = seasonId
      ? await Season.find({ id: seasonId }).populateAll()
      : await Season.find({
          where: { startTime: { '<=': dayjs().format('YYYY-MM-DD HH:mm:ss.SSS Z') } },
          sort: 'startTime DESC',
        }).populateAll();
    if (!seasons.length) {
      return exits.error(new Error('Could not find requested season data'));
    }
    return exits.success(
      seasons.map((season) => {
        const res = {
          ...season,
          rankings: new Map(), // playerId => PlayerMatches
          firstPlace: season.firstPlace?.username || null,
          secondPlace: season.secondPlace?.username || null,
          thirdPlace: season.thirdPlace?.username || null,
          fourthPlace: season.fourthPlace?.username || null,
          gameCounts: [],
          uniquePlayersPerWeek: [],
        };
        // initialize gameCounts and uniquePlayersPerWeek
        const currentTime = dayjs();
        const endTime = currentTime.isBefore(dayjs(season.endTime)) ? currentTime : dayjs(season.endTime);
        // Round week count up to account for incomplete weeks
        const numWeeks = Math.ceil(endTime.diff(dayjs(season.startTime), 'week', true));
        for (let i = 0; i < numWeeks; i++) {
          res.gameCounts.push(0);
          res.uniquePlayersPerWeek.push(new Set());
        }
        return res;
      }),
    );
  },
};
