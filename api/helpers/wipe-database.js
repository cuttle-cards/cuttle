module.exports = {
  friendlyName: 'Wipe all records in the database',

  description: 'Deletes all records. Throws error if not in development or staging mode',

  fn: async (_, exits) => {
    try {
      if (![ 'development', 'staging' ].includes(sails.config.environment)) {
        return exits.error({ message: 'Error: This action is only permitted in development or staging' });
      }

      await Promise.all([
        Game.destroy({}),
        User.destroy({}),
        Card.destroy({}),
        Season.destroy({}),
        Match.destroy({}),
        UserSpectatingGame.destroy({}),
        GameStateRow.destroy({}),
        Identity.destroy({}),
      ]);

    } catch (err) {
      // Surface the failure. Reporting success here left callers running against a database
      // that was only partially wiped, with no signal that anything had gone wrong.
      return exits.error(err);
    }

    return exits.success(true);
  },
};
