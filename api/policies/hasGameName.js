/**
 * hasGameName
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'gameName' parameter, which is a string
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  if (req.body.hasOwnProperty('gameName')) {
    if (typeof req.body.gameName === 'string') {
      // Could add restrictions on allowable game names
      if (req.body.gameName.length > 20) {
        return res.badRequest({ message: 'Game name cannot be longer than 20 characters' });
      } else if (res.body.gameName.length < 0) {
        return res.badRequest({ message: 'Game name cannot be blank' });
      } else if (req.body.gameName.length > 0 && req.body.gameName.length <= 20) {
        return next();
      }
    }
  }
  // User not allowed
  return res.forbidden({ message: 'You are not permitted to perform this action.' });
};
