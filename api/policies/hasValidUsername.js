/**
 * hasValidUsername
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'username' parameter, which is a string and
 *                 does not contain spaces
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  const username = req.body.username?.trim();

  if (!username) {
    return res.badRequest({ message: 'Please provide a non-empty username' });
  }
  // https://stackoverflow.com/a/389075/6705125
  // ., -, and @ are included in the regex to allow for emails and backwards compatibility
  // In general, the regex just makes sure that there's at least one alphanumeric character
  // and none that aren't
  if (typeof username !== 'string' || !username.match(/^[\w.@-]+$/)) {
    return res.badRequest({ message: 'Your username must contain only letters or numbers' });
  }
  req.body.username = username;
  return next();
};
