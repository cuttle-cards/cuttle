/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

// Capture session url so it can be parsed (rediss protocol unsupported by connect-redis)
//  let sessionUrl = new URL(process.env.REDIS_TLS_URL);
module.exports = {
  datastores: {
    default: {
      adapter: 'sails-postgresql',
      ssl: {
        sslmode: 'require',
        rejectUnauthorized: false,
      },
      schema: true,
      url: process.env.DATABASE_URL,
    },
  }, // end datastores

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  models: {
    migrate: 'safe',
  },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  port: process.env.PORT || 80,

  session: {
    adapter: 'connect-redis',
    url: process.env.REDIS_URL,
    // host: sessionUrl.hostname,
    // port: sessionUrl.port,
    // pass: sessionUrl.password,
    // Required by heroku to use tls
    tls: {
      rejectUnauthorized: false,
    },
  },

  sockets: {
    onlyAllowOrigins: [
      'https://cuttle-v3.herokuapp.com',
      'https://cuttle-beta.herokuapp.com',
      'https://www.cuttle.cards',
      'https://beta.cuttle.cards',
    ],
  },

  blueprints: {
    rest: false,
    shortcuts: false,
  },
  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  // log: {
  //   level: "silent"
  // }

  // keepResponseErrors: true,
};
