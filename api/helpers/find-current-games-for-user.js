const GameStatus = require('../../utils/GameStatus.json');

module.exports = {
  friendlyName: 'Find Current Games For User',

  description: 'Finds the in-progress games the specified user is playing in',

  extendedDescription: `
    Powers the "My Current Games" section of the home page. Without it a player who closes the tab
    on a game has no way back in: open games, spectatable games and game history all exclude
    in-progress games belonging to the requesting user.
  `,

  inputs: {
    userId: {
      type: 'number',
      description: 'The database id of the user whose games are being requested',
      example: 44,
      required: true,
    },
  },

  fn: async ({ userId }, exits) => {
    try {
      const [ games, currentWeek ] = await Promise.all([
        Game.find({
          status: GameStatus.STARTED,
          or: [ { p0: userId }, { p1: userId } ],
        })
          .sort('updatedAt DESC')
          .populate('p0')
          .populate('p1'),
        sails.helpers.getCurrentSeasonWeek(),
      ]);

      const currentGames = games.map((game) => {
        /**
         * p0/p1 are populated User records, and User has no customToJSON -- spreading the game
         * wholesale would put both players' encryptedPassword in the response. Drop them along
         * with the internal lock fields; `opponent` below carries the only user data the client
         * needs.
         */
        // eslint-disable-next-line no-unused-vars
        const { p0, p1, lock, lockedAt, ...publicGame } = game;
        const opponent = game.p0?.id === userId ? game.p1 : game.p0;
        return {
          ...publicGame,
          opponent: opponent ? { id: opponent.id, username: opponent.username } : null,
          canArchive: sails.helpers.canArchiveGame(game, currentWeek),
        };
      });

      return exits.success(currentGames);
    } catch (err) {
      return exits.error(err);
    }
  },
};
