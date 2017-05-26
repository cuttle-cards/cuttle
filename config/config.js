
// console.log("\ncurrent env: " + process.env.NODE_ENV+"\n");
if (process.env.DATABASE_URL) {
	var url = require('url').parse(process.env.DATABASE_URL);
} else {
	var url = {
		host: '',
		path: '',
		auth: ''
	}
}
module.exports = {
	connections: {
		sqlHeroku: {
		    adapter: 'sails-postgresql',
		    ssl: true,
		    schema: true,
		    host: url.host.split(':')[0],
		    database: url.path.substring(1),
		    user: url.auth.split(':')[0],
		    password: url.auth.split(':')[1],
		    port: url.port,			
		}
	}, //End connections

	models: {
	    // connection: 'localDiskDb',
	    connection: 'sqlHeroku',
	    migrate: 'drop'
   },

   orm: {
   		_hookTimeout: 50000
   },

   pubsub: {
   		_hookTimeout: 50000
   },

   keepResponseErrors: true,

}; //End exports