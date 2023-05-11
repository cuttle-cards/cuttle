/**
 * UserSpectatingGame.js
 *
 * @description :: Represents a user's relationship to a game they are spectating.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    activelySpectating: {
      type: 'boolean',
      defaultsTo: true,
    },
    gameSpectated: {
      model: 'game',
    },
    spectator: {
      model: 'user',
    },
  },
};
