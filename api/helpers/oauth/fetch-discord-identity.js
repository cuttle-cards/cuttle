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
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const data = await response.json();

      const providerId = data.id;
      const provider = 'discord';
      const { email } = data;
      let { username } = data;

      const prevIdentity = await Identity.findOne({ providerId }).populate('user');

      if (prevIdentity && prevIdentity.user) {
        if(user && prevIdentity.user.id !== user){
          return exits.error('Account already linked to another profile');
        }
        return exits.success(prevIdentity.user);
      }
      const existingUserName = await User.findOne({ username });

      if (existingUserName) {
        username = `${username}${Math.floor(Math.random() * 1000)}`;
      }
      const updatedUser = user ? await User.findOne({ id: user }) : await User.create({ username }).fetch();

      await Identity.create({
        providerId,
        provider,
        email,
        user: updatedUser.id,
      });

      return exits.success(updatedUser);

    } catch (e) {
      console.error('Error fetching identity from Discord:', e);
      return exits.error(e);
    }
  }
};
