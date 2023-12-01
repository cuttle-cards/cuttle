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
      type: 'ref',
      columnType: 'timestamptz',
      required: true,
    },
    endTime: {
      type: 'ref',
      columnType: 'timestamptz',
      required: false,
    },
    games: {
      collection: 'Game',
      via: 'match',
    },
  }, // end attributes
}; // end exports
