describe('isProd', () => {
  // isProd needs to be imported inline AFTER process.env changes are set because it uses a
  // snapshot of the values when the file is required

  // Save the initial values from process.env
  const { env } = process;

  // before each test reset any modules and reset process.env
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
  });

  // after each test is completed, reset process.env
  afterEach(() => {
    process.env = env;
  });

  describe('isProd=false', () => {
    it('should return false when CUTTLE_ENV and NODE_ENV are not set', () => {
      process.env.CUTTLE_ENV = undefined;
      process.env.NODE_ENV = undefined;
      const { isProd } = require('../../../utils/config-utils');
      expect(isProd).toBe(false);
    });

    it('should return false when CUTTLE_ENV is not set and NODE_ENV=dev', () => {
      process.env.CUTTLE_ENV = undefined;
      process.env.NODE_ENV = 'dev';
      const { isProd } = require('../../../utils/config-utils');
      expect(isProd).toBe(false);
    });

    it('should return false when CUTTLE_ENV=dev', () => {
      process.env.CUTTLE_ENV = 'production';
      process.env.NODE_ENV = 'dev';
      const { isProd } = require('../../../utils/config-utils');
      expect(isProd).toBe(true);
    });
  });

  describe('isProd=true', () => {
    it('should return true when CUTTLE_ENV is not set and NODE_ENV=production', () => {
      process.env.CUTTLE_ENV = undefined;
      process.env.NODE_ENV = 'production';
      const { isProd } = require('../../../utils/config-utils');
      expect(isProd).toBe(true);
    });

    it('should return true when CUTTLE_ENV=production', () => {
      process.env.CUTTLE_ENV = 'production';
      process.env.NODE_ENV = 'dev';
      const { isProd } = require('../../../utils/config-utils');
      expect(isProd).toBe(true);
    });
  });
});
