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

  session: {
			adapter: 'connect-redis',
      url: process.env.REDIS_URL,
  },

  sockets: {
    onlyAllowOrigins: ["https://cuttle-v3.herokuapp.com", "https://www.cuttle.cards", "http://localhost", "http://localhost:8080"],
  },


};
