/**
 * hasValidUsername
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'username' parameter, which is a string and does not contain spaces
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  if (req.body.hasOwnProperty('username')) {
    const username = req.body.username;
    if (typeof (username) === 'string') {
      if (username.match(/^[0-9a-zA-Z.@]+$/)){ // . and @ are included to allow for emails
        return next();
      } else {
        if (username.length === 0) {
          return res.badRequest({message: 'Please provide a valid username'});
        }
        return res.badRequest({message: "Your username must contain only letters or numbers"});
      }
    }
  }
};
