/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'cardId' parameter, which is a number
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.body.cardId) {
  	if (typeof(req.body.cardId) === "number") {
    	return next();
  	} else {
  		return res.forbidden("Error with user's session: 'game' must be an integer");
  	}
  } else {
  	return res.forbidden("You must join a game to draw a card");
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.forbidden('You are not permitted to perform this action.');
};