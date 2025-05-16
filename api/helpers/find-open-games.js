const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const GameStatus = require('../../utils/GameStatus');

module.exports = {
  friendlyName: 'Find Open Games',

  description: 'Finds all the games that are available for players to join',

  fn: async (_, exits) => {
    const recentUpdateThreshhold = dayjs.utc().subtract(4, 'hour')
      .toDate();
    try {
      let games = await Game.find({
        status: GameStatus.CREATED,
        updatedAt: { '>=': recentUpdateThreshhold },
      })
        .populate('p0')
        .populate('p1');

      games = games.map((game) => {
        const players = [];
        if (game.p0) {
          players.push({ username: game.p0.username });
        }
        if (game.p1) {
          players.push({ username: game.p1.username });
        }
        const formattedGame = {
          ...game,
          players,
        };
        delete game.p0;
        delete game.p1;
        return formattedGame;
      });

      return exits.success(games);
    } catch (err) {
      return exits.error(err);
    }
  },
};
