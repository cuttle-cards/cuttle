/**
 * gameStateAPIEnabled
 * 
 * @module      :: Policy
 * @description :: Disables GamesState API endpoints if VITE_USE_GAMESTATE_API env variable is not enabled
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
module.exports = function (req, res, next) {
  if (process.env.VITE_USE_GAMESTATE_API === 'true') {
    return next();
  }

  // GameState API is not enabled
  return res.forbidden({ message: 'GameState API is not enabled' });
};
