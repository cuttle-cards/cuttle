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
    },
    suppliedUsername: {
      type: 'string',
      description: 'Username supplied by user'
    }
  },

  fn: async function ({ token, user, suppliedUsername }, exits) {
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
          throw new Error('login.snackbar.discord.alreadyLinked');
        }

        await Identity.updateOne({ id: prevIdentity.id }, { username: discordUsername });
        return exits.success(prevIdentity.user);
      }

      const foundUsername = await User.findOne({ username: suppliedUsername });
      if(suppliedUsername && foundUsername){
        throw new Error('login.snackbar.discord.usernameTaken');
      }

      const updatedUser = user ? await User.findOne({ id: user }) : await User.create({ username: suppliedUsername }).fetch();

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
