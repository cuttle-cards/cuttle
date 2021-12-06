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
				return res.badRequest({message: "Please provide a valid email address"});
			},
			error: function () {
				return res.forbidden({message: "Please provide a valid email address"});
			}
		});
	} else {
		return res.forbidden({message: "Error: You must provide a valid email address"});
	}
 };