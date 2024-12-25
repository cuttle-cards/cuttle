const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

module.exports = {
  friendlyName: 'Find Spectatable Games',

  description: 'Finds all the games that are available to spectate',

  fn: async (_, exits) => {
    const recentUpdateThreshhold = dayjs.utc().subtract(5, 'minute')
      .toDate();
    try {
      const games = await Game.find({
        status: gameService.GameStatus.STARTED,
        updatedAt: { '>=': recentUpdateThreshhold },
      }).populate('players');

      // Map players to include only id and username
      const transformedGames = games.map(game => {
        game.players = game.players.map(player => ({
          id: player.id,
          username: player.username,
        }));
        return game;
      });
      return exits.success(transformedGames);
    } catch (err) {
      return exits.error(err);
    }
  },
};
