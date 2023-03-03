/**
 * TestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  wipeDatabase: function (req, res) {
    return Promise.all([
      Game.destroy({}),
      User.destroy({}),
      Card.destroy({}),
      Season.destroy({}),
      Match.destroy({}),
    ])
      .then(() => {
        return res.ok();
      })
      .catch((err) => {
        return res.badRequest(err);
      });
  },

  setBadSession: function (req, res) {
    req.session.game = -3;
    return res.ok();
  },

  loadSeasonFixture: async function (req, res) {
    try {
      await Season.createEach(req.body);
    } catch (e) {
      return res.badRequest(e);
    }
    return res.ok();
  },

  loadMatchFixtures: async function (req, res) {
    try {
      await Match.createEach(req.body);
    } catch (e) {
      return res.badRequest(e);
    }
    return res.ok();
  },

  // Switch to a specified user's session
  recoverSession: async function (req, res) {
    try {
      const { username } = req.body;

      // Early return if no user specified
      if (!username) {
        return res.badRequest(false);
      }

      const user = await User.findOne({username});

      if (!user) {
        return res.ok(false);
      }

      // Set session from user data in db
      req.session.loggedIn = true;
      req.session.usr = user.id;
      req.session.game = user.game;
      req.session.pNum = user.pNum;

      // Return true if session has been updated
      return res.ok(true);
    } catch(err) {
      return res.serverError(err);
    }

  },
};
