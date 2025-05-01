/**
 * hasGameId
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'gameId' parameter, which is a number
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  let { gameId } = req.params;
  gameId = Number(gameId);
  if (Number.isInteger(gameId)) {
    req.params.gameId = gameId; // cast to integer
    return next();
  }

  return res.badRequest({ message: 'Error: Request missing required paramater gameId' });
};
