module.exports = {
  friendlyName: 'Fetch Discord Identity',

  description: 'Fetches the discord identity from the access token',

  inputs:{
    token: {
      type: 'ref',
      description: 'Discord Access Token',
      required: true
    },
  },

  fn: async function ({ token  }, exits) {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
      },
    });

    if (!response.ok) {
      // throw generic error
      return exits.error(
        new Error('Could not authenticate with discord')
      );
    }

    const data = await response.json();

    const providerName = 'discord';
    const { id, username } = data;

    return exits.success({ id, providerName, username });
  }
};
