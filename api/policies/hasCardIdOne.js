/**
 * hasCardIdOneAndTwo
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain 'cardId1' and 'cardId2' parameters, which are numbers
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (Object.hasOwnProperty.call(req.body, 'cardId1')) {
    if (typeof req.body.cardId1 === 'number') {
      return next();
    }
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.badRequest({ message: 'You must select at least one card' });
};
