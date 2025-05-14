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
    signup: [ 'hasValidUsername', 'hasValidPassword', 'hasNoProfanity' ],
    login: [ 'hasValidUsername', 'hasPassword' ],
    // reLogin does not require password intentionally-- if you are already logged in it will
    // not require a password to validate the session
    reLogin: [ 'hasValidUsername' ],
    logout: true,
    status: true,
  },

  'game/create': [ 'isLoggedIn', 'hasGameName', 'hasNoProfanity' ],
  'game/get-list': 'isLoggedIn',
  'game/get-game': [ 'isLoggedIn', 'hasGameId' ],
  'game/join': [ 'isLoggedIn', 'hasGameId' ],
  'game/spectate/join': [ 'isLoggedIn', 'hasGameId' ],
  'game/spectate/leave': [ 'isLoggedIn', 'hasGameId' ],
  'game/spectate': [ 'isLoggedIn' ],
  'game/ready': [ 'isLoggedIn', 'hasGameId' ],
  'game/set-is-ranked': [ 'isLoggedIn', 'hasGameId' ],
  'game/leave-lobby': [ 'isSocket', 'isLoggedIn', 'hasGameId' ],
  'game/game-over': [ 'isLoggedIn' ],

  // GameStateApi
  'game/move': [ 'isLoggedIn', 'hasValidMoveBody', 'hasGameId' ],
  'game/rematch-gamestate': 'isLoggedIn',

  /////////////////////////////////
  // DEVELOPMENT OR STAGING ONLY //
  /////////////////////////////////
  'game/load-fixture-gamestate': 'developmentOrStagingOnly',

  TestController: {
    '*': 'developmentOrStagingOnly',
    'wipeDatabase': [ 'developmentOrStagingOnly', 'deleteSession' ],
  },
};
