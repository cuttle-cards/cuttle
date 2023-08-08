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

const conditionalIsLoggedIn = process.env.CUTTLE_ENV === 'test'
  ? ''
  : 'isLoggedIn';

module.exports.policies = {
  statsController: {
    '*': 'isLoggedIn',
  },

  UserController: {
    '*': false,
    signup: ['hasValidUsername', 'hasValidPassword'],
    login: ['hasValidUsername', 'hasPassword'],
    // reLogin does not require password intentionally-- if you are already logged in it will
    // not require a password to validate the session
    reLogin: ['hasValidUsername'],
    logout: true,
    status: true,
  },

  'game/reconnect': ['isLoggedIn', 'isInGame'],
  'game/create': [conditionalIsLoggedIn, 'hasGameName'],
  'game/get-list': 'isLoggedIn',
  'game/subscribe': conditionalIsLoggedIn,
  'game/spectate': ['isLoggedIn'],
  'game/ready': conditionalIsLoggedIn,
  'game/leave-lobby': ['isSocket', conditionalIsLoggedIn, 'isInGame'],
  'game/draw': [conditionalIsLoggedIn, 'isInGame'],
  'game/pass': [conditionalIsLoggedIn, 'isInGame'],
  'game/points': [conditionalIsLoggedIn, 'isInGame', 'hasCardId'],
  'game/face-card': [conditionalIsLoggedIn, 'isInGame', 'hasCardId'],
  'game/scuttle': ['isLoggedIn', 'isInGame', 'hasCardId', 'hasOpId', 'hasTargetId'],
  'game/jack': [conditionalIsLoggedIn, 'isInGame', 'hasCardId', 'hasOpId', 'hasTargetId'],
  'game/untargeted-one-off': [conditionalIsLoggedIn, 'isInGame', 'hasCardId', 'hasOpId'],
  'game/targeted-one-off': [conditionalIsLoggedIn, 'isInGame', 'hasCardId', 'hasOpId', 'hasTargetId', 'hasTargetType'],
  'game/counter': [conditionalIsLoggedIn, 'isInGame', 'hasCardId', 'hasOpId'],
  'game/resolve': [conditionalIsLoggedIn, 'isInGame', 'hasOpId'],
  'game/resolve-four': [conditionalIsLoggedIn, 'isInGame', 'hasCardIdOne'],
  'game/resolve-three': [conditionalIsLoggedIn, 'isInGame', 'hasCardId'],
  'game/concede': [conditionalIsLoggedIn, 'isInGame'],
  'game/stalemate': [conditionalIsLoggedIn, 'isInGame'],
  'game/stalemate-reject': [conditionalIsLoggedIn, 'isInGame'],
  'game/game-over': ['isLoggedIn'],
  'game/chat': ['isLoggedIn', 'isInGame'],
  'game/game-data': ['isLoggedIn', 'isInGame'],

  'game/seven/face-card': [conditionalIsLoggedIn, 'isInGame', 'hasCardId'],
  'game/seven/jack': [conditionalIsLoggedIn, 'isInGame', 'hasCardId', 'hasOpId', 'hasTargetId'],
  'game/seven/points': [conditionalIsLoggedIn, 'isInGame', 'hasCardId'],
  'game/seven/scuttle': [conditionalIsLoggedIn, 'isInGame', 'hasCardId', 'hasOpId', 'hasTargetId'],
  'game/seven/targeted-one-off': [
    conditionalIsLoggedIn,
    'isInGame',
    'hasCardId',
    'hasOpId',
    'hasTargetId',
    'hasTargetType',
  ],
  'game/seven/untargeted-one-off': [conditionalIsLoggedIn, 'isInGame', 'hasCardId'],

  /////////////////////////////////
  // DEVELOPMENT Or Staging ONLY //
  /////////////////////////////////
  'game/stack-deck': 'developmentOrStagingOnly',
  'game/clear-game': 'developmentOrStagingOnly',
  'game/load-fixture': 'developmentOrStagingOnly',

  TestController: {
    '*': 'developmentOrStagingOnly',
  },
};
