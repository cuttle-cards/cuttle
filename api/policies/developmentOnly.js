/**
 * hasCardId
 *
 * @module      :: Policy
 * @description :: Only allows requests when server is in development mode (for testing, etc)
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
    // User is allowed, proceed to the next policy, 
    // or if this is the last policy, the controller
    if (sails.config.environment === 'development') {
        return next();
    } else {
        return res.forbidden({message: "Error: This action is only permitted in development"});
    }
  };