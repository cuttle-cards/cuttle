/**
 * hasValidEmail
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain an 'email' parameter in a valid email format.
 *                 Normalizes the email to lowercase
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  if (!email || email.length > 254 || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.badRequest({ message: 'emailPreference.error.invalidEmail' });
  }
  req.body.email = email;
  return next();
};
