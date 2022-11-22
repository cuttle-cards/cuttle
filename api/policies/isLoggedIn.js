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
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  const userIsValid = req.session.usr && typeof req.session.usr === 'number';
  if (req.session.loggedIn && userIsValid) {
    return next();
  }

  // In the event a user is forbidden from logging in, we need to know why
  const { session, path } = req;
  console.error('Access forbidden', {
    session,
    path,
  });

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.forbidden({
    message: 'You must be logged in to perform this action.',
    path,
  });
};
