/**
 * hasValidEmail
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain an 'email' parameter in a valid email format.
 *                 Normalizes the email to lowercase
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
const EmailValidation = require('../../utils/EmailValidation.json');

const emailPattern = new RegExp(EmailValidation.pattern);

module.exports = function (req, res, next) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  if (!email || email.length > EmailValidation.maxLength || !emailPattern.test(email)) {
    return res.badRequest({ message: 'emailPreference.error.invalidEmail' });
  }
  req.body.email = email;
  return next();
};
