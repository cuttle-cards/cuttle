import { beforeAll, afterAll, describe, it, expect } from 'vitest';
// import Sails from 'sails';
var Sails  = require('sails').constructor;

describe('Second file', () => {

  let sailsApp;

  beforeAll(() => {
    return new Promise((resolve, reject) => {
      sailsApp = new Sails();
      try {
        sailsApp.lift({
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
            console.log('Sails error on bootwith error');
            console.log('\n\n', err, '\n\n');
            return reject(err);
          }
          
          console.log('\n\nBooted sails\n\n');
          sailsApp = server;
          return resolve();
        });
      } catch (err) {
        console.log('Error booting sails; could not enter callback');
        return reject(err);
      }
      // console.log('Somehow skipped sails lift callback without error');
      // return resolve();
    });
  });
  
  afterAll(() => {
    return new Promise((resolve, reject) => {
      if (!sailsApp){
        return resolve();
      }
      try {
          sailsApp.lower(() => {
            console.log('\n\nSuccessfully lowered sails\n\n');
            return resolve();
          });
        } catch (err) {
          console.log('\nFailed to lower sails\n');
          console.log(err, '\n\n');
          return reject(err);
        }
    });
  });

  it('Should pass', async () => {
    expect(true).toBe(true);
    const serverIsUp = await sails.helpers.getApiHealth();
    expect(serverIsUp).toBe(true);
  });
});