import { setupGameAsP0 } from '../../support/helpers';
const { version: pkgVersion } = require('../../../../package.json');

describe('API Health Page', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
  });

  it('is available if game exists', () => {
    setupGameAsP0();
    cy.request('/health').then((res) => {
      expect(res).property('status').to.equal(200);
      expect(res.body).property('alive').to.eq(true);
    });
  });

  it('is not available if no game exists', () => {
    cy.request('/health').then((res) => {
      expect(res).property('status').to.equal(200);
      expect(res.body).property('alive').to.eq(false);
    });
  });

  it('returns the current package version', () => {
    cy.request('/health').then((res) => {
      expect(res).property('status').to.equal(200);
      expect(res.body).property('version').to.eq(pkgVersion);
    });
  });
});
