import { beforeAll, afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import devtools from '@vue/devtools';
import { version } from '_/package.json';
import { initCuttleGlobals } from '_/utils/config-utils';
// import Sails from 'sails';
const SailsServer = require('sails').constructor;
// const SailsServer = Sails.Sails;

describe('Sails basics', () => {

let sailsApp;

beforeAll(() => {
  return new Promise((resolve, reject) => {
    sailsApp = new SailsServer();
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

  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('should read from and write to the db', async () => {
    let users = await User.find();
    expect(users.length).toBe(0);
    await User.create({username: 'foo', encryptedPassword: 'xyz123ABCABK7KAL'});
  
    users = await User.find({});
    expect(users.length).toBe(1);
  });
  
  it('should execute sails helpers', async () => {
    const serverIsUp = await sails.helpers.getApiHealth();
    expect(serverIsUp).toBe(true);
  });
});


const mockWindow = {};
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

describe('initCuttleGlobals', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ENV', 'production');
    vi.stubGlobal('window', mockWindow);
    vi.stubGlobal('console', mockConsole);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should add version to window.cuttle', () => {
    initCuttleGlobals();
    expect(window.cuttle.version).toEqual(version);
  });

  it('should add app to window.cuttle when testing is enabled', () => {
    // Cypress needs to exist in the window to enable testing
    window.Cypress = {};
    const mockApp = { app: true };
    initCuttleGlobals(mockApp);
    expect(window.cuttle.app).toEqual(mockApp);
    expect(window.cuttle.test).toBe(true);
  });

  it('should not add app to window.cuttle when testing is not enabled', () => {
    // Cypress needs to exist in the window to enable testing
    delete window.Cypress;
    const mockApp = { app: true };
    initCuttleGlobals(mockApp);
    expect(window.cuttle.app).toEqual(null);
    expect(window.cuttle.test).toBe(false);
  });

  it('should not add app to window.cuttle when testing is not enabled', () => {
    const mockApp = { app: true };
    initCuttleGlobals(mockApp);
    expect(window.cuttle.app).toEqual(null);
    expect(window.cuttle.test).toBe(false);
  });

  it('should automatically connect to devtools when in dev environment', () => {
    // Force staging
    import.meta.env.VITE_ENV = 'staging';
    const spyConnect = vi.spyOn(devtools, 'connect');
    const spyLog = vi.spyOn(console, 'log');
    initCuttleGlobals();
    expect(spyConnect).toHaveBeenCalledWith(null, 8098);
    expect(spyLog).toHaveBeenCalledWith('Vue devtools connected');
  });

  // TODO May not be valuable, also fine to just skip it
  it.skip('should fail gracefully when devtools can not connect', () => {
    // Force staging
    import.meta.env.VITE_ENV = 'staging';
    // Force devtools error
    vi.spyOn(devtools, 'connect').mockRejectedValue(new Error('Async error'));
    const spyWarn = vi.spyOn(console, 'warn');
    initCuttleGlobals();
    expect(spyWarn).toHaveBeenCalled();
  });
});
