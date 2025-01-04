/**
 * isInGame
 *
 * @module      :: Policy
 * @description :: Simple policy to allow user who is in game
 *                 Assumes that your login action in one of your controllers sets `req.session.game = integer;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

// TODO #965 - Delete this policy (no longer using req.session.game)
module.exports = function (req, res, next) {
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (req.session.game) {
    if (typeof req.session.game === 'number') {
      return next();
    }
    return res.badRequest({ message: `Error with user's session: 'game' must be an integer` });
  }

  return res.badRequest({ message: `You are not a player in this game!` });
};
