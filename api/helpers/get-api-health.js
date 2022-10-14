module.exports = {
  friendlyName: 'Get API health',

  description: 'Get the health of the API service. This includes database status and service version.',

  fn: async (_, exits) => {
      try {
        const games = await Game.count()
        if (games > 0){
          return exits.success(true);
        }
      } catch (err) {
        // ignored
      }
      return exits.success(false);
    }
  }