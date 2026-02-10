module.exports = {
  friendlyName: 'Create Google Redirect Params ',

  description: 'Generates Redirect params for Google OAuth',
  sync: true,

  fn: function (_, exits) {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    const { generateSecret } = sails.helpers.oauth;
    const state = generateSecret();

    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', process.env.VITE_GOOGLE_CLIENT_ID);
    url.searchParams.set('scope', 'email');
    url.searchParams.set('redirect_uri', `${process.env.VITE_API_URL}/api/user/google/callback`);
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('state', state);

    return exits.success(url);
  }
};
