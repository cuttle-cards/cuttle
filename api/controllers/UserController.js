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

export function homepage(req, res) {
  return res.view('homepage', { loggedIn: req.session.loggedIn, game: req.session.game });
}

export async function signup(req, res) {
  // Request was missing data
  if (!req.body.password && !req.body.username) {
    return res.badRequest('You did not submit a username or password');
  }
  try {
    const { username, password } = req.body;
    const users = await User.find({ username: username });
    if (users.length > 0) {
      return res.badRequest({
        message: 'That username is already registered to another user; try logging in!',
      });
    }
    // Encrypt pw and create new user
    const encryptedPassword = await passwordAPI.encryptPass(password);
    const user = await userAPI.createUser(username, encryptedPassword);
    // Successfully created User - Set session data
    req.session.loggedIn = true;
    req.session.usr = user.id;
    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
}
export async function login(req, res) {
  const { username } = req.body;
  if (!username) {
    return res.badRequest({ message: 'A username must be provided' });
  }
  let user;
  try {
    user = await userAPI.findUserByUsername(username);
  } catch (err) {
    return res.badRequest({
      message: 'Could not find that user with that username. Try signing up!',
    });
  }
  try {
    await passwordAPI.checkPass(req.body.password, user.encryptedPassword);
    req.session.loggedIn = true;
    req.session.usr = user.id;
    return res.ok();
  } catch (reason) {
    return res.badRequest(reason);
  }
}
export async function reLogin(req, res) {
  try {
    const user = await userAPI.findUserByUsername(req.body.username);
    const [game] = await Promise.all([
      gameService.populateGame({ gameId: user.game }),
      passwordAPI.checkPass(req.body.password, user.encryptedPassword),
    ]);
    req.session.loggedIn = true;
    req.session.usr = user.id;
    req.session.game = game.id;
    req.session.pNum = user.pNum;
    Game.subscribe(req, [game.id]);
    sails.sockets.join(req, 'GameList');
    Game.publish([game.id], {
      verb: 'updated',
      data: {
        ...game.lastEvent,
        game,
      },
    });

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
}

export function logout(req, res) {
  delete req.session.usr;
  req.session.loggedIn = false;
  return res.ok();
}
