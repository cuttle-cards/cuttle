/**
 * hasSeasonId
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'seasonId' parameter, which is a stringified number
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  const id = parseInt(req?.params?.seasonId);
  if (id && typeof id === 'number') {
    return next();
  }

  // User not allowed
  return res.badRequest({ message: 'Error: Request missing required param seasonId' });
};
