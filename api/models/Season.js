/**
 * Season.js
 *
 * @description :: Defines a season of competitive cuttle,
 * its start and end time, and the tournament champions
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    startTime: {
      type: 'ref',
      columnType: 'timestamptz',
      required: true,
    },
    endTime: {
      type: 'ref',
      columnType: 'timestamptz',
      required: true,
    },
    bracketLink: {
      type: 'string',
      required: false,
      allowNull: true,
    },
    footageLink: {
      type: 'string',
      required: false,
      allowNull: true,
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
