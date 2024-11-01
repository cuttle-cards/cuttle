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
      ]);

    } catch (err) {
      return exits.success(false);
    }

    return exits.success(true);
  },
};
