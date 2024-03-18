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
      UserSpectatingGame.destroy({}),
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
      const seasons = await Season.createEach(req.body).fetch();
      return res.ok(seasons);
    } catch (e) {
      return res.badRequest(e);
    }
  },

  loadMatchFixtures: async function (req, res) {
    try {
      await Match.createEach(req.body);
    } catch (e) {
      return res.badRequest(e);
    }
    return res.ok();
  },

  loadFinishedGameFixtures: async function (req, res) {
    try {
      await Game.createEach(req.body);
    } catch (e) {
      return res.badRequest(e);
    }
    return res.ok();
  },

  getMatches: async function (req, res) {
    try {
      const matches = await Match.find()
        .populate('games')
        .populate('player1')
        .populate('player2')
        .populate('winner');
      return res.json(matches);
    } catch (err) {
      return res.serverError(err);
    }
  },
};
