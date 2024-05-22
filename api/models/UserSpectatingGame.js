const dayjs = require('dayjs');
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
  beforeCreate(record, proceed) {
    record.createdAt = dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss.SSS Z');
    return proceed();
  },
  beforeUpdate(record, proceed) {
    record.updatedAt = dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss.SSS Z');
    return proceed();
  },
};
