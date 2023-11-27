/**
 * hasSeasonId
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'password' parameter, which is a string
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  const id = parseInt(req.params.seasonId);
  if (id && typeof id === 'number') {
    return next();
  }

  // User not allowed
  return res.badRequest({ message: 'Error: Request missing required param seasonId' });
};
