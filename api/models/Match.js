/**
 * Match.js
 *
 * @description :: Defines a ranked match between two players,
 * for a particular week defined by its startTime
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    player1: {
      model: 'user',
      required: true,
    },
    player2: {
      model: 'user',
      required: true,
    },
    winner: {
      model: 'user',
    },
    startTime: {
      type: 'number',
      required: true,
    },
    endTime: {
      type: 'number',
      required: false,
      allowNull: true,
    },
    games: {
      collection: 'Game',
      via: 'match',
    },
  }, // end attributes
}; // end exports
