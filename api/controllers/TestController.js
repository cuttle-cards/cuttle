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
  testGameStatePacking : async function(req, res){
      try {
          const gamet =  req.body.game;

          const addedInfos = { gameId : gamet.id, playedBy : 1, moveType : 3, phase : 1 , 'p0' : gamet.players[0], 'p1' : gamet.players[1]}; 
          const merged = {...gamet, ...addedInfos};

          // converted data from gamestate format to a gamestateRow format (string representation)
          const gameStateRowData = await sails.helpers.packGamestate(merged);
          const gameStateRow = await GameStateRow.create(gameStateRowData).fetch();

          Game.addToCollection(gamet.id, 'gameStates').members([gameStateRow.gameId]);

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
          const convertedData = await sails.helpers.unpackGamestate(gameStateRow, 
                                                                    game.p0, 
                                                                    game.p1);
          //create copys of users
          const p0Data = await User.findOne({id:game.p0});
          await Player.create(p0Data);    
          const p1Data = await User.findOne({id:game.p1});
          await Player.create(p1Data);  
          
          //create gameste
          await GameState.create(convertedData);

          //populate all
          const p0Updated = await Player.findOne({id:game.p0}).populate('hand')
                                                              .populate('points')
                                                              .populate('faceCards');
          const p1Updated = await Player.findOne({id:game.p1}).populate('hand')
                                                              .populate('points')
                                                              .populate('faceCards');     
          const updatedGameState = await GameState.findOne({gameId:gameStateRow.gameId})
                                                              .populate('p0')
                                                              .populate('p1')
                                                              .populate('deck')
                                                              .populate('scrap')
                                                              .populate('playedCard')
                                                              .populate('targetCard')
                                                              .populate('oneOff')
                                                              .populate('resolving')
                                                              .populate('twos', { sort: 'updatedAt' })
                                                              .populate('oneOffTarget'); 

          return res.json({updatedGameState, players : [p0Updated, p1Updated]});

      } catch (err) {
        return res.serverError(err);
      }
  }
};
