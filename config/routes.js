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
  'GET /api/devtools-health': 'HealthController.getDevtoolsHealth',

  // Users
  '/api/user/signup': 'userController.signup',
  '/api/user/login': 'userController.login',
  '/api/user/reLogin': 'userController.reLogin',
  '/api/user/logout': 'userController.logout',
  '/api/user/status': 'userController.status',

  // Stats
  '/api/stats/seasons/current': 'StatsController.getCurrentStats',
  '/api/stats/seasons/:seasonId': 'StatsController.getSeasonStats',

  // Games
  'POST /api/game': 'game/create',
  'GET /api/game': 'game/get-list',
  'POST /api/game/:gameId/subscribe': 'game/subscribe',
  'POST /api/game/:gameId/leave': 'game/leave-lobby',
  'DELETE /api/game/:gameId/spectate': 'game/spectate/leave',
  'POST /api/game/:gameId/ready': 'game/ready',
  'PATCH /api/game/:gameId/is-ranked': 'game/set-is-ranked',
  'POST /api/game/:gameId/move': 'game/move',
  'POST /api/game/:gameId/rematch': 'game/rematch-gamestate',
  'POST /api/game/:gameId/spectate': 'game/spectate/join',

  // TODO #965: remove these
  'POST /api/game/spectate': 'game/spectate', // TODO #965: remove
  '/api/game/draw': 'game/draw',
  '/api/game/pass': 'game/pass',
  '/api/game/points': 'game/points',
  '/api/game/faceCard': 'game/face-card',
  '/api/game/scuttle': 'game/scuttle',
  '/api/game/jack': 'game/jack',
  '/api/game/untargetedOneOff': 'game/untargeted-one-off',
  '/api/game/targetedOneOff': 'game/targeted-one-off',
  '/api/game/counter': 'game/counter',
  '/api/game/resolve': 'game/resolve',
  '/api/game/resolveFour': 'game/resolve-four',
  '/api/game/resolveThree': 'game/resolve-three',
  '/api/game/resolveFive': 'game/resolve-five',
  '/api/game/seven/points': 'game/seven/points',
  '/api/game/seven/faceCard': 'game/seven/face-card',
  '/api/game/seven/scuttle': 'game/seven/scuttle',
  '/api/game/seven/jack': 'game/seven/jack',
  '/api/game/seven/untargetedOneOff': 'game/seven/untargeted-one-off',
  '/api/game/seven/targetedOneOff': 'game/seven/targeted-one-off',
  '/api/game/over': 'game/game-over',
  '/api/game/concede': 'game/concede',
  '/api/game/stalemate': 'game/stalemate',
  '/api/game/stalemate-accept': 'game/stalemate',
  '/api/game/stalemate-reject': 'game/stalemate-reject',
  '/api/game/rematch': 'game/rematch',
  '/api/game/join-rematch': 'game/join-rematch',
  '/api/game/loadFixture': 'game/load-fixture',
  // TODO #965: End of routes to remove in #965
  
  // Testing helpers - DEVELOPMENT ONLY
  'POST /api/game/:gameId/game-state': 'game/load-fixture-gamestate',
  'DELETE /api/test/wipe-database': 'TestController.wipeDatabase',
  'PUT /api/test/bad-session': 'TestController.setBadSession',
  'POST /api/test/seasons': 'TestController.loadSeasonFixture',
  'POST /api/test/matches': 'TestController.loadMatchFixtures',
  'POST /api/test/games': 'TestController.loadFinishedGameFixtures',
  '/api/test/game': 'TestController.getGames',
  '/api/test/match': 'TestController.getMatches',
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
