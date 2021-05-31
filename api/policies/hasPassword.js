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
			return next();
		}
	}
	// User not allowed
  return res.forbidden(new Error('You are not permitted to perform this action.'));
}