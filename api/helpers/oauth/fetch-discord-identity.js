module.exports = {
  friendlyName: 'Generate Secret',

  description: 'Generates a secret for OAuth state',

  inputs:{
    token: {
      type: 'ref',
      description: 'Discord Access Token',
      required: true
    }
  },

  fn: async function ({ token }, exits) {
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
        return exits.success(prevIdentity.user);
      }
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        // Append random number to avoid username collision
        username = `${username}${Math.floor(Math.random() * 1000)}`;
      }
      const newUser = await User.create({ username }).fetch();

      await Identity.create({
        providerId,
        provider,
        email,
        user: newUser.id,
      });

      return exits.success(newUser);

    } catch (e) {
      console.error('Error fetching identity from Discord:', e);
      return exits.error(e);
    }
  }
};
