module.exports = {
  /*
   **Find User by Id
   ****options = {userId: integer}
   */
  findUser: function (options) {
    return new Promise(function (resolve, reject) {
      if (options) {
        if (Object.hasOwnProperty.call(options, 'userId')) {
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

        // end if(options)
      }
      return reject({ message: 'No id given when finding user' });
    });
  },
};
