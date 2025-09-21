
/**
 * OAuthController
 *
 * @description :: Server-side logic for managing Users via Oauth authentication
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const passwordAPI = sails.hooks['custompasswordhook'];

module.exports = {
  // Set URL params and redirect to discord auth page
  oAuthRedirect: async function(req, res) {
    const { createRedirectParams } = sails.helpers.oauth[req.params.provider];
    const url = createRedirectParams();

    res.set('Cache-Control', 'private, no-cache');
    return res.redirect(url.href);
  },

  // Discord hits this endpoint on response to logging in with discord
  oAuthCallBack: async function(req, res) {
    const { code } = req.query;
    const { provider } = req.params;

    const { fetchIdentity, retrieveTokenData } = sails.helpers.oauth[provider];
    try {
      const tokenData = await retrieveTokenData(code);

      const providerIdentity = await fetchIdentity(tokenData);
      const prevIdentity = await Identity.findOne({ provider, providerId: providerIdentity.id }).populate('user');

      const loggedInUser = req.session.usr ?? null;

      // If loggedInUser user is trying to link, check that there is no attachments to previous identity
      if ( prevIdentity && loggedInUser && prevIdentity.user?.id !== loggedInUser ){
        throw new Error('login.snackbar.oAuth.alreadyLinked');
      }

      // If no identity but user is already logged in, create Identity
      if (!prevIdentity && loggedInUser) {
        await Identity.create({
          provider,
          providerId: providerIdentity.id,
          user: loggedInUser,
          providerUsername: providerIdentity.username,
        });

        // Identity was created, session is already set, redirect home
        return res.redirect(`${process.env.VITE_FRONTEND_URL}/`);

        // If no user, and no identity, redirect to identity signup form to complete oauth registration
      } else if (!prevIdentity) {
        req.session.tokenData = tokenData;
        return res.redirect(`${process.env.VITE_FRONTEND_URL}/?oauthsignup=${provider}`);
      }

      // Returning user, log user in
      req.session.loggedIn = true;
      req.session.usr = loggedInUser ?? prevIdentity.user.id;

      return res.redirect(`${process.env.VITE_FRONTEND_URL}/`);

    } catch (err) {
      const message = err.message ?? 'login.snackbar.oAuth.providerError';

      if (req.session.usr > 0) {
        return res.redirect(`${process.env.VITE_FRONTEND_URL}/?error=${message}`);
      }
      return res.redirect(`${process.env.VITE_FRONTEND_URL}/login?error=${message}`);
    }
  },

  // Final step in Oauth Registration,
  oAuthCompleteRegistration: async function(req, res) {
    const { username, password } = req.body;
    const { fetchIdentity } = sails.helpers.oauth[req.params.provider];
    try{
      // Find existing user
      let user = null;
      if ( password ) {
        try {
          user = await User.findOne({ username });
          if (!user) {
            throw {
              message: 'login.snackbar.userNotFound',
            };
          }
          await passwordAPI.checkPass(password, user.encryptedPassword);
        } catch (err) {
          throw new Error(err);
        }
      }

      const { tokenData } = req.session;
      const providerIdentity = await fetchIdentity(tokenData);

      if (!user) {
        // If no existing user, check username is not a duplicate and if not, create new user
        const foundUsername = await User.findOne({ username });
        if (foundUsername) {
          throw new Error('login.snackbar.usernameIsTaken');
        }
        user = await User.create({ username: username }).fetch();
      }

      await Identity.create({
        provider: providerIdentity.providerName,
        providerId: providerIdentity.id,
        user: user.id,
        providerUsername: providerIdentity.username,
      });

      req.session.loggedIn = true;
      req.session.usr = user.id;

      return res.ok(user.id);
    } catch (e) {
      return res.badRequest(e);
    }
  }
};
