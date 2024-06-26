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
  testGameStatePacking : async function(req, res){
    if(sails.config.custom.useGameStateApi){
      try {
          const game = req.body;

          const addedInfos = { gameId : game.id, playedBy : 1, moveType : 3, phase : 1 , 'p0' : game.players[0], 'p1' : game.players[1]}; 
          const merged = {...game, ...addedInfos};
          // create gamestate
          const gameState = await GameState.create(merged).fetch();
          console.log(gameState);

          // create gamestateRow
          const gameStateRowData = await sails.helpers.packGamestate(gameState);
          const gameStateRow = await GameStateRow.create(gameStateRowData).fetch();
          // p0Hand: [Card.ACE_OF_SPADES, Card.ACE_OF_CLUBS],
          // p0Points: [Card.TEN_OF_SPADES],
          // p0FaceCards: [Card.KING_OF_SPADES],
          // p1Hand: [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS],
          // p1Points: [Card.TEN_OF_HEARTS],
          // p1FaceCards: [Card.KING_OF_HEARTS],

          // res.p0Hand = ['AS', 'AC'];
          // res.p0Points = ['TS'];
          // res.p0FaceCards = ['KS'];
          // res.p1Hand = ['AH', 'AD'];
          // res.p1Points = ['TH'];
          // res.p1FaceCards = ['KH'];

          // turn gamestateRow back to a gamestate
          await GameState.destroyOne(gameState.id);
          const gameStateConverted = await sails.helpers.unpackGamestate(gameStateRow, 
                                                                            game.players[0].id, 
                                                                            game.players[1].id);
          console.log(gameStateConverted);

          return res.json(gameStateRow);

      } catch (err) {
        return res.serverError(err);
      }
    }
    return res.badRequest('GameStateApi set to false');
  }

};
