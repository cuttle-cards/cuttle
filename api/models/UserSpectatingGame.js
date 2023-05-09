/**
 * UserSpectatingGame.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
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
