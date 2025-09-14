/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

//////////////////
// DEPENDENCIES //
//////////////////
const userAPI = sails.hooks['customuserhook'];
const passwordAPI = sails.hooks['custompasswordhook'];

module.exports = {
  signup: async function (req, res) {
    try {
      const { username, password } = req.body;
      const foundUser = await User.findOne({ username: username });
      if (foundUser) {
        throw {
          message: 'login.snackbar.usernameIsTaken',
        };
      }
      // Encrypt pw and create new user
      const encryptedPassword = await passwordAPI.encryptPass(password);
      const user = await userAPI.createUser(username, encryptedPassword);
      // Successfully created User - Set session data
      req.session.loggedIn = true;
      req.session.usr = user.id;
      return res.ok(user.id);
    } catch (err) {
      return res.badRequest(err);
    }
  },

  login: async function (req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username: username });
      if (!user) {
        throw {
          message: 'login.snackbar.userNotFound',
        };
      }
      await passwordAPI.checkPass(password, user.encryptedPassword);
      req.session.loggedIn = true;
      req.session.usr = user.id;
      return res.ok(user.id);
    } catch (err) {
      return res.badRequest(err);
    }
  },

  reLogin: async function (req, res) {
    try {
      const { username, password } = req.body;
      const { loggedIn } = req.session;
      const user = await userAPI.findUserByUsername(username);
      // Validate password if not logged in -- will error if incorrect
      if (!loggedIn) {
        await passwordAPI.checkPass(password, user.encryptedPassword);
      }

      req.session.usr = user.id;
      req.session.loggedIn = true;

      return res.ok({ username: user.username });

    } catch (err) {
      return res.badRequest(err);
    }
  },

  logout: async function (req, res) {
    await sails.helpers.logout(req);
    return res.ok();
  },

  status: async function (req, res) {
    const { usr: id, loggedIn: authenticated } = req.session;
    // User is not logged in, get out of here
    if (!authenticated || !id) {
      return res.ok({
        authenticated: false,
      });
    }

    try {
      // If the user is logged in, see if we can find them first to verify they exist
      const { username, identities } = await userAPI.findUser(id);
      return res.ok({
        id,
        username,
        authenticated,
        identities
      });
    } catch (err) {
      // Something happened and we couldn't verify the user, log them out
      await sails.helpers.logout(req);
      return res.badRequest(err);
    }
  },

  oAuthRedirect: async function(req, res) {
    const { createRedirectParams } = sails.helpers.oauth[req.params.provider];
    const url = createRedirectParams();

    res.set('Cache-Control', 'private, no-cache');
    return res.redirect(url.href);
  },

  oAuthCallBack: async function(req, res) {
    const { code } = req.query;
    const { state } = req.query;
    const { provider } = req.params;

    const { verifySecret } = sails.helpers.oauth;
    const { fetchIdentity, retrieveTokenData } = sails.helpers.oauth[provider];
    try {
      const verified = verifySecret(state);

      if (!verified || !code) {
        // throw generic error
        throw new Error();
      }

      const tokenData = await retrieveTokenData(code);

      const providerIdentity = await fetchIdentity(tokenData);
      const prevIdentity = await Identity.findOne({ providerId: providerIdentity.id }).populate('user');

      const loggedInUser = req.session.usr ?? null;
      if ( prevIdentity && loggedInUser && prevIdentity.user.id !== loggedInUser ){
        // Fail if identity is already attached to someone elses account
        throw new Error('login.snackbar.discord.alreadyLinked');
      }

      if (!prevIdentity && loggedInUser) {
        // If no identity but user is already log in, create Identity
        await Identity.create({
          provider: 'discord',
          providerId: providerIdentity.id,
          user: loggedInUser,
          username: providerIdentity.username,
        });
      } else if (!prevIdentity) {
        // If no user, and no identity, redirect to identity signup
        req.session.tokenData = tokenData;
        return res.redirect(`${process.env.VITE_FRONTEND_URL}/?oauthsignup=${provider}`);
      }

      req.session.loggedIn = true;
      req.session.usr = prevIdentity.user.id;

      return res.redirect(`${process.env.VITE_FRONTEND_URL}/`);

    }catch (err) {
      const message = err.message ?? 'login.snackbar.oAuth.providerError';

      if (req.session.usr > 0) {
        return res.redirect(`${process.env.VITE_FRONTEND_URL}/?error=${message}`);
      }
      return res.redirect(`${process.env.VITE_FRONTEND_URL}/login?error=${message}`);
    }
  },

  oAuthComplete: async function(req, res) {
    const { username, password } = req.body;
    const { fetchIdentity } = sails.helpers.oauth[req.params.provider];

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
        return res.redirect(`${process.env.VITE_FRONTEND_URL}/login?error=${err}`);
      }
    }

    const { tokenData } = req.session;
    const providerIdentity = await fetchIdentity(tokenData);

    let updatedUser;
    if (user) {
      updatedUser = await User.findOne({ id: user.id });
    } else {
      // If no existing user, check username is not a duplicate and if not, create new user
      const foundUsername = await User.findOne({ username });
      if (foundUsername) {
        return res.redirect(`${process.env.VITE_FRONTEND_URL}/login?error=login.snackbar.usernameIsTaken`);
      }
      updatedUser = await User.create({ username: username }).fetch();
    }

    await Identity.create({
      provider: providerIdentity.providerName,
      providerId: providerIdentity.id,
      user: updatedUser.id,
      username: providerIdentity.username,
    });

    req.session.loggedIn = true;
    req.session.usr = updatedUser.id;

    return res.ok(updatedUser.id);
  }
};

