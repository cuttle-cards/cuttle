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
};
