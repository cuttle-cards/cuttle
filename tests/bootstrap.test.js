
var Sails = require('sails'),
  sails,
  should = require('chai').should();

before(function(done) {
  this.timeout(50000);
  Sails.lift({
  }, function(err, server) {
    console.log("lifted");
      sails = server;
      global.foo = "bar";
      global.bun = "mediocre";
      // var Passwords = require("machinepack-passwords");
      var socketIOClient = require('socket.io-client');
      var sailsIOClient = require('sails.io.js');
      global.io = sailsIOClient(socketIOClient);
      io.sails.url = 'http://localhost:1337';



     if (err) return done(err);
     done(); 
  });
});


after(function(done) {
  // io.socket.disconnect();
  sails.lower(done);
});