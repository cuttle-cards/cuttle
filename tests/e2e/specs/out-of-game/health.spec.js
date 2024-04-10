const { version: pkgVersion } = require('../../../../package.json');

describe('Health Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('is available if db responds', () => {
    cy.request('/api/health').then((res) => {
      expect(res).property('status').to.equal(200);
      expect(res.body).property('alive').to.eq(true);
    });
  });

  it('returns the current package version', () => {
    cy.request('/api/health').then((res) => {
      expect(res).property('status').to.equal(200);
      expect(res.body).property('version').to.eq(pkgVersion);
    });
  });
});
