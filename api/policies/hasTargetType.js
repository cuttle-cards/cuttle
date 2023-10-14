/**
 * hasTargetType
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'targetType' parameter, which is a string
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (Object.hasOwnProperty.call(req.body, 'targetType')) {
    if (typeof req.body.targetType === 'string') {
      return next();
    }
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.badRequest({ message: 'Error: request missing required param targetType' });
};
