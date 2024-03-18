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

  // '/'                             :   'userController.homepage',
  '/user/signup': 'userController.signup',
  '/user/login': 'userController.login',
  '/user/reLogin': 'userController.reLogin',
  '/user/logout': 'userController.logout',
  '/user/status': 'userController.status',

  'GET /health': 'HealthController.getHealth',

  '/stats/seasons/current': 'StatsController.getCurrentStats',
  '/stats/seasons/:seasonId': 'StatsController.getSeasonStats',

  '/game/create': 'game/create',
  '/game/getList': 'game/get-list',
  '/game/subscribe': 'game/subscribe',
  '/game/spectate': 'game/spectate',
  '/game/spectateLeave': 'game/spectate-leave',
  '/game/reconnect': 'game/reconnect',
  '/game/ready': 'game/ready',
  '/game/setIsRanked': 'game/set-is-ranked',
  '/game/leaveLobby': 'game/leave-lobby',
  '/game/draw': 'game/draw',
  '/game/pass': 'game/pass',
  '/game/points': 'game/points',
  '/game/faceCard': 'game/face-card',
  '/game/scuttle': 'game/scuttle',
  '/game/jack': 'game/jack',
  '/game/untargetedOneOff': 'game/untargeted-one-off',
  '/game/targetedOneOff': 'game/targeted-one-off',
  '/game/counter': 'game/counter',
  '/game/resolve': 'game/resolve',
  '/game/resolveFour': 'game/resolve-four',
  '/game/resolveThree': 'game/resolve-three',
  // Resolving Sevens
  '/game/seven/points': 'game/seven/points',
  '/game/seven/faceCard': 'game/seven/face-card',
  '/game/seven/scuttle': 'game/seven/scuttle',
  '/game/seven/jack': 'game/seven/jack',
  '/game/seven/untargetedOneOff': 'game/seven/untargeted-one-off',
  '/game/seven/targetedOneOff': 'game/seven/targeted-one-off',
  '/game/over': 'game/game-over',
  '/game/concede': 'game/concede',
  '/game/stalemate': 'game/stalemate',
  '/game/reject-stalemate': 'game/stalemate-reject',
  '/game/rematch': 'game/rematch',
  '/game/join-rematch': 'game/join-rematch',
  '/game/chat': 'game/chat',
  '/game/gameData': 'game/game-data',
  // DEVELOPMENT ONLY
  '/game/stackDeck': 'game/stack-deck',
  '/game/loadFixture': 'game/load-fixture',
  '/game/clear': 'game/clear-game',

  // Testing helpers
  '/test/wipeDatabase': 'TestController.wipeDatabase',
  '/test/badSession': 'TestController.setBadSession',
  '/test/loadSeasonFixture': 'TestController.loadSeasonFixture',
  '/test/loadMatchFixtures': 'TestController.loadMatchFixtures',
  '/test/loadFinishedGameFixtures': 'TestController.loadFinishedGameFixtures',
  '/test/match': 'TestController.getMatches',

  // Catch all for Vue paths only require get for http request so we don't interfer
  // with any blueprints routes
  '/*': { controller: 'ViewController', action: 'serveIndex', skipAssets: true },
};
