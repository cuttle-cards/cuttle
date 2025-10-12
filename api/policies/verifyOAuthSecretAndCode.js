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
    // throw generic error
      throw new Error();
    }
  } catch (e) {
    return res.redirect(`${process.env.VITE_FRONTEND_URL}/?error=login.snackbar.oAuth.providerError`);
  }

  return next();
};
