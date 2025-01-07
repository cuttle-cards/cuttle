/**
 * isLoggedIn
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets
 *                 `req.session.loggedIn = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  const { session } = req;
  const userIsValid = session.usr && typeof session.usr === 'number';
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (session.loggedIn && userIsValid) {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.status(401)
    .json('Please log in and try again');
};
