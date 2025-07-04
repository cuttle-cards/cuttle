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
      const { username } = await userAPI.findUser(id);
      return res.ok({
        id,
        username,
        authenticated,
      });
    } catch (err) {
      // Something happened and we couldn't verify the user, log them out
      await sails.helpers.logout(req);
      return res.badRequest(err);
    }
  },

  discordRedirect: async function(_, res) {
    const url = new URL('https://discord.com/api/oauth2/authorize');
    const { generateSecret } = sails.helpers.oauth;
    const state = generateSecret();

    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', process.env.VITE_DISCORD_CLIENT_ID);
    url.searchParams.set('scope', 'identify email guilds.members.read');
    url.searchParams.set('redirect_uri', 'http://localhost:1337/api/user/discord/callback');
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('state', state);

    res.set('Cache-Control', 'private, no-cache');
    return res.redirect(url.href);

  },

  discordCallBack: async function(req, res) {
    const { code } = req.query;
    const { state } = req.query;

    const { verifySecret, fetchDiscordIdentity } = sails.helpers.oauth;

    const verified = verifySecret(state);
    if (!verified) {
      return res.badRequest('Invalid secret');
    }

    if (!code) {
      return res.badRequest('Missing code');
    }

    const params = {
      client_id: String(process.env.VITE_DISCORD_CLIENT_ID),
      client_secret: String(process.env.VITE_DISCORD_CLIENT_SECRET),
      grant_type: 'authorization_code',
      code,
      redirect_uri: `http://localhost:1337/api/user/discord/callback`,
    };

    try {
      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params),
      });

      const tokenData = await tokenRes.json();

      if (!tokenData) {
        throw new Error('Failed to retrieve token');
      }
      const user = await fetchDiscordIdentity(tokenData);

      if (!user) {
        throw new Error('Failed to retrieve user data');
      }

      req.session.loggedIn = true;
      req.session.usr = user.id;

      return res.redirect('http://localhost:8080');



    }catch (err) {
      console.log(err);
    }
  }
};

