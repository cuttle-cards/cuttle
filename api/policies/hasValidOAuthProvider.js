/**
 * hasValidOauthProvider
 *
 * @module      :: Policy
 * @description :: Only allows requests that contain certain provider params
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  const { provider } = req.params;

  if (![ 'discord' ].includes(provider)){

    // Regular error if we're coming from oauth complete registration form
    if (req.url.includes('oauthcomplete')){
      return res.badRequest({ message: 'Error: Request missing required param provider' });
    }

    // Redirect for redirect and call back
    return res.redirect(`${process.env.VITE_FRONTEND_URL}/login?error=login.snackbar.oAuth.invalidProvider`);
  }
  return next();
};
