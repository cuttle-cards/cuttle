/**
 * Staging environment settings
 *
 */

module.exports = {
  datastores: {
    default: {
      adapter: 'sails-postgresql',
      schema: true,
      url: process.env.DATABASE_URL,
      // Use SSL to connect to remote db e.g. heroku
      // ssl: {
      //   sslmode: 'require',
      //   rejectUnauthorized: false,
      // },
    },
  }, // end datastores

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  models: {
    migrate: 'alter',
  },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  port: process.env.PORT || 1337,

  sockets: {
    onlyAllowOrigins: [
      'https://cuttle-v3.herokuapp.com',
      'https://www.cuttle.cards',
      'http://localhost',
      'http://localhost:8080',
      'http://localhost:1337',
    ],
  },
};
