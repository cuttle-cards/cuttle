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
  if (Object.hasOwnProperty.call(req.body, 'cardId1') && Object.hasOwnProperty.call(req.body, 'cardId2')) {
    if (typeof req.body.cardId1 === 'number' && typeof req.body.cardId2 === 'number') {
      return next();
    }
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.forbidden({ message: 'You are not permitted to perform this action.' });
};
