const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
module.exports = function gameHook() {
  //////////////
  // Game API //
  //////////////
  return {
    createGame: function (gameName, isRanked = false, status = gameService.GameStatus.CREATED) {
      return new Promise(function (resolve, reject) {
        Game.create({
          name: gameName,
          isRanked: isRanked === true,
          status,
        })
          .fetch()
          .then((game) => {
            return resolve(game);
          })
          .catch((err) => {
            let res;
            if (err) {
              res = err;
            } else {
              res = { message: `Unknown error creating game ${gameName}` };
            }
            return reject(res);
          });
      });
    },
    findOpenGames: function () {
      return new Promise(function (resolve, reject) {
        const recentUpdateThreshold = dayjs.utc().subtract(1, 'day')
          .toDate();
    
        Game.find({
          status: gameService.GameStatus.CREATED,
          createdAt: { '>=': recentUpdateThreshold },
        })
          .populate('players') // Populate the players array
          .exec(function (error, games) {
            if (error) {
              return reject(error);
            } else if (!games || games.length === 0) {
              return reject({ message: "Can't find games" });
            }
    
            // Filter games with fewer than 2 players and transform the players array
            const openGames = games
              .filter(({ players }) => players.length < 2) // Keep games with fewer than 2 players
              .map((game) => {
                // Transform players array to include only id and username
                game.players = game.players.map((player) => ({
                  id: player.id, // Use 'id' since Sails.js generates it automatically
                  username: player.username,
                }));
                return game; // Return the updated game object
              });
    
            return resolve(openGames); // Resolve with transformed open games
          });
      });
    },    
    findGame: function (id) {
      return new Promise(function (resolve, reject) {
        Game.findOne(id)
          .populate('players', { sort: 'pNum' })
          .populate('deck')
          .populate('topCard')
          .populate('secondCard')
          .exec(function (error, game) {
            if (error || !game) {
              let res;
              if (error) {
                res = error;
              } else {
                res = { message: 'home.snackbar.cantFindGame' };
              }
              return reject(res);
            }
            resolve(game);
          });
      });
    },
  };
};
