const { randomUUID } = require('crypto');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

async function sleep(durationInMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationInMs);
  });
}

module.exports = {
  friendlyName: 'Lock a game',

  description:
    'Lock a game to reserve it for updates until the game is unlocked or the lock times out. Will error if we cannot obtain a lock before hitting the max wait time or the max number of attempts. Returns the game record that has been locked.',

  inputs: {
    gameId: {
      type: 'number',
      descritiption: 'The database id of game to lock',
      example: 44,
      required: true,
    },
  },

  fn: async ({ gameId }, exits) => {
    const RETRY_TIME = 250;
    const MAX_ATTEMPTS = 20;
    const uuId = randomUUID();

    for (let numAttempts = 0; numAttempts < MAX_ATTEMPTS; numAttempts++) {
      try {
        const now = dayjs.utc().toDate();
        const lockIsStaleTimeout = dayjs.utc().subtract(30, 'second')
          .toDate();

        // Lock game if unlocked or lock is expired
        await Game.updateOne({
          id: gameId,
          or: [ { lock: null }, { lockedAt: { '<=': lockIsStaleTimeout } } ],
        }).set({ lock: uuId, lockedAt: now });

        // Re-fetch game and populate players and gamestates
        const updatedGame = await Game.findOne({ id: gameId })
          .populate('p0')
          .populate('p1')
          .populate('gameStates', { sort: 'createdAt ASC' });

        // If we successfully wrote our uuid, resolve
        const newLock = updatedGame?.lock;
        if (newLock === uuId) {
          return exits.success(updatedGame);
        }

        // Otherwise wait and try agin
        await sleep(RETRY_TIME);
      } catch (err) {
        // Unexpected error e.g. database connection
        return exits.error(err);
      }
    }
    return exits.error(`Timed out aquiring lock for game ${gameId}`);
  },
};
