/**
 * Route Mappings
 * (sails.config.routes)
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  // App health
  'GET /api/health': 'HealthController.getHealth',

  // Users
  '/api/user/signup': 'userController.signup',
  '/api/user/login': 'userController.login',
  '/api/user/reLogin': 'userController.reLogin',
  '/api/user/logout': 'userController.logout',
  '/api/user/status': 'userController.status',

  // OAuth
  'GET /api/user/:provider/redirect': 'OAuthController.oAuthRedirect',
  'GET /api/user/:provider/callback': 'OAuthController.oAuthCallback',
  'POST /api/user/:provider/completeOauth': 'OAuthController.oAuthCompleteRegistration',

  // Stats
  '/api/stats/seasons/current': 'StatsController.getCurrentStats',
  '/api/stats/seasons/:seasonId': 'StatsController.getSeasonStats',

  // Games
  'POST /api/game': 'game/create',
  'GET /api/game': 'game/get-list',
  'GET /api/game/:gameId': 'game/get-game',
  'POST /api/game/:gameId/join': 'game/join',
  'POST /api/game/:gameId/spectate': 'game/spectate/join',
  'DELETE /api/game/:gameId/spectate': 'game/spectate/leave',
  'POST /api/game/:gameId/leave': 'game/leave-lobby',
  'POST /api/game/:gameId/ready': 'game/ready',
  'PATCH /api/game/:gameId/is-ranked': 'game/set-is-ranked',
  'POST /api/game/:gameId/move': 'game/move',
  'POST /api/game/:gameId/rematch': 'game/rematch',
  'GET /api/game/history': 'game/get-history',

  // Testing helpers - DEVELOPMENT ONLY
  'POST /api/game/:gameId/game-state': 'game/load-fixture-gamestate',
  'DELETE /api/test/wipe-database': 'TestController.wipeDatabase',
  'POST /api/test/seasons': 'TestController.loadSeasonFixture',
  'POST /api/test/matches': 'TestController.loadMatchFixtures',
  'POST /api/test/games': 'TestController.loadFinishedGameFixtures',
  'GET /api/test/game': 'TestController.getGames',
  'GET /api/test/match': 'TestController.getMatches',
  'GET /api/test/spectator' : 'TestController.getSpectators',

  // Catch all for Vue paths only require get for http request so we don't interfer
  // with any blueprints routes
  '/*': {
    controller: 'ViewController',
    action: 'serveIndex',
    skipAssets: true,
    skipRegex: /^\/api\/.*$/, // ignore /api routes
  },
};
