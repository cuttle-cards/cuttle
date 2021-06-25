
let dbUrl;
let sessionUrl;
if (process.env.DATABASE_URL) {
	dbUrl = require('url').parse(process.env.DATABASE_URL);
} else {
	dbUrl = {
		host: '',
		path: '',
		auth: ''
	}
}

if (process.env.REDIS_TLS_URL) {
	sessionUrl = require('url').parse(process.env.REDIS_TLS_URL);
} else {
	sessionUrl = {
		host: '',
		path: '',
		auth: ''
	}
}
// Use postgress connection in production and in-memory localDb otherwise
// const dbConnection = process.env.NODE_ENV === 'production' ? 'sqlHeroku' : 'localDiskDb';
// const sessionConnection = process.env.NODE_ENV === 'production' ? 'redisHeroku' : undefined;
const dbConnection = 'sqlHeroku';
const sessionConnection = 'redisHeroku';
const migratePolicy = 'safe';
// const migratePolicy = process.env.NODE_ENV === 'production' ? 'safe' : 'drop';

// console.log('session', sessionUrl)
// console.log('db', dbUrl)
// console.log('port', process.env.PORT)

module.exports = {
	port: process.env.PORT || 1337,
	connections: {
		// redisHeroku: {
		//     adapter: 'connect-redis',
		//     ssl: false,
		//     schema: true,
		//     host: sessionUrl.host.split(':')[0],
		//     // database: sessionUrl.path.substring(1),
		//     user: sessionUrl.auth.split(':')[0],
		//     password: sessionUrl.auth.split(':')[1],
		//     port: sessionUrl.port,
		// }
	}, //End connections

	models: {
		connection: dbConnection,
		migrate: migratePolicy,
		// session: sessionConnection,
   },

   pubsub: {
   		_hookTimeout: 60000
   },

   keepResponseErrors: true,

}; //End exports
