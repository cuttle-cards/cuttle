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
        const recentUpdateThreshhold = dayjs.utc().subtract(1, 'day').toDate();
        Game.find({
          status: gameService.GameStatus.CREATED,
          createdAt: { '>=': recentUpdateThreshhold },
        })
          .populate('players')
          .exec(function (error, games) {
            if (error) {
              return reject(error);
            } else if (!games) {
              return reject({ message: "Can't find games" });
            }
            const openGames = games.filter(({ players }) => players.length < 2);
            return resolve(openGames);
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
