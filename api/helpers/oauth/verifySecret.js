const jwt = require('jsonwebtoken');

module.exports = {
  friendlyName: 'Verify Secret',

  description: 'Verifies a secret for OAuth state',

  inputs: {
    token: {
      type: 'string',
      required: true,
    },
  },

  sync: true,

  fn: ({ token }, exits) => {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      if (payload.purpose !== 'oauth') {
        return exits.success(false);
      }

      return exits.success(payload);
    } catch (err) {
      return exits.success(false);
    }
  },
};
