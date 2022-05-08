/**
 * Match.js
 *
 * @description :: Defines a ranked match between two players,
 * for a particular week defined by its startTime
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    playerOne: {
      model: 'user',
      required: true,
    },
    playerTwo: {
      model: 'user',
      required: true,
    },
    winner: {
      model: 'user',
    },
    loser: {
      model: 'user',
    },
    startTime: {
      type: 'number',
      required: true,
    },
    endTime: {
      type: 'number',
      required: true,
    },
    firstPlace: {
      model: 'user',
    },
    secondPlace: {
      model: 'user',
    },
    thirdPlace: {
      model: 'user',
    },
  }, // end attributes
}; // end exports
