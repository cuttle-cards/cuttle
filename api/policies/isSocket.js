/**
 * isThroughSocket
 *
 * @module      :: Policy
 */
module.exports = function (req, res, next) {
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (req.isSocket) {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.badRequest({ message: 'That request can only be made from a websocket' });
};
