/**
 * hasPassword
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'password' parameter, which is a string
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
	if ( req.body.hasOwnProperty('password') ) {
		if (typeof(req.body.password) === 'string'){
			// PLACE PASSWORD RESTRICTIONS HERE
				// e.g. at least 8 characters, etc.
			return next();
		}
	}
	// User not allowed
  return res.forbidden('You are not permitted to perform this action.');
}