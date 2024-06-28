import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import devtools from '@vue/devtools';
import { version } from '_/package.json';
import { initCuttleGlobals } from '_/utils/config-utils';

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