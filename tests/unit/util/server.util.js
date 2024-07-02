const Sails = require('sails').constructor;

export function bootServer() {
  return new Promise((resolve, reject) => {

    const sailsApp = new Sails();
    sailsApp.lift(
      {
        environment: 'development',
        port: 1337,
        log: {
          level: 'error',
        },
        hooks: {
          grunt: false,
        },
      },
      (err, server) => {
        if (err) {
          console.log('Sails error on bootwith error');
          console.log('\n\n', err, '\n\n');
          return reject(err);
        }

        return resolve(server);
      },
    );
  });
}

export function shutDownServer(server) {
  return new Promise((resolve, reject) => {

    if (!server) {
      return resolve();
    }

    server.lower((err) => {
      if (err) {
        console.log('\nFailed to lower sails\n');
        console.log(err, '\n\n');
        return reject(err);
      }

      return resolve();
    });
  });
}
