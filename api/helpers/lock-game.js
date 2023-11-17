const { randomUUID } = require('crypto'); // Added in: node v14.17.0
const dayjs = require('dayjs');

async function sleep(durationInMillis) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationInMillis);
  });
}

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
    const LOCK_RETRY_TIME_MS = 200;
    const LOCK_MAX_WAIT_TIME_MS = 2000;
    const MAX_ATTEMPTS = 50;
    const uuId = randomUUID();
    const startTime = dayjs();
    const timeToGiveUp = startTime.add(LOCK_MAX_WAIT_TIME_MS, 'millisecond').valueOf();
    let now = startTime.valueOf();
    let lockIsStaleTimeout = startTime.subtract(30, 'second').valueOf();
    let numAttempts = 0;
    while (numAttempts < MAX_ATTEMPTS && now < timeToGiveUp) {
      try {
        numAttempts++;
        now = dayjs().valueOf();
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
        await sleep(LOCK_RETRY_TIME_MS);
      } catch (err) {
        return exits.error(err);
      }
    }
    return exits.error(`Timed out aquiring lock for game ${gameId}`);
  },
};
