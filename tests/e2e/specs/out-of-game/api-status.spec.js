const packageVersion = require("../../../../package.json").version;

import {
  setupGameAsP0
} from '../../support/helpers';

describe.only('API Status Page', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/');
  });

  it('is available if game exists', () => {
    setupGameAsP0();
    cy.request('/api/status')
      .then((res) => {
        expect(res).property('status').to.equal(200)
        expect(res.body).property('available').to.eq(true)
    })
  });

  it('is not available if no game exists', () => {
    cy.request('/api/status')
      .then((res) => {
        expect(res).property('status').to.equal(200)
        expect(res.body).property('available').to.eq(false)
    })
  });

  it('returns the current package version', () => {
    cy.request('/api/status')
      .then((res) => {
        expect(res).property('status').to.equal(200)
        expect(res.body).property('version').to.eq(packageVersion)
    })
  });
});
