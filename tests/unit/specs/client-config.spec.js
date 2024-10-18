import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import { version } from '_/package.json';
import { initCuttleGlobals } from '_/utils/config-utils';

const mockDocument = {
  createElement: vi.fn(),
  head: {
    appendChild: vi.fn(),
  },
  addEventListener: vi.fn(),
};
const mockWindow = {};
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

    // Mock fetch to simulate devtools health check failure
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network Error'))));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should add version to window.cuttle', async () => {
    await initCuttleGlobals();
    expect(window.cuttle.version).toEqual(version);
  });

  it('should add app to window.cuttle when testing is enabled', async () => {
    // Cypress needs to exist in the window to enable testing
    window.Cypress = {};
    const mockApp = { app: true };
    await initCuttleGlobals(mockApp);
    expect(window.cuttle.app).toEqual(mockApp);
    expect(window.cuttle.test).toBe(true);
  });

  it('should not add app to window.cuttle when testing is not enabled', async () => {
    delete window.Cypress;
    const mockApp = { app: true };
    await initCuttleGlobals(mockApp);
    expect(window.cuttle.app).toEqual(null);
    expect(window.cuttle.test).toBe(false);
  });
});
