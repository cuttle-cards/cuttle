// Run via a command like the f./support/helpers
// VUE_APP_API_URL=http://localhost:1337 ./node_modules/.bin/cypress run --spec tests/e2e/specs/playground.js

import { setupGameAsP0 } from '../../support/helpers';

const attempts = 400;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  describe(`Untargeted One-Offs (${attempt}/${attempts})`, () => {
    beforeEach(() => {
      setupGameAsP0();
    });

    it.only('playground noop', () => {
      cy.get('[data-playground]').should('have.length', 0);
    });
  });
}
