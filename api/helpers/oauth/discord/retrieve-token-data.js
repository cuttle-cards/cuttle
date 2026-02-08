module.exports = {
  friendlyName: 'Create and verify Discord callback Params ',

  description: 'Generates and verifies callback params for Discord OAuth',

  inputs:{
    code: {
      type: 'string',
      description: 'param code for discord oauth',
      required: true
    },
  },
  fn: async  function ({ code }, exits) {
    try {
      const params = {
        client_id: String(process.env.VITE_DISCORD_CLIENT_ID),
        client_secret: String(process.env.VITE_DISCORD_CLIENT_SECRET),
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.VITE_API_URL}/api/user/discord/callback`,
      };

      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params),
      });

      const tokenData = await tokenRes.json();

      if (!tokenData) {
        throw new Error('Discord OAuth token exchange returned empty response');
      }

      exits.success(tokenData);
    } catch (e) {
      exits.error(e);
    }
  }
};
