/**
 * hasPassword
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'password' parameter, which is a string
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  // Password must be at least 8 characters
  if (!req.body.password) {
    return res.badRequest({ message: 'Password is required' });
  }
  if (typeof req.body.password !== 'string' || req.body.password.length < 8) {
    return res.badRequest({ message: 'Your password must contain at least eight characters' });
  }
  return next();
};
