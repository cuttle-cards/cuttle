const net = require('net');
const Sails = require('sails').constructor;
const { loadLocalEnv } = require('../../../utils/dev-ports');

loadLocalEnv();

const CONFIGURED_TEST_PORT = Number.parseInt(process.env.CUTTLE_TEST_SERVER_PORT, 10) || null;

/**
 * Ask the OS for a free port. The specs reach sails through the lifted server object rather than
 * through a url, so the port only has to be free -- this keeps `npm run test:unit` working while
 * any number of dev stacks are running. Pin it with `CUTTLE_TEST_SERVER_PORT` if you need to.
 */
function findFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.on('error', reject);
    probe.listen(0, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

export async function bootServer() {
  const port = CONFIGURED_TEST_PORT ?? (await findFreePort());

  return new Promise((resolve, reject) => {

    const sailsApp = new Sails();
    sailsApp.lift(
      {
        environment: 'development',
        port,
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
