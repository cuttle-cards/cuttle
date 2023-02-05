module.exports = {
  friendlyName: 'Get API health',

  description: 'Get the health of the API service. This includes database status and service version.',

  fn: async (_, exits) => {
    try {
      await Game.count();
    } catch (err) {
      return exits.success(false);
    }
    return exits.success(true);
  },
};
