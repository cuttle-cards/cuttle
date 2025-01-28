/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */

module.exports.policies = {
  statsController: {
    '*': 'isLoggedIn',
    getSeasonStats: [ 'isLoggedIn', 'hasSeasonId' ],
  },

  UserController: {
    '*': false,
    signup: [ 'hasValidUsername', 'hasValidPassword' ],
    login: [ 'hasValidUsername', 'hasPassword' ],
    // reLogin does not require password intentionally-- if you are already logged in it will
    // not require a password to validate the session
    reLogin: [ 'hasValidUsername' ],
    logout: true,
    status: true,
  },

  'game/reconnect': [ 'isLoggedIn', 'isInGame' ],
  'game/create': [ 'isLoggedIn', 'hasGameName' ],
  'game/get-list': 'isLoggedIn',
  'game/subscribe': [ 'isLoggedIn', 'hasGameId' ],
  'game/spectate': [ 'isLoggedIn', 'hasGameId' ],
  'game/ready': [ 'isLoggedIn', 'isInGame' ],
  'game/set-is-ranked': 'isInGame',
  'game/leave-lobby': [ 'isSocket', 'isLoggedIn', 'isInGame' ],
  'game/draw': [ 'isLoggedIn', 'isInGame' ],
  'game/pass': [ 'isLoggedIn', 'isInGame' ],
  'game/points': [ 'isLoggedIn', 'isInGame', 'hasCardId' ],
  'game/face-card': [ 'isLoggedIn', 'isInGame', 'hasCardId' ],
  'game/scuttle': [ 'isLoggedIn', 'isInGame', 'hasCardId', 'hasOpId', 'hasTargetId' ],
  'game/jack': [ 'isLoggedIn', 'isInGame', 'hasCardId', 'hasOpId', 'hasTargetId' ],
  'game/untargeted-one-off': [ 'isLoggedIn', 'isInGame', 'hasCardId', 'hasOpId' ],
  'game/targeted-one-off': [ 'isLoggedIn', 'isInGame', 'hasCardId', 'hasOpId', 'hasTargetId', 'hasTargetType' ],
  'game/counter': [ 'isLoggedIn', 'isInGame', 'hasCardId', 'hasOpId' ],
  'game/resolve': [ 'isLoggedIn', 'isInGame', 'hasOpId' ],
  'game/resolve-four': [ 'isLoggedIn', 'isInGame', 'hasCardIdOne' ],
  'game/resolve-five': [ 'isLoggedIn', 'isInGame' ],
  'game/resolve-three': [ 'isLoggedIn', 'isInGame', 'hasCardId' ],
  'game/concede': [ 'isLoggedIn', 'isInGame' ],
  'game/stalemate': [ 'isLoggedIn', 'isInGame' ],
  'game/stalemate-reject': [ 'isLoggedIn', 'isInGame' ],
  'game/game-over': [ 'isLoggedIn' ],
  'game/chat': [ 'isLoggedIn', 'isInGame' ],
  'game/game-data': [ 'isLoggedIn', 'isInGame' ],

  'game/seven/face-card': [ 'isLoggedIn', 'isInGame', 'hasCardId' ],
  'game/seven/jack': [ 'isLoggedIn', 'isInGame', 'hasCardId', 'hasOpId', 'hasTargetId' ],
  'game/seven/points': [ 'isLoggedIn', 'isInGame', 'hasCardId' ],
  'game/seven/scuttle': [ 'isLoggedIn', 'isInGame', 'hasCardId', 'hasOpId', 'hasTargetId' ],
  'game/seven/targeted-one-off': [
    'isLoggedIn',
    'isInGame',
    'hasCardId',
    'hasOpId',
    'hasTargetId',
    'hasTargetType',
  ],
  'game/seven/untargeted-one-off': [ 'isLoggedIn', 'isInGame', 'hasCardId' ],

  // GameStateApi
  'game/move': [ 'isLoggedIn', 'hasValidMoveBody' ],
  'game/rematch-gamestate': 'isLoggedIn',

  /////////////////////////////////
  // DEVELOPMENT Or Staging ONLY //
  /////////////////////////////////
  'game/stack-deck': 'developmentOrStagingOnly',
  'game/clear-game': 'developmentOrStagingOnly',
  'game/load-fixture': 'developmentOrStagingOnly',
  'game/load-fixture-gamestate': 'developmentOrStagingOnly',

  TestController: {
    '*': 'developmentOrStagingOnly',
  },
};
