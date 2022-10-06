module.exports = {
  friendlyName: 'Logout',

  description: 'Logout user and destroy session',

  inputs: {
    req: {
      type: 'ref',
      description: 'Express request',
      required: true,
    },
  },

  fn: async ({ req }, exits) => {
    // If the user isn't logged in, just get them out of here
    if (!req.session.loggedIn) {
      return exits.success(true);
    }
    // https://github.com/expressjs/session#sessiondestroycallback
    req.session.destroy(function afterDestroy() {
      // TODO move this to a constant to be shared in `session.js` also
      return exits.success(true);
    });
  },
};
