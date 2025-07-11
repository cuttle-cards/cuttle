const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const GameStatus = require('../../types/GameStatus');

module.exports = {
  friendlyName: 'Find Spectatable Games',

  description: 'Finds all the games that are available to spectate',

  fn: async (_, exits) => {
    const recentUpdateThreshhold = dayjs.utc().subtract(5, 'minute')
      .toDate();
    try {
      const games = await Game.find({
        status: GameStatus.STARTED,
        updatedAt: { '>=': recentUpdateThreshhold },
      });
      return exits.success(games);
    } catch (err) {
      return exits.error(err);
    }
  },
};
