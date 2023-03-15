const dayjs = require('dayjs');

module.exports = {
  friendlyName: 'Find Spectatable Games',

  description: 'Finds all the games that are available to spectate',

  fn: async (_, exits) => {

    const recentUpdateThreshhold = dayjs().subtract(5, 'minute').valueOf();

    try {
      const games = await Game.find({
        status: false, // not open to join
        result: -1, // not finished yet
        updatedAt: { '>=': recentUpdateThreshhold },
      });
      return exits.success(games);
    } catch (err) {
      return exits.error(err);
    }
  },
};
