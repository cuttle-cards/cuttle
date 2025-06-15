const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

module.exports = {
  friendlyName: 'Generate Secret',

  description: 'Generates a secret for Oauth State',
  sync: true,

  fn:(_, exits) => {
    const randomString = crypto.randomBytes(length).toString('base64url');
    return exits.success(jwt.sign({ randomString, purpose:'Oauth' }, process.env.JWT_SECRET, {
      expiresIn: '5m',
    }));
  },

};
