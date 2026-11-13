const crypto = require('crypto');

module.exports = {
  friendlyName: 'Hash Verification Code',

  description: 'Hashes an email verification code so it is never stored in plain text',

  inputs: {
    code: {
      type: 'string',
      required: true,
    },
  },

  sync: true,

  fn: ({ code }, exits) => {
    return exits.success(crypto.createHash('sha256').update(code)
      .digest('hex'));
  },
};
