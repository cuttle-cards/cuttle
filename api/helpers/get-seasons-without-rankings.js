const dayjs = require('dayjs');

module.exports = {
  friendlyName: 'Get Seasons Without Matches',

  description: 'Get all Season records and initialize them with an empty map of rankings',

  fn: async (_, exits) => {
    const seasons = await Season.find({
      where: { startTime: { '<': dayjs().valueOf() } },
      sort: 'startTime DESC',
    }).populateAll();
    return exits.success(
      seasons.map((season) => {
        return {
          ...season,
          rankings: new Map(), // playerId => PlayerMatches
          firstPlace: season.firstPlace?.username || null,
          secondPlace: season.secondPlace?.username || null,
          thirdPlace: season.thirdPlace?.username || null,
          fourthPlace: season.fourthPlace?.username || null,
        };
      })
    );
  },
};
