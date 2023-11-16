const { randomUUID } = require('crypto'); // Added in: node v14.17.0
const dayjs = require('dayjs');

module.exports = {
  friendlyName: 'Lock a game',

  description:
    'Lock a game to reserve it for updates until the game is unlocked or the lock times out',

  inputs: {
    gameId: {
      type: 'number',
      descritiption: 'The database id of game to lock',
      example: 44,
      required: true,
    },
  },

  fn: async ({ gameId }, exits) => {
    const LOCK_WAIT_TIME_MS = 200;
    const uuId = randomUUID();
    const now = dayjs();
    const lockIsStaleTimeout = now.subtract(30, 'second');
    const maxAttempts = 50;
    // const waitBetweenTries = 
    try {
      const updatedGame = Game.updateOne({
        id: gameId,
        or: [
          {lock: null},
          {lockedAt: {'<=': lockIsStaleTimeout}}
        ],
      }).set({lock: uuId, lockedAt: now});
      const newLock = updatedGame?.lock;
      if (newLock === uuId) {
        return exits.success(uuId);
      }

    } catch (err) {
      return exits.error(err);
    }
  },
};
