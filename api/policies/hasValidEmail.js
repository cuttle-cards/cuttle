/**
 * hasValidEmail
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'email' parameter, which is a string and
 *                 does not contain spaces
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  const { email } = req.body;

  if (!email) {
    return res.badRequest({ message: 'Please provide a non-empty email' });
  }
  if (typeof email !== 'string' || !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
    return res.badRequest({ message: 'Your email must be valid' });
  }
  return next();
};
