const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

module.exports = {
  friendlyName: 'Generate Secret',

  description: 'Generates a secret for OAuth state',
  sync: true,

  fn: function (_, exits) {
    try {
      const randomString = crypto.randomBytes(32).toString('base64url');
      const secretKey =  process.env.VITE_JWT_SECRET;
      const secret = jwt.sign(
        { randomString, purpose: 'Oauth' },
        secretKey,
        { expiresIn: '5m' }
      );

      return exits.success(secret);
    } catch (e) {
      console.error('Error generating secret:', e);
      return exits.error(e);
    }
  }
};
