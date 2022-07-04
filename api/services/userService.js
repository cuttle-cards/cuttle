module.exports = {
  /*
   **Find User by Id
   ****options = {userId: integer}
   */
  findUser: function (options) {
    return new Promise(function (resolve, reject) {
      if (options) {
        if (options.hasOwnProperty('userId')) {
          return User.findOne({ id: options.userId })
            .populate('hand')
            .populate('points')
            .populate('faceCards')
            .exec(function (err, usr) {
              if (err) {
                return reject(err);
              } else if (!usr) {
                return reject({ message: 'Could not find user: ' + options.userId });
              }
              return resolve(usr);
            });
          // end if options has userId
        }
        return reject({ message: 'No id given when finding user' });

        //end if(options)
      }
      return reject({ message: 'No id given when finding user' });
    });
  },

  /*
   **Save User and Return it as a Promise
   ****options = {user: UserModel}
   */
  saveUser: function (options) {
    return new Promise(function (resolve, reject) {
      options.user.save(function (err) {
        if (err) {
          return reject(err);
        }
        return resolve(options.user);
      });
    });
  },

  /*
   **Count number of Queens a given user has (synchronous)
   ****options = {user: UserModel}
   */
  queenCount: function (options) {
    const player = options.user;
    return player.faceCards.filter((card) => card.rank === 12).length;
  },

  /*
   **Check if user has won
   ***options = {user: UserModel}
   */
  checkWin: function (options) {
    const player = options.user;
    const points = player.points.reduce((sum, { rank }) => sum + rank, 0);
    const kings = player.faceCards.filter((faceCard) => faceCard.rank === 13).length;
    switch (kings) {
      case 0:
        if (points >= 21) return true;
        break;
      case 1:
        if (points >= 14) return true;
        break;
      case 2:
        if (points >= 10) return true;
        break;
      case 3:
        if (points >= 7) return true;
        break;
      case 4:
        if (points >= 5) return true;
        break;
    }
    return false;
  },
};
