module.exports = {
  friendlyName: 'Fetch Google Identity',

  description: 'Fetches the Google identity from the access token',

  inputs:{
    token: {
      type: 'ref',
      description: 'Google Access Token',
      required: true
    },
  },

  fn: async function ({ token  }, exits) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    if (!response.ok) {
      // throw generic error
      return exits.error(
        new Error('Could not authenticate with discord')
      );
    }

    const data = await response.json();

    const providerName = 'google';
    const { id, email } = data;

    return exits.success({ id, providerName, username: email });
  }
};
