/**
 * isInGame
 *
 * @module      :: Policy
 * @description :: Simple policy to allow user who is in game
 *                 Assumes that your login action in one of your controllers sets `req.session.game = integer;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.session.game) {
  	if (typeof(req.session.game) === "number") {
    	return next();
  	} else {
  		return res.forbidden("Error with user's session: 'game' must be an integer");
  	}
  } else {
  	return res.forbidden("Session Error: You must join a game to perform that move");
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.forbidden('You are not permitted to perform this action.');
};
