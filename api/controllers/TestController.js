/**
 * TestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

module.exports = {
  wipeDatabase: function (_req, res) {
    return sails.helpers.wipeDatabase()
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
      // transform timestamps to `Date` objects, as sails-disk doesn't support ISO timestamp strings
      const editedSeasons = req.body.map((season) => {
        return {
          ...season,
          startTime: dayjs.utc(season.startTime).toDate(),
          endTime: dayjs.utc(season.endTime).toDate(),
        };
      });
      const seasons = await Season.createEach(editedSeasons).fetch();
      return res.ok(seasons);
    } catch (e) {
      return res.badRequest(e);
    }
  },

  loadMatchFixtures: async function (req, res) {
    try {
      // transform timestamps to `Date` objects, as sails-disk doesn't support ISO timestamp strings
      const editedMatches = req.body.map((match) => {
        return {
          ...match,
          startTime: dayjs.utc(match.startTime).toDate(),
          endTime: dayjs.utc(match.endTime).toDate(),
        };
      });
      await Match.createEach(editedMatches);
    } catch (e) {
      return res.badRequest(e);
    }
    return res.ok();
  },

  loadFinishedGameFixtures: async function (req, res) {
    try {
      const editedGames = req.body.map((game) => {
        return {
          ...game,
          updatedAt: dayjs.utc(game.updatedAt).toDate(),
        };
      });
      await Game.createEach(editedGames);
    } catch (e) {
      return res.badRequest(e);
    }
    return res.ok();
  },

  getGames: async function (req, res) {
    try {
      const games = await Game.find();
      return res.json(games);
    } catch (err) {
      return res.serverError(err);
    }
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
