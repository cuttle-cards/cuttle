/**
 * hasValidEmail
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain a 'email' parameter, which is a valid email address
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

 var email = require('machinepack-emailaddresses');
 var Promise = require('bluebird');
 module.exports = function (req, res, next) {
	if ( req.body.hasOwnProperty('email') )  {
		return email.validate({
			string: req.body.email
		}).exec({
			success: function () {
				return next();
			},
			invalid: function () {
				return res.badRequest("Please provide a valid email address");
			},
			error: function () {
				return res.forbidden("Please provide a valid email address");
			}
		});
		// email.validate({
		// 	string: req.body.email
		// }).exec({
		// 	error: function (err) {
		// 		return res.forbidden("An unepxected error occurred while validating the provided email address");
		// 	},

		// 	invalid: function () {
		// 		return res.forbidden("The email address you provided was invalid");
		// 	},
		// 	success: function () {
		// 		console.log("email was valid");
		// 		console.log(next());
		// 		return next();
		// 	}
		// });
	// userService.validateEmail(req.body).
	// then(function success () {
	// 	return Promise.resolve(next());
	// })
	// .catch(function failed () {
	// 	return Promise.reject(res.forbidden("Error: you provided an invalid email address"));
	// });
	} else {
		return res.forbidden("Error: You must provide a valid email address");
	}
 };