module.exports = function () {
  const passwords = require('machinepack-passwords');
  return {
    encryptPass: function (pass) {
      return new Promise(function (resolve, reject) {
        passwords.encryptPassword({ password: pass }).exec({
          error: function (err) {
            return reject(err);
          },
          success: function (encryptedPass) {
            return resolve(encryptedPass);
          },
        });
      });
    }, // End encryptPass()

    checkPass: function (pass, encryptedPass) {
      return new Promise(function (resolve, reject) {
        passwords
          .checkPassword({
            passwordAttempt: pass,
            encryptedPassword: encryptedPass,
          })
          .exec({
            error: function (err) {
              return reject(err);
            },
            incorrect: function () {
              return reject({ message: 'login.snackbar.wrongPassword' });
            },
            success: function () {
              return resolve(true);
            },
          });
      });
    }, // End checkPass()
  }; // End return JSON
};
