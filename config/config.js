// Default settings (overriden in config/production.js)
module.exports = {
	port: process.env.PORT || 1337,

   pubsub: {
   		_hookTimeout: 60000
   },

   keepResponseErrors: true,

}; //End exports
