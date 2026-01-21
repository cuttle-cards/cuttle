module.exports = {
  friendlyName: 'Find or create bot user',

  description:
    'Finds the special "Bot User" used as opponent in vs AI games',

  fn: async (_inputs, exits) => {
    const botUserData = { username: 'CuttleBot', isBot: true };

    let botUser = await User.find(botUserData);

    if (!botUser) {
      botUser = await User.create(botUserData).fetch();
    }

    return exits.success(botUser);
  },
};
