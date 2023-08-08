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
  // We mock multiple users which mangles the session, so we just need to rely on the user ids
  // we set on the client
  // TODO can we mock the right user on the server to make sure they work properly?
  if (process.env.CUTTLE_ENV === 'test') {
    next();
  }

  const { session, path } = req;
  const userIsValid = session.usr && typeof session.usr === 'number';
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (session.loggedIn && userIsValid) {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.forbidden({
    message: 'You must be logged in to perform this action.',
    path,
  });
};
