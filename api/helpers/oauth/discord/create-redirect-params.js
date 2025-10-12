module.exports = {
  friendlyName: 'Create Discord Redirect Params ',

  description: 'Generates Redirect params for Discord OAuth',
  sync: true,

  fn: function (_, exits) {
    const url = new URL('https://discord.com/api/oauth2/authorize');
    const { generateSecret } = sails.helpers.oauth;
    const state = generateSecret();

    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', process.env.VITE_DISCORD_CLIENT_ID);
    url.searchParams.set('scope', 'identify email guilds.members.read');
    url.searchParams.set('redirect_uri', `${process.env.VITE_API_URL}/api/user/discord/callback`);
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('state', state);

    return exits.success(url);
  }
};
