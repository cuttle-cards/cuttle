
var Sails = require('sails'),
  sails,
  should = require('chai').should();

before(function(done) {
  this.timeout(50000);
  Sails.lift({
  }, function(err, server) {
      sails = server;
      global.foo = "bar";
      global.bun = "mediocre";
      global.Promise = require('bluebird');
      // var Passwords = require("machinepack-passwords");
      var socketIOClient = require('socket.io-client');
      var sailsIOClient = require('sails.io.js');
      global.io = sailsIOClient(socketIOClient);
      io.sails.url = 'http://localhost:1337';
      global.socket1 = io.sails.connect('http://localhost:1337');
      global.socket2 = io.sails.connect('http://localhost:1337');
      global.socket3 = io.sails.connect('http://localhost:1337');

      // Socket Request making helper
      global.request = function (socket, url, data) {
        return new Promise(function (resolve, reject) {
          socket.put(url, data, function (res, jwres) {
            if (jwres.statusCode === 200) {
              return resolve(jwres);
            } else {
              console.log(jwres);
              return reject(new Error(jwres));
            }
          })
        });
      };
      //Socket request making helper (expects bad request)   
      global.badRequest = function (socket, url, data) {
        return new Promise(function (resolve, reject) {
          socket.put(url, data, function (res, jwres) {
            if (jwres.statusCode != 200) {
              return resolve(jwres);
            } else {
              return reject(new Error(jwres));
            }            
          });
        });
      }

     if (err) return done(err);
     done(); 
  });
});


after(function(done) {
  // io.socket.disconnect();
  sails.lower(done);
});