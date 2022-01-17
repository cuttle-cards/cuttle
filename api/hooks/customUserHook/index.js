module.exports = function userHook(sails) {
///////////////
// User API  //
///////////////
  return {
    findUserByEmail: function (email) {
      return new Promise(function (resolve, reject) {
        User.findOne({
          email: email
        }).exec(function (error, user) {
          if (error) {
            reject(error)
          } else if (!user) {
            reject({message: "User does not exist"});
          } else {
            return resolve(user);
          }
        });
      });
    },

    findUser: function (id) {
      return new Promise(function (resolve, reject) {
        User.findOne(id).exec(function (error, user) {
          if (error) {
            reject(error)
          } else if (!user) {
            reject({message: "User does not exist"});
          } else {
            return resolve(user);
          }
        });
      });
    },

    createUser: function (email, encryptedPassword) {
      return new Promise(function (resolve, reject) {
        User.create({
          email: email,
          encryptedPassword: encryptedPassword
        })
          .fetch()
          .then((user) => {
            return resolve(user);
          })
          .catch((err) => {
            const res = err ? err : {message: "Could not create user"};
            return reject(res);
          });
      }); //End of returned promise
    },

    findUserById: function (id) {
      return new Promise(function (resolve, reject) {
        User.findOne({
          id: id
        }).exec(function (error, user) {
          if (error) {
            reject(error)
          } else if (!user) {
            reject({message: "User does not exist"})
          } else {
            return resolve(user);
          }
        });
      });
    },
  };
}
