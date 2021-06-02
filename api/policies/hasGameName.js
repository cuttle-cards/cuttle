/**
 * hasGameName
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'gameName' parameter, which is a string
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
	if ( req.body.hasOwnProperty('gameName') ) {
		if (typeof(req.body.gameName) === 'string'){
			// Could add restrictions on allowable game names
			return next();
		}
	}
	// User not allowed
  return res.forbidden(new Error('You are not permitted to perform this action.'));
}