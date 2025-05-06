/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {
  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
   * etc. depending on your default view engine) your home page.              *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  // '/': {
  //   view: 'homepage'
  // },

  /***************************************************************************
   *                                                                          *
   * Custom routes here...                                                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the custom routes above, it   *
   * is matched against Sails route blueprints. See `config/blueprints.js`    *
   * for configuration options and examples.                                  *
   *                                                                          *
   ***************************************************************************/

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
  'GET /api/game/list': 'game/get-list',
  'POST /api/game/:gameId/subscribe': 'game/subscribe',
  'POST /api/game/spectate': 'game/spectate', // TODO #965: remove
  'DELETE /api/game/:gameId/spectate/leave': 'game/spectate/leave',
  'POST /api/game/:gameId/ready': 'game/ready',
  'PATCH /api/game/:gameId/is-ranked': 'game/set-is-ranked',
  '/api/game/leaveLobby': 'game/leave-lobby',
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

  // Resolving Sevens
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
  '/api/game/gameData': 'game/game-data',

  // GameStateAPI
  'POST /api/game/:gameId/move': 'game/move',
  'POST /api/game/:gameId/rematch': 'game/rematch-gamestate',
  'POST /api/game/:gameId/spectate': 'game/spectate/join',

  
  // Testing helpers - DEVELOPMENT ONLY
  'POST /api/game/:gameId/loadFixtureGameState': 'game/load-fixture-gamestate',
  '/api/game/loadFixture': 'game/load-fixture',
  '/api/test/wipeDatabase': 'TestController.wipeDatabase',
  '/api/test/badSession': 'TestController.setBadSession',
  '/api/test/loadSeasonFixture': 'TestController.loadSeasonFixture',
  '/api/test/loadMatchFixtures': 'TestController.loadMatchFixtures',
  '/api/test/loadFinishedGameFixtures': 'TestController.loadFinishedGameFixtures',
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
