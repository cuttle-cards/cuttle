const dayjs = require('dayjs');

module.exports = {
  friendlyName: 'Get Seasons Without Matches',

  description: 'Get all Season records and initialize them with an empty map of rankings',

  fn: async (_, exits) => {
    const seasons = await Season.find({
      where: { startTime: { '<=': dayjs().valueOf() } },
      sort: 'startTime DESC',
    }).populateAll();
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
        const startTime = dayjs(season.startTime);
        const endTime = dayjs(season.endTime);
        // Round week count up to account for incomplete weeks
        const numWeeks = Math.ceil(endTime.diff(startTime, 'week', true));
        for (let i=0; i<numWeeks; i++) {
          res.gameCounts.push(0);
          res.uniquePlayersPerWeek.push(new Set());
        }
        return res;
      }),
    );
  },
};
