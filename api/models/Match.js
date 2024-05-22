const dayjs = require('dayjs');
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
  beforeCreate(record, proceed) {
    record.createdAt = dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss.SSS Z');
    return proceed();
  },
  beforeUpdate(record, proceed) {
    record.updatedAt = dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss.SSS Z');
    return proceed();
  },
}; // end exports
