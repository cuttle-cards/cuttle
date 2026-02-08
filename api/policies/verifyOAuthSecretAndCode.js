/**
 * verifyOAuthSecretAndCode
 *
 * @module      :: Policy
 * @description :: Verifies secret returned from Oauth/redirect response
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  const { code, state } = req.query;
  const { verifySecret } = sails.helpers.oauth;

  try {
    const verified = verifySecret(state);

    if (!verified || !code) {
      throw new Error('OAuth verification failed: invalid secret or missing authorization code');
    }
  } catch (e) {
    return res.redirect(`${process.env.VITE_FRONTEND_URL}/?error=login.snackbar.oAuth.providerError`);
  }

  return next();
};
