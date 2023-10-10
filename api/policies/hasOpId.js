/**
 * hasOpId
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'opId' parameter, which is a number
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (Object.hasOwnProperty.call(req.body, 'opId')) {
    if (typeof req.body.opId === 'number') {
      return next();
    }
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.badRequest({ message: 'Error: Request missing required paramater opId' });
};
