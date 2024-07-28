import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import { version } from '_/package.json';
import { initCuttleGlobals } from '_/utils/config-utils';

const mockWindow = {};
const mockDocument = {};
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

describe('initCuttleGlobals', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ENV', 'production');
    vi.stubGlobal('document', mockDocument);
    vi.stubGlobal('window', mockWindow);
    vi.stubGlobal('console', mockConsole);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should execute sails helpers', async () => {
    const serverIsUp = await sails.helpers.getApiHealth();
    expect(serverIsUp).toBe(true);
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
});
