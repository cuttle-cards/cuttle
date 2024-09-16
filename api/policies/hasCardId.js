/**
 * hasCardId
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'cardId' parameter, which is a number
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (req.body.cardId) {
    if (typeof req.body.cardId === 'number') {
      return next();
    }
    return res.badRequest({
      message: 'Error: You must provide a valid card for your move (ID was non-integer)',
    });
  }
  return res.badRequest({
    message: 'Error You must provide a valid card to make that move (No ID given)',
  });
};
