/**
 * hasCardId
 *
 * @module      :: Policy
 * @description :: Only allows requests when server is in development mode (for testing, etc)
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  // Only allow the request if running in development or staging environment
  if ([ 'development', 'staging' ].includes(sails.config.environment)) {
    return next();
  }
  return res.forbidden({
    message: 'Error: This action is only permitted in development or staging',
  });
};
