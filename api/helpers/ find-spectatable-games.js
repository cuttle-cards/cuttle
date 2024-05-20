const dayjs = require('dayjs');

module.exports = {
  friendlyName: 'Find Spectatable Games',

  description: 'Finds all the games that are available to spectate',

  fn: async (_, exits) => {
    const recentUpdateThreshhold = dayjs().subtract(5, 'minute').format('YYYY-MM-DD HH:mm:ss.SSS Z');
    try {
      const games = await Game.find({
        status: gameService.GameStatus.STARTED,
        updatedAt: { '>=': recentUpdateThreshhold },
      });
      return exits.success(games);
    } catch (err) {
      return exits.error(err);
    }
  },
};
