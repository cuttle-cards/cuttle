import Sails from 'sails';
import { beforeAll, afterAll } from 'vitest';

let sailsApp;

beforeAll(() => {
  return new Promise((resolve, reject) => {

    Sails.lift({
      environment: 'development',
      port: 1337,
      log: {
        level: 'error'
      },
      hooks: {
        grunt: false
      },
    }, (err, server) => {

      if (err) {
        console.log('\n\n', err, '\n\n');
        return reject(err);
      }

      sailsApp = server;
      return resolve();
    });
  });
});

afterAll(() => {
  if (sailsApp) {
    return new Promise((resolve, reject) => {
    try {
        return Sails.lower(() => {
          console.log('\n\nSuccessfully lowered sails\n\n');
          return resolve();
        });
      } catch (err) {
        console.log('\n\n', err, '\n\n');
        return reject(err);
      }
    });
  }
});
