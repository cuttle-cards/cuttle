const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const GameStatus = require('../../utils/GameStatus.json');
const { RECENT_ACTIVITY_MINUTES } = require('../../utils/gameActivity.json');

module.exports = {
  friendlyName: 'Find Spectatable Games',

  description: 'Finds all the games that are available to spectate',

  fn: async (_, exits) => {
    const recentUpdateThreshhold = dayjs.utc().subtract(RECENT_ACTIVITY_MINUTES, 'minute')
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
