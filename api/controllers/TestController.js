/**
 * TestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const GameState = require('../temp/GameState');
const Player = require('../temp/Player');

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
  testGameStatePacking : async function(req, res){
      try {

          const game =  req.body.game;
          //Add data needed for a gameState moveType : 3, phase : 1  => random data
          const addedInfos = { gameId : game.id, playedBy : 1 , moveType : 3, phase : 1 , 'p0' : game.players[0], 'p1' : game.players[1]}; 
          const merged = {...game, ...addedInfos};

          const gameState = new GameState(merged);

          //Save Data to a gamestateRow
          const gameStateRow = await sails.helpers.gamestate.saveGamestate(gameState);

          return res.json(gameStateRow);

      } catch (err) {
        return res.serverError(err);
      }
  },
  
  testGameStateUnpacking : async function(req, res){
      try {
          const gameStateRow =  req.body.resApi;

          const game = await Game.findOne({ id: gameStateRow.gameId });

          // converted data from gamestateRow format to a gamestate format (card object)
          const convertedData = await sails.helpers.gamestate.unpackGamestate(gameStateRow, 
                                                                                  game.p0, 
                                                                                  game.p1);
          const p0 = new Player ( convertedData.p0 );
          const p1 = new Player ( convertedData.p1 );
          const updatedGameState = new GameState( convertedData );

          return res.json({updatedGameState, players : [p0, p1]});

      } catch (err) {
        return res.serverError(err);
      }
  }
};
