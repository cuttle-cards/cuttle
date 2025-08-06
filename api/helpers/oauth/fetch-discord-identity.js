module.exports = {
  friendlyName: 'Generate Secret',

  description: 'Generates a secret for OAuth state',

  inputs:{
    token: {
      type: 'ref',
      description: 'Discord Access Token',
      required: true
    },
    user: {
      type: 'ref',
      description: 'Exisiting User'
    }
  },

  fn: async function ({ token, user }, exits) {
    try {
      const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      const providerId = data.id;
      const provider = 'discord';
      const { username: discordUsername } = data;

      const prevIdentity = await Identity.findOne({ providerId }).populate('user');

      if (prevIdentity && prevIdentity.user) {
        if( user && prevIdentity.user.id !== user ){
          return exits.error('login.snackbar.discord.alreadyLinked');
        }

        await Identity.updateOne({ id: prevIdentity.id }, { username: discordUsername });
        return exits.success(prevIdentity.user);
      }
      const existingUserName = await User.findOne({ username: discordUsername });
      const username = existingUserName ? `${discordUsername}${Math.floor(Math.random() * 1000)}` : discordUsername;

      const updatedUser = user ? await User.findOne({ id: user }) : await User.create({ username }).fetch();

      await Identity.create({
        providerId,
        provider,
        user: updatedUser.id,
        username: discordUsername
      });

      return exits.success(updatedUser);

    } catch (e) {
      return exits.error(e);
    }
  }
};
