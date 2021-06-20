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
let sessionUrl;
if (process.env.REDIS_URL) {
	sessionUrl = require('url').parse(process.env.REDIS_URL);
} else {
	sessionUrl = {
		host: '',
		path: '',
		auth: ''
	}
}

module.exports = {

  datastores: {
    default: {
        adapter: 'sails-postgresql',
        ssl: true,
        schema: true,
        url: process.env.DATABASE_URL,
    },
    redisHeroku: {
        adapter: 'connect-redis',
        ssl: true,
        schema: true,
        url: process.env.REDIS_TLS_URL
    },
  }, // end datastores

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  models: {
    connection: 'sqlHeroku',
    migrate: 'safe',
  },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  port: process.env.PORT || 80,

  session: {
			adapter: 'connect-redis',
        ttl: 3600 * 24,
		    host: sessionUrl.host.split(':')[0],
		    pass: sessionUrl.auth.split(':')[1],
		    port: sessionUrl.port,
  }
  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  // log: {
  //   level: "silent"
  // }

  // keepResponseErrors: true,

};
