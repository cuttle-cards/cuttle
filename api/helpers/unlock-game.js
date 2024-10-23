module.exports = {
  friendlyName: 'Unlock a game',

  description:
    'Unlock a game using the previously required lock UUID. Will unset lock and lockedAt columns for the game matching the current lock. Returns successfully even if the write operation to unlock no-ops i.e. the lock in question has timed out.',

  inputs: {
    lock: {
      type: 'string',
      descritiption: 'The lock UUID to unset/release ',
      example: '921a780a-514e-4086-8c9c-fccc2a8d26d8',
      required: true,
    },
  },

  fn: async ({ lock }, exits) => {
    await Game.updateOne({ lock }).set({ lock: null, lockedAt: null });
    return exits.success();
  },
};
