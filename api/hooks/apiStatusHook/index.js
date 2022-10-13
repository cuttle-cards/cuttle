module.exports = function apiStatusHook() {
  ////////////////
  // API Status //
  ////////////////
  return {
    getStatus: function () {
      return new Promise(function (resolve, reject) {
        Game.count()
        .exec(function (error, game) {
          if (error || game <= 0) {
            return resolve(false);
          }
          return resolve(true);
        });
      });
    },
}};
